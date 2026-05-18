import { useEffect, useState } from "react";
import { adminService } from "../../services/adminService";
import QuestionModal from "./QuestionModal";

function QuizManagement() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [selectedQuizForQuestions, setSelectedQuizForQuestions] =
    useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [editingQuestion, setEditingQuestion] = useState(null);

  useEffect(() => {
    loadQuizzes();
    loadCategories();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllQuizzes();
      setQuizzes(data);
    } catch (err) {
      console.error("Error loading quizzes:", err);
      alert("Greška pri učitavanju kvizova: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await adminService.getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  const handleCreateQuiz = async (quizData) => {
    try {
      await adminService.createQuiz(quizData);
      await loadQuizzes(); // Ponovno učitaj listu
      setShowCreateModal(false);
      alert("Kviz je uspešno kreiran!");
    } catch (err) {
      console.error("Error creating quiz:", err);
      alert("Greška pri kreiranju kviza: " + err.message);
    }
  };

  const handleUpdateQuiz = async (id, quizData) => {
    try {
      await adminService.updateQuiz(id, quizData);
      await loadQuizzes(); // Ponovno učitaj listu
      setEditingQuiz(null);
      alert("Kviz je uspešno ažuriran!");
    } catch (err) {
      console.error("Error updating quiz:", err);
      alert("Greška pri ažuriranju kviza: " + err.message);
    }
  };

  const handleDeleteQuiz = async (id) => {
    if (window.confirm("Da li ste sigurni da želite da obrišete ovaj kviz?")) {
      try {
        await adminService.deleteQuiz(id);
        await loadQuizzes(); // Ponovno učitaj listu
        alert("Kviz je uspešno obrisan!");
      } catch (err) {
        console.error("Error deleting quiz:", err);
        alert("Greška pri brisanju kviza: " + err.message);
      }
    }
  };

  const handleManageQuestions = async (quiz) => {
    try {
      setSelectedQuizForQuestions(quiz);
      const questions = await adminService.getQuizQuestions(quiz.id);
      setQuizQuestions(questions);
      setShowQuestionModal(true);
    } catch (err) {
      console.error("Error loading quiz questions:", err);
      alert("Greška pri učitavanju pitanja: " + err.message);
    }
  };

  const handleCreateQuestionForQuiz = async (questionData) => {
    try {
      await adminService.createQuestion(
        selectedQuizForQuestions.id,
        questionData
      );
      // Ponovo učitaj pitanja za ovaj kviz
      const updatedQuestions = await adminService.getQuizQuestions(
        selectedQuizForQuestions.id
      );
      setQuizQuestions(updatedQuestions);
      // Ponovo učitaj kvizove da se ažurira broj pitanja
      await loadQuizzes();
      alert("Pitanje je uspešno dodato!");
    } catch (err) {
      console.error("Error creating question:", err);
      alert("Greška pri kreiranju pitanja: " + err.message);
    }
  };

  const handleUpdateQuestionForQuiz = async (questionData) => {
    try {
      await adminService.updateQuestion(editingQuestion.id, questionData);
      // Ponovo učitaj pitanja za ovaj kviz
      const updatedQuestions = await adminService.getQuizQuestions(
        selectedQuizForQuestions.id
      );
      setQuizQuestions(updatedQuestions);
      setEditingQuestion(null);
      alert("Pitanje je uspešno ažurirano!");
    } catch (err) {
      console.error("Error updating question:", err);
      alert("Greška pri ažuriranju pitanja: " + err.message);
    }
  };

  const handleDeleteQuestionFromQuiz = async (questionId) => {
    if (
      window.confirm("Da li ste sigurni da želite da obrišete ovo pitanje?")
    ) {
      try {
        await adminService.deleteQuestion(questionId);
        // Ponovo učitaj pitanja za ovaj kviz
        const updatedQuestions = await adminService.getQuizQuestions(
          selectedQuizForQuestions.id
        );
        setQuizQuestions(updatedQuestions);
        // Ponovo učitaj kvizove da se ažurira broj pitanja
        await loadQuizzes();
        alert("Pitanje je uspešno obrisano!");
      } catch (err) {
        console.error("Error deleting question:", err);
        alert("Greška pri brisanju pitanja: " + err.message);
      }
    }
  };

  const handleEditQuestionFromQuiz = async (question) => {
    try {
      const questionDetails = await adminService.getQuestionById(question.id);
      setEditingQuestion(questionDetails);
    } catch (err) {
      console.error("Error loading question details:", err);
      alert("Greška pri učitavanju detalja pitanja: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Učitavanje kvizova...</p>
      </div>
    );
  }

  return (
    <div className="quiz-management">
      <div className="management-header">
        <h2>Upravljanje kvizovima</h2>
        <button
          className="btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          + Novi kviz
        </button>
      </div>

      <div className="quiz-list">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="quiz-item">
            <div className="quiz-info">
              <h3>{quiz.title}</h3>
              <p>{quiz.description}</p>
              <div className="quiz-meta">
                <span>Kategorija: {quiz.categoryName || quiz.categoryId}</span>
                <span>Pitanja: {quiz.questionsCount || 0}</span>
                <span>Težina: {quiz.difficulty}</span>
                <span>Vreme: {quiz.timeLimitMinutes} min</span>
                <span>Status: {quiz.isActive ? "Aktivan" : "Neaktivan"}</span>
              </div>
            </div>
            <div className="quiz-actions">
              <button
                className="btn-info"
                onClick={() => handleManageQuestions(quiz)}
              >
                ❓ Pitanja ({quiz.questionsCount || 0})
              </button>
              <button
                className="btn-secondary"
                onClick={() => setEditingQuiz(quiz)}
              >
                ✏️ Uredi
              </button>
              <button
                className="btn-danger"
                onClick={() => handleDeleteQuiz(quiz.id)}
              >
                🗑️ Obriši
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal za kreiranje kviza */}
      {showCreateModal && (
        <QuizModal
          quiz={null}
          categories={categories}
          onSave={handleCreateQuiz}
          onCancel={() => setShowCreateModal(false)}
        />
      )}

      {/* Modal za ažuriranje kviza */}
      {editingQuiz && (
        <QuizModal
          quiz={editingQuiz}
          categories={categories}
          onSave={(quizData) => handleUpdateQuiz(editingQuiz.id, quizData)}
          onCancel={() => setEditingQuiz(null)}
        />
      )}

      {/* Modal za upravljanje pitanjima u kvizu */}
      {showQuestionModal && selectedQuizForQuestions && (
        <QuizQuestionsModal
          quiz={selectedQuizForQuestions}
          questions={quizQuestions}
          onClose={() => {
            setShowQuestionModal(false);
            setSelectedQuizForQuestions(null);
            setQuizQuestions([]);
            setEditingQuestion(null);
          }}
          onCreateQuestion={handleCreateQuestionForQuiz}
          onEditQuestion={handleEditQuestionFromQuiz}
          onDeleteQuestion={handleDeleteQuestionFromQuiz}
        />
      )}

      {/* Modal za uređivanje pitanja */}
      <QuestionModal
        isOpen={!!editingQuestion}
        onClose={() => setEditingQuestion(null)}
        onSave={handleUpdateQuestionForQuiz}
        question={editingQuestion}
        quizzes={[selectedQuizForQuestions].filter(Boolean)}
      />
    </div>
  );
}

// Komponenta za modal (kreiranje/ažuriranje kviza)
function QuizModal({ quiz, categories, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: quiz?.title || "",
    description: quiz?.description || "",
    timeLimitMinutes: quiz?.timeLimitMinutes || 30,
    difficulty: quiz?.difficulty || "Intermediate",
    categoryId: quiz?.categoryId || categories[0]?.id || 1,
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Mapiranje difficulty vrednosti na backend enum
    const difficultyMapping = {
      Lako: "Beginner",
      Srednje: "Intermediate",
      Teško: "Advanced",
      // Fallback za postojeće vrednosti
      Easy: "Beginner",
      Intermediate: "Intermediate",
      Hard: "Advanced",
      Beginner: "Beginner",
      Advanced: "Advanced",
    };

    const submitData = {
      ...formData,
      difficulty: difficultyMapping[formData.difficulty] || "Intermediate",
      timeLimitMinutes: parseInt(formData.timeLimitMinutes),
      categoryId: parseInt(formData.categoryId),
    };

    console.log("Sending quiz data:", submitData); // Debug log
    onSave(submitData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{quiz ? "Ažuriraj kviz" : "Kreiraj novi kviz"}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Naslov:</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Opis:</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Vreme (minuti):</label>
            <input
              type="number"
              min="1"
              max="600"
              value={formData.timeLimitMinutes}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  timeLimitMinutes: parseInt(e.target.value),
                })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Težina:</label>
            <select
              value={formData.difficulty}
              onChange={(e) =>
                setFormData({ ...formData, difficulty: e.target.value })
              }
            >
              <option value="Beginner">Početnik</option>
              <option value="Intermediate">Srednje</option>
              <option value="Advanced">Napredni</option>
            </select>
          </div>

          <div className="form-group">
            <label>Kategorija:</label>
            <select
              value={formData.categoryId}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  categoryId: parseInt(e.target.value),
                })
              }
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onCancel}>
              Otkaži
            </button>
            <button type="submit" className="btn-primary">
              {quiz ? "Ažuriraj" : "Kreiraj"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Komponenta za upravljanje pitanjima u kvizu
function QuizQuestionsModal({
  quiz,
  questions,
  onClose,
  onCreateQuestion,
  onEditQuestion,
  onDeleteQuestion,
}) {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreateQuestion = async (questionData) => {
    await onCreateQuestion(questionData);
    setShowCreateForm(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content quiz-questions-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Pitanja za kviz: {quiz.title}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="quiz-questions-content">
          <div className="questions-header">
            <h3>Trenutna pitanja ({questions.length})</h3>
            <button
              className="btn-primary"
              onClick={() => setShowCreateForm(true)}
            >
              + Dodaj pitanje
            </button>
          </div>

          {showCreateForm && (
            <div className="create-question-form">
              <QuestionModal
                isOpen={true}
                onClose={() => setShowCreateForm(false)}
                onSave={handleCreateQuestion}
                quizzes={[quiz]}
              />
            </div>
          )}

          <div className="questions-list">
            {questions.length === 0 ? (
              <div className="empty-state">
                <p>Ovaj kviz još nema pitanja.</p>
                <p>Dodajte prvo pitanje klikom na dugme "Dodaj pitanje".</p>
              </div>
            ) : (
              questions.map((question, index) => (
                <div key={question.id} className="question-item">
                  <div className="question-number">#{index + 1}</div>
                  <div className="question-content">
                    <h4>{question.text}</h4>
                    <div className="question-details">
                      <span className="question-type">
                        Tip: {question.type}
                      </span>
                      {question.answers && question.answers.length > 0 && (
                        <span className="answers-count">
                          Odgovori: {question.answers.length}
                        </span>
                      )}
                    </div>
                    {question.answers && question.answers.length > 0 && (
                      <div className="answers-preview">
                        {question.answers.map((answer, idx) => (
                          <span
                            key={idx}
                            className={`answer-preview ${
                              answer.isCorrect ? "correct" : ""
                            }`}
                          >
                            {answer.text} {answer.isCorrect && "✓"}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="question-actions">
                    <button
                      className="btn-secondary"
                      onClick={() => onEditQuestion(question)}
                    >
                      ✏️ Uredi
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => onDeleteQuestion(question.id)}
                    >
                      🗑️ Obriši
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Zatvori
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuizManagement;
