using KvizHub.Repository.Contracts;
using KvizHub.Repository.Data;
using KvizHub.Repository.DTOs;
using KvizHub.Repository.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace KvizHub.Repository.Repositories
{
    public class QuizAttemptRepository : IQuizAttemptRepository
    {
        private readonly AppDbContext _context;

        public QuizAttemptRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<QuizAttempt?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _context.QuizAttempts
                .Include(qa => qa.User)
                .Include(qa => qa.Quiz)
                .FirstOrDefaultAsync(qa => qa.Id == id, cancellationToken);
        }

        public async Task<QuizAttempt?> GetByIdWithDetailsAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _context.QuizAttempts
                .Include(qa => qa.User)
                .Include(qa => qa.Quiz)
                    .ThenInclude(q => q.Category)
                .Include(qa => qa.UserAnswers)
                    .ThenInclude(ua => ua.Question)
                        .ThenInclude(q => q.Answers)
                .FirstOrDefaultAsync(qa => qa.Id == id, cancellationToken);
        }

        public async Task<IEnumerable<QuizAttempt>> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default)
        {
            return await _context.QuizAttempts
                .Include(qa => qa.Quiz)
                    .ThenInclude(q => q.Category)
                .Where(qa => qa.UserId == userId)
                .OrderByDescending(qa => qa.StartedAt)
                .ToListAsync(cancellationToken);
        }

        public async Task<IEnumerable<QuizAttempt>> GetByQuizIdAsync(int quizId, CancellationToken cancellationToken = default)
        {
            return await _context.QuizAttempts
                .Include(qa => qa.User)
                .Where(qa => qa.QuizId == quizId)
                .OrderByDescending(qa => qa.StartedAt)
                .ToListAsync(cancellationToken);
        }

        public async Task<bool> AddAsync(QuizAttempt attempt, CancellationToken cancellationToken = default)
        {
            await _context.QuizAttempts.AddAsync(attempt, cancellationToken);
            return await _context.SaveChangesAsync(cancellationToken) > 0;
        }

        public async Task<bool> UpdateAsync(QuizAttempt attempt, CancellationToken cancellationToken = default)
        {
            _context.QuizAttempts.Update(attempt);
            return await _context.SaveChangesAsync(cancellationToken) > 0;
        }

        public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var attempt = await GetByIdAsync(id, cancellationToken);
            if (attempt == null) return false;

            _context.QuizAttempts.Remove(attempt);
            return await _context.SaveChangesAsync(cancellationToken) > 0;
        }

        public async Task<IEnumerable<QuizAttempt>> GetUserRecentAttemptsAsync(int userId, int count, CancellationToken cancellationToken = default)
        {
            return await _context.QuizAttempts
                .Include(qa => qa.Quiz)
                    .ThenInclude(q => q.Category)
                .Where(qa => qa.UserId == userId)
                .OrderByDescending(qa => qa.StartedAt)
                .Take(count)
                .ToListAsync(cancellationToken);
        }

        public async Task<IEnumerable<QuizAttempt>> GetUserCompletedAttemptsAsync(int userId, CancellationToken cancellationToken = default)
        {
            return await _context.QuizAttempts
                .Include(qa => qa.Quiz)
                    .ThenInclude(q => q.Category)
                .Where(qa => qa.UserId == userId && qa.IsCompleted)
                .OrderByDescending(qa => qa.CompletedAt)
                .ToListAsync(cancellationToken);
        }

        public async Task<QuizAttempt?> GetUserBestAttemptForQuizAsync(int userId, int quizId, CancellationToken cancellationToken = default)
        {
            return await _context.QuizAttempts
                .Include(qa => qa.Quiz)
                .Where(qa => qa.UserId == userId && qa.QuizId == quizId && qa.IsCompleted)
                .OrderByDescending(qa => qa.Percentage)
                .FirstOrDefaultAsync(cancellationToken);
        }

        public async Task<int> GetUserTotalAttemptsAsync(int userId, CancellationToken cancellationToken = default)
        {
            return await _context.QuizAttempts
                .CountAsync(qa => qa.UserId == userId, cancellationToken);
        }

        public async Task<int> GetUserCompletedAttemptsCountAsync(int userId, CancellationToken cancellationToken = default)
        {
            return await _context.QuizAttempts
                .CountAsync(qa => qa.UserId == userId && qa.IsCompleted, cancellationToken);
        }

        public async Task<decimal> GetUserAverageScoreAsync(int userId, CancellationToken cancellationToken = default)
        {
            var completedAttempts = await _context.QuizAttempts
                .Where(qa => qa.UserId == userId && qa.IsCompleted)
                .ToListAsync(cancellationToken);

            return completedAttempts.Any() ? completedAttempts.Average(qa => qa.Percentage) : 0;
        }

        public async Task<int> GetUserBestScoreAsync(int userId, CancellationToken cancellationToken = default)
        {
            var bestAttempt = await _context.QuizAttempts
                .Where(qa => qa.UserId == userId && qa.IsCompleted)
                .OrderByDescending(qa => qa.Percentage)
                .FirstOrDefaultAsync(cancellationToken);

            return (int)(bestAttempt?.Percentage ?? 0);
        }

        public async Task<IEnumerable<LeaderboardEntryDto>> GetGlobalLeaderboardAsync(int count, CancellationToken cancellationToken = default)
        {
            var leaderboard = await _context.Users
                .Include(u => u.QuizAttempts)
                .Where(u => u.QuizAttempts.Any(qa => qa.IsCompleted))
                .Select(u => new LeaderboardEntryDto
                {
                    UserId = u.Id,
                    Username = u.Username,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    ProfileImageUrl = u.ProfileImageUrl,
                    TotalAttempts = u.QuizAttempts.Count,
                    CompletedAttempts = u.QuizAttempts.Count(qa => qa.IsCompleted),
                    AverageScore = u.QuizAttempts.Where(qa => qa.IsCompleted).Average(qa => qa.Percentage),
                    TotalScore = u.QuizAttempts.Where(qa => qa.IsCompleted).Sum(qa => qa.Score)
                })
                .OrderByDescending(l => l.TotalScore)
                .ThenByDescending(l => l.AverageScore)
                .Take(count)
                .ToListAsync(cancellationToken);

            // Assign ranks
            for (int i = 0; i < leaderboard.Count; i++)
            {
                leaderboard[i].Rank = i + 1;
            }

            return leaderboard;
        }

        public async Task<IEnumerable<LeaderboardEntryDto>> GetCategoryLeaderboardAsync(int categoryId, int count, CancellationToken cancellationToken = default)
        {
            var leaderboard = await _context.Users
                .Include(u => u.QuizAttempts)
                    .ThenInclude(qa => qa.Quiz)
                .Where(u => u.QuizAttempts.Any(qa => qa.IsCompleted && qa.Quiz.CategoryId == categoryId))
                .Select(u => new LeaderboardEntryDto
                {
                    UserId = u.Id,
                    Username = u.Username,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    ProfileImageUrl = u.ProfileImageUrl,
                    TotalAttempts = u.QuizAttempts.Count(qa => qa.Quiz.CategoryId == categoryId),
                    CompletedAttempts = u.QuizAttempts.Count(qa => qa.IsCompleted && qa.Quiz.CategoryId == categoryId),
                    AverageScore = u.QuizAttempts.Where(qa => qa.IsCompleted && qa.Quiz.CategoryId == categoryId).Average(qa => qa.Percentage),
                    TotalScore = u.QuizAttempts.Where(qa => qa.IsCompleted && qa.Quiz.CategoryId == categoryId).Sum(qa => qa.Score)
                })
                .OrderByDescending(l => l.AverageScore)
                .Take(count)
                .ToListAsync(cancellationToken);

            // Assign ranks
            for (int i = 0; i < leaderboard.Count; i++)
            {
                leaderboard[i].Rank = i + 1;
            }

            return leaderboard;
        }

        public async Task<IEnumerable<CategoryStatsDto>> GetUserCategoryStatsAsync(int userId, CancellationToken cancellationToken = default)
        {
            return await _context.QuizAttempts
                .Include(qa => qa.Quiz)
                    .ThenInclude(q => q.Category)
                .Where(qa => qa.UserId == userId && qa.IsCompleted)
                .GroupBy(qa => qa.Quiz.Category)
                .Select(g => new CategoryStatsDto
                {
                    CategoryId = g.Key.Id,
                    CategoryName = g.Key.Name,
                    AttemptsCount = g.Count(),
                    AverageScore = g.Average(qa => qa.Percentage),
                    BestScore = (int)g.Max(qa => qa.Percentage)
                })
                .OrderBy(cs => cs.CategoryName)
                .ToListAsync(cancellationToken);
        }

        public async Task<int> GetTotalAttemptsCountAsync(CancellationToken cancellationToken = default)
        {
            return await _context.QuizAttempts.CountAsync(cancellationToken);
        }

        public async Task<int> GetCompletedAttemptsCountAsync(CancellationToken cancellationToken = default)
        {
            return await _context.QuizAttempts.CountAsync(qa => qa.IsCompleted, cancellationToken);
        }

        public async Task<decimal> GetAverageCompletionTimeAsync(CancellationToken cancellationToken = default)
        {
            var completedAttempts = await _context.QuizAttempts
                .Where(qa => qa.IsCompleted && qa.TimeSpent.HasValue)
                .ToListAsync(cancellationToken);

            return completedAttempts.Any()
                ? (decimal)completedAttempts.Average(qa => qa.TimeSpent!.Value.TotalMinutes)
                : 0;
        }

        public async Task<IEnumerable<QuizAttempt>> GetRecentAttemptsAsync(int count, CancellationToken cancellationToken = default)
        {
            return await _context.QuizAttempts
                .Include(qa => qa.User)
                .Include(qa => qa.Quiz)
                .OrderByDescending(qa => qa.StartedAt)
                .Take(count)
                .ToListAsync(cancellationToken);
        }

        public async Task<QuizAttempt?> GetActiveAttemptAsync(int userId, int quizId, CancellationToken cancellationToken = default)
        {
            return await _context.QuizAttempts
                .Include(qa => qa.Quiz)
                .FirstOrDefaultAsync(qa => qa.UserId == userId && qa.QuizId == quizId && !qa.IsCompleted, cancellationToken);
        }

        public async Task<bool> HasActiveAttemptAsync(int userId, int quizId, CancellationToken cancellationToken = default)
        {
            return await _context.QuizAttempts
                .AnyAsync(qa => qa.UserId == userId && qa.QuizId == quizId && !qa.IsCompleted, cancellationToken);
        }

        // Metode za dobijanje top rezultata pojedinačnih pokušaja kvizova
        public async Task<IEnumerable<QuizAttemptLeaderboardDto>> GetTopQuizAttemptsAsync(
            int? quizId = null,
            string? category = null,
            string? period = null,
            int? currentUserId = null,
            int count = 50,
            CancellationToken cancellationToken = default)
        {
            var query = _context.QuizAttempts
                .Include(qa => qa.User)
                .Include(qa => qa.Quiz)
                    .ThenInclude(q => q.Category)
                .Where(qa => qa.IsCompleted);

            // Filter po kvizu
            if (quizId.HasValue)
            {
                query = query.Where(qa => qa.QuizId == quizId.Value);
            }

            // Filter po kategoriji
            if (!string.IsNullOrEmpty(category))
            {
                query = query.Where(qa => qa.Quiz.Category.Name == category);
            }

            // Filter po periodu
            if (!string.IsNullOrEmpty(period) && period != "all-time")
            {
                var now = DateTime.UtcNow;
                DateTime startDate;

                if (period == "weekly")
                {
                    startDate = now.AddDays(-7);
                }
                else if (period == "monthly")
                {
                    startDate = now.AddDays(-30);
                }
                else
                {
                    startDate = DateTime.MinValue;
                }

                if (startDate != DateTime.MinValue)
                {
                    query = query.Where(qa => qa.CompletedAt >= startDate);
                }
            }

            var topAttempts = await query
                .OrderByDescending(qa => qa.Percentage)
                .ThenBy(qa => qa.TimeSpent)
                .ThenByDescending(qa => qa.CompletedAt)
                .Take(count)
                .Select(qa => new QuizAttemptLeaderboardDto
                {
                    UserId = qa.UserId,
                    UserName = qa.User.Username,
                    FirstName = qa.User.FirstName,
                    LastName = qa.User.LastName,
                    UserLevel = 1, // Možete dodati userLevel kao property u User model
                    QuizId = qa.QuizId,
                    QuizTitle = qa.Quiz.Title,
                    QuizCategory = qa.Quiz.Category.Name,
                    Score = qa.Score,
                    Percentage = qa.Percentage,
                    DateTaken = qa.CompletedAt ?? qa.StartedAt,
                    TimeSpent = qa.TimeSpent,
                    IsCurrentUser = currentUserId.HasValue && qa.UserId == currentUserId.Value
                })
                .ToListAsync(cancellationToken);

            // Dodeliti pozicije
            for (int i = 0; i < topAttempts.Count; i++)
            {
                topAttempts[i].Position = i + 1;
            }

            return topAttempts;
        }

        // Metode za admin statistike
        public async Task<IEnumerable<AdminCategoryStatsDto>> GetCategoryStatsAsync(CancellationToken cancellationToken = default)
        {
            var categoryStats = await _context.QuizAttempts
                .Include(qa => qa.Quiz)
                    .ThenInclude(q => q.Category)
                .Where(qa => qa.IsCompleted)
                .GroupBy(qa => qa.Quiz.Category.Name)
                .Select(g => new AdminCategoryStatsDto
                {
                    Name = g.Key,
                    QuizCount = g.Select(qa => qa.QuizId).Distinct().Count(),
                    Attempts = g.Count(),
                    AverageScore = g.Average(qa => (double)qa.Percentage)
                })
                .ToListAsync(cancellationToken);

            return categoryStats;
        }

        public async Task<IEnumerable<TopUserDto>> GetTopUsersAsync(int count = 10, CancellationToken cancellationToken = default)
        {
            var topUsers = await _context.QuizAttempts
                .Include(qa => qa.User)
                .Where(qa => qa.IsCompleted)
                .GroupBy(qa => new { qa.UserId, qa.User.Username, qa.User.FirstName, qa.User.LastName })
                .Select(g => new TopUserDto
                {
                    Id = g.Key.UserId,
                    Name = !string.IsNullOrEmpty(g.Key.FirstName) && !string.IsNullOrEmpty(g.Key.LastName)
                        ? $"{g.Key.FirstName} {g.Key.LastName}"
                        : g.Key.Username,
                    CompletedQuizzes = g.Count(),
                    AverageScore = g.Average(qa => (double)qa.Percentage),
                    TotalScore = g.Sum(qa => qa.Score)
                })
                .OrderByDescending(u => u.TotalScore)
                .ThenByDescending(u => u.AverageScore)
                .Take(count)
                .ToListAsync(cancellationToken);

            // Dodeli rang pozicije
            for (int i = 0; i < topUsers.Count; i++)
            {
                topUsers[i].Rank = i + 1;
            }

            return topUsers;
        }

        public async Task<IEnumerable<WeeklyActivityDto>> GetWeeklyActivityAsync(CancellationToken cancellationToken = default)
        {
            var oneWeekAgo = DateTime.UtcNow.AddDays(-7);

            var weeklyActivity = await _context.QuizAttempts
                .Where(qa => qa.IsCompleted && qa.CompletedAt >= oneWeekAgo)
                .GroupBy(qa => qa.CompletedAt!.Value.DayOfWeek)
                .Select(g => new WeeklyActivityDto
                {
                    Day = g.Key.ToString(),
                    Attempts = g.Count()
                })
                .ToListAsync(cancellationToken);

            // Dodaj dane bez aktivnosti
            var allDays = Enum.GetValues<DayOfWeek>()
                .Select(d => new WeeklyActivityDto
                {
                    Day = d.ToString(),
                    Attempts = weeklyActivity.FirstOrDefault(w => w.Day == d.ToString())?.Attempts ?? 0
                })
                .ToList();

            return allDays;
        }
    }
}
