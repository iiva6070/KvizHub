import { useEffect, useState } from "react";
import { leaderboardService } from "../services/leaderboardService";
import "./Leaderboard.css";

function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    period: "all-time", // "weekly", "monthly", "all-time"
    quizId: "",
    category: "",
  });

  useEffect(() => {
    loadLeaderboard();
  }, [filters]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await leaderboardService.getLeaderboard(filters);
      setLeaderboardData(data);
    } catch (err) {
      setError("Greška pri učitavanju rang liste");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const getMedalIcon = (position) => {
    switch (position) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return `#${position}`;
    }
  };

  const formatScore = (score) => {
    return score.toLocaleString();
  };

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

    return date.toLocaleDateString("sr-RS", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Belgrade",
    });
  };

  const getPeriodLabel = (period) => {
    switch (period) {
      case "weekly":
        return "Nedeljno";
      case "monthly":
        return "Mesečno";
      case "all-time":
        return "Svih vremena";
      default:
        return period;
    }
  };

  if (loading) {
    return (
      <div className="leaderboard-loading">
        <div className="loading-spinner"></div>
        <p>Učitavanje rang liste...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="leaderboard-error">
        <h2>Greška</h2>
        <p>{error}</p>
        <button onClick={loadLeaderboard} className="retry-button">
          Pokušaj ponovo
        </button>
      </div>
    );
  }

  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <div className="header-content">
          <h1> Globalna rang lista</h1>
          <p>Najbolji rezultati naših korisnika</p>
        </div>

        <div className="leaderboard-filters">
          <div className="filter-group">
            <label htmlFor="period">Period:</label>
            <select
              id="period"
              value={filters.period}
              onChange={(e) => handleFilterChange("period", e.target.value)}
              className="filter-select"
            >
              <option value="all-time">Svih vremena</option>
              <option value="monthly">Ovaj mesec</option>
              <option value="weekly">Ova nedelja</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="category">Kategorija:</label>
            <select
              id="category"
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="filter-select"
            >
              <option value="">Sve kategorije</option>
              <option value="Programiranje">Programiranje</option>
              <option value="Matematika">Matematika</option>
              <option value="Istorija">Istorija</option>
              <option value="Geografija">Geografija</option>
              <option value="Nauka">Nauka</option>
            </select>
          </div>
        </div>
      </div>

      <div className="leaderboard-content">
        <div className="leaderboard-info">
          <h2>Top rezultati - {getPeriodLabel(filters.period)}</h2>
          <p>Ukupno {leaderboardData.length} rezultata</p>
        </div>

        {leaderboardData.length === 0 ? (
          <div className="no-results">
            <p>Nema rezultata za izabrane filtere.</p>
          </div>
        ) : (
          <div className="leaderboard-table">
            <div className="table-header">
              <div className="header-rank">Pozicija</div>
              <div className="header-user">Korisnik</div>
              <div className="header-quiz">Kviz</div>
              <div className="header-score">Rezultat</div>
              <div className="header-percentage">Procenat</div>
              <div className="header-date">Datum</div>
            </div>

            <div className="table-body">
              {leaderboardData.map((entry, index) => (
                <div
                  key={`${entry.userId}-${entry.quizId}-${entry.dateTaken}`}
                  className={`table-row ${index < 3 ? "top-three" : ""} ${
                    entry.isCurrentUser ? "current-user" : ""
                  }`}
                >
                  <div className="cell-rank">
                    <span className="rank-badge">
                      {getMedalIcon(index + 1)}
                    </span>
                  </div>

                  <div className="cell-user">
                    <div className="user-info">
                      <div className="user-avatar">
                        {entry.userName.charAt(0).toUpperCase()}
                      </div>
                      <div className="user-details">
                        <div className="user-name">
                          {entry.userName}
                          {entry.isCurrentUser && (
                            <span className="you-badge">Vi</span>
                          )}
                        </div>
                        <div className="user-level">
                          Nivo {entry.userLevel || 1}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="cell-quiz">
                    <div className="quiz-info">
                      <div className="quiz-title">{entry.quizTitle}</div>
                      <div className="quiz-category">{entry.quizCategory}</div>
                    </div>
                  </div>

                  <div className="cell-score">
                    <div className="score-display">
                      {formatScore(entry.score)} bodova
                    </div>
                  </div>

                  <div className="cell-percentage">
                    <div className="percentage-display">
                      <div className="percentage-bar">
                        <div
                          className="percentage-fill"
                          style={{
                            width: `${entry.percentage}%`,
                            backgroundColor:
                              entry.percentage >= 80
                                ? "#10b981"
                                : entry.percentage >= 60
                                ? "#f59e0b"
                                : "#ef4444",
                          }}
                        ></div>
                      </div>
                      <span className="percentage-text">
                        {entry.percentage}%
                      </span>
                    </div>
                  </div>

                  <div className="cell-date">
                    <div className="date-display">
                      {formatDate(entry.dateTaken)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Leaderboard;
