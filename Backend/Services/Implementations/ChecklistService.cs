namespace Backend.Services.Implementations;

using Backend.Models.DTOs;
using Backend.Models.Entities;
using Backend.Data;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

public class ChecklistService : IChecklistService
{
    private readonly AppDbContext _context;

    public ChecklistService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ChecklistItemDto> AddChecklistItemAsync(Guid taskId, CreateChecklistItemDto dto)
    {
        // Verify task exists
        var task = await _context.Tasks
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(t => t.Id == taskId);

        if (task == null)
            throw new KeyNotFoundException("Task not found");

        var checklistItem = new ChecklistItem
        {
            TaskId = taskId,
            Title = dto.Title,
            Order = dto.Order,
            CreatedAt = DateTime.UtcNow
        };

        _context.ChecklistItems.Add(checklistItem);
        await _context.SaveChangesAsync();

        return MapToDto(checklistItem);
    }

    public async Task<List<ChecklistItemDto>> GetTaskChecklistAsync(Guid taskId)
    {
        var items = await _context.ChecklistItems
            .AsNoTracking()
            .IgnoreQueryFilters()
            .Where(ci => ci.TaskId == taskId && !ci.IsDeleted)
            .OrderBy(ci => ci.Order)
            .ToListAsync();

        return items.Select(MapToDto).ToList();
    }

    public async Task<TaskChecklistSummaryDto> GetChecklistSummaryAsync(Guid taskId)
    {
        var items = await _context.ChecklistItems
            .AsNoTracking()
            .IgnoreQueryFilters()
            .Where(ci => ci.TaskId == taskId && !ci.IsDeleted)
            .ToListAsync();

        var total = items.Count;
        var completed = items.Count(ci => ci.IsCompleted);

        return new TaskChecklistSummaryDto
        {
            TotalItems = total,
            CompletedItems = completed,
            PercentageComplete = total > 0 ? (completed / (double)total) * 100 : 0
        };
    }

    public async Task<ChecklistItemDto> UpdateChecklistItemAsync(Guid checklistItemId, UpdateChecklistItemDto dto)
    {
        var item = await GetChecklistItemByIdOrThrowAsync(checklistItemId);

        item.Title = dto.Title;
        item.Order = dto.Order;

        // If marking as completed, set CompletedAt
        if (dto.IsCompleted && !item.IsCompleted)
        {
            item.IsCompleted = true;
            item.CompletedAt = DateTime.UtcNow;
        }
        else if (!dto.IsCompleted && item.IsCompleted)
        {
            item.IsCompleted = false;
            item.CompletedAt = null;
        }

        await _context.SaveChangesAsync();

        return MapToDto(item);
    }

    public async Task<ChecklistItemDto> ToggleCompletionAsync(Guid checklistItemId)
    {
        var item = await GetChecklistItemByIdOrThrowAsync(checklistItemId);

        item.IsCompleted = !item.IsCompleted;
        item.CompletedAt = item.IsCompleted ? DateTime.UtcNow : null;

        await _context.SaveChangesAsync();

        return MapToDto(item);
    }

    public async Task DeleteChecklistItemAsync(Guid checklistItemId)
    {
        var item = await GetChecklistItemByIdOrThrowAsync(checklistItemId);

        item.IsDeleted = true;
        await _context.SaveChangesAsync();
    }

    public async Task ReorderChecklistAsync(Guid taskId, List<Guid> itemIds)
    {
        // Verify task exists
        var task = await _context.Tasks
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(t => t.Id == taskId);

        if (task == null)
            throw new KeyNotFoundException("Task not found");

        var items = await _context.ChecklistItems
            .IgnoreQueryFilters()
            .Where(ci => ci.TaskId == taskId && !ci.IsDeleted)
            .ToListAsync();

        // Reorder based on the provided list
        for (int i = 0; i < itemIds.Count; i++)
        {
            var item = items.FirstOrDefault(it => it.Id == itemIds[i]);
            if (item != null)
            {
                item.Order = i;
            }
        }

        await _context.SaveChangesAsync();
    }

    private async Task<ChecklistItem> GetChecklistItemByIdOrThrowAsync(Guid checklistItemId)
    {
        var item = await _context.ChecklistItems
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(ci => ci.Id == checklistItemId && !ci.IsDeleted);

        if (item == null)
            throw new KeyNotFoundException("Checklist item not found");

        return item;
    }

    private ChecklistItemDto MapToDto(ChecklistItem item)
    {
        return new ChecklistItemDto
        {
            Id = item.Id,
            Title = item.Title,
            IsCompleted = item.IsCompleted,
            Order = item.Order,
            TaskId = item.TaskId,
            CreatedAt = item.CreatedAt,
            CompletedAt = item.CompletedAt
        };
    }
}
