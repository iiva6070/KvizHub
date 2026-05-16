using AutoMapper;
using KvizHub.Repository.DTOs;
using KvizHub.Repository.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KvizHub.Services.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // User mappings
            CreateMap<User, UserDto>();
            CreateMap<RegisterDto, User>()
                .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));
            CreateMap<UpdateUserProfileDto, User>()
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));
            CreateMap<UpdateUserDto, User>();

            // Quiz mappings
            CreateMap<Quiz, QuizDto>()
                .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category.Name))
                .ForMember(dest => dest.QuestionsCount, opt => opt.MapFrom(src => src.Questions.Count));
            CreateMap<Quiz, QuizDetailDto>()
                .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category.Name));
            CreateMap<CreateQuizDto, Quiz>()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.Questions, opt => opt.Ignore());
            CreateMap<UpdateQuizDto, Quiz>()
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

            // QuizCategory mappings
            CreateMap<QuizCategory, QuizCategoryDto>()
                .ForMember(dest => dest.QuizzesCount, opt => opt.MapFrom(src => src.Quizzes.Count));
            CreateMap<QuizCategory, QuizCategoryWithCountDto>()
                .ForMember(dest => dest.QuizzesCount, opt => opt.MapFrom(src => src.Quizzes.Count));
            CreateMap<CreateQuizCategoryDto, QuizCategory>()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));
            CreateMap<UpdateQuizCategoryDto, QuizCategory>();

            // Question mappings
            CreateMap<Question, QuestionDto>();
            CreateMap<CreateQuestionDto, Question>()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.Answers, opt => opt.Ignore());
            CreateMap<UpdateQuestionDto, Question>();

            // Answer mappings
            CreateMap<Answer, AnswerDto>();
            CreateMap<CreateAnswerDto, Answer>();
            CreateMap<UpdateAnswerDto, Answer>();

            // QuizAttempt mappings
            CreateMap<QuizAttempt, QuizAttemptDto>()
                .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.User.Username))
                .ForMember(dest => dest.QuizTitle, opt => opt.MapFrom(src => src.Quiz.Title));
            CreateMap<QuizAttempt, QuizAttemptDetailDto>()
                .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.User.Username))
                .ForMember(dest => dest.QuizTitle, opt => opt.MapFrom(src => src.Quiz.Title))
                .ForMember(dest => dest.QuizDescription, opt => opt.MapFrom(src => src.Quiz.Description));
            CreateMap<StartQuizAttemptDto, QuizAttempt>()
                .ForMember(dest => dest.StartedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

            // UserAnswer mappings
            CreateMap<UserAnswer, UserAnswerDetailDto>()
                .ForMember(dest => dest.QuestionText, opt => opt.MapFrom(src => src.Question.Text))
                .ForMember(dest => dest.AvailableAnswers, opt => opt.MapFrom(src => src.Question.Answers));
            CreateMap<SubmitUserAnswerDto, UserAnswer>()
                .ForMember(dest => dest.AnsweredAt, opt => opt.MapFrom(src => DateTime.UtcNow));
            CreateMap<UserAnswerDto, UserAnswer>();

            // Answer detail mappings for quiz results
            CreateMap<Answer, AnswerDetailDto>()
                .ForMember(dest => dest.WasSelected, opt => opt.Ignore()); // Will be set manually
        }
    }
}
