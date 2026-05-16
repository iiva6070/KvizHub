using KvizHub.Repository.DTOs;
using KvizHub.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KvizHub.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class QuizAttemptController : ControllerBase
    {
        private readonly IQuizAttemptService _quizAttemptService;

        public QuizAttemptController(IQuizAttemptService quizAttemptService)
        {
            _quizAttemptService = quizAttemptService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var attempt = await _quizAttemptService.GetByIdAsync(id);
                if (attempt == null)
                {
                    return NotFound(new { message = "Quiz attempt not found" });
                }

                // Verify user owns this attempt
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized();
                }

                if (attempt.UserId != userId && !User.IsInRole("Admin"))
                {
                    return Forbid();
                }

                return Ok(attempt);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}/details")]
        public async Task<IActionResult> GetWithAnswers(int id)
        {
            try
            {
                Console.WriteLine($"🔍 GetWithAnswers called for attempt ID: {id}");

                var attempt = await _quizAttemptService.GetByIdWithAnswersAsync(id);
                if (attempt == null)
                {
                    Console.WriteLine($"❌ Attempt {id} not found in database");
                    return NotFound(new { message = "Quiz attempt not found" });
                }

                Console.WriteLine($"✅ Attempt {id} found, belongs to UserId: {attempt.UserId}");

                // Verify user owns this attempt
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
                {
                    Console.WriteLine($"❌ No valid user ID claim found");
                    return Unauthorized();
                }

                Console.WriteLine($"🔑 Current user ID from token: {userId}");

                if (attempt.UserId != userId && !User.IsInRole("Admin"))
                {
                    Console.WriteLine($"❌ Access denied. Attempt belongs to UserId: {attempt.UserId}, but current user is: {userId}");
                    return Forbid();
                }

                Console.WriteLine($"✅ Access granted for attempt {id}");
                return Ok(attempt);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"💥 Exception in GetWithAnswers: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("user/me")]
        public async Task<IActionResult> GetMyAttempts()
        {
            try
            {
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized();
                }

                var attempts = await _quizAttemptService.GetByUserIdAsync(userId);
                return Ok(attempts);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("user/me/history")]
        public async Task<IActionResult> GetMyHistory()
        {
            try
            {
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized();
                }

                var attempts = await _quizAttemptService.GetUserQuizHistoryAsync(userId);
                return Ok(attempts);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("user/me/recent")]
        public async Task<IActionResult> GetMyRecent([FromQuery] int count = 10)
        {
            try
            {
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized();
                }

                var attempts = await _quizAttemptService.GetRecentAttemptsAsync(userId, count);
                return Ok(attempts);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("quiz/{quizId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetByQuizId(int quizId)
        {
            try
            {
                var attempts = await _quizAttemptService.GetByQuizIdAsync(quizId);
                return Ok(attempts);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("quiz/{quizId}/top-scores")]
        [AllowAnonymous]
        public async Task<IActionResult> GetTopScores(int quizId, [FromQuery] int count = 10)
        {
            try
            {
                var attempts = await _quizAttemptService.GetTopScoresAsync(quizId, count);
                return Ok(attempts);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("quiz/{quizId}/average-score")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAverageScore(int quizId)
        {
            try
            {
                var averageScore = await _quizAttemptService.GetAverageScoreAsync(quizId);
                return Ok(new { averageScore });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("start")]
        public async Task<IActionResult> StartQuiz([FromBody] StartQuizDto startDto)
        {
            try
            {
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized();
                }

                var attempt = await _quizAttemptService.StartQuizAsync(userId, startDto.QuizId);
                if (attempt == null)
                {
                    return BadRequest(new { message = "Failed to start quiz. Quiz may not exist or be inactive." });
                }

                return Ok(attempt);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{id}/submit")]
        public async Task<IActionResult> SubmitQuiz(int id, [FromBody] SubmitQuizDto submitDto)
        {
            try
            {
                Console.WriteLine($"🎯 SubmitQuiz called with id: {id}");
                Console.WriteLine($"🎯 SubmitDto is null: {submitDto == null}");
                Console.WriteLine($"🎯 SubmitDto UserAnswers count: {submitDto?.UserAnswers?.Count ?? 0}");
                if (submitDto?.UserAnswers != null)
                {
                    foreach (var ua in submitDto.UserAnswers)
                    {
                        Console.WriteLine($"🎯 Received UserAnswer: QuestionId={ua.QuestionId}, AnswerId={ua.AnswerId}");
                    }
                }

                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized();
                }

                // Verify user owns this attempt
                var attempt = await _quizAttemptService.GetByIdAsync(id);
                if (attempt == null || attempt.UserId != userId)
                {
                    return Forbid();
                }

                // Create SubmitQuizAttemptDto with the attemptId
                var submitAttemptDto = new SubmitQuizAttemptDto
                {
                    QuizAttemptId = id,
                    UserAnswers = submitDto?.UserAnswers?.Select(ua => new SubmitUserAnswerDto
                    {
                        QuestionId = ua.QuestionId,
                        // Mapiranje različitih tipova odgovora
                        SelectedAnswerIds = ua.SelectedAnswerIds ?? ua.AnswerId?.ToString(),
                        TextAnswer = ua.TextAnswer
                    }).ToList() ?? new List<SubmitUserAnswerDto>()
                };

                var result = await _quizAttemptService.SubmitQuizAsync(userId, submitAttemptDto);
                if (result == null)
                {
                    // Check if the attempt exists and is already completed
                    var existingAttempt = await _quizAttemptService.GetByIdAsync(id);
                    if (existingAttempt?.IsCompleted == true)
                    {
                        return BadRequest(new { message = "Quiz has already been completed or submitted." });
                    }
                    return BadRequest(new { message = "Failed to submit quiz. Please try again." });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("user/{userId}/best/{quizId}")]
        public async Task<IActionResult> GetBestAttempt(int userId, int quizId)
        {
            try
            {
                var currentUserIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (currentUserIdClaim == null || !int.TryParse(currentUserIdClaim, out int currentUserId))
                {
                    return Unauthorized();
                }

                // Users can only see their own best attempts unless they are admin
                if (userId != currentUserId && !User.IsInRole("Admin"))
                {
                    return Forbid();
                }

                var attempt = await _quizAttemptService.GetBestAttemptAsync(userId, quizId);
                if (attempt == null)
                {
                    return NotFound(new { message = "No attempts found for this quiz" });
                }

                return Ok(attempt);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized();
                }

                // Verify user owns this attempt or is admin
                var attempt = await _quizAttemptService.GetByIdAsync(id);
                if (attempt == null)
                {
                    return NotFound(new { message = "Quiz attempt not found" });
                }

                if (attempt.UserId != userId && !User.IsInRole("Admin"))
                {
                    return Forbid();
                }

                var success = await _quizAttemptService.DeleteAsync(id);
                if (!success)
                {
                    return BadRequest(new { message = "Failed to delete quiz attempt" });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("stats/total")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetTotalAttemptsCount()
        {
            try
            {
                var count = await _quizAttemptService.GetTotalAttemptsCountAsync();
                return Ok(new { totalAttempts = count });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("stats/user/me")]
        public async Task<IActionResult> GetMyUserStats()
        {
            try
            {
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized();
                }

                var userResults = await _quizAttemptService.GetUserResultsAsync(userId);
                if (userResults == null)
                {
                    // Return default stats if user has no completed attempts
                    return Ok(new
                    {
                        completedQuizzes = 0,
                        averageScore = 0,
                        bestScore = 0,
                        totalPoints = 0
                    });
                }

                return Ok(new
                {
                    completedQuizzes = userResults.CompletedAttempts,
                    averageScore = (int)Math.Round(userResults.AverageScore),
                    bestScore = userResults.BestScore,
                    totalPoints = userResults.CompletedAttempts * (int)Math.Round(userResults.AverageScore) // Simple calculation
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

    }
}
