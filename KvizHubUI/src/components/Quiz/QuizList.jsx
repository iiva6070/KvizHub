import QuizCard from "./QuizCard";
import "./QuizList.css";

function QuizList({ quizzes, loading, onStartQuiz }) {
  if (loading) {
    return (
      <div className="quiz-list-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Učitavam kvizove...</p>
        </div>
      </div>
    );
  }

  if (!quizzes || quizzes.length === 0) {
    return (
      <div className="quiz-list-container">
        <div className="empty-state">
          <div className="empty-icon">Quizzes</div>
          <h3>Nema dostupnih kvizova</h3>
          <p>
            Trenutno nema kvizova koji odgovaraju vašim kriterijumima pretrage.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-list-container">
      <div className="quiz-list-header">
        <h2>Dostupni kvizovi ({quizzes.length})</h2>
      </div>
      <div className="quiz-grid">
        {quizzes.map((quiz) => (
          <QuizCard key={quiz.id} quiz={quiz} onStartQuiz={onStartQuiz} />
        ))}
      </div>
    </div>
  );
}

export default QuizList;
