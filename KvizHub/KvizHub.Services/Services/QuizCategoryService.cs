using KvizHub.Repository.Contracts;
using KvizHub.Repository.DTOs;
using KvizHub.Repository.Models;
using KvizHub.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;

namespace KvizHub.Services.Services
{
    public class QuizCategoryService : IQuizCategoryService
    {
        private readonly IQuizCategoryRepository _categoryRepository;
        private readonly IMapper _mapper;

        public QuizCategoryService(IQuizCategoryRepository categoryRepository, IMapper mapper)
        {
            _categoryRepository = categoryRepository;
            _mapper = mapper;
        }

        public async Task<QuizCategoryDto?> GetByIdAsync(int id)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            return category != null ? _mapper.Map<QuizCategoryDto>(category) : null;
        }

        public async Task<IEnumerable<QuizCategoryDto>> GetAllAsync()
        {
            var categories = await _categoryRepository.GetAllAsync();
            return _mapper.Map<IEnumerable<QuizCategoryDto>>(categories);
        }

        public async Task<IEnumerable<QuizCategoryDto>> GetActiveAsync()
        {
            var categories = await _categoryRepository.GetAllAsync();
            var activeCategories = categories.Where(c => c.IsActive);
            return _mapper.Map<IEnumerable<QuizCategoryDto>>(activeCategories);
        }

        public async Task<QuizCategoryDto?> CreateAsync(CreateQuizCategoryDto createDto)
        {
            var category = _mapper.Map<QuizCategory>(createDto);
            var success = await _categoryRepository.AddAsync(category);

            return success ? _mapper.Map<QuizCategoryDto>(category) : null;
        }

        public async Task<bool> UpdateAsync(int id, UpdateQuizCategoryDto updateDto)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null) return false;

            _mapper.Map(updateDto, category);
            return await _categoryRepository.UpdateAsync(category);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            return await _categoryRepository.DeleteAsync(id);
        }

        public async Task<QuizCategoryDto?> GetByNameAsync(string name)
        {
            var categories = await _categoryRepository.GetAllAsync();
            var category = categories.FirstOrDefault(c => c.Name.Equals(name, StringComparison.OrdinalIgnoreCase));
            return category != null ? _mapper.Map<QuizCategoryDto>(category) : null;
        }

        public async Task<IEnumerable<QuizCategoryDto>> SearchAsync(string searchTerm)
        {
            var categories = await _categoryRepository.GetAllAsync();
            var filteredCategories = categories.Where(c =>
                c.Name.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ||
                (c.Description?.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ?? false));
            return _mapper.Map<IEnumerable<QuizCategoryDto>>(filteredCategories);
        }

        public async Task<int> GetTotalCategoriesCountAsync()
        {
            var categories = await _categoryRepository.GetAllAsync();
            return categories.Count();
        }

        public async Task<int> GetActiveCategoriesCountAsync()
        {
            var categories = await _categoryRepository.GetAllAsync();
            return categories.Count(c => c.IsActive);
        }

        public async Task<IEnumerable<QuizCategoryWithCountDto>> GetCategoriesWithQuizCountAsync()
        {
            var categories = await _categoryRepository.GetCategoriesWithQuizCountAsync();
            return _mapper.Map<IEnumerable<QuizCategoryWithCountDto>>(categories);
        }

        public async Task<bool> ToggleActiveStatusAsync(int id)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null) return false;

            category.IsActive = !category.IsActive;
            return await _categoryRepository.UpdateAsync(category);
        }
    }
}
