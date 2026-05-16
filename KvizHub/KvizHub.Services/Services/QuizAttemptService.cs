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
    public class QuizAttemptService : IQuizAttemptService
    {
        private readonly IQuizAttemptRepository _quizAttemptRepository;
        private readonly IUserAnswerRepository _userAnswerRepository;
        private readonly IQuizRepository _quizRepository;
        private readonly IQuestionRepository _questionRepository;
        private readonly IAnswerRepository _answerRepository;
        private readonly IMapper _mapper;

        public QuizAttemptService(
            IQuizAttemptRepository quizAttemptRepository,
            IUserAnswerRepository userAnswerRepository,
            IQuizRepository quizRepository,
            IQuestionRepository questionRepository,
            IAnswerRepository answerRepository,
            IMapper mapper)
        {
            _quizAttemptRepository = quizAttemptRepository;
            _userAnswerRepository = userAnswerRepository;
            _quizRepository = quizRepository;
            _questionRepository = questionRepository;
            _answerRepository = answerRepository;
            _mapper = mapper;
        }

        public async Task<QuizAttemptDto?> GetByIdAsync(int id)
        {
            var attempt = await _quizAttemptRepository.GetByIdAsync(id);
            return attempt != null ? _mapper.Map<QuizAttemptDto>(attempt) : null;
        }

        public async Task<QuizAttemptDetailDto?> GetByIdWithAnswersAsync(int id)
        {
            var attempt = await _quizAttemptRepository.GetByIdWithDetailsAsync(id);
            return attempt != null ? _mapper.Map<QuizAttemptDetailDto>(attempt) : null;
        }

        public async Task<IEnumerable<QuizAttemptDto>> GetByUserIdAsync(int userId)
        {
            var attempts = await _quizAttemptRepository.GetByUserIdAsync(userId);
            return _mapper.Map<IEnumerable<QuizAttemptDto>>(attempts);
        }

        public async Task<IEnumerable<QuizAttemptDto>> GetByQuizIdAsync(int quizId)
        {
            var attempts = await _quizAttemptRepository.GetByQuizIdAsync(quizId);
            return _mapper.Map<IEnumerable<QuizAttemptDto>>(attempts);
        }

        public async Task<QuizAttemptDto?> StartQuizAsync(int userId, StartQuizAttemptDto startDto)
        {
            // Check if quiz exists and is active
            var quiz = await _quizRepository.GetByIdAsync(startDto.QuizId);
            if (quiz == null || !quiz.IsActive)
                return null;

            // Create quiz attempt
            var quizAttempt = new QuizAttempt
            {
                UserId = userId,
                QuizId = startDto.QuizId,
                StartedAt = DateTime.UtcNow,
                IsCompleted = false,
                Score = 0,
                CorrectAnswers = 0,
                TotalQuestions = 0,
                Percentage = 0
            };

            var success = await _quizAttemptRepository.AddAsync(quizAttempt);
            if (!success) return null;

            return _mapper.Map<QuizAttemptDto>(quizAttempt);
        }

        public async Task<QuizAttemptDetailDto?> SubmitQuizAsync(int userId, SubmitQuizAttemptDto submitDto)
        {
            var attempt = await _quizAttemptRepository.GetByIdAsync(submitDto.QuizAttemptId);
            if (attempt == null || attempt.UserId != userId)
                return null;

            // Check if quiz is already completed
            if (attempt.IsCompleted)
            {
                Console.WriteLine($" Quiz attempt {submitDto.QuizAttemptId} is already completed");
                return null;
            }

            // Get quiz to check time limit
            var quiz = await _quizRepository.GetByIdAsync(attempt.QuizId);
            if (quiz == null)
                return null;

            // Check if time limit exceeded
            var elapsedMinutes = (DateTime.UtcNow - attempt.StartedAt).TotalMinutes;
            var isTimedOut = elapsedMinutes > quiz.TimeLimitMinutes;

            Console.WriteLine($" SubmitQuizAsync called with userId: {userId}");
            Console.WriteLine($" QuizAttemptId: {submitDto.QuizAttemptId}");
            Console.WriteLine($" Elapsed minutes: {elapsedMinutes}, Time limit: {quiz.TimeLimitMinutes}");
            Console.WriteLine($" Is timed out: {isTimedOut}");
            Console.WriteLine($" UserAnswers count: {submitDto.UserAnswers?.Count ?? 0}");

            foreach (var ua in submitDto.UserAnswers ?? new List<SubmitUserAnswerDto>())
            {
                Console.WriteLine($" UserAnswer: QuestionId={ua.QuestionId}, SelectedAnswerIds={ua.SelectedAnswerIds}");
            }

            // Calculate completion time - use frontend time if available, otherwise calculate from StartedAt
            var completionTime = submitDto.ActualTimeSpentSeconds ?? (DateTime.UtcNow - attempt.StartedAt).TotalSeconds;
            Console.WriteLine($" Using completion time: {completionTime} seconds (from frontend: {submitDto.ActualTimeSpentSeconds.HasValue})");

            // Save user answers
            var userAnswers = new List<UserAnswer>();
            if (submitDto.UserAnswers != null)
            {
                foreach (var answerDto in submitDto.UserAnswers)
                {
                    var userAnswer = new UserAnswer
                    {
                        QuizAttemptId = submitDto.QuizAttemptId,
                        QuestionId = answerDto.QuestionId,
                        SelectedAnswerIds = answerDto.SelectedAnswerIds,
                        TextAnswer = answerDto.TextAnswer,
                        AnsweredAt = DateTime.UtcNow
                    };
                    userAnswers.Add(userAnswer);
                }
            }

            await _userAnswerRepository.AddRangeAsync(userAnswers);

            // Calculate score - implement proper scoring logic
            var score = 0;
            var correctAnswers = 0;

            // Get quiz with questions and answers
            var quizWithQuestions = await _quizRepository.GetByIdWithQuestionsAsync(attempt.QuizId);
            if (quizWithQuestions != null)
            {
                foreach (var userAnswer in userAnswers)
                {
                    var question = quizWithQuestions.Questions.FirstOrDefault(q => q.Id == userAnswer.QuestionId);
                    if (question != null)
                    {
                        bool isCorrect = false;

                        // Handle FillInTheBlank questions
                        if (question.Type == QuestionType.FillInTheBlank)
                        {
                            if (!string.IsNullOrEmpty(userAnswer.TextAnswer) && !string.IsNullOrEmpty(question.CorrectAnswer))
                            {
                                // Case-insensitive comparison with trimmed strings
                                var userText = userAnswer.TextAnswer.Trim().ToLowerInvariant();
                                var correctText = question.CorrectAnswer.Trim().ToLowerInvariant();
                                isCorrect = userText == correctText;
                            }
                        }
                        else
                        {
                            // Handle other question types (SingleChoice, MultipleChoice, TrueFalse)
                            var correctAnswerIds = question.Answers
                                .Where(a => a.IsCorrect)
                                .Select(a => a.Id.ToString())
                                .ToList();

                            // Check if user's answer matches correct answer(s)
                            var userAnswerIds = userAnswer.SelectedAnswerIds?.Split(',')
                                .Select(id => id.Trim())
                                .Where(id => !string.IsNullOrEmpty(id))
                                .ToList() ?? new List<string>();

                            // For single correct answer questions
                            if (correctAnswerIds.Count == 1)
                            {
                                isCorrect = userAnswerIds.Contains(correctAnswerIds.First());
                            }
                            // For multiple correct answer questions
                            else if (correctAnswerIds.Count > 1)
                            {
                                // All correct answers must be selected, no incorrect ones
                                isCorrect = userAnswerIds.Count == correctAnswerIds.Count &&
                                           correctAnswerIds.All(id => userAnswerIds.Contains(id));
                            }
                        }

                        // Update user answer correctness
                        userAnswer.IsCorrect = isCorrect;

                        if (isCorrect)
                        {
                            score += 10; // 10 points per correct answer
                            correctAnswers++;
                        }
                    }
                }
            }

            // Update quiz attempt
            attempt.Score = score;
            attempt.TimeSpent = TimeSpan.FromSeconds(completionTime);
            attempt.IsCompleted = true;
            attempt.CompletedAt = DateTime.UtcNow;
            attempt.CorrectAnswers = correctAnswers;
            attempt.TotalQuestions = submitDto.UserAnswers?.Count ?? 0;
            attempt.Percentage = attempt.TotalQuestions > 0 ? (decimal)correctAnswers / attempt.TotalQuestions * 100 : 0;

            // If timed out, add a note or flag
            if (isTimedOut)
            {
                Console.WriteLine($" Quiz attempt {submitDto.QuizAttemptId} was completed after timeout");
                // You might want to add a TimedOut property to QuizAttempt model in future
            }

            await _quizAttemptRepository.UpdateAsync(attempt);

            // Reload attempt with UserAnswers for proper mapping
            var updatedAttempt = await GetByIdWithDetailsAsync(attempt.Id);
            return updatedAttempt;
        }

        public async Task<QuizAttemptDetailDto?> GetByIdWithDetailsAsync(int id)
        {
            var attempt = await _quizAttemptRepository.GetByIdWithDetailsAsync(id);
            if (attempt == null) return null;

            var result = _mapper.Map<QuizAttemptDetailDto>(attempt);

            // Set WasSelected property for each answer
            foreach (var userAnswer in result.UserAnswers)
            {
                Console.WriteLine($" Processing UserAnswer {userAnswer.Id}, SelectedAnswerIds: '{userAnswer.SelectedAnswerIds}'");

                var selectedAnswerIds = userAnswer.SelectedAnswerIds?.Split(',')
                    .Select(id => int.TryParse(id.Trim(), out var answerId) ? answerId : 0)
                    .Where(id => id > 0)
                    .ToList() ?? new List<int>();

                Console.WriteLine($" Parsed selected IDs: [{string.Join(", ", selectedAnswerIds)}]");

                foreach (var availableAnswer in userAnswer.AvailableAnswers)
                {
                    var wasSelected = selectedAnswerIds.Contains(availableAnswer.Id);
                    availableAnswer.WasSelected = wasSelected;
                    Console.WriteLine($"   Answer {availableAnswer.Id} ({availableAnswer.Text}): WasSelected = {wasSelected}");
                }
            }

            return result;
        }

        public async Task<IEnumerable<QuizAttemptDto>> GetUserAttemptsAsync(int userId)
        {
            var attempts = await _quizAttemptRepository.GetByUserIdAsync(userId);
            return _mapper.Map<IEnumerable<QuizAttemptDto>>(attempts);
        }

        public async Task<IEnumerable<QuizAttemptDto>> GetUserRecentAttemptsAsync(int userId, int count)
        {
            var attempts = await _quizAttemptRepository.GetUserRecentAttemptsAsync(userId, count);
            return _mapper.Map<IEnumerable<QuizAttemptDto>>(attempts);
        }

        public async Task<List<UserResultDto>> GetUserResultsForFrontendAsync(int userId)
        {
            var attempts = await _quizAttemptRepository.GetUserCompletedAttemptsAsync(userId);

            return attempts.Select(attempt => new UserResultDto
            {
                Id = attempt.Id,
                QuizId = attempt.QuizId,
                QuizTitle = attempt.Quiz?.Title ?? "Unknown Quiz",
                QuizCategory = attempt.Quiz?.Category?.Name ?? "Unknown Category",
                DateTaken = attempt.CompletedAt ?? attempt.StartedAt,
                Score = attempt.Score,
                TotalQuestions = attempt.TotalQuestions > 0 ? attempt.TotalQuestions : (attempt.Quiz?.Questions?.Count ?? 0),
                CorrectAnswers = attempt.CorrectAnswers > 0 ? attempt.CorrectAnswers : (attempt.UserAnswers?.Count(ua => ua.IsCorrect) ?? 0),
                TimeSpent = (int)(attempt.TimeSpent?.TotalSeconds ?? 0),
                TimeLimit = (attempt.Quiz?.TimeLimitMinutes ?? 0) * 60,
                Percentage = attempt.Percentage > 0 ? attempt.Percentage :
                            Math.Round((decimal)(attempt.Score * 100) / Math.Max(attempt.TotalQuestions > 0 ? attempt.TotalQuestions : 1, 1), 2),
                Rank = 1, // TODO: Calculate actual rank
                TotalParticipants = 1 // TODO: Calculate actual participants
            }).OrderByDescending(r => r.DateTaken).ToList();
        }

        public async Task<IEnumerable<QuizAttemptDto>> GetUserCompletedAttemptsAsync(int userId)
        {
            var attempts = await _quizAttemptRepository.GetUserCompletedAttemptsAsync(userId);
            return _mapper.Map<IEnumerable<QuizAttemptDto>>(attempts);
        }

        public async Task<QuizAttemptDto?> GetUserBestAttemptForQuizAsync(int userId, int quizId)
        {
            var attempt = await _quizAttemptRepository.GetUserBestAttemptForQuizAsync(userId, quizId);
            return attempt != null ? _mapper.Map<QuizAttemptDto>(attempt) : null;
        }

        public async Task<UserResultsDto?> GetUserResultsAsync(int userId)
        {
            var attempts = await _quizAttemptRepository.GetByUserIdAsync(userId);
            var completedAttempts = attempts.Where(a => a.IsCompleted).ToList();

            if (!completedAttempts.Any())
                return null;

            var userResultsDto = new UserResultsDto
            {
                UserId = userId,
                Username = completedAttempts.First().User?.Username ?? "Unknown",
                TotalAttempts = attempts.Count(),
                CompletedAttempts = completedAttempts.Count,
                AverageScore = (decimal)completedAttempts.Average(a => a.Percentage),
                BestScore = (int)completedAttempts.Max(a => a.Percentage),
                RecentAttempts = _mapper.Map<List<QuizAttemptDto>>(completedAttempts.OrderByDescending(a => a.CompletedAt).Take(5)),
                CategoryStats = new List<CategoryStatsDto>() // Simplified for now
            };

            return userResultsDto;
        }

        public async Task<IEnumerable<LeaderboardEntryDto>> GetGlobalLeaderboardAsync(int count)
        {
            return await _quizAttemptRepository.GetGlobalLeaderboardAsync(count);
        }

        public async Task<IEnumerable<LeaderboardEntryDto>> GetCategoryLeaderboardAsync(int categoryId, int count)
        {
            return await _quizAttemptRepository.GetCategoryLeaderboardAsync(categoryId, count);
        }

        public async Task<IEnumerable<QuizAttemptLeaderboardDto>> GetTopQuizAttemptsAsync(int? quizId = null, string? category = null, string? period = null, int? currentUserId = null, int count = 50)
        {
            return await _quizAttemptRepository.GetTopQuizAttemptsAsync(quizId, category, period, currentUserId, count);
        }

        public async Task<int> GetCompletedAttemptsCountAsync()
        {
            return await _quizAttemptRepository.GetCompletedAttemptsCountAsync();
        }

        public async Task<decimal> GetAverageCompletionTimeAsync()
        {
            return await _quizAttemptRepository.GetAverageCompletionTimeAsync();
        }

        public async Task<IEnumerable<QuizAttemptDto>> GetRecentAttemptsAsync(int count)
        {
            var attempts = await _quizAttemptRepository.GetRecentAttemptsAsync(count);
            return _mapper.Map<IEnumerable<QuizAttemptDto>>(attempts);
        }

        public async Task<QuizAttemptDto?> GetActiveAttemptAsync(int userId, int quizId)
        {
            var attempt = await _quizAttemptRepository.GetActiveAttemptAsync(userId, quizId);
            return attempt != null ? _mapper.Map<QuizAttemptDto>(attempt) : null;
        }

        public async Task<bool> HasActiveAttemptAsync(int userId, int quizId)
        {
            return await _quizAttemptRepository.HasActiveAttemptAsync(userId, quizId);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            return await _quizAttemptRepository.DeleteAsync(id);
        }

        public async Task<IEnumerable<QuizAttemptDto>> GetUserQuizHistoryAsync(int userId)
        {
            var attempts = await _quizAttemptRepository.GetUserCompletedAttemptsAsync(userId);
            return _mapper.Map<IEnumerable<QuizAttemptDto>>(attempts);
        }

        public async Task<IEnumerable<QuizAttemptDto>> GetTopScoresAsync(int quizId, int count)
        {
            var attempts = await _quizAttemptRepository.GetByQuizIdAsync(quizId);
            var topAttempts = attempts.Where(a => a.IsCompleted).OrderByDescending(a => a.Score).Take(count);
            return _mapper.Map<IEnumerable<QuizAttemptDto>>(topAttempts);
        }

        public async Task<decimal> GetAverageScoreAsync(int quizId)
        {
            var attempts = await _quizAttemptRepository.GetByQuizIdAsync(quizId);
            var completedAttempts = attempts.Where(a => a.IsCompleted);
            if (!completedAttempts.Any()) return 0;

            return (decimal)completedAttempts.Average(a => a.Score);
        }

        public async Task<int> GetTotalAttemptsCountAsync()
        {
            return await _quizAttemptRepository.GetTotalAttemptsCountAsync();
        }

        public async Task<int> GetUserAttemptsCountAsync(int userId)
        {
            return await _quizAttemptRepository.GetUserTotalAttemptsAsync(userId);
        }

        public async Task<QuizAttemptDto?> GetBestAttemptAsync(int userId, int quizId)
        {
            var attempt = await _quizAttemptRepository.GetUserBestAttemptForQuizAsync(userId, quizId);
            return attempt != null ? _mapper.Map<QuizAttemptDto>(attempt) : null;
        }

        public async Task<IEnumerable<QuizAttemptDto>> GetRecentAttemptsAsync(int userId, int count)
        {
            var attempts = await _quizAttemptRepository.GetUserRecentAttemptsAsync(userId, count);
            return _mapper.Map<IEnumerable<QuizAttemptDto>>(attempts);
        }

        private async Task<int> CalculateScoreAsync(int attemptId, IEnumerable<UserAnswerDto> userAnswers)
        {
            int correctAnswers = 0;

            foreach (var userAnswer in userAnswers)
            {
                // Get the correct answers for this question
                var correctAnswers_List = await _answerRepository.GetCorrectAnswersByQuestionIdAsync(userAnswer.QuestionId);

                if (correctAnswers_List.Any(ca => ca.Id == userAnswer.AnswerId))
                {
                    correctAnswers++;
                }
            }

            return correctAnswers;
        }

        // Additional methods required by controllers
        public async Task<QuizAttemptDto?> StartQuizAsync(int userId, int quizId)
        {
            var startDto = new StartQuizAttemptDto { QuizId = quizId };
            return await StartQuizAsync(userId, startDto);
        }

        public async Task<QuizAttemptDetailDto?> SubmitQuizAsync(int userId, SubmitQuizDto submitDto)
        {
            // Convert SubmitQuizDto to SubmitQuizAttemptDto
            var submitAttemptDto = new SubmitQuizAttemptDto
            {
                UserAnswers = submitDto.UserAnswers.Select(ua => new SubmitUserAnswerDto
                {
                    QuestionId = ua.QuestionId,
                    SelectedAnswerIds = ua.AnswerId.ToString()
                }).ToList()
            };
            return await SubmitQuizAsync(userId, submitAttemptDto);
        }
    }
}
