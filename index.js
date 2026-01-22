const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect("mongodb://127.0.0.1:27017/classDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  skinType: String,
  favoriteBrand: String,
  preferredProducts: String
});

const User = mongoose.model("User", UserSchema);


app.post("/register", async (req, res) => {
  const { name, email, password, skinType, favoriteBrand, preferredProducts } = req.body;
  if (!email || !password || !name) return res.status(400).json({ error: "Name, email and password required" });

  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ error: "User already exists" });

  const newUser = new User({ name, email, password, skinType, favoriteBrand, preferredProducts });
  await newUser.save();
  res.json({ message: "Registration successful!" });
});


app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  res.json({ message: "Login successful!" });
});


app.get("/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

async function getUsers() {
  const res = await fetch("/users");
  const users = await res.json();
  const list = document.getElementById("userList");
  list.innerHTML = "";

  users.forEach(user => {
    list.innerHTML += `
      <tr>
        <td><input value="${user.name || ''}" id="name-${user._id}" /></td>
        <td><input value="${user.email || ''}" id="email-${user._id}" /></td>
        <td><input value="${user.skinType || ''}" id="skinType-${user._id}" /></td>
        <td><input value="${user.favoriteBrand || ''}" id="brand-${user._id}" /></td>
        <td><input value="${user.preferredProducts || ''}" id="products-${user._id}" /></td>
        <td><input value="${user.password || ''}" id="password-${user._id}" /></td>
        <td>
          <div class="action-buttons">
            <button onclick="updateUser('${user._id}')" class="btn btn-warning btn-sm">
              <i class="bi bi-pencil-square"></i> Update
            </button>
            <button onclick="deleteUser('${user._id}')" class="btn btn-danger btn-sm">
              <i class="bi bi-trash3"></i> Delete
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  document.getElementById("usersTable").style.display = "table";
}


app.put("/users/:id", async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: "User updated successfully!" });
  } catch {
    res.status(500).json({ error: "Error updating user" });
  }
});


app.delete("/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully!" });
  } catch {
    res.status(500).json({ error: "Error deleting user" });
  }
});


app.use(express.static(path.join(__dirname, "public")));

app.listen(8080, () => console.log("🚀 Server running at http://localhost:8080"));
