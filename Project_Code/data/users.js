const mongoCollections = require("../config/mongoCollections");
const jobdata = require("./jobs");
const users = mongoCollections.users;
const recruiters = mongoCollections.recruiters;
const jobs = mongoCollections.jobs;
const userProfiles = mongoCollections.userProfiles;
const chunks = mongoCollections.profileChunks;
let { ObjectId } = require("mongodb");
bcrypt = require("bcrypt");
const saltRounds = 5;

// const checkWeb = (web) => {
// //depends on the url link
// }
function CustomError(status, message) {
  this.status = status;
  this.message = message;
}

const checkEx = (experience) => {
  if (experience === undefined) {
    //optional user deside whether they want to fill in
    return;
  }
  if (!Array.isArray(experience)) {
    throw new CustomError(400, "experience must be an array");
  }
  experience.forEach((ele) => {
    if (
      typeof ele.title != "string" ||
      typeof ele.employmentType != "string" ||
      typeof ele.companyName != "string" ||
      typeof ele.startDate != "string" ||
      typeof ele.endDate != "string"
    ) {
      throw new CustomError(
        400,
        "Value of experience in each elements must be string"
      );
    }
    if (
      ele.title.trim().length === 0 ||
      ele.employmentType.trim().length === 0 ||
      ele.companyName.trim().length === 0 ||
      ele.startDate.trim().length === 0 ||
      ele.endDate.trim().length === 0
    ) {
      // not optional, the user must fill in this data when regiester
      throw new CustomError(
        400,
        "Value of experience in each elements can't be empty or just spaces"
      );
    }
    date_regex = /^(\d{4})-(\d{2})-(\d{2})$/;
    if (!date_regex.test(ele.startDate) && date_regex.test(ele.endDate)) {
      throw new CustomError(400, "Wrong date formate YYYY/MM/DD");
    }
  });
};

const checkEd = (education) => {
  if (education === undefined) {
    //optional user deside whether they want to fill in
    return;
  }
  if (!Array.isArray(education)) {
    throw new CustomError(400, "education must be an array");
  }
  education.forEach((ele) => {
    if (
      typeof ele.school != "string" ||
      typeof ele.major != "string" ||
      typeof ele.degree != "string" ||
      typeof ele.startDate != "string" ||
      typeof ele.endDate != "string"
    ) {
      throw new CustomError(
        400,
        "Value of education in each elements must be string"
      );
    }
    if (
      ele.school.trim().length === 0 ||
      ele.major.trim().length === 0 ||
      ele.degree.trim().length === 0 ||
      ele.startDate.trim().length === 0 ||
      ele.endDate.trim().length === 0
    ) {
      // not optional, the user must fill in this data when regiester
      throw new CustomError(
        400,
        "Value of education in each elements can't be empty or just spaces"
      );
    }
    date_regex = /^(\d{4})-(\d{2})-(\d{2})$/;
    if (!date_regex.test(ele.startDate) && date_regex.test(ele.endDate)) {
      throw new CustomError(400, "Wrong date formate YYYY/MM/DD");
    }
  });
};

const checkSk = (skills) => {
  if (skills === undefined) {
    //optional user deside whether they want to fill in
    return;
  }
  if (!Array.isArray(skills)) {
    throw new CustomError(400, "skills must be an array");
  }
  skills.forEach((ele) => {
    if (typeof ele !== "string" || ele.trim().length === 0) {
      throw new CustomError(400, "skills value must be non-empty string");
    }
  });
};

const checkTa = (tags) => {
  if (tags === undefined) {
    //optional user deside whether they want to fill in
    return;
  }
  if (!Array.isArray(tags)) {
    throw new CustomError(400, "tags must be an array");
  }
  tags.forEach((ele) => {
    if (typeof ele !== "string") {
      throw new CustomError(400, "tags value must be string");
    }
  });
};

const checkLa = (languages) => {
  if (languages === undefined) {
    //optional user deside whether they want to fill in
    return;
  }
  if (!Array.isArray(languages)) {
    throw new CustomError(400, "languages must be an array");
  }
  languages.forEach((ele) => {
    if (typeof ele !== "string") {
      throw new CustomError(400, "languages value must be string");
    }
  });
};

const checkExist = async (email) => {
  const emailCheck = /[A-Z0-9._-]+@[A-Z0-9.-]+\.[A-Z]{2,}/im;
  if (!emailCheck.test(email)) {
    throw new CustomError(400, "Wrong email format");
  }
  const resCollection = await users();
  const res = await resCollection.findOne({ email: email });
  if (res === null) {
    return false;
  }
  return { password: res.password, userId: res._id };
};
const checkDuplicateE = async (email) => {
  const emailCheck = /[A-Z0-9._-]+@[A-Z0-9.-]+\.[A-Z]{2,}/im;
  if (!emailCheck.test(email)) {
    throw new CustomError(400, "Wrong email format");
  }
  const resCollection = await users();
  const res = await resCollection.findOne({ email: email });
  if (res === null) {
    return false;
  }
  return true;
};
const checkDuplicateP = async (phone) => {
  const phoneCheck = /[0-9]{10}/;
  if (!phoneCheck.test(phone)) {
    throw new CustomError(400, "Phone number should be 10 digits");
  }
  const resCollection = await users();
  const res = await resCollection.findOne({ phone: phone });
  if (res === null) {
    return false;
  }
  return true;
};

