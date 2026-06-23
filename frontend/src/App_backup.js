import "./App.css";
import { useState, useEffect } from "react";

function App() {
const [users, setUsers] = useState([]);
const [groups, setGroups] = useState([]);
const [expenses, setExpenses] = useState([]);
const [members, setMembers] = useState([]);

const totalUsers = users.length;

const totalGroups = groups.length;

const totalExpenses = expenses.length;

const totalAmount = expenses.reduce(
  (sum, expense) => sum + Number(expense.amount),
  0
);
const totalMembers = members.length;
const [balance, setBalance] = useState([]);
const [settlements, setSettlements] = useState([]);

const [name, setName] = useState("");
const [email, setEmail] = useState("");

const [groupName, setGroupName] = useState("");

const [description, setDescription] = useState("");
const [amount, setAmount] = useState("");
const [selectedGroup, setSelectedGroup] = useState("");
const [paidBy, setPaidBy] = useState("");

const [memberUserId, setMemberUserId] = useState("");
const [memberGroupId, setMemberGroupId] = useState("");

useEffect(() => {
  loadUsers();
  loadGroups();
  loadExpenses();
  loadMembers();
}, []);

  const loadUsers = async () => {
    const response = await fetch("http://127.0.0.1:5000/users");
    const data = await response.json();
setUsers(data);
  };

const loadMembers = async () => {

  const response = await fetch(
    "http://127.0.0.1:5000/members"
  );

  const data = await response.json();

  setMembers(data);
};


const addUser = async () => { 
if (!name.trim() || !email.trim()) {
  alert("Please enter name and email");
  return;
}

if (!email.includes("@")) {
  alert("Please enter a valid email");
  return;
}


  const response = await fetch("http://127.0.0.1:5000/add-user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: name,
      email: email,
    }),
  });


  const data = await response.text();

  alert(data);

  loadUsers();

  setName("");
  setEmail("");
};


const addGroup = async () => {
if (!groupName.trim()) {
  alert("Please enter group name");
  return;
}
  const response = await fetch("http://127.0.0.1:5000/create-group", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      group_name: groupName,
    }),
  });

  const data = await response.text();

  alert(data);

  loadGroups();

  setGroupName("");
};

const addExpense = async () => {
if (!description.trim() || !amount.trim()) {
  alert("Please enter description and amount");
  return;
}
  const response = await fetch("http://127.0.0.1:5000/add-expense", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
  description: description,
  amount: amount,
  group_id: selectedGroup,
  paid_by: paidBy,
}),
  });

  const data = await response.text();

  alert(data);

  loadExpenses();

  setDescription("");
  setAmount("");
};

const addMember = async () => {

  if (!memberUserId || !memberGroupId) {
    alert("Please enter User ID and Group ID");
    return;
  }

  const response = await fetch(
    "http://127.0.0.1:5000/add-member",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: memberUserId,
        group_id: memberGroupId,
      }),
    }
  );

  const data = await response.text();

  alert(data);

  loadMembers();

  setMemberUserId("");
  setMemberGroupId("");
};

const loadGroups = async () => {
  const response = await fetch("http://127.0.0.1:5000/groups");
  const data = await response.json();
  setGroups(data);
};


const loadExpenses = async () => {
  const response = await fetch("http://127.0.0.1:5000/expenses");
  const data = await response.json();
  setExpenses(data);
};

const loadBalance = async () => {
  const response = await fetch("http://127.0.0.1:5000/balance");
  const data = await response.json();
  setBalance(data);
};

const loadSettlements = async () => {
  const response = await fetch(
    "http://127.0.0.1:5000/settlements"
  );

  const data = await response.json();

  setSettlements(data);
};

const deleteExpense = async (expenseId) => {
  const response = await fetch(
    `http://127.0.0.1:5000/delete-expense/${expenseId}`,
    {
      method: "DELETE",
    }
  );

  const data = await response.text();

  alert(data);

  loadExpenses();
};

