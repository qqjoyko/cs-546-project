const profile1 = {
  // photo: "",
  gender: "m",
  city: "Hoboken",
  state: "NJ",
  company: {
    name: "xxx Inc",
    position: "manager",
    description: "Im descrp 1",
  },
};

const profile2 = {
  // photo: "",
  gender: "f",
  city: "NYC",
  state: "NY",
  company: {
    name: "xxx2 Inc",
    position: "HR",
    description: "Im descrp 2",
  },
};

const profile3 = {
  // photo: "one url",
  gender: "m",
  city: "LA",
  state: "CA",
  company: {
    name: "xxx3 Inc",
    position: "manager",
    description: "Im descrp 2",
  },
};

const recruiter1 = {
  password: "",
  firstName: "Adam",
  lastName: "Stone",
  email: "astone@abc.com",
  phone: "747-299-7453",
  profile: profile1,
  jobs: [],
};

const recruiter2 = {
  password: "",
  firstName: "Ada2",
  lastName: "Stone",
  email: "astone2@abc.com",
  phone: "747-299-7453",
  profile: profile2,
  jobs: [],
};

const recruiter3 = {
  password: "",
  firstName: "Ada3",
  lastName: "Stone",
  email: "astone3@abc.com",
  phone: "747-299-7453",
  profile: profile3,
  jobs: [],
};

module.exports = { recruiter1, recruiter2, recruiter3 };
