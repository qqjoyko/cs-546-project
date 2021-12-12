/*
Variables: 

  recFound - True/False based on recruiter present in database
  data - Recruiter object data 
  recruiterCol - Recruiter Collection
  userCol - User Collection



Methods:

  createRecruiter(email, password, firstname, lastName, phone)
    Inserts recruiter object in database -> Returns {recFound, data} after insertion
  
  getRecruiter(id)
    Retrieves recruiter record based on ID passed -> Returns {recFound, data}

  getJobsByRecruiterId(id)
    Returns array of jobs created by the recruiter whose id is passed -> Returns recruiter.data.jobs
  
  createProfile(recruiterId, profile)
    Creates profile subdocument of recruiter based on recruiterId and data in profile object passed ->  Returns {recFound, data} with inserted profile
  
  recruiterCheck(email, password)
    Checks if passed email and password are a match in database -> Returns {"authenticated": true, "id": ObjectId of recruiter} if matched.

  updateProfile(recruiterId, profile
    Updates profile subdocument of recruiter based on recruiterId and data in profile object passed ->  Returns {recFound, data} with updated profile
  
  removeRecruiter(id)
    Removes recruiter record from database along with associated data in jobs and users collection -> Returns "Successfully removed"
  
  postJob(id, jobDetails)
    Creates a new job post by recruiter by passing recruiterId and job related details into createJob methods in jobs -> Returns "Sucessfully created" for now (Should return/redirect to jobs page)

  updateJob(recruiterId, jobId, jobDetails)
    Updates existing job details of the job whose id is passed after checking access rights of the recruiter whose id is passed along with the updated job details -> Returns updated job details object

  removeJob(recruiterId, jobId)
    Removes job document after checking access rights of the recruiter -> Returns {"jobId" : jobId.toString(), "deleted": true} after deletion

  acceptDecision(recruiterId, applicantId, jobId)
    Changes status to Accepted after checking the access of the job to the recruiter -> "Applicant accepted"

  rejectDecision(recruiterId, applicantId, jobId)
    Changes status to Rejected after checking the access of the job to the recruiter -> "Applicant rejected"

*/

const mongoCollections = require('../config/mongoCollections');
const jobMethods = require('./jobs');
const recruiters = mongoCollections.recruiters;
const bcrypt = require('bcrypt');
const { ObjectId } = require('bson');
const usrs = mongoCollections.users;
const jobs = mongoCollections.jobs;
const saltRounds = 16;
const usrMethods = require("./users");

function CustomError (status, message) {
  this.status = status;
  this.message = message;
}

//Convert format for phone in backend

async function createRecruiter(email, password, firstName, lastName, phone) {
  //Email validation
  let re = /[A-Z0-9._-]+@[A-Z0-9.-]+\.[A-Z]{2,}/im
  if(email == "" || email == undefined) throw new CustomError(400,"Please enter your email.");
  if(email.length < 6) throw new CustomError(400,"The email is too short.");
  if(!re.test(email)) throw new CustomError(400,`${email} is not a valid email.`);
  email = email.toLowerCase();

  //password validation
  let re2 = /\s/i
  if(!password) throw new CustomError(400,"Please enter your password");
  if(re2.test(password)) throw new CustomError(400,"Spaces are not allowed in passwords.");
  if(password.length < 6) throw new CustomError(400,"Password is too short.");

  //name validation
  let re3 = /[A-Z0-9]/i
  firstName = firstName.trim();
  lastName = lastName.trim();
  if(firstName == "" || firstName == undefined) throw new CustomError(400,"Please enter your first name.");
  if(!re3.test(firstName)) throw new CustomError(400,"Your name should not contain special characters.");
  if(lastName == "" || lastName == undefined) throw new CustomError(400,"Please enter your last name.");
  if(!re3.test(lastName)) throw new CustomError(400,"Your name should not contain special characters.");

  //phone validation
  phone = phone.trim();
  let re4 = /[0-9]{10}/
  if(phone == "" || phone == undefined) throw new CustomError(400,"Please enter your phone number.");
  if(phone.length != 10) throw new CustomError(400,"Your phone number is of 10 digits.");
  if(!re4.test(phone)) throw new CustomError(400,"Invalid phone number");

  phone = phone.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");

  const recruiterCol = await recruiters();
  let dupUser = await recruiterCol.findOne({"email": email})
  if(dupUser == null){
      let newRec = {
          email: email,
          password: await bcrypt.hash(password, saltRounds),
          firstName: firstName,
          lastName: lastName,
          phone: phone,
          profile: {},
          jobs: []
      }

      const insertInfo = await recruiterCol.insertOne(newRec);
      if (insertInfo.insertedCount === 0) {
          throw new CustomError(500,'Internal Server Error');
      } else {
          let insertedId = insertInfo.insertedId;
          let returnObj = await this.getRecruiter(insertedId.toString());
          return returnObj;
      }
  } else {
      throw new CustomError(400,`Username with ${email} already exists in the database.`);
  }
}

