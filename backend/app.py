from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2

app = Flask(__name__)
CORS(app)

# Database Connection
def get_connection():

    return psycopg2.connect(
        host="dpg-d8ttkvkm0tmc73fg46hg-a.oregon-postgres.render.com",
        database="splitup",
        user="splitup_user",
        password="D1AjW0BdeZNtstgX0fNGo6mL18vgpNeD",
        port="5432"
    )

@app.route("/")
def home():
    return "SplitUp Backend Connected!"

@app.route("/test-db")
def test_db():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT current_database(),
           current_user,
           inet_server_addr();
    """)

    data = cursor.fetchone()

    cursor.close()
    conn.close()

    return jsonify(data)

@app.route("/all-columns")
def all_columns():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema='public'
    ORDER BY table_name, column_name;
    """)

    data = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(data)

@app.route("/add-user", methods=["POST"])
def add_user():

    data = request.get_json()

    name = data["name"]
    email = data["email"]
    password = data["password"]

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            INSERT INTO users
            (name, email, password)
            VALUES (%s, %s, %s)
            """,
            (name, email, password)
        )
        conn.commit()

        return "User Added Successfully!"

    except Exception as e:
        conn.rollback()
        return str(e)

    finally:
        cursor.close()
        conn.close()




@app.route("/users")
def get_users():

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute(
        "SELECT user_id, name, email FROM users"
    )

    rows = cursor.fetchall()

    users = []

    for row in rows:
        users.append({
            "user_id": row[0],
            "name": row[1],
            "email": row[2]
        })

    cursor.close()
    conn.close()

    return jsonify(users)

@app.route("/create-group", methods=["POST"])
def create_group():

    data = request.get_json()

    group_name = data["group_name"]

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "INSERT INTO groups_table (group_name) VALUES (%s)",
            (group_name,)
        )

        conn.commit()

        return "Group Created Successfully!"

    except Exception as e:
        conn.rollback()
        return str(e)

    finally:
        cursor.close()
        conn.close()


@app.route("/groups")
def get_groups():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT group_id, group_name FROM groups_table"
    )

    rows = cursor.fetchall()

    groups = []

    for row in rows:
        groups.append({
            "group_id": row[0],
            "group_name": row[1]
        })

    cursor.close()
    conn.close()

    return jsonify(groups)


@app.route("/add-expense", methods=["POST"])
def add_expense():

    data = request.get_json()

    description = data["description"]
    amount = data["amount"]
    group_id = data["group_id"]
    paid_by = data["paid_by"]

    cursor = conn.cursor()

    try:

        cursor.execute(
            """
            INSERT INTO expenses
            (group_id, paid_by, amount, description)
            VALUES (%s, %s, %s, %s)
            RETURNING expense_id
            """,
            (group_id, paid_by, amount, description)
        )

        expense_id = cursor.fetchone()[0]

        cursor.execute(
            """
            SELECT COUNT(*)
            FROM group_members
            WHERE group_id = %s
            """,
            (group_id,)
        )

        member_count = cursor.fetchone()[0]

        split_amount = float(amount) / member_count

        cursor.execute(
            """
            SELECT user_id
            FROM group_members
            WHERE group_id = %s
            """,
            (group_id,)
        )

        members = cursor.fetchall()

        for member in members:

            cursor.execute(
                """
                INSERT INTO expense_splits
                (expense_id, user_id, amount_owed)
                VALUES (%s, %s, %s)
                """,
               ( 
                   expense_id,
                   member[0],
                   split_amount
               )
       )

        conn.commit()

        return "Expense Added Successfully!"

    except Exception as e:
        conn.rollback()
        return str(e)

    finally:
        cursor.close()

@app.route('/add-member', methods=['POST'])
def add_member():
    data = request.get_json()
    user_id = data['user_id']
    group_id = data['group_id']

    cursor = conn.cursor()

    try:
        cursor.execute(
        """
        INSERT INTO group_members
        (group_id, user_id)
        VALUES (%s, %s)
        """,
        (group_id, user_id)
         )

        conn.commit()

        return "Member Added Successfully"

    except Exception as e:
        conn.rollback()
        return str(e)

    finally:
        cursor.close()


@app.route("/expenses")
def get_expenses():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT
        e.expense_id,
        e.description,
        e.amount,
        g.group_name,
        u.name,
        e.created_at
    FROM expenses e
    JOIN groups_table g
    ON e.group_id = g.group_id
    JOIN users u
    ON e.paid_by = u.user_id
    """)
    rows = cursor.fetchall()

    expenses = []

    for row in rows:
       expenses.append({
           "expense_id": row[0],
           "description": row[1],
           "amount": float(row[2]),
           "group_name": row[3],
           "paid_by_name": row[4],
           "created_at": str(row[5])
    })
    cursor.close()
    conn.close()

    return jsonify(expenses)


