---
title: Database Proposal
author: 'Chen Yuyun, Joshi Ashwin, Wang You, Vinnakota Bapiraju'
date: 11/05/2021
---
# Github Repository

[github.com/ywang408/cs-546-project](https://github.com/ywang408/cs-546-project)

# Users

The user collection will contain all users registered with the portal, along with mandatory required Information:

1. Mandatory required Information:

   - Email id
   - Phone
   - Name
   - Password

2. Optional features, these features must be fulfilled when users try to apply for jobs. It would be stored as a sub-document under `profile`.

   - ID photo
   - Gender
   - City
   - State
   - Working Experience
   - Education
   - Skills
   - Languages
   - Tags

  Here's one example of sub-document `profile`:

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

  Table of sub-document `profile`:

|    Name    |  Type  |                                         Description                                         |
|:----------:|:------:|:-------------------------------------------------------------------------------------------:|
|    _id     | String |                A globally unique identifier to represent the user's profile                 |
|   photo    | String | A URL point to the use's ID photo stores on Google Cloud Platform or other storage platform |
|   gender   | String |                       m for male, f for female, others for non-binary                       |
|    city    | String |                                    User's city of living                                    |
|   state    | String |                                   User's state of living                                    |
| experience | Array  |            Working history followed by one company and corresponding description            |
| education  | Array  |           Education history followed by one school and corresponding description            |
|   skills   | Array  |                                 Learned abilities of user.                                  |
| languages  | Array  |                              Languages that the user can speak                              |
|    tags    | Array  |                              Users' interested fields of jobs                               |

3. We will initialize the following fields to be empty, and these fields will be added later.

  - jobs(Users' applied jobs' id and status, status consists of pending, rejected, approved)
  - favor(Users' interested jobs' id and they can save them in it for applying later)

A user can update their profile by logging in to the portal.

```json
"_id": "7b7997a2-c0d2-4f8c-b27a-6a1d4b5b6310",
"email": "James@gmail.com",
"phone": "848-242-6666",
"firstName": "Liam",
"lastName": "James",
"password": "$2a$08$XdvNkfdNIL8F8xsuIUeSbNOFgK0M0iV5HOskfVn7.PWncShU.O",
"jobs”: [{"job": "job1._id", "statues": "pending"},{"job": "job2._id", "statues": "rejected"}],
"profile": ["profile1","profile2"],
"favor": ["job3._id","job4._id","job5._id"],
```

|   Name    |  Type  |                                      Description                                       |
|:---------:|:------:|:--------------------------------------------------------------------------------------:|
|    _id    | String |                   A globally unique identifier to represent the user                   |
|   email   | String |                                  User's email address                                  |
|   phone   | String |                                  User's phone number                                   |
| firstName | String |                                   User's first name                                    |
| lastName  | String |                                    User's last name                                    |
| password  | String |                     Encrypted password use for login verification                      |
|   jobs    | Array  | The reference of jobs that user applied with three status: pending, rejected, approved |
|  profile  | Array  |                         A list of User's detailed information                          |
|   favor   | Array  |                          The reference of user's favorite job                          |

# Recruiters

The recruiters collection will contain information of the recruiter who have registered with the portal, both mandatory and optional.

1. Mandatory data:

   - Email id
   - Phone
   - Name
   - Password

2. optional features(these features will be saved into a sub-document `profile`, and must be fulfilled when recruiters try to post a job):

   - ID photo(store on Google Cloud Platform or other storage platform)
   - Gender
   - State
   - City
   - company(An object including company name, position, and description)

One example of sub-document `profile`:

```json
  "_id": "7b7997a2-c0d2-4f8c-b27a-6a1d4b5b6310",
  "photo": "one url",
  "gender": "m",
  "city": "Hoboken",
  "state": "NJ",
  "company": {"name":"xxx Inc", "position":"manager", 
  "description":"I have been working as a strategic recruiter at xxx Inc. for the past 5 years 
  where I have successfully recruited talent for various company specific roles. 
  At xxx Inc., we always welcome fresh talent, 
  so if you believe you're one of them, give me a ping."}
  ```

Here's the table of `profile` field:

|  Name   |   Type   |                                         Description                                         |
|:-------:|:--------:|:-------------------------------------------------------------------------------------------:|
|   _id   | ObjectId |             A globally unique identifier to represent the recruiter's profile.              |
|  photo  |  String  | A URL point to the use's ID photo stores on Google Cloud Platform or other storage platform |
| gender  |  String  |                       m for male, f for female, others for non-binary                       |
|  city   |  String  |                                    City of the recruiter                                    |
|  state  |  String  |                                   State of the recruiter                                    |
| company |  Object  |                            Company Information of the recruiter                             |

3. We will also initialize the `jobs` field to be empty, and its value will be added later by users' operations.

  Here's one example of `jobs`:
  ```json
  "jobs": [{"job_id":"7b7997a2-c0d2-4f8c-b27a-6a1d4b5b6310", 
  "applicant_id": ["7b7997a2-c0d2-4f8c-b27a-65412b5b6310", 
  "7b7543b2-c0d2-4f8c-b27a-6a1d4b5b6310"],},
  {"job_id": "7b78942a2-c0d2-4f8c-b27a-6a1d4b5b6310",
  "applicant_id": ["7b7997a2-c0d2-4f8c-b27a-654125786412", 
  "7b7543b2-c0d2-4f8c-b27a-6a1d541234510"],}
  ]
  ```

  Here's the table of `jobs` field:

  |      Name      |     Type     |                    Description                     |
  |:--------------:|:------------:|:--------------------------------------------------:|
  |     job_id     |    String    |       Id of the Job posted by the recruiter        |
  |  applicant_id  |    Array     |  Ids of the applicants who applied for this job    |

Here's an example of whole recruiter data:

```json
  "_id": "7b7997a2-c0d2-4f8c-b27a-6h87fhsk4j87",
  "password":"$2a$08$XdvNkfdNIL8F8xsuIUeSbNOFgK0M0iV5HOskfVn7.PWncShU.O",
  "firstName": "Adam",
  "lastName": "Stone",
  "email": "astone@abc.com",
  "phone": "747-299-7453",
  "profile": {
    "_id": "7b7997a2-c0d2-4f8c-b27a-6h87fhsk4h98", 
    "photo": "image url", "gender": "m", 
    "company": {"position":"Strategic Recruiter", "company": "ABC Inc.", 
    "city": "Hoboken", "state": "NJ", 
    "about": "Brief description of the recruiter"},
  "jobs": [
    {"job_id":"7b7997a2-c0d2-4f8c-b27a-6a1d4b5b6310", 
    "applicant_id": ["7b7997a2-c0d2-4f8c-b27a-65412b5b6310", 
    "7b7543b2-c0d2-4f8c-b27a-6a1d4b5b6310"],},
    {"job_id": "7b78942a2-c0d2-4f8c-b27a-6a1d4b5b6310", "applicant_id": 
    ["7b7997a2-c0d2-4f8c-b27a-654125786412", 
    "7b7543b2-c0d2-4f8c-b27a-6a1d541234510"],}
  ]
```

|     Name      |  Type  |                         Description                          |
|   :------:    | :----: | :----------------------------------------------------------: |
|      _id      | String |     A globally unique identifier to represent the user.      |
|    password   | String |        Encrypted password use for login verification         |
|   firstName   | String |                First name of the recruiter                   |
|    lastName   | String |                 Last name of the recruiter                   |
|     email     | String |                  Email of the recruiter                      |
|     phone     | String |                 Last name of the recruiter                   |
|    profile    | Object |               Recruiter's detailed information               |
|     jobs      | Array  |        A list of jobs that the recruiter has posted          |

# JOBS

1. The jobs collection will contain all the Jobs info provided by recruiter. This collection will only store the active Jobs.

   - title
   - type of job
   - employer company
   - contact email/website
   - location
   - Poster
   - Post date
   - Expiry date
   - job details (Object about company, role details, skills, benefits)

2. Job details will be a sub-document, here's one example of `details`:

  ```json
  "details": {
    "summary":"This is a abc company",
    "description":"This a devops role your responsibilities will be abc",
    "required":["Java","Mongodb"],
    "benefits":"you will get travelling allowance,insurance etc."
  },
  ```

  Table for `details`:

  |    Name     |  Type  |              Description               |
  |:-----------:|:------:|:--------------------------------------:|
  |   summary   | String | This the description about the company |
  | description | String |          Job responsibilities          |
  |  required   | Array  |           ["Java","Mongodb"]           |
  |  benefits   | String |          Benifits of the Job           |

3. Optional features:

   - pay range
   - company profile pic

Recruiters can update the jobs

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

|    Name    |     Type     |                    Description                     |
|:----------:|:------------:|:--------------------------------------------------:|
|    _id     |    String    | A globally unique identifier to represent the job. |
|   title    |    String    |                  Title of the job                  |
|    type    |    string    |       Internship/Full time/ part time/ Coop        |
|  company   |    String    |            Name of the employer company            |
|   poster   |    String    | Name from recruiters collection using recruiter id |
|  contact   |    String    |                  website/email id                  |
|    city    |    String    |               Name of the work city                |
|   state    |    String    |               Name of the work state               |
|  postDate  | Date(Object) |              current date of the post              |
| expiryDate | Date(Object) |             Date in MM/DD/YYYY format              |
|  details   |    Object    |    includes summary, responsibilities, benefits    |
| pay range  |    String    |                 "$20/25 per hour"                  |
| companyPic |    String    |           "an url to display pictures "            |

This the `details` sub document all the fields in this object are optional
