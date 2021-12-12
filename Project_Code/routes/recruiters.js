const { ObjectId } = require('bson');
const express = require('express');
const router = express.Router();
const recruiterDat = require("../data/recruiters");
const jobDat = require("../data/jobs");
const usrDat = require("../data/users");
const xss = require('xss');
// used for see resume
const download = require("../data/upload").download;
const users = require("../data/users");


router.get('/login', async (req, res) => {
    
    // $("#reclogin").show("modal");

    if(req.session.user){
        if (req.session.user.type == 'recruiter'){
            //console.log('recruiter : already logged in');
            return res.redirect('/recruiters/');       
        }

        if(req.session.user.type == 'user'){
            // return res.redirect('/ ##### USERS ROUTE HERE');
        }
    }
    return res.render('pages/recruiterlogin', {title:"Recruiter Login"});
});

router.get('/signup', async (req, res) => {
    // $("#reclogin").show("modal");
    if(req.session.user){
        if (req.session.user.type == 'recruiter'){
            // return res.redirect('/ ##### BAPI YOUR ROUTE HERE');       
        }

        if(req.session.user.type == 'user'){
            // return res.redirect('/ ##### USERS ROUTE HERE');
        }
    }
    return res.render('pages/recruiterSignup', {title:"Recruiter Sign-up"});
})

router.post('/login', async (req, res) => {
    // if (req.session.user) return res.redirect('/private')
    // else {
        //xss(req.body);
        let {email, password} = req.body;
        let re = /[A-Z0-9._-]+@[A-Z0-9.-]+\.[A-Z]{2,}/im
        if(email == "" || email == undefined) return res.status(400).render('pages/recruiterlogin', {message: "Please enter your email.", emailerr: true});
        if(email.length < 6) return res.status(400).render('pages/recruiterlogin', {message: "The email is too short.", emailerr: true});
        if(!re.test(email)) return res.status(400).render('pages/recruiterlogin', {message: `${email} is not a valid email.`, emailerr: true});

        //password validation
        let re2 = /\s/i
        if(!password) throw `Please enter your password`;
        if(re2.test(password)) return res.status(400).render('pages/recruiterlogin', {message: "Spaces are not allowed in passwords.", pwderr: true});
        if(password.length < 6) return res.status(400).render('pages/recruiterlogin', {message: "Password is too short.", pwderr: true});

        try {
            let output = await recruiterDat.recruiterCheck(email, password);
            if(output.authenticated) {
                // req.session.user = output.id;
                // return res.redirect('/private');
                let recId = output.id;
                req.session.user = {email: email,type:"recruiter",id: recId};
            // doe for redirection of urls
                return res.redirect('/recruiters/');
            }
        } catch (e) {
            return res.render('pages/recruiterlogin', {message: e.message, mainerr: true});
        }
    // }
});

router.get('/checkResume/:jobId/:appId', async (req, res) => {
    if(!req.session.user){
        return res.redirect('/recruiters/login');
    }

    if(req.session.user){
        if(req.session.user.type !=='recruiter'){
            return res.redirect('/recruiters/login');
        }
    }

    try{var fileId = await users.getResume(req.params.appId, req.params.jobId);}catch(e){console.log(e)}

    try {
        const downloadStream = await download(fileId);
        downloadStream.on("data", function (data) {
          return res.status(200).write(data);
        });
    
        downloadStream.on("error", function (err) {
        return res.status(404).render('pages/recruiterProfile', {message: "Cannot download the resume!", genErr: true});
        //   return res
        //     .status(404)
        //     .render("/users", { error: "Cannot download the resume!" });
        });
    
        downloadStream.on("end", () => {
          return res.end();
        });
      } catch (e) {
        return res.status(404).render('pages/recruiterProfile', {message: e, genErr: true});
        // res.render("/users", { error: e });
      }
})

