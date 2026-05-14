using KvizHub.Repository.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KvizHub.Repository.Contracts
{
    public interface IAnswerRepository
    {
        // Basic CRUD operations
        Task<Answer?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<IEnumerable<Answer>> GetByQuestionIdAsync(int questionId, CancellationToken cancellationToken = default);
        Task<bool> AddAsync(Answer answer, CancellationToken cancellationToken = default);
        Task<bool> UpdateAsync(Answer answer, CancellationToken cancellationToken = default);
        Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);

        // Bulk operations
        Task<bool> AddRangeAsync(IEnumerable<Answer> answers, CancellationToken cancellationToken = default);
        Task<bool> DeleteByQuestionIdAsync(int questionId, CancellationToken cancellationToken = default);
        Task<bool> DeleteByQuizIdAsync(int quizId, CancellationToken cancellationToken = default);

        // Validation
        Task<IEnumerable<Answer>> GetCorrectAnswersByQuestionIdAsync(int questionId, CancellationToken cancellationToken = default);
        Task<bool> HasCorrectAnswerAsync(int questionId, CancellationToken cancellationToken = default);

        // Ordering
        Task<bool> UpdateOrderIndexAsync(int answerId, int newOrderIndex, CancellationToken cancellationToken = default);
    }
}
