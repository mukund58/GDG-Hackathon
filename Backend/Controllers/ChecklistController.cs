namespace Backend.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.Models.DTOs;
using Backend.Services.Interfaces;
using System.Security.Claims;

[ApiController]
[Route("api/tasks/{taskId}/checklist")]
[Authorize]
public class ChecklistController : ControllerBase
{
    private readonly IChecklistService _service;
    private readonly ITaskService _taskService;

    public ChecklistController(IChecklistService service, ITaskService taskService)
    {
        _service = service;
        _taskService = taskService;
    }

    /// <summary>
    /// Add a checklist item to a task
    /// </summary>
    [HttpPost]
    [Authorize(Policy = "TaskRead")]
    public async Task<IActionResult> AddChecklistItem(Guid taskId, [FromBody] CreateChecklistItemDto dto)
    {
        try
        {
            await EnsureTaskAccessAsync(taskId);
            var item = await _service.AddChecklistItemAsync(taskId, dto);
            return Ok(ApiResponseDto<ChecklistItemDto>.Ok(item, "Checklist item added"));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponseDto<object>.Fail(ex.Message));
        }
    }

    /// <summary>
    /// Get all checklist items for a task
    /// </summary>
    [HttpGet]
    [Authorize(Policy = "TaskRead")]
    public async Task<IActionResult> GetTaskChecklist(Guid taskId)
    {
        try
        {
            await EnsureTaskAccessAsync(taskId);
            var items = await _service.GetTaskChecklistAsync(taskId);
            return Ok(ApiResponseDto<List<ChecklistItemDto>>.Ok(items, "Checklist retrieved"));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponseDto<object>.Fail(ex.Message));
        }
    }

    /// <summary>
    /// Get checklist summary with completion percentage
    /// </summary>
    [HttpGet("summary")]
    [Authorize(Policy = "TaskRead")]
    public async Task<IActionResult> GetChecklistSummary(Guid taskId)
    {
        try
        {
            await EnsureTaskAccessAsync(taskId);
            var summary = await _service.GetChecklistSummaryAsync(taskId);
            return Ok(ApiResponseDto<TaskChecklistSummaryDto>.Ok(summary, "Checklist summary retrieved"));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponseDto<object>.Fail(ex.Message));
        }
    }

    /// <summary>
    /// Update a checklist item
    /// </summary>
    [HttpPut("{checklistItemId}")]
    [Authorize(Policy = "TaskRead")]
    public async Task<IActionResult> UpdateChecklistItem(Guid taskId, Guid checklistItemId, [FromBody] UpdateChecklistItemDto dto)
    {
        try
        {
            await EnsureTaskAccessAsync(taskId);
            var item = await _service.UpdateChecklistItemAsync(checklistItemId, dto);
            return Ok(ApiResponseDto<ChecklistItemDto>.Ok(item, "Checklist item updated"));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponseDto<object>.Fail(ex.Message));
        }
    }

    /// <summary>
    /// Toggle completion status of a checklist item
    /// </summary>
    [HttpPatch("{checklistItemId}/toggle")]
    [Authorize(Policy = "TaskRead")]
    public async Task<IActionResult> ToggleCompletion(Guid taskId, Guid checklistItemId)
    {
        try
        {
            await EnsureTaskAccessAsync(taskId);
            var item = await _service.ToggleCompletionAsync(checklistItemId);
            return Ok(ApiResponseDto<ChecklistItemDto>.Ok(item, "Checklist item toggled"));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponseDto<object>.Fail(ex.Message));
        }
    }

    /// <summary>
    /// Delete a checklist item
    /// </summary>
    [HttpDelete("{checklistItemId}")]
    [Authorize(Policy = "TaskRead")]
    public async Task<IActionResult> DeleteChecklistItem(Guid taskId, Guid checklistItemId)
    {
        try
        {
            await EnsureTaskAccessAsync(taskId);
            await _service.DeleteChecklistItemAsync(checklistItemId);
            return Ok(ApiResponseDto<object>.Ok(null, "Checklist item deleted"));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponseDto<object>.Fail(ex.Message));
        }
    }

    /// <summary>
    /// Reorder checklist items
    /// </summary>
    [HttpPost("reorder")]
    [Authorize(Policy = "TaskRead")]
    public async Task<IActionResult> ReorderChecklist(Guid taskId, [FromBody] List<Guid> itemIds)
    {
        try
        {
            await EnsureTaskAccessAsync(taskId);
            await _service.ReorderChecklistAsync(taskId, itemIds);
            return Ok(ApiResponseDto<object>.Ok(null, "Checklist reordered"));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponseDto<object>.Fail(ex.Message));
        }
    }

    private bool HasElevatedAccess()
    {
        return User.IsInRole("Admin") || User.IsInRole("Manager");
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(userIdClaim, out var userId))
            throw new UnauthorizedAccessException("Invalid user context");

        return userId;
    }

    private async Task<Backend.Models.Entities.TaskItem> EnsureTaskAccessAsync(Guid taskId)
    {
        var task = await _taskService.GetById(taskId);

        if (HasElevatedAccess())
            return task;

        var currentUserId = GetCurrentUserId();

        if (task.AssignedUserId != currentUserId)
            throw new UnauthorizedAccessException("You can only access your own tasks");

        return task;
    }
}
