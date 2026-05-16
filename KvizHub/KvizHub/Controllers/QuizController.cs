using KvizHub.Repository.DTOs;
using KvizHub.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KvizHub.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QuizController : ControllerBase
    {
        private readonly IQuizService _quizService;

        public QuizController(IQuizService quizService)
        {
            _quizService = quizService;
        }

        [HttpGet("test")]
        [AllowAnonymous]
        public IActionResult Test()
        {
            return Ok(new { message = "TEST: Controller is working", timestamp = DateTime.Now });
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var quizzes = await _quizService.GetActiveAsync();
                return Ok(quizzes);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var quiz = await _quizService.GetByIdAsync(id);
                if (quiz == null)
                {
                    return NotFound(new { message = "Quiz not found" });
                }

                return Ok(quiz);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}/questions")]
        [AllowAnonymous]
        public async Task<IActionResult> GetWithQuestions(int id)
        {
            Console.WriteLine($"=== GetWithQuestions({id}) STARTED ===");
            try
            {
                var quiz = await _quizService.GetByIdWithQuestionsAsync(id);
                Console.WriteLine($"Quiz found: {quiz != null}, Quiz ID: {quiz?.Id}, Questions count: {quiz?.Questions?.Count ?? 0}");
                if (quiz == null)
                {
                    Console.WriteLine("Quiz not found - returning 404");
                    return NotFound(new { message = "Quiz not found" });
                }

                Console.WriteLine($"Returning quiz with {quiz?.Questions?.Count ?? 0} questions");
                return Ok(quiz);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetWithQuestions: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("category/{categoryId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetByCategory(int categoryId)
        {
            try
            {
                var quizzes = await _quizService.GetByCategoryAsync(categoryId);
                return Ok(quizzes);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("difficulty/{difficulty}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetByDifficulty(string difficulty)
        {
            try
            {
                if (!Enum.TryParse<Repository.Models.DifficultyLevel>(difficulty, true, out var difficultyLevel))
                {
                    return BadRequest(new { message = "Invalid difficulty level" });
                }

                var quizzes = await _quizService.GetByDifficultyAsync(difficultyLevel);
                return Ok(quizzes);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("search")]
        [AllowAnonymous]
        public async Task<IActionResult> Search([FromQuery] string term)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(term))
                {
                    return BadRequest(new { message = "Search term is required" });
                }

                var quizzes = await _quizService.SearchAsync(term);
                return Ok(quizzes);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("popular")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPopular([FromQuery] int count = 10)
        {
            try
            {
                var quizzes = await _quizService.GetPopularQuizzesAsync(count);
                return Ok(quizzes);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("recent")]
        [AllowAnonymous]
        public async Task<IActionResult> GetRecent([FromQuery] int count = 10)
        {
            try
            {
                var quizzes = await _quizService.GetRecentQuizzesAsync(count);
                return Ok(quizzes);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] CreateQuizDto createDto)
        {
            try
            {
                var quiz = await _quizService.CreateAsync(createDto);
                if (quiz == null)
                {
                    return BadRequest(new { message = "Failed to create quiz" });
                }

                return CreatedAtAction(nameof(GetById), new { id = quiz.Id }, quiz);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateQuizDto updateDto)
        {
            try
            {
                var success = await _quizService.UpdateAsync(id, updateDto);
                if (!success)
                {
                    return NotFound(new { message = "Quiz not found" });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var success = await _quizService.DeleteAsync(id);
                if (!success)
                {
                    return NotFound(new { message = "Quiz not found" });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPatch("{id}/toggle-status")]
        [Authorize]
        public async Task<IActionResult> ToggleStatus(int id)
        {
            try
            {
                var success = await _quizService.ToggleActiveStatusAsync(id);
                if (!success)
                {
                    return NotFound(new { message = "Quiz not found" });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("stats/total")]
        [AllowAnonymous]
        public async Task<IActionResult> GetTotalQuizzesCount()
        {
            try
            {
                var count = await _quizService.GetTotalQuizzesCountAsync();
                return Ok(new { totalQuizzes = count });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("stats/active")]
        [AllowAnonymous]
        public async Task<IActionResult> GetActiveQuizzesCount()
        {
            try
            {
                var count = await _quizService.GetActiveQuizzesCountAsync();
                return Ok(new { activeQuizzes = count });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
