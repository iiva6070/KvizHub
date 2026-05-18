import "./UserStatsOverview.css";

function UserStatsOverview({ stats, totalTimeFormatted }) {
  const getScoreColor = (score) => {
    if (score >= 90) return "#10b981";
    if (score >= 80) return "#3b82f6";
    if (score >= 70) return "#f59e0b";
    if (score >= 60) return "#ef4444";
    return "#dc2626";
  };

  return (
    <div className="user-stats-overview">
      <h2>Pregled statistika</h2>

      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <div className="stat-value">
              {parseFloat(stats.averageScore).toFixed(2)}%
            </div>
            <div className="stat-label">Prosečan rezultat</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <div className="stat-value">{stats.bestScore}%</div>
            <div className="stat-label">Najbolji rezultat</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalQuizzes}</div>
            <div className="stat-label">Ukupno kvizova</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">❓</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalQuestions}</div>
            <div className="stat-label">Ukupno pitanja</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalCorrect}</div>
            <div className="stat-label">Tačni odgovori</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <div className="stat-value">{totalTimeFormatted}</div>
            <div className="stat-label">Ukupno vreme</div>
          </div>
        </div>
      </div>

      {stats.categoryStats && Object.keys(stats.categoryStats).length > 0 && (
        <div className="category-stats">
          <h3>Statistike po kategorijama</h3>
          <div className="category-grid">
            {Object.entries(stats.categoryStats).map(
              ([category, categoryData]) => (
                <div key={category} className="category-card">
                  <div className="category-header">
                    <h4>{category}</h4>
                    <span className="category-count">
                      {categoryData.count} kvizova
                    </span>
                  </div>
                  <div className="category-content">
                    <div className="category-stat">
                      <span className="category-stat-label">Prosek:</span>
                      <span
                        className="category-stat-value"
                        style={{
                          color: getScoreColor(categoryData.averageScore),
                        }}
                      >
                        {categoryData.averageScore}%
                      </span>
                    </div>
                    <div className="category-stat">
                      <span className="category-stat-label">Najbolji:</span>
                      <span
                        className="category-stat-value"
                        style={{ color: getScoreColor(categoryData.bestScore) }}
                      >
                        {categoryData.bestScore}%
                      </span>
                    </div>
                  </div>
                  <div className="category-progress">
                    <div
                      className="category-progress-bar"
                      style={{
                        width: `${categoryData.averageScore}%`,
                        backgroundColor: getScoreColor(
                          categoryData.averageScore
                        ),
                      }}
                    ></div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default UserStatsOverview;
