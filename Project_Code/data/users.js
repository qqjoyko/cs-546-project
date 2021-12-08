const mongoCollections = require("../config/mongoCollections");
const users = mongoCollections.users;
const userProfiles = mongoCollections.userProfiles;
let { ObjectId } = require("mongodb");
bcrypt = require("bcrypt");
const saltRounds = 8;

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
    date_regex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!date_regex.test(ele.startDate) && date_regex.test(ele.endDate)) {
      throw new CustomError(400, "Wrong date formate MM/DD/YYYY");
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
    date_regex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!date_regex.test(ele.startDate) && date_regex.test(ele.endDate)) {
      throw new CustomError(400, "Wrong date formate MM/DD/YYYY");
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
    if (typeof ele !== "string") {
      throw new CustomError(400, "skills value must be string");
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
}
const checkDuplicateP = async(phone) => {
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
}
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

  newResume = newResume.filter(function (ele) {
    return ele !== fileId.toString();
  });

  const insertInfo = await usersCollection.updateOne(
    { _id: userId },
    { $set: { resume: newResume } }
  );

  if (insertInfo.modifiedCount === 0)
    throw new CustomError(400, "Could not update the user");

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
    throw new CustomError(400, "photo, gender, city must be stirng type and can't be null");
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
    throw new CustomError(400, "name, location, phoneNumber, website, priceRange can't be empty or just spaces");
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
  if (insertInfo.modifiedCount === 0) throw new CustomError(400, "Could not add the profile");
};