const getFile = async (fileId) => {
  if (!ObjectId.isValid(fileId) && typeof fileId !== "string") {
    throw new CustomError(400, "Invalid fileId");
  } else {
    fileId = ObjectId(fileId);
  }
  const userProfileCol = await userProfiles();
  const res = await userProfileCol.findOne({ _id: fileId });
  if (res === null) throw new CustomError(400, "file did not exist");
  return res;
};

const addResume = async (userId, fileId) => {
  if (!ObjectId.isValid(fileId) && typeof fileId !== "string") {
    throw new CustomError(400, "Invalid fileId");
  } else {
    fileId = ObjectId(fileId);
  }

  if (!ObjectId.isValid(userId) && typeof userId !== "string") {
    throw new CustomError(400, "Invalid fileId");
  } else {
    userId = ObjectId(userId);
  }

  await getFile(fileId);

  const usersCollection = await users();
  const thisUser = await usersCollection.findOne({ _id: userId });
  if (thisUser === null) throw new CustomError(400, "user did not exist");

  let newResume = thisUser.resume;

  if (newResume.includes(fileId.toString())) {
    throw new CustomError(400, "resume already added");
  }

  newResume.push(fileId.toString());

  const insertInfo = await usersCollection.updateOne(
    { _id: userId },
    { $set: { resume: newResume } }
  );

  if (insertInfo.modifiedCount === 0)
    throw new CustomError(400, "Could not update the user");

  return await get(userId.toString());
};

const getResume = async (userId, jobId) => {
  if (!ObjectId.isValid(jobId) && typeof jobId !== "string") {
    throw new CustomError(400, "Invalid jobId");
  } else {
    jobId = ObjectId(jobId);
  }

  if (!ObjectId.isValid(userId) && typeof userId !== "string") {
    throw new CustomError(400, "Invalid fileId");
  } else {
    userId = ObjectId(userId);
  }

  const usersCollection = await users();
  const thisUser = await usersCollection.findOne({ _id: userId });
  if (thisUser === null) throw new CustomError(400, "applicant did not exist");

  const jobs = thisUser.jobs;
  let fileFound = undefined;
  jobs.forEach((ele) => {
    if (ele._id.toString() === jobId.toString()) {
      fileFound = ele.resume;
    }
  });
  if (!fileFound) {
    throw new CustomError(400, "resume not found");
  } else {
    return fileFound;
  }
};

const removeResume = async (userId, fileId) => {
  if (!ObjectId.isValid(fileId) && typeof fileId !== "string") {
    throw new CustomError(400, "Invalid fileId");
  } else {
    fileId = ObjectId(fileId);
  }

  if (!ObjectId.isValid(userId) && typeof userId !== "string") {
    throw new CustomError(400, "Invalid fileId");
  } else {
    userId = ObjectId(userId);
  }

  await getFile(fileId);

  const usersCollection = await users();
  const thisUser = await usersCollection.findOne({ _id: userId });
  if (thisUser === null) throw new CustomError(400, "user did not exist");

  let newResume = thisUser.resume;

  if (!newResume.includes(fileId.toString())) {
    throw new CustomError(400, "resume not exists");
  }

  if (newResume.length === 1) {
    newResume = [];
  } else {
    newResume = newResume.filter(function (ele) {
      return ele !== fileId.toString();
    });
  }

  const insertInfo = await usersCollection.updateOne(
    { _id: userId },
    { $set: { resume: newResume } }
  );

  if (insertInfo.modifiedCount === 0)
    throw new CustomError(400, "Could not update the user");

  // delete from .files
  const fileCol = await userProfiles();
  try {
    fileCol.deleteOne({ _id: fileId });
  } catch (e) {
    throw new CustomError(400, "error from delete file from file collection");
  }

  // delete from .chunks
  const chunkCol = await chunks();
  try {
    chunkCol.deleteMany({ files_id: fileId });
  } catch (e) {
    throw new CustomError(400, "error from delete file from chunk collection");
  }

  return await get(userId.toString());
};

const getAllResume = async (userId) => {
  if (!ObjectId.isValid(userId) && typeof userId !== "string") {
    throw new CustomError(400, "Invalid fileId");
  } else {
    userId = ObjectId(userId);
  }

  // open two collection
  const usersCollection = await users();

  // find user if not throw
  const thisUser = await usersCollection.findOne({ _id: userId });
  if (thisUser === null) throw new CustomError(400, "user did not exist");
  const resumes = thisUser.resume;

  // check if have resume
  if (resumes.length === 0) throw new CustomError(400, "no resume found");

  return resumes;
};

// const test = async () => {
//   try {
//     // const a = await addResume(
//     //   "61aee25ee978e8a5d47c5ffc",
//     //   "61ae51c711da680d18f74240"
//     // );
//     const a = await removeResume(
//       "61aee25ee978e8a5d47c5ffc",
//       "61aefe42b0b871b69e98a5b5"
//     );
//     console.log(a);
//   } catch (e) {
//     console.log(e);
//   }
//   // try {
//   //   const a = await getFile("61ae4e111168d15491514883");
//   //   console.log(a);
//   // } catch (e) {
//   //   console.log(e);
//   // }
// };
// test();

