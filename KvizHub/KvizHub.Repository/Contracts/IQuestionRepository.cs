using KvizHub.Repository.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KvizHub.Repository.Contracts
{
    public interface IQuestionRepository
    {
        // Basic CRUD operations
        Task<Question?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<Question?> GetByIdWithAnswersAsync(int id, CancellationToken cancellationToken = default);
        Task<IEnumerable<Question>> GetAllWithQuizInfoAsync(CancellationToken cancellationToken = default);
        Task<IEnumerable<Question>> GetByQuizIdAsync(int quizId, CancellationToken cancellationToken = default);
        Task<IEnumerable<Question>> GetByQuizIdWithAnswersAsync(int quizId, CancellationToken cancellationToken = default);
        Task<bool> AddAsync(Question question, CancellationToken cancellationToken = default);
        Task<bool> UpdateAsync(Question question, CancellationToken cancellationToken = default);
        Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);

        // Bulk operations
        Task<bool> AddRangeAsync(IEnumerable<Question> questions, CancellationToken cancellationToken = default);
        Task<bool> DeleteByQuizIdAsync(int quizId, CancellationToken cancellationToken = default);

        // Ordering
        Task<bool> UpdateOrderIndexAsync(int questionId, int newOrderIndex, CancellationToken cancellationToken = default);
        Task<bool> ReorderQuestionsAsync(int quizId, Dictionary<int, int> questionOrderMap, CancellationToken cancellationToken = default);

        // Statistics
        Task<int> GetQuestionCountByQuizAsync(int quizId, CancellationToken cancellationToken = default);
        Task<int> GetQuestionCountByTypeAsync(QuestionType type, CancellationToken cancellationToken = default);
    }
}
