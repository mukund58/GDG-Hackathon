## 🎯 EXACT FEATURES (FINAL VERSION)

### 🟢 CORE (MUST HAVE — non-negotiable)

### 🔐 Auth System

- [x] Register / Login
- [ ] JWT based auth
- [ ] Refresh token (optional but 🔥 bonus)
- [ ] Roles:
  - [ ] Admin
  - [ ] User
- [x] Password hashing (BCrypt)

### 📋 Task Management (REAL CORE)

- [x] Create task
- [x] Assign user
- [ ] Update task
- [ ] Delete task
- [x] Status:
  - [x] Todo
  - [x] In Progress
  - [x] Done
- [ ] Priority:
  - [ ] Low / Medium / High
- [ ] Filter:
  - [ ] By status
  - [ ] By assigned user
- [ ] Pagination (`?page=1&pageSize=10`)

### 👥 User Workload Tracking

- [ ] Count tasks per user
- [ ] Active tasks
- [ ] Completed tasks
- [ ] Overdue tasks (optional but impressive)

### 📊 Dashboard (KEEP SIMPLE BUT SMART)

- [ ] Tasks per user
- [ ] Pending vs completed
- [ ] Workload distribution
- [ ] Total tasks
- [ ] Total users

### 🤖 AI Feature — Smart Assignment

- [ ] Suggest best user
- [ ] Suggest priority
- [ ] Return explanation
- [ ] Use Gemini API
- [ ] Fallback logic (if AI fails -> basic logic)
  - Example: Assign user with least tasks

### 🌐 Deployment

- [ ] Backend → Render
- [ ] Frontend → Vercel
- [ ] DB → PostgreSQL

### 🟡 GOOD TO HAVE

- [ ] Notifications (basic)
- [ ] AI prioritization

---

## ✅ Minimum APIs (UPDATED)

### Auth

- [x] POST `/auth/register`
- [x] POST `/auth/login`

### Users

- [ ] GET `/users`
- [ ] GET `/users/:id`

### Tasks

- [x] POST `/tasks`
- [x] GET `/tasks`
- [ ] GET `/tasks/:id`
- [ ] PUT `/tasks/:id`
- [ ] DELETE `/tasks/:id`
- [ ] PATCH `/tasks/:id/status`
- [ ] PATCH `/tasks/:id/assign`

### Dashboard

- [ ] GET `/dashboard`

### AI

- [ ] POST `/ai/suggest-assignment`

---

## 🧠 Backend Checklist (IMPORTANT FIXES)

### ✅ MUST

- [ ] Authentication (JWT)
- [ ] Authorization (roles + ownership)
- [ ] Validation (FluentValidation)
- [ ] Logging (Serilog or basic)
- [ ] CORS
- [ ] Exception middleware

### ⚡ SHOULD HAVE

- [ ] Pagination
- [ ] Filtering
- [ ] Seeding (test data)
- [ ] API versioning (`/api/v1`)
- [ ] Rate limiting
- [ ] Soft delete

### 🔥 BONUS

- [ ] Caching (Redis)

---

## 🔥 What Makes Your Project Stand Out

### 1. Activity Log (IMPORTANT)

- [ ] Track actions:
  - [ ] task created
  - [ ] task assigned
  - [ ] status changed

### 2. Ownership Security

- [ ] User can only access their tasks

### 3. Clean API Responses

- [ ] Use DTOs
- [ ] No raw entities

---

## 🧱 Simple Architecture

- [ ] Frontend (React)
- [x] Backend (.NET API)
- [x] PostgreSQL
- [ ] Gemini API
