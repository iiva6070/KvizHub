import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import QuizFilters from "../components/Quiz/QuizFilters";
import QuizList from "../components/Quiz/QuizList";
import { isAuthenticated } from "../services/authService";
import { getAllCategories, getAllQuizzes } from "../services/quizService";

function QuizBrowser() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [quizzesData, categoriesData] = await Promise.all([
        getAllQuizzes(),
        getAllCategories(),
      ]);

      setQuizzes(quizzesData);
      setFilteredQuizzes(quizzesData);
      setCategories(categoriesData);
    } catch (err) {
      setError("Greška pri učitavanju kvizova.");
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = async (filters) => {
    try {
      setLoading(true);

      if (!filters.search && !filters.category && !filters.difficulty) {
        setFilteredQuizzes(quizzes);
      } else {
        const filtered = quizzes.filter((quiz) => {
          const matchesSearch =
            !filters.search ||
            quiz.title.toLowerCase().includes(filters.search.toLowerCase()) ||
            quiz.description
              .toLowerCase()
              .includes(filters.search.toLowerCase());

          const matchesCategory =
            !filters.category || quiz.categoryName === filters.category;

          let quizDifficulty;
          if (typeof quiz.difficulty === "number") {
            switch (quiz.difficulty) {
              case 1:
                quizDifficulty = "beginner";
                break;
              case 2:
                quizDifficulty = "intermediate";
                break;
              case 3:
                quizDifficulty = "advanced";
                break;
              default:
                quizDifficulty = "";
            }
          } else {
            quizDifficulty = quiz.difficulty?.toLowerCase() || "";
          }

          const matchesDifficulty =
            !filters.difficulty ||
            quizDifficulty === filters.difficulty.toLowerCase();

          return matchesSearch && matchesCategory && matchesDifficulty;
        });
        setFilteredQuizzes(filtered);
      }
    } catch (err) {
      console.error("Error filtering quizzes:", err);
      setFilteredQuizzes(quizzes);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = (quizId) => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    navigate(`/quiz/${quizId}`);
  };

  if (error) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "40px",
          color: "#f44336",
        }}
      >
        <h2>Greška</h2>
        <p>{error}</p>
        <button
          onClick={loadInitialData}
          style={{
            padding: "12px 24px",
            background: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Pokušaj ponovo
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "24px",
      }}
    >
      <div style={{ marginBottom: "32px" }}>
        <h1
          style={{
            fontSize: "32px",
            fontWeight: "700",
            color: "#333",
            marginBottom: "8px",
          }}
        >
          Kvizovi
        </h1>
        <p
          style={{
            fontSize: "16px",
            color: "#666",
            margin: "0",
          }}
        >
          Izaberite kviz i testirajte svoje znanje
        </p>
      </div>

      <QuizFilters
        onFiltersChange={handleFiltersChange}
        categories={categories}
      />

      <QuizList
        quizzes={filteredQuizzes}
        loading={loading}
        onStartQuiz={handleStartQuiz}
      />
    </div>
  );
}

export default QuizBrowser;