async function getRecruiter(recruiterId) {

  //ID validation
  if(ObjectId.isValid(recruiterId)) {
    const recruiterCol = await recruiters();
    let recruiter = await recruiterCol.findOne({"_id": new ObjectId(recruiterId)});
    if (recruiter) {
      recruiter._id = recruiter._id.toString();
      return {"recFound": true, "data": recruiter};
    } else {
      let returnObj = {"recFound": false}
        return returnObj;
    }
  } else throw new CustomError(400, `${recruiterId} is not a valid ID`)
  
}

async function getJobsByRecruiterId(recruiterId) {
  if(ObjectId.isValid(recruiterId)) {
    const recruiterCol = await recruiters();
    let recruiter = await getRecruiter(recruiterId);
    if (recruiter.recFound) {
        return recruiter.data.jobs;
    } else {
      let returnObj = {"unauthorized": true}
        return returnObj;
    }
  } else throw new CustomError(400, `${recruiterId} is not a valid ID`)
  
}

async function createProfile(recruiterId, profile) {
  const recruiterCol = await recruiters();

  let {gender, /*photo, */city, state, company} = profile
  let recruiter = await getRecruiter(recruiterId);
  //gender validation
  let re = /[A-Z]/i
  gender = gender.trim();
  if(gender == "" || gender == undefined) throw new CustomError(400,"Please enter your gender.");
  if(!re.test(gender)) throw new CustomError(400,"Your gender should not contain special characters.");
  if(gender.length != 1) throw new CustomError(400,"Please enter a valid gender.");

  //company validation
  let {position, name, description} = company;
  let re2 = /[A-Z0-9.-]/i
  if(name == "" || name == undefined) throw new CustomError(400,"Please enter your place of work.")
  name = name.trim();
  if(!re2.test(name)) throw new CustomError(400,`${name} is not a valid company.`);
  if(position == "" || position == undefined) throw new CustomError(400,"Please enter your position.")
  position = position.trim();
  if(!re2.test(position)) throw new CustomError(400,`${position} is not a valid position at ${name}.`);

  //city validation
  let re3 = /[A-Z-]/i
  if(city == "" || city == undefined) throw new CustomError(400,"Please enter your location of work.")
  city = city.trim();
  if(!re3.test(city)) throw new CustomError(400,`${city} is not a valid city.`);
  if(state == "" || state == undefined) throw new CustomError(400,"Please enter your location of work.")
  state = state.trim();
  if(!re3.test(state)) throw new CustomError(400,`${state} is not a valid state.`);

  if(recruiter.recFound) {
    let recId = new ObjectId(recruiter.data._id);
    let newProfile = {
      gender: gender,
      city: city,
      state: state,
      company: company,
      // photo: photo
    }
    const recruiterUpdate = await recruiterCol.updateOne({ _id: recId }, { $set: { profile: newProfile } });
    if (recruiterUpdate.modifiedCount === 0) {
      throw new CustomError(400,"The recruiter's profile could not be created.");
    } else {
        return await getRecruiter(recruiterId);
    }
  } else {
    throw new CustomError(400,"This recruiter does not exist in the database.");
  }
}

async function recruiterCheck(email, password) {

  //Email validation
  let re = /[A-Z0-9._-]+@[A-Z0-9.-]+\.[A-Z]{2,}/im
  if(email == "" || email == undefined) throw new CustomError(400,"Please enter your email.");
  if(email.length < 6) throw new CustomError(400,"The email is too short.");
  if(!re.test(email)) throw new CustomError(400,`${email} is not a valid email.`);
  email = email.toLowerCase();

  //password validation
  let re2 = /\s/i
  if(!password) throw new CustomError(400,"Please enter your password");
  if(re2.test(password)) throw new CustomError(400,"Spaces are not allowed in passwords.");
  if(password.length < 6) throw new CustomError(400,"Password is too short.");

  const recruiterCol = await recruiters();
  let validateRecruiter = await recruiterCol.findOne({"email": email})
    if(validateRecruiter == null) throw new CustomError(400,"Either the username or password is invalid");
    else {
        if(await bcrypt.compare(password, validateRecruiter.password)){
            let returnObj = {"authenticated": true, "id": validateRecruiter._id.toString()};
            return returnObj;
        } else throw new CustomError(400,"Either the username or password is invalid");
    }

}

