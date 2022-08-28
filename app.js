const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

require("dotenv").config();
function handleError(err) {
  console.log(err);
}
mongoose.connect(process.env.MONGO_URL);
var conn = mongoose.connection;
conn.on("connected", function () {
  console.log("database is connected successfully");
});
conn.on("disconnected", function () {
  console.log("database is disconnected successfully");
});
conn.on("error", console.error.bind(console, "connection error:"));

var plantSchema = new mongoose.Schema({
  id: String,
  name: String,
  image: String,
  description: String,
  price: Number,
  inCart: Boolean,
  qty: Number,
});

const Plants = conn.model("plants", plantSchema);

var adminSchema = new mongoose.Schema({
  id: String,
  email: String,
  password: String,
});

var Admins = conn.model("Admins", adminSchema);

let arr = [];
Plants.find({}).exec((err, data) => {
  if (err) throw err;
  // console.log(data);
  arr = [...data];
  // res.render("index", { plants: arr, cart: cart });
});
// console.log(arr);

let admin = {};

Admins.find({}).exec((err, data) => {
  if (err) throw err;
  // console.log(data);

  admin = data;
  // console.log(admin);
});

let cart = [];
let total = 0;
const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", function (req, res) {
  // var session = req.session;
  // if (session.loginStatus) {
  res.render("index", { plants: arr, cart: cart });
  // } else {
  // res.redirect("/otplogin");
  // }
});

app.get("/admin", function (req, res) {
  // console.log("in admin");
  res.render("sign-in", { boolean: true });
});

app.get("/cart", function (req, res) {
  res.render("cart", { plants: cart, total: total });
});
app.get("/contact", function (req, res) {
  res.render("contact", { cart });
});

app.get("/user-details", function (req, res) {
  res.render("user-details");
});
app.get("/order-placed", function (req, res) {
  res.render("order-placed");
});
app.get("/add-plant", function (req, res) {
  res.render("add-plant");
});

app.get("/viewPlant/:plantName", function (req, res) {
  // console.log(req.params.plantName);
  let index = arr.findIndex((item) => item.name == req.params.plantName);
  const plant = arr[index];
  // console.log(plant);
  res.render("card", { plant });
});

app.post("/", function (req, res) {
  const itemTofind = req.body.item;
  // console.log(itemTofind);
  let element = {};
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].name === itemTofind) {
      //console.log("founded");
      element = arr[i];
      if (req.body.orderedQuantity != 0) {
        arr[i].inCart = true;
      } else {
        arr[i].inCart = false;
      }
      arr[i].qty = req.body.orderedQuantity;
      break;
    }
  }
  // console.log(arr);

  cart = arr.filter((el) => el.inCart);
  total = 0;
  cart.forEach((c) => {
    total += c.qty * c.price;
  });
  res.redirect("/");
});

app.post("/sign-in", function (req, res) {
  // console.log(req.body.password);
  // console.log(admin[0].email);
  // console.log(admin[0].password);
  if (
    admin[0].email === req.body.email &&
    admin[0].password === req.body.password
  ) {
    // console.log("success");
    res.render("admin-home", { plants: arr, cart: cart });
  } else {
    res.render("sign-in", { boolean: false });
  }
});

app.post("/add-plant", function (req, res) {
  // console.log(req.body.plantDescription);
  const plantToAdd = new Plants({
    // id: String,
    name: req.body.plantName,
    image: req.body.plantUrl,
    description: req.body.plantDescription,
    price: req.body.plantPrice,
    inCart: false,
    qty: 0,
  });

  plantToAdd.save(function (err) {
    if (err) console.log(err);
    else {
      Plants.find({}).exec((err, data) => {
        if (err) throw err;
        // console.log(data);
        arr = [...data];
        res.render("admin-home", { plants: arr, cart: cart });
      });
    }
  });
});

app.post("/remove-plant", function (req, res) {
  // console.log(req.body.removePlantId);
  const removePlantId = req.body.removePlantId;
  Plants.findByIdAndDelete(removePlantId, function (err) {
    if (err) console.log(err);
    else {
      Plants.find({}).exec((err, data) => {
        if (err) throw err;
        // console.log(data);
        arr = [...data];
        res.render("admin-home", { plants: arr, cart: cart });
      });
    }
  });
});

app.post("/order-placed", (req, res) => {
  // console.log("welcone");
  cart = [];
  for (let i = 0; i < arr.length; i++) {
    arr[i].inCart = false;
    arr[i].orderedQuantity = 0;
  }

  res.render("order-placed");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
// app.listen(port);

app.listen(port, function () {
  console.log("server is running on port 3000");
});
