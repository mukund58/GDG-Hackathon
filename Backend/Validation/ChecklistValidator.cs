namespace Backend.Validation;

using FluentValidation;
using Backend.Models.DTOs;

public class CreateChecklistItemDtoValidator : AbstractValidator<CreateChecklistItemDto>
{
    public CreateChecklistItemDtoValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty()
            .WithMessage("Checklist item title is required")
            .MaximumLength(200)
            .WithMessage("Title must not exceed 200 characters");

        RuleFor(x => x.Order)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Order must be a non-negative number");
    }
}

public class UpdateChecklistItemDtoValidator : AbstractValidator<UpdateChecklistItemDto>
{
    public UpdateChecklistItemDtoValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty()
            .WithMessage("Checklist item title is required")
            .MaximumLength(200)
            .WithMessage("Title must not exceed 200 characters");

        RuleFor(x => x.Order)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Order must be a non-negative number");
    }
}