const createProfile = async (
  userId,
  photo,
  gender,
  city,
  state,
  experience,
  education,
  skills,
  languages,
  tags
) => {
  if (
    typeof userId !== "string" ||
    typeof photo !== "string" ||
    typeof gender !== "string" ||
    typeof city !== "string" ||
    typeof state !== "string"
  ) {
    throw new CustomError(
      400,
      "photo, gender, city must be stirng type and can't be null"
    );
  }
  if (!ObjectId.isValid(userId)) {
    throw new CustomError(400, "Invalid userID");
  } else {
    userId = ObjectId(userId);
  }
  if (
    photo.trim().length === 0 ||
    gender.trim().length === 0 ||
    city.trim().length === 0 ||
    state.trim().length === 0
  ) {
    throw new CustomError(
      400,
      "photo, gender, city can't be empty or just spaces"
    );
  }
  if (gender !== "M" && gender !== "F") {
    throw new CustomError(400, "gender must be M(male) or F(female)");
  }
  //checkWeb(photo);
  checkEx(experience);
  checkEd(education);
  checkSk(skills);
  checkTa(tags);
  checkLa(languages);
  const usersCollection = await users();
  //let _id = ObjectId();
  let newProfiles = {
    //_id,
    photo,
    gender,
    city,
    state,
    experience,
    education,
    skills,
    languages,
    tags,
  };
  const insertInfo = await usersCollection.updateOne(
    { _id: userId },
    { $set: { profile: newProfiles } }
  );
  if (insertInfo.modifiedCount === 0)
    throw new CustomError(400, "Could not add the profile");
};

const create = async (email, phone, firstName, lastName, password) => {
  if (
    typeof email !== "string" ||
    typeof phone !== "string" ||
    typeof firstName !== "string" ||
    typeof lastName !== "string" ||
    typeof password !== "string"
  ) {
    throw new CustomError(
      400,
      "user's email, phone. firstName, lastName, password must be string"
    );
  }
  if (
    email.trim().length === 0 ||
    phone.trim().length === 0 ||
    firstName.trim().length === 0 ||
    lastName.trim().length === 0 ||
    password.trim().length === 0
  ) {
    throw new CustomError(
      400,
      "uesr's email, phone. firstName, lastName, password can't be empty or just spaces"
    );
  }
  const emailCheck = /[A-Z0-9._-]+@[A-Z0-9.-]+\.[A-Z]{2,}/im;
  if (!emailCheck.test(email)) {
    throw new CustomError(400, "Wrong email format");
  }
  const phoneCheck = /[0-9]{10}/;
  if (!phoneCheck.test(phone)) {
    throw new CustomError(400, "Phone number should be 10 digits");
  }
  // if (newProfile !== undefined && !Array.isArray(newProfile)) {
  //   throw new CustomError(400, "Profile must be array");
  // }
  if ((await checkDuplicateP(phone)) || (await checkDuplicateE(email))) {
    throw new CustomError(
      400,
      "phone number or email has been used, please try another one"
    );
  }
  const jobs = [];
  const resume = [];
  const favor = [];
  const hash = await bcrypt.hash(password, saltRounds);
  const usersCollection = await users();
  email = email.trim().toLowerCase();
  let newUser = {
    email,
    phone,
    firstName,
    lastName,
    password: hash,
    jobs,
    resume,
    profile: {},
    favor,
  };
  const insertInfo = await usersCollection.insertOne(newUser);
  if (!insertInfo.acknowledged) throw "Could not add the User";
  return insertInfo.insertedId;
};


const update = async (userId, email, phone, firstName, lastName, password) => {
  if (
    typeof userId !== "string" ||
    typeof email !== "string" ||
    typeof phone !== "string" ||
    typeof firstName !== "string" ||
    typeof lastName !== "string" ||
    typeof password !== "string"
  ) {
    throw new CustomError(
      400,
      "user's email, phone. firstName, lastName, password must be string"
    );
  }

  if (
    userId.trim().length === 0 ||
    email.trim().length === 0 ||
    phone.trim().length === 0 ||
    firstName.trim().length === 0 ||
    lastName.trim().length === 0 ||
    password.trim().length === 0
  ) {
    throw new CustomError(
      400,
      "uesr's email, phone. firstName, lastName, password can't be empty or just spaces"
    );
  }
  const emailCheck = /[A-Z0-9._-]+@[A-Z0-9.-]+\.[A-Z]{2,}/im;
  if (!emailCheck.test(email)) {
    throw new CustomError(400, "Wrong email format");
  }
  const phoneCheck = /[0-9]{10}/;
  if (!phoneCheck.test(phone)) {
    throw new CustomError(400, "Wrong phoneNo format xxx-xxx-xxxx");
  }
  if (!ObjectId.isValid(userId)) {
    throw new CustomError(400, "Invalid userID");
  } else {
    userId = ObjectId(userId);
  }
  if ((await checkDuplicateP(phone)) || (await checkDuplicateE(email))) {
    throw new CustomError(
      400,
      "the email or phone number has already been used"
    );
  }
  const hash = await bcrypt.hash(password, saltRounds);
  const usersCollection = await users();
  let newUser = {
    email,
    phone,
    firstName,
    lastName,
    password: hash,
  };
  const insertInfo = await usersCollection.updateOne(
    { _id: userId },
    { $set: newUser }
  );
  if (insertInfo.modifiedCount === 0)
    throw new CustomError(400, "Could not update the user");
};

const remove = async (userId) => {
  if (!userId) {
    throw new CustomError(400, "id must be provided");
  }
  if (typeof userId !== "string" || userId.trim().length === 0) {
    throw new CustomError(
      400,
      "the userId must be non-empty string and can't just be space"
    );
  }
  if (!ObjectId.isValid(userId)) {
    throw new CustomError(400, "Invalid userID");
  } else {
    userId = ObjectId(userId);
  }
  const usersCollection = await users();
  const deletionInfo = await usersCollection.deleteOne({ _id: userId });
  if (deletionInfo.deletedCount === 0) {
    throw new CustomError(400, `Could not delete user with id: ${id}`);
  }
  //**********************remove jobId in is not necessary here
};

