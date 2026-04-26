namespace Backend.Tests.Services;

using Backend.Data;
using Backend.Models.DTOs;
using Backend.Services.Implementations;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;

public class AuthServiceTests
{
    [Fact]
    public async Task Register_NormalizesEmailBeforePersisting()
    {
        await using var context = CreateContext();
        var service = CreateService(context);

        var result = await service.Register(new RegisterDto
        {
            Name = "Test User",
            Email = "  Test.User@Example.COM ",
            Password = "Password123!"
        });

        Assert.True(result.Success);
        var user = await context.Users.SingleAsync();
        Assert.Equal("test.user@example.com", user.Email);
    }

    [Fact]
    public async Task Login_AllowsCaseAndWhitespaceDifferencesInEmail()
    {
        await using var context = CreateContext();
        var service = CreateService(context);

        await service.Register(new RegisterDto
        {
            Name = "Test User",
            Email = "test.user@example.com",
            Password = "Password123!"
        });

        var result = await service.Login(new LoginDto
        {
            Email = "  TEST.User@Example.COM ",
            Password = "Password123!"
        });

        Assert.True(result.Success);
        Assert.False(string.IsNullOrWhiteSpace(result.Token));
        Assert.NotNull(result.User);
        Assert.Equal("test.user@example.com", result.User!.Email);
    }

    [Fact]
    public async Task Register_RejectsDuplicateEmailWithDifferentCase()
    {
        await using var context = CreateContext();
        var service = CreateService(context);

        await service.Register(new RegisterDto
        {
            Name = "Test User",
            Email = "test.user@example.com",
            Password = "Password123!"
        });

        var duplicateResult = await service.Register(new RegisterDto
        {
            Name = "Duplicate",
            Email = "TEST.USER@example.com",
            Password = "Password123!"
        });

        Assert.False(duplicateResult.Success);
        Assert.Equal("Email already registered", duplicateResult.Message);
    }

    private static AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    private static AuthService CreateService(AppDbContext context)
    {
        var jwtOptions = Options.Create(new JwtSettingsOptions
        {
            Secret = "test-secret-key-that-is-long-enough-for-hmac",
            Issuer = "TestIssuer",
            Audience = "TestAudience",
            ExpirationHours = 24
        });

        return new AuthService(context, jwtOptions, NullLogger<AuthService>.Instance);
    }
}
