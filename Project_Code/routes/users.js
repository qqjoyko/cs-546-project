const { ObjectId } = require("mongodb");
const express = require("express");
const router = express.Router();
const users = require("../data/users");
const upload = require("../data/upload").upload;
const download = require("../data/upload").download;
const recruiters = require("../data/recruiters");

router.get("/resume", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/users/login");
  }

  if (req.session.user) {
    if (req.session.user.type !== "user") {
      return res.redirect("/logout");
    }
  }

  res.render("pages/applicantResume", { id: req.session.user.id });
});

router.post("/resume/upload", upload.single("file"), async (req, res) => {
  // common session code all of your private routes
  if (!req.session.user) {
    return res.redirect("/users/login");
  }

  if (req.session.user) {
    if (req.session.user.type !== "user") {
      return res.redirect("logout");
    }
  }

  // check file existence
  if (req.file === undefined) {
    return res.render("pages/applicantResume", {
      error: "you must select a file",
    });
  }
  // check file type
  if (req.file.mimetype !== "application/pdf") {
    return res.render("pages/applicantResume", { error: "file type error" });
  }
  console.log(res.req.file);
  try {
    const addRes = await users.addResume(req.session.user.id, res.req.file.id);
    console.log(addRes);
  } catch (e) {
    res.render("pages/applicantResume", { error: e.message });
    console.log(e);
  }
  res.redirect("/users");
});

router.get("/resume/:id", async (req, res) => {
  // common session code all of your private routes
  if (!req.session.user) {
    return res.redirect("/users/login");
  }

  if (req.session.user) {
    if (req.session.user.type !== "user") {
      return res.redirect("/logout");
    }
  }

  try {
    const downloadStream = await download(req.params.id);
    downloadStream.on("data", function (data) {
      return res.status(200).write(data);
    });

    downloadStream.on("error", function (err) {
      return res
        .status(404)
        .render("/users", { error: "Cannot download the resume!" });
    });

    downloadStream.on("end", () => {
      return res.end();
    });
  } catch (e) {
    res.render("/users", { error: e });
  }
  // res.redirect("/users/profile");
});

router.delete("/resume/:id", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/users/login");
  }

  if (req.session.user) {
    if (req.session.user.type !== "user") {
      return res.redirect("/logout");
    }
  }
  const fileId = req.params.id;
  const userId = req.session.user.id;

  try {
    await users.removeResume(userId, fileId);
  } catch (e) {
    return res.json({ message: e });
  }
  return res.json({ message: "Delete Successfully" });
});

router.get("/login", async (req, res) => {
  //   if(req.session.user){
  //   if (req.session.user.type == 'recruiter'){
  //     res.redirect("/recruiter/login");
  //   }else if(req.session.user.type == 'user'){
  //     console.log('user : already logged in');
  //     return res.redirect('/');
  //   }
  // }
  if (req.session.user) {
    if (req.session.user.type !== "user") {
      return res.redirect("/logout");
    }
  }
  return res.render("pages/applicantlogin", { title: "Applicant Login" });
});

router.get("/signup", async (req, res) => {
  // if(req.session.user){
  //     if (req.session.user.type == 'user'){
  //         return res.redirect('/');
  //     }

  //     if(req.session.user.type == 'recruiter'){
  //         return res.redirect('/recruiter/signup');
  //     }
  // }
  return res.render("pages/applicantSignup", { title: "Applicant Sign-up" });
});

router.get("/", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/users/login");
  }

  if (req.session.user) {
    if (req.session.user.type !== "user") {
      return res.redirect("/logout");
    }
  }
  let id = req.session.user.id,
    user,
    newUser;
  if (ObjectId.isValid(id)) {
    try {
      user = await users.get(id);
      if (Object.keys(user.profile).length == 0) {
        newUser = true;
      } else {
        newUser = false;
      }
    } catch (e) {
      console.log(e);
    }

    let resumes = undefined;
    let resumeError = undefined;
    try {
      // const resumes = await users.getAllResume(req.body.userId);
      resumes = await users.getAllResume(req.session.user.id);
    } catch (e) {
      resumeError = e.message;
    }

    return res.render("pages/applicantProfile", {
      user: user,
      jobs: user.jobs,
      userId: id,
      newUser: newUser,
      resumes,
      resumeError,
    });
  }
});