const auxApply = async (jobId, userId) => {
  // this function is for seed databases
  if (!userId || !jobId) {
    throw new CustomError(400, "id must be provided");
  }
  if (typeof userId !== "string" || userId.trim().length === 0) {
    throw new CustomError(
      400,
      "the userId must be non-empty string and can't just be space"
    );
  }
  if (typeof jobId !== "string" || jobId.trim().length === 0) {
    throw new CustomError(
      400,
      "the jobId must be non-empty string and can't just be space"
    );
  }

  if (!ObjectId.isValid(userId)) {
    throw new CustomError(400, "Invalid userID");
  } else {
    userId = ObjectId(userId);
  }
  if (!ObjectId.isValid(jobId)) {
    throw new CustomError(400, "Invalid jobId");
  } else {
    jobId = ObjectId(jobId);
  }

  const usersCollection = await users();
  const thisUser = await usersCollection.findOne({ _id: userId });
  let thisJobs = thisUser.jobs;

  thisJobs.forEach((ele) => {
    if (ele._id.toString() === jobId.toString()) {
      throw new CustomError(400, "You have already applied for it");
    }
  });

  let newjob = {
    _id: jobId,
    status: "pending",
  };

  const insertInfo = await usersCollection.updateOne(
    { _id: userId },
    { $addToSet: { jobs: newjob } }
  );
  if (insertInfo.modifiedCount === 0)
    throw new CustomError(400, "Could not apply this job for now");

  //*****************recruiter collection update userId to applicantId.
  const recruiterCol = await recruiters();
  const jobCol = await jobs();

  // find job, then find recruiter
  const thisJob = await jobCol.findOne({ _id: jobId });
  const posterId = thisJob.poster;
  const thisPoster = await recruiterCol.findOne({ _id: posterId });
  // find the job under this recruiter and add one
  let posterJobs = thisPoster.jobs;
  // let posterJob2 = posterJobs.map((a) => {
  //   return { ...a };
  // });
  posterJobs.forEach((ele) => {
    if (ele.job_id.toString() === jobId.toString()) {
      ele.applicants.push({ appId: userId, status: "pending" });
    }
  });
  const insertInfo2 = await recruiterCol.updateOne(
    { _id: posterId },
    { $set: { jobs: posterJobs } }
  );
  if (insertInfo2.modifiedCount === 0)
    throw new CustomError(400, "Could not apply this job for now");
};

const apply = async (jobId, userId, fileId) => {
  if (!userId || !jobId || !fileId) {
    throw new CustomError(400, "id must be provided");
  }
  if (typeof userId !== "string" || userId.trim().length === 0) {
    throw new CustomError(
      400,
      "the userId must be non-empty string and can't just be space"
    );
  }
  if (typeof jobId !== "string" || jobId.trim().length === 0) {
    throw new CustomError(
      400,
      "the jobId must be non-empty string and can't just be space"
    );
  }

  if (typeof fileId !== "string" || jobId.trim().length === 0) {
    throw new CustomError(
      400,
      "the jobId must be non-empty string and can't just be space"
    );
  }

  if (!ObjectId.isValid(userId)) {
    throw new CustomError(400, "Invalid userID");
  } else {
    userId = ObjectId(userId);
  }
  if (!ObjectId.isValid(jobId)) {
    throw new CustomError(400, "Invalid jobId");
  } else {
    jobId = ObjectId(jobId);
  }

  if (!ObjectId.isValid(fileId)) {
    throw new CustomError(400, "Invalid jobId");
  } else {
    jobId = ObjectId(jobId);
  }

  const usersCollection = await users();
  const thisUser = await usersCollection.findOne({ _id: userId });
  let thisJobs = thisUser.jobs;

  thisJobs.forEach((ele) => {
    if (ele._id.toString() === jobId.toString()) {
      throw new CustomError(400, "You have already applied for it");
    }
  });

  let newjob = {
    _id: jobId,
    status: "pending",
    resume: fileId,
  };

  const insertInfo = await usersCollection.updateOne(
    { _id: userId },
    { $addToSet: { jobs: newjob } }
  );
  if (insertInfo.modifiedCount === 0)
    throw new CustomError(400, "Could not apply this job for now");

  //*****************recruiter collection update userId to applicantId.
  const recruiterCol = await recruiters();
  const jobCol = await jobs();

  // find job, then find recruiter
  const thisJob = await jobCol.findOne({ _id: jobId });
  const posterId = thisJob.poster;
  const thisPoster = await recruiterCol.findOne({ _id: posterId });
  // find the job under this recruiter and add one
  let posterJobs = thisPoster.jobs;
  // let posterJob2 = posterJobs.map((a) => {
  //   return { ...a };
  // });
  posterJobs.forEach((ele) => {
    if (ele.job_id.toString() === jobId.toString()) {
      ele.applicants.push({ appId: userId, status: "pending" });
    }
  });
  const insertInfo2 = await recruiterCol.updateOne(
    { _id: posterId },
    { $set: { jobs: posterJobs } }
  );
  if (insertInfo2.modifiedCount === 0)
    throw new CustomError(400, "Could not apply this job for now");
};

