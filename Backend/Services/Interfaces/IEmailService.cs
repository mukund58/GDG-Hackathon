namespace Backend.Services.Interfaces;

public interface IEmailService
{
    Task SendProjectInvitationEmail(
        string recipientEmail,
        string projectName,
        string inviterName,
        string role,
        DateTime expiresAt);
}
