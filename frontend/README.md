# Frontend Product Checklist

This checklist follows the product-oriented frontend master plan for the existing backend.

## 0. Stack Direction

- [x] Use Next.js with App Router
- [x] Use TailwindCSS as primary styling system
- [x] Add route-level SSR where useful (dashboard-heavy reads)

## 1. Folder Structure

Target structure:

```text
/app
	/auth
		/login
		/register
	/dashboard
	/projects
	/tasks
	/task/[id]

/components
	/ui
	/task
	/project
	/dashboard

/services
	api.ts
	auth.ts
	task.ts

/store
	authStore.ts
	taskStore.ts

/types
```

- [x] Baseline folders created: app, components, services, hooks, types
- [x] Add reusable ui folder and foundation components
- [x] Add feature folders: components/task, components/project, components/dashboard
- [x] Add store folder and initial stores
- [x] Add route folders: auth/login, auth/register, dashboard, projects, tasks, task/[id]

## 2. Auth Flow (Critical UX)

- [x] Create login page at /auth/login
- [x] Create register page at /auth/register
- [x] Add JWT storage utility (current implementation uses local storage)
- [x] Auto-attach JWT in API client
- [ ] Add redirect if already authenticated
- [ ] Add role-based UI rendering
- [ ] Add invalid credential and loading state UX
- [ ] Evaluate move to httpOnly cookie flow if backend supports it

## 3. Dashboard (WOW Factor)

- [ ] Create dashboard page and app layout with sidebar + topbar
- [ ] Show total tasks
- [ ] Show completed tasks
- [ ] Show active tasks
- [ ] Show overdue tasks
- [ ] Show tasks per user chart
- [ ] Show workload distribution chart
- [ ] Integrate chart library (recharts or chart.js)

## 4. Task Management UI

### Task List (/tasks)

- [ ] Build task table view
- [ ] Add optional Kanban toggle (bonus)
- [ ] Add filters: status + assigned user
- [ ] Add pagination
- [ ] Add sorting
- [ ] Show card metadata: title, priority, status, due date

### Task Details (/task/[id])

- [ ] Show task info block
- [ ] Show assigned user
- [ ] Add status dropdown update
- [ ] Add priority dropdown update
- [ ] Add due date update

### Checklist and Comments

- [ ] Add checklist item create
- [ ] Add checklist toggle complete
- [ ] Add checklist progress bar
- [ ] Add comment create
- [ ] Add comment list
- [ ] Add activity log section (if backend activity endpoint is available)

## 5. Project Management

- [ ] Create projects list page at /projects
- [ ] Create project detail page at /projects/[id]
- [ ] Create project flow
- [ ] List projects flow
- [ ] Show project tasks flow

## 6. AI Suggestion UI

- [ ] Add Suggest Assignment button
- [ ] Show suggested user
- [ ] Show suggested priority
- [ ] Show explanation text
- [ ] Present in modal or side panel

## 7. Search and Filter UX

- [ ] Add debounced search input
- [ ] Combine search + status + assigned user filters
- [ ] Keep query-state URL synced
- [ ] Support query shape like status, assignedTo, search, page

## 8. Notifications (Phase 2)

- [ ] Add toast notifications for assignment/comment/task actions
- [ ] Integrate react-hot-toast

## 9. UI Library Strategy

- [x] TailwindCSS integrated
- [x] Add shadcn/ui setup
- [x] Map existing reusable primitives to shadcn where useful

## 10. State Management

- [ ] Add Zustand for auth state
- [ ] Add TanStack Query for task data, caching, and refetch
- [ ] Replace ad hoc fetching in pages with query hooks

## 11. API Integration Standards

- [x] Centralized API client exists
- [ ] Add auth/logout handling on 401 responses
- [ ] Add service modules split by domain (auth, task, project, dashboard)
- [ ] Keep response typing consistent across services

## 12. UX Quality Bar

- [x] Skeleton loaders available
- [x] Empty states available
- [x] Error states available
- [ ] Use optimistic updates for fast actions (status changes)
- [ ] Confirm destructive actions before delete
- [ ] Avoid spinner-only pages when data is loading

## 13. MVP Frontend Checklist (Must Build First)

- [ ] Auth (login/register)
- [ ] Dashboard
- [ ] Task list with filter + pagination
- [ ] Task detail page
- [ ] Create/update task
- [ ] Comments
- [ ] Checklist

## 14. Add After MVP

- [ ] Kanban board
- [ ] Activity log UI
- [ ] AI suggestion UI
- [ ] Notifications

---

## Recommended Build Flow

1. Auth
2. Task CRUD
3. Dashboard
4. Polish UX

## Deployment Readiness

- [ ] Configure production API URL
- [x] Add .env.example for frontend variables
- [ ] Verify CORS and API integration in deployed environment
- [ ] Final responsive QA pass (desktop + mobile)
