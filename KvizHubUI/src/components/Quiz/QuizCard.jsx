import "./QuizCard.css";

function QuizCard({ quiz, onStartQuiz }) {
  const getDifficultyColor = (difficulty) => {
    // Convert enum number to string or handle direct string values
    let difficultyStr;
    if (typeof difficulty === "number") {
      // Map enum values: 1=Beginner, 2=Intermediate, 3=Advanced
      switch (difficulty) {
        case 1:
          difficultyStr = "beginner";
          break;
        case 2:
          difficultyStr = "intermediate";
          break;
        case 3:
          difficultyStr = "advanced";
          break;
        default:
          difficultyStr = "unknown";
      }
    } else {
      difficultyStr = difficulty?.toLowerCase() || "unknown";
    }

    switch (difficultyStr) {
      case "beginner":
      case "easy":
      case "lako":
        return "#4caf50";
      case "intermediate":
      case "medium":
      case "srednje":
        return "#ff9800";
      case "advanced":
      case "hard":
      case "teško":
        return "#f44336";
      default:
        return "#757575";
    }
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}min`
      : `${hours}h`;
  };

  const getDifficultyText = (difficulty) => {
    if (typeof difficulty === "number") {
      switch (difficulty) {
        case 1:
          return "Beginner";
        case 2:
          return "Intermediate";
        case 3:
          return "Advanced";
        default:
          return "Unknown";
      }
    }
    return difficulty || "Unknown";
  };

  return (
    <div className="quiz-card">
      <div className="quiz-card-header">
        <h3 className="quiz-title">{quiz.title}</h3>
        <span
          className="quiz-difficulty"
          style={{ backgroundColor: getDifficultyColor(quiz.difficulty) }}
        >
          {getDifficultyText(quiz.difficulty)}
        </span>
      </div>

      <p className="quiz-description">{quiz.description}</p>

      <div className="quiz-details">
        <div className="quiz-detail-item">
          <span className="detail-label">Pitanja:</span>
          <span className="detail-value">{quiz.questionCount}</span>
        </div>
        <div className="quiz-detail-item">
          <span className="detail-label">Vreme:</span>
          <span className="detail-value">{formatDuration(quiz.timeLimit)}</span>
        </div>
        {quiz.category && (
          <div className="quiz-detail-item">
            <span className="detail-label">Kategorija:</span>
            <span className="detail-value">{quiz.category}</span>
          </div>
        )}
      </div>

      <button
        className="start-quiz-button"
        onClick={() => onStartQuiz(quiz.id)}
      >
        Započni kviz
      </button>
    </div>
  );
}

export default QuizCard;
