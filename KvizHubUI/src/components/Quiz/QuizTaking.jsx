import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as quizAttemptService from "../../services/quizAttemptService";
import * as quizService from "../../services/quizService";
import QuestionCard from "./QuestionCard";
import "./QuizTaking.css";
import Timer from "./Timer";

function QuizTaking() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  console.log("QuizTaking loaded, quizId:", quizId);

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [attemptId, setAttemptId] = useState(null);
  const [quizStartTime, setQuizStartTime] = useState(null); // Vreme kada je korisnik poceo da igra
  const [hasStartedAnswering, setHasStartedAnswering] = useState(false);

  useEffect(() => {
    console.log("🔄 useEffect triggered, quizId:", quizId);
    if (quizId) {
      loadQuizData();
    } else {
      console.log("No quizId provided");
    }
  }, [quizId]);

  const loadQuizData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("Starting to load quiz data for ID:", quizId);

      // Ucitaj quiz podatke
      const quizData = await quizService.getQuizById(parseInt(quizId));
      console.log("Quiz data received:", quizData);
      if (!quizData) {
        throw new Error("Kviz nije pronađen");
      }

      // Ucitaj pitanja
      const questionsData = await quizService.getQuestionsByQuizId(
        parseInt(quizId)
      );
      console.log("❓ Questions data received:", questionsData);

      // Pokreni quiz attempt
      const attempt = await quizAttemptService.startQuiz(parseInt(quizId));
      console.log("Quiz attempt started:", attempt);
      setAttemptId(attempt.id);

      setQuiz(quizData);
      // Izvuci pitanja iz odgovora
      const questionsList = questionsData.questions || questionsData || [];
      setQuestions(questionsList);
      console.log(
        "Quiz and questions set successfully, questions count:",
        questionsList.length
      );
    } catch (err) {
      console.error("Greška pri učitavanju kviza:", err);
      setError(err.message || "Došlo je do greške pri učitavanju kviza");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (answer) => {
    // Zapocni tracking vremena kad korisnik da prvi odgovor
    if (!hasStartedAnswering) {
      setQuizStartTime(Date.now());
      setHasStartedAnswering(true);
      console.log("🕐 Quiz timing started");
    }

    setAnswers((prev) => ({
      ...prev,
      [answer.questionId]: answer,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleTimeUp = () => {
    console.log("Time is up! Auto-submitting quiz...");
    setIsSubmitting(true); // Prevent user from making more changes
    handleSubmitQuiz();
  };

  const handleSubmitQuiz = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      if (!attemptId) {
        throw new Error("Quiz attempt nije pokrenut");
      }

      // Izracunaj stvarno vreme igranja
      const actualTimeSpent =
        hasStartedAnswering && quizStartTime
          ? Math.round((Date.now() - quizStartTime) / 1000) // u sekundama
          : 0;

      console.log("🕐 Quiz timing debug:");
      console.log("  - hasStartedAnswering:", hasStartedAnswering);
      console.log("  - quizStartTime:", quizStartTime);
      console.log("  - Current time:", Date.now());
      console.log(
        "  - Time diff (ms):",
        quizStartTime ? Date.now() - quizStartTime : "N/A"
      );
      console.log("  - Actual time spent:", actualTimeSpent, "seconds");
      console.log("Submitting quiz with answers:", answers);
      console.log("Answers keys:", Object.keys(answers));
      console.log(
        "Questions IDs:",
        questions.map((q) => q.id)
      );
      console.log("Attempt ID:", attemptId);

      // Pripremi odgovore u formatu koji backend očekuje
      const formattedAnswers = questions
        .map((question) => {
          const userAnswer = answers[question.id];

          // Za FillInTheBlank pitanja
          if (
            question.type === "FillInTheBlank" ||
            question.type === "FillInBlank"
          ) {
            if (!userAnswer || !userAnswer.submittedText?.trim()) {
              console.log(`Question ${question.id}: NO FILL-IN-BLANK ANSWER`);
              return null;
            }

            console.log(
              `Question ${question.id}: textAnswer = ${userAnswer.submittedText}`
            );
            return {
              QuestionId: question.id,
              TextAnswer: userAnswer.submittedText, // Za FillInTheBlank
            };
          }

          // Za ostale tipove pitanja (SingleChoice, MultipleChoice, TrueFalse)
          if (
            !userAnswer ||
            !userAnswer.selectedOptionIds ||
            userAnswer.selectedOptionIds.length === 0
          ) {
            console.log(`Question ${question.id}: NO ANSWER`);
            return null;
          }

          // Za multiple choice, šalji sve selected IDs kao string
          if (question.type === "MultipleChoice") {
            const selectedIds = userAnswer.selectedOptionIds.join(",");
            console.log(
              `Question ${question.id}: selectedAnswerIds = ${selectedIds}`
            );
            return {
              QuestionId: question.id,
              SelectedAnswerIds: selectedIds, // Za MultipleChoice
            };
          }

          // Za single choice i TrueFalse, uzmi prvi selected option ID kao string
          const answerId = userAnswer.selectedOptionIds[0];
          console.log(
            `Question ${question.id}: selectedAnswerIds = ${answerId}`
          );
          return {
            QuestionId: question.id, // Pascal case za backend
            SelectedAnswerIds: answerId.toString(), // Šalji kao string za konzistentnost
          };
        })
        .filter((answer) => answer !== null); // Ukloni null odgovore

      console.log("Formatted answers:", formattedAnswers);
      console.log("🆔 Using attemptId for submission:", attemptId);

      // Pošalji odgovore na backend
      const result = await quizAttemptService.submitQuiz(
        attemptId,
        formattedAnswers,
        actualTimeSpent
      );
      console.log("Quiz submission result:", result);
      console.log("Quiz data:", quiz);
      console.log("❓ Questions data:", questions);

      // Preusmeri na stranicu rezultata sa podacima iz backend-a
      navigate(`/quiz-results/${quizId}`, {
        state: {
          result,
          quiz,
          questions,
        },
      });
    } catch (err) {
      console.error("Greška pri slanju kviza:", err);

      // Check if it's a timeout related error
      if (
        err.message.includes("already been completed") ||
        err.message.includes("already be completed")
      ) {
        alert(
          "Kviz je već završen ili je vreme isteklo. Prebacujemo vas na rezultate..."
        );
        // Navigate to results or quiz list
        navigate(`/quiz-results`, {
          state: {
            message:
              "Kviz je završen zbog isteka vremena ili je već submitovan.",
          },
        });
        return;
      }

      alert(`Došlo je do greške pri slanju kviza: ${err.message}`);
    } finally {
      setIsSubmitting(false);
      setShowConfirmSubmit(false);
    }
  };

  const getAnsweredQuestionsCount = () => {
    return Object.keys(answers).length;
  };

  const isCurrentQuestionAnswered = () => {
    const currentQuestion = questions[currentQuestionIndex];
    return currentQuestion && answers[currentQuestion.id];
  };

  if (isLoading) {
    return (
      <div className="quiz-taking loading">
        <div className="loading-spinner"></div>
        <p>Učitavanje kviza...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-taking error">
        <div className="error-message">
          <h2>Greška</h2>
          <p>{error}</p>
          <button
            onClick={() => navigate("/quiz-browser")}
            className="btn-secondary"
          >
            Vrati se na pregled kvizova
          </button>
        </div>
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="quiz-taking error">
        <div className="error-message">
          <h2>Kviz nije dostupan</h2>
          <p>Nije moguće učitati pitanja za ovaj kviz.</p>
          <button
            onClick={() => navigate("/quiz-browser")}
            className="btn-secondary"
          >
            Vrati se na pregled kvizova
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  // Dodaj proverenu da li currentQuestion postoji
  if (!currentQuestion) {
    return (
      <div className="quiz-taking">
        <div className="loading">
          <p>Učitavanje pitanja...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-taking">
      <div className="quiz-header">
        <div className="quiz-info">
          <h1>{quiz.title}</h1>
          <p className="quiz-description">{quiz.description}</p>
        </div>
        <div className="timer-container">
          <Timer
            initialTimeSeconds={quiz.timeLimitMinutes * 60}
            onTimeUp={handleTimeUp}
            isActive={true}
          />
        </div>
      </div>

      <div className="quiz-progress-overview">
        <div className="progress-stats">
          <span>
            Odgovoreno: {getAnsweredQuestionsCount()} / {questions.length}
          </span>
          <span>Kategorija: {quiz.category}</span>
          <span>Težina: {quiz.difficulty}</span>
        </div>
      </div>

      <div className="quiz-content">
        <QuestionCard
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={questions.length}
          selectedAnswer={answers[currentQuestion.id]}
          onAnswerChange={handleAnswerChange}
        />

        <div className="quiz-navigation">
          <div className="nav-buttons">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="btn-secondary"
            >
              ← Prethodno
            </button>

            {currentQuestionIndex < questions.length - 1 ? (
              <button onClick={handleNextQuestion} className="btn-primary">
                Sledeće →
              </button>
            ) : (
              <button
                onClick={() => setShowConfirmSubmit(true)}
                className="btn-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Slanje..." : "Završi kviz"}
              </button>
            )}
          </div>

          <div className="question-indicators">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`indicator ${
                  index === currentQuestionIndex ? "current" : ""
                } ${answers[questions[index].id] ? "answered" : ""}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {showConfirmSubmit && (
        <div className="modal-overlay">
          <div className="confirmation-modal">
            <h3>Završi kviz?</h3>
            <p>
              Odgovorili ste na {getAnsweredQuestionsCount()} od{" "}
              {questions.length} pitanja.
            </p>
            <p>Da li ste sigurni da želite da završite kviz?</p>
            <div className="modal-buttons">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="btn-secondary"
                disabled={isSubmitting}
              >
                Otkaži
              </button>
              <button
                onClick={handleSubmitQuiz}
                className="btn-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Slanje..." : "Završi kviz"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuizTaking;
