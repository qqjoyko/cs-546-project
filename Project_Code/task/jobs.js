const { jobs } = require("../config/mongoCollections");

const detail1 = {
  summary: "This is a abc company",
  description: "des1",
  required: ["Java", "Mongodb"],
  benefits: "b1",
};

const detail2 = {
  summary: "This is a cde company",
  description: "des2",
  required: ["Java2", "Mongodb"],
  benefits: "b2",
};

const detail3 = {
  summary: "This is a def company",
  description: "des3",
  required: ["Java3", "Mongodb"],
  benefits: "b3",
};

const job1 = {
  title: "job1",
  type: "full time",
  company: "Stevens",
  poster: "get it from recruiter id from recruiter collection",
  contact: "stevens.edu",
  city: "Hoboken",
  state: "NJ",
  postDate: new Date(),
  expiryDate: new Date(new Date().setDate(new Date().getDate() + 1)),
  details: detail1,
  "pay range": " 50 - 100 $ PER HOUR",
  companyPic: "image/pdf url",
};

const job2 = {
  title: "job2",
  type: "full time",
  company: "Stevens",
  poster: "get it from recruiter id from recruiter collection",
  contact: "stevens.edu",
  city: "Hoboken",
  state: "NJ",
  postDate: new Date(),
  expiryDate: new Date(new Date().setDate(new Date().getDate() + 1)),
  details: detail2,
  "pay range": " 50 - 100 $ PER HOUR",
  companyPic: "image/pdf url",
};

const job3 = {
  title: "job3",
  type: "full time",
  company: "Stevens",
  poster: "get it from recruiter id from recruiter collection",
  contact: "stevens.edu",
  city: "Hoboken",
  state: "NJ",
  postDate: new Date(),
  expiryDate: new Date(new Date().setDate(new Date().getDate() + 1)),
  details: detail3,
  "pay range": " 50 - 100 $ PER HOUR",
  companyPic: "image/pdf url",
};

module.exports = { job1, job2, job3 };
