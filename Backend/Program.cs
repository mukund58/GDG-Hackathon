using Backend.Extensions;
using dotenv.net;
using Backend.Data;

// Load .env file - try from current directory, ignore if not found
try { DotEnv.Load(); } catch { }

var builder = WebApplication.CreateBuilder(args);

builder.Host.AddSerilogConfig();

builder.Services.Configure<SeedingOptions>(builder.Configuration.GetSection("Seeding"));
builder.Services.Configure<JwtSettingsOptions>(builder.Configuration.GetSection(JwtSettingsOptions.SectionName));

builder.Services.AddCorsConfig();
builder.Services.AddRedisCache(builder.Configuration);
builder.Services.AddRateLimiting(builder.Configuration);
builder.Services.AddControllers();
builder.Services.AddApiVersioningConfig();
builder.Services.AddAuthAndAuthorization(builder.Configuration);
builder.Services.AddApplicationServices();
builder.Services.AddSwaggerConfig();
builder.Services.AddDatabase(builder.Configuration);

var app = builder.Build();

app.UseApplicationMiddleware();
app.UseSwaggerDocumentation();

app.MapControllers();

await app.ApplyMigrationsAndSeedAsync();

app.Run();
