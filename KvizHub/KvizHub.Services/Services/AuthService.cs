using KvizHub.Repository.Contracts;
using KvizHub.Repository.DTOs;
using KvizHub.Repository.Models;
using KvizHub.Services.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AutoMapper;
using BC = BCrypt.Net.BCrypt;

namespace KvizHub.Services.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;
        private readonly IConfiguration _configuration;

        public AuthService(
            IUserRepository userRepository,
            IMapper mapper,
            IConfiguration configuration)
        {
            _userRepository = userRepository;
            _mapper = mapper;
            _configuration = configuration;
        }

        public async Task<AuthResponseDto?> LoginAsync(LoginDto loginDto)
        {
            Console.WriteLine($"AuthService.LoginAsync called with: {loginDto.EmailOrUsername}");

            User? user = null;

            // Login preko emaila
            if (loginDto.EmailOrUsername.Contains("@"))
            {
                user = await _userRepository.GetByEmailAsync(loginDto.EmailOrUsername);
            }
            else
            {
                // Login preko username-a
                user = await _userRepository.GetByUsernameAsync(loginDto.EmailOrUsername);
            }

            // Fallback pokušaj
            if (user == null)
            {
                if (loginDto.EmailOrUsername.Contains("@"))
                {
                    user = await _userRepository.GetByUsernameAsync(loginDto.EmailOrUsername);
                }
                else
                {
                    user = await _userRepository.GetByEmailAsync(loginDto.EmailOrUsername);
                }
            }

            if (user == null || !user.IsActive)
            {
                Console.WriteLine("User not found or inactive");
                return null;
            }

            bool passwordVerified = BC.Verify(loginDto.Password, user.PasswordHash);

            Console.WriteLine($"Password verified: {passwordVerified}");
            Console.WriteLine($"USER ROLE FROM DATABASE: {user.Role}");

            if (!passwordVerified)
            {
                return null;
            }

            // Ručno kreiranje UserDto da Role sigurno postoji
            var userDto = new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Role = user.Role,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt
            };

            var token = await GenerateJwtTokenAsync(userDto);

            return new AuthResponseDto
            {
                Token = token,
                User = userDto,
                Expires = DateTime.UtcNow.AddDays(7)
            };
        }

        public async Task<AuthResponseDto?> RegisterAsync(RegisterDto registerDto)
        {
            if (await _userRepository.EmailExistsAsync(registerDto.Email))
                return null;

            if (await _userRepository.UsernameExistsAsync(registerDto.Username))
                return null;

            var user = _mapper.Map<User>(registerDto);

            // Default role
            user.Role = "User";

            // Hash password
            user.PasswordHash = BC.HashPassword(registerDto.Password);

            var success = await _userRepository.AddAsync(user);

            if (!success)
                return null;

            var savedUser = await _userRepository.GetByEmailAsync(registerDto.Email);

            if (savedUser == null)
                return null;

            var userDto = new UserDto
            {
                Id = savedUser.Id,
                Username = savedUser.Username,
                Email = savedUser.Email,
                FirstName = savedUser.FirstName,
                LastName = savedUser.LastName,
                Role = savedUser.Role,
                IsActive = savedUser.IsActive,
                CreatedAt = savedUser.CreatedAt
            };

            var token = await GenerateJwtTokenAsync(userDto);

            return new AuthResponseDto
            {
                Token = token,
                User = userDto,
                Expires = DateTime.UtcNow.AddDays(7)
            };
        }

        public async Task<bool> ChangePasswordAsync(
            int userId,
            ChangePasswordDto changePasswordDto)
        {
            var user = await _userRepository.GetByIdAsync(userId);

            if (user == null || !user.IsActive)
                return false;

            if (!BC.Verify(changePasswordDto.CurrentPassword, user.PasswordHash))
                return false;

            var newPasswordHash = BC.HashPassword(changePasswordDto.NewPassword);

            return await _userRepository.ChangePasswordAsync(userId, newPasswordHash);
        }

        public async Task<string> GenerateJwtTokenAsync(UserDto user)
        {
            var jwtSettings = _configuration.GetSection("Jwt");

            var secretKey = jwtSettings["Key"]
                ?? throw new InvalidOperationException("JWT Key missing");

            var issuer = jwtSettings["Issuer"] ?? "QuizHub";
            var audience = jwtSettings["Audience"] ?? "QuizHub";

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(secretKey));

            var credentials = new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256);

            // KLJUČNI DEO
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email),

                // ADMIN ROLE CLAIMS
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("role", user.Role),
                new Claim("Role", user.Role),

                new Claim("userId", user.Id.ToString()),
                new Claim("username", user.Username),
                new Claim("IsActive", user.IsActive.ToString())
            };

            Console.WriteLine($"GENERATING TOKEN WITH ROLE: {user.Role}");

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public string GenerateJwtToken(UserDto user)
        {
            var jwtSettings = _configuration.GetSection("Jwt");

            var secretKey = jwtSettings["Key"]
                ?? throw new InvalidOperationException("JWT Key missing");

            var issuer = jwtSettings["Issuer"] ?? "QuizHub";
            var audience = jwtSettings["Audience"] ?? "QuizHub";

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(secretKey));

            var credentials = new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email),

                new Claim(ClaimTypes.Role, user.Role),
                new Claim("role", user.Role),
                new Claim("Role", user.Role),

                new Claim("userId", user.Id.ToString()),
                new Claim("username", user.Username),
                new Claim("IsActive", user.IsActive.ToString())
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public async Task<bool> ValidateTokenAsync(string token)
        {
            try
            {
                var user = await GetUserFromTokenAsync(token);
                return user != null && user.IsActive;
            }
            catch
            {
                return false;
            }
        }

        public async Task<UserDto?> GetUserFromTokenAsync(string token)
        {
            try
            {
                var jwtSettings = _configuration.GetSection("Jwt");

                var secretKey = jwtSettings["Key"]
                    ?? throw new InvalidOperationException("JWT Key missing");

                var key = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(secretKey));

                var tokenHandler = new JwtSecurityTokenHandler();

                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = key,
                    ValidateIssuer = true,
                    ValidIssuer = jwtSettings["Issuer"],
                    ValidateAudience = true,
                    ValidAudience = jwtSettings["Audience"],
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };

                var principal = tokenHandler.ValidateToken(
                    token,
                    validationParameters,
                    out SecurityToken validatedToken);

                var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier);

                if (userIdClaim == null ||
                    !int.TryParse(userIdClaim.Value, out int userId))
                    return null;

                var user = await _userRepository.GetByIdAsync(userId);

                return user != null
                    ? _mapper.Map<UserDto>(user)
                    : null;
            }
            catch
            {
                return null;
            }
        }
    }
}