router.get('/accept/:jobId/:appId', async (req, res) => {
    try {
        // session code
        if(!req.session.user){
            return res.redirect('/recruiters/login');
        }

        if(req.session.user){
            if(req.session.user.type !=='recruiter'){
                return res.redirect('/recruiters/login');
            }
        }

        let recruiterId = req.session.user.id;
        let applicantId = req.params.appId;
        let jobId = req.params.jobId;
        console.log(jobId);
        console.log(applicantId);
        // if(!req.session.user) {
        //     return res.status(403).render('partials/loginform', {, message: "Unauthorized Access", err: true})
        // } else {
            if(!jobId) return res.status(400).render('pages/recruiterProfile', {message: "Invalid ID", genErr: true});
            if(ObjectId.isValid(recruiterId) && ObjectId.isValid(applicantId) && ObjectId.isValid(jobId)) {
                let output = await recruiterDat.acceptDecision(recruiterId, applicantId, jobId);
                if(output) {
                    return res.redirect("/recruiters");
                }
                
            }
        // }
    } catch (e) {
        console.log(e);
        return res.status(e.status).render('partials/loginform', {message: e.message, err: true});
    }
});

router.post('/reject/:jobId/:appId', async (req, res) => {
    try {

        // common session code all of your private routes
        if(!req.session.user){
            return res.redirect('/recruiters/login');
        }

        if(req.session.user){
            if(req.session.user.type !=='recruiter'){
                return res.redirect('/recruiters/login');
            }
        }
        // if(!req.session.user) {
        //     return res.status(403).render('partials/loginform', {, message: "Unauthorized Access", err: true})
        // } else {
        let recruiterId = req.session.user.id;
        let applicantId = req.params.appId;
        let jobId = req.params.jobId;
        console.log(jobId);
        console.log(applicantId);
        // if(!req.session.user) {
        //     return res.status(403).render('partials/loginform', {, message: "Unauthorized Access", err: true})
        // } else {
        if(!jobId) return res.status(400).render('pages/recruiterProfile', {message: "Invalid ID", genErr: true});
        if(ObjectId.isValid(recruiterId) && ObjectId.isValid(applicantId) && ObjectId.isValid(jobId)) {
            let output = await recruiterDat.acceptDecision(recruiterId, applicantId, jobId);
            if(output) {
                return res.redirect("/recruiters");
            }
            
        }
        // }
    } catch (e) {
        return res.status(e.status).render('partials/loginform', {message: e.message, err: true});
    }
});

router.post('/signup', async (req, res) => {
    // if (req.session.user) return res.redirect('/private')
    // else {
        let {email, password, firstName, lastName, phone} = req.body;
        //Email validation
        let re = /[A-Z0-9._-]+@[A-Z0-9.-]+\.[A-Z]{2,}/im
        if(email == "" || email == undefined) return res.status(400).render('pages/recruiterSignup', { message: "Please enter your email.", emailerr: true});
        if(email.length < 6) return res.status(400).render('pages/recruiterSignup', { message: "The email is too short.", emailerr: true});
        if(!re.test(email)) return res.status(400).render('pages/recruiterSignup', { message: `${email} is not a valid email.`, emailerr: true});
        email = email.toLowerCase();

        //password validation
        let re2 = /\s/i
        if(!password) return res.status(400).render('pages/recruiterSignup',{ message: `Please enter your password`, pwderr: true});
        if(re2.test(password)) return res.status(400).render('pages/recruiterSignup', { message: "Spaces are not allowed in passwords.", pwderr: true});
        if(password.length < 6) return res.status(400).render('pages/recruiterSignup', { message: "Password is too short.", pwderr: true});

        //name validation
        let re3 = /[A-Z]/i
        firstName = firstName.trim();
        lastName = lastName.trim();
        if(firstName == "" || firstName == undefined) return res.status(400).render('pages/recruiterSignup', { message: "Please enter your first name.", fnerr: true});
        if(!re3.test(firstName)) return res.status(400).render('pages/recruiterSignup', { message: "Your name should not contain special characters.", fnerr: true});
        if(lastName == "" || lastName == undefined) return res.status(400).render('pages/recruiterSignup', { message: "Please enter your last name.", lnerr: true});
        if(!re3.test(lastName)) return res.status(400).render('pages/recruiterSignup', { message: "Your name should not contain special characters.", lnerr: true});

        //phone validation
        let re4 = /[0-9]{10}/
        phone = phone.trim();
        if(phone == "" || phone == undefined) return res.status(400).render('pages/recruiterSignup', { message: "Please enter your phone number.", pherr: true});
        if(phone.length != 10) return res.status(400).render('pages/recruiterSignup', { message: "Invalid phone number.", pherr: true});
        if(!re4.test(phone)) return res.status(400).render('pages/recruiterSignup', { message: "Invalid phone number.", pherr: true});

        try {
            let recruiter = await recruiterDat.createRecruiter(email, password, firstName, lastName, phone);
            if(recruiter.recFound) {
                let recId = recruiter.data._id;
                req.session.user = {email: email,type:"recruiter",id: recId};

                let profileCreated = true;
                if(!recruiter.data.profile){
                    profileCreated = false;
                }
                return res.redirect('/recruiters');
            }
        } catch (e) {
            return res.status(e.status).render('pages/recruiterSignup', { message: e.message, mainerr: true});
        }
    // }
});