router.get("/profile/", async (req, res) => {
  try {
    // common session code all of your private routes
    if (!req.session.user) {
      return res.redirect("/users/login");
    }

    if (req.session.user) {
      if (req.session.user.type !== "user") {
        return res.redirect("/logout");
      }
    }
    let id = req.session.user.id;
    if (ObjectId.isValid(id)) {
      let user = await users.get(id);
      console.log(user);
      return res.render("pages/applicanteditprofile", {
        title: "Update",
        method: "POST",
        recid: id,
      });
    }
  } catch (e) {
    return res
      .status(e.status)
      .render("pages/applicanteditprofile", { message: e.message, err: true });
  }
});

router.post("/login", async (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  //let status = req.body.status; //**************use status to store a form data that shows the user is applicant or recruiter */
  if (typeof email !== "string") {
    res.status(400).render("pages/applicantlogin", {
      message: "email must be string",
      emailerr: true,
    });
    return;
  }
  if (typeof password !== "string") {
    res.status(400).render("pages/applicantlogin", {
      message: "password must be string",
      pwderr: true,
    });
    return;
  }
  email = email.trim().toLowerCase();
  password = password.trim();
  if (email.length === 0 || password.length === 0) {
    res.status(400).render("pages/applicantlogin", {
      message: "Not a valid email format",
      emailerr: true,
    });
    return;
  }
  const emailCheck = /[A-Z0-9._-]+@[A-Z0-9.-]+\.[A-Z]{2,}/im;
  if (!emailCheck.test(email)) {
    res.status(400).render("pages/applicantlogin", {
      message:
        "email can only be alphanumeric characters and should be at least 4 characters long.",
      emailerr: true,
    });
    return;
  }
  if (password.length < 6) {
    res.status(400).render("pages/applicantlogin", {
      message: "password must be longer than 6",
      pwderr: true,
    });
    return;
  }
  if (password.indexOf(" ") >= 0) {
    res.status(400).render("pages/applicantlogin", {
      message: "password can't contain space",
      pwderr: true,
    });
    return;
  }
  let tmp;
  try {
    tmp = await users.checkUser(email, password);
  } catch (e) {
    res
      .status(400)
      .render("pages/applicantlogin", { message: e.message, mainerr: true });
    return;
  }
  if (tmp.authenticated === true) {
    req.session.user = { email: email, type: "user", id: tmp.id };
    res.redirect(`/users/`); //goto main page after user has logined in
  } else {
    res.status(400).render("pages/applicantlogin", {
      message: "please try again",
      mainerr: true,
    });
    return;
  }
});

