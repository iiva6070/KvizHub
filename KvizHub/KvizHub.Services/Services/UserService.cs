using KvizHub.Repository.Contracts;
using KvizHub.Repository.DTOs;
using KvizHub.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;

namespace KvizHub.Services.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IQuizAttemptRepository _quizAttemptRepository;
        private readonly IMapper _mapper;

        public UserService(IUserRepository userRepository, IQuizAttemptRepository quizAttemptRepository, IMapper mapper)
        {
            _userRepository = userRepository;
            _quizAttemptRepository = quizAttemptRepository;
            _mapper = mapper;
        }

        public async Task<UserDto?> GetByIdAsync(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            return user != null ? _mapper.Map<UserDto>(user) : null;
        }

        public async Task<UserDto?> GetByEmailAsync(string email)
        {
            var user = await _userRepository.GetByEmailAsync(email);
            return user != null ? _mapper.Map<UserDto>(user) : null;
        }

        public async Task<UserDto?> GetByUsernameAsync(string username)
        {
            var user = await _userRepository.GetByUsernameAsync(username);
            return user != null ? _mapper.Map<UserDto>(user) : null;
        }

        public async Task<IEnumerable<UserDto>> GetAllAsync()
        {
            var users = await _userRepository.GetAllAsync();
            return _mapper.Map<IEnumerable<UserDto>>(users);
        }

        public async Task<bool> UpdateProfileAsync(int userId, UpdateUserProfileDto updateDto)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return false;

            _mapper.Map(updateDto, user);
            return await _userRepository.UpdateAsync(user);
        }

        public async Task<bool> UpdateProfileImageAsync(int userId, string imageUrl)
        {
            return await _userRepository.UpdateProfileImageAsync(userId, imageUrl);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            return await _userRepository.DeleteAsync(id);
        }

        public async Task<UserResultsDto?> GetUserResultsAsync(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return null;

            var totalAttempts = await _quizAttemptRepository.GetUserTotalAttemptsAsync(userId);
            var completedAttempts = await _quizAttemptRepository.GetUserCompletedAttemptsCountAsync(userId);
            var averageScore = await _quizAttemptRepository.GetUserAverageScoreAsync(userId);
            var bestScore = await _quizAttemptRepository.GetUserBestScoreAsync(userId);
            var recentAttempts = await _quizAttemptRepository.GetUserRecentAttemptsAsync(userId, 10);
            var categoryStats = await _quizAttemptRepository.GetUserCategoryStatsAsync(userId);

            return new UserResultsDto
            {
                UserId = userId,
                Username = user.Username,
                TotalAttempts = totalAttempts,
                CompletedAttempts = completedAttempts,
                AverageScore = averageScore,
                BestScore = bestScore,
                RecentAttempts = _mapper.Map<List<QuizAttemptDto>>(recentAttempts),
                CategoryStats = categoryStats.ToList()
            };
        }

        public async Task<bool> EmailExistsAsync(string email)
        {
            return await _userRepository.EmailExistsAsync(email);
        }

        public async Task<bool> UsernameExistsAsync(string username)
        {
            return await _userRepository.UsernameExistsAsync(username);
        }

        public async Task<int> GetTotalUsersCountAsync()
        {
            return await _userRepository.GetTotalUsersCountAsync();
        }

        public async Task<IEnumerable<UserDto>> GetTopUsersAsync(int count)
        {
            var users = await _userRepository.GetTopUsersAsync(count);
            return _mapper.Map<IEnumerable<UserDto>>(users);
        }

        public async Task<UserDto?> CreateAsync(RegisterDto registerDto)
        {
            var user = _mapper.Map<Repository.Models.User>(registerDto);
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password);
            user.CreatedAt = DateTime.UtcNow;
            user.IsActive = true;

            var createdUser = await _userRepository.CreateAsync(user);
            return createdUser != null ? _mapper.Map<UserDto>(createdUser) : null;
        }

        public async Task<bool> UpdateAsync(int id, UpdateUserDto updateDto)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null) return false;

            _mapper.Map(updateDto, user);
            return await _userRepository.UpdateAsync(user);
        }

        public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto changePasswordDto)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return false;

            if (!BCrypt.Net.BCrypt.Verify(changePasswordDto.CurrentPassword, user.PasswordHash))
                return false;

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(changePasswordDto.NewPassword);
            return await _userRepository.UpdateAsync(user);
        }

        public async Task<IEnumerable<UserDto>> SearchAsync(string searchTerm)
        {
            var users = await _userRepository.SearchAsync(searchTerm);
            return _mapper.Map<IEnumerable<UserDto>>(users);
        }

        public async Task<int> GetActiveUsersCountAsync()
        {
            var users = await _userRepository.GetActiveUsersAsync();
            return users.Count();
        }

        public async Task<IEnumerable<UserDto>> GetRecentUsersAsync(int count)
        {
            var users = await _userRepository.GetRecentUsersAsync(count);
            return _mapper.Map<IEnumerable<UserDto>>(users);
        }

        public async Task<bool> ToggleActiveStatusAsync(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null) return false;

            user.IsActive = !user.IsActive;
            return await _userRepository.UpdateAsync(user);
        }
    }
}
