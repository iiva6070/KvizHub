import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import * as quizService from "../../services/quizService";

function QuizTakingMinimal() {
  const { quizId } = useParams();
  const [status, setStatus] = useState("Loading...");

  useEffect(() => {
    console.log("QuizTakingMinimal loaded, quizId:", quizId);
    setStatus(`Quiz ID received: ${quizId}`);

    const loadData = async () => {
      try {
        console.log("Starting to load quiz data...");
        setStatus("Loading quiz data...");

        const quiz = await quizService.getQuizById(parseInt(quizId));
        console.log("Quiz loaded:", quiz);
        setStatus(`Quiz loaded: ${quiz?.title || "Unknown"}`);

        const questions = await quizService.getQuestionsByQuizId(
          parseInt(quizId)
        );
        console.log("❓ Questions loaded:", questions);
        setStatus(
          `Questions loaded: ${questions?.questions?.length || 0} questions`
        );
      } catch (error) {
        console.error("Error:", error);
        setStatus(`Error: ${error.message}`);
      }
    };

    if (quizId) {
      loadData();
    }
  }, [quizId]);

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>Quiz Taking - Minimal Test</h1>
      <p>Status: {status}</p>
      <p>Quiz ID: {quizId || "Not provided"}</p>
    </div>
  );
}

export default QuizTakingMinimal;