router.post("/signup", async (req, res) => {
  let { email, password, firstName, lastName, phone } = req.body;
  let re = /[A-Z0-9._-]+@[A-Z0-9.-]+\.[A-Z]{2,}/im;
  if (email == "" || email == undefined)
    return res.status(400).render("pages/applicantSignup", {
      title: "Sign Up/Register",
      message: "Please enter your email.",
      emailerr: true,
    });
  if (email.length < 6)
    return res.status(400).render("pages/applicantSignup", {
      title: "Sign Up/Register",
      message: "The email is too short.",
      emailerr: true,
    });
  if (!re.test(email))
    return res.status(400).render("pages/applicantSignup", {
      title: "Sign Up/Register",
      message: `${email} is not a valid email.`,
      emailerr: true,
    });
  email = email.toLowerCase();

  //password validation
  let re2 = /\s/i;
  if (!password)
    return res.status(400).render("pages/applicantSignup", {
      title: "Sign Up/Register",
      message: `Please enter your password`,
      pwderr: true,
    });
  if (re2.test(password))
    return res.status(400).render("pages/applicantSignup", {
      title: "Sign Up/Register",
      message: "Spaces are not allowed in passwords.",
      pwderr: true,
    });
  if (password.length < 6)
    return res.status(400).render("pages/applicantSignup", {
      title: "Sign Up/Register",
      message: "Password is too short.",
      pwderr: true,
    });

  //name validation
  let re3 = /[A-Z]/i;
  firstName = firstName.trim();
  lastName = lastName.trim();
  if (firstName == "" || firstName == undefined)
    return res.status(400).render("pages/applicantSignup", {
      title: "Sign Up/Register",
      message: "Please enter your first name.",
      fnerr: true,
    });
  if (!re3.test(firstName))
    return res.status(400).render("pages/applicantSignup", {
      title: "Sign Up/Register",
      message: "Your name should not contain special characters.",
      fnerr: true,
    });
  if (lastName == "" || lastName == undefined)
    return res.status(400).render("pages/applicantSignup", {
      title: "Sign Up/Register",
      message: "Please enter your last name.",
      lnerr: true,
    });
  if (!re3.test(lastName))
    return res.status(400).render("pages/applicantSignup", {
      title: "Sign Up/Register",
      message: "Your name should not contain special characters.",
      lnerr: true,
    });

  //phone validation
  let re4 = /[0-9]{10}/;
  phone = phone.trim();
  if (phone == "" || phone == undefined)
    return res.status(400).render("pages/applicantSignup", {
      title: "Sign Up/Register",
      message: "Please enter your phone number.",
      pherr: true,
    });
  if (phone.length != 10)
    return res.status(400).render("pages/applicantSignup", {
      title: "Sign Up/Register",
      message: "Invalid phone number.",
      pherr: true,
    });
  if (!re4.test(phone))
    return res.status(400).render("pages/applicantSignup", {
      title: "Sign Up/Register",
      message: "Invalid phone number.",
      pherr: true,
    });
  try {
    let userId = await users.create(
      email,
      phone,
      firstName,
      lastName,
      password
    );
    req.session.user = { email: email, type: "user", id: userId };
    console.log(req.session.user);
    return res.redirect(`/users/`);
  } catch (e) {
    return res.status(e.status).render("pages/applicantSignup", {
      title: "Sign Up/Register",
      message: e.message,
      mainerr: true,
    });
  }
});
router.get("/favor", async (req, res) => {
  // common session code all of your private routes
  if (!req.session.user) {
    return res.redirect("/users/login");
  }

  if (req.session.user) {
    if (req.session.user.type !== "user") {
      return res.redirect("/logout");
    }
  }

  //get all favor
  let userId = req.session.user.id;
  if (!ObjectId.isValid(userId)) {
    res.status(e.status).render("pages/error", {
      title: "Favor",
      message: "inValid userId",
      error: true,
    });
  }
  try {
    let output = await users.getFavourites(userId);
    console.log(output);
    if (output) {
      if (output.length == 0) {
        return res.render("pages/favorJobs", {
          nullJob: true,
          message: "No Jobs Saved yet",
        });
      }
    }
    for (let i = 0; i < output.length; i++) {
      output[i].unique = String(output[i]._id);
    }
    return res.render("pages/favorJobs", { jobFound: true, jobs: output });
  } catch (e) {
    return res.status(e.status).render("pages/error", {
      title: "Favor",
      message: e.message,
      error: true,
    });
  }
});

router.post("/favor/:id", async (req, res) => {
  // common session code all of your private routes
  if (!req.session.user) {
    return res.redirect("/users/login");
  }

  if (req.session.user) {
    if (req.session.user.type !== "user") {
      return res.redirect("/logout");
    }
  }
  let jobId = req.params.id;
  let userId = req.session.user.id;
  if (!ObjectId.isValid(jobId) || !ObjectId.isValid(userId)) {
    return res.status(400).render("pages/error", {
      title: "favor",
      message: "invalid id",
      err: true,
    });
  }
  try {
    let output = await users.Favorites(jobId, userId);
    return res.redirect("/users/favor");
  } catch (e) {
    return res
      .status(e.status)
      .render("pages/error", { title: "favor", message: e.message, err: true });
  }
});

router.post("/favor/delete/:id", async (req, res) => {
  // common session code all of your private routes
  if (!req.session.user) {
    return res.redirect("/users/login");
  }

  if (req.session.user) {
    if (req.session.user.type !== "user") {
      return res.redirect("/logout");
    }
  }

  let jobId = req.params.id;
  let userId = req.session.user.id;
  if (!ObjectId.isValid(jobId) || !ObjectId.isValid(userId)) {
    return res.status(400).render("pages/error", {
      title: "favor",
      message: "invalid id",
      err: true,
    });
  }
  try {
    let output = await users.delFavourites(jobId, userId);
    return res.redirect("/users/favor");
  } catch (e) {
    return res
      .status(e.status)
      .render("pages/error", { title: "Favor", message: e.message, err: true });
  }
});

