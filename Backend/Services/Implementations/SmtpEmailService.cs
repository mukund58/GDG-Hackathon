namespace Backend.Services.Implementations;

using System.Net;
using System.Net.Mail;
using Backend.Services.Interfaces;

public class SmtpEmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public SmtpEmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendProjectInvitationEmail(
        string recipientEmail,
        string projectName,
        string inviterName,
        string role,
        DateTime expiresAt)
    {
        var smtpHost = Environment.GetEnvironmentVariable("SMTP_HOST")
            ?? _configuration["Email:SmtpHost"];

        var smtpPortRaw = Environment.GetEnvironmentVariable("SMTP_PORT")
            ?? _configuration["Email:SmtpPort"];

        var smtpUser = Environment.GetEnvironmentVariable("SMTP_USERNAME")
            ?? _configuration["Email:Username"];

        var smtpPassword = Environment.GetEnvironmentVariable("SMTP_PASSWORD")
            ?? _configuration["Email:Password"];

        var fromAddress = Environment.GetEnvironmentVariable("SMTP_FROM_ADDRESS")
            ?? _configuration["Email:FromAddress"];

        var fromName = Environment.GetEnvironmentVariable("SMTP_FROM_NAME")
            ?? _configuration["Email:FromName"]
            ?? "GDG Taskboard";

        var useSslRaw = Environment.GetEnvironmentVariable("SMTP_USE_SSL")
            ?? _configuration["Email:UseSsl"];

        if (string.IsNullOrWhiteSpace(smtpHost))
            throw new InvalidOperationException("SMTP host is not configured");

        if (string.IsNullOrWhiteSpace(fromAddress))
            throw new InvalidOperationException("SMTP from address is not configured");

        if (!int.TryParse(smtpPortRaw, out var smtpPort))
            smtpPort = 587;

        var useSsl = true;
        if (!string.IsNullOrWhiteSpace(useSslRaw) && bool.TryParse(useSslRaw, out var parsedUseSsl))
            useSsl = parsedUseSsl;

        var subject = $"You are invited to join {projectName}";

        var body = $@"Hello,

    You have been invited by {inviterName} to join the project ""{projectName}"" as {role}.

    Invitation expiry: {expiresAt:yyyy-MM-dd HH:mm} UTC

    Please sign in to your account and open the project dashboard to access this invitation.

    - GDG Taskboard";

        using var message = new MailMessage
        {
            From = new MailAddress(fromAddress, fromName),
            Subject = subject,
            Body = body,
            IsBodyHtml = false
        };

        message.To.Add(recipientEmail);

        using var smtpClient = new SmtpClient(smtpHost, smtpPort)
        {
            EnableSsl = useSsl,
            DeliveryMethod = SmtpDeliveryMethod.Network,
            UseDefaultCredentials = false
        };

        if (!string.IsNullOrWhiteSpace(smtpUser))
        {
            smtpClient.Credentials = new NetworkCredential(smtpUser, smtpPassword ?? string.Empty);
        }

        await smtpClient.SendMailAsync(message);
    }
}
