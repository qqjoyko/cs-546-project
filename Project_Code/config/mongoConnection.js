/* Hi all these are the specs for the db connection.

dbname : 'JobHunt_db'


NOTE : please add your variables and specs while implementing here 

PLEASE MAKE SURE YOU ADD THE VARIABLE SPECS HERE AND USE CONSISTENT VARIABLE NAMING IN YOU CODE !!!!!!!!!!!!!!!





*/
const MongoClient = require("mongodb").MongoClient;
const settings = {
  mongoConfig: {
    serverUrl: "mongodb://localhost:27017/",
    database: "JobHunt_db",
    userBucket: "userProfiles",
  },
};
const mongoConfig = settings.mongoConfig;

let _connection = undefined;
let _db = undefined;

module.exports = {
  connectToDb: async () => {
    if (!_connection) {
      _connection = await MongoClient.connect(mongoConfig.serverUrl);
      _db = await _connection.db(mongoConfig.database);
    }

    return _db;
  },
  closeConnection: () => {
    _connection.close();
  },
  dbConfig: settings.mongoConfig,
};
