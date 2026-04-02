namespace Backend.Services.Interface;

using Backend.Models.DTOs;
using Backend.Models.Entities;

public interface IAuthService
{
    Task<string> Register(RegisterDto dto);
    Task<string> Login(LoginDto dto);
}
