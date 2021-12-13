let userInfo = require("./users");
let recruiterInfo = require("./recruiters");
let jobInfo = require("./jobs");
const { users, recruiters, jobs } = require("../../config/mongoCollections");
const {
  connectToDb,
  closeConnection,
} = require("../../config/mongoConnection");
const bcrypt = require("bcrypt");

const password1 = "12345678";
const password2 = "87654321";
const password3 = "135792468";

const setup = async () => {
  const db = await connectToDb();

  // clean
  try {
    await db.dropDatabase();
    // await db.collection("users").drop();
    // await db.collection("recruiters").drop();
    // await db.collection("jobs").drop();
    // await db.collection("userProfiles.files").drop();
    // await db.collection("userProfiles.chunks").drop();
  } catch (e) {
    console.log(e);
  }

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
    applicants: [
      { appId: userIds[0], status: "pending" },
      { appId: userIds[1], status: "pending" },
      { appId: userIds[2], status: "pending" },
    ],
  });
  recruiterInfo.recruiter2.jobs.push({
    job_id: jobIds[1],
    applicants: [
      { appId: userIds[0], status: "pending" },
      { appId: userIds[1], status: "pending" },
    ],
  });
  recruiterInfo.recruiter3.jobs.push({
    job_id: jobIds[2],
    applicants: [
      { appId: userIds[0], status: "pending" },
      { appId: userIds[2], status: "pending" },
    ],
  });

  const recruiterCol = await recruiters();
  const insertedInfo3 = await recruiterCol.insertMany([
    recruiterInfo.recruiter1,
    recruiterInfo.recruiter2,
    recruiterInfo.recruiter3,
  ]);

  // update posters
  let recruiterIds = Object.values(insertedInfo3.insertedIds);
  // console.log(recruiterIds);
  await jobCol.updateOne(
    { _id: jobIds[0] },
    { $set: { poster: recruiterIds[0] } }
  );
  await jobCol.updateOne(
    { _id: jobIds[1] },
    { $set: { poster: recruiterIds[1] } }
  );
  await jobCol.updateOne(
    { _id: jobIds[2] },
    { $set: { poster: recruiterIds[2] } }
  );
  // let job1 = await jobCol.findOne({ _id: jobIds[0] });
  // console.log(job1)
  // let job2 = await jobCol.findOne({ _id: jobIds[1] });
  // let job3 = await jobCol.findOne({ _id: jobIds[2] });
  await closeConnection();
};

setup();
