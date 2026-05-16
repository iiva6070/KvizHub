using KvizHub.Repository.Contracts;
using KvizHub.Repository.DTOs;
using KvizHub.Repository.Models;
using KvizHub.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;

namespace KvizHub.Services.Services
{
    public class QuizService : IQuizService
    {
        private readonly IQuizRepository _quizRepository;
        private readonly IQuestionRepository _questionRepository;
        private readonly IAnswerRepository _answerRepository;
        private readonly IMapper _mapper;

        public QuizService(
            IQuizRepository quizRepository,
            IQuestionRepository questionRepository,
            IAnswerRepository answerRepository,
            IMapper mapper)
        {
            _quizRepository = quizRepository;
            _questionRepository = questionRepository;
            _answerRepository = answerRepository;
            _mapper = mapper;
        }

        public async Task<QuizDto?> GetByIdAsync(int id)
        {
            var quiz = await _quizRepository.GetByIdAsync(id);
            return quiz != null ? _mapper.Map<QuizDto>(quiz) : null;
        }

        public async Task<QuizDetailDto?> GetByIdWithQuestionsAsync(int id)
        {
            var quiz = await _quizRepository.GetByIdWithQuestionsAsync(id);
            return quiz != null ? _mapper.Map<QuizDetailDto>(quiz) : null;
        }

        public async Task<IEnumerable<QuizDto>> GetAllAsync()
        {
            var quizzes = await _quizRepository.GetAllAsync();
            return _mapper.Map<IEnumerable<QuizDto>>(quizzes);
        }

        public async Task<IEnumerable<QuizDto>> GetActiveAsync()
        {
            var quizzes = await _quizRepository.GetActiveAsync();
            return _mapper.Map<IEnumerable<QuizDto>>(quizzes);
        }

        public async Task<QuizDto?> CreateAsync(CreateQuizDto createDto)
        {
            // Map quiz
            var quiz = _mapper.Map<Quiz>(createDto);

            // Add quiz first
            var success = await _quizRepository.AddAsync(quiz);
            if (!success) return null;

            // Get the created quiz with ID
            var createdQuiz = await _quizRepository.GetByIdAsync(quiz.Id);
            if (createdQuiz == null) return null;

            // Add questions and answers
            if (createDto.Questions?.Any() == true)
            {
                var questions = new List<Question>();
                foreach (var questionDto in createDto.Questions)
                {
                    var question = _mapper.Map<Question>(questionDto);
                    question.QuizId = createdQuiz.Id;
                    questions.Add(question);
                }

                await _questionRepository.AddRangeAsync(questions);

                // Add answers for each question
                foreach (var question in questions)
                {
                    var questionDto = createDto.Questions.FirstOrDefault(q => q.OrderIndex == question.OrderIndex);
                    if (questionDto?.Answers?.Any() == true)
                    {
                        var answers = new List<Answer>();
                        foreach (var answerDto in questionDto.Answers)
                        {
                            var answer = _mapper.Map<Answer>(answerDto);
                            answer.QuestionId = question.Id;
                            answers.Add(answer);
                        }

                        await _answerRepository.AddRangeAsync(answers);
                    }
                }
            }

            return _mapper.Map<QuizDto>(createdQuiz);
        }

        public async Task<bool> UpdateAsync(int id, UpdateQuizDto updateDto)
        {
            var quiz = await _quizRepository.GetByIdAsync(id);
            if (quiz == null) return false;

            _mapper.Map(updateDto, quiz);
            return await _quizRepository.UpdateAsync(quiz);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            return await _quizRepository.DeleteAsync(id);
        }

        public async Task<IEnumerable<QuizDto>> GetByCategoryAsync(int categoryId)
        {
            var quizzes = await _quizRepository.GetByCategoryAsync(categoryId);
            return _mapper.Map<IEnumerable<QuizDto>>(quizzes);
        }

        public async Task<IEnumerable<QuizDto>> GetByDifficultyAsync(DifficultyLevel difficulty)
        {
            var quizzes = await _quizRepository.GetByDifficultyAsync(difficulty);
            return _mapper.Map<IEnumerable<QuizDto>>(quizzes);
        }

        public async Task<IEnumerable<QuizDto>> SearchAsync(string searchTerm)
        {
            var quizzes = await _quizRepository.SearchAsync(searchTerm);
            return _mapper.Map<IEnumerable<QuizDto>>(quizzes);
        }

        public async Task<int> GetTotalQuizzesCountAsync()
        {
            return await _quizRepository.GetTotalQuizzesCountAsync();
        }

        public async Task<int> GetActiveQuizzesCountAsync()
        {
            return await _quizRepository.GetActiveQuizzesCountAsync();
        }

        public async Task<IEnumerable<QuizDto>> GetPopularQuizzesAsync(int count)
        {
            var quizzes = await _quizRepository.GetPopularQuizzesAsync(count);
            return _mapper.Map<IEnumerable<QuizDto>>(quizzes);
        }

        public async Task<IEnumerable<QuizDto>> GetRecentQuizzesAsync(int count)
        {
            var quizzes = await _quizRepository.GetRecentQuizzesAsync(count);
            return _mapper.Map<IEnumerable<QuizDto>>(quizzes);
        }

        public async Task<bool> ToggleActiveStatusAsync(int id)
        {
            return await _quizRepository.ToggleActiveStatusAsync(id);
        }
    }
}
