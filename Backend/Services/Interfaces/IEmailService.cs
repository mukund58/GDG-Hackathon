namespace Backend.Services.Interfaces;

public interface IEmailService
{
    Task SendProjectInvitationEmail(
        string recipientEmail,
        string projectName,
        string inviterName,
        string role,
        DateTime expiresAt,
        string? invitationUrl = null);

    Task SendTaskMentionEmail(
        string recipientEmail,
        string recipientName,
        string commenterName,
        string taskTitle,
        string commentContent);
}
