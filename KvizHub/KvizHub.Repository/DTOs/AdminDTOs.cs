using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KvizHub.Repository.DTOs
{
    // Admin Statistics DTO
    public class AdminStatsDto
    {
        public int TotalUsers { get; set; }
        public int TotalQuizzes { get; set; }
        public int TotalAttempts { get; set; }
        public int TotalQuestions { get; set; }
        public int ActiveUsers { get; set; }
        public int RecentAttempts { get; set; }
        public double AverageScore { get; set; }
        public List<AdminCategoryStatsDto> CategoryStats { get; set; } = new List<AdminCategoryStatsDto>();
        public List<TopUserDto> TopUsers { get; set; } = new List<TopUserDto>();
        public List<WeeklyActivityDto> WeeklyActivity { get; set; } = new List<WeeklyActivityDto>();
    }

    // DTO za statistike po kategorijama - admin verzija
    public class AdminCategoryStatsDto
    {
        public string Name { get; set; } = string.Empty;
        public int QuizCount { get; set; }
        public int Attempts { get; set; }
        public double AverageScore { get; set; }
    }

    // DTO za top korisnike
    public class TopUserDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int CompletedQuizzes { get; set; }
        public double AverageScore { get; set; }
        public int TotalScore { get; set; }
        public int Rank { get; set; }
    }

    // DTO za nedeljne aktivnosti
    public class WeeklyActivityDto
    {
        public string Day { get; set; } = string.Empty;
        public int Attempts { get; set; }
    }

    // Admin User DTOs
    public class AdminUserDto
    {
        public int Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLoginAt { get; set; }
        public int TotalQuizzesTaken { get; set; }
        public double AverageScore { get; set; }
    }

    public class UpdateUserStatusDto
    {
        public bool IsActive { get; set; }
    }

    // Admin Quiz DTOs
    public class AdminQuizDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Difficulty { get; set; } = string.Empty;
        public int TimeLimit { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public int TotalQuestions { get; set; }
        public int TotalAttempts { get; set; }
        public double AverageScore { get; set; }
    }

    public class AdminQuizDetailDto : AdminQuizDto
    {
        public List<AdminQuestionDto> Questions { get; set; } = new();
        public List<QuizAttemptSummaryDto> RecentAttempts { get; set; } = new();
    }

    // Admin Question DTOs
    public class AdminQuestionDto
    {
        public int Id { get; set; }
        public string Text { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public int Points { get; set; }
        public int Order { get; set; }
        public List<AdminAnswerOptionDto> AnswerOptions { get; set; } = new();
        public string? CorrectAnswer { get; set; } // For fill-in-the-blank questions
        public bool IsActive { get; set; }
    }

    public class AdminQuestionDetailDto : AdminQuestionDto
    {
        public int QuizId { get; set; }
        public string QuizTitle { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public QuestionStatsDto Stats { get; set; } = new();
    }

    // Admin Answer Option DTOs
    public class AdminAnswerOptionDto
    {
        public int Id { get; set; }
        public string Text { get; set; } = string.Empty;
        public bool IsCorrect { get; set; }
        public int Order { get; set; }
    }

    public class CreateAnswerOptionDto
    {
        public string Text { get; set; } = string.Empty;
        public bool IsCorrect { get; set; }
        public int Order { get; set; }
    }

    // Quiz Attempt Summary for Admin
    public class QuizAttemptSummaryDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string UserEmail { get; set; } = string.Empty;
        public DateTime StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int Score { get; set; }
        public int TotalQuestions { get; set; }
        public double Percentage { get; set; }
        public int TimeSpent { get; set; } // in seconds
        public bool IsCompleted { get; set; }
    }

    // User Quiz Results for Admin
    public class UserQuizResultDto
    {
        public int AttemptId { get; set; }
        public int QuizId { get; set; }
        public string QuizTitle { get; set; } = string.Empty;
        public string QuizCategory { get; set; } = string.Empty;
        public DateTime AttemptDate { get; set; }
        public int Score { get; set; }
        public int TotalQuestions { get; set; }
        public double Percentage { get; set; }
        public int TimeSpent { get; set; } // in seconds
        public string Status { get; set; } = string.Empty; // Completed, In Progress, Abandoned
    }

    // Question Statistics
    public class QuestionStatsDto
    {
        public int TotalAttempts { get; set; }
        public int CorrectAnswers { get; set; }
        public double CorrectPercentage { get; set; }
        public double AverageTimeSpent { get; set; } // in seconds
        public List<AnswerDistributionDto> AnswerDistribution { get; set; } = new();
    }

    public class AnswerDistributionDto
    {
        public int AnswerOptionId { get; set; }
        public string AnswerText { get; set; } = string.Empty;
        public int Count { get; set; }
        public double Percentage { get; set; }
        public bool IsCorrect { get; set; }
    }

    // Category DTOs - Ovo proveravamo da li već postoji u QuizCategoryDTOs.cs
    public class AdminCategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int QuizCount { get; set; }
        public bool IsActive { get; set; }
    }

    public class CreateCategoryDto
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
    }
}