router.get("/select/:id", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/users/login");
  }

  if (req.session.user) {
    if (req.session.user.type !== "user") {
      return res.redirect("/logout");
    }
  }

  const jobId = req.params.id;
  // console.log(jobId);
  if (!ObjectId.isValid(jobId) || !ObjectId.isValid(req.session.user.id)) {
    return res.status(400).render("pages/error", {
      title: "apply",
      message: "invalid id",
      err: true,
    });
  }

  let resumes = undefined;
  let resumeError = undefined;
  try {
    // const resumes = await users.getAllResume(req.body.userId);
    resumes = await users.getAllResume(req.session.user.id);
  } catch (e) {
    resumeError = e.message;
  }

  res.render("pages/resumeSelection", { jobId, resumes, resumeError });
});

router.post("/apply/:id", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/users/login");
  }

  if (req.session.user) {
    if (req.session.user.type !== "user") {
      return res.redirect("/logout");
    }
  }

  try {
    const applyRes = await users.apply(
      req.params.id,
      req.session.user.id,
      req.body.fileId
    );
  } catch (e) {
    return res.json({ message: e.message });
  }

  // try {
  //   await recruiters.addApplicant(req.body.fileId, req.session.user.id);
  // } catch (e) {
  //   return res.json({ message: e });
  // }

  let message = "You have successfully applied for the job";
  return res.json({ message });

  // console.log(errors);
});

router.post("/cancel/:id", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/users/login");
  }

  if (req.session.user) {
    if (req.session.user.type !== "user") {
      return res.redirect("/logout");
    }
  }
});

// router.delete("/apply", async (req, res) => {
//   // common session code all of your private routes
//   if (!req.session.user) {
//     return res.redirect("/users/login");
//   }

//   if (req.session.user) {
//     if (req.session.user.type !== "user") {
//       return res.redirect("/logout");
//     }
//   }

//   let jobId = req.body.jobId;
//   let userId = req.session.user.id;
//   if (!ObjectId.isValid(jobId) || !ObjectId.isValid(userId)) {
//     return res.status(400).render("pages/error", {
//       title: "apply",
//       message: "invalid id",
//       err: true,
//     });
//   }
//   try {
//     let output = await users.cancel(jobId, userId);
//     return res.json(output);
//   } catch (e) {
//     return res
//       .status(e.status)
//       .render("pages/error", { title: "Favor", message: e.message, err: true });
//   }
// });

// router.get("/apply/:id", async (req, res) => {
//   // common session code all of your private routes
//   if (!req.session.user) {
//     return res.redirect("/users/login");
//   }

//   if (req.session.user) {
//     if (req.session.user.type !== "user") {
//       return res.redirect("/logout");
//     }
//   }

//   let userId = req.session.user.id;
//   let jobId = req.params.jobId;
//   if (!ObjectId.isValid(jobId) || !ObjectId.isValid(userId)) {
//     return res.status(400).render("pages/error", {
//       title: "apply",
//       message: "invalid id",
//       err: true,
//     });
//   }
//   try {
//     let output = await users.track(jobId, userId);
//     return res.json(output);
//   } catch (e) {
//     return res.status(e.status).render("pages/error", {
//       title: "Favor",
//       message: e.message,
//       error: true,
//     });
//   }
// });

router.get("/apply", async (req, res) => {
  // common session code all of your private routes
  if (!req.session.user) {
    return res.redirect("/users/login");
  }

  if (req.session.user) {
    if (req.session.user.type !== "user") {
      return res.redirect("/logout");
    }
  }

  //get all favor
  let userId = req.session.user.id;
  if (!ObjectId.isValid(userId)) {
    res.status(400).render("pages/error", {
      title: "Favor",
      message: "inValid userId",
      error: true,
    });
  }
  try {
    let output = await users.track(userId);
    console.log(output);
    if (output) {
      if (output.length == 0) {
        return res.render("pages/appliedJob", {
          nullJob: true,
          message: "No Jobs applied yet",
        });
      }
    }
    for (let i = 0; i < output.length; i++) {
      output[i].unique = String(output[i]._id);
    }
    return res.render("pages/appliedJob", { jobFound: true, jobs: output });
  } catch (e) {
    return res.status(400).render("pages/error", {
      title: "applied",
      message: e.message,
      error: true,
    });
  }
});

