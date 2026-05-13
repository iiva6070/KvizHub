using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KvizHub.Repository.Models
{
    public class QuizAttempt
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int QuizId { get; set; }
        public DateTime StartedAt { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedAt { get; set; }
        public int Score { get; set; } = 0;
        public decimal Percentage { get; set; } = 0;
        public int CorrectAnswers { get; set; } = 0;
        public int TotalQuestions { get; set; } = 0;
        public bool IsCompleted { get; set; } = false;
        public TimeSpan? TimeSpent { get; set; }

        // Navigation properties
        public User User { get; set; } = null!;
        public Quiz Quiz { get; set; } = null!;
        public ICollection<UserAnswer> UserAnswers { get; set; } = new List<UserAnswer>();
    }
}
