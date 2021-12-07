const { ObjectId } = require("mongodb");
const express = require("express");
const router = express.Router();
const users = require("../data/users");
const upload = require("../data/upload");

router.get("/profile", async (req, res) => {
  res.render("pages/userProfile");
});

router.post("/profile/upload", upload.single("file"), async (req, res) => {
  // check file existence
  if (req.file === undefined) {
    return res.render("pages/userProfile", { error: "you must select a file" });
  }
  // check file type
  if (req.file.mimetype !== "application/pdf") {
    return res.render("pages/userProfile", { error: "file type error" });
  }

  // console.log(res.req.file);
  res.redirect("/users/profile");
});

router.post("/login", async (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  if (typeof username !== "string" || typeof password !== "string") {
    res.status(400).render("pages/loginform", {
      message: "username and passwork must be string",
      error: true,
    });
    return;
  }
  username = username.trim().toLowerCase();
  password = password.trim();
  if (username.length === 0 || password.length === 0) {
    res.status(400).render("pages/loginform", {
      message:
        "username and passwork must be non empty string and can't just be space",
      error: true,
    });
    return;
  }
  let matchStr = /^[a-z0-9]{4,}$/i;
  if (!matchStr.test(username)) {
    res.status(400).render("pages/loginform", {
      message:
        "username can only be alphanumeric characters and should be at least 4 characters long.",
      error: true,
    });
    return;
  }
  if (password.length < 6) {
    res.status(400).render("pages/loginform", {
      message: "password must be longer than 6",
      error: true,
    });
    return;
  }
  if (password.indexOf(" ") >= 0) {
    res.status(400).render("pages/loginform", {
      message: "password can't contain space",
      error: true,
    });
    return;
  }
  let tmp;
  try {
    tmp = await users.checkUser(username, password);
  } catch (e) {
    res.status(400).render("pages/loginform", { message: e, error: true });
    return;
  }
  if (tmp.authenticated === true) {
    req.session.user = username; //user name or id?
    res.redirect("/"); //goto main page if user has logined in
  } else {
    res
      .status(400)
      .render("pages/loginform", { message: "please try again", error: true });
    return;
  }
});

// if ...  should have else throw otherwise it would have no respondes
router.get("/favor", async (req, res) => {
  //get all favor
  let userId = req.body.userId;
  try {
    if (ObjectId.isValid(userId)) {
      let output = await users.getFavourites(userId);
      return res.json(output);
    }
  } catch (e) {
    return res.status(e.status).render("pages/error", {
      title: "Favor",
      message: e.message,
      error: true,
    });
  }
});

router.post("/favor", async (req, res) => {
  let jobId = req.body.jobId;
  let userId = req.body.userId;
  try {
    if (ObjectId.isValid(jobId) && ObjectId.isValid(userId)) {
      let output = await users.Favorites(jobId, userId);
      return res.json(output);
    }
  } catch (e) {
    return res
      .status(e.status)
      .render("pages/error", { title: "Apply", message: e.message, err: true });
  }
});

router.delete("/favor", async (req, res) => {
  let jobId = req.body.jobId;
  let userId = req.body.userId;
  try {
    if (ObjectId.isValid(jobId) && ObjectId.isValid(userId)) {
      let output = await users.delFavourites(jobId, userId);
      return res.json(output);
    }
  } catch (e) {
    return res
      .status(e.status)
      .render("pages/error", { title: "Favor", message: e.message, err: true });
  }
});

router.post("/apply", async (req, res) => {
  let jobId = req.body.jobId;
  let userId = req.body.userId;
  try {
    if (ObjectId.isValid(jobId) && ObjectId.isValid(userId)) {
      let output = await users.apply(jobId, userId);
      return res.json(output);
    }
  } catch (e) {
    return res
      .status(e.status)
      .render("pages/error", { title: "Apply", message: e.message, err: true });
  }
});

router.delete("/apply", async (req, res) => {
  let jobId = req.body.jobId;
  let userId = req.body.userId;
  try {
    if (ObjectId.isValid(jobId) && ObjectId.isValid(userId)) {
      let output = await users.cancel(jobId, userId);
      return res.json(output);
    }
  } catch (e) {
    return res
      .status(e.status)
      .render("pages/error", { title: "Favor", message: e.message, err: true });
  }
});

router.get("/apply/:id", async (req, res) => {
  //get all favor
  let userId = req.body.userId;
  let jobId = req.params.jobId;
  try {
    if (ObjectId.isValid(userId) && ObjectId.isValid(jobId)) {
      let output = await users.track(jobId, userId);
      return res.json(output);
    }
  } catch (e) {
    return res.status(e.status).render("pages/error", {
      title: "Favor",
      message: e.message,
      error: true,
    });
  }
});

router.get("/apply", async (req, res) => {
  //get all favor
  let userId = req.body.userId;
  try {
    if (ObjectId.isValid(userId)) {
      let output = await users.trackAll(userId);
      return res.json(output);
    }
  } catch (e) {
    return res.status(e.status).render("pages/error", {
      title: "Favor",
      message: e.message,
      error: true,
    });
  }
});

module.exports = router;
