import { getToken } from "./authService";

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:5291";

// Pokretanje kviza
export async function startQuiz(quizId) {
  console.log("Starting quiz for ID:", quizId);

  try {
    const myAttempts = await getMyAttempts();
    const activeAttempt = myAttempts.find(
      (attempt) => attempt.quizId === quizId && !attempt.isCompleted
    );

    if (activeAttempt) {
      console.log("🔄 Found existing active attempt:", activeAttempt);
      return activeAttempt;
    }
  } catch (err) {
    console.log(
      "⚠️ Could not check existing attempts, creating new one:",
      err.message
    );
  }

  const response = await fetch(`${API_BASE_URL}/api/quizattempt/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ quizId }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to start quiz");
  }

  const newAttempt = await response.json();
  console.log("Created new quiz attempt:", newAttempt);
  return newAttempt;
}

// Submitovanje kviza
export async function submitQuiz(
  attemptId,
  answers,
  actualTimeSpentSeconds = null
) {
  console.log("Submitting quiz:", {
    attemptId,
    answers,
    actualTimeSpentSeconds,
  });

  const submitData = {
    UserAnswers: answers,
  };

  if (actualTimeSpentSeconds !== null) {
    submitData.ActualTimeSpentSeconds = actualTimeSpentSeconds;
  }

  const response = await fetch(
    `${API_BASE_URL}/api/quizattempt/${attemptId}/submit`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(submitData),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to submit quiz");
  }

  return await response.json();
}

// Dobijanje rezultata kviza
export async function getQuizResult(attemptId) {
  const response = await fetch(
    `${API_BASE_URL}/api/quizattempt/${attemptId}/details`,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to get quiz result");
  }

  return await response.json();
}

export async function getMyAttempts() {
  const response = await fetch(`${API_BASE_URL}/api/quizattempt/user/me`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to get attempts");
  }

  return await response.json();
}

// Istorija kvizova
export async function getMyQuizHistory() {
  const response = await fetch(
    `${API_BASE_URL}/api/quizattempt/user/me/history`,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to get quiz history");
  }

  return await response.json();
}

export async function getTopScores(quizId, count = 10) {
  const response = await fetch(
    `${API_BASE_URL}/api/quizattempt/quiz/${quizId}/top-scores?count=${count}`
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to get top scores");
  }

  return await response.json();
}

export async function getBestAttempt(userId, quizId) {
  const response = await fetch(
    `${API_BASE_URL}/api/quizattempt/user/${userId}/best/${quizId}`,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to get best attempt");
  }

  return await response.json();
}
