using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.Models.DTOs;
using Backend.Services.Interface;

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
    public async Task<IActionResult> Create(CreateTaskDto dto)
    {
        return Ok(await _service.Create(dto));
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? status, [FromQuery] Guid? assignedTo)
    {
        return Ok(await _service.GetAll(status, assignedTo));
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, UpdateTaskStatusDto dto)
    {
        return Ok(await _service.UpdateStatus(id, dto.Status));
    }

    [HttpPatch("{id}/assign")]
    public async Task<IActionResult> Assign(Guid id, AssignTaskDto dto)
    {
        return Ok(await _service.Assign(id, dto.UserId));
    }
}