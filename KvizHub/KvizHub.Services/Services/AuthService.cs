using KvizHub.Repository.Contracts;
using KvizHub.Repository.DTOs;
using KvizHub.Repository.Models;
using KvizHub.Services.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using BC = BCrypt.Net.BCrypt;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace KvizHub.Services.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;
        private readonly IConfiguration _configuration;

        public AuthService(IUserRepository userRepository, IMapper mapper, IConfiguration configuration)
        {
            _userRepository = userRepository;
            _mapper = mapper;
            _configuration = configuration;
        }

        public async Task<AuthResponseDto?> LoginAsync(LoginDto loginDto)
        {
            Console.WriteLine($" AuthService.LoginAsync called with emailOrUsername: {loginDto.EmailOrUsername}");

            // Try to find user by email first, then by username
            User? user = null;

            // Check if input looks like an email (contains @)
            if (loginDto.EmailOrUsername.Contains("@"))
            {
                Console.WriteLine(" Attempting to find user by email");
                user = await _userRepository.GetByEmailAsync(loginDto.EmailOrUsername);
            }
            else
            {
                Console.WriteLine(" Attempting to find user by username");
                user = await _userRepository.GetByUsernameAsync(loginDto.EmailOrUsername);
            }

            // If not found by the first method, try the other method as fallback
            if (user == null)
            {
                Console.WriteLine(" First method failed, trying alternative method");
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
                Console.WriteLine($" User not found or inactive for: {loginDto.EmailOrUsername}");
                return null;
            }

            Console.WriteLine($" User found: {user.Email} (username: {user.Username}), IsActive: {user.IsActive}");
            Console.WriteLine($" Stored hash: {user.PasswordHash}");
            Console.WriteLine($" Password to verify: {loginDto.Password}");

            // Verify password
            bool passwordVerified = BC.Verify(loginDto.Password, user.PasswordHash);
            Console.WriteLine($" Password verification result: {passwordVerified}");

            if (!passwordVerified)
            {
                Console.WriteLine(" Password verification failed");
                return null;
            }

            Console.WriteLine(" Password verified successfully");

            // Map to UserDto
            var userDto = _mapper.Map<UserDto>(user);

            // Generate JWT token
            var token = await GenerateJwtTokenAsync(userDto);
            var expires = DateTime.UtcNow.AddDays(7); // Token expires in 7 days

            return new AuthResponseDto
            {
                Token = token,
                User = userDto,
                Expires = expires
            };
        }

        public async Task<AuthResponseDto?> RegisterAsync(RegisterDto registerDto)
        {
            // Check if email already exists
            if (await _userRepository.EmailExistsAsync(registerDto.Email))
                return null;

            // Check if username already exists
            if (await _userRepository.UsernameExistsAsync(registerDto.Username))
                return null;

            // Map DTO to User entity
            var user = _mapper.Map<User>(registerDto);

            // Hash password
            user.PasswordHash = BC.HashPassword(registerDto.Password);

            // Save user
            var success = await _userRepository.AddAsync(user);
            if (!success)
                return null;

            // Get the saved user (with ID)
            var savedUser = await _userRepository.GetByEmailAsync(registerDto.Email);
            if (savedUser == null)
                return null;

            // Map to UserDto
            var userDto = _mapper.Map<UserDto>(savedUser);

            // Generate JWT token
            var token = await GenerateJwtTokenAsync(userDto);
            var expires = DateTime.UtcNow.AddDays(7);

            return new AuthResponseDto
            {
                Token = token,
                User = userDto,
                Expires = expires
            };
        }

        public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto changePasswordDto)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null || !user.IsActive)
                return false;

            // Verify current password
            if (!BC.Verify(changePasswordDto.CurrentPassword, user.PasswordHash))
                return false;

            // Hash new password
            var newPasswordHash = BC.HashPassword(changePasswordDto.NewPassword);

            // Update password
            return await _userRepository.ChangePasswordAsync(userId, newPasswordHash);
        }

        public async Task<string> GenerateJwtTokenAsync(UserDto user)
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var secretKey = jwtSettings["Key"] ?? throw new InvalidOperationException("JWT SecretKey is not configured");
            var issuer = jwtSettings["Issuer"] ?? "QuizHub";
            var audience = jwtSettings["Audience"] ?? "QuizHub";

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("IsActive", user.IsActive.ToString())
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: credentials
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            // Debug: Log token details for async method
            Console.WriteLine($"Generated JWT Token (async): {tokenString}");
            Console.WriteLine($"Token Length: {tokenString.Length}");
            Console.WriteLine($"Token Parts Count: {tokenString.Split('.').Length}");
            Console.WriteLine($"First 50 chars: {tokenString.Substring(0, Math.Min(50, tokenString.Length))}");

            return tokenString;
        }

        public string GenerateJwtToken(UserDto user)
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var secretKey = jwtSettings["Key"] ?? throw new InvalidOperationException("JWT SecretKey is not configured");
            var issuer = jwtSettings["Issuer"] ?? "QuizHub";
            var audience = jwtSettings["Audience"] ?? "QuizHub";

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role),
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
                var secretKey = jwtSettings["Key"] ?? throw new InvalidOperationException("JWT SecretKey is not configured");

                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
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

                var principal = tokenHandler.ValidateToken(token, validationParameters, out SecurityToken validatedToken);

                var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                    return null;

                var user = await _userRepository.GetByIdAsync(userId);
                return user != null ? _mapper.Map<UserDto>(user) : null;
            }
            catch
            {
                return null;
            }
        }
    }
}
