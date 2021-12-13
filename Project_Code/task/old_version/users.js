const { users } = require("../../config/mongoCollections");
const bcrypt = require("bcrypt");
var ObjectId = require("mongodb").ObjectId;

const password1 = "12345678";
const password2 = "87654321";
const password3 = "135792468";

const profile1 = {
  //photo: "url",
  gender: "m",
  city: "Hoboken",
  state: "NJ",
  experience: [
    {
      title: "Maintenance Engineer",
      "employment type": "full time",
      "Company name": "Apple",
      "start date": "08/05/2017",
      "end date": "08/05/2018",
    },
  ],
  education: [
    {
      school: "xxx university",
      "field of study": "computer science",
      degree: "master of science",
      "start date": "08/05/2010",
      "end date": "08/05/2014",
    },
  ],
  skills: ["Java", "JS"],
  languages: ["english"],
  tags: ["SDE", "DS"],
};

const profile2 = {
  //photo: "url",
  gender: "f",
  city: "NYC",
  state: "NY",
  experience: [
    {
      title: "Assistant Professor",
      "employment type": "part time",
      "Company name": "Stevens Institute of Technology",
      "start date": "03/05/2016",
      "end date": "03/05/2018",
    },
  ],
  education: [
    {
      school: "xxx2 university",
      "field of study": "computer science",
      degree: "master of science",
      "start date": "08/05/2010",
      "end date": "08/05/2014",
    },
  ],
  skills: ["Python", "R"],
  languages: ["english"],
  tags: ["Professor"],
};

const profile3 = {
  //photo: "url",
  gender: "m",
  city: "Los Angeles",
  state: "CA",
  experience: [
    {
      title: "HR Lead",
      "employment type": "full time",
      "Company name": "Google",
      "start date": "08/05/2016",
      "end date": "08/05/2020",
    },
  ],
  education: [
    {
      school: "xxx3 university",
      "field of study": "Mathematics",
      degree: "Bachelor",
      "start date": "08/05/2006",
      "end date": "08/05/2010",
    },
  ],
  skills: ["Word", "Excel"],
  languages: ["english"],
  tags: ["HR"],
};

const user1 = {
  id: "7b7997a2-c0d2-4f8c-b27a-6a1d4b5b6310",
  email: "James@gmail.com",
  phone: "848-242-6666",
  firstName: "Liam",
  lastName: "James",
  password: "",
  jobs: [],
  resume: [],
  profile: profile1,
  favor: [],
};

const user2 = {
  email: "Ronaldo@gmail.com",
  phone: "626-242-5555",
  firstName: "Cristiano",
  lastName: "Ronaldo",
  password: "",
  jobs: [],
  resume: [],
  profile: profile2,
  favor: [],
};

const user3 = {
  email: "Ronaldinho@gmail.com",
  phone: "515-242-7777",
  firstName: "Ronaldinho",
  lastName: "James",
  password: "",
  jobs: [],
  resume: [],
  profile: profile3,
  favor: [],
};

module.exports = { user1, user2, user3 };
