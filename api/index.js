const express = require("express");
const cors = require("cors");
const { default: mongoose } = require("mongoose");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const fs = require("fs");

const app = express();
const uploadMiddleware = multer({ dest: "uploads/" });

const salt = bcrypt.genSaltSync(10);
const secret = "alskjdiwaojdoaismxlsckvnlsejrfmoawi";

const User = require("./models/User");
const Post = require("./models/Post");

app.use(cookieParser());
app.use(cors({ credentials: true, origin: "http://localhost:5173" }));
app.use(express.json());
app.use("/uploads", express.static(__dirname + "/uploads"));

// mongoose.connect(
//   "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.7.1"
// );
mongoose.connect("mongodb://127.0.0.1:27017/test")

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (user) {
    const passOk = bcrypt.compareSync(password, user.password);
    if (passOk) {
      jwt.sign({ username, id: user._id }, secret, {}, (err, token) => {
        if (err) throw err;
        res.cookie("token", token).json({ id: user._id, username });
      });
    } else {
      res.status(400).json("wrong password");
    }
  } else {
    res.status(400).json("Invalid username or password");
  }
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.create({
      username,
      password: bcrypt.hashSync(password, salt),
    });
    res.json(user);
  } catch (error) {
    res.status(400).json(error);
  }
});

app.get("/profile", (req, res) => {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, secret, {}, (err, info) => {
      if (err) throw err;
      res.json(info);
    });
  } else {
    res.status(400).json({
      status: "fail",
      message: "No JWT found!",
    });
  }
});

app.post("/logout", (req, res) => {
  res.cookie("token", "").json("ok");
});

app.post("/post", uploadMiddleware.single("file"), async (req, res) => {
  const { originalname, path } = req.file;
  const parts = originalname.split(".");
  const ext = parts[parts.length - 1];
  const newPath = path + "." + ext;
  fs.renameSync(path, newPath);

  const { token } = req.cookies;
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) throw err;
    const { title, summary, content } = req.body;
    const post = await Post.create({
      title,
      summary,
      content,
      cover: newPath,
      author: info.id,
    });
    res.json(post);
  });
});

app.put("/post", uploadMiddleware.single("file"), async (req, res) => {
  let newPath = null;
  if (req.file) {
    const { originalname, path } = req.file;
    const parts = originalname.split(".");
    const ext = parts[parts.length - 1];
    newPath = path + "." + ext;
    fs.renameSync(path, newPath);
  }

  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, secret, {}, async (err, info) => {
      if (err) throw err;
      const { id, title, summary, content } = req.body;
      const post = await Post.findById(id);
      const isAuthor = JSON.stringify(post.author) === JSON.stringify(info.id);
      if (!isAuthor) {
        return res.status(400).json("You are not the author");
      }
      await post.update({
        title,
        summary,
        content,
        cover: newPath ? newPath : post.cover,
      });
      res.json(post);
    });
  } else {
    res.status(400).json({
      status: "fail",
      message: "No JWT found!",
    });
  }
});

app.get("/post", async (req, res) => {
  const posts = await Post.find()
    .populate("author", ["username"])
    .sort({ createdAt: -1 })
    .limit(20);
  res.json(posts);
});

app.get("/post/:id", async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id).populate("author", ["username"]);
  res.json(post);
});

app.listen(4000);