async function updateProfile(recruiterId, profile) {
  const recruiterCol = await recruiters();
  if(ObjectId.isValid(recruiterId)) {
    let recruiter = await getRecruiter(recruiterId);

    let {gender, /*photo, */city, state, company} = profile;
    //gender validation
    if(gender){
      let re = /[A-Z]/i
      if(gender == "" || gender == undefined) throw new CustomError(400,"Please enter your gender.");
      gender = gender.trim();
      if(!re.test(gender)) throw new CustomError(400,"Your gender should not contain special characters.");
      if(gender.length != 1) throw new CustomError(400,"Please enter a valid gender.");
    } else {
      gender = recruiter.data.profile.gender;
    }

    //company validation
    let {position, name, description} = company;

    let re2 = /[A-Z]+[ ]?[A-Z]*/i
    if(name){
      if(name == "" || name == undefined) throw new CustomError(400,"Please enter your place of work.")
      name = name.trim();
      if(!re2.test(name)) throw new CustomError(400,`${name} is not a valid company.`);
    } else {
      name = recruiter.data.profile.company.name;
    }
    
    if(position){
      if(position == "" || position == undefined) throw new CustomError(400,"Please enter your position.")
      position = position.trim();
      if(!re2.test(position)) throw new CustomError(400,`${position} is not a valid position at ${name}.`);
    } else {
      position = recruiter.data.profile.company.position;
    }

    //city validation
    let re3 = /[A-Z]+[ ]?[A-Z]*[ ]?[A-Z]*/i

    if(city){
      if(city == "" || city == undefined) throw new CustomError(400,"Please enter your location of work.")
      city = city.trim();
      if(!re3.test(city)) throw new CustomError(400,`${city} is not a valid city.`);
      if(city.length < 3) throw new CustomError(400,"Please enter a valid city.");
    } else {
      city = recruiter.data.profile.city;
    }

    if(state){
      if(state == "" || state == undefined) throw new CustomError(400,"Please enter your location of work.")
      state = state.trim();
      if(!re3.test(state)) throw new CustomError(400,`${state} is not a valid state.`);
      if(state.length < 2) throw new CustomError(400,"Please enter a valid state.");
    } else {
      state = recruiter.data.profile.state;
    }

    if(recruiter.recFound) {
      
      if((gender && recruiter.data.profile.gender == gender) && (city && recruiter.data.profile.city == city) && (state && recruiter.data.profile.state == state)
        && (name && recruiter.data.profile.company.name == name) && (position && recruiter.data.profile.company.position == position) && (description && recruiter.data.profile.company.description == description)) {
          throw new CustomError(400,`No fields are being updated.`);
        } 
      else {
        
        let recId = new ObjectId(recruiter.data._id);
        let updatedProfile = {
          gender: gender,
          city: city,
          state: state,
          company: company,
          // photo: photo
        }
        const recruiterUpdate = await recruiterCol.updateOne({ _id: recId }, { $set: { profile: updatedProfile } });
        if (recruiterUpdate.modifiedCount === 0) {
          throw new CustomError(400,"The recruiter's profile could not be updated.");
        } else {
            return await getRecruiter(recruiterId);
        }
      }
    } else {
      throw new CustomError(400,`This Recruiter does not exist in the database.`);
    }
  } else {
    throw new CustomError(400,"This recruiter does not exist in the database.");
  }
  
}

