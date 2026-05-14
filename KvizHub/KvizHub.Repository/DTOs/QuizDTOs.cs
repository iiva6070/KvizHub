using KvizHub.Repository.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KvizHub.Repository.DTOs
{
    public class QuizDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int TimeLimitMinutes { get; set; }
        public DifficultyLevel Difficulty { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public int QuestionsCount { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateQuizDto
    {
        [Required]
        [StringLength(200, MinimumLength = 3)]
        public string Title { get; set; } = string.Empty;

        [StringLength(1000)]
        public string? Description { get; set; }

        [Range(1, 180)]
        public int TimeLimitMinutes { get; set; } = 30;

        [Required]
        public DifficultyLevel Difficulty { get; set; }

        [Required]
        public int CategoryId { get; set; }

        public List<CreateQuestionDto> Questions { get; set; } = new();
    }

    public class UpdateQuizDto
    {
        [Required]
        [StringLength(200, MinimumLength = 3)]
        public string Title { get; set; } = string.Empty;

        [StringLength(1000)]
        public string? Description { get; set; }

        [Range(1, 180)]
        public int TimeLimitMinutes { get; set; }

        [Required]
        public DifficultyLevel Difficulty { get; set; }

        [Required]
        public int CategoryId { get; set; }

        public bool IsActive { get; set; }
    }

    public class QuizDetailDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int TimeLimitMinutes { get; set; }
        public DifficultyLevel Difficulty { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<QuestionDto> Questions { get; set; } = new();
    }
}
