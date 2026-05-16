using KvizHub.Repository.DTOs;
using KvizHub.Repository.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KvizHub.Services.Interfaces
{
    public interface IQuizService
    {
        Task<QuizDto?> GetByIdAsync(int id);
        Task<QuizDetailDto?> GetByIdWithQuestionsAsync(int id);
        Task<IEnumerable<QuizDto>> GetAllAsync();
        Task<IEnumerable<QuizDto>> GetActiveAsync();
        Task<QuizDto?> CreateAsync(CreateQuizDto createDto);
        Task<bool> UpdateAsync(int id, UpdateQuizDto updateDto);
        Task<bool> DeleteAsync(int id);
        Task<IEnumerable<QuizDto>> GetByCategoryAsync(int categoryId);
        Task<IEnumerable<QuizDto>> GetByDifficultyAsync(DifficultyLevel difficulty);
        Task<IEnumerable<QuizDto>> SearchAsync(string searchTerm);
        Task<int> GetTotalQuizzesCountAsync();
        Task<int> GetActiveQuizzesCountAsync();
        Task<IEnumerable<QuizDto>> GetPopularQuizzesAsync(int count);
        Task<IEnumerable<QuizDto>> GetRecentQuizzesAsync(int count);
        Task<bool> ToggleActiveStatusAsync(int id);
    }
}
