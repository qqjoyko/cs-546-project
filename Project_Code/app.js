const express = require("express");
const app = express();
//const session = require('express-session');
const static = express.static(__dirname + "/public");
const configRoutes = require("./routes");
const exphbs = require("express-handlebars");
const session = require("express-session");
const xss = require('xss');

app.use("/public", static);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    name: "AuthCookie",
    secret: "This is a secret.. shhh don't tell anyone",
    saveUninitialized: true,
    resave: false
  })
);

app.use ((req, res, next) => {
  //console.log(req.session.user);
  if (!req.session.user) {
    console.log(new Date().toUTCString(),': ',req.method, ' ',req.path,'  (Non-Authenticated User)');
  } else {
    console.log(new Date().toUTCString(),': ',req.method, ' ',req.path,'  (Authenticated User)');
  }
  next();
});

// app.use('/users', (req, res, next) => {//*****************setting private pages
//   if (!req.session.userId) {
//     res.status(200).render("pages/error", {error: "you are not logged in"});
//     return;
//   } else {
//     req.body.userId = req.session.userId; // give userId to next routes
//     next();
//   }
// });

// middle ware function to check all our post rout body for xss attacks
app.use ((req, res, next) => {
  if(req.body){
    xss(req.body);
  }
  next();
});

app.use(express.json());

app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main",
    helpers: {
      // Function to do basic mathematical operation in handlebar
      math: function (lvalue, operator, rvalue) {
        lvalue = parseFloat(lvalue);
        rvalue = parseFloat(rvalue);
        return {
          "+": lvalue + rvalue,
          "-": lvalue - rvalue,
          "*": lvalue * rvalue,
          "/": lvalue / rvalue,
          "%": lvalue % rvalue,
        }[operator];
      },
    },
  })
);
app.set("view engine", "handlebars");

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log("Your routes will be running on http://localhost:3000");
});