router.get('/', async (req, res) => {
        // !!!!!!!!!!!!!!!!!!!!! Your code should be in try catch !!!!!!!!!!!!!!!!!!!!!
    
    // common session code all of your private routes
    if(!req.session.user){
        return res.redirect('/recruiters/login');
    }
    
     if(req.session.user){
        if(req.session.user.type !=='recruiter'){
            return res.redirect('/recruiters/login');
            }
        }
    let id = req.session.user.id, recruiter, newRec;
    if(ObjectId.isValid(id)) {
        try{
            recruiter = await recruiterDat.getRecruiter(id);
            if(Object.keys(recruiter.data.profile).length == 0) {
                newRec = true;
            } else {
                newRec = false
            }

            await Promise.all(recruiter.data.jobs.map(async (e) => {
                if(e.applicants.length != 0){
                    let applicantList = [];
                    await e.applicants.map(async (e) => {
                        let appId = e.appId.toString();
                        let appDetails = await usrDat.get(appId);
                        appDetails._id = appDetails._id.toString();
                        applicantList.push(appDetails);
                    });

                    e["applicants"] = applicantList;
                }
                let job = await jobDat.getJobsById(e.job_id.toString());
                job._id = job._id.toString();
                e["jobDetails"] = job;

                e.job_id = e.job_id.toString();
            }));
        } catch(e) {
            console.log(e);
        }
        return res.render('pages/recruiterProfile',{recruiter: recruiter.data, jobs: recruiter.data.jobs, recid: id, newRec: newRec});
    }
});

router.get('/profile', async (req, res) => {

    try {
         // common session code all of your private routes
         if(!req.session.user){
            return res.redirect('/recruiters/login');
        }

        if(req.session.user){
            if(req.session.user.type !=='recruiter'){
                return res.redirect('/recruiters/login');
            }
        }
        let id = req.session.user.id;


        // Check for unwanted params
        // if(req.params.id) {
        //     if(id !== req.params.id) {
        //         res.render()
        //     }
        // }


        if(ObjectId.isValid(id)) {
            let recruiter = await recruiterDat.getRecruiter(id);
            console.log(recruiter);
            if(Object.keys(recruiter.data.profile).length != 0) {
                return res.render('pages/recruitereditprofile', {title: "Update", method: "POST", action: "update"});
            } else {
                return res.render('pages/recruitereditprofile', {title: "Create", method: "POST", action: "create"});
            }
        }
    } catch (e) {
        return res.status(e.status).render('pages/recruitereditprofile', {message: e.message, err: true});
    }
});

