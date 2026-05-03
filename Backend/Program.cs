using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Middleware;
using dotenv.net;
using AspNetCoreRateLimit;
using Serilog;

using Microsoft.Extensions.Options;
using Npgsql;
using Asp.Versioning;
using System.Security.Claims;
using Backend.Extensions;


// Load .env file - try from current directory, ignore if not found
try
{
    DotEnv.Load();
}
catch
{
    // .env file might not exist in container, environment variables should be set by docker-compose
}

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, services, configuration) =>
    configuration
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext());

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.Configure<SeedingOptions>(builder.Configuration.GetSection("Seeding"));
builder.Services.Configure<JwtSettingsOptions>(builder.Configuration.GetSection(JwtSettingsOptions.SectionName));

// Add Extension Services
builder.Services.AddRedisCache(builder.Configuration);
builder.Services.AddRateLimiting(builder.Configuration);
builder.Services.AddControllers();
builder.Services.AddApiVersioningConfig();
builder.Services.AddAuthAndAuthorization(builder.Configuration);
builder.Services.AddApplicationServices();
builder.Services.AddSwaggerConfig();

var connectionString = Environment.GetEnvironmentVariable("CONNECTION_STRING");

if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException("Database connection string is missing or empty. Set the CONNECTION_STRING environment variable.");
}

builder.WebHost.UseUrls("http://0.0.0.0:8080");

builder.Services.AddDbContext<AppDbContext>(options =>
   options.UseNpgsql(connectionString));

var app = builder.Build();

app.UseSerilogRequestLogging();

app.Logger.LogInformation(
    "Startup diagnostics: ConnectionStringConfigured={ConnectionStringConfigured}, JwtSectionExists={JwtSectionExists}",
    !string.IsNullOrWhiteSpace(connectionString),
    builder.Configuration.GetSection(JwtSettingsOptions.SectionName).Exists());


app.Logger.LogInformation(
    "Startup diagnostics: JwtSecretEnvVarPresent={JwtSecretEnvVarPresent}, JwtIssuerEnvVarPresent={JwtIssuerEnvVarPresent}, JwtAudienceEnvVarPresent={JwtAudienceEnvVarPresent}",
    !string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable($"{JwtSettingsOptions.SectionName}__Secret")),
    !string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable($"{JwtSettingsOptions.SectionName}__Issuer")),
    !string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable($"{JwtSettingsOptions.SectionName}__Audience")));

app.UseMiddleware<GlobalExceptionMiddleware>();

app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "Task Flow API v1");
});

app.UseCors("AllowAllOrigins");

app.UseIpRateLimiting();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

await app.ApplyMigrationsAndSeedAsync();

app.Run();
