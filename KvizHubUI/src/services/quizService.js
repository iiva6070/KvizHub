import { getToken } from "./authService";

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:5291";
const USE_MOCK_DATA = false;

function getQuestionTypeString(type) {
  const typeMap = {
    1: "SingleChoice",
    2: "MultipleChoice",
    3: "TrueFalse",
    4: "FillInTheBlank",
  };
  return typeMap[type] || "SingleChoice";
}

export async function createQuiz(quiz) {
  const response = await fetch(`${API_BASE_URL}/quiz/createQuiz`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(quiz),
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      throw new Error("Failed to create quiz");
    }

    if (errorData?.errors?.length > 0) {
      const messages = errorData.errors.map((e) => e.ErrorMessage).join("\n");
      throw new Error(messages);
    }

    throw new Error(errorData.message || "Failed to create quiz");
  }

  return await response.json();
}

export async function getAllQuizzes() {
  if (USE_MOCK_DATA) {
    // Simulacija API poziva sa mock podacima
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockQuizzes), 500);
    });
  }

  const res = await fetch(`${API_BASE_URL}/api/quiz`);
  if (!res.ok) throw new Error("Failed to fetch quizzes");
  console.log(API_BASE_URL);
  const data = await res.json();

  // Transform backend fields to match frontend expectations
  return data.map((quiz) => ({
    ...quiz,
    questionCount: quiz.questionsCount || 0,
    timeLimit: quiz.timeLimitMinutes || 30,
    category: quiz.categoryName || "Nepoznato",
  }));
}

export async function getQuizQuestions(quizId) {
  if (USE_MOCK_DATA) {
    // Simulacija API poziva sa mock podacima
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const questions = mockQuestions[quizId];
        if (questions) {
          resolve(questions);
        } else {
          reject(new Error("Quiz not found"));
        }
      }, 400);
    });
  }

  const response = await fetch(`${API_BASE_URL}/quiz/${quizId}/questions`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!response.ok) throw new Error("Failed to fetch questions");
  return await response.json();
}

export async function submitQuizAnswers(quizId, answers, durationSeconds = 0) {
  const answersArray = Object.entries(answers).map(([questionId, value]) => {
    if (typeof value === "string") {
      return {
        questionId: questionId,
        selectedOptionIds: [],
        submittedText: value,
      };
    } else {
      return {
        questionId: questionId,
        selectedOptionIds: value,
        submittedText: null,
      };
    }
  });

  const body = { answers: answersArray, durationSeconds };

  const response = await fetch(`${API_BASE_URL}/quiz/${quizId}/submit`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Submit failed:", response.status, text);
    throw new Error("Failed to submit quiz");
  }
  return await response.json();
}

export async function getLeaderboard(quizId, period) {
  const response = await fetch(
    `${API_BASE_URL}/leaderboard/${quizId}?period=${period}`,
    {
      headers: { Authorization: `Bearer ${getToken()}` },
    }
  );
  if (!response.ok) throw new Error("Failed to fetch leaderboard");
  return await response.json();
}

export async function getQuizForEdit(quizId) {
  const res = await fetch(`${API_BASE_URL}/quiz/getQuizForEdit/${quizId}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error("Failed to fetch quiz for edit");
  return await res.json();
}

export async function updateQuiz(payload) {
  const res = await fetch(`${API_BASE_URL}/quiz/updateQuiz/${payload.id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let errorPayload;
    try {
      errorPayload = await res.json();
    } catch {
      const fallbackText = await res.text();
      console.error("Update quiz failed:", fallbackText);
      throw new Error("Failed to update quiz");
    }

    const error = new Error("Validation failed");
    error.errors = errorPayload.errors || [];
    throw error;
  }
}

export async function deleteQuiz(quizId) {
  const res = await fetch(`${API_BASE_URL}/quiz/deleteQuiz/${quizId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error("Failed to delete quiz");
}

export async function getQuizHistory(quizId = "") {
  const res = await fetch(
    `${API_BASE_URL}/users/quiz/history${quizId ? `?quizId=${quizId}` : ""}`,
    {
      headers: { Authorization: `Bearer ${getToken()}` },
    }
  );
  if (!res.ok) throw new Error("Failed to fetch history");
  return await res.json();
}

export async function getQuizResultDetails(resultId) {
  const res = await fetch(`${API_BASE_URL}/users/quiz/history/${resultId}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error("Failed to fetch result details");
  return await res.json();
}

export async function fetchUserQuizHistoryForAdmin(userId) {
  const res = await fetch(`${API_BASE_URL}/quiz/history/${userId}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error("Failed to fetch quiz history");
  return await res.json();
}

export async function fetchQuizResultDetailsForAdmin(resultId) {
  const res = await fetch(`${API_BASE_URL}/quiz/result/${resultId}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error("Failed to fetch result details");
  return await res.json();
}

export async function getFilteredQuizzes(search, category, difficulty) {
  if (USE_MOCK_DATA) {
    // Simulacija filtriranja sa mock podacima
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("Filtering with:", { search, category, difficulty });

        const filtered = mockQuizzes.filter((quiz) => {
          const matchesSearch =
            !search ||
            quiz.title.toLowerCase().includes(search.toLowerCase()) ||
            quiz.description.toLowerCase().includes(search.toLowerCase());

          const matchesCategory =
            !category || quiz.category.toLowerCase() === category.toLowerCase();

          const matchesDifficulty =
            !difficulty || quiz.difficulty === difficulty; // Exact match for difficulty

          console.log(
            `Quiz: ${quiz.title}, difficulty: ${quiz.difficulty}, filter: ${difficulty}, matches: ${matchesDifficulty}`
          );

          return matchesSearch && matchesCategory && matchesDifficulty;
        });

        console.log("Filtered results:", filtered);
        resolve(filtered);
      }, 300);
    });
  }

  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (category) params.append("category", category);
  if (difficulty) params.append("difficulty", difficulty);

  const res = await fetch(
    `${API_BASE_URL}/quiz/getFilteredQuizzes?${params.toString()}`,
    {
      headers: { Authorization: `Bearer ${getToken()}` },
    }
  );
  if (!res.ok) throw new Error("Failed to fetch quizzes");
  return await res.json();
}

