using KvizHub.Repository.Contracts;
using KvizHub.Repository.Data;
using KvizHub.Repository.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace KvizHub.Repository.Repositories
{
    public class UserAnswerRepository : IUserAnswerRepository
    {
        private readonly AppDbContext _context;

        public UserAnswerRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<UserAnswer?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _context.UserAnswers
                .Include(ua => ua.Question)
                .Include(ua => ua.QuizAttempt)
                .FirstOrDefaultAsync(ua => ua.Id == id, cancellationToken);
        }

        public async Task<IEnumerable<UserAnswer>> GetByQuizAttemptIdAsync(int quizAttemptId, CancellationToken cancellationToken = default)
        {
            return await _context.UserAnswers
                .Where(ua => ua.QuizAttemptId == quizAttemptId)
                .OrderBy(ua => ua.Question.OrderIndex)
                .ToListAsync(cancellationToken);
        }

        public async Task<IEnumerable<UserAnswer>> GetByQuizAttemptIdWithDetailsAsync(int quizAttemptId, CancellationToken cancellationToken = default)
        {
            return await _context.UserAnswers
                .Include(ua => ua.Question)
                    .ThenInclude(q => q.Answers)
                .Where(ua => ua.QuizAttemptId == quizAttemptId)
                .OrderBy(ua => ua.Question.OrderIndex)
                .ToListAsync(cancellationToken);
        }

        public async Task<bool> AddAsync(UserAnswer userAnswer, CancellationToken cancellationToken = default)
        {
            await _context.UserAnswers.AddAsync(userAnswer, cancellationToken);
            return await _context.SaveChangesAsync(cancellationToken) > 0;
        }

        public async Task<bool> UpdateAsync(UserAnswer userAnswer, CancellationToken cancellationToken = default)
        {
            _context.UserAnswers.Update(userAnswer);
            return await _context.SaveChangesAsync(cancellationToken) > 0;
        }

        public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var userAnswer = await GetByIdAsync(id, cancellationToken);
            if (userAnswer == null) return false;

            _context.UserAnswers.Remove(userAnswer);
            return await _context.SaveChangesAsync(cancellationToken) > 0;
        }

        public async Task<bool> AddRangeAsync(IEnumerable<UserAnswer> userAnswers, CancellationToken cancellationToken = default)
        {
            await _context.UserAnswers.AddRangeAsync(userAnswers, cancellationToken);
            return await _context.SaveChangesAsync(cancellationToken) > 0;
        }

        public async Task<bool> DeleteByQuizAttemptIdAsync(int quizAttemptId, CancellationToken cancellationToken = default)
        {
            var userAnswers = await GetByQuizAttemptIdAsync(quizAttemptId, cancellationToken);
            if (!userAnswers.Any()) return true;

            _context.UserAnswers.RemoveRange(userAnswers);
            return await _context.SaveChangesAsync(cancellationToken) > 0;
        }

        public async Task<bool> ValidateAndScoreAnswersAsync(int quizAttemptId, CancellationToken cancellationToken = default)
        {
            var userAnswers = await GetByQuizAttemptIdWithDetailsAsync(quizAttemptId, cancellationToken);

            foreach (var userAnswer in userAnswers)
            {
                userAnswer.IsCorrect = await ValidateUserAnswerAsync(userAnswer, cancellationToken);
            }

            return await _context.SaveChangesAsync(cancellationToken) > 0;
        }

        private async Task<bool> ValidateUserAnswerAsync(UserAnswer userAnswer, CancellationToken cancellationToken)
        {
            var question = await _context.Questions
                .Include(q => q.Answers)
                .FirstOrDefaultAsync(q => q.Id == userAnswer.QuestionId, cancellationToken);

            if (question == null) return false;

            switch (question.Type)
            {
                case QuestionType.SingleChoice:
                    if (!string.IsNullOrEmpty(userAnswer.SelectedAnswerIds))
                    {
                        var selectedIds = JsonSerializer.Deserialize<List<int>>(userAnswer.SelectedAnswerIds);
                        if (selectedIds?.Count == 1)
                        {
                            var selectedAnswer = question.Answers.FirstOrDefault(a => a.Id == selectedIds[0]);
                            return selectedAnswer?.IsCorrect == true;
                        }
                    }
                    break;

                case QuestionType.MultipleChoice:
                    if (!string.IsNullOrEmpty(userAnswer.SelectedAnswerIds))
                    {
                        var selectedIds = JsonSerializer.Deserialize<List<int>>(userAnswer.SelectedAnswerIds);
                        var correctAnswerIds = question.Answers.Where(a => a.IsCorrect).Select(a => a.Id).ToList();

                        return selectedIds != null &&
                               selectedIds.Count == correctAnswerIds.Count &&
                               selectedIds.All(id => correctAnswerIds.Contains(id));
                    }
                    break;

                case QuestionType.TrueFalse:
                    if (!string.IsNullOrEmpty(userAnswer.SelectedAnswerIds))
                    {
                        var selectedIds = JsonSerializer.Deserialize<List<int>>(userAnswer.SelectedAnswerIds);
                        if (selectedIds?.Count == 1)
                        {
                            var selectedAnswer = question.Answers.FirstOrDefault(a => a.Id == selectedIds[0]);
                            return selectedAnswer?.IsCorrect == true;
                        }
                    }
                    break;

                case QuestionType.FillInTheBlank:
                    if (!string.IsNullOrEmpty(userAnswer.TextAnswer))
                    {
                        var correctAnswers = question.Answers.Where(a => a.IsCorrect).Select(a => a.Text.ToLowerInvariant().Trim());
                        var userAnswerText = userAnswer.TextAnswer.ToLowerInvariant().Trim();
                        return correctAnswers.Contains(userAnswerText);
                    }
                    break;
            }

            return false;
        }

        public async Task<int> GetCorrectAnswersCountAsync(int quizAttemptId, CancellationToken cancellationToken = default)
        {
            return await _context.UserAnswers
                .CountAsync(ua => ua.QuizAttemptId == quizAttemptId && ua.IsCorrect, cancellationToken);
        }

        public async Task<int> GetTotalAnswersCountAsync(int quizAttemptId, CancellationToken cancellationToken = default)
        {
            return await _context.UserAnswers
                .CountAsync(ua => ua.QuizAttemptId == quizAttemptId, cancellationToken);
        }

        public async Task<int> CalculateScoreAsync(int quizAttemptId, CancellationToken cancellationToken = default)
        {
            var userAnswers = await _context.UserAnswers
                .Include(ua => ua.Question)
                .Where(ua => ua.QuizAttemptId == quizAttemptId && ua.IsCorrect)
                .ToListAsync(cancellationToken);

            return userAnswers.Sum(ua => ua.Question.Points);
        }

        public async Task<UserAnswer?> GetUserAnswerForQuestionAsync(int quizAttemptId, int questionId, CancellationToken cancellationToken = default)
        {
            return await _context.UserAnswers
                .FirstOrDefaultAsync(ua => ua.QuizAttemptId == quizAttemptId && ua.QuestionId == questionId, cancellationToken);
        }

        public async Task<bool> HasAnsweredQuestionAsync(int quizAttemptId, int questionId, CancellationToken cancellationToken = default)
        {
            return await _context.UserAnswers
                .AnyAsync(ua => ua.QuizAttemptId == quizAttemptId && ua.QuestionId == questionId, cancellationToken);
        }
    }
}