router.get('/jobs', async(req, res) => {
    res.redirect('/recruiters/');
})

router.get('/jobs/new', async (req,res) => {
    
    try {
        // common session code all of your private routes
        if(!req.session.user){
            return res.redirect('/recruiters/login');
        }

        if(req.session.user){
            if(req.session.user.type !=='recruiter'){
                return res.redirect('/recruiters/login');
            }
        }
        return res.render('pages/jobpost', {title: "Create", action: "new", method: "POST"})    
    } catch (e) {
        return res.status(e.status).render('pages/jobpost', {message: e.message, err: true});
    }
});

router.get('/jobs/update/:id', async (req,res) => {
    try {
        // common session code all of your private routes
        if(!req.session.user){
            return res.redirect('/recruiters/login');
        }

        if(req.session.user){
            if(req.session.user.type !=='recruiter'){
                return res.redirect('/recruiters/login');
            }
        }
        let id = req.params.id;
        if(ObjectId.isValid(id)) {
            let job = await jobDat.getJobsById(id);
            console.log(job);
            if(job) {
                return res.render('pages/jobpost', {title: "Update", action: "update/"+id, method: "POST"})    
            }
        }
    } catch (e) {
        return res.status(e.status).render('pages/jobpost', {message: e.message, err: true});
    }
});

router.post('/profile/create', async (req, res) => {
    
    // common session code all of your private routes
    if(!req.session.user){
        return res.redirect('/recruiters/login');
    }

    if(req.session.user){
        if(req.session.user.type !=='recruiter'){
            return res.redirect('/recruiters/login');
        }
    }

    let id = req.session.user.id;
    let {gender, /*photo, */city, state, company, position, description} = req.body;

    //gender validation
    let re = /[A-Z]/i
    if(gender == "" || gender == undefined) return res.status(400).render('pages/recruitereditprofile', {message: "Please enter your gender.", genErr: true});
    gender = gender.trim();
    if(!re.test(gender)) return res.status(400).render('pages/recruitereditprofile', {message: "Your gender should not contain special characters.", genErr: true});
    if(gender.length != 1) return res.status(400).render('pages/recruitereditprofile', {message: "Please enter a valid gender.", genErr: true});

    //company validation
    let re2 = /[A-Z]+[ |.]?[A-Z]*/i
    if(company == "" || company == undefined) return res.status(400).render('pages/recruitereditprofile', {message: "Please enter your place of work.", compNameErr: true})
    company = company.trim();
    if(!re2.test(company)) return res.status(400).render('pages/recruitereditprofile', {message: `${company} is not a valid company.`, compNameErr: true});
    if(company.length < 3) return res.status(400).render('pages/recruitereditprofile', {message: "Please enter a valid company.", compNameErr: true});
    if(position == "" || position == undefined) return res.status(400).render('pages/recruitereditprofile', {message: "Please enter your position.", comPosErr: true})
    position = position.trim();
    if(!re2.test(position)) return res.status(400).render('pages/recruitereditprofile', {message: `${position} is not a valid position at ${company}.`, comPosErr: true});
    if(position.length < 3) return res.status(400).render('pages/recruitereditprofile', {message: "Please enter a valid position.", comPosErr: true});

    //city validation
    let re3 = /[A-Z]+[ ]?[A-Z]*[ ]?[A-Z]*/i
    if(city == "" || city == undefined) return res.status(400).render('pages/recruitereditprofile', {message: "Please enter your city of work.", cityErr: true});
    city = city.trim();
    if(!re3.test(city)) return res.status(400).render('pages/recruitereditprofile', {message: `${city} is not a valid city.`, cityErr: true});
    if(city.length < 3) return res.status(400).render('pages/recruitereditprofile', {message: "Please enter a valid gender.", cityErr: true});
    if(state == "" || state == undefined) return res.status(400).render('pages/recruitereditprofile', {message: "Please enter your state of work.", stateErr: true});
    state = state.trim();
    if(!re3.test(state)) return res.status(400).render('pages/recruitereditprofile', {message: `${state} is not a valid state.`, stateErr: true});
    if(state.length < 2) return res.status(400).render('pages/recruitereditprofile', {message: "Please enter a valid state.", stateErr: true});
    try {
        if(ObjectId.isValid(id)) {
            let profile = {"gender": gender.toUpperCase(), /*"photo": photo,*/ "city": city, "state": state, "company": {"position": position, "name": company, "description": description}}
            let output = await recruiterDat.createProfile(id, profile);
            if(output) {
                return res.redirect('/recruiters/')
            }
        } else {
            return res.status(400).render('pages/recruitereditprofile', {message: "Invalid Recruiter ID", err: true});
        }
        
    } catch (e) {
        console.log(e);
        return res.status(e.status).render('pages/recruitereditprofile', {message: e.message, err: true});
    }
});

