import { useEffect, useState } from "react";
import { adminService } from "../../services/adminService";
import QuestionModal from "./QuestionModal";

function QuestionManagement() {
  const [questions, setQuestions] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  useEffect(() => {
    loadQuestions();
    loadQuizzes();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllQuestions();
      setQuestions(data);
    } catch (err) {
      console.error("Error loading questions:", err);
      alert("Greška pri učitavanju pitanja: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadQuizzes = async () => {
    try {
      const data = await adminService.getAllQuizzes();
      setQuizzes(data);
    } catch (err) {
      console.error("Error loading quizzes:", err);
    }
  };

  const handleCreateQuestion = async (questionData) => {
    try {
      await adminService.createQuestion(questionData.QuizId, questionData);
      await loadQuestions();
      setShowCreateModal(false);
      alert("Pitanje je uspešno kreirano!");
    } catch (err) {
      console.error("Error creating question:", err);
      alert("Greška pri kreiranju pitanja: " + err.message);
    }
  };

  const handleUpdateQuestion = async (questionData) => {
    try {
      await adminService.updateQuestion(editingQuestion.id, questionData);
      await loadQuestions();
      setEditingQuestion(null);
      alert("Pitanje je uspešno ažurirano!");
    } catch (err) {
      console.error("Error updating question:", err);
      alert("Greška pri ažuriranju pitanja: " + err.message);
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (
      window.confirm("Da li ste sigurni da želite da obrišete ovo pitanje?")
    ) {
      try {
        await adminService.deleteQuestion(id);
        await loadQuestions();
        alert("Pitanje je uspešno obrisano!");
      } catch (err) {
        console.error("Error deleting question:", err);
        alert("Greška pri brisanju pitanja: " + err.message);
      }
    }
  };

  const handleEditQuestion = async (question) => {
    try {
      // Dobijamo detalje pitanja sa odgovorima
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
        <p>Učitavanje pitanja...</p>
      </div>
    );
  }

  return (
    <div className="question-management">
      <div className="management-header">
        <h2>❓ Upravljanje pitanjima</h2>
        <button
          className="btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          + Novo pitanje
        </button>
      </div>

      <div className="question-list">
        {questions.map((question) => (
          <div key={question.id} className="question-item">
            <div className="question-info">
              <h3>{question.text}</h3>
              <div className="question-meta">
                <span>Tip: {question.type}</span>
                <span>Kviz: {question.quizTitle || "Nepoznat"}</span>
                {question.answers && question.answers.length > 0 && (
                  <span>Odgovori: {question.answers.length}</span>
                )}
              </div>
            </div>
            <div className="question-actions">
              <button
                className="btn-secondary"
                onClick={() => handleEditQuestion(question)}
              >
                ✏️ Uredi
              </button>
              <button
                className="btn-danger"
                onClick={() => handleDeleteQuestion(question.id)}
              >
                🗑️ Obriši
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal za kreiranje pitanja */}
      <QuestionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateQuestion}
        quizzes={quizzes}
      />

      {/* Modal za uređivanje pitanja */}
      <QuestionModal
        isOpen={!!editingQuestion}
        onClose={() => setEditingQuestion(null)}
        onSave={handleUpdateQuestion}
        question={editingQuestion}
        quizzes={quizzes}
      />
    </div>
  );
}

export default QuestionManagement;
