using KvizHub.Repository.DTOs;
using KvizHub.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KvizHub.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IUserService _userService;

        public AuthController(IAuthService authService, IUserService userService)
        {
            _authService = authService;
            _userService = userService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            try
            {
                Console.WriteLine("🚀 LOGIN ENDPOINT HIT!");
                Console.WriteLine($"🔐 Login attempt for emailOrUsername: {loginDto?.EmailOrUsername}");
                Console.WriteLine($"🔐 Password provided: {loginDto?.Password}");
                Console.WriteLine($"🔐 loginDto is null: {loginDto == null}");

                if (loginDto == null)
                {
                    Console.WriteLine("❌ LoginDto is null - bad request");
                    return BadRequest(new { message = "Invalid request data" });
                }

                var authResponse = await _authService.LoginAsync(loginDto);
                if (authResponse == null)
                {
                    Console.WriteLine("❌ Authentication failed - user not found or invalid password");
                    return Unauthorized(new { message = "Invalid email or password" });
                }

                Console.WriteLine($"✅ Generated JWT Token: {authResponse.Token}"); // Debug log
                return Ok(new { token = authResponse.Token });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"💥 EXCEPTION in Login: {ex.Message}");
                Console.WriteLine($"💥 Stack trace: {ex.StackTrace}");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            try
            {
                var userDto = await _userService.CreateAsync(registerDto);
                if (userDto == null)
                {
                    return BadRequest(new { message = "Email already exists" });
                }

                // Auto-login after registration
                var loginDto = new LoginDto
                {
                    EmailOrUsername = registerDto.Email,
                    Password = registerDto.Password
                };

                var token = await _authService.LoginAsync(loginDto);

                return Ok(new
                {
                    user = userDto,
                    token
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("refresh")]
        [Authorize]
        public async Task<IActionResult> RefreshToken()
        {
            try
            {
                var userIdClaim = User.FindFirst("userId")?.Value;
                if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized();
                }

                var user = await _userService.GetByIdAsync(userId);
                if (user == null)
                {
                    return Unauthorized();
                }

                var token = _authService.GenerateJwtToken(user);
                return Ok(new { token });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("validate")]
        [Authorize]
        public async Task<IActionResult> ValidateToken()
        {
            try
            {
                var userIdClaim = User.FindFirst("userId")?.Value;
                if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized();
                }

                var user = await _userService.GetByIdAsync(userId);
                if (user == null)
                {
                    return Unauthorized();
                }

                return Ok(new
                {
                    valid = true,
                    user = user
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
