import { useEffect, useState } from "react";
import "./ResultsFilters.css";

function ResultsFilters({ onFiltersChange, activeFilters, results }) {
  const [filters, setFilters] = useState(activeFilters);

  useEffect(() => {
    setFilters(activeFilters);
  }, [activeFilters]);

  const dateRanges = [
    { value: "", label: "Sva vremena" },
    { value: "lastMonth", label: "Poslednji mesec" },
    { value: "last3Months", label: "Poslednja 3 meseca" },
    { value: "lastYear", label: "Poslednja godina" },
  ];

  // Dobijanje unikatnih kvizova koje je korisnik rešavao
  const solvedQuizzes = results.reduce((acc, result) => {
    if (!acc.find((quiz) => quiz.id === result.quizId)) {
      acc.push({
        id: result.quizId,
        title: result.quizTitle,
      });
    }
    return acc;
  }, []);

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = { category: "", dateRange: "", quizId: "" };
    setFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const activeFiltersCount = Object.values(filters).filter(
    (value) => value
  ).length;

  return (
    <div className="results-filters">
      <div className="filters-header">
        <h3>Filteri</h3>
        {activeFiltersCount > 0 && (
          <button onClick={clearFilters} className="clear-filters-btn">
            Obriši sve ({activeFiltersCount})
          </button>
        )}
      </div>

      <div className="filters-grid">
        <div className="filter-group">
          <label htmlFor="category-filter" className="filter-label">
            Kategorija
          </label>
          <select
            id="category-filter"
            value={filters.category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
            className="filter-select"
          >
            <option value="">Sve kategorije</option>
            {/* Kategorije će se učitati dinamički iz backend-a */}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="date-filter" className="filter-label">
            Vremenski period
          </label>
          <select
            id="date-filter"
            value={filters.dateRange}
            onChange={(e) => handleFilterChange("dateRange", e.target.value)}
            className="filter-select"
          >
            {dateRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="quiz-filter" className="filter-label">
            Specifičan kviz
          </label>
          <select
            id="quiz-filter"
            value={filters.quizId}
            onChange={(e) => handleFilterChange("quizId", e.target.value)}
            className="filter-select"
          >
            <option value="">Svi kvizovi</option>
            {solvedQuizzes.map((quiz) => (
              <option key={quiz.id} value={quiz.id}>
                {quiz.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeFiltersCount > 0 && (
        <div className="active-filters">
          <span className="active-filters-label">Aktivni filteri:</span>
          <div className="active-filters-list">
            {filters.category && (
              <span className="filter-tag">
                {filters.category}
                <button
                  onClick={() => handleFilterChange("category", "")}
                  className="remove-filter"
                >
                  ×
                </button>
              </span>
            )}
            {filters.dateRange && (
              <span className="filter-tag">
                {dateRanges.find((r) => r.value === filters.dateRange)?.label}
                <button
                  onClick={() => handleFilterChange("dateRange", "")}
                  className="remove-filter"
                >
                  ×
                </button>
              </span>
            )}
            {filters.quizId && (
              <span className="filter-tag">
                {
                  solvedQuizzes.find((q) => q.id.toString() === filters.quizId)
                    ?.title
                }
                <button
                  onClick={() => handleFilterChange("quizId", "")}
                  className="remove-filter"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ResultsFilters;
