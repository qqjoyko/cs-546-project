/* Hi all these are the specs for the db connection.

dbname : 'JobHunt_db'

NOTE : please add your variables and specs while implementing here 

PLEASE MAKE SURE YOU ADD THE VARIABLE SPECS HERE AND USE CONSISTENT VARIABLE NAMING IN YOU CODE !!!!!!!!!!!!!!!
PLEASE ADD YOUR NAMES WITH THE VARIABLES AS 

FOR EX.
1) ASHWIN : 
   
   VARIABLENAMEs : users, recruiters, jobs 
   TYPE    : MONGO collection
   FUNCTION : to redirect it to respective data pages 


2) BAPI:

    Bapi add your variable here you don't need to follow the foramat above.


3) YOU:





4) ANDY:





# THIS WILL HELP EVERYBODY FOR DEBUGGING.






AS of now I can think of only four collections

1) USERS
2) RECRUITERS
3) JOBS
4) USERNAME AND PASSWORD STORE WITH RESPECT TO USERS AND RECRUITES :- Key store 

Please refer to the You's spec sheet

#################################################################################

Job
sort()

filter()

search()

viewAll()


##################### CODE STARTS HERE #####################################
*/

// ALL THE IMPORTS HERE

const { ObjectId } = require('mongodb');
const mongoCollections = require('../config/mongoCollections');
const jobs = mongoCollections.jobs;


// to get a single job and display on one html page # detailed job page with apply button on it if the user is authenticated 
async function getJobsById(id) {

    // id check :
    if (!id) throw 'No id provided';
    if(typeof id !== 'string') throw `please provide a valid id`;
    if(id == NaN) throw `id cannot be NaN`;


    const jobCollection = await jobs();
    let res = await jobCollection.findOne({ _id: new ObjectId(id)});
    return res;
  }

// to get all jobs  to display it on the the main page   

async function getAllJobs() {
    const jobCollection = await jobs();
    const userList = await jobCollection.find({}).toArray();
    if (!userList) throw 'No users in system!';
    return userList;
  }


// create Job function for Bapi's use:

async function createJob(recuriterId, recruiterEmail, jobDetails){
    
    // hobDetails validation
    if(!jobDetails) throw `Please provide jobDetails`;
    //let title = jobDetails.title.trim().length
    if(!jobDetails.title || typeof jobDetails.title !== 'string' || jobDetails.title.trim().length < 1) throw `Please provide a valid title`;

    // To add check for allowing full-time, internship, contract, part time.
    if(!jobDetails.type || typeof jobDetails.type !== 'string' || jobDetails.type.trim().length < 1) throw `Please provide a valid JobType`;
    if(!jobDetails.company || typeof jobDetails.company !== 'string' || jobDetails.company.trim().length < 1) throw `Please provide a valid company`;
    if(!jobDetails.title || typeof jobDetails.title !== 'string' || jobDetails.title.trim().length < 1) throw `Please provide a valid title`;
   
    // ###################################### NOTE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // please pass recruiter id in the function.
    if(!recuriterId) throw `please provide recruiter id`;
    // please pass recuriter email in as an argument 
    if(!recruiterEmail) throw `please provide a recruiter email`;

    if(!jobDetails.city || typeof jobDetails.city !== 'string' || jobDetails.city.trim().length < 1) throw `Please provide a valid city`;
    if(!jobDetails.state || typeof jobDetails.state !== 'string' || jobDetails.state.trim().length < 1) throw `Please provide a valid state`;

    if(!jobDetails.details || typeof jobDetails.details !== 'object') throw `Please provide a valid details`;
    
    // to write checfunction for postDate and expiry date.
    // if(!jobDetails.postDate|| typeof jobDetails.postDate !== 'object') throw `please provide a valid post date`;
    let currentDay = new Date();
    // if(!jobDetails.expiryDate|| typeof jobDetails.expiryDate !== 'object'|| +jobDetails.expiryDate < +currentDay) throw `please provide a valid expiry date`;

    if(!jobDetails.details.summary || typeof jobDetails.details.summary !== 'string' || jobDetails.details.summary.trim().length < 1) throw `Please provide a valid summary in details`;

    

    if(!jobDetails.details.description || typeof jobDetails.details.description !== 'string' || jobDetails.details.description.trim().length < 1) throw `Please provide a valid summary in details`;

    if(!jobDetails.details.required || jobDetails.details.required.length < 1 ) throw `Please provide a valid required skilset in details`;

    // yet to implement company pic 

    let newJob = {

        title : jobDetails.title.trim().toLowerCase(),
        type : jobDetails.type.trim().toLowerCase(),
        company : jobDetails.company.trim().toLowerCase(),
        // save the recruiter id as you want
        poster : new ObjectId(recuriterId),
        contact : recruiterEmail.trim().toLowerCase(),
        city : jobDetails.city.trim().toLowerCase(),
        state : jobDetails.state.trim().toLowerCase(),
        postDate : new Date(),
        // expiryDate: jobDetails.expiryDate,
        details : jobDetails.details,
        payRange : jobDetails.payRange,
        
        // companypic to be changed after the upload feature.
        companyPic : false


    }

    const jobCollection = await jobs();
    const insertInfo = await jobCollection.insertOne(newJob);
    if (insertInfo.insertedCount === 0) {
        throw new CustomError(500,'Internal Server Error');
    }

    let new_id = insertInfo.insertedId.toString();


    return await getJobsById(new_id);
}