const updateExpense = async (expenseId) => {

  const newDescription = prompt("Enter New Description");

  const newAmount = prompt("Enter New Amount");

  if (!newDescription || !newAmount) return;

  const response = await fetch(
    `http://127.0.0.1:5000/update-expense/${expenseId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description: newDescription,
        amount: newAmount,
      }),
    }
  );

  const data = await response.text();

  alert(data);

  loadExpenses();
};


const deleteUser = async (userId) => {
  const response = await fetch(
    `http://127.0.0.1:5000/delete-user/${userId}`,
    {
      method: "DELETE",
    }
  );

  const data = await response.text();

  alert(data);

  loadUsers();
};

const updateUser = async (userId) => {

  const newName = prompt("Enter New Name");

  const newEmail = prompt("Enter New Email");

  if (!newName || !newEmail) return;

  const response = await fetch(
    `http://127.0.0.1:5000/update-user/${userId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: newName,
        email: newEmail,
      }),
    }
  );

  const data = await response.text();

  alert(data);

  loadUsers();
};

const deleteGroup = async (groupId) => {
  const response = await fetch(
    `http://127.0.0.1:5000/delete-group/${groupId}`,
    {
      method: "DELETE",
    }
  );

  const data = await response.text();

  alert(data);

  loadGroups();
};

