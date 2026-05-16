using KvizHub.Repository.Contracts;
using KvizHub.Repository.Data;
using KvizHub.Repository.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace KvizHub.Repository.Repositories
{
    public class QuizCategoryRepository : IQuizCategoryRepository
    {
        private readonly AppDbContext _context;

        public QuizCategoryRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<QuizCategory?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _context.QuizCategories
                .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
        }

        public async Task<IEnumerable<QuizCategory>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _context.QuizCategories
                .OrderBy(c => c.Name)
                .ToListAsync(cancellationToken);
        }

        public async Task<bool> AddAsync(QuizCategory category, CancellationToken cancellationToken = default)
        {
            await _context.QuizCategories.AddAsync(category, cancellationToken);
            return await _context.SaveChangesAsync(cancellationToken) > 0;
        }

        public async Task<bool> UpdateAsync(QuizCategory category, CancellationToken cancellationToken = default)
        {
            _context.QuizCategories.Update(category);
            return await _context.SaveChangesAsync(cancellationToken) > 0;
        }

        public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var category = await GetByIdAsync(id, cancellationToken);
            if (category == null) return false;

            // Check if category has any quizzes
            var hasQuizzes = await _context.Quizzes.AnyAsync(q => q.CategoryId == id, cancellationToken);
            if (hasQuizzes) return false; // Cannot delete category with quizzes

            _context.QuizCategories.Remove(category);
            return await _context.SaveChangesAsync(cancellationToken) > 0;
        }

        public async Task<bool> NameExistsAsync(string name, int? excludeId = null, CancellationToken cancellationToken = default)
        {
            var query = _context.QuizCategories.Where(c => c.Name == name);

            if (excludeId.HasValue)
            {
                query = query.Where(c => c.Id != excludeId.Value);
            }

            return await query.AnyAsync(cancellationToken);
        }

        public async Task<int> GetQuizzesCountByCategoryAsync(int categoryId, CancellationToken cancellationToken = default)
        {
            return await _context.Quizzes
                .CountAsync(q => q.CategoryId == categoryId, cancellationToken);
        }

        public async Task<IEnumerable<QuizCategory>> GetCategoriesWithQuizCountAsync(CancellationToken cancellationToken = default)
        {
            return await _context.QuizCategories
                .Include(c => c.Quizzes)
                .OrderBy(c => c.Name)
                .ToListAsync(cancellationToken);
        }
    }
}
