using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KvizHub.Repository.DTOs
{
    public class QuizAttemptDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public int QuizId { get; set; }
        public string QuizTitle { get; set; } = string.Empty;
        public DateTime StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int Score { get; set; }
        public int CompletionTimeInSeconds { get; set; }
        public bool IsCompleted { get; set; }
    }

    public class StartQuizDto
    {
        [Required]
        public int QuizId { get; set; }
    }

    public class SubmitQuizDto
    {
        [Required]
        public List<UserAnswerDto> UserAnswers { get; set; } = new();
    }

    public class UserAnswerDto
    {
        [Required]
        public int QuestionId { get; set; }

        public int? AnswerId { get; set; } // Za SingleChoice/TrueFalse (jedan odgovor)

        public string? SelectedAnswerIds { get; set; } // Za MultipleChoice (više odgovora kao string)

        public string? TextAnswer { get; set; } // Za FillInTheBlank
    }

    public class QuizAttemptResultDto
    {
        public int Id { get; set; }
        public int Score { get; set; }
        public int TotalQuestions { get; set; }
        public int CompletionTimeInSeconds { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime? CompletedAt { get; set; }
    }

    public class StartQuizAttemptDto
    {
        [Required]
        public int QuizId { get; set; }
    }

    public class SubmitQuizAttemptDto
    {
        [Required]
        public int QuizAttemptId { get; set; }

        public List<SubmitUserAnswerDto> UserAnswers { get; set; } = new();

        public int? ActualTimeSpentSeconds { get; set; } // Stvarno vreme igranja iz frontend-a
    }

    public class SubmitUserAnswerDto
    {
        [Required]
        public int QuestionId { get; set; }

        public string? SelectedAnswerIds { get; set; } // JSON za multiple choice

        public string? TextAnswer { get; set; } // Za fill-in-the-blank
    }

    public class QuizAttemptDetailDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public int QuizId { get; set; }
        public string QuizTitle { get; set; } = string.Empty;
        public string QuizDescription { get; set; } = string.Empty;
        public DateTime StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int Score { get; set; }
        public decimal Percentage { get; set; }
        public int CorrectAnswers { get; set; }
        public int TotalQuestions { get; set; }
        public bool IsCompleted { get; set; }
        public TimeSpan? TimeSpent { get; set; }
        public List<UserAnswerDetailDto> UserAnswers { get; set; } = new();
    }

    public class UserAnswerDetailDto
    {
        public int Id { get; set; }
        public int QuestionId { get; set; }
        public string QuestionText { get; set; } = string.Empty;
        public string? SelectedAnswerIds { get; set; }
        public string? TextAnswer { get; set; }
        public bool IsCorrect { get; set; }
        public DateTime AnsweredAt { get; set; }
        public List<AnswerDetailDto> AvailableAnswers { get; set; } = new();
    }

    public class AnswerDetailDto
    {
        public int Id { get; set; }
        public string Text { get; set; } = string.Empty;
        public bool IsCorrect { get; set; }
        public bool WasSelected { get; set; }
    }

    public class LeaderboardEntryDto
    {
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? ProfileImageUrl { get; set; }
        public int TotalAttempts { get; set; }
        public int CompletedAttempts { get; set; }
        public decimal AverageScore { get; set; }
        public int TotalScore { get; set; }
        public int Rank { get; set; }
    }

    public class QuizAttemptLeaderboardDto
    {
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public int UserLevel { get; set; } = 1;
        public int QuizId { get; set; }
        public string QuizTitle { get; set; } = string.Empty;
        public string QuizCategory { get; set; } = string.Empty;
        public int Score { get; set; }
        public decimal Percentage { get; set; }
        public DateTime DateTaken { get; set; }
        public TimeSpan? TimeSpent { get; set; }
        public int Position { get; set; }
        public bool IsCurrentUser { get; set; }
    }

    public class UserResultsDto
    {
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public int TotalAttempts { get; set; }
        public int CompletedAttempts { get; set; }
        public decimal AverageScore { get; set; }
        public int BestScore { get; set; }
        public List<QuizAttemptDto> RecentAttempts { get; set; } = new();
        public List<CategoryStatsDto> CategoryStats { get; set; } = new();
    }

    public class CategoryStatsDto
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public int AttemptsCount { get; set; }
        public decimal AverageScore { get; set; }
        public int BestScore { get; set; }
    }

    // Frontend-compatible DTO za UserResults
    public class UserResultDto
    {
        public int Id { get; set; }
        public int QuizId { get; set; }
        public string QuizTitle { get; set; } = string.Empty;
        public string QuizCategory { get; set; } = string.Empty;
        public DateTime DateTaken { get; set; }
        public int Score { get; set; }
        public int TotalQuestions { get; set; }
        public int CorrectAnswers { get; set; }
        public int TimeSpent { get; set; } // u sekundama
        public int TimeLimit { get; set; } // u sekundama
        public decimal Percentage { get; set; }
        public int Rank { get; set; }
        public int TotalParticipants { get; set; }
    }
}