@app.route("/split-expense")
def split_expense():

    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO expense_splits
        (expense_id, user_id, amount_owed)
        VALUES (%s, %s, %s)
        """,
        (1, 1, 1250)
    )

    conn.commit()

    cursor.close()

    return "Expense Split Added Successfully!"

@app.route("/balance")
def get_balance():
    
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT
            u.name,
            COALESCE(SUM(es.amount_owed),0)
        FROM users u
        LEFT JOIN expense_splits es
        ON es.user_id = u.user_id
        GROUP BY u.name;
        """
  )

    rows = cursor.fetchall()

    result = []

    for row in rows:
        result.append({
            "user_name": row[0],
            "total_owed": float(row[1])
        })

    cursor.close()
    conn.close()

    return jsonify(result)


@app.route("/delete-expense/<int:expense_id>", methods=["DELETE"])
def delete_expense(expense_id):

    cursor = conn.cursor()

    try:
        cursor.execute(
            "DELETE FROM expenses WHERE expense_id = %s",
            (expense_id,)
        )

        conn.commit()

        return "Expense Deleted Successfully!"

    except Exception as e:
        conn.rollback()
        return str(e)

    finally:
        cursor.close()

@app.route("/delete-user/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):

    cursor = conn.cursor()

    try:
        cursor.execute(
            "DELETE FROM users WHERE user_id = %s",
            (user_id,)
        )

        conn.commit()

        return "User Deleted Successfully!"

    except Exception as e:
        conn.rollback()
        return str(e)

    finally:
        cursor.close()

@app.route("/delete-group/<int:group_id>", methods=["DELETE"])
def delete_group(group_id):

    cursor = conn.cursor()

    try:
        cursor.execute(
            "DELETE FROM groups_table WHERE group_id = %s",
            (group_id,)
        )

        conn.commit()

        return "Group Deleted Successfully!"

    except Exception as e:
        conn.rollback()
        return str(e)

    finally:
        cursor.close()

@app.route("/update-user/<int:user_id>", methods=["PUT"])
def update_user(user_id):

    data = request.get_json()

    name = data["name"]
    email = data["email"]

    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            UPDATE users
            SET name = %s, email = %s
            WHERE user_id = %s
            """,
            (name, email, user_id)
        )

        conn.commit()

        return "User Updated Successfully!"

    except Exception as e:
        conn.rollback()
        return str(e)

    finally:
        cursor.close()

@app.route("/update-group/<int:group_id>", methods=["PUT"])
def update_group(group_id):

    data = request.get_json()

    group_name = data["group_name"]

    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            UPDATE groups_table
            SET group_name = %s
            WHERE group_id = %s
            """,
            (group_name, group_id)
        )

        conn.commit()

        return "Group Updated Successfully!"

    except Exception as e:
        conn.rollback()
        return str(e)

    finally:
        cursor.close()

@app.route("/update-expense/<int:expense_id>", methods=["PUT"])
def update_expense(expense_id):

    data = request.get_json()

    description = data["description"]
    amount = data["amount"]

    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            UPDATE expenses
            SET description = %s,
                amount = %s
            WHERE expense_id = %s
            """,
            (description, amount, expense_id)
        )

        conn.commit()

        return "Expense Updated Successfully!"

    except Exception as e:
        conn.rollback()
        return str(e)

    finally:
        cursor.close()


@app.route("/members")
def get_members():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            gm.member_id,
            g.group_name,
            u.name
        FROM group_members gm
        JOIN groups_table g
        ON gm.group_id = g.group_id
        JOIN users u
        ON gm.user_id = u.user_id
    """)

    rows = cursor.fetchall()

    result = []

    for row in rows:
        result.append({
            "member_id": row[0],
            "group_name": row[1],
            "user_name": row[2]
            
        })

    cursor.close()
    conn.close()
    
    return jsonify(result)

@app.route("/settlements")
def get_settlements():

    settlements = [
        {
            "from_user": "Pawan2",
            "to_user": "Pawan",
            "amount": 2125
        },
        {
            "from_user": "Pawan Kumar",
            "to_user": "Pawan",
            "amount": 2125
        },
        {
            "from_user": "aaru",
            "to_user": "Pawan",
            "amount": 425
        }
    ]

    return jsonify(settlements)

@app.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    email = data["email"]
    password = data["password"]

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT user_id, name
        FROM users
        WHERE email=%s
        AND password=%s
    """, (email, password))

    user = cursor.fetchone()

    cursor.close()
    conn.close()

    if user:
        return jsonify({
            "success": True,
            "user_id": user[0],
            "name": user[1]
        })

    return jsonify({
        "success": False,
        "message": "Invalid credentials"
    }), 401

@app.route("/user-by-email/<email>")
def get_user_by_email(email):

    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT name
        FROM users
        WHERE email = %s
        """,
        (email,)
    )

    user = cursor.fetchone()

    cursor.close()

    if user:
        return jsonify({
            "name": user[0]
        })

    return jsonify({
        "name": "User"
    })

@app.route("/debug-users")
def debug_users():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name='users'
    """)

    cols = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(cols)

@app.route("/test-login")
def test_login():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT user_id,name,email,password
        FROM users
        WHERE email='pawan@gmail.com'
    """)

    row = cursor.fetchone()

    cursor.close()
    conn.close()

    return str(row)


if __name__ == "__main__":
        app.run(debug=True)