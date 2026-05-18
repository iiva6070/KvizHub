import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ResultCard from "../components/Results/ResultCard";
import ResultsFilters from "../components/Results/ResultsFilters";
import UserStatsOverview from "../components/Results/UserStatsOverview";
import { isAuthenticated } from "../services/authService";
import { userResultsService } from "../services/userResultsService";
import "./UserResults.css";

function UserResults() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    category: "",
    dateRange: "",
    quizId: "",
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    loadUserResults();
    loadUserStats();
  }, [navigate]);

  const loadUserResults = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const userResults = await userResultsService.getUserResults();
      console.log("🕒 User results data:", userResults); // Debug log da vidimo timeSpent
      setResults(userResults);
      setFilteredResults(userResults);
    } catch (err) {
      console.error("Error loading user results:", err);
      setError("Greška pri učitavanju rezultata. Molimo pokušajte ponovo.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      const stats = await userResultsService.getUserStats();
      setUserStats(stats);
    } catch (err) {
      console.error("Error loading user stats:", err);
    }
  };

  const handleFiltersChange = async (filters) => {
    try {
      setActiveFilters(filters);
      setIsLoading(true);

      const filtered = await userResultsService.getFilteredUserResults(filters);
      setFilteredResults(filtered);
    } catch (err) {
      console.error("Error filtering results:", err);
      setError("Greška pri filtriranju rezultata.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (resultId) => {
    navigate(`/my-results/${resultId}`);
  };

  const handleRetakeQuiz = (quizId) => {
    navigate(`/quiz/${quizId}`);
  };

  const formatTimeSpent = (seconds) => {
    if (!seconds || seconds === 0) return "0s";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  if (isLoading && !filteredResults.length) {
    return (
      <div className="user-results loading">
        <div className="loading-spinner"></div>
        <p>Učitavanje rezultata...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-results error">
        <div className="error-message">
          <h2>Greška</h2>
          <p>{error}</p>
          <button onClick={loadUserResults} className="btn-primary">
            Pokušaj ponovo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-results">
      <div className="page-header">
        <h1>Moji rezultati</h1>
        <p className="page-description">
          Pregled svih kvizova koje ste rešavali sa detaljnim rezultatima i
          statistikama
        </p>
      </div>

      {userStats && (
        <UserStatsOverview
          stats={userStats}
          totalTimeFormatted={formatTimeSpent(userStats.totalTimeSpent)}
        />
      )}

      <div className="results-content">
        <div className="filters-section">
          <ResultsFilters
            onFiltersChange={handleFiltersChange}
            activeFilters={activeFilters}
            results={results}
          />
        </div>

        <div className="results-section">
          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner small"></div>
              <span>Filtriranje rezultata...</span>
            </div>
          ) : filteredResults.length > 0 ? (
            <>
              <div className="results-header">
                <h3>
                  {filteredResults.length === results.length
                    ? `Svi rezultati (${filteredResults.length})`
                    : `Filtrirani rezultati (${filteredResults.length} od ${results.length})`}
                </h3>
              </div>

              <div className="results-grid">
                {filteredResults.map((result) => (
                  <ResultCard
                    key={result.id}
                    result={result}
                    onViewDetails={() => handleViewDetails(result.id)}
                    onRetakeQuiz={() => handleRetakeQuiz(result.quizId)}
                    timeFormatted={formatTimeSpent(result.timeSpent)}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="no-results">
              <div className="no-results-icon">Stats</div>
              <h3>Nema rezultata</h3>
              <p>
                {Object.values(activeFilters).some((filter) => filter)
                  ? "Nema rezultata koji odgovaraju izabranim filterima."
                  : "Još uvek niste rešavali kvizove."}
              </p>
              <button
                onClick={() => navigate("/quiz-browser")}
                className="btn-primary"
              >
                Pregledaj kvizove
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserResults;
