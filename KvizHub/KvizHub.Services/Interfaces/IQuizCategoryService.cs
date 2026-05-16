using KvizHub.Repository.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KvizHub.Services.Interfaces
{
    public interface IQuizCategoryService
    {
        Task<QuizCategoryDto?> GetByIdAsync(int id);
        Task<IEnumerable<QuizCategoryDto>> GetAllAsync();
        Task<IEnumerable<QuizCategoryDto>> GetActiveAsync();
        Task<QuizCategoryDto?> CreateAsync(CreateQuizCategoryDto createDto);
        Task<bool> UpdateAsync(int id, UpdateQuizCategoryDto updateDto);
        Task<bool> DeleteAsync(int id);
        Task<QuizCategoryDto?> GetByNameAsync(string name);
        Task<IEnumerable<QuizCategoryDto>> SearchAsync(string searchTerm);
        Task<int> GetTotalCategoriesCountAsync();
        Task<int> GetActiveCategoriesCountAsync();
        Task<IEnumerable<QuizCategoryWithCountDto>> GetCategoriesWithQuizCountAsync();
        Task<bool> ToggleActiveStatusAsync(int id);
    }
}

