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
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IQuizAttemptService _quizAttemptService;

        public UserController(IUserService userService, IQuizAttemptService quizAttemptService)
        {
            _userService = userService;
            _quizAttemptService = quizAttemptService;
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            try
            {
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized();
                }

                var user = await _userService.GetByIdAsync(userId);
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                return Ok(user);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var user = await _userService.GetByIdAsync(id);
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                return Ok(user);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var users = await _userService.GetAllAsync();
                return Ok(users);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("email/{email}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetByEmail(string email)
        {
            try
            {
                var user = await _userService.GetByEmailAsync(email);
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                return Ok(user);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("search")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Search([FromQuery] string term)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(term))
                {
                    return BadRequest(new { message = "Search term is required" });
                }

                var users = await _userService.SearchAsync(term);
                return Ok(users);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("me")]
        public async Task<IActionResult> UpdateCurrentUser([FromBody] UpdateUserDto updateDto)
        {
            try
            {
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized();
                }

                var success = await _userService.UpdateAsync(userId, updateDto);
                if (!success)
                {
                    return NotFound(new { message = "User not found" });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateUserDto updateDto)
        {
            try
            {
                var success = await _userService.UpdateAsync(id, updateDto);
                if (!success)
                {
                    return NotFound(new { message = "User not found" });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("me")]
        public async Task<IActionResult> DeleteCurrentUser()
        {
            try
            {
                var userIdClaim = User.FindFirst("userId")?.Value;
                if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized();
                }

                var success = await _userService.DeleteAsync(userId);
                if (!success)
                {
                    return NotFound(new { message = "User not found" });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var success = await _userService.DeleteAsync(id);
                if (!success)
                {
                    return NotFound(new { message = "User not found" });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("me/change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto changePasswordDto)
        {
            try
            {
                var userIdClaim = User.FindFirst("userId")?.Value;
                if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized();
                }

                var success = await _userService.ChangePasswordAsync(userId, changePasswordDto);
                if (!success)
                {
                    return BadRequest(new { message = "Current password is incorrect" });
                }

                return Ok(new { message = "Password changed successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("stats/total")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetTotalUsersCount()
        {
            try
            {
                var count = await _userService.GetTotalUsersCountAsync();
                return Ok(new { totalUsers = count });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("stats/active")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetActiveUsersCount()
        {
            try
            {
                var count = await _userService.GetActiveUsersCountAsync();
                return Ok(new { activeUsers = count });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("recent")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetRecentUsers([FromQuery] int count = 10)
        {
            try
            {
                var users = await _userService.GetRecentUsersAsync(count);
                return Ok(users);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPatch("{id}/toggle-status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ToggleUserStatus(int id)
        {
            try
            {
                var success = await _userService.ToggleActiveStatusAsync(id);
                if (!success)
                {
                    return NotFound(new { message = "User not found" });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Dobijanje rezultata trenutnog korisnika
        [HttpGet("results")]
        public async Task<IActionResult> GetUserResults()
        {
            try
            {
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized();
                }

                var userAttempts = await _quizAttemptService.GetUserResultsForFrontendAsync(userId);
                return Ok(userAttempts);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Dobijanje filtriranih rezultata trenutnog korisnika
        [HttpGet("results/filtered")]
        public async Task<IActionResult> GetFilteredUserResults(
            [FromQuery] string? category = null,
            [FromQuery] string? dateRange = null,
            [FromQuery] int? quizId = null)
        {
            try
            {
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized();
                }

                var allResults = await _quizAttemptService.GetUserResultsForFrontendAsync(userId);
                var filteredResults = allResults.AsEnumerable();

                // Filtriranje po kategoriji
                if (!string.IsNullOrEmpty(category))
                {
                    filteredResults = filteredResults.Where(r =>
                        string.Equals(r.QuizCategory, category, StringComparison.OrdinalIgnoreCase));
                }

                // Filtriranje po datumu
                if (!string.IsNullOrEmpty(dateRange))
                {
                    var now = DateTime.UtcNow;
                    DateTime? startDate = dateRange switch
                    {
                        "lastMonth" => now.AddMonths(-1),
                        "last3Months" => now.AddMonths(-3),
                        "lastYear" => now.AddYears(-1),
                        _ => null
                    };

                    if (startDate.HasValue)
                    {
                        filteredResults = filteredResults.Where(r => r.DateTaken >= startDate.Value);
                    }
                }

                // Filtriranje po kvizu
                if (quizId.HasValue)
                {
                    filteredResults = filteredResults.Where(r => r.QuizId == quizId.Value);
                }

                // Sortiranje po datumu, najnoviji prvi
                var result = filteredResults.OrderByDescending(r => r.DateTaken).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Dobijanje statistika trenutnog korisnika
        [HttpGet("stats")]
        public async Task<IActionResult> GetUserStats()
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
                    // Ako nema rezultata, vrati default vrednosti
                    return Ok(new
                    {
                        totalAttempts = 0,
                        completedAttempts = 0,
                        averageScore = 0,
                        bestScore = 0,
                        totalTimeSpent = 0,
                        recentAttempts = new List<object>(),
                        categoryStats = new List<object>()
                    });
                }

                return Ok(userResults);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