const create = async (
  email,
  phone,
  firstname,
  lastname,
  password,
) => {
  if (
    typeof email !== "string" ||
    typeof phone !== "string" ||
    typeof firstname !== "string" ||
    typeof lastname !== "string" ||
    typeof password !== "string"
  ) {
    throw new CustomError(
      400,
      "user's email, phone. firstname, lastname, password must be string"
    );
  }
  if (
    email.trim().length === 0 ||
    phone.trim().length === 0 ||
    firstname.trim().length === 0 ||
    lastname.trim().length === 0 ||
    password.trim().length === 0
  ) {
    throw new CustomError(
      400,
      "uesr's email, phone. firstname, lastname, password can't be empty or just spaces"
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
  if (await checkDuplicateP(phone) || await checkDuplicateE(email)) {
    throw new CustomError(400, "user already exists");
  }
  const jobs = [];
  const resume = [];
  const favor = [];
  const hash = await bcrypt.hash(password, saltRounds);
  const usersCollection = await users();
  let newUser = {
    email,
    phone,
    firstname,
    lastname,
    password: hash,
    jobs,
    resume,
    profile:{},
    favor,
  };
  const insertInfo = await usersCollection.insertOne(newUser);
  if (!insertInfo.acknowledged) throw "Could not add the User";
  return insertInfo.insertedId;
};

// const updateProfile = async (
//   profileId,
//   userId,
//   photo,
//   gender,
//   city,
//   state,
//   experience,
//   education,
//   skills,
//   languages,
//   tags
// ) => {
//   if (
//     typeof userId !== "string" ||
//     typeof photo !== "string" ||
//     typeof gender !== "string" ||
//     typeof city !== "string" ||
//     typeof state !== "string"
//   ) {
//     throw new CustomError(
//       400,
//       "photo, gender, city must be stirng type and can't be null"
//     );
//   }
//   if (!ObjectId.isValid(userId)) {
//     throw new CustomError(400, "Invalid userID");
//   } else {
//     userId = ObjectId(userId);
//   }
//   if (!ObjectId.isValid(profileId)) {
//     throw new CustomError(400, "Invalid profileId");
//   } else {
//     profileId = ObjectId(profileId);
//   }
//   if (
//     photo.trim().length === 0 ||
//     gender.trim().length === 0 ||
//     city.trim().length === 0 ||
//     state.trim().length === 0
//   ) {
//     // not optional, the user must fill in this data when regiester
//     throw new CustomError(
//       400,
//       "name, location, phoneNumber, website, priceRange can't be empty or just spaces"
//     );
//   }
//   if (gender !== "M" && gender !== "F") {
//     throw new CustomError(400, "gender must be M(male) or F(female)");
//   }
//   //checkWeb(photo);
//   checkEx(experience);
//   checkEd(education);
//   checkSk(skills);
//   checkTa(tags);
//   checkLa(languages);
//   const usersCollection = await users();
//   let newProfiles = {
//     _id: profileId,
//     photo,
//     gender,
//     city,
//     state,
//     experience,
//     education,
//     skills,
//     languages,
//     tags,
//   };
//   const insertInfo = await usersCollection.updateOne(
//     { _id: userId, "profile._id": profileId },
//     { $set: { "profile.$": newProfiles } }
//   );
//   if (insertInfo.modifiedCount === 0) throw "Could not update the profile";
// };

const update = async (userId, email, phone, firstname, lastname, password) => {
  if (
    typeof userId !== "string" ||
    typeof email !== "string" ||
    typeof phone !== "string" ||
    typeof firstname !== "string" ||
    typeof lastname !== "string" ||
    typeof password !== "string"
  ) {
    throw new CustomError(
      400,
      "user's email, phone. firstname, lastname, password must be string"
    );
  }

  if (
    userId.trim().length === 0 ||
    email.trim().length === 0 ||
    phone.trim().length === 0 ||
    firstname.trim().length === 0 ||
    lastname.trim().length === 0 ||
    password.trim().length === 0
  ) {
    throw new CustomError(
      400,
      "uesr's email, phone. firstname, lastname, password can't be empty or just spaces"
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
  if (await checkDuplicateP(phone) || await checkDuplicateE(email)) {
    throw new CustomError(400, "the email or phone number has already been used");
  }
  const hash = await bcrypt.hash(password, saltRounds);
  const usersCollection = await users();
  let newUser = {
    email,
    phone,
    firstname,
    lastname,
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

const apply = async (jobId, userId) => {
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

  let newjob = {
    _id: jobId,
    status: "pending",
  };
  const insertInfo = await usersCollection.updateOne(
    { _id: userId },
    { $addToSet: { jobs: newjob } }
  );
  if (insertInfo.modifiedCount === 0)
    throw new CustomError(
      400,
      "Could not add the profile, the job is already exists or user doesn't exist"
    );
  //*****************recruiter collection update userId to applicantId.
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
  return res.favor;
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
  const insertInfo = await usersCollection.updateOne(
    { _id: userId },
    { $pull: { jobs: { _id: jobId } } }
  );
  if (insertInfo.modifiedCount === 0)
    throw new CustomError(
      400,
      "Could not add the profile, the job is already exists or user doesn't exist"
    );
};

const track = async (jobId, userId) => {
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
  const res = await usersCollection.findOne(
    { _id: userId, "jobs._id": jobId },
    { jobs: { $elemMatch: { _id: jobId } } }
  );
  if (res === null) throw new CustomError(400, "user or job did not exists");
  let tmp;
  res.jobs.filter((ele) => {
    if (ele._id.equals(jobId)) {
      tmp = ele.status;
    }
  });
  return tmp;
};

const trackAll = async (userId) => {
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
  return res.jobs;
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

module.exports = {
  create,
  getFile,
  addResume,
  createProfile,
  update,
  remove,
  apply,
  Favorites,
  getFavourites,
  delFavourites,
  cancel,
  track,
  trackAll,
  get,
  getAll,
  checkUser,
  getAllResume,
  removeResume,
};
// test functions **IMPORTANT**
//checkEx([{title:"Maintenance Engineer", employmentType: "full time", companyName:"Apple",startDate: "08/05/2017", endDate: "08/05/2018"}])
//checkEd([{school:"SIT", major: "CE", degree:"master of science",startDate: "08/05/2017", endDate: "08/05/2018"}])
//console.log(ObjectId.isValid('timtomtamted'));

// createProfile(
//     "61b078ea5805134fecbbf766",
//     "one url",
//     "M",
//     "Hoboken",
//     "NJ",
//     [{title:"Maintenance Engineer", employmentType: "full time", companyName:"Apple",startDate: "08/05/2017", endDate: "08/05/2018"}],
//     [{school:"SIT", major: "CE", degree:"master of science",startDate: "08/05/2017", endDate: "08/05/2018"}],
//     ["Java", "JS"],
//     ["english"],
//     ["SDE","DS"]
// ).catch(e => console.log(e));
//tmp =

//create("sega@gmail.com", "8482426666", "demo", "sega", "ccc11111111").catch(e => console.log(e));

// updateProfile(
//     '61a34056fbd0613af9d399fc',
//     "61a33e54ded974aae50bb725",
//     "one url",
//     "M",
//     "Hoboken",
//     "NJ",
//     [{title:"Maintenance Engineer", employmentType: "full time", companyName:"Apple",startDate: "08/05/2017", endDate: "08/05/2018"}],
//     [{school:"SIT", major: "CE", degree:"master of science",startDate: "08/05/2017", endDate: "08/05/2018"}],
//     ["Java", "JS"],
//     ["english","ch"],
//     ["SDE","DS","Web"]
// )

//update("61b078ea5805134fecbbf766","Wangyou@gmail.com", "8482426556", "you", "wang", "12345678").catch(ele => console.log(ele));
//apply("61a33e454966f774489ca999","61a4236167e3b3f821f5e374").catch(ele => console.log(ele));
//cancel("61a33e454966f774489ca999", "61a4236167e3b3f821f5e374");

//track("61a33e454966f774489ca999", "61a4236167e3b3f821f5e374").then(ele => console.log(ele));
//trackAll("61a4236167e3b3f821f5e374").then(ele => console.log(ele));
// get("61a4236167e3b3f821f5e374???").then(ele => console.log(ele)).catch(ele => console.log(ele));
//getAll().then(ele => console.log(ele));
//Favorites("61a4236167e3b3f821f5ddde","61a33e13067da688cb1f8e39");
//getFavourites("61a33e13067da688cb1f8e39").then(ele => console.log(ObjectId(ele[0])))
//delFavourites("61a4236167e3b3f821f5eeee","61a33e13067da688cb1f8e39");
//checkUser("sega@gmail.com", "ccc11111111").then(ele => console.log(ele)).catch(e => console.log(e));
