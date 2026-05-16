using KvizHub.Repository.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KvizHub.Services.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponseDto?> LoginAsync(LoginDto loginDto);
        Task<AuthResponseDto?> RegisterAsync(RegisterDto registerDto);
        Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto changePasswordDto);
        Task<string> GenerateJwtTokenAsync(UserDto user);
        string GenerateJwtToken(UserDto user);
        Task<bool> ValidateTokenAsync(string token);
        Task<UserDto?> GetUserFromTokenAsync(string token);
    }
}
