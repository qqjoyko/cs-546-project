/* Hi all these are the specs for the db connection.

dbname : 'JobHunt_db'

NOTE : please add your variables and specs while implementing here 

PLEASE MAKE SURE YOU ADD THE VARIABLE SPECS HERE AND USE CONSISTENT VARIABLE NAMING IN YOU CODE !!!!!!!!!!!!!!!
PLEASE ADD YOUR NAMES WITH THE VARIABLES AS 

FOR EX.
1) ASHWIN : 
   
   VARIABLENAMEs : users, recruiters, jobs 
   TYPE    : MONGO collection
   FUNCTION : to redirect it to respective data pages 


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

const users = require("./users");

const recruiters = require("./recruiters");

const jobs = require("./jobs");

const upload = require("./upload");

module.exports = {
  users: users,
  recruiters: recruiters,
  jobs: jobs,
  upload: upload,
};