router.post('/profile/update', async (req, res) => {
    // if (req.session.user) return res.redirect('/private')
    // else {
                        // common session code all of your private routes
                        if(!req.session.user){
                            return res.redirect('/recruiters/login');
                        }
                
                        if(req.session.user){
                            if(req.session.user.type !=='recruiter'){
                                return res.redirect('/recruiters/login');
                            }
                        }
        let id = req.session.user.id;
        let {gender,/* photo,*/ city, state, company, position, description} = req.body;

        //gender validation
        if(gender){
            let re = /[A-Z]/i
            if(gender == "" || gender == undefined) return res.status(400).render('pages/recruitereditprofile', {message: "Please enter your gender.", genErr: true});
            gender = gender.trim();
            if(!re.test(gender)) return res.status(400).render('pages/recruitereditprofile', {message: "Your gender should not contain special characters.", genErr: true});
            if(gender.length != 1) return res.status(400).render('pages/recruitereditprofile', {message: "Please enter a valid gender.", genErr: true});
        }

        //company name validation
        let re2 = /[A-Z]+[ |.]?[A-Z]*/i
        if(company){
            if(company == "" || company == undefined) return res.status(400).render('pages/recruitereditprofile', {message: "Please enter your place of work.", compNameErr: true})
            company = company.trim();
            if(!re2.test(company)) return res.status(400).render('pages/recruitereditprofile', {message: `${company} is not a valid company.`, compNameErr: true});
        }

        //company position validation
        if(position){
            if(position == "" || position == undefined) return res.status(400).render('pages/recruitereditprofile', {message: "Please enter your position.", comPosErr: true})
            position = position.trim();
            if(!re2.test(position)) return res.status(400).render('pages/recruitereditprofile', {message: `${position} is not a valid position at ${company}.`, comPosErr: true});
            if(position.length < 3)return res.status(400).render('pages/recruitereditprofile', {message: `Please enter a valid position.`, comPosErr: true}); 
        }

        //city validation
        let re3 = /[A-Z]+[ ]?[A-Z]*[ ]?[A-Z]*/i
        if(city){
            if(city == "" || city == undefined) return res.status(400).render('pages/recruitereditprofile', {message: "Please enter your city of work.", cityErr: true});
            city = city.trim();
            if(!re3.test(city)) return res.status(400).render('pages/recruitereditprofile', {message: `${city} is not a valid city.`, cityErr: true});
            if(city.length < 3) return res.status(400).render('pages/recruitereditprofile', {message: "Please enter a valid city.", cityErr: true});
        }
        
        //state validation
        if(state){
            if(state == "" || state == undefined) return res.status(400).render('pages/recruitereditprofile', {message: "Please enter your state of work.", stateErr: true});
            state = state.trim();
            if(!re3.test(state)) return res.status(400).render('pages/recruitereditprofile', {message: `${state} is not a valid state.`, stateErr: true});
            if(state.length < 2) return res.status(400).render('pages/recruitereditprofile', {message: "Please enter a valid state.", stateErr: true});
        }

        try {
            let recProfile = {"gender": gender, "city": city, "state": state, "company": {"name": company, "position": position, "description": description}};
            if(ObjectId.isValid(id)) {
                console.log(recProfile);
                let output = await recruiterDat.updateProfile(id, recProfile);
                return res.redirect('/recruiters/');
            } else {
                return res.status(400).render('pages/recruitereditprofile', {message: "Invalid Recruiter ID", err: true});
            }
        } catch (e) {
            console.log(e);
            return res.status(e.status).render('pages/recruitereditprofile', {message: e.message, err: true});
        }
    // }
});

