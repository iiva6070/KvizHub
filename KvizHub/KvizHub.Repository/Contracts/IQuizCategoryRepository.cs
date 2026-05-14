using KvizHub.Repository.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KvizHub.Repository.Contracts
{
    public interface IQuizCategoryRepository
    {
        // Basic CRUD operations
        Task<QuizCategory?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<IEnumerable<QuizCategory>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<bool> AddAsync(QuizCategory category, CancellationToken cancellationToken = default);
        Task<bool> UpdateAsync(QuizCategory category, CancellationToken cancellationToken = default);
        Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);

        // Validation
        Task<bool> NameExistsAsync(string name, int? excludeId = null, CancellationToken cancellationToken = default);

        // Statistics
        Task<int> GetQuizzesCountByCategoryAsync(int categoryId, CancellationToken cancellationToken = default);
        Task<IEnumerable<QuizCategory>> GetCategoriesWithQuizCountAsync(CancellationToken cancellationToken = default);
    }
}
