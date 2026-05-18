import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const SuperSimpleQuiz = () => {
  const { quizId } = useParams();
  const [status, setStatus] = useState("Loading...");
  const [data, setData] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setStatus("Fetching quiz data...");

        // Direct fetch without external imports
        const response = await fetch(
          `http://localhost:5232/api/quiz/${quizId}`
        );
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const quizData = await response.json();
        setData(quizData);
        setStatus("Quiz loaded successfully!");

        // Try to load questions
        const questionsResponse = await fetch(
          `http://localhost:5291/api/quiz/${quizId}/questions`
        );
        if (questionsResponse.ok) {
          const questionsData = await questionsResponse.json();
          setData((prev) => ({ ...prev, questionsData }));
          setStatus(
            `Loaded quiz with ${questionsData.questions?.length || 0} questions`
          );
        }
      } catch (error) {
        setStatus(`Error: ${error.message}`);
        console.error("Quiz loading error:", error);
      }
    };

    if (quizId) {
      loadData();
    } else {
      setStatus("No quiz ID provided");
    }
  }, [quizId]);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Super Simple Quiz Test</h1>
      <p>
        <strong>Quiz ID:</strong> {quizId}
      </p>
      <p>
        <strong>Status:</strong> {status}
      </p>

      {data && (
        <div style={{ marginTop: "20px" }}>
          <h2>Quiz Info:</h2>
          <div
            style={{
              background: "#f0f0f0",
              padding: "15px",
              borderRadius: "5px",
            }}
          >
            <p>
              <strong>Title:</strong> {data.title}
            </p>
            <p>
              <strong>Description:</strong> {data.description}
            </p>
            <p>
              <strong>Time Limit:</strong> {data.timeLimitMinutes} minutes
            </p>
            <p>
              <strong>Category:</strong> {data.categoryName}
            </p>
          </div>

          {data.questionsData && data.questionsData.questions && (
            <div style={{ marginTop: "20px" }}>
              <h3>Questions ({data.questionsData.questions.length}):</h3>
              {data.questionsData.questions.map((q, index) => (
                <div
                  key={q.id}
                  style={{
                    background: "#f9f9f9",
                    padding: "10px",
                    margin: "10px 0",
                    borderRadius: "5px",
                    border: "1px solid #ddd",
                  }}
                >
                  <p>
                    <strong>Q{index + 1}:</strong> {q.text}
                  </p>
                  <p>
                    <strong>Type:</strong> {q.type}
                  </p>
                  {q.answers && (
                    <div>
                      <strong>Answers:</strong>
                      <ul>
                        {q.answers.map((answer) => (
                          <li
                            key={answer.id}
                            style={{
                              color: answer.isCorrect ? "green" : "black",
                              fontWeight: answer.isCorrect ? "bold" : "normal",
                            }}
                          >
                            {answer.text} {answer.isCorrect && "✓"}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <details style={{ marginTop: "20px" }}>
            <summary>Raw Data</summary>
            <pre
              style={{
                background: "#f0f0f0",
                padding: "10px",
                overflow: "auto",
              }}
            >
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default SuperSimpleQuiz;
