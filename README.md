# cs-546-project

## Introduction

This website application will be a central portal for job seekers and recruiters. Users can view the jobs and sign up with us.
Users can apply for a job, save the jobs for later use, and recruiters can view the applicants in the same portal after logging in.

Examples of the filters will location, Pay range, location, type of job( internship , full time ), company
Also, this application will have ability to sort the jobs according recent jobs and Pay-range.

The goal of this project is to centralize the job application process and to reduce the turn around time with respect to application process for job seekers as well as recruiters.

## Seed Database

Run the following code under `Project_Code` folder to seed the database:

```node
npm run seed
```

This function are organized as following:

1. First it will drop the whole database of `jobHunt`
2. Next by default, it will create 6 `recruiters`, 20 `applicants`, and each recruiter will have 5 `jobs`. (You can change it by changing the last line of seed.js file)

Note that we don't offer seeding database with applicants' resumes, we just use a auxiliary function to allow the users to apply jobs in seed process. However, in real case, a user must upload at least a resume before applying for a job. As a result, you can't view applicants' resume in recruiters' side after seeding, it will reveal "resume not found".

After seeding, you can find emails and passwords used to log in the website for both users and recruiters, in `/task/users.json` and `/task/recruiter.json`.

## Start the website

Run the following code under `Project_Code` folder to start the website:

```node
npm start
```

After that, you can access our website through [http://localhost:3000](http://localhost:3000)

## Features

### Main Page

- All users and recruiters and view the main page.
  - Users `logged in` can view specific job page
  - For privacy, recruiters cannot view single job page, they can only access their posted job via their profile page
- A `search bar` used for filter keywords
- A `Recent jobs` button for resort jobs

### User

- Basic `sign up` and `login`
- Users can `update` their profile in their main page
- Users must `upload` their resume then `apply` for jobs, otherwise when they apply a job, it will show a link redirect them to upload resume page
- Users can apply and `save` jobs, they can view them in their profile page or on the top-right buttons, they also can `cancel` or `remove` jobs from those pages

### Recruiter

- Basic `sign up` and `login`
- They can `update` their profile and `post` job using buttons in their profile page
- In their profile page, they can view applicants for their `posted` jobs
- They can `accept`, `reject` and `view` applicants' resumes from their profile page