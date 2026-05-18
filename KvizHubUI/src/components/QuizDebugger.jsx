import { useEffect, useState } from "react";
import * as quizService from "../services/quizService";

const QuizDebugger = () => {
  const [logs, setLogs] = useState([]);
  const [quizData, setQuizData] = useState(null);
  const [questionsData, setQuestionsData] = useState(null);
  const [error, setError] = useState(null);

  const addLog = (message) => {
    console.log(message); // Browser console
    setLogs((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  const testQuizEndpoints = async () => {
    try {
      setError(null);
      setLogs([]);
      addLog("Starting quiz API test...");

      // Direct fetch test first
      addLog(" Testing direct fetch to /api/quiz/10...");
      const directResponse = await fetch("http://localhost:5232/api/quiz/10");
      addLog(
        ` Direct fetch response: ${directResponse.ok}, status: ${directResponse.status}`
      );

      if (directResponse.ok) {
        const directData = await directResponse.json();
        addLog(
          ` Direct fetch data: ${JSON.stringify(directData).slice(0, 100)}...`
        );
      }

      // Test kviz endpoint
      addLog("Testing getQuizById(10)...");
      const quiz = await quizService.getQuizById(10);
      addLog(`Quiz loaded: ${quiz?.title || "Unknown"}`);
      setQuizData(quiz);

      // Test pitanja endpoint
      addLog(" Testing getQuestionsByQuizId(10)...");
      const questions = await quizService.getQuestionsByQuizId(10);
      addLog(
        `Questions loaded: ${questions?.questions?.length || 0} questions`
      );
      setQuestionsData(questions);

      addLog("All tests completed successfully!");
    } catch (err) {
      addLog(`Error: ${err.message}`);
      setError(err.message);
    }
  };

  useEffect(() => {
    testQuizEndpoints();
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>Quiz API Debugger</h1>

      <button
        onClick={testQuizEndpoints}
        style={{ marginBottom: "20px", padding: "10px" }}
      >
        Test Again
      </button>

      <div style={{ marginBottom: "20px" }}>
        <h3>Console Logs:</h3>
        <div
          style={{
            background: "#f0f0f0",
            padding: "10px",
            maxHeight: "200px",
            overflow: "auto",
            border: "1px solid #ccc",
          }}
        >
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ color: "red" }}>Error:</h3>
          <div
            style={{
              background: "#ffeeee",
              padding: "10px",
              border: "1px solid red",
            }}
          >
            {error}
          </div>
        </div>
      )}

      {quizData && (
        <div style={{ marginBottom: "20px" }}>
          <h3>Quiz Data:</h3>
          <pre
            style={{ background: "#f9f9f9", padding: "10px", overflow: "auto" }}
          >
            {JSON.stringify(quizData, null, 2)}
          </pre>
        </div>
      )}

      {questionsData && (
        <div style={{ marginBottom: "20px" }}>
          <h3>Questions Data:</h3>
          <pre
            style={{ background: "#f9f9f9", padding: "10px", overflow: "auto" }}
          >
            {JSON.stringify(questionsData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default QuizDebugger;