export async function getAllCategories() {
  if (USE_MOCK_DATA) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockCategories), 300);
    });
  }

  const res = await fetch(`${API_BASE_URL}/api/quizcategory`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  const data = await res.json();

  return data.value || data;
}

export async function getQuizById(quizId) {
  console.log(
    "getQuizById called with ID:",
    quizId,
    "USE_MOCK_DATA:",
    USE_MOCK_DATA
  );

  if (USE_MOCK_DATA) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const quiz = mockQuizzes.find((q) => q.id === quizId);
        if (quiz) {
          resolve(quiz);
        } else {
          reject(new Error("Quiz not found"));
        }
      }, 300);
    });
  }

  console.log("🌐 Making API call to:", `${API_BASE_URL}/api/quiz/${quizId}`);
  const token = getToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  console.log("🔐 Using headers:", headers);

  const res = await fetch(`${API_BASE_URL}/api/quiz/${quizId}`, {
    headers: headers,
  });
  console.log("📡 API response:", res.ok, res.status);
  if (!res.ok) throw new Error("Failed to fetch quiz");
  const quizResult = await res.json();
  console.log("📦 Quiz data received:", quizResult);
  return quizResult;
}

export async function getQuestionsByQuizId(quizId) {
  console.log(
    "🔍 getQuestionsByQuizId called with ID:",
    quizId,
    "USE_MOCK_DATA:",
    USE_MOCK_DATA
  );

  if (USE_MOCK_DATA) {
    // Simulacija API poziva sa mock podacima
    return new Promise((resolve) => {
      setTimeout(() => {
        const questions = mockQuestions.filter((q) => q.quizId === quizId);
        resolve(questions);
      }, 400);
    });
  }

  console.log(
    "🌐 Making API call to:",
    `${API_BASE_URL}/api/quiz/${quizId}/questions`
  );
  const token = getToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  console.log("🔐 Using headers:", headers);

  const cacheBuster = `?t=${Date.now()}`;
  const res = await fetch(
    `${API_BASE_URL}/api/quiz/${quizId}/questions${cacheBuster}`,
    {
      headers: headers,
    }
  );
  console.log("📡 API response:", res.ok, res.status);
  if (!res.ok) throw new Error("Failed to fetch questions");
  const quizData = await res.json();
  console.log("📦 Raw quiz data received:", quizData);

  if (quizData.questions) {
    quizData.questions = quizData.questions.map((question) => ({
      ...question,

      type: getQuestionTypeString(question.type),
      options:
        question.answers?.map((answer) => ({
          id: answer.id,
          text: answer.text,
          isCorrect: answer.isCorrect,
        })) || [],
    }));
  }

  return quizData;
}

export const quizService = {
  createQuiz,
  getAllQuizzes,
  getFilteredQuizzes,
  getAllCategories,
  getQuizById,
  getQuestionsByQuizId,
  submitQuizAnswers,
  getLeaderboard,
  getQuizForEdit,
  updateQuiz,
  deleteQuiz,
  getQuizHistory,
  getQuizResultDetails,
  fetchUserQuizHistoryForAdmin,
  fetchQuizResultDetailsForAdmin,
};