router.post("/editProfile", async (req, res) => {
  let base = req.body.tmp;
  // console.log(experience+"************");
  if (!req.session.user) {
    return res.redirect("/users/login");
  }

  if (req.session.user) {
    if (req.session.user.type !== "user") {
      return res.redirect("/users/login");
    }
  }
  let userId = req.session.user.id;
  if (!ObjectId.isValid(userId)) {
    return res.status(400).render("pages/applicanteditprofile", {
      title: "basic information",
      message: "inValid userId",
      mainerr: true,
    });
  }
  try {
    let output = await users.editProfile(
      userId,
      base.gender,
      base.city,
      base.state
    );
    return res.json(output);
  } catch (e) {
    return res.status(e.status).render("pages/applicanteditprofile", {
      title: "basic information",
      message: e.message,
      genErr: true,
    });
  }
});

router.get("/ex", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/users/login");
  }

  if (req.session.user) {
    if (req.session.user.type !== "user") {
      return res.redirect("/users/login");
    }
  }
  let userId = req.session.user.id;
  if (!ObjectId.isValid(userId)) {
    return res.status(400).render("pages/applicanteditprofile", {
      title: "experience",
      message: "inValid userId",
      mainerr: true,
    });
  }
  try {
    let output = await users.getEx(userId);
    return res.json(output);
  } catch (e) {
    return res.status(e.status).render("pages/applicanteditprofile", {
      title: "experience",
      message: e.message,
      exErr: true,
    });
  }
});

router.post("/ex", async (req, res) => {
  let experience = req.body.tmp;
  // console.log(experience+"************");
  if (!req.session.user) {
    return res.redirect("/users/login");
  }

  if (req.session.user) {
    if (req.session.user.type !== "user") {
      return res.redirect("/users/login");
    }
  }
  let userId = req.session.user.id;
  if (!ObjectId.isValid(userId)) {
    return res.status(400).render("pages/applicanteditprofile", {
      title: "experience",
      message: "inValid userId",
      mainerr: true,
    });
  }
  if (!experience) {
    return res.status(400).render("pages/applicanteditprofile", {
      title: "experience",
      message: "experience is undefined",
      exErr: true,
    });
  }
  if (
    typeof experience.title !== "string" ||
    experience.title.trim().length === 0 ||
    typeof experience.employmentType !== "string" ||
    experience.employmentType.trim().length === 0 ||
    typeof experience.companyName !== "string" ||
    experience.companyName.trim().length === 0 ||
    typeof experience.startDate !== "string" ||
    experience.startDate.trim().length === 0 ||
    typeof experience.endDate !== "string" ||
    experience.endDate.trim().length === 0
  ) {
    return res.status(400).render("pages/applicanteditprofile", {
      title: "experience",
      message: "All input must be non-empty string",
      exErr: true,
    });
  }
  if (new Date(experience.startDate) > new Date(experience.endDate)) {
    return res.status(400).render("pages/applicanteditprofile", {
      title: "experience",
      message: "inValid start date and end date",
      exErr: true,
    });
  }
  try {
    let output = await users.addEx(experience, userId);
    console.log(output);
    return res.json(output);
  } catch (e) {
    return res.status(e.status).render("pages/applicanteditprofile", {
      title: "experience",
      message: e.message,
      exErr: true,
    });
  }
});

router.delete("/ex", async (req, res) => {
  let companyName = req.body.companyName;
  if (!req.session.user) {
    return res.redirect("/users/login");
  }

  if (req.session.user) {
    if (req.session.user.type !== "user") {
      return res.redirect("/users/login");
    }
  }
  let userId = req.session.user.id;
  if (!ObjectId.isValid(userId)) {
    return res.status(400).render("pages/applicanteditprofile", {
      title: "experience",
      message: "inValid userId",
      mainerr: true,
    });
  }
  if (!companyName) {
    return res.status(400).render("pages/applicanteditprofile", {
      title: "experience",
      message: "inValid company name",
      exErr: true,
    });
  }

  if (typeof companyName !== "string" || companyName.trim().length == 0) {
    return res.status(400).render("pages/applicanteditprofile", {
      title: "experience",
      message: "company name can only be non-empty string",
      exErr: true,
    });
  }
  try {
    let output = await users.delEx(companyName, userId);
    return res.json(output);
  } catch (e) {
    return res.status(e.status).render("pages/applicanteditprofile", {
      title: "experience",
      message: e.message,
      exErr: true,
    });
  }
});

