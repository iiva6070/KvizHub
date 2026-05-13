using KvizHub.Repository.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Reflection.Emit;

namespace KvizHub.Repository.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        // svaki put kad dodam novu tabelu:
        // Add-Migration NazivMigracije
        // Update-Database

        public DbSet<User> Users { get; set; }
        public DbSet<Quiz> Quizzes { get; set; }
        public DbSet<QuizCategory> QuizCategories { get; set; }
        public DbSet<Question> Questions { get; set; }
        public DbSet<Answer> Answers { get; set; }
        public DbSet<QuizAttempt> QuizAttempts { get; set; }
        public DbSet<UserAnswer> UserAnswers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // User configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.HasIndex(e => e.Username)
                    .IsUnique();

                entity.HasIndex(e => e.Email)
                    .IsUnique();

                entity.Property(e => e.Role)
                    .HasDefaultValue("User");
            });

            // QuizCategory configuration
            modelBuilder.Entity<QuizCategory>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Name)
                    .IsRequired()
                    .HasMaxLength(100);
            });

            // Quiz configuration
            modelBuilder.Entity<Quiz>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Title)
                    .IsRequired()
                    .HasMaxLength(200);

                entity.Property(e => e.Description)
                    .HasMaxLength(1000);

                entity.Property(e => e.Difficulty)
                    .HasConversion<string>();

                entity.HasOne(e => e.Category)
                    .WithMany(c => c.Quizzes)
                    .HasForeignKey(e => e.CategoryId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Question configuration
            modelBuilder.Entity<Question>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Text)
                    .IsRequired()
                    .HasMaxLength(1000);

                entity.Property(e => e.Type)
                    .HasConversion<string>();

                entity.HasOne(e => e.Quiz)
                    .WithMany(q => q.Questions)
                    .HasForeignKey(e => e.QuizId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Answer configuration
            modelBuilder.Entity<Answer>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Text)
                    .IsRequired()
                    .HasMaxLength(1000);

                entity.HasOne(e => e.Question)
                    .WithMany(q => q.Answers)
                    .HasForeignKey(e => e.QuestionId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // QuizAttempt configuration
            modelBuilder.Entity<QuizAttempt>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Percentage)
                    .HasPrecision(5, 2);

                entity.HasOne(e => e.User)
                    .WithMany(u => u.QuizAttempts)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Quiz)
                    .WithMany(q => q.QuizAttempts)
                    .HasForeignKey(e => e.QuizId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // UserAnswer configuration
            modelBuilder.Entity<UserAnswer>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.TextAnswer)
                    .HasMaxLength(1000);

                entity.HasOne(e => e.QuizAttempt)
                    .WithMany(qa => qa.UserAnswers)
                    .HasForeignKey(e => e.QuizAttemptId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Question)
                    .WithMany(q => q.UserAnswers)
                    .HasForeignKey(e => e.QuestionId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Seed data
            SeedData(modelBuilder);
        }

        private void SeedData(ModelBuilder modelBuilder)
        {
            // Seed QuizCategories
            modelBuilder.Entity<QuizCategory>().HasData(
                new QuizCategory
                {
                    Id = 1,
                    Name = "Opšte znanje",
                    Description = "Pitanja iz različitih oblasti",
                    CreatedAt = new DateTime(2024, 1, 1)
                },
                new QuizCategory
                {
                    Id = 2,
                    Name = "Istorija",
                    Description = "Istorijska pitanja",
                    CreatedAt = new DateTime(2024, 1, 1)
                },
                new QuizCategory
                {
                    Id = 3,
                    Name = "Geografija",
                    Description = "Geografska pitanja",
                    CreatedAt = new DateTime(2024, 1, 1)
                },
                new QuizCategory
                {
                    Id = 4,
                    Name = "Nauka",
                    Description = "Naučna pitanja",
                    CreatedAt = new DateTime(2024, 1, 1)
                },
                new QuizCategory
                {
                    Id = 5,
                    Name = "Sport",
                    Description = "Sportska pitanja",
                    CreatedAt = new DateTime(2024, 1, 1)
                },
                new QuizCategory
                {
                    Id = 6,
                    Name = "Tehnologija",
                    Description = "IT i tehnološka pitanja",
                    CreatedAt = new DateTime(2024, 1, 1)
                }
            );

            // Seed Quizzes
            modelBuilder.Entity<Quiz>().HasData(
                new Quiz
                {
                    Id = 10,
                    Title = "Istorijski izazov",
                    Description = "Kviz iz istorije i književnosti",
                    CategoryId = 2,
                    Difficulty = DifficultyLevel.Beginner,
                    TimeLimitMinutes = 15,
                    IsActive = true,
                    CreatedAt = new DateTime(2024, 1, 1)
                },
                new Quiz
                {
                    Id = 11,
                    Title = "Geografija sveta",
                    Description = "Pitanja o državama i kontinentima",
                    CategoryId = 3,
                    Difficulty = DifficultyLevel.Intermediate,
                    TimeLimitMinutes = 20,
                    IsActive = true,
                    CreatedAt = new DateTime(2024, 1, 2)
                }
            );

            // Seed Questions
            modelBuilder.Entity<Question>().HasData(
                new Question
                {
                    Id = 101,
                    QuizId = 10,
                    Text = "Koje godine je počeo Drugi svetski rat?",
                    Type = QuestionType.SingleChoice,
                    Points = 10,
                    OrderIndex = 1,
                    CreatedAt = new DateTime(2024, 1, 1)
                },
                new Question
                {
                    Id = 102,
                    QuizId = 10,
                    Text = "Koji grad je bio glavni grad Vizantijskog carstva?",
                    Type = QuestionType.SingleChoice,
                    Points = 10,
                    OrderIndex = 2,
                    CreatedAt = new DateTime(2024, 1, 1)
                },
                new Question
                {
                    Id = 103,
                    QuizId = 10,
                    Text = "Ko je napisao roman 'Na Drini ćuprija'?",
                    Type = QuestionType.SingleChoice,
                    Points = 5,
                    OrderIndex = 3,
                    CreatedAt = new DateTime(2024, 1, 1)
                },
                new Question
                {
                    Id = 104,
                    QuizId = 11,
                    Text = "Koji je glavni grad Kanade?",
                    Type = QuestionType.SingleChoice,
                    Points = 10,
                    OrderIndex = 1,
                    CreatedAt = new DateTime(2024, 1, 2)
                },
                new Question
                {
                    Id = 105,
                    QuizId = 11,
                    Text = "Koja je najveća država na svetu po površini?",
                    Type = QuestionType.FillInTheBlank,
                    Points = 15,
                    OrderIndex = 2,
                    CreatedAt = new DateTime(2024, 1, 2)
                }
            );

            // Seed Answers
            modelBuilder.Entity<Answer>().HasData(
                new Answer { Id = 1001, QuestionId = 101, Text = "1937", IsCorrect = false },
                new Answer { Id = 1002, QuestionId = 101, Text = "1939", IsCorrect = true },
                new Answer { Id = 1003, QuestionId = 101, Text = "1941", IsCorrect = false },
                new Answer { Id = 1004, QuestionId = 101, Text = "1945", IsCorrect = false },

                new Answer { Id = 1005, QuestionId = 102, Text = "Rim", IsCorrect = false },
                new Answer { Id = 1006, QuestionId = 102, Text = "Atina", IsCorrect = false },
                new Answer { Id = 1007, QuestionId = 102, Text = "Konstantinopolj", IsCorrect = true },
                new Answer { Id = 1008, QuestionId = 102, Text = "Aleksandrija", IsCorrect = false },

                new Answer { Id = 1009, QuestionId = 103, Text = "Ivo Andrić", IsCorrect = true },
                new Answer { Id = 1010, QuestionId = 103, Text = "Meša Selimović", IsCorrect = false },
                new Answer { Id = 1017, QuestionId = 103, Text = "Branko Ćopić", IsCorrect = false },
                new Answer { Id = 1018, QuestionId = 103, Text = "Miloš Crnjanski", IsCorrect = false },

                new Answer { Id = 1011, QuestionId = 104, Text = "Toronto", IsCorrect = false },
                new Answer { Id = 1012, QuestionId = 104, Text = "Vankuver", IsCorrect = false },
                new Answer { Id = 1013, QuestionId = 104, Text = "Otava", IsCorrect = true },
                new Answer { Id = 1014, QuestionId = 104, Text = "Montreal", IsCorrect = false },

                new Answer { Id = 1015, QuestionId = 105, Text = "Rusija", IsCorrect = true },
                new Answer { Id = 1016, QuestionId = 105, Text = "rusija", IsCorrect = true }
            );
        }
    }
}