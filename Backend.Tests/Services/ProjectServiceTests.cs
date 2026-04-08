namespace Backend.Tests.Services;

using Backend.Data;
using Backend.Models.DTOs;
using Backend.Models.Entities;
using Backend.Services.Implementations;
using Microsoft.EntityFrameworkCore;

public class ProjectServiceTests
{
    [Fact]
    public async Task Create_SetsOwnerUserId()
    {
        await using var context = CreateContext();
        var ownerUserId = Guid.NewGuid();

        context.Users.Add(new User
        {
            Id = ownerUserId,
            Name = "Owner",
            Email = "owner@example.com",
            PasswordHash = "hash",
            Role = "User"
        });
        await context.SaveChangesAsync();

        var service = new ProjectService(context);

        var project = await service.Create(new ProjectDto
        {
            Name = "Access Control Project",
            Description = "Project with owner"
        }, ownerUserId);

        Assert.Equal(ownerUserId, project.OwnerUserId);

        var persisted = await context.Projects.SingleAsync(x => x.Id == project.Id);
        Assert.Equal(ownerUserId, persisted.OwnerUserId);
    }

    [Fact]
    public async Task GetAccessibleProjects_ForRegularUser_ReturnsOwnedAndAssignedProjects()
    {
        await using var context = CreateContext();

        var currentUserId = Guid.NewGuid();
        var otherUserId = Guid.NewGuid();

        context.Users.AddRange(
            new User { Id = currentUserId, Name = "Current", Email = "current@example.com", PasswordHash = "hash", Role = "User" },
            new User { Id = otherUserId, Name = "Other", Email = "other@example.com", PasswordHash = "hash", Role = "User" });

        var ownedProject = new Project
        {
            Id = Guid.NewGuid(),
            Name = "Owned",
            Description = "Owned project",
            OwnerUserId = currentUserId
        };

        var assignedProject = new Project
        {
            Id = Guid.NewGuid(),
            Name = "Assigned",
            Description = "Assigned task project",
            OwnerUserId = otherUserId
        };

        var hiddenProject = new Project
        {
            Id = Guid.NewGuid(),
            Name = "Hidden",
            Description = "No access",
            OwnerUserId = otherUserId
        };

        context.Projects.AddRange(ownedProject, assignedProject, hiddenProject);

        context.Tasks.Add(new TaskItem
        {
            Id = Guid.NewGuid(),
            Title = "Assigned Task",
            Description = "Task assigned to current user",
            Status = "Todo",
            Priority = "Medium",
            ProjectId = assignedProject.Id,
            AssignedUserId = currentUserId,
            CreatedAt = DateTime.UtcNow
        });

        await context.SaveChangesAsync();

        var service = new ProjectService(context);
        var result = await service.GetAccessibleProjects(currentUserId, elevatedAccess: false);

        Assert.Equal(2, result.Count);
        Assert.Contains(result, p => p.Id == ownedProject.Id);
        Assert.Contains(result, p => p.Id == assignedProject.Id);
        Assert.DoesNotContain(result, p => p.Id == hiddenProject.Id);
    }

    [Fact]
    public async Task HasWriteAccess_ForRegularUser_TrueOnlyForOwnedProject()
    {
        await using var context = CreateContext();

        var currentUserId = Guid.NewGuid();
        var otherUserId = Guid.NewGuid();

        context.Users.AddRange(
            new User { Id = currentUserId, Name = "Current", Email = "current@example.com", PasswordHash = "hash", Role = "User" },
            new User { Id = otherUserId, Name = "Other", Email = "other@example.com", PasswordHash = "hash", Role = "User" });

        var ownedProject = new Project
        {
            Id = Guid.NewGuid(),
            Name = "Owned",
            Description = "Owned",
            OwnerUserId = currentUserId
        };

        var foreignProject = new Project
        {
            Id = Guid.NewGuid(),
            Name = "Foreign",
            Description = "Foreign",
            OwnerUserId = otherUserId
        };

        context.Projects.AddRange(ownedProject, foreignProject);
        await context.SaveChangesAsync();

        var service = new ProjectService(context);

        var canWriteOwned = await service.HasWriteAccess(ownedProject.Id, currentUserId, elevatedAccess: false);
        var canWriteForeign = await service.HasWriteAccess(foreignProject.Id, currentUserId, elevatedAccess: false);

        Assert.True(canWriteOwned);
        Assert.False(canWriteForeign);
    }

    [Fact]
    public async Task HasReadAccess_ForElevatedUser_AllowsExistingProject()
    {
        await using var context = CreateContext();

        var project = new Project
        {
            Id = Guid.NewGuid(),
            Name = "Any Project",
            Description = "Any",
            OwnerUserId = Guid.NewGuid()
        };

        context.Projects.Add(project);
        await context.SaveChangesAsync();

        var service = new ProjectService(context);

        var canRead = await service.HasReadAccess(project.Id, Guid.NewGuid(), elevatedAccess: true);

        Assert.True(canRead);
    }

    private static AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }
}