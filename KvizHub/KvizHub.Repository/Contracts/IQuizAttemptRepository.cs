using KvizHub.Repository.DTOs;
using KvizHub.Repository.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KvizHub.Repository.Contracts
{
    public interface IQuizAttemptRepository
    {
        // Basic CRUD operations
        Task<QuizAttempt?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<QuizAttempt?> GetByIdWithDetailsAsync(int id, CancellationToken cancellationToken = default);
        Task<IEnumerable<QuizAttempt>> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default);
        Task<IEnumerable<QuizAttempt>> GetByQuizIdAsync(int quizId, CancellationToken cancellationToken = default);
        Task<bool> AddAsync(QuizAttempt attempt, CancellationToken cancellationToken = default);
        Task<bool> UpdateAsync(QuizAttempt attempt, CancellationToken cancellationToken = default);
        Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);

        // User results
        Task<IEnumerable<QuizAttempt>> GetUserRecentAttemptsAsync(int userId, int count, CancellationToken cancellationToken = default);
        Task<IEnumerable<QuizAttempt>> GetUserCompletedAttemptsAsync(int userId, CancellationToken cancellationToken = default);
        Task<QuizAttempt?> GetUserBestAttemptForQuizAsync(int userId, int quizId, CancellationToken cancellationToken = default);

        // Statistics
        Task<int> GetUserTotalAttemptsAsync(int userId, CancellationToken cancellationToken = default);
        Task<int> GetUserCompletedAttemptsCountAsync(int userId, CancellationToken cancellationToken = default);
        Task<decimal> GetUserAverageScoreAsync(int userId, CancellationToken cancellationToken = default);
        Task<int> GetUserBestScoreAsync(int userId, CancellationToken cancellationToken = default);

        // Leaderboard
        Task<IEnumerable<LeaderboardEntryDto>> GetGlobalLeaderboardAsync(int count, CancellationToken cancellationToken = default);
        Task<IEnumerable<LeaderboardEntryDto>> GetCategoryLeaderboardAsync(int categoryId, int count, CancellationToken cancellationToken = default);
        Task<IEnumerable<QuizAttemptLeaderboardDto>> GetTopQuizAttemptsAsync(int? quizId = null, string? category = null, string? period = null, int? currentUserId = null, int count = 50, CancellationToken cancellationToken = default);

        // Category statistics
        Task<IEnumerable<CategoryStatsDto>> GetUserCategoryStatsAsync(int userId, CancellationToken cancellationToken = default);

        // Admin statistics
        Task<int> GetTotalAttemptsCountAsync(CancellationToken cancellationToken = default);
        Task<int> GetCompletedAttemptsCountAsync(CancellationToken cancellationToken = default);
        Task<decimal> GetAverageCompletionTimeAsync(CancellationToken cancellationToken = default);
        Task<IEnumerable<QuizAttempt>> GetRecentAttemptsAsync(int count, CancellationToken cancellationToken = default);

        // Active attempts
        Task<QuizAttempt?> GetActiveAttemptAsync(int userId, int quizId, CancellationToken cancellationToken = default);
        Task<bool> HasActiveAttemptAsync(int userId, int quizId, CancellationToken cancellationToken = default);

        // Admin statistics
        Task<IEnumerable<AdminCategoryStatsDto>> GetCategoryStatsAsync(CancellationToken cancellationToken = default);
        Task<IEnumerable<TopUserDto>> GetTopUsersAsync(int count = 10, CancellationToken cancellationToken = default);
        Task<IEnumerable<WeeklyActivityDto>> GetWeeklyActivityAsync(CancellationToken cancellationToken = default);
    }
}
