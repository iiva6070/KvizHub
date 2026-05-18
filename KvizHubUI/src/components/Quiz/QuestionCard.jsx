import "./QuestionCard.css";

function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswerChange,
}) {
  const handleOptionSelect = (optionId) => {
    if (question.type === "MultipleChoice") {
      const currentAnswers = selectedAnswer?.selectedOptionIds || [];
      const newAnswers = currentAnswers.includes(optionId)
        ? currentAnswers.filter((id) => id !== optionId)
        : [...currentAnswers, optionId];

      onAnswerChange({
        questionId: question.id,
        selectedOptionIds: newAnswers,
        submittedText: "",
      });
    } else {
      onAnswerChange({
        questionId: question.id,
        selectedOptionIds: [optionId],
        submittedText: "",
      });
    }
  };

  const handleTextInput = (text) => {
    onAnswerChange({
      questionId: question.id,
      selectedOptionIds: [],
      submittedText: text,
    });
  };

  const renderOptions = () => {
    if (!question.options) return null;

    return question.options.map((option) => {
      const isSelected =
        question.type === "MultipleChoice"
          ? selectedAnswer?.selectedOptionIds?.includes(option.id)
          : selectedAnswer?.selectedOptionIds?.[0] === option.id;

      return (
        <div
          key={option.id}
          className={`option ${isSelected ? "selected" : ""}`}
          onClick={() => handleOptionSelect(option.id)}
        >
          <div
            className={`option-marker ${
              question.type === "MultipleChoice" ? "checkbox" : "radio"
            }`}
          >
            {isSelected && (question.type === "MultipleChoice" ? "✓" : "●")}
          </div>
          <span className="option-text">{option.text}</span>
        </div>
      );
    });
  };

  const renderFillInBlank = () => {
    return (
      <div className="fill-in-blank">
        <input
          type="text"
          placeholder="Unesite vaš odgovor..."
          value={selectedAnswer?.submittedText || ""}
          onChange={(e) => handleTextInput(e.target.value)}
          className="text-input"
        />
      </div>
    );
  };

  const renderTrueFalse = () => {
    // Za TrueFalse pitanja, očekujemo da imamo tačno dva odgovora: "Tačno" i "Netačno"
    const trueAnswer = question.answers?.find((a) => a.text === "Tačno");
    const falseAnswer = question.answers?.find((a) => a.text === "Netačno");

    const trueSelected =
      selectedAnswer?.selectedOptionIds?.[0] === trueAnswer?.id;
    const falseSelected =
      selectedAnswer?.selectedOptionIds?.[0] === falseAnswer?.id;

    return (
      <div className="true-false-container">
        <div
          className={`true-false-option ${trueSelected ? "selected" : ""}`}
          onClick={() =>
            onAnswerChange({
              questionId: question.id,
              selectedOptionIds: [trueAnswer?.id],
              submittedText: "",
            })
          }
        >
          <div className="option-marker radio">{trueSelected && "●"}</div>
          <span className="option-text">Tačno</span>
        </div>
        <div
          className={`true-false-option ${falseSelected ? "selected" : ""}`}
          onClick={() =>
            onAnswerChange({
              questionId: question.id,
              selectedOptionIds: [falseAnswer?.id],
              submittedText: "",
            })
          }
        >
          <div className="option-marker radio">{falseSelected && "●"}</div>
          <span className="option-text">Netačno</span>
        </div>
      </div>
    );
  };

  const getQuestionTypeLabel = () => {
    switch (question.type) {
      case "SingleChoice":
        return "Jedan tačan odgovor";
      case "MultipleChoice":
        return "Više tačnih odgovora";
      case "TrueFalse":
        return "Tačno/Netačno";
      case "FillInBlank":
      case "FillInTheBlank":
        return "Unesite odgovor";
      default:
        return "Pitanje";
    }
  };

  return (
    <div className="question-card">
      <div className="question-header">
        <div className="question-progress">
          <span className="question-number">
            Pitanje {questionNumber} od {totalQuestions}
          </span>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
            ></div>
          </div>
        </div>
        <div className="question-type">{getQuestionTypeLabel()}</div>
      </div>

      <div className="question-content">
        <h3 className="question-text">{question.text}</h3>

        <div className="answer-section">
          {question.type === "FillInTheBlank" || question.type === "FillInBlank"
            ? renderFillInBlank()
            : question.type === "TrueFalse"
            ? renderTrueFalse()
            : renderOptions()}
        </div>

        {question.type === "MultipleChoice" && (
          <div className="multiple-choice-hint">
            💡 Možete izabrati više odgovora
          </div>
        )}
      </div>
    </div>
  );
}

export default QuestionCard;
