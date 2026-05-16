using KvizHub.Repository.Contracts;
using KvizHub.Repository.Data;
using KvizHub.Repository.DTOs;
using KvizHub.Repository.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KvizHub.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly IQuizRepository _quizRepository;
        private readonly IQuizAttemptRepository _quizAttemptRepository;
        private readonly IQuestionRepository _questionRepository;
        private readonly IAnswerRepository _answerRepository;
        private readonly ILogger<AdminController> _logger;
        private readonly AppDbContext _context;

        public AdminController(
            IUserRepository userRepository,
            IQuizRepository quizRepository,
            IQuizAttemptRepository quizAttemptRepository,
            IQuestionRepository questionRepository,
            IAnswerRepository answerRepository,
            ILogger<AdminController> logger,
            AppDbContext context)
        {
            _userRepository = userRepository;
            _quizRepository = quizRepository;
            _quizAttemptRepository = quizAttemptRepository;
            _questionRepository = questionRepository;
            _answerRepository = answerRepository;
            _logger = logger;
            _context = context;
        }

        // GET: api/admin/stats
        [HttpGet("stats")]
        public async Task<ActionResult<AdminStatsDto>> GetAdminStats()
        {
            try
            {
                var totalUsers = await _userRepository.GetTotalUsersCountAsync();
                var totalQuizzes = await _quizRepository.GetTotalQuizzesCountAsync();
                var totalAttempts = await _quizAttemptRepository.GetTotalAttemptsCountAsync();
                var completedAttempts = await _quizAttemptRepository.GetCompletedAttemptsCountAsync();

                // Izračunaj prosečan score direktno iz baze koristeći Entity Framework
                var averageScore = 0.0;
                try
                {
                    var avgScore = await _context.QuizAttempts
                        .Where(qa => qa.IsCompleted)
                        .AverageAsync(qa => (double)qa.Percentage);
                    averageScore = avgScore;
                }
                catch
                {
                    averageScore = 0.0; // Ako nema podataka
                }

                // Dobij dodatne statistike sa null check-ovima
                var categoryStats = new List<AdminCategoryStatsDto>();
                var topUsers = new List<TopUserDto>();
                var weeklyActivity = new List<WeeklyActivityDto>();

                try
                {
                    var categoryStatsResult = await _quizAttemptRepository.GetCategoryStatsAsync();
                    if (categoryStatsResult != null)
                        categoryStats = categoryStatsResult.ToList();
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to get category stats");
                }

                try
                {
                    var topUsersResult = await _quizAttemptRepository.GetTopUsersAsync(10);
                    if (topUsersResult != null)
                        topUsers = topUsersResult.ToList();
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to get top users");
                }

                try
                {
                    var weeklyActivityResult = await _quizAttemptRepository.GetWeeklyActivityAsync();
                    if (weeklyActivityResult != null)
                        weeklyActivity = weeklyActivityResult.ToList();
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to get weekly activity");
                }

                var stats = new AdminStatsDto
                {
                    TotalUsers = totalUsers,
                    TotalQuizzes = totalQuizzes,
                    TotalAttempts = totalAttempts,
                    TotalQuestions = 0, // Privremeno dok ne implementiramo metodu
                    ActiveUsers = 0, // Privremeno 
                    RecentAttempts = completedAttempts,
                    AverageScore = averageScore,
                    CategoryStats = categoryStats,
                    TopUsers = topUsers,
                    WeeklyActivity = weeklyActivity
                };

                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving admin stats");
                return StatusCode(500, "Internal server error");
            }
        }

        // GET: api/admin/users
        [HttpGet("users")]
        public async Task<ActionResult<IEnumerable<object>>> GetAllUsers()
        {
            try
            {
                var users = await _userRepository.GetAllAsync();
                var userDtos = users.Select(u => new
                {
                    u.Id,
                    u.FirstName,
                    u.LastName,
                    u.Username,
                    u.Email,
                    u.Role,
                    u.IsActive,
                    u.CreatedAt
                });
                return Ok(userDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving users for admin");
                return StatusCode(500, "Internal server error");
            }
        }

        // GET: api/admin/questions
        [HttpGet("questions")]
        public async Task<ActionResult<IEnumerable<object>>> GetAllQuestions()
        {
            try
            {
                var questions = await _questionRepository.GetAllWithQuizInfoAsync();
                var questionDtos = questions.Select(q => new
                {
                    q.Id,
                    q.Text,
                    Type = q.Type.ToString(),
                    q.Points,
                    q.OrderIndex,
                    QuizId = q.QuizId,
                    QuizTitle = q.Quiz?.Title ?? "Unknown",
                    AnswersCount = q.Answers?.Count ?? 0
                });
                return Ok(questionDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving questions for admin");
                return StatusCode(500, "Internal server error");
            }
        }

        // GET: api/admin/quizzes
        [HttpGet("quizzes")]
        public async Task<ActionResult<IEnumerable<object>>> GetAllQuizzes(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? search = null,
            [FromQuery] string? category = null)
        {
            try
            {
                var quizzes = await _quizRepository.GetAllAsync();
                var quizDtos = quizzes.Select(q => new
                {
                    q.Id,
                    q.Title,
                    q.Description,
                    TimeLimitMinutes = q.TimeLimitMinutes,
                    Difficulty = q.Difficulty.ToString(),
                    CategoryId = q.CategoryId,
                    q.IsActive,
                    q.CreatedAt,
                    QuestionsCount = 0 // Ovo će biti implementirano kasnije
                });
                return Ok(quizDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving quizzes for admin");
                return StatusCode(500, "Internal server error");
            }
        }

        // GET: api/admin/quizzes/{id}
        [HttpGet("quizzes/{id}")]
        public async Task<ActionResult<object>> GetQuizById(int id)
        {
            try
            {
                var quiz = await _quizRepository.GetByIdWithQuestionsAsync(id);
                if (quiz == null)
                    return NotFound();

                var result = new
                {
                    quiz.Id,
                    quiz.Title,
                    quiz.Description,
                    TimeLimitMinutes = quiz.TimeLimitMinutes,
                    Difficulty = quiz.Difficulty.ToString(),
                    CategoryId = quiz.CategoryId,
                    quiz.IsActive,
                    quiz.CreatedAt,
                    Questions = quiz.Questions?.Select(q => new
                    {
                        q.Id,
                        q.Text,
                        Type = q.Type.ToString(),
                        q.Points,
                        q.OrderIndex,
                        Answers = q.Answers?.Select(a => new
                        {
                            a.Id,
                            a.Text,
                            a.IsCorrect,
                            a.OrderIndex
                        })
                    })
                };
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving quiz for admin");
                return StatusCode(500, "Internal server error");
            }
        }

        // POST: api/admin/quizzes
        [HttpPost("quizzes")]
        public async Task<ActionResult<object>> CreateQuiz([FromBody] CreateQuizDto dto)
        {
            try
            {
                // Kreiraj Quiz objekat
                var quiz = new Quiz
                {
                    Title = dto.Title,
                    Description = dto.Description ?? string.Empty,
                    TimeLimitMinutes = dto.TimeLimitMinutes,
                    Difficulty = dto.Difficulty,
                    CategoryId = dto.CategoryId,
                    CreatedAt = DateTime.UtcNow
                };

                var success = await _quizRepository.AddAsync(quiz);
                if (!success)
                    return BadRequest("Failed to create quiz");

                return CreatedAtAction(nameof(GetQuizById), new { id = quiz.Id }, new
                {
                    quiz.Id,
                    quiz.Title,
                    quiz.Description,
                    TimeLimitMinutes = quiz.TimeLimitMinutes,
                    Difficulty = quiz.Difficulty.ToString(),
                    CategoryId = quiz.CategoryId,
                    quiz.IsActive,
                    quiz.CreatedAt
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating quiz");
                return StatusCode(500, "Internal server error");
            }
        }

        // PUT: api/admin/quizzes/{id}
        [HttpPut("quizzes/{id}")]
        public async Task<ActionResult> UpdateQuiz(int id, [FromBody] UpdateQuizDto dto)
        {
            try
            {
                var quiz = await _quizRepository.GetByIdAsync(id);
                if (quiz == null)
                    return NotFound();

                quiz.Title = dto.Title;
                quiz.Description = dto.Description ?? string.Empty;
                quiz.TimeLimitMinutes = dto.TimeLimitMinutes;
                quiz.Difficulty = dto.Difficulty;
                quiz.CategoryId = dto.CategoryId;
                quiz.IsActive = dto.IsActive;

                var success = await _quizRepository.UpdateAsync(quiz);
                if (!success)
                    return BadRequest("Failed to update quiz");

                return Ok(new { message = "Quiz updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating quiz");
                return StatusCode(500, "Internal server error");
            }
        }

        // DELETE: api/admin/quizzes/{id}
        [HttpDelete("quizzes/{id}")]
        public async Task<ActionResult> DeleteQuiz(int id)
        {
            try
            {
                _logger.LogInformation($"Attempting to delete quiz with ID: {id}");

                var success = await _quizRepository.DeleteAsync(id);
                if (!success)
                {
                    _logger.LogWarning($"Quiz with ID {id} not found");
                    return NotFound(new { message = "Quiz not found" });
                }

                _logger.LogInformation($"Quiz with ID {id} deleted successfully");
                return Ok(new { message = "Quiz deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting quiz with ID: {id}. Error: {ex.Message}");
                return StatusCode(500, new { message = "Internal server error", details = ex.Message });
            }
        }

        // Operacije za pitanja

        // GET: api/admin/quizzes/{quizId}/questions
        [HttpGet("quizzes/{quizId}/questions")]
        public async Task<ActionResult<IEnumerable<object>>> GetQuizQuestions(int quizId)
        {
            try
            {
                var questions = await _questionRepository.GetByQuizIdWithAnswersAsync(quizId);
                var result = questions.Select(q => new
                {
                    q.Id,
                    q.Text,
                    Type = q.Type.ToString(),
                    q.Points,
                    q.OrderIndex,
                    q.CorrectAnswer,
                    Answers = q.Answers?.Select(a => new
                    {
                        a.Id,
                        a.Text,
                        a.IsCorrect,
                        a.OrderIndex
                    })
                });
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving quiz questions for admin");
                return StatusCode(500, "Internal server error");
            }
        }

        // POST: api/admin/quizzes/{quizId}/questions
        [HttpPost("quizzes/{quizId}/questions")]
        public async Task<ActionResult<object>> CreateQuestion(int quizId, [FromBody] CreateQuestionDto dto)
        {
            try
            {
                // Proveri da li kviz postoji
                var quiz = await _quizRepository.GetByIdAsync(quizId);
                if (quiz == null)
                    return NotFound("Quiz not found");

                // Kreiraj Question objekat
                var question = new Question
                {
                    QuizId = quizId,
                    Text = dto.Text,
                    Type = dto.Type,
                    Points = dto.Points,
                    OrderIndex = dto.OrderIndex,
                    CorrectAnswer = dto.CorrectAnswer // Za FillInTheBlank pitanja
                };

                var success = await _questionRepository.AddAsync(question);
                if (!success)
                    return BadRequest("Failed to create question");

                // Kreiraj odgovore ako postoje
                if (dto.Answers != null && dto.Answers.Any())
                {
                    var answers = dto.Answers.Select((answerDto, index) => new Answer
                    {
                        QuestionId = question.Id,
                        Text = answerDto.Text,
                        IsCorrect = answerDto.IsCorrect,
                        OrderIndex = index
                    });

                    var answersSuccess = await _answerRepository.AddRangeAsync(answers);
                    if (!answersSuccess)
                    {
                        // Ako kreiranje odgovora ne uspe, obriši kreirana pitanja
                        await _questionRepository.DeleteAsync(question.Id);
                        return BadRequest("Failed to create answers for question");
                    }
                }

                // Dobij kompletno pitanje sa odgovorima za vraćanje
                var createdQuestion = await _questionRepository.GetByIdWithAnswersAsync(question.Id);
                if (createdQuestion == null)
                    return StatusCode(500, "Question created but could not be retrieved");

                return CreatedAtAction(nameof(GetQuestionById), new { id = question.Id }, new
                {
                    createdQuestion.Id,
                    createdQuestion.Text,
                    Type = createdQuestion.Type.ToString(),
                    createdQuestion.Points,
                    createdQuestion.OrderIndex,
                    createdQuestion.CorrectAnswer,
                    Answers = createdQuestion.Answers?.Select(a => new
                    {
                        a.Id,
                        a.Text,
                        a.IsCorrect,
                        a.OrderIndex
                    })
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating question");
                return StatusCode(500, "Internal server error");
            }
        }

        // GET: api/admin/questions/{id}
        [HttpGet("questions/{id}")]
        public async Task<ActionResult<object>> GetQuestionById(int id)
        {
            try
            {
                var question = await _questionRepository.GetByIdWithAnswersAsync(id);
                if (question == null)
                    return NotFound();

                var result = new
                {
                    question.Id,
                    question.Text,
                    Type = question.Type.ToString(),
                    question.Points,
                    question.OrderIndex,
                    question.CorrectAnswer,
                    Answers = question.Answers?.Select(a => new
                    {
                        a.Id,
                        a.Text,
                        a.IsCorrect,
                        a.OrderIndex
                    })
                };
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving question for admin");
                return StatusCode(500, "Internal server error");
            }
        }

        // PUT: api/admin/questions/{id}
        [HttpPut("questions/{id}")]
        public async Task<ActionResult> UpdateQuestion(int id, [FromBody] UpdateQuestionDto dto)
        {
            try
            {
                var question = await _questionRepository.GetByIdWithAnswersAsync(id);
                if (question == null)
                    return NotFound();

                question.Text = dto.Text;
                question.Type = dto.Type;
                question.Points = dto.Points;
                question.OrderIndex = dto.OrderIndex;
                question.CorrectAnswer = dto.CorrectAnswer;

                // TODO: Dodati upravljanje answer-ima odvojeno
                // Answer-i će biti upravljani kroz odvojene endpoint-e

                var success = await _questionRepository.UpdateAsync(question);
                if (!success)
                    return BadRequest("Failed to update question");

                return Ok(new { message = "Question updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating question");
                return StatusCode(500, "Internal server error");
            }
        }

        // DELETE: api/admin/questions/{id}
        [HttpDelete("questions/{id}")]
        public async Task<ActionResult> DeleteQuestion(int id)
        {
            try
            {
                _logger.LogInformation($"Attempting to delete question {id}");
                var success = await _questionRepository.DeleteAsync(id);
                if (!success)
                {
                    _logger.LogWarning($"Question {id} not found");
                    return NotFound();
                }

                _logger.LogInformation($"Question {id} deleted successfully");
                return Ok(new { message = "Question deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting question {id}: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // Kategorije
        [HttpGet("categories")]
        public async Task<ActionResult<IEnumerable<object>>> GetCategories()
        {
            try
            {
                var categories = await _context.QuizCategories
                    .Where(c => c.IsActive)
                    .Select(c => new
                    {
                        c.Id,
                        c.Name,
                        c.Description,
                        QuizCount = c.Quizzes.Count(q => q.IsActive),
                        c.IsActive
                    })
                    .ToListAsync();

                return Ok(categories);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving categories");
                return StatusCode(500, "Internal server error");
            }
        }

        // Test endpoint za kreiranje test quiz attempt-a
        [HttpPost("create-test-attempt")]
        public async Task<IActionResult> CreateTestAttempt()
        {
            try
            {
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized();
                }

                // Kreiraj test quiz attempt
                var quizAttempt = new QuizAttempt
                {
                    UserId = userId,
                    QuizId = 1, // Koristimo prvi kviz
                    StartedAt = DateTime.Now.AddHours(-1),
                    CompletedAt = DateTime.Now,
                    IsCompleted = true,
                    Score = 8,
                    TimeSpent = TimeSpan.FromMinutes(15),
                    TotalQuestions = 10,
                    CorrectAnswers = 8,
                    Percentage = 80.0m
                };

                var success = await _quizAttemptRepository.AddAsync(quizAttempt);

                if (success)
                {
                    return Ok(new { message = "Test quiz attempt created successfully" });
                }
                else
                {
                    return StatusCode(500, "Failed to create test attempt");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating test attempt");
                return StatusCode(500, "Internal server error");
            }
        }
    }

}