router.get('/delete', async (req, res) => {
    let id = req.session.user.id;
    try {
                        // common session code all of your private routes
                        if(!req.session.user){
                            return res.redirect('/recruiters/login');
                        }
                
                        if(req.session.user){
                            if(req.session.user.type !=='recruiter'){
                                return res.redirect('/recruiters/login');
                            }
                        }
        if(ObjectId.isValid(id)) {
            let output = await recruiterDat.removeRecruiter(id);
            if(output) {
                req.session.destroy((function(err){
                    res.clearCookie('AuthCookie').redirect('/');
                }));
            }
        }
    } catch (e) {
        return res.status(e.status).render('pages/rec', {message: e.message, err: true});
    }
});

router.post('/jobs/new', async (req, res) => {
                    // common session code all of your private routes
                    if(!req.session.user){
                        return res.redirect('/recruiters/login');
                    }
            
                    if(req.session.user){
                        if(req.session.user.type !=='recruiter'){
                            return res.redirect('/recruiters/login');
                        }
                    }
                    console.log(req.body);
    let id = req.session.user.id;
    let {title, jobType, company, city, state/*, postDate*/, jobExpiry, summary, description, jobTags, jobMinPay, jobMaxPay} = req.body;

    if(!title || title.trim().length < 1) return res.status(400).render('pages/jobpost', {message: `Please provide a valid title`, jtitleErr: true});
    if(!jobType || jobType.trim().length < 1) return res.status(400).render('pages/jobpost', {message: `Please provide a valid type of job`, jtypeErr: true});
    if(!company || company.trim().length < 1) return res.status(400).render('pages/jobpost', {message: `Please provide a valid company`, compErr: true});
    if(!city || city.trim().length < 1) return res.status(400).render('pages/jobpost', {message: `Please provide a valid city`, cityErr: true});
    if(!state || state.trim().length < 1) return res.status(400).render('pages/jobpost', {message: `Please provide a valid state`, stateErr: true});

    if(!summary || summary.trim().length < 1) return res.status(400).render('pages/jobpost', {message: `Please provide a valid summary`, jobSumErr: true});
    if(!description || description.trim().length < 1) return res.status(400).render('pages/jobpost', {message: `Please provide a valid description`, jobDesc: true});
    if(!jobTags || jobTags.length < 1 ) return res.status(400).render('pages/jobpost', {message: `Please provide a valid required skilset`, jobReqErr: true});

    let currentDay = new Date();
    // if(!postDate|| typeof postDate !== 'object') return res.status(400).render('pages/jobpost', {message: `please provide a valid post date`});
    // if(!jobExpiry || +jobExpiry < +currentDay.toISOString().split('T')[0]) return res.status(400).render('pages/jobpost', {message: `please provide a valid expiry date`, jobExp: true});
    jobTags = jobTags.split(",");
    if(parseInt(jobMinPay) > parseInt(jobMaxPay)) return res.status(400).render('pages/jobpost', {message: "Invalid payrange", jobPayErr: true});
    let payrange = jobMinPay + '-' +jobMaxPay;

    try {
        // if(ObjectId.isValid(id)) {
            
            let jobDetails = {title, type: jobType, company, city, state, jobExpiry, details :{summary, description, required: jobTags}, payRange};
            let output = await recruiterDat.postJob(id, jobDetails);
            console.log("I am here",output);

            if(output) {
                return res.redirect('/recruiters');
            }
        // }
    } catch(e) {
        console.log(e);
        return res.status(e.status).render('pages/jobpost', {message: e.message, mainErr: true});
    }
});