async function removeRecruiter(recruiterId) {
  const recruiterCol = await recruiters();
  const userCol = await usrs();
  const jobsCol = await jobs();
  
  if(ObjectId.isValid(recruiterId)) {
    try {
      let recruiter = await getRecruiter(recruiterId);
      if(recruiter.recFound){
        let recruiterJobs = [], appliedUsers = [], usrUpdate, jobDel, appliedUserSet;
        if(recruiter.data.jobs) {
          recruiter.data.jobs.forEach(e => {
            recruiterJobs.push(e.job_id);
            appliedUsers.push(e.applicant_id);
          });

          jobDel = await jobsCol.deleteMany({_id: {$in:recruiterJobs}});
          if(jobDel.deletedCount === recruiterJobs.length) {
            if(appliedUsers.length != 0) {
              appliedUserSet = new Set(appliedUsers.flat());
              usrUpdate = await userCol.updateMany({_id: {$in: [...appliedUserSet]}}, {$pull: {jobs: {job: {$in: recruiterJobs}}, favor: {$in: recruiterJobs}}})
            }
          }
        }

        if(recruiterJobs.length == 0 || usrUpdate.modifiedCount === appliedUserSet.size) {
          const recruiterDeletion = await recruiterCol.deleteOne({ _id: new ObjectId(recruiterId) });
          if (recruiterDeletion.deletedCount === 0) {
              throw new CustomError(400,"The recruiter could not be removed.");
          } else {
              return "Successfully removed";
          }
        }
      } else throw new CustomError(400,"This Recruiter does not exist in the database.");
    } catch(e) {
      console.log(e);
    }
  }
}

async function postJob(recruiterId, jobDetails) {
  
  if(ObjectId.isValid(recruiterId)) {
    const recruiterCol = await recruiters();
    let recruiter = await getRecruiter(recruiterId);
    if(recruiter.recFound) {
      let resObj = await jobMethods.createJob(recruiterId, recruiter.data.email, jobDetails);
      const jobPost = await recruiterCol.updateOne({ _id: new ObjectId(recruiterId) }, { $push: { jobs : {"job_id": resObj._id, "applicants": [] }} });
      if (jobPost.modifiedCount === 0) {
        throw new CustomError(400,"The job could not be created.");
      } else {
          return "Sucessfully created";
      }
    } else {
      throw new CustomError(400,"This Recruiter does not exist in the database.");
    }
  }
}

async function updateJob(id, jobId, jobDetails) {
  
  if(ObjectId.isValid(id)) {
    let recruiter = await getRecruiter(id);
    if(recruiter.recFound) {
      let jobList = await getJobsByRecruiterId(id);
      if(jobList.some(e => e.job_id.toString() == jobId.toString())) {
        let resObj = await jobMethods.updateJob(jobId, jobDetails);
        return resObj;
      } else throw new CustomError(403,"Recruiter does not have this job");
    } else {
      throw new CustomError(400,`Recruiter with the email ${email} does not exist in the database.`);
    }
  }
}

async function removeJob(recruiterId, jobId) {
  try {

    if(ObjectId.isValid(recruiterId) && ObjectId.isValid(jobId)) {
      const recruiterCol = await recruiters();
      const userCol = await usrs();
      let recruiter = await getRecruiter(recruiterId);
      jobId = new ObjectId(jobId);
      if(recruiter.recFound) {
        let applicants = await recruiterCol.find({"jobs.job_id": jobId}).project({_id: 0, jobs: {"job_id": 1,"applicant_id": 1}}).toArray();
        applicants = applicants[0].jobs;
        let appliedUserSet = [], usrUpdate;
        let applicant = applicants.find(e => e.job_id.toString() === jobId.toString());
        if(applicant.applicant_id){
          // Change appliedUserSet if applicant_id is converted to object.
          appliedUserSet = applicant.applicant_id;
          usrUpdate = await userCol.updateMany({_id: {$in: appliedUserSet}}, {$pull: {jobs: {job: {$eq: jobId}}, favor: {$eq: jobId}}});
        } 
        
        if(!applicant.applicant_id || usrUpdate.modifiedCount == appliedUserSet.length){
          let jobList = await getJobsByRecruiterId(recruiterId);
          if(jobList.some(e => e.job_id.toString() == jobId.toString())) {
            let jobDel = await recruiterCol.updateOne({_id: new ObjectId(recruiterId)}, {$pull: { jobs: {job_id: jobId } } } );
            console.log(jobDel);
            if(jobDel.modifiedCount === 1){
              let resObj = await jobMethods.deleteJob(jobId.toString());
              if(resObj) {
                let result = {"jobId" : jobId.toString(), "deleted": true};
                return result;
              } else throw new CustomError(400,`The job with ID ${jobId} could not be removed.`);
            }
          } else throw new CustomError(403,"Recruiter does not have this job");
        } else throw new CustomError(400,"Job could not be removed.");
      } else throw new CustomError(400,"This Recruiter does not exist in the database.");
    }
  } catch(e) {
    console.log(e);
  }
}


