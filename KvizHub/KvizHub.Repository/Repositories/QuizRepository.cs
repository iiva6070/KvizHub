
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
    public class QuizRepository : IQuizRepository
    {
        private readonly AppDbContext _context;

        public QuizRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Quiz?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _context.Quizzes
                .Include(q => q.Category)
                .FirstOrDefaultAsync(q => q.Id == id, cancellationToken);
        }

        public async Task<Quiz?> GetByIdWithQuestionsAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _context.Quizzes
                .Include(q => q.Category)
                .Include(q => q.Questions.OrderBy(qu => qu.OrderIndex))
                    .ThenInclude(qu => qu.Answers.OrderBy(a => a.OrderIndex))
                .FirstOrDefaultAsync(q => q.Id == id, cancellationToken);
        }

        public async Task<Quiz?> GetByIdWithAnswersAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _context.Quizzes
                .Include(q => q.Category)
                .Include(q => q.Questions.OrderBy(qu => qu.OrderIndex))
                    .ThenInclude(qu => qu.Answers.OrderBy(a => a.OrderIndex))
                .FirstOrDefaultAsync(q => q.Id == id, cancellationToken);
        }

        public async Task<Quiz?> CreateAsync(Quiz quiz, CancellationToken cancellationToken = default)
        {
            _context.Quizzes.Add(quiz);
            var result = await _context.SaveChangesAsync(cancellationToken);
            return result > 0 ? quiz : null;
        }

        public async Task<IEnumerable<Quiz>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _context.Quizzes
                .Include(q => q.Category)
                .Include(q => q.Questions)
                .OrderByDescending(q => q.CreatedAt)
                .ToListAsync(cancellationToken);
        }

        public async Task<IEnumerable<Quiz>> GetActiveAsync(CancellationToken cancellationToken = default)
        {
            return await _context.Quizzes
                .Include(q => q.Category)
                .Include(q => q.Questions)
                .Where(q => q.IsActive)
                .OrderByDescending(q => q.CreatedAt)
                .ToListAsync(cancellationToken);
        }

        public async Task<bool> AddAsync(Quiz quiz, CancellationToken cancellationToken = default)
        {
            await _context.Quizzes.AddAsync(quiz, cancellationToken);
            return await _context.SaveChangesAsync(cancellationToken) > 0;
        }

        public async Task<bool> UpdateAsync(Quiz quiz, CancellationToken cancellationToken = default)
        {
            quiz.UpdatedAt = DateTime.UtcNow;
            _context.Quizzes.Update(quiz);
            return await _context.SaveChangesAsync(cancellationToken) > 0;
        }

        public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var quiz = await _context.Quizzes
                .Include(q => q.QuizAttempts)
                    .ThenInclude(qa => qa.UserAnswers)
                .Include(q => q.Questions)
                    .ThenInclude(q => q.Answers)
                .FirstOrDefaultAsync(q => q.Id == id, cancellationToken);

            if (quiz == null) return false;

            // Prvo obriši UserAnswers
            foreach (var attempt in quiz.QuizAttempts)
            {
                _context.UserAnswers.RemoveRange(attempt.UserAnswers);
            }

            // Zatim obriši QuizAttempts
            _context.QuizAttempts.RemoveRange(quiz.QuizAttempts);

            // Zatim obriši Answers za svako pitanje
            foreach (var question in quiz.Questions)
            {
                _context.Answers.RemoveRange(question.Answers);
            }

            // Zatim obriši Questions
            _context.Questions.RemoveRange(quiz.Questions);

            // Konačno obriši Quiz
            _context.Quizzes.Remove(quiz);

            return await _context.SaveChangesAsync(cancellationToken) > 0;
        }

        public async Task<IEnumerable<Quiz>> GetByCategoryAsync(int categoryId, CancellationToken cancellationToken = default)
        {
            return await _context.Quizzes
                .Include(q => q.Category)
                .Where(q => q.CategoryId == categoryId && q.IsActive)
                .OrderByDescending(q => q.CreatedAt)
                .ToListAsync(cancellationToken);
        }

        public async Task<IEnumerable<Quiz>> GetByDifficultyAsync(DifficultyLevel difficulty, CancellationToken cancellationToken = default)
        {
            return await _context.Quizzes
                .Include(q => q.Category)
                .Where(q => q.Difficulty == difficulty && q.IsActive)
                .OrderByDescending(q => q.CreatedAt)
                .ToListAsync(cancellationToken);
        }

        public async Task<IEnumerable<Quiz>> SearchAsync(string searchTerm, CancellationToken cancellationToken = default)
        {
            return await _context.Quizzes
                .Include(q => q.Category)
                .Where(q => q.IsActive &&
                           (q.Title.Contains(searchTerm) ||
                            q.Description.Contains(searchTerm) ||
                            q.Category.Name.Contains(searchTerm)))
                .OrderByDescending(q => q.CreatedAt)
                .ToListAsync(cancellationToken);
        }

        public async Task<int> GetTotalQuizzesCountAsync(CancellationToken cancellationToken = default)
        {
            return await _context.Quizzes.CountAsync(cancellationToken);
        }

        public async Task<int> GetActiveQuizzesCountAsync(CancellationToken cancellationToken = default)
        {
            return await _context.Quizzes.CountAsync(q => q.IsActive, cancellationToken);
        }

        public async Task<IEnumerable<Quiz>> GetPopularQuizzesAsync(int count, CancellationToken cancellationToken = default)
        {
            return await _context.Quizzes
                .Include(q => q.Category)
                .Include(q => q.QuizAttempts)
                .Where(q => q.IsActive)
                .OrderByDescending(q => q.QuizAttempts.Count)
                .Take(count)
                .ToListAsync(cancellationToken);
        }

        public async Task<IEnumerable<Quiz>> GetRecentQuizzesAsync(int count, CancellationToken cancellationToken = default)
        {
            return await _context.Quizzes
                .Include(q => q.Category)
                .Where(q => q.IsActive)
                .OrderByDescending(q => q.CreatedAt)
                .Take(count)
                .ToListAsync(cancellationToken);
        }

        public async Task<bool> ToggleActiveStatusAsync(int id, CancellationToken cancellationToken = default)
        {
            var quiz = await GetByIdAsync(id, cancellationToken);
            if (quiz == null) return false;

            quiz.IsActive = !quiz.IsActive;
            quiz.UpdatedAt = DateTime.UtcNow;

            return await _context.SaveChangesAsync(cancellationToken) > 0;
        }
    }
}
