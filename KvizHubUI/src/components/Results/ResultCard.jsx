import "./ResultCard.css";

function ResultCard({ result, onViewDetails, onRetakeQuiz, timeFormatted }) {
  const formatDate = (dateString) => {
    let date = new Date(dateString);

    // Ako datum nema timezone info, dodaj UTC
    if (
      typeof dateString === "string" &&
      !dateString.includes("Z") &&
      !dateString.includes("+")
    ) {
      date = new Date(dateString + "Z");
    }

    // Konvertuj u lokalno vreme
    return date.toLocaleDateString("sr-RS", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Belgrade", // Eksplicitno postavi Serbian timezone
    });
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 90) return "#10b981"; // Green
    if (percentage >= 80) return "#3b82f6"; // Blue
    if (percentage >= 70) return "#f59e0b"; // Yellow
    if (percentage >= 60) return "#ef4444"; // Red
    return "#dc2626"; // Dark red
  };

  const getGrade = (percentage) => {
    if (percentage >= 90) return "A";
    if (percentage >= 80) return "B";
    if (percentage >= 70) return "C";
    if (percentage >= 60) return "D";
    return "F";
  };

  const getRankSuffix = (rank) => {
    if (rank === 1) return "st";
    if (rank === 2) return "nd";
    if (rank === 3) return "rd";
    return "th";
  };

  return (
    <div className="result-card">
      <div className="result-header">
        <div className="quiz-info">
          <h3 className="quiz-title">{result.quizTitle}</h3>
          <span className="quiz-category">{result.quizCategory}</span>
        </div>
        <div className="result-date">{formatDate(result.dateTaken)}</div>
      </div>

      <div className="result-content">
        <div className="score-section">
          <div className="main-score">
            <div
              className="score-circle"
              style={{ borderColor: getScoreColor(result.percentage) }}
            >
              <span
                className="score-value"
                style={{ color: getScoreColor(result.percentage) }}
              >
                {result.percentage}%
              </span>
              <span className="score-grade">{getGrade(result.percentage)}</span>
            </div>
          </div>

          <div className="score-details">
            <div className="detail-item">
              <span className="detail-label">Tačni odgovori:</span>
              <span className="detail-value">
                {result.correctAnswers}/{result.totalQuestions}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Vreme rešavanja:</span>
              <span className="detail-value">{timeFormatted}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Rang:</span>
              <span className="detail-value rank">
                {result.rank}
                {getRankSuffix(result.rank)} od {result.totalParticipants}
              </span>
            </div>
          </div>
        </div>

        <div className="progress-bar-container">
          <div className="progress-label">
            <span>Uspešnost: {result.percentage}%</span>
            <span className="points">Bodovi: {result.score}</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${result.percentage}%`,
                backgroundColor: getScoreColor(result.percentage),
              }}
            ></div>
          </div>
        </div>
      </div>

      <div className="result-actions">
        <button onClick={onViewDetails} className="btn-secondary">
          Detaljni prikaz
        </button>
        <button onClick={onRetakeQuiz} className="btn-primary">
          🔄 Pokušaj ponovo
        </button>
      </div>
    </div>
  );
}

export default ResultCard;
