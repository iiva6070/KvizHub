import { useState } from "react";
import "./QuizFilters.css";

function QuizFilters({ onFiltersChange, categories = [] }) {
  // Debug log za kategorije
  console.log("QuizFilters received categories:", categories);

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    difficulty: "",
  });

  const difficulties = [
    { value: "", label: "Sve težine" },
    { value: "beginner", label: "Početnik" },
    { value: "intermediate", label: "Srednji" },
    { value: "advanced", label: "Napredni" },
  ];

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = { search: "", category: "", difficulty: "" };
    setFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  return (
    <div className="quiz-filters">
      <div className="filters-row">
        <div className="search-container">
          <input
            type="text"
            placeholder="Pretraži kvizove..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <select
          value={filters.category}
          onChange={(e) => handleFilterChange("category", e.target.value)}
          className="filter-select"
        >
          <option value="">Sve kategorije</option>
          {categories
            .filter((category, index, self) => {
              // Remove duplicates based on name
              const categoryName = category.name || category;
              return (
                index === self.findIndex((c) => (c.name || c) === categoryName)
              );
            })
            .map((category, index) => {
              const categoryName = category.name || category;
              const categoryId = category.id || index;
              return (
                <option
                  key={`category-${categoryId}-${categoryName}`}
                  value={categoryName}
                >
                  {categoryName}
                </option>
              );
            })}
        </select>

        <select
          value={filters.difficulty}
          onChange={(e) => handleFilterChange("difficulty", e.target.value)}
          className="filter-select"
        >
          {difficulties.map((difficulty) => (
            <option key={difficulty.value} value={difficulty.value}>
              {difficulty.label}
            </option>
          ))}
        </select>

        <button onClick={clearFilters} className="clear-filters-button">
          Obriši filtere
        </button>
      </div>
    </div>
  );
}

export default QuizFilters;
