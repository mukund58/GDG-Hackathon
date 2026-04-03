# 🤝 Contributing to This Project

Thanks for contributing to Project!
This guide will help you work efficiently and maintain clean collaboration.

---

# 📌 Project Overview

Project is a Jira-like backend system built using:

* ASP.NET Core (Controller-based API)
* Entity Framework Core
* JWT Authentication

---

# 🚀 Getting Started

## 1. Clone the Repository

```bash
git clone https://github.com/mukund58/GDG-Hackathon
cd GDG-Hackathon
```

---

## 2. Create a New Branch

Always create a feature branch before working:

```bash
git checkout -b feature/<feature-name>
```

### Example:

```bash
git checkout -b feature/project-crud
```

---

# 🧩 Workflow

## Step 1: Pick an Issue

* Go to **GitHub Issues**
* Choose an assigned issue
* Understand requirements clearly

---

## Step 2: Work on Feature

* Write clean and readable code
* Follow project structure
* Keep logic inside services (not controllers)

---

## Step 3: Commit Changes

Use meaningful commit messages:

### ✅ Good Examples:

```bash
git commit -m "Add project CRUD APIs"
git commit -m "Fix validation issue in comment API"
```

### ❌ Bad Example:

```bash
git commit -m "update"
```

---

## Step 4: Push Code

```bash
git push origin feature/<feature-name>
```

---

## Step 5: Create Pull Request (PR)

* Go to GitHub
* Create a PR to `develop` branch
* Add proper description

---

# 🧱 How to Add Any Module

Use this flow whenever you add a new feature module such as Task, Project, Comment, or Notification.

## 1. Define the Entity

Create the model in Models/Entities and decide the core fields, relationships, defaults, and timestamps.

## 2. Register It in DbContext

Add the new DbSet to AppDbContext, then run a migration. If Docker is running, the app can apply migrations automatically on startup.

## 3. Add DTOs

Create request and response DTOs in Models/DTOs so the API does not expose entities directly.

## 4. Add the Service Contract

Define the feature operations in Services/Interfaces. Keep the contract focused on the use cases the module needs.

## 5. Implement the Service

Put the business logic in Services/Implementations. This is where validation, EF Core queries, and persistence should live.

## 6. Add the Controller

Expose the module through a controller in Controllers. Keep the controller thin and delegate work to the service layer.

## 7. Register the Service

Add the dependency injection registration in Program.cs so the controller can resolve the service.

## Example Module Pattern

The Task module follows this structure:

- Entity: TaskItem
- DbContext: Tasks
- DTOs: task creation, status update, and assignment DTOs
- Interface: ITaskService
- Service: TaskService
- Controller: TaskController
- Registration: service added in Program.cs

---

# 📂 Branch Strategy

```text
master      → stable production code  
develop   → active development  
feature/* → new features  
```

---

# 🧪 Code Guidelines

* Keep controllers **thin**
* Put business logic in **services**
* Use **DTOs** (do not expose entities)
* Add validation where needed
* Write clean and readable code

---

# 🔐 Security Guidelines

* Do NOT store plain passwords
* Validate all inputs
* Use authorization where required

---

# 🐛 Reporting Bugs

If you find a bug:

* Create a new issue
* Add steps to reproduce
* Add expected vs actual behavior

---

# 💡 Suggestions

* Open an issue before major changes
* Discuss with team before refactoring

---

# ⚡ Contribution Rules

* One feature per branch
* One issue per PR
* Do not push directly to `master`
* Always create a Pull Request

---

# 🎯 Goal

Maintain:

* clean code
* proper structure
* real teamwork contribution

---

Happy coding 🚀
