# NOVA — Team Productivity Platform

![NOVA Platform](https://img.shields.io/badge/Status-Verified_Production-success?style=for-the-badge)
![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-5.22-2d3748?style=for-the-badge&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Production-4169e1?style=for-the-badge&logo=postgresql)

> **Tagline:** Plan. Collaborate. Deliver.  
> **Primary Candidate & Lead:** Dheeraj Kumar (`dheeraj@nova.app`)

---

## 🌟 Overview

**NOVA** is a high-velocity team productivity and project workspace platform built from the visual source of truth provided by **Google Stitch**.

The application translates Stitch's precision dark-first design system (`#0b1326` slate canvas, Geist typography, JetBrains Mono telemetry labels, electric cyan collaboration cues, emerald completion indicators, and indigo focal accents) into a production-ready, full-stack web application.

---

## 🚀 Key Features

### 1. 📊 Dynamic Live Dashboard (`/`)
- **Contextual Greeting Hero Card:** Displays "Good morning, Dheeraj", live workspace status pulse, and current time telemetry.
- **Bento Metric Cards:** Live calculated statistics for **Total Projects**, **Active Projects**, **Due Soon / Urgent Tasks**, and **Completed Tasks Velocity**.
- **Task Pipeline Filter Bar:** Interactive pills (`All`, `To Do`, `In Progress`, `Review`, `Completed`) showing real-time task counts.
- **Key Projects Stream:** Horizontal project cards with dynamic progress calculation (`completed tasks / total tasks × 100`), member avatars, and target deadlines.
- **Recent Team Activity Feed:** Real-time timeline logging task creations, status updates, and team comments.

### 2. 📁 Projects Directory (`/projects`)
- **Multi-View Interface:** Instant toggle between Grid and List layouts.
- **Search & Tactical Filters:** Live keyword search with status filters (`All`, `In Progress`, `Planning`, `On Hold`, `Completed`).
- **Project CRUD:** Create new projects with name, description, priority, dates, and member assignments; delete confirmation modal.

### 3. 📋 Kanban Project Workspace (`/projects/[id]`)
- **Interactive Drag & Drop Board:** Smooth HTML5 drag-and-drop across status columns (`To Do`, `In Progress`, `In Review`, `Completed`).
- **Real-Time Data Persistence:** Dragging a card instantly updates task status in PostgreSQL/Prisma, triggering recalculations for project completion gauges and dashboard telemetry.
- **Sprint Pace & Gauge:** Dynamic progress bar showing sprint velocity.
- **Project Workspace Tabs:** Kanban Board, List View, Team Members, and Activity Log.

### 4. 📝 Task Details & Collaboration Experience (`/projects/[id]/tasks/[taskId]`)
- **Status & Priority Pickers:** Inline dropdowns to update status and priority (`Urgent`, `High`, `Medium`, `Low`).
- **Interactive Subtasks Checklist:** Toggle completion states, progress gauge (`2/4 completed`), and inline new subtask addition form.
- **Team Comments & Discussion:** Real-time comment stream with commenter avatars and timestamps.
- **Attachment Metadata:** View attached mockups, specs, and design tokens.

### 5. 🔍 Global Search (`⌘K` Modal)
- Press `⌘K` or click the search bar anywhere in the app to search across projects, task keys (`NOV-104`), and team members.

### 6. 🔔 Notification System (`/notifications`)
- Unread indicator badge in header, popover dropdown, and mark-all-read capability.

### 7. 📅 Task Calendar (`/calendar`)
- Monthly/weekly deadline visualization.

### 8. 📈 Productivity & Velocity Reports (`/reports`)
- Calculated analytics for task status distribution, sprint completion velocity, and workload metrics.

### 9. 🔒 Session Authentication & Protection
- Auth.js / NextAuth session persistence with bcrypt password hashing.
- One-click demo login buttons for Dheeraj Kumar and team members for rapid evaluation.

---

## 🛠 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5.6
- **Styling:** Tailwind CSS 3.4 + `@tailwindcss/typography`
- **Typography:** Geist & JetBrains Mono (Google Fonts)
- **Icons:** Lucide React & Material Symbols
- **ORM:** Prisma 5.21
- **Database:** PostgreSQL (Production) / SQLite (Zero-config local development)
- **Authentication:** Auth.js / NextAuth.js
- **State & Utilities:** `clsx`, `tailwind-merge`, `date-fns`, `zod`

---

## 🔐 Demo Credentials

| Role | Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **Primary Lead** | **Dheeraj Kumar** | `dheeraj@nova.app` | `password123` |
| Frontend Architect | Rahul Sharma | `rahul@nova.app` | `password123` |
| Product Designer | Priya Singh | `priya@nova.app` | `password123` |
| Mobile Engineer | Aman Kumar | `aman@nova.app` | `password123` |

> *Note: Clickable demo login buttons are provided on the login page for rapid evaluation.*

---

## 🗄 Database Schema (Prisma)

```prisma
model User {
  id            String          @id @default(cuid())
  name          String?
  email         String          @unique
  password      String?
  image         String?
  role          String          @default("Member")
  ownedProjects Project[]       @relation("ProjectOwner")
  memberships   ProjectMember[]
  assignedTasks Task[]          @relation("TaskAssignee")
  comments      Comment[]
  activities    Activity[]
  notifications Notification[]
}

model Project {
  id          String          @id @default(cuid())
  name        String
  description String?
  status      String          @default("IN_PROGRESS")
  priority    String          @default("MEDIUM")
  startDate   DateTime?
  dueDate     DateTime?
  ownerId     String
  members     ProjectMember[]
  tasks       Task[]
}

model Task {
  id          String       @id @default(cuid())
  key         String       // e.g. NOV-104
  title       String
  description String?
  status      String       @default("TODO")
  priority    String       @default("MEDIUM")
  position    Int          @default(0)
  dueDate     DateTime?
  projectId   String
  assigneeId  String?
  subtasks    Subtask[]
  comments    Comment[]
  attachments Attachment[]
}
```

---

## ⚡ Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/dhiraj128/nova-team-productivity-platform.git
cd nova-team-productivity-platform
```

### 2. Install dependencies
```bash
pnpm install
# or npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 4. Database Setup & Seed Data
```bash
pnpm exec prisma db push
pnpm run db:seed
```

### 5. Run Automated HTTP API & Integration Tests
```bash
pnpm test
```
The test suite executes 34 automated assertions testing:
- **Authentication Security:** bcrypt password verification and unauthenticated request rejection (`401 Unauthorized`).
- **User Isolation:** Notification privacy enforcement (User A cannot view or update User B's notifications).
- **HTTP API Kanban Drag-and-Drop:** Task status transitions (`TODO` -> `IN_PROGRESS` -> `REVIEW` -> `COMPLETED`) via API and database persistence.
- **Project & Task CRUD:** Real HTTP request validation for project creation, task management, subtask toggles, comments, and global search.
- **Progress Math:** Dynamic completion rate calculation and zero-division defense.

---

## 🚀 Production Deployment (Vercel)

1. Connect the GitHub repository `dhiraj128/nova-team-productivity-platform` to Vercel.
2. Set Environment Variables:
   - `DATABASE_URL`: PostgreSQL connection string (Neon, Supabase, Vercel Postgres)
   - `NEXTAUTH_URL`: Production application URL
   - `NEXTAUTH_SECRET`: Secret token (32+ characters)
3. Deploy!

---

## 📄 License & Attribution

Designed based on Google Stitch's visual source of truth for the NOVA Team Productivity Platform Intern Assignment. Implemented completely by **Dheeraj Kumar**.
