const faker = require("faker");

function newUser() {
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  const email = faker.internet.exampleEmail();
  let phone = faker.phone.phoneNumberFormat();
  phone = phone.replace("-", "");
  phone = phone.replace("-", "");
  const password = faker.internet.password();
  return { firstName, lastName, password, email, phone };
}

module.exports = { newUser };
