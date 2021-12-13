const faker = require("faker");

function newRec() {
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  const email = faker.internet.exampleEmail();
  let phone = faker.phone.phoneNumberFormat();
  phone = phone.replace("-", "");
  phone = phone.replace("-", "");
  const password = faker.internet.password();
  return { firstName, lastName, password, email, phone };
}

function newRecProfile() {
  if (Math.floor(Math.random() * 10) % 2 == 0) {
    var gender = "m";
  } else {
    var gender = "f";
  }
  const city = faker.address.city();
  const state = faker.address.state();
  const name = faker.company.companyName();
  const description = faker.company.catchPhraseDescriptor();
  const position = faker.name.jobType();
  return { gender, city, state, company: { position, name, description } };
}

module.exports = {
  rec: newRec,
  recPro: newRecProfile,
};
