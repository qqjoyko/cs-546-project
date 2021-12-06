const { ObjectId } = require("mongodb");
const express = require("express");
const router = express.Router();
const users = require("../data/users");
const util = require("util");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const dbConfig = require("../config/mongoConnection").dbConfig;

router.post("/upload", async (req, res) => {
  var storage = new GridFsStorage({
    url: dbConfig.serverUrl + dbConfig.database,
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (req, file) => {
      const match = ["application/pdf"];

      if (match.indexOf(file.mimetype) === -1) {
        const filename = `${Date.now()}-user-${file.originalname}`;
        return filename;
      }

      return {
        bucketName: dbConfig.userBucket,
        filename: `${Date.now()}-user-${file.originalname}`,
      };
    },
  });
  var uploadFiles = multer({ storage: storage }).single("file");
  var upload = util.promisify(uploadFiles);
  try {
    await upload(req, res);
    console.log(req.body);

    if (req.file == undefined) {
      return res.send({
        message: "You must select a file.",
      });
    }

    return res.status(200).send({
      message: "Files have been uploaded.",
    });

    // console.log(req.file);

    // return res.send({
    //   message: "File has been uploaded.",
    // });
  } catch (error) {
    console.log(error);

    return res.status(500).send({
      message: `Error when trying upload many files: ${error}`,
    });

    // return res.send({
    //   message: "Error when trying upload image: ${error}",
    // });
  }
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

router.get("/favor/:id", async (req, res) => {
  //get all favor
  let id = req.params.id;
  try {
    if (ObjectId.isValid(id)) {
      let output = await recruiterDat.getRecruiter(id);
      return res.json(output);
    }
  } catch (e) {
    return res.status(e.status).render("pages/rec", {
      title: "Invalid User",
      message: e.message,
      err: true,
    });
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
