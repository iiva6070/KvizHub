using KvizHub.Repository.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KvizHub.Services.Interfaces
{
    public interface IUserService
    {
        Task<UserDto?> GetByIdAsync(int id);
        Task<UserDto?> GetByEmailAsync(string email);
        Task<UserDto?> GetByUsernameAsync(string username);
        Task<IEnumerable<UserDto>> GetAllAsync();
        Task<UserDto?> CreateAsync(RegisterDto registerDto);
        Task<bool> UpdateAsync(int id, UpdateUserDto updateDto);
        Task<bool> UpdateProfileAsync(int userId, UpdateUserProfileDto updateDto);
        Task<bool> UpdateProfileImageAsync(int userId, string imageUrl);
        Task<bool> DeleteAsync(int id);
        Task<UserResultsDto?> GetUserResultsAsync(int userId);
        Task<bool> EmailExistsAsync(string email);
        Task<bool> UsernameExistsAsync(string username);
        Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto changePasswordDto);
        Task<IEnumerable<UserDto>> SearchAsync(string searchTerm);
        Task<int> GetTotalUsersCountAsync();
        Task<int> GetActiveUsersCountAsync();
        Task<IEnumerable<UserDto>> GetTopUsersAsync(int count);
        Task<IEnumerable<UserDto>> GetRecentUsersAsync(int count);
        Task<bool> ToggleActiveStatusAsync(int id);
    }
}