const Favorites = async (jobId, userId) => {
  if (!userId || !jobId) {
    throw new CustomError(400, "id must be provided");
  }
  if (typeof userId !== "string" || userId.trim().length === 0) {
    throw new CustomError(
      400,
      "the userId must be non-empty string and can't just be space"
    );
  }
  if (typeof jobId !== "string" || jobId.trim().length === 0) {
    throw new CustomError(
      400,
      "the jobId must be non-empty string and can't just be space"
    );
  }
  if (!ObjectId.isValid(userId)) {
    throw new CustomError(400, "Invalid userID");
  } else {
    userId = ObjectId(userId);
  }
  if (!ObjectId.isValid(jobId)) {
    throw new CustomError(400, "Invalid jobId");
  } else {
    jobId = ObjectId(jobId);
  }
  const usersCollection = await users();
  const insertInfo = await usersCollection.updateOne(
    { _id: userId },
    { $addToSet: { favor: jobId } }
  );
  if (insertInfo.modifiedCount === 0)
    throw new CustomError(
      400,
      "Could not add the favor job,  the job is already exists or user doesn't exist"
    );
};

const getFavourites = async (userId) => {
  if (!userId) {
    throw new CustomError(400, "id must be provided");
  }
  if (typeof userId !== "string") {
    throw new CustomError(
      400,
      "the userId must be non-empty string and can't just be space"
    );
  }
  if (!ObjectId.isValid(userId)) {
    throw new CustomError(400, "Invalid userID");
  } else {
    userId = ObjectId(userId);
  }
  const usersCollection = await users();
  const res = await usersCollection.findOne({ _id: userId });
  if (res === null) throw new CustomError(400, "user did not exists");

  // manipulating the return data here

  const jobAllData = await jobdata.getAllJobs();

  const allFavourJobs = [];

  for (let i = 0; i < res.favor.length; i++) {
    for (let j = 0; j < jobAllData.length; j++) {


      if (String(jobAllData[j]._id) == String(res.favor[i])) {
        allFavourJobs.push(jobAllData[j]);
        break;
      }
    }
  }

  return allFavourJobs;
};

const delFavourites = async (jobId, userId) => {
  if (!userId || !jobId) {
    throw new CustomError(400, "id must be provided");
  }
  if (typeof userId !== "string" || userId.trim().length === 0) {
    throw new CustomError(
      400,
      "the userId must be non-empty string and can't just be space"
    );
  }
  if (typeof jobId !== "string" || jobId.trim().length === 0) {
    throw new CustomError(
      400,
      "the jobId must be non-empty string and can't just be space"
    );
  }
  if (!ObjectId.isValid(userId)) {
    throw new CustomError(400, "Invalid userID");
  } else {
    userId = ObjectId(userId);
  }
  if (!ObjectId.isValid(jobId)) {
    throw new CustomError(400, "Invalid jobId");
  } else {
    jobId = ObjectId(jobId);
  }
  const usersCollection = await users();
  const deleteInfo = await usersCollection.updateOne(
    { _id: userId },
    { $pull: { favor: jobId } }
  );
  if (!deleteInfo.modifiedCount) {
    throw new CustomError(400, "remove favor failed");
  }
};

const cancel = async (jobId, userId) => {
  if (!userId || !jobId) {
    throw new CustomError(400, "id must be provided");
  }
  if (typeof userId !== "string" || userId.trim().length === 0) {
    throw new CustomError(
      400,
      "the userId must be non-empty string and can't just be space"
    );
  }
  if (typeof jobId !== "string" || jobId.trim().length === 0) {
    throw new CustomError(
      400,
      "the jobId must be non-empty string and can't just be space"
    );
  }
  if (!ObjectId.isValid(userId)) {
    throw new CustomError(400, "Invalid userID");
  } else {
    userId = ObjectId(userId);
  }
  if (!ObjectId.isValid(jobId)) {
    throw new CustomError(400, "Invalid jobId");
  } else {
    jobId = ObjectId(jobId);
  }

  const usersCollection = await users();
  const insertInfo1 = await usersCollection.updateOne(
    { _id: userId },
    { $pull: { jobs: { _id: jobId } } }
  );
  if (insertInfo1.modifiedCount === 0)
    throw new CustomError(
      400,
      "Could not add the profile, the job is already exists or user doesn't exist"
    );

  // remove applicant from recruiter's collection
  const jobCol = await jobs();
  const thisJob = await jobCol.findOne({ _id: jobId });
  const recruiterId = thisJob.poster;
  const recruiterCol = await recruiters();
  const tmpInfo = await recruiterCol.findOne(
    { _id: recruiterId },
    { _id: 0, jobs: { $elemMatch: { job_id: jobId } } }
  );
  if (!tmpInfo) {
    throw new CustomError(400, "the recruiter does not exists");
  }
  let jobstmp = tmpInfo.jobs;
  let tmp1 = jobstmp.filter(
    (ele) => ele.job_id.toString() !== jobId.toString()
  ); //ele.appId.toString() === userId.toString();
  let tmp2 = jobstmp.find((ele) => ele.job_id.toString() === jobId.toString());
  let tmp3 = tmp2.applicants.filter(
    (ele) => ele.appId.toString() !== userId.toString()
  );

  tmp1.push({ job_id: tmp2.job_id, applicants: tmp3 });
  const insertInfo = await recruiterCol.updateOne(
    { _id: recruiterId },
    { $set: { jobs: tmp1 } }
  );
  if (insertInfo.modifiedCount === 0) {
    throw new CustomError(400, "Could not apply cancel job for now");
  }
};

