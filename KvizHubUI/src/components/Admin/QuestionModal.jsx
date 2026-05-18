import { useEffect, useState } from "react";
import "./QuestionModal.css";

function QuestionModal({
  isOpen,
  onClose,
  onSave,
  question = null,
  quizzes = [],
}) {
  const [formData, setFormData] = useState({
    text: "",
    type: "SingleChoice",
    quizId: "",
    correctAnswer: "", // Za FillInTheBlank pitanja
    answers: [
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ],
  });

  // Reset form kada se modal otvori/zatvori ili kada se menja pitanje
  useEffect(() => {
    if (isOpen) {
      if (question) {
        // Uređivanje postojećeg pitanja
        setFormData({
          text: question.text || "",
          type: question.type || "SingleChoice",
          quizId: question.quizId || "",
          correctAnswer: question.correctAnswer || "", // Za FillInTheBlank
          trueFalseAnswer:
            question.trueFalseAnswer !== undefined
              ? question.trueFalseAnswer
              : true, // Za TrueFalse
          answers:
            question.answers && question.answers.length > 0
              ? question.answers
              : [
                  { text: "", isCorrect: false },
                  { text: "", isCorrect: false },
                  { text: "", isCorrect: false },
                  { text: "", isCorrect: false },
                ],
        });
      } else {
        // Novo pitanje
        setFormData({
          text: "",
          type: "SingleChoice",
          quizId: "",
          correctAnswer: "", // Za FillInTheBlank
          trueFalseAnswer: true, // Za TrueFalse - default tačno
          answers: [
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
          ],
        });
      }
    }
  }, [isOpen, question]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Ako se menja tip pitanja, resetuj relevantne field-ove
    if (name === "type") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        // Resetuj odgovore za različite tipove
        answers:
          value === "TrueFalse" || value === "FillInTheBlank"
            ? []
            : [
                { text: "", isCorrect: false },
                { text: "", isCorrect: false },
                { text: "", isCorrect: false },
                { text: "", isCorrect: false },
              ],
        // Resetuj specifične field-ove
        correctAnswer: value === "FillInTheBlank" ? "" : "",
        trueFalseAnswer: value === "TrueFalse" ? true : undefined,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAnswerChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      answers: prev.answers.map((answer, i) =>
        i === index ? { ...answer, [field]: value } : answer
      ),
    }));
  };

  const handleCorrectAnswerChange = (index) => {
    if (formData.type === "SingleChoice") {
      // Za SingleChoice - samo jedan odgovor može biti tačan
      setFormData((prev) => ({
        ...prev,
        answers: prev.answers.map((answer, i) => ({
          ...answer,
          isCorrect: i === index,
        })),
      }));
    } else if (formData.type === "MultipleChoice") {
      // Za MultipleChoice - više odgovora može biti tačno
      setFormData((prev) => ({
        ...prev,
        answers: prev.answers.map((answer, i) =>
          i === index ? { ...answer, isCorrect: !answer.isCorrect } : answer
        ),
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validacija
    if (!formData.text.trim()) {
      alert("Tekst pitanja je obavezan!");
      return;
    }

    if (formData.text.trim().length < 5) {
      alert("Tekst pitanja mora imati najmanje 5 karaktera!");
      return;
    }

    if (!formData.quizId) {
      alert("Molimo odaberite kviz!");
      return;
    }

    if (
      formData.type === "MultipleChoice" ||
      formData.type === "SingleChoice"
    ) {
      const filledAnswers = formData.answers.filter((answer) =>
        answer.text.trim()
      );
      if (filledAnswers.length < 2) {
        alert("Molimo unesite najmanje 2 odgovora!");
        return;
      }

      const hasCorrectAnswer = formData.answers.some(
        (answer) => answer.isCorrect
      );
      if (!hasCorrectAnswer) {
        alert(
          formData.type === "MultipleChoice"
            ? "Molimo označite najmanje jedan tačan odgovor!"
            : "Molimo označite jedan tačan odgovor!"
        );
        return;
      }
    }

    if (formData.type === "FillInTheBlank") {
      if (!formData.correctAnswer || !formData.correctAnswer.trim()) {
        alert("Molimo unesite tačan odgovor za fill-in-the-blank pitanje!");
        return;
      }
    }

    // Mapiranje tipova pitanja na backend enum vrednosti
    const questionTypeMapping = {
      SingleChoice: 1,
      MultipleChoice: 2,
      TrueFalse: 3,
      FillInTheBlank: 4,
    };

    // Pripremi podatke za slanje
    const questionData = {
      Text: formData.text,
      Type: questionTypeMapping[formData.type] || 2, // Default MultipleChoice
      Points: 1,
      OrderIndex: 0,
      QuizId: parseInt(formData.quizId),
      CorrectAnswer:
        formData.type === "FillInTheBlank" ? formData.correctAnswer : null,
      Answers:
        formData.type === "MultipleChoice" || formData.type === "SingleChoice"
          ? formData.answers
              .filter((answer) => answer.text.trim())
              .map((answer) => ({
                Text: answer.text,
                IsCorrect: answer.isCorrect,
              }))
          : formData.type === "TrueFalse"
          ? [
              {
                Text: "Tačno",
                IsCorrect: formData.trueFalseAnswer === true,
              },
              {
                Text: "Netačno",
                IsCorrect: formData.trueFalseAnswer === false,
              },
            ]
          : [],
    };

    onSave(questionData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content question-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{question ? "Uredi pitanje" : "Novo pitanje"}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="question-form">
          <div className="form-group">
            <label htmlFor="quizId">Kviz *</label>
            <select
              id="quizId"
              name="quizId"
              value={formData.quizId}
              onChange={handleInputChange}
              required
            >
              <option value="">Odaberite kviz</option>
              {quizzes.map((quiz) => (
                <option key={quiz.id} value={quiz.id}>
                  {quiz.title}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="text">Tekst pitanja *</label>
            <textarea
              id="text"
              name="text"
              value={formData.text}
              onChange={handleInputChange}
              placeholder="Unesite tekst pitanja..."
              rows="3"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="type">Tip pitanja</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
            >
              <option value="SingleChoice">Jedan izbor</option>
              <option value="MultipleChoice">Višestruki izbor</option>
              <option value="TrueFalse">Tačno/Netačno</option>
              <option value="FillInTheBlank">Dopuni prazno mesto</option>
            </select>
          </div>

          {(formData.type === "MultipleChoice" ||
            formData.type === "SingleChoice") && (
            <div className="answers-section">
              <h3>Odgovori</h3>
              {formData.answers.map((answer, index) => (
                <div key={index} className="answer-item">
                  <div className="answer-input-group">
                    <input
                      type="text"
                      value={answer.text}
                      onChange={(e) =>
                        handleAnswerChange(index, "text", e.target.value)
                      }
                      placeholder={`Odgovor ${index + 1}`}
                    />
                    <label className="checkbox-label">
                      <input
                        type={
                          formData.type === "SingleChoice"
                            ? "radio"
                            : "checkbox"
                        }
                        name={
                          formData.type === "SingleChoice"
                            ? "correctAnswer"
                            : `correctAnswer${index}`
                        }
                        checked={answer.isCorrect}
                        onChange={() => handleCorrectAnswerChange(index)}
                      />
                      <span>Tačan</span>
                    </label>
                  </div>
                </div>
              ))}
              <p className="help-text">
                {formData.type === "SingleChoice"
                  ? "Označite jedan tačan odgovor"
                  : "Označite sve tačne odgovore (može biti više)"}
              </p>
            </div>
          )}

          {formData.type === "TrueFalse" && (
            <div className="answers-section">
              <h3>Tačan odgovor</h3>
              <div className="true-false-options">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="trueFalseAnswer"
                    checked={formData.trueFalseAnswer === true}
                    onChange={() =>
                      setFormData((prev) => ({
                        ...prev,
                        trueFalseAnswer: true,
                      }))
                    }
                  />
                  <span>Tačno</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="trueFalseAnswer"
                    checked={formData.trueFalseAnswer === false}
                    onChange={() =>
                      setFormData((prev) => ({
                        ...prev,
                        trueFalseAnswer: false,
                      }))
                    }
                  />
                  <span>Netačno</span>
                </label>
              </div>
              <p className="help-text">
                Izaberite tačan odgovor za ovo pitanje
              </p>
            </div>
          )}

          {formData.type === "FillInTheBlank" && (
            <div className="answers-section">
              <h3>Tačan odgovor</h3>
              <div className="form-group">
                <input
                  type="text"
                  value={formData.correctAnswer}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      correctAnswer: e.target.value,
                    }))
                  }
                  placeholder="Unesite tačan odgovor..."
                />
              </div>
              <p className="help-text">
                Korisnik će morati da unese ovaj tačan odgovor (bez razlike u
                velikim/malim slovima)
              </p>
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Otkaži
            </button>
            <button type="submit" className="btn-primary">
              {question ? "Ažuriraj" : "Kreiraj"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default QuestionModal;
