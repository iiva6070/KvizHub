import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../api/quizApi";

const NewQuizTaking = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [finished, setFinished] = useState(false);

  // Učitaj kviz podatke
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Loading quiz:", quizId);

        // Učitaj kviz info
        const quizData = await api.getQuiz(quizId);
        console.log("Quiz loaded:", quizData);
        setQuiz(quizData);

        // Učitaj pitanja
        const questionsData = await api.getQuizQuestions(quizId);
        console.log("❓ Questions loaded:", questionsData);

        if (questionsData.questions && questionsData.questions.length > 0) {
          setQuestions(questionsData.questions);
          setTimeLeft(quizData.timeLimitMinutes * 60); // u sekundama
        } else {
          throw new Error("Nema pitanja za ovaj kviz");
        }
      } catch (err) {
        console.error("Error loading quiz:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      loadQuiz();
    }
  }, [quizId]);

  // Timer
  useEffect(() => {
    if (timeLeft > 0 && !finished) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !finished) {
      handleFinish();
    }
  }, [timeLeft, finished]);

  // Formatiraj vreme
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Odgovori na pitanje
  const handleAnswer = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  // Sledeće pitanje
  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  // Prethodno pitanje
  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Završi kviz
  const handleFinish = async () => {
    try {
      setFinished(true);
      // TODO: Implementiraj submit logic
      console.log("Finishing quiz with answers:", answers);
      alert("Kviz završen! Rezultati će biti implementirani.");
      navigate("/");
    } catch (err) {
      console.error("Error finishing quiz:", err);
      setError(err.message);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2>Učitavanje kviza...</h2>
        <p>Molimo sačekajte.</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "red" }}>
        <h2>Greška</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/")}>Nazad na početnu</button>
      </div>
    );
  }

  // Quiz nije učitan
  if (!quiz || questions.length === 0) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2>Kviz nije pronađen</h2>
        <button onClick={() => navigate("/")}>Nazad na početnu</button>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      {/* Header */}
      <div
        style={{
          marginBottom: "20px",
          borderBottom: "1px solid #ccc",
          paddingBottom: "10px",
        }}
      >
        <h1>{quiz.title}</h1>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>
            Pitanje {currentQuestion + 1} od {questions.length}
          </span>
          <span
            style={{
              color: timeLeft < 60 ? "red" : "green",
              fontWeight: "bold",
            }}
          >
            ⏰ {formatTime(timeLeft)}
          </span>
        </div>
        <div
          style={{
            background: "#f0f0f0",
            height: "10px",
            borderRadius: "5px",
            marginTop: "10px",
          }}
        >
          <div
            style={{
              background: "#4CAF50",
              height: "100%",
              width: `${progress}%`,
              borderRadius: "5px",
              transition: "width 0.3s",
            }}
          ></div>
        </div>
      </div>

      {/* Pitanje */}
      <div style={{ marginBottom: "30px" }}>
        <h2 style={{ marginBottom: "20px" }}>{currentQ.text}</h2>

        {/* Odgovori */}
        <div style={{ marginBottom: "30px" }}>
          {currentQ.answers &&
            currentQ.answers.map((answer, index) => (
              <div key={answer.id} style={{ marginBottom: "10px" }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "15px",
                    border: "2px solid #ddd",
                    borderRadius: "8px",
                    cursor: "pointer",
                    background:
                      answers[currentQ.id] === answer.id ? "#e3f2fd" : "white",
                    borderColor:
                      answers[currentQ.id] === answer.id ? "#2196F3" : "#ddd",
                  }}
                >
                  <input
                    type="radio"
                    name={`question-${currentQ.id}`}
                    value={answer.id}
                    checked={answers[currentQ.id] === answer.id}
                    onChange={() => handleAnswer(currentQ.id, answer.id)}
                    style={{ marginRight: "15px" }}
                  />
                  <span style={{ fontSize: "16px" }}>{answer.text}</span>
                </label>
              </div>
            ))}
        </div>
      </div>

      {/* Navigacija */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          style={{
            padding: "10px 20px",
            background: currentQuestion === 0 ? "#ccc" : "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: currentQuestion === 0 ? "not-allowed" : "pointer",
          }}
        >
          ← Prethodno
        </button>

        <span style={{ color: "#666" }}>
          Odgovoreno: {Object.keys(answers).length} / {questions.length}
        </span>

        {currentQuestion === questions.length - 1 ? (
          <button
            onClick={handleFinish}
            style={{
              padding: "10px 20px",
              background: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Završi kviz ✓
          </button>
        ) : (
          <button
            onClick={handleNext}
            style={{
              padding: "10px 20px",
              background: "#2196F3",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Sledeće →
          </button>
        )}
      </div>

      {/* Debug info */}
      <div
        style={{
          marginTop: "40px",
          padding: "10px",
          background: "#f9f9f9",
          fontSize: "12px",
        }}
      >
        <strong>Debug:</strong>
        <br />
        Quiz ID: {quizId}
        <br />
        Ukupno pitanja: {questions.length}
        <br />
        Trenutno pitanje: {currentQuestion + 1}
        <br />
        Odgovori: {JSON.stringify(answers)}
      </div>
    </div>
  );
};

export default NewQuizTaking;