const track = async (userId) => {
  if (!userId) {
    throw new CustomError(400, "id must be provided");
  }
  if (typeof userId !== "string") {
    throw new CustomError(
      400,
      "the userId must be non-empty string and can't just be space"
    );
  }
  if (!ObjectId.isValid(userId)) {
    throw new CustomError(400, "Invalid userID");
  } else {
    userId = ObjectId(userId);
  }
  const usersCollection = await users();
  const res = await usersCollection.findOne({ _id: userId });
  if (res === null) throw new CustomError(400, "user did not exists");

  // get job title
  const jobCol = await jobs();
  let jobInfo = res.jobs;
  for (const ele of jobInfo) {
    let job = await jobCol.findOne({ _id: ele._id });
    ele.title = job.title;
    ele.type = job.type;
    ele.location = `${job.city}, ${job.state}`;
    ele.summary = job.details.summary;
  }
  return jobInfo;
};

const get = async (userId) => {
  if (!userId) {
    throw new CustomError(400, "id must be provided");
  }

  if (typeof userId !== "string") {
    throw new CustomError(
      400,
      "the userId must be non-empty string and can't just be space"
    );
  }

  if (!ObjectId.isValid(userId)) {
    throw new CustomError(400, "Invalid userID");
  } else {
    userId = ObjectId(userId);
  }
  const usersCollection = await users();
  const res = await usersCollection.findOne({ _id: userId });
  if (res === null) throw new CustomError(400, "user did not exists");
  return res;
};

const getAll = async () => {
  const usersCollection = await users();
  const res = await usersCollection.find({}).toArray();
  return res;
};

const checkUser = async (email, password) => {
  if (typeof email !== "string" || typeof password !== "string") {
    throw new CustomError(400, "email and passwork must be string");
  }
  email = email.trim().toLowerCase();
  password = password.trim();
  if (email.length === 0 || password.length === 0) {
    throw new CustomError(
      400,
      "email and passwork must be non empty string and can't just be space"
    );
  }

  if (password.length < 6) {
    throw new CustomError(400, "password must be longer than 6");
  }
  if (password.indexOf(" ") >= 0) {
    throw new CustomError(400, "password can't contain space");
  }
  const emailCheck = /[A-Z0-9._-]+@[A-Z0-9.-]+\.[A-Z]{2,}/im;
  if (!emailCheck.test(email)) {
    throw new CustomError(400, "Wrong email format");
  }
  let tmp = await checkExist(email);
  if (!tmp) {
    throw new CustomError(400, "Either the email or password is invalid");
  }
  let compareToMerlin = false;
  try {
    compareToMerlin = await bcrypt.compare(password, tmp.password);
  } catch (e) {
    throw new CustomError(400, "inner error");
  }
  if (compareToMerlin) {
    return { authenticated: true, id: tmp.userId };
  } else {
    throw new CustomError(400, "Either the email or password is invalid");
  }
};

const editProfile = async (userId, gender, city, state) => {
  if (
    typeof userId !== "string" ||
    typeof gender !== "string" ||
    typeof city !== "string" ||
    typeof state !== "string"
  ) {
    throw new CustomError(
      400,
      "gender, city must be stirng type and can't be null"
    );
  }
  if (!ObjectId.isValid(userId)) {
    throw new CustomError(400, "Invalid userID");
  } else {
    userId = ObjectId(userId);
  }
  if (
    gender.trim().length === 0 ||
    city.trim().length === 0 ||
    state.trim().length === 0
  ) {
    throw new CustomError(
      400,
      "gender, city, state can't be empty or just spaces"
    );
  }
  if (gender !== "M" && gender !== "F" && gender !== "U") {
    throw new CustomError(
      400,
      "gender must be M(male) or F(female) or U(unwilling to say)"
    );
  }
  const usersCollection = await users();
  //let _id = ObjectId();
  // let newProfiles = {
  //   gender,
  //   city,
  //   state,
  // };
  const insertInfo = await usersCollection.updateOne(
    { _id: userId },
    {
      $set: {
        "profile.gender": gender,
        "profile.city": city,
        "profile.state": state,
      },
    }
  );
  if (insertInfo.modifiedCount === 0) {
    throw new CustomError(400, "Could not add the profile");
  }
  return insertInfo.acknowledged;
};

const getEx = async (userId) => {
  if (!userId) {
    throw new CustomError(400, "id must be provided");
  }
  if (typeof userId !== "string") {
    throw new CustomError(
      400,
      "the userId must be non-empty string and can't just be space"
    );
  }
  if (!ObjectId.isValid(userId)) {
    throw new CustomError(400, "Invalid userID");
  } else {
    userId = ObjectId(userId);
  }
  const usersCollection = await users();
  const res = await usersCollection.findOne({ _id: userId });
  if (res === null) throw new CustomError(400, "user did not exists");
  return res.profile.experience;
};