/*
BAPI : PLEASE REFER HERE FOR THE INPUT FOR THE ABOVE FUNCTION.

let new_details={
    summary: 'h',
    description: 'i',
    required:['z'],
    benefits:'b5'

}
let newJob1 = {

    title : 'a',
    type : 'b',
    company : 'c',
    city : 'd',
    state : 'e',
    postDate : 'f',
    expiryDate: 'g',
    details : new_details,
    payRange : '$$',
    
    // companypic to be changed after the upload feature.
    companyPic : false


}
createJob('61a180136a85d2045f66f91d','aaaa@b.com',newJob1);

*/

async function updateJob(jobId, updatedJob){
    if(!jobId) throw `please provide an id`;

    let currentJob = await getJobsById(jobId);
    if(updatedJob.title){
        if(typeof updatedJob.title !== 'string' || updatedJob.title.trim().length < 1) throw `please provide a valid title`;
        currentJob.title = updatedJob.title.trim().toLowerCase();
    }
    if(updatedJob.type){
        if(typeof updatedJob.type !== 'string' || updatedJob.type.trim().length < 1) throw `please provide a valid type`;
        currentJob.type = updatedJob.type.trim().toLowerCase();
    }

    if(updatedJob.company){
        if(typeof updatedJob.company !== 'string' || updatedJob.company.trim().length < 1) throw `please provide a valid company`;
        currentJob.company = updatedJob.company.trim().toLowerCase();
    }

    if(updatedJob.type){
        if(typeof updatedJob.type !== 'string' || updatedJob.type.trim().length < 1) throw `please provide a valid type`;
        currentJob.type = updatedJob.type.trim().toLowerCase();
    }

    // to bediscussed how to store the dat in MM/DD/YYYY object or string
    
    // if(updatedJob.postDate){
    //     if(typeof updatedJob.postDate !== 'object') throw `please provide a valid type`;
    //     currentJob.postDate = updatedJob.postDate;
    // }

    // if(updatedJob.expiryDate){
    //     if(typeof updatedJob.expiryDate !== 'object') throw `please provide a valid type`;
    //     currentJob.expiryDate = updatedJob.expiryDate;
    // }
    
    if(updatedJob.type){
        if(typeof updatedJob.type !== 'string' || updatedJob.type.trim().length < 1) throw `please provide a valid type`;
        currentJob.type = updatedJob.type.trim().toLowerCase();
    }
    

    if(updatedJob.details){
        if(updatedJob.details.summary){
            if(typeof updatedJob.details.summary !== 'string' || updatedJob.details.summary.trim().length < 1) throw `please provide a valid summary`;
            currentJob.details.summary = updatedJob.details.summary.trim();
        }

        if(updatedJob.details.description){
            if(typeof updatedJob.details.description !== 'string' || updatedJob.details.description.trim().length < 1) throw `please provide a valid summary`;
            currentJob.details.description = updatedJob.details.description.trim();
        }

        if(updatedJob.details.required){
            if(updatedJob.details.required.length < 1) throw `please provide a valid requirement`;
            currentJob.details.required = updatedJob.details.required;
        }
        if(updatedJob.details.benefits){
            if(typeof updatedJob.details.benefits !== 'string' || updatedJob.details.benefits.trim().length < 1) throw `please provide a valid benifits`;
            currentJob.details.benefits = updatedJob.details.benefits.trim();
        }

       
    }

    if(updatedJob.payRange){
        if(typeof updatedJob.payRange !== 'string' || updatedJob.payRange.trim().length < 1) throw `please provide a valid payRange`;
        currentJob.payRange = updatedJob.payRange.trim().toLowerCase();
    }

    /*
    NOT SURE ABOUT COMPANY PIC AS OF NOW WILL DISCUSS THIS LATER!!!!!!!!!!!!!!!!

    if(updatedJob.companyPic){
        if(typeof updatedJob.type !== 'string' || updatedJob.type.trim().length < 1) throw `please provide a valid type`;
        currentJob.type = updatedJob.type.trim().toLowerCase();
    }*/

    const jobCollection = await jobs();
    const updatedInfo  = await jobCollection.updateOne( { _id: new ObjectId(jobId) },{$set: currentJob});

    if (updatedInfo.modifiedCount === 0) {
        throw 'could not update post successfully';
    }

    return currentJob;

}