router.get("/edu", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/users/login");
  }

  if (req.session.user) {
    if (req.session.user.type !== "user") {
      return res.redirect("/users/login");
    }
  }
  let userId = req.session.user.id;
  if (!ObjectId.isValid(userId)) {
    return res.status(400).render("pages/applicanteditprofile", {
      title: "education",
      message: "inValid userId",
      mainerr: true,
    });
  }
  try {
    let output = await users.getEdu(userId);
    return res.json(output);
  } catch (e) {
    return res.status(e.status).render("pages/applicanteditprofile", {
      title: "education",
      message: e.message,
      eduErr: true,
    });
  }
});

router.post("/edu", async (req, res) => {
  let education = req.body.tmp;
  if (!req.session.user) {
    return res.redirect("/users/login");
  }

  if (req.session.user) {
    if (req.session.user.type !== "user") {
      return res.redirect("/users/login");
    }
  }
  let userId = req.session.user.id;
  if (!ObjectId.isValid(userId)) {
    return res.status(400).render("pages/applicanteditprofile", {
      title: "education",
      message: "inValid userId",
      mainerr: true,
    });
  }
  if (!education) {
    return res.status(400).render("pages/applicanteditprofile", {
      title: "education",
      message: "education is undefined",
      eduErr: true,
    });
  }
  if (
    typeof education.school !== "string" ||
    education.school.trim().length === 0 ||
    typeof education.major !== "string" ||
    education.major.trim().length === 0 ||
    typeof education.degree !== "string" ||
    education.degree.trim().length === 0 ||
    typeof education.startDate !== "string" ||
    education.startDate.trim().length === 0 ||
    typeof education.endDate !== "string" ||
    education.endDate.trim().length === 0
  ) {
    return res.status(400).render("pages/applicanteditprofile", {
      title: "education",
      message: "All input must be non-empty string",
      eduErr: true,
    });
  }
  if (new Date(education.startDate) > new Date(education.endDate)) {
    return res.status(400).render("pages/applicanteditprofile", {
      title: "education",
      message: "inValid start date and end date",
      eduErr: true,
    });
  }
  try {
    let output = await users.addEdu(education, userId);
    return res.json(output);
  } catch (e) {
    return res.status(e.status).render("pages/applicanteditprofile", {
      title: "education",
      message: e.message,
      eduErr: true,
    });
  }
});

router.delete("/edu", async (req, res) => {
  let school = req.body.school;
  if (!req.session.user) {
    return res.redirect("/users/login");
  }

  if (req.session.user) {
    if (req.session.user.type !== "user") {
      return res.redirect("/users/login");
    }
  }
  let userId = req.session.user.id;
  if (!ObjectId.isValid(userId)) {
    return res.status(400).render("pages/applicanteditprofile", {
      title: "education",
      message: "inValid userId",
      mainerr: true,
    });
  }
  if (!school) {
    return res.status(400).render("pages/applicanteditprofile", {
      title: "education",
      message: "inValid school name",
      eduErr: true,
    });
  }

  if (typeof school !== "string" || school.trim().length == 0) {
    return res.status(400).render("pages/applicanteditprofile", {
      title: "education",
      message: "school name can only be non-empty string",
      eduErr: true,
    });
  }
  try {
    let output = await users.delEdu(school, userId);
    return res.json(output);
  } catch (e) {
    console.log(e);
    return res.status(e.status).render("pages/applicanteditprofile", {
      title: "education",
      message: e.message,
      eduErr: true,
    });
  }
});

router.get("/sk", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/users/login");
  }

  if (req.session.user) {
    if (req.session.user.type !== "user") {
      return res.redirect("/users/login");
    }
  }
  let userId = req.session.user.id;
  if (!ObjectId.isValid(userId)) {
    return res.status(400).render("pages/applicanteditprofile", {
      title: "skill",
      message: "inValid userId",
      mainerr: true,
    });
  }
  try {
    let output = await users.getSk(userId);
    return res.json(output);
  } catch (e) {
    return res.status(e.status).render("pages/applicanteditprofile", {
      title: "skill",
      message: e.message,
      skErr: true,
    });
  }
});