const addEx = async (experience, userId) => {
  if (!userId) {
    throw new CustomError(400, "id must be provided");
  }
  if (typeof userId !== "string") {
    throw new CustomError(
      400,
      "the userId must be non-empty string and can't just be space"
    );
  }
  if (!ObjectId.isValid(userId)) {
    throw new CustomError(400, "Invalid userID");
  } else {
    userId = ObjectId(userId);
  }
  if (
    typeof experience.title != "string" ||
    typeof experience.employmentType != "string" ||
    typeof experience.companyName != "string" ||
    typeof experience.startDate != "string" ||
    typeof experience.endDate != "string"
  ) {
    throw new CustomError(
      400,
      "Value of experience in each elements must be string"
    );
  }
  if (
    experience.title.trim().length === 0 ||
    experience.employmentType.trim().length === 0 ||
    experience.companyName.trim().length === 0 ||
    experience.startDate.trim().length === 0 ||
    experience.endDate.trim().length === 0
  ) {
    // not optional, the user must fill in this data when regiester
    throw new CustomError(
      400,
      "Value of experience in each elements can't be empty or just spaces"
    );
  }
  date_regex = /^(\d{4})-(\d{2})-(\d{2})$/;
  if (
    !date_regex.test(experience.startDate) &&
    date_regex.test(experience.endDate)
  ) {
    throw new CustomError(400, "Wrong date formate YYYY/MM/DD");
  }
  if (new Date(experience.startDate) > new Date(experience.endDate)) {
    throw new CustomError(400, "Invalid start date and end date");
  }
  let today = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate()
  );
  if (
    new Date(experience.startDate) > today ||
    new Date(experience.endDate) > today
  ) {
    throw new CustomError(
      400,
      "start date and end date can't be later than today"
    );
  }
  const usersCollection = await users();
  const insertInfo = await usersCollection.updateOne(
    { _id: userId },
    { $addToSet: { "profile.experience": experience } }
  );
  if (insertInfo.modifiedCount === 0)
    throw new CustomError(400, "Could not update the experience");
  return insertInfo.acknowledged;
};

const delEx = async (companyName, userId) => {
  if (!userId) {
    throw new CustomError(400, "id must be provided");
  }
  if (typeof userId !== "string") {
    throw new CustomError(
      400,
      "the userId must be non-empty string and can't just be space"
    );
  }
  if (!ObjectId.isValid(userId)) {
    throw new CustomError(400, "Invalid userID");
  } else {
    userId = ObjectId(userId);
  }
  if (typeof companyName != "string" || companyName.trim().length === 0) {
    throw new CustomError(400, "Value of companyName must be non-empty string");
  }
  const usersCollection = await users();
  const insertInfo = await usersCollection.updateOne(
    { _id: userId },
    { $pull: { "profile.experience": { companyName: companyName } } }
  );
  if (insertInfo.modifiedCount === 0)
    throw new CustomError(400, "Could not del the experience");
  return insertInfo.acknowledged;
};

const getEdu = async (userId) => {
  if (!userId) {
    throw new CustomError(400, "id must be provided");
  }
  if (typeof userId !== "string") {
    throw new CustomError(
      400,
      "the userId must be non-empty string and can't just be space"
    );
  }
  if (!ObjectId.isValid(userId)) {
    throw new CustomError(400, "Invalid userID");
  } else {
    userId = ObjectId(userId);
  }
  const usersCollection = await users();
  const res = await usersCollection.findOne({ _id: userId });
  if (res === null) throw new CustomError(400, "user did not exists");
  return res.profile.education;
};

const addEdu = async (education, userId) => {
  if (!userId) {
    throw new CustomError(400, "id must be provided");
  }
  if (typeof userId !== "string") {
    throw new CustomError(
      400,
      "the userId must be non-empty string and can't just be space"
    );
  }
  if (!ObjectId.isValid(userId)) {
    throw new CustomError(400, "Invalid userID");
  } else {
    userId = ObjectId(userId);
  }
  if (education === undefined) {
    throw new CustomError(400, "education is not provided");
  }
  if (
    typeof education.school != "string" ||
    typeof education.major != "string" ||
    typeof education.degree != "string" ||
    typeof education.startDate != "string" ||
    typeof education.endDate != "string"
  ) {
    throw new CustomError(
      400,
      "Value of education in each elements must be string"
    );
  }
  if (
    education.school.trim().length === 0 ||
    education.major.trim().length === 0 ||
    education.degree.trim().length === 0 ||
    education.startDate.trim().length === 0 ||
    education.endDate.trim().length === 0
  ) {
    // not optional, the user must fill in this data when regiester
    throw new CustomError(
      400,
      "Value of education in each elements can't be empty or just spaces"
    );
  }
  date_regex = /^(\d{4})-(\d{2})-(\d{2})$/;
  if (
    !date_regex.test(education.startDate) &&
    date_regex.test(education.endDate)
  ) {
    throw new CustomError(400, "Wrong date formate YYYY/MM/DD");
  }
  if (new Date(education.startDate) > new Date(education.endDate)) {
    throw new CustomError(400, "Invalid start date and end date");
  }
  let today = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate()
  );
  if (
    new Date(education.startDate) > today ||
    new Date(education.endDate) > today
  ) {
    throw new CustomError(
      400,
      "start date and end date can't be later than today"
    );
  }
  const usersCollection = await users();
  const insertInfo = await usersCollection.updateOne(
    { _id: userId },
    { $addToSet: { "profile.education": education } }
  );
  if (insertInfo.modifiedCount === 0)
    throw new CustomError(400, "Could not update the education");
  return insertInfo.acknowledged;
};
const delEdu = async (school, userId) => {
  if (!userId) {
    throw new CustomError(400, "id must be provided");
  }
  if (typeof userId !== "string") {
    throw new CustomError(
      400,
      "the userId must be non-empty string and can't just be space"
    );
  }
  if (!ObjectId.isValid(userId)) {
    throw new CustomError(400, "Invalid userID");
  } else {
    userId = ObjectId(userId);
  }
  if (typeof school != "string" || school.trim().length === 0) {
    throw new CustomError(400, "Value of school must be non-empty string");
  }
  const usersCollection = await users();
  const insertInfo = await usersCollection.updateOne(
    { _id: userId },
    { $pull: { "profile.education": { school: school } } }
  );
  if (insertInfo.modifiedCount === 0)
    throw new CustomError(400, "Could not del the education");
  return insertInfo.acknowledged;
};