/*
let new_details={
    summary: 'h',
    benefits:'b5 ashwin'

}
let newJob1 = {

    title : 'ashwin',
    type : 'b ashwin',
    company : 'c',
    postDate : 'f',
    expiryDate: 'gashwin',
    details : new_details,
    payRange : '$$',
    
    // companypic to be changed after the upload feature.
    companyPic : false


}

updateJob('61a265847cab7877aed73e85',newJob1)
*/


async function deleteJob(id) {

    // not sure to pass it as string or ObjectID.
    //id = id.trim();
    let dummy = await getJobsById(id);
    const jobCollection = await jobs();
    const deletionInfo = await jobCollection.deleteOne({ _id: new ObjectId(id) });
    if (deletionInfo.deletedCount === 0) {
      throw `Could not delete restaurant with id of ${id}`;
    }
    return true;
  }

  //deleteJob("61a265847c37bc10cde5dfb8");

// function for searching the jobs by title

async function getJobByTitle(title){
    if(!title) throw `please provide a valid title`;
    
    if(typeof title !== 'string') throw `please provide a valid string`;
    if(title.trim().length < 1) throw `please enter a valid title`;

    const jobCollection = await jobs();
    return await jobCollection
      .find({ title: title.trim().toLowerCase() })
      .toArray();
}

// function to get by location state

async function getJobByState(state){

    if(!state) throw `please provide a valid title`;
    
    if(typeof state !== 'string') throw `please provide a valid state`;
    if(state.trim().length < 1) throw `please enter a valid state`;

    const jobCollection = await jobs();
    return await jobCollection
      .find({ state: state.trim().toLowerCase() })
      .toArray();

}

// function to get by location state

async function getJobByCity(city){

    if(!city) throw `please provide a valid title`;
    if(typeof city !== 'string') throw `please provide a valid string`;
    if(city.trim().length < 1) throw `please enter a valid state`;

    const jobCollection = await jobs();
    return await jobCollection
      .find({ city: city.trim().toLowerCase() })
      .toArray();

}


// function for sorting the db data by date

async function sortByDate(){

    // this will sort the jobs according to the date;
    // need to check this function later again
    const res = await getAllJobs();

    res.sort(function (a, b) {
	
        return a.postDate - b.postDate
    });


    return res;


}


module.exports = {
    getJobsById,
    getAllJobs,
    createJob,
    updateJob,
    deleteJob,
    getJobByTitle,
    getJobByState,
    getJobByCity,
    sortByDate

}  