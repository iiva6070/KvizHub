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
    public class QuestionRepository : IQuestionRepository
    {
        private readonly AppDbContext _context;

        public QuestionRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Question?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _context.Questions
                .FirstOrDefaultAsync(q => q.Id == id, cancellationToken);
        }

        public async Task<Question?> GetByIdWithAnswersAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _context.Questions
                .Include(q => q.Answers.OrderBy(a => a.OrderIndex))
                .FirstOrDefaultAsync(q => q.Id == id, cancellationToken);
        }

        public async Task<IEnumerable<Question>> GetAllWithQuizInfoAsync(CancellationToken cancellationToken = default)
        {
            return await _context.Questions
                .Include(q => q.Quiz)
                .Include(q => q.Answers)
                .OrderBy(q => q.QuizId)
                .ThenBy(q => q.OrderIndex)
                .ToListAsync(cancellationToken);
        }

        public async Task<IEnumerable<Question>> GetByQuizIdAsync(int quizId, CancellationToken cancellationToken = default)
        {
            return await _context.Questions
                .Where(q => q.QuizId == quizId)
                .OrderBy(q => q.OrderIndex)
                .ToListAsync(cancellationToken);
        }

        public async Task<IEnumerable<Question>> GetByQuizIdWithAnswersAsync(int quizId, CancellationToken cancellationToken = default)
        {
            return await _context.Questions
                .Include(q => q.Answers.OrderBy(a => a.OrderIndex))
                .Where(q => q.QuizId == quizId)
                .OrderBy(q => q.OrderIndex)
                .ToListAsync(cancellationToken);
        }

        public async Task<bool> AddAsync(Question question, CancellationToken cancellationToken = default)
        {
            await _context.Questions.AddAsync(question, cancellationToken);
            return await _context.SaveChangesAsync(cancellationToken) > 0;
        }

        public async Task<bool> UpdateAsync(Question question, CancellationToken cancellationToken = default)
        {
            _context.Questions.Update(question);
            return await _context.SaveChangesAsync(cancellationToken) > 0;
        }

        public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var question = await _context.Questions
                .Include(q => q.Answers)
                .Include(q => q.UserAnswers)
                .FirstOrDefaultAsync(q => q.Id == id, cancellationToken);

            if (question == null) return false;

            Console.WriteLine($"🗑️ Deleting question {id}: {question.UserAnswers.Count} user answers, {question.Answers.Count} answers");

            // Prvo obriši povezane UserAnswers
            if (question.UserAnswers.Any())
            {
                Console.WriteLine($"🗑️ Removing {question.UserAnswers.Count} user answers");
                _context.UserAnswers.RemoveRange(question.UserAnswers);
            }

            // Zatim obriši povezane Answers
            if (question.Answers.Any())
            {
                Console.WriteLine($"🗑️ Removing {question.Answers.Count} answers");
                _context.Answers.RemoveRange(question.Answers);
            }

            // Na kraju obriši pitanje
            Console.WriteLine($"🗑️ Removing question {id}");
            _context.Questions.Remove(question);

            return await _context.SaveChangesAsync(cancellationToken) > 0;
        }

        public async Task<bool> AddRangeAsync(IEnumerable<Question> questions, CancellationToken cancellationToken = default)
        {
            await _context.Questions.AddRangeAsync(questions, cancellationToken);
            return await _context.SaveChangesAsync(cancellationToken) > 0;
        }

        public async Task<bool> DeleteByQuizIdAsync(int quizId, CancellationToken cancellationToken = default)
        {
            var questions = await GetByQuizIdAsync(quizId, cancellationToken);
            if (!questions.Any()) return true;

            _context.Questions.RemoveRange(questions);
            return await _context.SaveChangesAsync(cancellationToken) > 0;
        }

        public async Task<bool> UpdateOrderIndexAsync(int questionId, int newOrderIndex, CancellationToken cancellationToken = default)
        {
            var question = await GetByIdAsync(questionId, cancellationToken);
            if (question == null) return false;

            question.OrderIndex = newOrderIndex;
            return await _context.SaveChangesAsync(cancellationToken) > 0;
        }

        public async Task<bool> ReorderQuestionsAsync(int quizId, Dictionary<int, int> questionOrderMap, CancellationToken cancellationToken = default)
        {
            var questions = await GetByQuizIdAsync(quizId, cancellationToken);

            foreach (var question in questions)
            {
                if (questionOrderMap.ContainsKey(question.Id))
                {
                    question.OrderIndex = questionOrderMap[question.Id];
                }
            }

            return await _context.SaveChangesAsync(cancellationToken) > 0;
        }

        public async Task<int> GetQuestionCountByQuizAsync(int quizId, CancellationToken cancellationToken = default)
        {
            return await _context.Questions
                .CountAsync(q => q.QuizId == quizId, cancellationToken);
        }

        public async Task<int> GetQuestionCountByTypeAsync(QuestionType type, CancellationToken cancellationToken = default)
        {
            return await _context.Questions
                .CountAsync(q => q.Type == type, cancellationToken);
        }
    }
}
