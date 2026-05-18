import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { userResultsService } from "../services/userResultsService";
import "./QuizResultDetail.css";

function QuizResultDetail() {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadResultDetail();
  }, [resultId]);

  const loadResultDetail = async () => {
    try {
      setLoading(true);
      const data = await userResultsService.getDetailedResult(resultId);
      console.log("QuizResultDetail received data:", data);
      console.log("🔍 UserAnswers count:", data?.userAnswers?.length || 0);
      if (data?.userAnswers?.length > 0) {
        console.log("Sample userAnswer:", data.userAnswers[0]);
      }
      setResult(data);
    } catch (err) {
      console.error("Error loading result detail:", err);
      setError("Greška pri učitavanju detaljnih rezultata");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return "#10b981";
    if (percentage >= 60) return "#f59e0b";
    return "#ef4444";
  };

  const getGrade = (percentage) => {
    if (percentage >= 90) return "A";
    if (percentage >= 80) return "B";
    if (percentage >= 70) return "C";
    if (percentage >= 60) return "D";
    return "F";
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const renderQuestionResult = (userAnswer, index) => {
    const isCorrect = userAnswer.isCorrect;

    return (
      <div
        key={userAnswer.id}
        className={`question-result ${isCorrect ? "correct" : "incorrect"}`}
      >
        <div className="question-header">
          <div className="question-number">Pitanje {index + 1}</div>
          <div
            className={`result-indicator ${
              isCorrect ? "correct" : "incorrect"
            }`}
          >
            {isCorrect ? "TAČNO" : "NETAČNO"}
          </div>
        </div>

        <div className="question-text">{userAnswer.questionText}</div>

        <div className="answers-section">
          <div className="user-answer">
            <strong>Vaš odgovor:</strong>
            <span className={isCorrect ? "correct-answer" : "wrong-answer"}>
              {formatUserAnswer(userAnswer)}
            </span>
          </div>

          {userAnswer.availableAnswers &&
            userAnswer.availableAnswers.length > 0 && (
              <div className="available-answers">
                <strong>Opcije:</strong>
                <div className="answer-options">
                  {userAnswer.availableAnswers.map((answer) => (
                    <div
                      key={answer.id}
                      className={`answer-option ${
                        answer.isCorrect ? "correct" : ""
                      } ${answer.wasSelected ? "selected" : ""}`}
                    >
                      {answer.text}
                      {answer.isCorrect && (
                        <span className="correct-mark">✓</span>
                      )}
                      {answer.wasSelected && (
                        <span className="selected-mark">●</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      </div>
    );
  };

  const getQuestionTypeLabel = (type) => {
    switch (type) {
      case "SingleChoice":
        return "Jedan tačan odgovor";
      case "MultipleChoice":
        return "Više tačnih odgovora";
      case "TrueFalse":
        return "Tačno/Netačno";
      case "FillInBlank":
        return "Unesite odgovor";
      default:
        return "Pitanje";
    }
  };

  const formatUserAnswer = (userAnswer) => {
    if (userAnswer.textAnswer) {
      return userAnswer.textAnswer;
    }

    if (userAnswer.selectedAnswerIds) {
      const selectedIds = userAnswer.selectedAnswerIds
        .split(",")
        .map((id) => parseInt(id.trim()));
      const selectedAnswers = userAnswer.availableAnswers
        .filter((answer) => selectedIds.includes(answer.id))
        .map((answer) => answer.text);

      if (selectedAnswers.length > 0) {
        return selectedAnswers.join(", ");
      }
    }

    return "Nema odgovora";
  };

  const formatAnswer = (answer, questionType) => {
    if (!answer) return "Nema odgovora";

    if (questionType === "FillInBlank") {
      return answer.submittedText || "Nema odgovora";
    }

    if (questionType === "TrueFalse") {
      return answer.selectedOptionIds?.[0] === "true" ? "Tačno" : "Netačno";
    }

    if (questionType === "MultipleChoice") {
      return answer.selectedOptions?.join(", ") || "Nema odgovora";
    }

    return answer.selectedOption || "Nema odgovora";
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Učitavanje detaljnih rezultata...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Greška</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/my-results")} className="back-button">
          Nazad na rezultate
        </button>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="error-container">
        <h2>Rezultat nije pronađen</h2>
        <button onClick={() => navigate("/my-results")} className="back-button">
          Nazad na rezultate
        </button>
      </div>
    );
  }

  const percentage = Math.round(
    (result.correctAnswers / result.totalQuestions) * 100
  );

  return (
    <div className="quiz-result-detail">
      <div className="result-header">
        <button onClick={() => navigate("/my-results")} className="back-button">
          ← Nazad na rezultate
        </button>

        <div className="result-summary">
          <h1>{result.quizTitle}</h1>
          <div className="result-stats">
            <div className="stat-card">
              <div
                className="stat-value"
                style={{ color: getScoreColor(percentage) }}
              >
                {percentage}%
              </div>
              <div className="stat-label">Uspešnost</div>
            </div>

            <div className="stat-card">
              <div className="stat-value">{getGrade(percentage)}</div>
              <div className="stat-label">Ocena</div>
            </div>

            <div className="stat-card">
              <div className="stat-value">
                {result.correctAnswers}/{result.totalQuestions}
              </div>
              <div className="stat-label">Tačni odgovori</div>
            </div>

            <div className="stat-card">
              <div className="stat-value">{formatTime(result.timeSpent)}</div>
              <div className="stat-label">Vreme</div>
            </div>

            <div className="stat-card">
              <div className="stat-value">{result.score}</div>
              <div className="stat-label">Bodovi</div>
            </div>
          </div>
        </div>
      </div>

      <div className="questions-review">
        <h2>Pregled pitanja i odgovora</h2>
        <div className="questions-list">
          {result.userAnswers &&
            result.userAnswers.map((userAnswer, index) =>
              renderQuestionResult(userAnswer, index)
            )}
        </div>
      </div>
    </div>
  );
}

export default QuizResultDetail;
