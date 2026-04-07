namespace Backend.Tests.Services;

using Backend.Data;
using Backend.Models.DTOs;
using Backend.Models.Entities;
using Backend.Services.Implementations;
using Microsoft.EntityFrameworkCore;

public class TaskServiceTests
{
    [Fact]
    public async Task GetAllPaginatedAsync_AppliesFiltersSortingAndPaging()
    {
        await using var context = CreateContext();

        context.Tasks.AddRange(
            CreateTask("Beta", "Todo"),
            CreateTask("Alpha", "Todo"),
            CreateTask("Gamma", "Todo"),
            CreateTask("DoneTask", "Done"));

        await context.SaveChangesAsync();

        var service = new TaskService(context);

        var result = await service.GetAllPaginatedAsync(new TaskQueryDto
        {
            Page = 1,
            PageSize = 2,
            Status = "Todo",
            SortBy = "title",
            SortDescending = false
        });

        Assert.Equal(3, result.Total);
        Assert.Equal(2, result.Items.Count);
        Assert.Equal("Alpha", result.Items[0].Title);
        Assert.Equal("Beta", result.Items[1].Title);
        Assert.True(result.HasNextPage);
        Assert.False(result.HasPreviousPage);
    }

    [Fact]
    public async Task UpdateStatus_WhenStatusChanges_AddsStatusActivity()
    {
        await using var context = CreateContext();

        var task = CreateTask("Ship API", "Todo");
        context.Tasks.Add(task);
        await context.SaveChangesAsync();

        var actorUserId = Guid.NewGuid();
        var service = new TaskService(context);

        var updated = await service.UpdateStatus(task.Id, "Done", actorUserId);

        var activity = await context.TaskActivities.SingleAsync();

        Assert.Equal("Done", updated.Status);
        Assert.Equal("StatusChanged", activity.Action);
        Assert.Equal("Todo", activity.OldValue);
        Assert.Equal("Done", activity.NewValue);
        Assert.Equal(task.Id, activity.TaskItemId);
        Assert.Equal(actorUserId, activity.ActorUserId);
    }

    [Fact]
    public async Task AddChecklistItem_AssignsNextPosition()
    {
        await using var context = CreateContext();

        var task = CreateTask("Checklist Task", "Todo");
        context.Tasks.Add(task);
        context.ChecklistItems.AddRange(
            new ChecklistItem
            {
                Id = Guid.NewGuid(),
                TaskItemId = task.Id,
                Title = "First",
                Position = 1
            },
            new ChecklistItem
            {
                Id = Guid.NewGuid(),
                TaskItemId = task.Id,
                Title = "Second",
                Position = 2
            });

        await context.SaveChangesAsync();

        var service = new TaskService(context);

        var created = await service.AddChecklistItem(task.Id, new CreateChecklistItemDto
        {
            Title = "Third",
            Order = 99
        });

        Assert.Equal("Third", created.Title);
        Assert.Equal(3, created.Position);
    }

    [Fact]
    public async Task Delete_SoftDeletesTaskAndHidesFromDefaultQueries()
    {
        await using var context = CreateContext();

        var task = CreateTask("Soft Delete", "Todo");
        context.Tasks.Add(task);
        await context.SaveChangesAsync();

        var service = new TaskService(context);
        await service.Delete(task.Id);

        var visibleTasks = await service.GetAll(null, null);
        var rawTask = await context.Tasks.IgnoreQueryFilters().SingleAsync(x => x.Id == task.Id);

        Assert.Empty(visibleTasks);
        Assert.True(rawTask.IsDeleted);
    }

    private static AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    private static TaskItem CreateTask(string title, string status)
    {
        return new TaskItem
        {
            Id = Guid.NewGuid(),
            Title = title,
            Description = $"{title} description",
            Status = status,
            Priority = "Medium",
            ProjectId = Guid.NewGuid(),
            CreatedAt = DateTime.UtcNow
        };
    }
}