const getSk = async (userId) => {
  if (!userId) {
    throw new CustomError(400, "id must be provided");
  }
  if (typeof userId !== "string") {
    throw new CustomError(
      400,
      "the userId must be non-empty string and can't just be space"
    );
  }
  if (!ObjectId.isValid(userId)) {
    throw new CustomError(400, "Invalid userID");
  } else {
    userId = ObjectId(userId);
  }
  const usersCollection = await users();
  const res = await usersCollection.findOne({ _id: userId });
  if (res === null) throw new CustomError(400, "user did not exists");
  return res.profile.skills;
};

const addSk = async (skill, userId) => {
  if (!userId) {
    throw new CustomError(400, "id must be provided");
  }
  if (typeof userId !== "string") {
    throw new CustomError(
      400,
      "the userId must be non-empty string and can't just be space"
    );
  }
  if (!ObjectId.isValid(userId)) {
    throw new CustomError(400, "Invalid userID");
  } else {
    userId = ObjectId(userId);
  }
  if (typeof skill !== "string" || skill.trim().length === 0) {
    throw new CustomError(400, "skill value must be non-empty string");
  }
  const usersCollection = await users();
  const insertInfo = await usersCollection.updateOne(
    { _id: userId },
    { $addToSet: { "profile.skills": skill } }
  );
  if (insertInfo.modifiedCount === 0)
    throw new CustomError(400, "Could not update the skills");
  return insertInfo.acknowledged;
};
const delSk = async (skill, userId) => {
  if (!userId) {
    throw new CustomError(400, "id must be provided");
  }
  if (typeof userId !== "string") {
    throw new CustomError(
      400,
      "the userId must be non-empty string and can't just be space"
    );
  }
  if (!ObjectId.isValid(userId)) {
    throw new CustomError(400, "Invalid userID");
  } else {
    userId = ObjectId(userId);
  }
  if (typeof skill != "string" || skill.trim().length === 0) {
    throw new CustomError(400, "Value of skill must be non-empty string");
  }
  const usersCollection = await users();
  const insertInfo = await usersCollection.updateOne(
    { _id: userId },
    { $pull: { "profile.skills": skill } }
  );
  if (insertInfo.modifiedCount === 0)
    throw new CustomError(400, "Could not del the education");
  return insertInfo.acknowledged;
};

const getLa = async (userId) => {
  if (!userId) {
    throw new CustomError(400, "id must be provided");
  }
  if (typeof userId !== "string") {
    throw new CustomError(
      400,
      "the userId must be non-empty string and can't just be space"
    );
  }
  if (!ObjectId.isValid(userId)) {
    throw new CustomError(400, "Invalid userID");
  } else {
    userId = ObjectId(userId);
  }
  const usersCollection = await users();
  const res = await usersCollection.findOne({ _id: userId });
  if (res === null) throw new CustomError(400, "user did not exists");
  return res.profile.languages;
};

const addLa = async (languages, userId) => {
  if (!userId) {
    throw new CustomError(400, "id must be provided");
  }
  if (typeof userId !== "string") {
    throw new CustomError(
      400,
      "the userId must be non-empty string and can't just be space"
    );
  }
  if (!ObjectId.isValid(userId)) {
    throw new CustomError(400, "Invalid userID");
  } else {
    userId = ObjectId(userId);
  }
  if (typeof languages !== "string" || languages.trim().length === 0) {
    throw new CustomError(400, "languages value must be non-empty string");
  }
  const usersCollection = await users();
  const insertInfo = await usersCollection.updateOne(
    { _id: userId },
    { $addToSet: { "profile.languages": languages } }
  );
  if (insertInfo.modifiedCount === 0)
    throw new CustomError(400, "Could not update the skills");
  return insertInfo.acknowledged;
};

const delLa = async (language, userId) => {
  if (!userId) {
    throw new CustomError(400, "id must be provided");
  }
  if (typeof userId !== "string") {
    throw new CustomError(
      400,
      "the userId must be non-empty string and can't just be space"
    );
  }
  if (!ObjectId.isValid(userId)) {
    throw new CustomError(400, "Invalid userID");
  } else {
    userId = ObjectId(userId);
  }
  if (typeof language != "string" || language.trim().length === 0) {
    throw new CustomError(400, "Value of language must be non-empty string");
  }
  const usersCollection = await users();
  const insertInfo = await usersCollection.updateOne(
    { _id: userId },
    { $pull: { "profile.languages": language } }
  );
  if (insertInfo.modifiedCount === 0)
    throw new CustomError(400, "Could not del the language");
  return insertInfo.acknowledged;
};
module.exports = {
  create,
  getFile,
  addResume,
  createProfile,
  update,
  remove,
  Favorites,
  getFavourites,
  delFavourites,
  cancel,
  track,
  get,
  getAll,
  checkUser,
  getAllResume,
  removeResume,
  editProfile,
  getEx,
  addEx,
  delEx,
  getEdu,
  addEdu,
  delEdu,
  getSk,
  addSk,
  delSk,
  getLa,
  addLa,
  delLa,
  getResume,
  apply,
  auxApply,
};

