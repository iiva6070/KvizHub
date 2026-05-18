import { useEffect, useState } from "react";
import { adminService } from "../../services/adminService";
import "./AdminStats.css";

function AdminStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getAdminStats();
      console.log("API response:", data); // Debug log

      // Osiguraj da su svi podaci postavljeni
      const statsWithDefaults = {
        totalUsers: data.totalUsers || 0,
        totalQuizzes: data.totalQuizzes || 0,
        totalQuestions: data.totalQuestions || 0,
        totalAttempts: data.totalAttempts || 0,
        averageScore: data.averageScore || 0,
        activeUsers: data.activeUsers || 0,
        recentAttempts: data.recentAttempts || 0,
        // Koristimo podatke iz backend-a
        categoryStats: data.categoryStats || [],
        topUsers: data.topUsers || [],
      };

      setStats(statsWithDefaults);
    } catch (err) {
      console.error("Error loading stats:", err);
      setError("Greška pri učitavanju statistika: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="stats-loading">
        <div className="loading-spinner"></div>
        <p>Učitavanje statistika...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stats-error">
        <h3>Greška</h3>
        <p>{error}</p>
        <button onClick={loadStats} className="retry-button">
          Pokušaj ponovo
        </button>
      </div>
    );
  }

  if (!stats) {
    return <div>Nema podataka</div>;
  }

  return (
    <div className="admin-stats">
      <div className="stats-header">
        <h2>Statistike platforme</h2>
        <p>Pregled ključnih metrika QuizHub aplikacije</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">👨‍💼</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalUsers}</div>
            <div className="stat-label">Ukupno korisnika</div>
          </div>
        </div>

        <div className="stat-card secondary">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalQuizzes}</div>
            <div className="stat-label">Ukupno kvizova</div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">❓</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalQuestions}</div>
            <div className="stat-label">Ukupno pitanja</div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalAttempts}</div>
            <div className="stat-label">Ukupno pokušaja</div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">
              {parseFloat(stats.averageScore).toFixed(2)}%
            </div>
            <div className="stat-label">Prosečan rezultat</div>
          </div>
        </div>

        <div className="stat-card accent">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <div className="stat-value">{stats.activeUsers}</div>
            <div className="stat-label">Aktivni korisnici</div>
          </div>
        </div>
      </div>

      <div className="stats-details">
        <div className="detail-section">
          <h3>Statistike po kategorijama</h3>
          <div className="category-stats">
            {stats.categoryStats && stats.categoryStats.length > 0 ? (
              stats.categoryStats.map((category) => (
                <div key={category.name} className="category-item">
                  <div className="category-header">
                    <span className="category-name">{category.name}</span>
                    <span className="category-count">
                      {category.quizCount} kvizova
                    </span>
                  </div>
                  <div className="category-bar">
                    <div
                      className="category-fill"
                      style={{
                        width: `${(category.attempts / 100) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <div className="category-score">
                    Prosek: {category.averageScore}%
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data-message">
                <p>Nema dostupnih podataka o kategorijama.</p>
                <p>
                  <small>
                    Podaci će biti dostupni kada se kvizovi budu kreirati i
                    klasifikovati po kategorijama.
                  </small>
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="detail-section">
          <h3>Top korisnici</h3>
          <div className="top-users">
            {stats.topUsers && stats.topUsers.length > 0 ? (
              stats.topUsers.map((user, index) => (
                <div key={user.id} className="user-item">
                  <div className="user-rank">#{index + 1}</div>
                  <div className="user-info">
                    <div className="user-name">{user.name}</div>
                    <div className="user-stats">
                      {user.completedQuizzes} kvizova | Prosek:{" "}
                      {user.averageScore}%
                    </div>
                  </div>
                  <div className="user-score">{user.totalScore} bodova</div>
                </div>
              ))
            ) : (
              <div className="no-data-message">
                <p>Nema dostupnih podataka o korisnicima.</p>
                <p>
                  <small>
                    Podaci će biti dostupni kada korisnici počnu da rešavaju
                    kvizove.
                  </small>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminStats;
