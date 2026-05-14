using KvizHub.Repository.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KvizHub.Repository.Contracts
{
    public interface IUserRepository
    {
        // Basic CRUD operations
        Task<User?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
        Task<User?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default);
        Task<IEnumerable<User>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<bool> AddAsync(User user, CancellationToken cancellationToken = default);
        Task<bool> UpdateAsync(User user, CancellationToken cancellationToken = default);
        Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);

        // Authentication
        Task<bool> EmailExistsAsync(string email, CancellationToken cancellationToken = default);
        Task<bool> UsernameExistsAsync(string username, CancellationToken cancellationToken = default);

        // Profile operations
        Task<bool> UpdateProfileImageAsync(int userId, string imageUrl, CancellationToken cancellationToken = default);
        Task<bool> ChangePasswordAsync(int userId, string newPasswordHash, CancellationToken cancellationToken = default);

        // Statistics
        Task<int> GetTotalUsersCountAsync(CancellationToken cancellationToken = default);
        Task<IEnumerable<User>> GetTopUsersAsync(int count, CancellationToken cancellationToken = default);

        // Additional operations
        Task<User?> CreateAsync(User user, CancellationToken cancellationToken = default);
        Task<IEnumerable<User>> SearchAsync(string searchTerm, CancellationToken cancellationToken = default);
        Task<IEnumerable<User>> GetActiveUsersAsync(CancellationToken cancellationToken = default);
        Task<IEnumerable<User>> GetRecentUsersAsync(int count, CancellationToken cancellationToken = default);
    }
}
