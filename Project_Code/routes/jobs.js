const express = require("express");
const session = require("express-session");
const router = express.Router();
const data = require("../data");
const users = data.users;
const jobData = data.jobs;

router.get("/", async (req, res) => {
  try {
    const result = await jobData.getAllJobs();
    if(result){
      if(result.length == 0 ){
        return res.render("pages/home",{nullJob:true, message:"No Jobs posted yet"});
      }
    }
    for (let i = 0; i < result.length; i++) {
      result[i].unique = String(result[i]._id);
      let dd = String(result[i].postDate.getDate()).padStart(2, '0');
      let mm = String(result[i].postDate.getMonth() + 1).padStart(2, '0'); //January is 0!
      let yyyy = result[i].postDate.getFullYear();

      let today = mm + '/' + dd + '/' + yyyy;
      result[i].postDateString = today;
    }
    //console.log(result);

    return res.render("pages/home", { jobFound:true,jobs: result });
  } catch (e) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/jobs/city/:city", async (req, res) => {
  try {
    const result = await jobData.getJobByCity(req.params.city);
    return res.json(result);
  } catch (e) {
    return res.status(400).render("pages/error",{message: e});
  }
});

router.get("/getsession", async (req, res) => {
  try {

    if(req.session.user){

      if(req.session.user.type == 'user'){
        return res.json({status : "active",type :'user'});
      }
      else{

        return res.json({status : "active",type :'recruiter'});

      }
      
    }
    else{
      return res.json({status: "inactive"});
    }
  } catch (e) {
    return res.status(400).render("pages/error",{message: e});
  }
});

router.get("/jobs/id/:id", async (req, res) => {
  try {
    if(!req.session.user || req.session.user.type != 'user'){
      //alert("PLEASE LOGIN FIRST");
      return res.render('pages/home',{errorclass: true});
    }
    const result = await jobData.getJobsById(req.params.id);
    const jobId = req.params.id;
    //console.log(jobId);
    return res.render("pages/singleJob", { data: result, jobId: jobId });
  } catch (e) {
    return res.status(400).render("pages/error",{message: e});
  }
});

/*
router.post("/jobs/id/:id/apply", async (req, res) => {
  // await users.apply(req.params.id,)
  res.status(200).send("success!");
});
*/
router.get("/jobs/state/:state", async (req, res) => {
  try {
    const result = await jobData.getJobByState(req.params.state);
    return res.json(result);
  } catch (e) {
    return res.status(400).render("pages/error",{message: e});
  }
});

router.get('/logout', (req, res) => {
  if(req.session.user){
      req.session.destroy((function(err){
          res.clearCookie('AuthCookie').render('pages/logout');
  
      }));
      return;
  }
  else{
      res.render('pages/error');
      return;
  }

});

router.get("/jobs/recruiters/id/:id", async (req, res) => {
  try {
    if(!req.session.user || req.session.user.type != 'recruiter'){
      //alert("PLEASE LOGIN FIRST");
      return res.render('pages/home',{errorclass: true});
    }
    const result = await jobData.getJobsById(req.params.id);
    const jobId = req.params.id;
    console.log(jobId);
    return res.render("pages/recJob", { data: result, jobId: jobId });
  } catch (e) {
    // write a function here to render page heere
    return res.status(400).render("pages/error",{message: e});

  }
});

router.get("/jobs/recruiters/id/:id", async (req, res) => {
  try {
    if(!req.session.user || req.session.user.type != 'recruiter'){
      //alert("PLEASE LOGIN FIRST");
      return res.render('pages/home',{errorclass: true});
    }
    const result = await jobData.getJobsById(req.params.id);
    const jobId = req.params.id;
    console.log(jobId);
    return res.render("pages/recJob", { data: result, jobId: jobId });
  } catch (e) {
    // write a function here to render page heere
    return res.status(400).render("pages/error",{message: e});

  }
});

// To sort the jobs by  post date

router.get("/jobs/sort", async (req, res) => {
  try {
    const result = await jobData.sortByDate();
    //console.log(result);
    if(result){
      if(result.length == 0 ){
        return res.render("pages/home",{nullJob:true, message:"No Jobs posted yet"});
      }
    }
    result.reverse();
    for (let i = 0; i < result.length; i++) {
      result[i].unique = String(result[i]._id);
      let dd = String(result[i].postDate.getDate()).padStart(2, '0');
      let mm = String(result[i].postDate.getMonth() + 1).padStart(2, '0'); //January is 0!
      let yyyy = result[i].postDate.getFullYear();

      let today = mm + '/' + dd + '/' + yyyy;
      result[i].postDateString = today;
    }
    //console.log(result);

    return res.render("pages/home", { jobFound:true,jobs: result });
  } catch (e) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;

// to write a route for patching the database using the update function from the job data file ;
