const recs = require("./recruiter_gen");
const newJob = require("./job_gen");
const fs = require("fs").promises;
const data = require("../data/index");
const recFuncs = data.recruiters;
const userFuncs = data.users;
const { connectToDb } = require("../config/mongoConnection");
const { jobs } = require("../config/mongoCollections");
async function* asyncGenerator(num) {
  let i = 0;
  while (i < num) {
    yield i++;
  }
}

async function dropAll() {
  const db = await connectToDb();
  try {
    await db.dropDatabase();
  } catch (e) {
    console.log(e);
  }
}
async function seedUser(num) {
  // creat users
  console.log("--------------------------------------------");
  console.log("Starting to Create Users...");
  const ids = [];
  const login = [];
  for (let i = 0; i < num; i++) {
    const { firstName, lastName, password, email, phone } = recs.rec();
    // console.log(phone);
    // const hashed = await bcrypt.hash(password, 4);
    try {
      var tmp = await userFuncs.create(
        email,
        phone,
        firstName,
        lastName,
        password
      );
    } catch (e) {
      console.log(e);
    }
    ids.push(tmp);
    // console.log(tmp);
    // console.log(ids);
    login.push({ email: email, password: password });
    console.log(`Inserting Users: ${i}/${num - 1}`);
  }
  console.log("All users have been created!");
  // output to json
  let userLogin = JSON.stringify(login);
  await fs.writeFile("./task/user.json", userLogin, "utf8");
  return ids;
}

async function seedRec(num, numOfUsers, numOfJobs) {
  // create users
  const userIds = await seedUser(numOfUsers);

  // creat recruiters
  console.log("--------------------------------------------");
  console.log("Starting to Create Recruiters...");
  const ids = [];
  const login = [];
  for (let i = 0; i < num; i++) {
    const { firstName, lastName, password, email, phone } = recs.rec();
    // console.log(phone);
    // const hashed = await bcrypt.hash(password, 4);
    try {
      var tmp = await recFuncs.createRecruiter(
        email,
        password,
        firstName,
        lastName,
        phone
      );
    } catch (e) {
      console.log(e);
    }
    ids.push(tmp.data._id);
    // console.log(tmp);
    // console.log(ids);
    login.push({ email: tmp.data.email, password: password });
    console.log(`Inserting Recruiters: ${i}/${num - 1}`);
  }

  // add profiles and jobs
  console.log("--------------------------------------------");
  console.log("Starting to seed Profiles for Recruiters...");
  for (id of ids) {
    let idx = ids.indexOf(id);
    const { gender, city, state, company } = recs.recPro();
    const profile = { gender, city, state, company };
    try {
      await recFuncs.createProfile(id, profile);
      console.log(`Seeding Profiles for Recruiters: ${idx}/${ids.length - 1}`);
    } catch (e) {
      console.log(e);
    }

    // post jobs
    for (let j = 0; j < numOfJobs; j++) {
      let jobDetails = newJob();
      try {
        await recFuncs.postJob(id, jobDetails);
        console.log(`Recruiter${idx} is posting his jobs...`);
      } catch (e) {
        console.log(e);
      }
    }
  }
  // output to json
  let RecLogin = JSON.stringify(login);
  await fs.writeFile("./task/recruiter.json", RecLogin, "utf8");

  // apply for jobs
  console.log("--------------------------------------------");
  console.log("Now users are applying for jobs...");
  const jobCol = await jobs();
  const allJob = await jobCol.find({}).toArray();
  const assignApply = [];
  for ({ _id: id } of allJob) {
    let numOfApps = Math.floor(Math.random() * userIds.length);
    for (let i = 0; i < numOfApps; i++) {
      // console.log(userIds[i]);
      try {
        await userFuncs.auxApply(id.toString(), userIds[i].toString());
      } catch (e) {
        console.log(e);
      }
    }
  }
  console.log("Now users have applied for jobs");
  console.log("You can close the session now");
}

dropAll();
// seedUser(5);

// first parameter is the number of recruiters
// first parameter is the number of users
// first parameter is the number of jobs under each recruiter
seedRec(6, 20, 5);
