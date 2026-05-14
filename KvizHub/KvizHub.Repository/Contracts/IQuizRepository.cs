using KvizHub.Repository.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KvizHub.Repository.Contracts
{
    public interface IQuizRepository
    {
        // Basic CRUD operations
        Task<Quiz?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<Quiz?> GetByIdWithQuestionsAsync(int id, CancellationToken cancellationToken = default);
        Task<Quiz?> GetByIdWithAnswersAsync(int id, CancellationToken cancellationToken = default);
        Task<IEnumerable<Quiz>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<IEnumerable<Quiz>> GetActiveAsync(CancellationToken cancellationToken = default);
        Task<Quiz?> CreateAsync(Quiz quiz, CancellationToken cancellationToken = default);
        Task<bool> AddAsync(Quiz quiz, CancellationToken cancellationToken = default);
        Task<bool> UpdateAsync(Quiz quiz, CancellationToken cancellationToken = default);
        Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);

        // Filtering
        Task<IEnumerable<Quiz>> GetByCategoryAsync(int categoryId, CancellationToken cancellationToken = default);
        Task<IEnumerable<Quiz>> GetByDifficultyAsync(DifficultyLevel difficulty, CancellationToken cancellationToken = default);
        Task<IEnumerable<Quiz>> SearchAsync(string searchTerm, CancellationToken cancellationToken = default);

        // Statistics
        Task<int> GetTotalQuizzesCountAsync(CancellationToken cancellationToken = default);
        Task<int> GetActiveQuizzesCountAsync(CancellationToken cancellationToken = default);
        Task<IEnumerable<Quiz>> GetPopularQuizzesAsync(int count, CancellationToken cancellationToken = default);
        Task<IEnumerable<Quiz>> GetRecentQuizzesAsync(int count, CancellationToken cancellationToken = default);

        // Admin operations
        Task<bool> ToggleActiveStatusAsync(int id, CancellationToken cancellationToken = default);
    }
}

