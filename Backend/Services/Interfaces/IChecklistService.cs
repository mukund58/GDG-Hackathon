namespace Backend.Services.Interfaces;

using Backend.Models.DTOs;

public interface IChecklistService
{
    Task<ChecklistItemDto> AddChecklistItemAsync(Guid taskId, CreateChecklistItemDto dto);
    Task<List<ChecklistItemDto>> GetTaskChecklistAsync(Guid taskId);
    Task<TaskChecklistSummaryDto> GetChecklistSummaryAsync(Guid taskId);
    Task<ChecklistItemDto> UpdateChecklistItemAsync(Guid checklistItemId, UpdateChecklistItemDto dto);
    Task<ChecklistItemDto> ToggleCompletionAsync(Guid checklistItemId);
    Task DeleteChecklistItemAsync(Guid checklistItemId);
    Task ReorderChecklistAsync(Guid taskId, List<Guid> itemIds);
}