router.post("/sk", async (req, res) => {
  let sk = req.body.tmp;
  if (!req.session.user) {
    return res.redirect("/users/login");
  }

  if (req.session.user) {
    if (req.session.user.type !== "user") {
      return res.redirect("/users/login");
    }
  }
  let userId = req.session.user.id;
  if (!ObjectId.isValid(userId)) {
    return res.status(400).render("pages/applicanteditprofile", {
      title: "skills",
      message: "inValid userId",
      mainerr: true,
    });
  }
  if (!sk) {
    return res.status(400).render("pages/applicanteditprofile", {
      title: "skills",
      message: "invalid skills",
      skErr: true,
    });
  }
  if (typeof sk.skills !== "string" || sk.skills.trim().length === 0) {
    return res.status(400).render("pages/applicanteditprofile", {
      title: "skills",
      message: "skill must be non-empty string",
      skErr: true,
    });
  }
  try {
    let output = await users.addSk(sk.skills, userId);
    return res.json(output);
  } catch (e) {
    return res.status(e.status).render("pages/applicanteditprofile", {
      title: "skills",
      message: e.message,
      skErr: true,
    });
  }
});
router.delete("/sk", async (req, res) => {
  let skill = req.body.skill;
  if (!req.session.user) {
    return res.redirect("/users/login");
  }

  if (req.session.user) {
    if (req.session.user.type !== "user") {
      return res.redirect("/users/login");
    }
  }
  let userId = req.session.user.id;
  if (!ObjectId.isValid(userId)) {
    return res.status(400).render("pages/applicanteditprofile", {
      title: "Skills",
      message: "inValid userId",
      mainerr: true,
    });
  }
  if (typeof skill !== "string" || skill.trim().length === 0) {
    return res.status(400).render("pages/applicanteditprofile", {
      title: "skill",
      message: "skill must be non-empty string",
      skErr: true,
    });
  }
  try {
    let output = await users.delSk(skill, userId);
    return res.json(output);
  } catch (e) {
    return res.status(e.status).render("pages/applicanteditprofile", {
      title: "Skills",
      message: e.message,
      skErr: true,
    });
  }
});
router.get("/la", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/users/login");
  }

  if (req.session.user) {
    if (req.session.user.type !== "user") {
      return res.redirect("/users/login");
    }
  }
  let userId = req.session.user.id;
  if (!ObjectId.isValid(userId)) {
    return res.status(400).render("pages/applicanteditprofile", {
      title: "languages",
      message: "inValid userId",
      mainerr: true,
    });
  }
  try {
    let output = await users.getLa(userId);
    return res.json(output);
  } catch (e) {
    return res.status(e.status).render("pages/applicanteditprofile", {
      title: "languages",
      message: e.message,
      laErr: true,
    });
  }
});

router.post("/la", async (req, res) => {
  let la = req.body.tmp;
  console.log(la);
  if (!req.session.user) {
    return res.redirect("/users/login");
  }

  if (req.session.user) {
    if (req.session.user.type !== "user") {
      return res.redirect("/users/login");
    }
  }
  let userId = req.session.user.id;
  if (!ObjectId.isValid(userId)) {
    return res.status(400).render("pages/applicanteditprofile", {
      title: "languages",
      message: "inValid userId",
      mainerr: true,
    });
  }
  if (!la) {
    return res.status(400).render("pages/applicanteditprofile", {
      title: "languages",
      message: "invalid language",
      laErr: true,
    });
  }
  if (typeof la.languages !== "string" || la.languages.trim().length === 0) {
    return res.status(400).render("pages/applicanteditprofile", {
      title: "languages",
      message: "languages must be non-empty string",
      laErr: true,
    });
  }
  try {
    let output = await users.addLa(la.languages, userId);
    return res.json(output);
  } catch (e) {
    return res.status(e.status).render("pages/applicanteditprofile", {
      title: "languages",
      message: e.message,
      laErr: true,
    });
  }
});

router.delete("/la", async (req, res) => {
  let language = req.body.language;
  if (!req.session.user) {
    return res.redirect("/users/login");
  }

  if (req.session.user) {
    if (req.session.user.type !== "user") {
      return res.redirect("/users/login");
    }
  }
  let userId = req.session.user.id;
  if (!ObjectId.isValid(userId)) {
    return res.status(400).render("pages/applicanteditprofile", {
      title: "languages",
      message: "inValid userId",
      mainerr: true,
    });
  }
  if (typeof language !== "string" || language.trim().length === 0) {
    return res.status(400).render("pages/applicanteditprofile", {
      title: "languages",
      message: "languages must be non-empty string",
      laErr: true,
    });
  }
  try {
    let output = await users.delLa(language, userId);
    return res.json(output);
  } catch (e) {
    return res.status(e.status).render("pages/applicanteditprofile", {
      title: "languages",
      message: e.message,
      laErr: true,
    });
  }
});

module.exports = router;
