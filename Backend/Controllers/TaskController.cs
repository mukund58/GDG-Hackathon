namespace Backend.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.Models.DTOs;
using Backend.Services.Interfaces;

[ApiController]
[Route("api/tasks")]
[Authorize]
public class TaskController : ControllerBase
{
    private readonly ITaskService _service;

    public TaskController(ITaskService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTaskDto dto)
    {
        return Ok(await _service.Create(dto));
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? status, [FromQuery] Guid? assignedTo)
    {
        return Ok(await _service.GetAll(status, assignedTo));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTaskDto dto)
    {
        try
        {
            return Ok(await _service.Update(id, dto));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Task not found" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            await _service.Delete(id);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Task not found" });
        }
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateTaskStatusDto dto)
    {
        return Ok(await _service.UpdateStatus(id, dto.Status));
    }

    [HttpPatch("{id}/assign")]
    public async Task<IActionResult> Assign(Guid id, [FromBody] AssignTaskDto dto)
    {
        return Ok(await _service.Assign(id, dto.UserId));
    }
}