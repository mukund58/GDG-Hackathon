namespace Backend.Models.DTOs;

public class CreateChecklistItemDto
{
    public string Title { get; set; } = string.Empty;
    public int Order { get; set; } = 0;
}

public class UpdateChecklistItemDto
{
    public string Title { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
    public int Order { get; set; }
}

public class ChecklistItemDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
    public int Order { get; set; }
    public Guid TaskId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}

public class TaskChecklistSummaryDto
{
    public int TotalItems { get; set; }
    public int CompletedItems { get; set; }
    public double PercentageComplete { get; set; } // 0-100
}