router.post('/jobs/update/:id', async (req, res) => {

                    // common session code all of your private routes
                    if(!req.session.user){
                        return res.redirect('/recruiters/login');
                    }
            
                    if(req.session.user){
                        if(req.session.user.type !=='recruiter'){
                            return res.redirect('/recruiters/login');
                        }
                    }
    let jobId = req.params.id;
    let recId = req.session.user.id;

    let {title, jobType, company, city, state, postDate, jobExpiry, summary, benefits, description, jobTags, jobMaxPay, jobMinPay} = req.body;

    if(!title || title.trim().length < 1) return res.status(400).render('pages/jobpost', {message: `Please provide a valid title`, jtitleErr: true});
    if(!jobType || jobType.trim().length < 1) return res.status(400).render('pages/jobpost', {message: `Please provide a valid type of job`, jtypeErr: true});
    if(!company || company.trim().length < 1) return res.status(400).render('pages/jobpost', {message: `Please provide a valid company`, compErr: true});
    if(!city || city.trim().length < 1) return res.status(400).render('pages/jobpost', {message: `Please provide a valid city`, cityErr: true});
    if(!state || state.trim().length < 1) return res.status(400).render('pages/jobpost', {message: `Please provide a valid state`, stateErr: true});

    if(!summary || summary.trim().length < 1) return res.status(400).render('pages/jobpost', {message: `Please provide a valid summary`, jobSumErr: true});
    if(!description || description.trim().length < 1) return res.status(400).render('pages/jobpost', {message: `Please provide a valid description`, jobDesc: true});
    if(!jobTags || jobTags.length < 1 ) return res.status(400).render('pages/jobpost', {message: `Please provide a valid required skilset `, jobReqErr: true});

    let currentDay = new Date();
    // if(!postDate|| typeof postDate !== 'object') return res.status(400).render('pages/jobpost', {message: `please provide a valid post date`});
    // if(!jobExpiry|| +jobExpiry < +currentDay) return res.status(400).render('pages/jobpost', {message: `please provide a valid expiry date`, jobExp: true});

    jobTags = jobTags.split(",");
    if(parseInt(jobMinPay) > parseInt(jobMaxPay)) return res.status(400).render('pages/jobpost', {message: "Invalid payrange", jobPayErr: true});
    let payrange = jobMinPay +"-"+jobMaxPay;
    try {
        if(ObjectId.isValid(recId) && ObjectId.isValid(jobId)) {
            let jobDetails = {title, type: jobType, company, city, state, jobExpiry, details :{summary, description, required: jobTags}, payrange, benefits};
            let output = await recruiterDat.updateJob(recId, jobId, jobDetails);
            if(output) {
                return res.redirect('/recruiters')
            }
        }
    } catch(e) {
        return res.status(e.status).render('pages/jobpost', {message: e.message, mainErr: true});
    }
});

router.get('/jobs/delete/:id', async (req, res) => {
    try {
        // common session code all of your private routes
        if(!req.session.user){
            return res.redirect('/recruiters/login');
        }

        if(req.session.user){
            if(req.session.user.type !=='recruiter'){
                return res.redirect('/recruiters/login');
            }
        }
        let jobId = req.params.id;
        if(ObjectId.isValid(jobId)) {
            let userId = req.session.user.id;
            let output = await recruiterDat.removeJob(userId, jobId);
            if(output.deleted) {
                return res.redirect('/recruiters')
            }
        }
    } catch (e) {
        console.log(e);
        return res.status(e.status).render('pages/rec', {message: e.message, err: true});
    }
});

module.exports = router;