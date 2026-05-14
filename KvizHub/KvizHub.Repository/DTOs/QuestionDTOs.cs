using KvizHub.Repository.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KvizHub.Repository.DTOs
{
    public class QuestionDto
    {
        public int Id { get; set; }
        public int QuizId { get; set; }
        public string Text { get; set; } = string.Empty;
        public QuestionType Type { get; set; }
        public int Points { get; set; }
        public int OrderIndex { get; set; }
        public string? CorrectAnswer { get; set; } // Za FillInTheBlank pitanja
        public List<AnswerDto> Answers { get; set; } = new();
    }

    public class CreateQuestionDto
    {
        [Required]
        [StringLength(1000, MinimumLength = 5)]
        public string Text { get; set; } = string.Empty;

        [Required]
        public QuestionType Type { get; set; }

        [Range(1, 10)]
        public int Points { get; set; } = 1;

        public int OrderIndex { get; set; }

        public string? CorrectAnswer { get; set; } // Za FillInTheBlank pitanja

        public List<CreateAnswerDto> Answers { get; set; } = new();
    }

    public class UpdateQuestionDto
    {
        [Required]
        [StringLength(1000, MinimumLength = 5)]
        public string Text { get; set; } = string.Empty;

        [Required]
        public QuestionType Type { get; set; }

        [Range(1, 10)]
        public int Points { get; set; }

        public int OrderIndex { get; set; }

        public string? CorrectAnswer { get; set; } // Za FillInTheBlank pitanja
    }

    public class AnswerDto
    {
        public int Id { get; set; }
        public int QuestionId { get; set; }
        public string Text { get; set; } = string.Empty;
        public bool IsCorrect { get; set; }
        public int OrderIndex { get; set; }
    }

    public class CreateAnswerDto
    {
        [Required]
        [StringLength(1000, MinimumLength = 1)]
        public string Text { get; set; } = string.Empty;

        public bool IsCorrect { get; set; } = false;

        public int OrderIndex { get; set; }
    }

    public class UpdateAnswerDto
    {
        [Required]
        [StringLength(1000, MinimumLength = 1)]
        public string Text { get; set; } = string.Empty;

        public bool IsCorrect { get; set; }

        public int OrderIndex { get; set; }
    }
}
