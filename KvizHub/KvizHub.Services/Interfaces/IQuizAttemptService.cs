using KvizHub.Repository.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KvizHub.Services.Interfaces
{
    public interface IQuizAttemptService
    {
        Task<QuizAttemptDto?> StartQuizAsync(int userId, StartQuizAttemptDto startDto);
        Task<QuizAttemptDto?> StartQuizAsync(int userId, int quizId);
        Task<QuizAttemptDetailDto?> SubmitQuizAsync(int userId, SubmitQuizAttemptDto submitDto);
        Task<QuizAttemptDetailDto?> SubmitQuizAsync(int userId, SubmitQuizDto submitDto);
        Task<QuizAttemptDto?> GetByIdAsync(int id);
        Task<QuizAttemptDetailDto?> GetByIdWithDetailsAsync(int id);
        Task<QuizAttemptDetailDto?> GetByIdWithAnswersAsync(int id);
        Task<IEnumerable<QuizAttemptDto>> GetUserAttemptsAsync(int userId);
        Task<IEnumerable<QuizAttemptDto>> GetByUserIdAsync(int userId);
        Task<IEnumerable<QuizAttemptDto>> GetUserQuizHistoryAsync(int userId);
        Task<IEnumerable<QuizAttemptDto>> GetUserRecentAttemptsAsync(int userId, int count);
        Task<IEnumerable<QuizAttemptDto>> GetUserCompletedAttemptsAsync(int userId);
        Task<QuizAttemptDto?> GetUserBestAttemptForQuizAsync(int userId, int quizId);
        Task<QuizAttemptDto?> GetBestAttemptAsync(int userId, int quizId);
        Task<IEnumerable<QuizAttemptDto>> GetByQuizIdAsync(int quizId);
        Task<IEnumerable<QuizAttemptDto>> GetTopScoresAsync(int quizId, int count);
        Task<decimal> GetAverageScoreAsync(int quizId);
        Task<int> GetUserAttemptsCountAsync(int userId);
        Task<bool> DeleteAsync(int id);
        Task<UserResultsDto?> GetUserResultsAsync(int userId);
        Task<IEnumerable<LeaderboardEntryDto>> GetGlobalLeaderboardAsync(int count);
        Task<IEnumerable<LeaderboardEntryDto>> GetCategoryLeaderboardAsync(int categoryId, int count);
        Task<IEnumerable<QuizAttemptLeaderboardDto>> GetTopQuizAttemptsAsync(int? quizId = null, string? category = null, string? period = null, int? currentUserId = null, int count = 50);
        Task<int> GetTotalAttemptsCountAsync();
        Task<int> GetCompletedAttemptsCountAsync();
        Task<decimal> GetAverageCompletionTimeAsync();
        Task<IEnumerable<QuizAttemptDto>> GetRecentAttemptsAsync(int count);
        Task<IEnumerable<QuizAttemptDto>> GetRecentAttemptsAsync(int userId, int count);
        Task<QuizAttemptDto?> GetActiveAttemptAsync(int userId, int quizId);
        Task<bool> HasActiveAttemptAsync(int userId, int quizId);
        Task<List<UserResultDto>> GetUserResultsForFrontendAsync(int userId);
    }
}
