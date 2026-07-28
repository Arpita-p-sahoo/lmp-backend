# What We've Built So Far — A Simple Guide to LastMinPrep Backend

---

## What Is This Project, In One Sentence?

LastMinPrep is the **backend (the "behind-the-scenes computer code") that powers a website where people can **prepare for job interviews and find jobs. Think of it as a mix of Quora (ask-and-answer), LinkedIn (jobs and follow people), and Reddit (voting and saving good content).

---

## The Big Picture

People come to the website to:

1. **Ask questions** about interviews or topics they want to learn
2. **Browse other people's questions and answers
3. **Vote up** the good stuff and **save** things they want to come back to
4. **Talk about questions by leaving comments
5. **Follow people** whose content they love
6. **Find and post jobs
7. **See who the top contributors are (the "leaderboard")

Everything below explains each part in plain English.

---

## The User Accounts: Sign Up and Log In

### How People Can Join (Two Ways)

**Option 1: Email + Password**
- You type your name, email, and a password
- The computer **secretly scrambles your password** before saving it (so even if someone looks at the database, they can't read it)
- It checks nobody else already used that email, it'll tell you to pick a different one
- Once you're in, the website gives you a little "I'm logged in" ticket (called a token) that it remembers you

**Option 2: Sign In with Google**
- Just click a button and Google handles the login
- Two separate buttons:
  - **"Sign up with Google"** → If you're new, creates your account automatically
  - **"Continue with Google"** → Only works if you already have an account; won't create a new one
- When Google sends you back to the website with either your "I'm logged in" ticket or a friendly error if something went wrong

---

## Your Profile Page

### What You Can Do With Your Profile

**Basic Info You Can Fill In or Change:
- Your name
- A little picture of you (avatar)
- A big banner picture for the top of your page
- Your job title ("Software Engineer," "Student," etc.)
- The company or school you're at
- Your address, age, gender, birthday
- What you studied and how many years of experience you have
- A link to your LinkedIn
- What you're good at (your skills / tech stack)

**Uploading Pictures**
- Click upload your profile picture or banner
- Pictures are stored on a service called Cloudinary (they handle cropping and making them load fast)
- Maximum 5 megabytes per picture (that's a reasonable limit to prevent huge images slowing things down)

### Following and Being Followed

You can **follow** other people, kind of like on Instagram or Twitter/X.
- See a "Follow" button on someone's page → now you follow them
- Click again to unfollow
- You can see lists of:
  - Who *you* follow
  - Who *follows* you
  - Who *any user* follows or is followed by
- The best part: **Following someone makes a special "feed" page that only shows questions from people you follow!

---

## Questions & Answers: The Heart of the Site

### Browsing Questions

When you first land on the home page, you see a list of questions. You can:
- **Scroll through** the feed (newest first, or "hottest" first, or sorted by votes)
- **Search** for a keyword (like "dynamic programming" or "React")
- **Filter by topic tag** (like JavaScript, Python, System Design)
- If you're logged in, each question shows if *you* already voted on it or saved it
- Even if you *don't* have an account, you can still browse!

### Posting a Question

When signed in:
- Type your question
- Pick a main topic (tech tag)
- Add extra hashtags if you want
- Click post → it goes live!
- Your "questions posted" counter on your profile automatically goes up by 1

### Voting Questions

- **Upvote questions you love → goes up by 1
- Click again to take it back (toggle)
- Votes help the good stuff rise to the top

### Saving (Bookmarking)

- **Save** a question to look at later
- See all your saved questions in one place
- Click "Saved" page)
- Perfect for cramming before interviews!

### Your Personal Question Lists

- **My Questions:** All the questions *you* posted
- **Saved Questions:** Everything you bookmarked
- **Following Feed:** Just questions from people you follow
- **Search:** Type any word to find matching questions

---

## Talking About Questions: Comments

### Leaving Comments

On any question:
- Type your two cents
- It shows up right away
- The question's comment counter goes up by 1
- You can delete *your own* comments if you change your mind

### Liking or Disliking Comments

Just like YouTube:
- 👍 **Like** a comment
- 👎 **Dislike** a comment
- Numbers go up/down accordingly
- Click again to undo
- You can sort comments two ways:
  - **Top:** The most-liked comments show up first
  - **New:** Newest first

---

## The Job Board

### Finding Jobs

- Browse all posted jobs with search box
- Filter by:
  - Type: Remote / Hybrid / Work at office (Onsite)
  - Experience level
  - Location
  - Skills needed
  - Salary range
  - Keyword search
- Look at a single job posting in full detail
- **Save jobs for later** (bookmark button) → go to your Saved Jobs page

### Posting a Job

If you're signed in and hiring:
- Fill in:
  - Job title
  - Company name
  - Where it's based
  - Remote/hybrid/onsite
  - Experience needed
  - Salary
  - What skills they want
  - Full description
- Post it → live on the board!
- You can delete *your own* job postings later if the position gets filled

---

## The Leaderboard

- Shows the **top 50 contributors** on the whole site
- Ranked by **total votes** received on their questions and content
- Good for bragging rights and shows who's really helpful
- You can see their profile pics, names, what they do, and how many questions they've asked

---

## Behind-the-Scenes Magic (The Stuff That Keeps It Running Smoothly

### Security: Keeping Everyone Safe

- **Password scrambling** No one's actual password is stored, not even us. They're all mixed up using something called bcrypt.
- **Login tickets (tokens)** When you log in, you get a signed ticket that proves who you are. This ticket has your name and user ID on it.
- **No sneaky fields allowed** If the website isn't expecting a certain piece of information, it rejects it outright. This is called "strict validation."
- **Safety helmets** Something called Helmet automatically adds extra locks and bolts the bad guys out.
- **Secret info never gets written in logs** Things like passwords and login tickets are automatically blacked out in the server logs. No peeking!
- **Locking down who can talk to the site** In development, websites, when running for real (production mode) only the real LastMinPrep website is allowed to talk to the backend.

### Making It Fast: Speed Boosts

- **Memory cache** A thing called Redis remembers recent popular pages and answers so it doesn't have to keep asking the database every single time. Makes things load faster.
- **If Redis breaks, no panic! If the cache isn't available, the website keeps working normally, just a bit slower. It gracefully falls back.

### Pictures in logs** Your Photos Safely

- All pictures get their pictures uploaded to Cloudinary they do the hard work of making sure photos load quickly and look right on any device
- Automatically crops profile pictures to 400×400 pixels and focuses on the face

### Nice Error Messages

- Nice Error Messages

- If anything breaks, you see a friendly error instead of a confusing techno-babble page
- In development mode, you see a little more detail to help fix problems
- Every error gets a "case number" (error ID) so we can look up exactly what went wrong in the logs
- No random crashes that break the whole website

### Developer Playground: Documentation

- A built-in **documentation page (Swagger Docs) at `/api/docs` you can click around and *try out every single button and feature
- Perfect for:
  - The mobile app developers
  - QA testing things work right
  - Seeing exactly what each part of the site can do

### Everything

---

## What the Database Stores (Imagine Big Digital Filing Cabinets)

Think of the database as a bunch of spreadsheets, one for each type of thing:

| Filing Cabinet (Table Name) | What it stores | Example |
|---|---|---|
| **Users | **users** | | Priya, 24, Software Engineer, good at React |
| **Questions people asked | **questions** | "Explain deadlocks in 2024? asked by Rohan |
| **Who voted on what | votes | | Priya upvoted Question #123 |
| **Who saved which questions** saved_questions | | Priya saved Question #456 for later |
| **Comments on questions** comments | | "Here's how I'd answer this..." — by Ananya |
| **Who liked/disliked comments** comment_reactions | | Priya 👍 Comment #789 |
| **Job listings posted** **jobs** | | "Senior SWE at TechCorp, Remote" |
| **Who saved which jobs | saved_jobs | | Priya saved Job #321 |
| **Who follows who** user_follows | | Priya follows Rohan |

Each of these spreadsheets automatically timestamps when rows are created/updated to keep track of when things happened.

---

## How to Run It On Your Own Computer

If you're a developer wanting to run this on your laptop:

1. **Get the code onto your computer.

2. **Install all the tools:**
   ```
   npm install
   ```

3. **Set up your environment file with all the secret codes (environment variables):
   - Which port number to use (default: 3333)
   - How to talk to your PostgreSQL database
   - Your login-ticket signing password (JWT secret)
   - Google login codes (for Google button)
   - Redis connection info (optional, for speed cache)
   - Cloudinary codes (for uploading pictures)
   - What website address (your Frontend website's URL (for safety checks)

4. **Set up your database tables:**
   ```
   npm run migration:run
   ```

5. **Start it up:**
   ```
   npm run start:dev
   ```

6. **See it running:**
   - The backend: `http://localhost:3333`
   - The playground/docs page: `http://localhost:3333/api/docs`

---

## What's Coming Next (Not Ready Yet)

### High Priority — Coming Soonest

1. **Stay logged in longer
   - Right now login tickets expire after 15 minutes (you'll be able to stay logged in for days with "remember me" style)
   - Logout buttons for kicking out lost/stolen devices
   - Optional: confirm your email after signing up

2. **Make the Google buttons more clear
   - The buttons work great already, but we'll make it even easier to understand on the website with helpful error messages when something doesn't work

### Medium Priority — Coming Later

3. **Report bad content + Moderation tools
   - Report spam, mean comments, or fake jobs
   - "Soft delete" (hide from public view but keep for records)
   - Admin tools to review reports and remove/approve

4. **Smarter recommendations
   - Suggest questions and jobs based on *your* skills and what you've saved
   - Better search that fuzzy search (finds close matches too)
   - Combined filters ("Show me only Python remote jobs with salary over 20LPA")

5. **See how the website doing + Dashboard
   - See how many people sign up each day, which questions are hot, how many people coming back
   - Charts and numbers for the team to make decisions

---

## Cheat Sheet: All The Things You Can Do

### My Account
- ✅ Sign up with email/password
- ✅ Sign up with Google (button)
- ✅ Log in with email/password
- ✅ Log in with Google (button)
- ✅ See and edit my profile page
- ✅ Upload a new avatar/profile pic
- ✅ Upload a banner/cover photo
- ✅ Follow/unfollow other people
- ✅ See my followers + who I follow

### Questions
- ✅ Browse the question feed (sorted different ways
- ✅ See only questions from people I follow
- ✅ Search for keywords
- ✅ Open a question to read the full thing
- ✅ Post a new question
- ✅ Edit my own question
- ✅ Delete my own question
- ✅ Upvote/downvote a question (toggle)
- ✅ Save/unsave a question (toggle)
- ✅ See my saved questions
- ✅ See all questions I posted

### Comments
- ✅ Comment on a question
- ✅ See all comments on a question (top comments or newest)
- ✅ Delete my own comments
- ✅ Like/dislike any comment (toggle)

### Jobs
- ✅ Browse all jobs (search + filters)
- ✅ Open a job to read the full posting
- ✅ Post a new job opening
- ✅ Delete my own job posting
- ✅ Save/unsave a job (toggle)
- ✅ See my saved jobs

### Leaderboard
- ✅ See the top 50 contributors

### Developer / Admin Things
- ✅ See the API docs / playground page
- ✅ See detailed logs of everything happening (for debugging)
- ❌ Report bad content (coming later)
- ❌ Admin dashboard (coming later)

---

## Wrap That's everything that's built into the LastMinPrep backend so far!

The platform is ready for people to start posting, asking, following, and finding jobs.

---

*Written in plain English for everyone to understand.*
*Last updated: 2026-07-27*
