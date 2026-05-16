using KvizHub.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KvizHub.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [Authorize]
    public class LeaderboardController : ControllerBase
    {
        private readonly IQuizAttemptService _quizAttemptService;

        public LeaderboardController(IQuizAttemptService quizAttemptService)
        {
            _quizAttemptService = quizAttemptService;
        }

        [HttpGet]
        public async Task<IActionResult> GetLeaderboard([FromQuery] string? category = null, [FromQuery] string? period = null, [FromQuery] int? quizId = null)
        {
            try
            {
                // Dobij trenutni user ID iz JWT tokena
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                int? currentUserId = null;
                if (int.TryParse(userIdClaim, out int parsedUserId))
                {
                    currentUserId = parsedUserId;
                }

                // Pozovi novi servis za dobijanje top rezultata
                var leaderboard = await _quizAttemptService.GetTopQuizAttemptsAsync(
                    quizId: quizId,
                    category: category,
                    period: period,
                    currentUserId: currentUserId,
                    count: 50
                );

                return Ok(leaderboard);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("quiz/{quizId}")]
        public async Task<IActionResult> GetQuizLeaderboard(int quizId)
        {
            try
            {
                // Dobij trenutni user ID iz JWT tokena
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                int? currentUserId = null;
                if (int.TryParse(userIdClaim, out int parsedUserId))
                {
                    currentUserId = parsedUserId;
                }

                // Pozovi servis za dobijanje leaderboard-a za specifičan kviz
                var leaderboard = await _quizAttemptService.GetTopQuizAttemptsAsync(
                    quizId: quizId,
                    category: null,
                    period: "all-time",
                    currentUserId: currentUserId,
                    count: 50
                );

                return Ok(leaderboard);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("user/{userId}")]
        public Task<IActionResult> GetUserPosition(int userId)
        {
            try
            {
                // Za sada vraćam osnovne user pozicije - ova metoda može biti implementirana kasnije
                // Za potrebe osnovne funkcionalnosti rang liste, ovo nije kritično
                var userPosition = new
                {
                    userId = userId,
                    globalRank = 1,
                    totalScore = 0,
                    totalAttempts = 0
                };

                return Task.FromResult<IActionResult>(Ok(userPosition));
            }
            catch (Exception ex)
            {
                return Task.FromResult<IActionResult>(BadRequest(new { message = ex.Message }));
            }
        }
    }
}
