import { useLocation, useNavigate } from "react-router-dom";
import "./QuizResults.css";

function QuizResults() {
  const location = useLocation();
  const navigate = useNavigate();

  const { result, quiz, questions } = location.state || {};

  console.log(" Quiz result data:", result);
  console.log(" Quiz result JSON:", JSON.stringify(result, null, 2));
  console.log(" Quiz data:", quiz);
  console.log(" Questions data:", questions);

  if (!result || !quiz) {
    return (
      <div className="quiz-results-container error">
        <h2>Rezultati nisu dostupni</h2>
        <p>Došlo je do greške pri učitavanju rezultata kviza.</p>
        <button onClick={() => navigate("/")} className="btn-primary">
          Vrati se na početnu
        </button>
      </div>
    );
  }

  const score = result.score || 0;
  const totalQuestions = result.totalQuestions || questions?.length || 0;
  const correctAnswers = result.correctAnswers || 0;
  const percentage = result.percentage || 0;

  let timeSpentSeconds = 0;
  if (result.timeSpent) {
    const timeParts = result.timeSpent.split(":");
    if (timeParts.length === 3) {
      const hours = parseInt(timeParts[0]) || 0;
      const minutes = parseInt(timeParts[1]) || 0;
      const seconds = parseInt(timeParts[2]) || 0;
      timeSpentSeconds = hours * 3600 + minutes * 60 + seconds;
    }
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const userAnswersMap = {};
  if (result.userAnswers && Array.isArray(result.userAnswers)) {
    result.userAnswers.forEach((ua) => {
      userAnswersMap[ua.questionId] = ua;
    });
  }

  const getAnswerClassName = (question, answer) => {
    // Pronađi UserAnswer iz backend podataka
    const userAnswer = result.userAnswers?.find(
      (ua) => ua.questionId === question.id
    );

    if (!userAnswer || !userAnswer.availableAnswers) {
      return answer.isCorrect ? "correct" : "";
    }

    const backendAnswer = userAnswer.availableAnswers.find(
      (a) => a.id === answer.id
    );

    if (!backendAnswer) {
      return answer.isCorrect ? "correct" : "";
    }

    const isCorrect = backendAnswer.isCorrect;
    const wasSelected = backendAnswer.wasSelected;

    if (isCorrect && wasSelected) return "correct selected";
    if (isCorrect && !wasSelected) return "correct";
    if (!isCorrect && wasSelected) return "incorrect selected";
    return "";
  };

  return (
    <div className="quiz-results-container">
      <div className="results-header">
        <h1>Rezultati za: {quiz.title}</h1>
        <p>{quiz.description}</p>
      </div>

      <div className="results-summary-grid">
        <div className="summary-card">
          <h3>Ukupan rezultat</h3>
          <p className="score">
            {score} / {totalQuestions * 10}
          </p>
        </div>
        <div className="summary-card">
          <h3>Tačni odgovori</h3>
          <p className="correct">
            {correctAnswers} / {totalQuestions}
          </p>
        </div>
        <div className="summary-card">
          <h3>Procenat</h3>
          <p className="percentage">{percentage.toFixed(2)}%</p>
        </div>
        <div className="summary-card">
          <h3>Vreme</h3>
          <p className="time">{formatTime(timeSpentSeconds)}</p>
        </div>
      </div>

      <div className="detailed-answers">
        <h2>Detaljan pregled odgovora</h2>
        {questions && questions.length > 0 ? (
          questions.map((question, index) => {
            const userAnswer = userAnswersMap[question.id];
            return (
              <div key={question.id} className="question-review">
                <h4>
                  {index + 1}. {question.text}
                </h4>
                {question.type !== "FillInTheBlank" && (
                  <ul className="answers-review">
                    {question.answers &&
                      question.answers.map((answer) => {
                        const className = getAnswerClassName(question, answer);
                        return (
                          <li
                            key={answer.id}
                            className={`answer-item ${className}`}
                          >
                            {answer.text}
                            {answer.isCorrect && (
                              <span className="correct-indicator"> ✓</span>
                            )}
                            {userAnswer &&
                              (userAnswer.selectedAnswerIds ===
                                answer.id.toString() ||
                                userAnswer.selectedAnswerIds.includes(
                                  answer.id.toString()
                                ) ||
                                userAnswer.answerId === answer.id) && (
                                <span className="user-choice">
                                  {" "}
                                  (Vaš izbor)
                                </span>
                              )}
                          </li>
                        );
                      })}
                  </ul>
                )}
                {userAnswer && (
                  <div className="answer-explanation">
                    <p>
                      <strong>Vaš odgovor:</strong>{" "}
                      {/* Za FillInTheBlank pitanja */}
                      {question.type === "FillInTheBlank" ||
                      question.type === "FillInBlank"
                        ? userAnswer.textAnswer || "Nije odgovoreno"
                        : /* Za ostale tipove pitanja */
                          question.answers.find(
                            (a) =>
                              userAnswer.selectedAnswerIds ===
                                a.id.toString() ||
                              userAnswer.selectedAnswerIds?.includes(
                                a.id.toString()
                              ) ||
                              userAnswer.answerId === a.id
                          )?.text || "Nije odgovoreno"}
                    </p>
                    <p>
                      <strong>Tačan odgovor:</strong>{" "}
                      {/* Za FillInTheBlank pitanja */}
                      {question.type === "FillInTheBlank" ||
                      question.type === "FillInBlank"
                        ? question.correctAnswer || "Nije definisan"
                        : /* Za ostale tipove pitanja */
                          question.answers
                            .filter((a) => a.isCorrect)
                            .map((a) => a.text)
                            .join(", ") || "Nije definisan"}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="no-questions">
            <p>Detaljan pregled pitanja nije dostupan.</p>
          </div>
        )}
      </div>

      <div className="results-actions">
        <button onClick={() => navigate("/")} className="btn-secondary">
          Početna stranica
        </button>
        <button
          onClick={() => navigate(`/quiz/${quiz.id}`)}
          className="btn-primary"
        >
          Igraj ponovo
        </button>
      </div>
    </div>
  );
}

export default QuizResults;
