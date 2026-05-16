using KvizHub.Repository.Contracts;
using KvizHub.Repository.Data;
using KvizHub.Repository.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KvizHub.Repository.Repositories
{
    public class AnswerRepository : IAnswerRepository
    {
        private readonly AppDbContext _context;

        public AnswerRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Answer?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _context.Answers
                .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
        }

        public async Task<IEnumerable<Answer>> GetByQuestionIdAsync(int questionId, CancellationToken cancellationToken = default)
        {
            return await _context.Answers
                .Where(a => a.QuestionId == questionId)
                .OrderBy(a => a.OrderIndex)
                .ToListAsync(cancellationToken);
        }

        public async Task<bool> AddAsync(Answer answer, CancellationToken cancellationToken = default)
        {
            await _context.Answers.AddAsync(answer, cancellationToken);
            return await _context.SaveChangesAsync(cancellationToken) > 0;
        }

        public async Task<bool> UpdateAsync(Answer answer, CancellationToken cancellationToken = default)
        {
            _context.Answers.Update(answer);
            return await _context.SaveChangesAsync(cancellationToken) > 0;
        }

        public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var answer = await GetByIdAsync(id, cancellationToken);
            if (answer == null) return false;

            _context.Answers.Remove(answer);
            return await _context.SaveChangesAsync(cancellationToken) > 0;
        }

        public async Task<bool> AddRangeAsync(IEnumerable<Answer> answers, CancellationToken cancellationToken = default)
        {
            await _context.Answers.AddRangeAsync(answers, cancellationToken);
            return await _context.SaveChangesAsync(cancellationToken) > 0;
        }

        public async Task<bool> DeleteByQuestionIdAsync(int questionId, CancellationToken cancellationToken = default)
        {
            var answers = await GetByQuestionIdAsync(questionId, cancellationToken);
            if (!answers.Any()) return true;

            _context.Answers.RemoveRange(answers);
            return await _context.SaveChangesAsync(cancellationToken) > 0;
        }

        public async Task<bool> DeleteByQuizIdAsync(int quizId, CancellationToken cancellationToken = default)
        {
            var answers = await _context.Answers
                .Where(a => a.Question.QuizId == quizId)
                .ToListAsync(cancellationToken);

            if (!answers.Any()) return true;

            _context.Answers.RemoveRange(answers);
            return await _context.SaveChangesAsync(cancellationToken) > 0;
        }

        public async Task<IEnumerable<Answer>> GetCorrectAnswersByQuestionIdAsync(int questionId, CancellationToken cancellationToken = default)
        {
            return await _context.Answers
                .Where(a => a.QuestionId == questionId && a.IsCorrect)
                .OrderBy(a => a.OrderIndex)
                .ToListAsync(cancellationToken);
        }

        public async Task<bool> HasCorrectAnswerAsync(int questionId, CancellationToken cancellationToken = default)
        {
            return await _context.Answers
                .AnyAsync(a => a.QuestionId == questionId && a.IsCorrect, cancellationToken);
        }

        public async Task<bool> UpdateOrderIndexAsync(int answerId, int newOrderIndex, CancellationToken cancellationToken = default)
        {
            var answer = await GetByIdAsync(answerId, cancellationToken);
            if (answer == null) return false;

            answer.OrderIndex = newOrderIndex;
            return await _context.SaveChangesAsync(cancellationToken) > 0;
        }
    }
}