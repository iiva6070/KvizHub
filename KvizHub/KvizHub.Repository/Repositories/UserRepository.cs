using KvizHub.Repository.Contracts;
using KvizHub.Repository.Data;
using KvizHub.Repository.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace KvizHub.Repository.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;

        public UserRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<User?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
        }

        public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
        }

        public async Task<User?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Username == username, cancellationToken);
        }

        public async Task<IEnumerable<User>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _context.Users
                .OrderBy(u => u.Username)
                .ToListAsync(cancellationToken);
        }

        public async Task<bool> AddAsync(User user, CancellationToken cancellationToken = default)
        {
            await _context.Users.AddAsync(user, cancellationToken);
            return await _context.SaveChangesAsync(cancellationToken) > 0;
        }

        public async Task<bool> UpdateAsync(User user, CancellationToken cancellationToken = default)
        {
            user.UpdatedAt = DateTime.UtcNow;
            _context.Users.Update(user);
            return await _context.SaveChangesAsync(cancellationToken) > 0;
        }

        public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var user = await GetByIdAsync(id, cancellationToken);
            if (user == null) return false;

            _context.Users.Remove(user);
            return await _context.SaveChangesAsync(cancellationToken) > 0;
        }

        public async Task<bool> EmailExistsAsync(string email, CancellationToken cancellationToken = default)
        {
            return await _context.Users
                .AnyAsync(u => u.Email == email, cancellationToken);
        }

        public async Task<bool> UsernameExistsAsync(string username, CancellationToken cancellationToken = default)
        {
            return await _context.Users
                .AnyAsync(u => u.Username == username, cancellationToken);
        }

        public async Task<bool> UpdateProfileImageAsync(int userId, string imageUrl, CancellationToken cancellationToken = default)
        {
            var user = await GetByIdAsync(userId, cancellationToken);
            if (user == null) return false;

            user.ProfileImageUrl = imageUrl;
            user.UpdatedAt = DateTime.UtcNow;

            return await _context.SaveChangesAsync(cancellationToken) > 0;
        }

        public async Task<bool> ChangePasswordAsync(int userId, string newPasswordHash, CancellationToken cancellationToken = default)
        {
            var user = await GetByIdAsync(userId, cancellationToken);
            if (user == null) return false;

            user.PasswordHash = newPasswordHash;
            user.UpdatedAt = DateTime.UtcNow;

            return await _context.SaveChangesAsync(cancellationToken) > 0;
        }

        public async Task<int> GetTotalUsersCountAsync(CancellationToken cancellationToken = default)
        {
            return await _context.Users.CountAsync(cancellationToken);
        }

        public async Task<IEnumerable<User>> GetTopUsersAsync(int count, CancellationToken cancellationToken = default)
        {
            return await _context.Users
                .Include(u => u.QuizAttempts)
                .Where(u => u.QuizAttempts.Any(qa => qa.IsCompleted))
                .OrderByDescending(u => u.QuizAttempts
                    .Where(qa => qa.IsCompleted)
                    .Average(qa => qa.Percentage))
                .Take(count)
                .ToListAsync(cancellationToken);
        }

        public async Task<User?> CreateAsync(User user, CancellationToken cancellationToken = default)
        {
            _context.Users.Add(user);
            var result = await _context.SaveChangesAsync(cancellationToken);
            return result > 0 ? user : null;
        }

        public async Task<IEnumerable<User>> SearchAsync(string searchTerm, CancellationToken cancellationToken = default)
        {
            return await _context.Users
                .Where(u => u.Username.Contains(searchTerm) ||
                           u.Email.Contains(searchTerm) ||
                           (u.FirstName != null && u.FirstName.Contains(searchTerm)) ||
                           (u.LastName != null && u.LastName.Contains(searchTerm)))
                .ToListAsync(cancellationToken);
        }

        public async Task<IEnumerable<User>> GetActiveUsersAsync(CancellationToken cancellationToken = default)
        {
            return await _context.Users
                .Where(u => u.IsActive)
                .ToListAsync(cancellationToken);
        }

        public async Task<IEnumerable<User>> GetRecentUsersAsync(int count, CancellationToken cancellationToken = default)
        {
            return await _context.Users
                .OrderByDescending(u => u.CreatedAt)
                .Take(count)
                .ToListAsync(cancellationToken);
        }
    }
}
