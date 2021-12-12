/* Hi all these are the specs for the db connection.

dbname : 'JobHunt_db'

NOTE : please add your variables and specs while implementing here 

PLEASE MAKE SURE YOU ADD THE VARIABLE SPECS HERE AND USE CONSISTENT VARIABLE NAMING IN YOU CODE !!!!!!!!!!!!!!!
PLEASE ADD YOUR NAMES WITH THE VARIABLES AS 

FOR EX.
1) ASHWIN : 
   
   VARIABLENAME: keyStore
   TYPE    : MONGO collection
   FUNCTION : collection() : to store the username and passwords of users and recruiters.


2) BAPI:

    Bapi add your variable here you don't need to follow the foramat above.


3) YOU:





4) ANDY:





# THIS WILL HELP EVERYBODY FOR DEBUGGING.






AS of now I can think of only four collections

1) USERS
2) RECRUITERS
3) JOBS
4) USERNAME AND PASSWORD STORE WITH RESPECT TO USERS AND RECRUITES :- Key store 

SCHEMA FOR 





*/

//CODE STARTS HERE:

const dbConnection = require("./mongoConnection");
const userBucket = dbConnection.dbConfig.userBucket;
/* This will allow you to have one reference to each collection per app */
/* Feel free to copy and paste this this */
const getCollectionFn = (collection) => {
  let _col = undefined;

  return async () => {
    if (!_col) {
      const db = await dbConnection.connectToDb();
      _col = await db.collection(collection);
    }

    return _col;
  };
};

/* Now, you can list your collections here: */
module.exports = {
  users: getCollectionFn("users"),
  recruiters: getCollectionFn("recruiters"),
  jobs: getCollectionFn("jobs"),
  keyStore: getCollectionFn("keyStore"),
  userProfiles: getCollectionFn(userBucket + ".files"),
  profileChunks: getCollectionFn(userBucket + ".chunks"),
};