const updateGroup = async (groupId) => {

  const newGroupName = prompt("Enter New Group Name");

  if (!newGroupName) return;

  const response = await fetch(
    `http://127.0.0.1:5000/update-group/${groupId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        group_name: newGroupName,
      }),
    }
  );

  const data = await response.text();

  alert(data);

  loadGroups();
};

  return (
    <div className="container">
     <h1>SplitUp</h1>

<h2>Expense Sharing App</h2>

<div className="dashboard">

  <div className="stat-card">
    <h3>Total Users</h3>
    <h2>{totalUsers}</h2>
  </div>

  <div className="stat-card">
    <h3>Total Groups</h3>
    <h2>{totalGroups}</h2>
  </div>

  <div className="stat-card">
    <h3>Total Expenses</h3>
    <h2>{totalExpenses}</h2>
  </div>

  <div className="stat-card">
    <h3>Total Amount</h3>
    <h2>₹{totalAmount}</h2>
  </div>

<div className="stat-card">
  <h3>Total Members</h3>
  <h2>{totalMembers}</h2>
</div>

</div>
      <input
  type="text"
  placeholder="Enter Name"
  value={name}
  onChange={(e) => setName(e.target.value)}
/>

<br /><br />

<input
  type="email"
  placeholder="Enter Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

<br /><br />

<input
  type="text"
  placeholder="Enter Group Name"
  value={groupName}
  onChange={(e) => setGroupName(e.target.value)}
/>

<br /><br />

<input
  type="text"
  placeholder="Enter Expense Description"
  value={description}
  onChange={(e) => setDescription(e.target.value)}
/>

<br /><br />

<input
  type="number"
  placeholder="Enter Amount"
  value={amount}
  onChange={(e) => setAmount(e.target.value)}
/>

<select
  value={selectedGroup}
  onChange={(e) => setSelectedGroup(e.target.value)}
>
  <option value="">Select Group</option>

  {groups.map((group) => (
    <option
      key={group.group_id}
      value={group.group_id}
    >
      {group.group_name}
    </option>
  ))}
</select>

<br /><br />

<select
  value={paidBy}
  onChange={(e) => setPaidBy(e.target.value)}
>
  <option value="">Select User</option>

  {users.map((user) => (
    <option
      key={user.user_id}
      value={user.user_id}
    >
      {user.name}
    </option>
  ))}
</select>

<br /><br />

<br /><br />

<input
  type="number"
  placeholder="Enter User ID"
  value={memberUserId}
  onChange={(e) => setMemberUserId(e.target.value)}
/>

<br /><br />

<input
  type="number"
  placeholder="Enter Group ID"
  value={memberGroupId}
  onChange={(e) => setMemberGroupId(e.target.value)}
/>

<br /><br />

<button className="add-btn" onClick={addUser}>
  Add User
</button>

<br /><br />

<button className="add-btn" onClick={addGroup}>
  Add Group
</button>


<br /><br />

<button className="add-btn" onClick={addExpense}>
  Add Expense
</button>
<br /><br />

<button
  className="add-btn"
  onClick={addMember}
>
  Add Member
</button>

<br /><br />


<button onClick={loadBalance}>
  View Balance
</button>

<br /><br />

<button onClick={loadSettlements}>
  View Settlements
</button>

<br /><br />

<div>
  {balance.map((item, index) => (
    <div className="card" key={index}>
      <h3>{item.user_name}</h3>

      <p>
        <strong>Total Owed:</strong> ₹{item.total_owed}
      </p>
    </div>
  ))}
</div>

      <br /><br />

<h2 className="section-title">
  👤 Users
</h2>

<div>
  {users.map((user) => (
    <div className="card" key={user.user_id}>
      <h3>{user.name}</h3>
      <p>{user.email}</p>

      <button
  className="edit-btn"
  onClick={() => updateUser(user.user_id)}
>
  Edit
</button>

     <button
  className="delete-btn"
  onClick={() => {
    if (
      window.confirm(
        "Are you sure you want to delete this user?"
      )
    ) {
      deleteUser(user.user_id);
    }
  }}
>
  Delete
</button>

    </div>
  ))}
</div>


<h2 className="section-title">
  👥 Groups
</h2>

<div>
  {groups.map((group) => (
    <div className="card" key={group.group_id}>
      <h3>{group.group_name}</h3>

      <button
          className="edit-btn"
        onClick={() => updateGroup(group.group_id)}
      >
        Edit
      </button>

      <button
  className="delete-btn"
  onClick={() => {
    if (
      window.confirm(
        "Are you sure you want to delete this group?"
      )
    ) {
      deleteGroup(group.group_id);
    }
  }}
>
  Delete
</button>


    </div>
  ))}
</div>

<h2 className="section-title">
  💰 Expenses
</h2>

<div>
  {expenses.map((expense) => (
    <div className="card" key={expense.expense_id}>
  <h3>{expense.description}</h3>

  <p>₹{expense.amount}</p>

  <p>
    <strong>Group:</strong> {expense.group_name}
  </p>

  <p>
    <strong>Paid By:</strong> {expense.paid_by_name}
  </p>

      <button
           className="edit-btn"
        onClick={() => updateExpense(expense.expense_id)}
      >
        Edit
      </button>

      <button
  className="delete-btn"
  onClick={() => {
    if (
      window.confirm(
        "Are you sure you want to delete this expense?"
      )
    ) {
      deleteExpense(expense.expense_id);
    }
  }}
>
  Delete
</button>

    </div>
  ))}
</div>
<h2 className="section-title">
  🤝 Members
</h2>

<div>

  {members.map((member) => (
    <div className="card" key={member.member_id}>
      <h3>{member.user_name}</h3>

      <p>
        Group: {member.group_name}
      </p>
    </div>
  ))}
</div>

<h2 className="section-title">
  💰 Balances
</h2>

<div>
  {balance.map((item, index) => (
    <div className="card" key={index}>
      <h3>{item.user_name}</h3>

      <p>
        <strong>Total Owed:</strong> ₹{item.total_owed}
      </p>
    </div>
  ))}
</div>

<h2 className="section-title">
  💸 Settlements
</h2>

<div>
  {settlements.map((item, index) => (
    <div className="card" key={index}>
      <h3>
        {item.from_user}
      </h3>

      <p>
        Pays ₹{item.amount}
      </p>

      <p>
        To: {item.to_user}
      </p>
    </div>
  ))}
</div>

    </div>
  );
}

export default App;