async function acceptDecision(recruiterId, applicantId, jobId) {
  try{
    const userCol = await usrs();
    const recCol = await recruiters();
    let recruiter = await getRecruiter(recruiterId);
    if(recruiter.recFound) {
      let jobList = await getJobsByRecruiterId(recruiterId);
  
      if(jobList.some(e => jobId === e.job_id.toString())) {
        jobId = new ObjectId(jobId);
        applicantId = new ObjectId(applicantId);
        let recAppUpdate = await recCol.updateOne({_id: new ObjectId(recruiterId)}, {$set: {"jobs.$[job].applicants.$[app].status": "Accepted"}}, {arrayFilters: [{"app.appId": {$eq: applicantId}},{"job.job_id": jobId}]});
        console.log(recAppUpdate);
         if(recAppUpdate.modifiedCount === 1){
           let applicant = await userCol.updateOne({_id: applicantId, "jobs.job": jobId},{$set: {"jobs.$.status": "Accepted"}}, {returnNewDocument: true});
           console.log(applicant);
          // // let applicant = await userCol.updateOne({"_id": new ObjectId(applicantId), "jobs.job": jobId}, {$set: {"jobs.$.status": "Accepted"}})
          // let applicant = await userCol.updateOne({"_id": {$eq: new ObjectId(applicantId)}}, {$set: {"jobs.$[elem].status": "Accepted"}}, {arrayFilters: [{"elem.job": {$eq: jobId}}]})
          if(applicant.modifiedCount === 1) {
            return "Accepted";
         }
        } else throw new CustomError(500,"Acceptance error");
      } else throw new CustomError(403,"Recruiter does not have this job");
    } else throw new CustomError(400,"Recruiter is not present in the database");
  } catch(e) {
    console.log(e);
  }
}

async function rejectDecision(recruiterId, applicantId, jobId) {
  const recruiterCol = await recruiters();
  const userCol = await usrs();
  let recruiter = await getRecruiter(recruiterId);
  if(recruiter.recFound) {
    let jobList = await getJobsByRecruiterId(recruiterId);
    if(jobList.some(e => jobId === e.job_id.toString())) {
      jobId = new ObjectId(jobId);
      applicantId = new ObjectId(applicantId);
        let recAppUpdate = await recCol.updateOne({_id: new ObjectId(recruiterId)}, {$set: {"jobs.$[job].applicants.$[app].status": "Rejected"}}, {arrayFilters: [{"app.appId": {$eq: applicantId}},{"job.job_id": jobId}]});
        console.log(recAppUpdate);
         if(recAppUpdate.modifiedCount === 1){
           let applicant = await userCol.updateOne({_id: applicantId, "jobs.job": jobId},{$set: {"jobs.$.status": "RRejected"}}, {returnNewDocument: true});
           console.log(applicant);
          // // let applicant = await userCol.updateOne({"_id": new ObjectId(applicantId), "jobs.job": jobId}, {$set: {"jobs.$.status": "Accepted"}})
          // let applicant = await userCol.updateOne({"_id": {$eq: new ObjectId(applicantId)}}, {$set: {"jobs.$[elem].status": "Accepted"}}, {arrayFilters: [{"elem.job": {$eq: jobId}}]})
          if(applicant.modifiedCount === 1) {
            return "Rejected";
          }
        }
      let applicant = await userCol.updateOne({$and: [{"_id": new ObjectId(applicantId)}, {"jobs.job": jobId}]}, {$set: {"jobs.$.status": "Rejected"}})
      if(applicant.modifiedCount === 1) {
        return "Applicant Rejected";
      }else throw new CustomError(500,"Rejection error");
    } else throw new CustomError(403,"Recruiter does not have this job");
  } else throw new CustomError(400,"Recruiter is not present in the database");
}
  //async function sendMail()
  //async function resetPassword() 



module.exports = {
  createRecruiter,
  getRecruiter,
  getJobsByRecruiterId,
  createProfile,
  recruiterCheck,
  updateProfile,
  removeRecruiter,
  postJob,
  updateJob,
  removeJob,
  acceptDecision,
  rejectDecision
}