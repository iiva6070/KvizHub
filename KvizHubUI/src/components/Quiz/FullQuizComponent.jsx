import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const SuperSimpleQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [attemptId, setAttemptId] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [results, setResults] = useState(null);

  // Timer effect
  useEffect(() => {
    if (quizStarted && timeLeft > 0 && !quizCompleted) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && quizStarted && !quizCompleted) {
      // Auto-submit when time runs out
      handleSubmitQuiz();
    }
  }, [timeLeft, quizStarted, quizCompleted]);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        console.log("Fetching quiz data for quizId:", quizId);

        // Fetch basic quiz info
        const quizResponse = await fetch(
          `http://localhost:5232/api/quiz/${quizId}`
        );
        console.log("Quiz response status:", quizResponse.status);

        if (!quizResponse.ok) {
          throw new Error(`Quiz fetch failed: ${quizResponse.status}`);
        }

        const quizData = await quizResponse.json();
        console.log("Quiz data:", quizData);
        setQuiz(quizData);

        // Fetch questions
        const questionsResponse = await fetch(
          `http://localhost:5232/api/quiz/${quizId}/questions`
        );
        console.log("Questions response status:", questionsResponse.status);

        if (!questionsResponse.ok) {
          throw new Error(
            `Questions fetch failed: ${questionsResponse.status}`
          );
        }

        const questionsData = await questionsResponse.json();
        console.log("Questions data:", questionsData);
        setQuestions(questionsData.questions || questionsData);
      } catch (err) {
        console.error("Error fetching quiz:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      fetchQuizData();
    }
  }, [quizId]);

  const handleStartQuiz = async () => {
    try {
      // Note: This would require authentication in real app
      const response = await fetch(
        "http://localhost:5291/api/quizattempt/start",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // 'Authorization': `Bearer ${token}` // Would need JWT token
          },
          body: JSON.stringify({ quizId: parseInt(quizId) }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to start quiz - authentication required");
      }

      const attemptData = await response.json();
      setAttemptId(attemptData.id);
      setQuizStarted(true);
      setTimeLeft(quiz.durationMinutes * 60); // Convert to seconds
    } catch (err) {
      console.error("Error starting quiz:", err);
      // For demo, start without backend
      setQuizStarted(true);
      setTimeLeft(quiz.durationMinutes * 60);
      setAttemptId(999); // Dummy ID
    }
  };

  const handleAnswerSelect = (questionId, answerId) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    try {
      // Prepare submission data
      const userAnswersList = Object.entries(userAnswers).map(
        ([questionId, answerId]) => ({
          questionId: parseInt(questionId),
          answerId: parseInt(answerId),
        })
      );

      console.log("Submitting quiz with answers:", userAnswersList);

      // Calculate results locally for demo
      let score = 0;
      let totalPoints = 0;

      questions.forEach((question) => {
        totalPoints += question.points;
        const selectedAnswerId = userAnswers[question.id];
        if (selectedAnswerId) {
          const selectedAnswer = question.answers?.find(
            (a) => a.id === parseInt(selectedAnswerId)
          );
          if (selectedAnswer?.isCorrect) {
            score += question.points;
          }
        }
      });

      const percentage =
        totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;

      setResults({
        score,
        totalPoints,
        percentage,
        answeredQuestions: Object.keys(userAnswers).length,
        totalQuestions: questions.length,
      });

      setQuizCompleted(true);
    } catch (err) {
      console.error("Error submitting quiz:", err);
      setError("Failed to submit quiz: " + err.message);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (loading) return <div>Loading quiz...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;
  if (!quiz) return <div>Quiz not found</div>;

  // Quiz completed - show results
  if (quizCompleted && results) {
    return (
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <h1>Quiz Completed!</h1>
        <div
          style={{
            border: "2px solid #4CAF50",
            borderRadius: "10px",
            padding: "30px",
            backgroundColor: "#f9fff9",
            margin: "20px 0",
          }}
        >
          <h2>Your Results</h2>
          <div style={{ fontSize: "24px", margin: "20px 0" }}>
            <strong>
              {results.score} / {results.totalPoints} points
            </strong>
          </div>
          <div
            style={{
              fontSize: "20px",
              color: results.percentage >= 70 ? "green" : "red",
            }}
          >
            {results.percentage}%
          </div>
          <p>
            Questions answered: {results.answeredQuestions} /{" "}
            {results.totalQuestions}
          </p>
        </div>

        <button
          onClick={() => navigate("/quiz-browser")}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          Back to Quiz Browser
        </button>

        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Take Quiz Again
        </button>
      </div>
    );
  }

  // Quiz not started yet - show info and start button
  if (!quizStarted) {
    return (
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
        <h1>{quiz.title}</h1>
        <p>{quiz.description}</p>

        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "20px",
            margin: "20px 0",
            backgroundColor: "#f8f9fa",
          }}
        >
          <h3>Quiz Information</h3>
          <p>
            <strong>Duration:</strong> {quiz.durationMinutes} minutes
          </p>
          <p>
            <strong>Questions:</strong> {questions.length}
          </p>
          <p>
            <strong>Total Points:</strong>{" "}
            {questions.reduce((sum, q) => sum + q.points, 0)}
          </p>
        </div>

        <button
          onClick={handleStartQuiz}
          style={{
            padding: "15px 30px",
            fontSize: "18px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Start Quiz
        </button>
      </div>
    );
  }

  // Quiz in progress
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      {/* Header with timer and progress */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          padding: "10px",
          backgroundColor: "#f8f9fa",
          borderRadius: "5px",
        }}
      >
        <h2>{quiz.title}</h2>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              color: timeLeft < 300 ? "red" : "black",
            }}
          >
            Time: {formatTime(timeLeft)}
          </div>
          <div>
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          width: "100%",
          backgroundColor: "#e0e0e0",
          borderRadius: "10px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
            height: "8px",
            backgroundColor: "#007bff",
            borderRadius: "10px",
          }}
        ></div>
      </div>

      {/* Current question */}
      {currentQuestion && (
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "20px",
            marginBottom: "20px",
          }}
        >
          <h3>Question {currentQuestionIndex + 1}</h3>
          <p style={{ fontSize: "18px", marginBottom: "15px" }}>
            {currentQuestion.text}
          </p>
          <p style={{ color: "#666", marginBottom: "20px" }}>
            <strong>Points:</strong> {currentQuestion.points}
          </p>

          <div>
            {currentQuestion.answers?.map((answer) => (
              <div
                key={answer.id}
                style={{
                  margin: "10px 0",
                  padding: "12px",
                  border: "2px solid #ddd",
                  borderRadius: "5px",
                  cursor: "pointer",
                  backgroundColor:
                    userAnswers[currentQuestion.id] === answer.id
                      ? "#e3f2fd"
                      : "white",
                  borderColor:
                    userAnswers[currentQuestion.id] === answer.id
                      ? "#2196F3"
                      : "#ddd",
                }}
                onClick={() =>
                  handleAnswerSelect(currentQuestion.id, answer.id)
                }
              >
                <label style={{ cursor: "pointer", display: "block" }}>
                  <input
                    type="radio"
                    name={`question_${currentQuestion.id}`}
                    value={answer.id}
                    checked={userAnswers[currentQuestion.id] === answer.id}
                    onChange={() =>
                      handleAnswerSelect(currentQuestion.id, answer.id)
                    }
                    style={{ marginRight: "10px" }}
                  />
                  {answer.text}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "20px",
        }}
      >
        <button
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: currentQuestionIndex === 0 ? "#ccc" : "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: currentQuestionIndex === 0 ? "not-allowed" : "pointer",
          }}
        >
          Previous
        </button>

        <div style={{ textAlign: "center" }}>
          <p>
            Answered: {Object.keys(userAnswers).length} / {questions.length}
          </p>
          {Object.keys(userAnswers).length === questions.length && (
            <button
              onClick={handleSubmitQuiz}
              style={{
                padding: "12px 25px",
                fontSize: "16px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Submit Quiz
            </button>
          )}
        </div>

        <button
          onClick={handleNextQuestion}
          disabled={currentQuestionIndex === questions.length - 1}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor:
              currentQuestionIndex === questions.length - 1
                ? "#ccc"
                : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor:
              currentQuestionIndex === questions.length - 1
                ? "not-allowed"
                : "pointer",
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SuperSimpleQuiz;
