const faker = require("faker");

function newJob() {
  const title = faker.name.jobTitle();
  const type = faker.name.jobType();
  const company = faker.company.companyName();
  const city = faker.address.city();
  const state = faker.address.state();
  const detail1 = faker.company.catchPhraseDescriptor();
  const detail2 = faker.company.catchPhraseAdjective();
  const detail3 = faker.random.arrayElements();
  const details = { summary: detail1, description: detail2, required: detail3 };
  const low = Math.floor(Math.random() * 1000);
  const high = Math.floor((1 + Math.random()) * low);
  const payRange = `${low}-${high}`;
  return { title, type, company, city, state, details, payRange: payRange };
}

// console.log(newJob());

module.exports = newJob;
