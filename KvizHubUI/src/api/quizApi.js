const API_BASE = import.meta.env.VITE_BACKEND_API_URL;

// Osnovni fetch wrapper
async function apiCall(url, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${url}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API call failed:", error);
    throw error;
  }
}

// API funkcije
export const api = {
  // Dohvati kviz po ID-u
  async getQuiz(quizId) {
    return await apiCall(`/api/quiz/${quizId}`);
  },

  // Dohvati pitanja za kviz
  async getQuizQuestions(quizId) {
    return await apiCall(`/api/quiz/${quizId}/questions`);
  },

  // Submituj kviz rezultate
  async submitQuiz(quizId, answers) {
    return await apiCall(`/api/quiz/${quizId}/submit`, {
      method: "POST",
      body: JSON.stringify({ answers }),
    });
  },
};
