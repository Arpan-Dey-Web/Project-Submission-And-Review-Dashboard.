# Associate Web Instructor — Hiring Task

> This assessment evaluates your **engineering ability**, **judgment**, **technical
> communication**, and **teaching perception**. You will build a full-stack feature,
> followed by producing **two short video lessons** (more on that later).
>
> **Before starting anything, read the whole document from top to bottom.**

---

## Part 1 — The Project

Build a simple **project submission and review dashboard**.

Initially you can keep your GitHub repo **private**. But after the submission deadline
you **must make your repository public**. If your repository is not reachable then your
submission will be **disqualified**.

### Technical Stack

- **Programming Language:** TypeScript
- **Frontend:** Next.js, TailwindCSS, ShadCN
- **Backend:** Express.js
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** JWT based Role-Based Access Control

### Feature Requirements

#### 1. Submission Portal (Student View)

- [ ] A form to submit project details (**Project name, Repo URL, Live Link, Description**)
- [ ] Implement **robust validation** and prevent **duplicate submission**
- [ ] Implement a basic **rate limit** to prevent spam

#### 2. Review Dashboard (Mentor View)

- [ ] **Paginated data table**
- [ ] **Approval and rejection** action
- [ ] Filter to show **"Approved"** and **"Rejected"** projects (**filters must be implemented server-side**)
- [ ] **Aggregated statistics** (e.g. Total Pending, Total Approved)

#### 3. Authentication Page

- [ ] **Login** page
- [ ] **Signup** page for student
- [ ] For now you can **seed the admin** directly in the database

> **Note:** There are some ambiguities left in the feature requirements **intentionally**.
> Use your best judgment to fill them in.

---

## Part 2 — Video Contents

You need to act as a **mentor** and create **2 videos in Bengali** for your students
teaching the topics.

**Rules:**

- Each video: **10 to 12 minutes max**.
- You must record using **OBS**.
- Your **face must be visible** — facecam in the **lower-right corner** of the screen
  (normal webcam or phone is fine; don't worry about facecam resolution).
- Choose **one topic from each category** (one Theoretical + one Hands-on).
  ⚠️ **Two topics from the same category (e.g. 1B + 1D) = immediate disqualification.**
- The topics are related to **this project itself** — no separate demo project needed.
  Use the project as teaching material (e.g. explaining Next.js render strategies via
  your own form/dashboard code).

### Category 1 — Theoretical Video

Explain a web development concept **simply and clearly, focusing on the "why"** rather
than just the syntax. Code implementation is **not** obligatory. You can use diagrams,
images, presentation slides, tablet, etc.

**Choose only ONE topic:**

| Topic | Title | Summary |
| --- | --- | --- |
| **1A** | The N+1 Query Problem | What the N+1 problem is in ORMs (Prisma/Drizzle), why it degrades DB performance at scale, and the theoretical approach to solving it. |
| **1B** | The Architecture of Caching | Why a high-traffic web app might need a caching layer (like Redis) in front of PostgreSQL — using the **dashboard statistics feature** as a real-world analogy. |
| **1C** | Authentication vs. Authorization (RBAC) | Conceptual difference between verifying identity (AuthN) and Role-Based Access Control (AuthZ). How a server securely differentiates Student vs Mentor without compromising performance. |
| **1D** | Next.js Rendering Strategies | Server vs Client Components in the App Router. Performance and security trade-offs, and why a developer would choose one for a data submission form. |

### Category 2 — Hands-on Coding Demonstration Video

Demonstrate your ability to **write clean code live**, explain your reasoning, and
anticipate **beginner mistakes**.

**Choose only ONE topic:**

| Topic | Title | Summary |
| --- | --- | --- |
| **2A** | Securing a Route | Live code a backend route handler: extract user ID from auth token, query the database, and **definitively verify** the user has right access before allowing a status update. |
| **2B** | Database Schema & Relations | Live code the **Prisma schema creation**. Explain one-to-many / many-to-many relations between Users, Submissions, and Feedback, and your modeling thought process. |
| **2C** | State Management & Data Fetching | Live code data fetching for the **Mentor Dashboard**. Loading states, **cache invalidation**, and UI error boundaries. |
| **2D** | Defensive Form Validation | Live code a robust form submission flow with **Zod** validation to prevent malformed data / duplicate submissions, and surface validation errors gracefully in the frontend. |

---

## Submission Guideline

You will submit through a **Google Form** (we will share it) with:

1. **GitHub repository link**
2. **Two video links** (unlisted YouTube or Google Drive with open view permission)

> All tasks mentioned in this document are **required**. There are _no optional tasks_.
> Missing any one will result in point deduction.

Thank you and best of luck 🎯





<!-- Video i will create -->

<!-- 
Topic 1C = Authentication vs. Authorization (RBAC): Demystify the conceptual difference
between verifying identity (AuthN) and Role-Based Access Control (AuthZ). Explain how a
server securely differentiates between a Student and a Mentor without compromising
performance.
-->

<!-- 
Topic 2D = Defensive Form Validation: Live code a robust form submission flow. Show how to
implement strict validation (e.g., using Zod) to prevent malformed data or duplicate submissions,
and demonstrate how to surface those validation errors gracefully to the user in the frontend.
-->