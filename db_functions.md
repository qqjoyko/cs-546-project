---
title: Functions of Database Operations
date: 11/11/2021
---

# User Functions

## `createProfile(userId, photo, gender, city, state, experience, education, skills, languages, tags)`

This function is used to create sub-document `profile` for the user with `userId`, All fields need to match the type specified in [DB_proposal](https://github.com/ywang408/cs-546-project/blob/main/proposals/DB_Proposal.md). It will return newly created `profile`.

The following is one example:

```json
"_id": "7b7997a2-c0d2-4f8c-b27a-6a1d4b5b6310",
"photo": "one url",
"gender": "m",
"city": "Hoboken",
"state": "NJ",
"experience":[{"title":"Maintenance Engineer", "employment type": "full time", 
"Company name":"Apple","start date": "08/05/2017", "end date": "08/05/2018"}]
"education":[
{"school":"xxx university", "field of study":"computer science", 
"degree":"master of science", 
"start date": "08/05/2010", "end date": "08/05/2014"}]
"skills":["Java", "JS"]
"languages":["english"]
"tags":["SDE","DS"]
```

## `create(email, phone, firstname, lastname, password, profile)`

Used to create an account for user:

- all the fields must be valid except for `profile`. 
- For `profile`, if it's a pdf, we will use functions in package to parse it, and then use `createProfile` to create a profile. If `profile` is empty, set it with an empty object.
- `jobs` and `favour` will be initialized with empty arrays.
- password must be encoded and then be saved to database. (encode and decode function to be determined later)

One example:

```json
"_id": "7b7997a2-c0d2-4f8c-b27a-6a1d4b5b6310",
"email": "James@gmail.com",
"phone": "848-242-6666",
"firstName": "Liam",
"lastName": "James",
"password": "$2a$08$XdvNkfdNIL8F8xsuIUeSbNOFgK0M0iV5HOskfVn7.PWncShU.O",
"jobs”: [],
"profile": ["profile1"]
"favor": []
```

## `updateProfile(profileId, userId, photo, gender, city, state, experience, education, skills, languages, tags)`

Used to update the sub-document `profile` of users with `profileId`. The logic should be the same with function `createProfile`.

## `update(id, email, phone, firstname, lastname, password)`

- This function will update **all** the mandatory required data of this `user` currently in the database
- All fields need to have valid values.

## `remove(id)`

- If the removal succeeds, return the name of the `user` and the text " has been successfully deleted!"
- Also update the job under recruiter collection with this `jobId`: remove the `userId` from `applicantId`.

## `apply(jobId, userId)`

- Add this `jobId` to user's `jobs` field, and its `status` should be `pending`.
- Cannot apply jobs that already be applied.
- Also update the job under recruiter collection with this `jobId`: add the `userId` to `applicantId`.

## `Favorites(jobId, userId)`

- Add this `jobId` to user's `favour` field.
- Cannot save jobs that already be saved.

## `cancel(jobId, userId)`(which used to cancel application for a job)

- remove this `jobId` from user's `jobs` field
- Also update the job under recruiter collection with this `jobId`: remove the `userId` from `applicantId`.

## `track(jobId, userId)`

Return the `status` of this `jobId`.

## `trackAll(userId)`

Return all of jobs along with their `status`.

## `get(userId)`

When given an id, this function will return a user from the database.

## `getAll()`

Return all of the users from the database.

# Recruiters Functions

## `createProfile(userId, photo, gender, city, state, company)`

This function is used to create sub-document `profile` for the recruiter with `userId`, All fields need to match the type specified in [DB_proposal](https://github.com/ywang408/cs-546-project/blob/main/proposals/DB_Proposal.md). It will return newly created `profile`.

## `create(email, phone, firstname, lastname, password, profile)`

Used to create an account for user:

- all the fields must be valid except for `profile`.
- if `profile` is empty, set it with empty object.
- For `profile`, it should be an object(all fields must be valid) and we use `createProfile` to help us create the recruiter's profile.
- `jobs` will be initialized with empty arrays.
- password must be encoded and then be saved to database. (encode and decode function to be determined later)
- will return newly created recruiter info.

## `update` and `updateProfile` will have the same logic with previous functions

## `post(title, type, company, contact, city, state, expiryDate, details, payRange, companyPic)`

- All the fields must match fields in [DB_proposal](https://github.com/ywang408/cs-546-project/blob/main/proposals/DB_Proposal.md), except for `payRange` and `companyPic`, they are optional features.
- If `payRange` or `companyPic` are not given, set it with empty string.
- `details` should be an object, it's a sub-document of this `job`.
  
    ```json
    "details": {
    "summary":"This is a abc company",
    "description":"This a devops role your responsibilities will be abc",
    "required":["Java","Mongodb"],
    "benefits":"you will get travelling allowance,insurance etc."
    },
    ```

- Automatically set `postDate` to today's date and `poster` to the recruiter.
- Return the newly added `job`.

Example of a job:

```json
"_id": "7b7997a2-c0d2-4f8c-b27a-6a1d4b5b6310",
"title":"Software development summer 2022 internship"
"type": "internship",
"company: "Stevens",
"poster": "get it from recruiter id from recruiter collection",
"contact": "stevens.edu",
"city": "Hoboken",
"state": "NJ",
“postDate”: "today's date in MM/DD/YYYY,
"expiryDate":"MM/DD/YYY"
"details": {
  "summary":"This is a abc company",
  "description":"This a devops role your responsibilities will be abc",
  "required":["Java","Mongodb"],
  "benefits":"you will get travelling allowance,insurance etc."
},
  "pay range":" 50 - 100 $ PER HOUR"
  "companyPic": "image/pdf url"
```

## `updateJob(jobId, title, type, company, contact, city, state, expiryDate, details, payRange, companyPic)`

Similar with `post`.

## `removeJob(jobId)`

- Remove all the applicants applied with this job.
- Remove saved jobs with this id
- Remove this job.

## `removeAllJob()`

Recursively use `removeJob(jobId)`.

## `remove(id)`(which used to remove one recruiter)

`remove` will take the following steps:

1. With this `id`, first find the `jobs` field, then find the `applicantId` under `jobs`, remove these applicants applied jobs in `user` collection.
2. Remove jobs posted by this recruiter from `job` collection. (Step 1 and step 2 can use `removeAllJob`)
3. Remove recruiter with this `id`fine.
4. If the removal succeeds, return the name of the `user` and the text " has been successfully deleted!".

## `viewJob(jobId)`

//To be discussed later

## `accept(applicantId, jobId)`(used to accept or reject applicants' applications)

change the status this job under applicant's `jobs` to `accepted`

## `reject(applicantId, jobId)`

change the status this job under applicant's `jobs` to "rejected"

# Login functions

This part will be covered in lecture 10, to be added later.

# Job

## sort()

## filter()

## search()
