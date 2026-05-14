using KvizHub.Repository.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KvizHub.Repository.Contracts
{
    public interface IUserAnswerRepository
    {
        // Basic CRUD operations
        Task<UserAnswer?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<IEnumerable<UserAnswer>> GetByQuizAttemptIdAsync(int quizAttemptId, CancellationToken cancellationToken = default);
        Task<IEnumerable<UserAnswer>> GetByQuizAttemptIdWithDetailsAsync(int quizAttemptId, CancellationToken cancellationToken = default);
        Task<bool> AddAsync(UserAnswer userAnswer, CancellationToken cancellationToken = default);
        Task<bool> UpdateAsync(UserAnswer userAnswer, CancellationToken cancellationToken = default);
        Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);

        // Bulk operations
        Task<bool> AddRangeAsync(IEnumerable<UserAnswer> userAnswers, CancellationToken cancellationToken = default);
        Task<bool> DeleteByQuizAttemptIdAsync(int quizAttemptId, CancellationToken cancellationToken = default);

        // Validation and scoring
        Task<bool> ValidateAndScoreAnswersAsync(int quizAttemptId, CancellationToken cancellationToken = default);
        Task<int> GetCorrectAnswersCountAsync(int quizAttemptId, CancellationToken cancellationToken = default);
        Task<int> GetTotalAnswersCountAsync(int quizAttemptId, CancellationToken cancellationToken = default);
        Task<int> CalculateScoreAsync(int quizAttemptId, CancellationToken cancellationToken = default);

        // Question-specific answers
        Task<UserAnswer?> GetUserAnswerForQuestionAsync(int quizAttemptId, int questionId, CancellationToken cancellationToken = default);
        Task<bool> HasAnsweredQuestionAsync(int quizAttemptId, int questionId, CancellationToken cancellationToken = default);
    }
}
