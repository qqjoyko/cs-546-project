let userInfo = require("./users");
let recruiterInfo = require("./recruiters");
let jobInfo = require("./jobs");
const { users, recruiters, jobs } = require("../config/mongoCollections");
const { connectToDb, closeConnection } = require("../config/mongoConnection");
const bcrypt = require("bcrypt");

const password1 = "12345678";
const password2 = "87654321";
const password3 = "135792468";

const setup = async () => {
  const db = await connectToDb();

  // clean
  try {
    await db.collection("users").drop();
    await db.collection("recruiters").drop();
    await db.collection("jobs").drop();
    await db.collection("userProfiles.files").drop();
    await db.collection("userProfiles.chunks").drop();
  } catch (e) {}

  // seed jobs, get id
  const jobCol = await jobs();
  const insertedInfo1 = await jobCol.insertMany([
    jobInfo.job1,
    jobInfo.job2,
    jobInfo.job3,
  ]);
  let jobIds = Object.values(insertedInfo1.insertedIds);

  // hash passwords
  const hash1 = await bcrypt.hash(password1, 5);
  const hash2 = await bcrypt.hash(password2, 5);
  const hash3 = await bcrypt.hash(password3, 5);

  // setup users
  userInfo.user1.password = hash1;
  userInfo.user2.password = hash2;
  userInfo.user3.password = hash3;
  userInfo.user1.jobs.push({ job: jobIds[0], status: "pending" });
  userInfo.user1.jobs.push({ job: jobIds[1], status: "pending" });
  userInfo.user1.jobs.push({ job: jobIds[2], status: "pending" });
  userInfo.user1.favor.push(jobIds[0]);

  userInfo.user2.jobs.push({ job: jobIds[0], status: "pending" });
  userInfo.user2.jobs.push({ job: jobIds[1], status: "pending" });
  userInfo.user2.favor.push(jobIds[1]);
  userInfo.user2.favor.push(jobIds[2]);

  userInfo.user3.jobs.push({ job: jobIds[0], status: "pending" });
  userInfo.user3.jobs.push({ job: jobIds[2], status: "pending" });
  userInfo.user3.favor.push(jobIds[0]);
  userInfo.user3.favor.push(jobIds[1]);
  userInfo.user3.favor.push(jobIds[2]);

  const userCol = await users();
  const insertedInfo2 = await userCol.insertMany([
    userInfo.user1,
    userInfo.user2,
    userInfo.user3,
  ]);
  let userIds = Object.values(insertedInfo2.insertedIds);

  // setup recruiters
  recruiterInfo.recruiter1.password = hash1;
  recruiterInfo.recruiter2.password = hash2;
  recruiterInfo.recruiter3.password = hash3;

  // suppose each recruiter post one job
  recruiterInfo.recruiter1.jobs.push({
    job_id: jobIds[0],
    applicant_id: [userIds[0], userIds[1], userIds[2]],
  });
  recruiterInfo.recruiter2.jobs.push({
    job_id: jobIds[1],
    applicant_id: [userIds[0], userIds[1]],
  });
  recruiterInfo.recruiter3.jobs.push({
    job_id: jobIds[2],
    applicant_id: [userIds[0], userIds[2]],
  });

  const recruiterCol = await recruiters();
  const insertedInfo3 = await recruiterCol.insertMany([
    recruiterInfo.recruiter1,
    recruiterInfo.recruiter2,
    recruiterInfo.recruiter3,
  ]);

  await closeConnection();
};

setup();
