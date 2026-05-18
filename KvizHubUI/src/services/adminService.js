import { getToken } from "./authService";

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:5291";
const USE_MOCK_DATA = false;

// Mock admin statistike - samo za development
const generateMockAdminStats = () => {
  const totalUsers = 50;
  const totalQuizzes = 0;
  const totalQuestions = 0;
  const totalAttempts = 0;
  const averageScore = 75;
  const activeUsersToday = 12;

  // Statistike po kategorijama - mock data removed
  const categoryStats = [];

  // Top korisnici - mock data removed
  const topUsers = [];

  // Nedeljne aktivnosti (mock podatci)
  const weeklyActivity = [
    { date: "2024-01-01", dayName: "Pon", attempts: 45 },
    { date: "2024-01-02", dayName: "Uto", attempts: 38 },
    { date: "2024-01-03", dayName: "Sre", attempts: 52 },
    { date: "2024-01-04", dayName: "Čet", attempts: 41 },
    { date: "2024-01-05", dayName: "Pet", attempts: 35 },
    { date: "2024-01-06", dayName: "Sub", attempts: 28 },
    { date: "2024-01-07", dayName: "Ned", attempts: 22 },
  ];

  return {
    totalUsers,
    totalQuizzes,
    totalQuestions,
    totalAttempts,
    averageScore,
    activeUsersToday,
    categoryStats,
    topUsers,
    weeklyActivity,
  };
};

// Mock korisnici
const generateMockUsers = () => {
  return [
    {
      id: "user123",
      username: "marko.petrovic",
      email: "marko@example.com",
      role: "User",
      registeredAt: "2023-12-01T10:00:00Z",
      completedQuizzes: 15,
      isActive: true,
    },
    {
      id: "user456",
      username: "ana.maric",
      email: "ana@example.com",
      role: "User",
      registeredAt: "2023-11-15T14:30:00Z",
      completedQuizzes: 22,
      isActive: true,
    },
    {
      id: "admin1",
      username: "admin",
      email: "admin@example.com",
      role: "Admin",
      registeredAt: "2023-10-01T09:00:00Z",
      completedQuizzes: 5,
      isActive: true,
    },
  ];
};

// Mock pitanja
const generateMockQuestions = () => {
  return [
    {
      id: 1,
      text: "Koja je ispravna sintaksa za deklarisanje varijable u JavaScript-u?",
      type: "SingleChoice",
      quizId: 1,
      quizTitle: "Osnove JavaScript-a",
      difficulty: "Početnik",
    },
    {
      id: 2,
      text: "Koji od sledećih su ispravni načini da deklariše funkciju u JavaScript-u?",
      type: "MultipleChoice",
      quizId: 1,
      quizTitle: "Osnove JavaScript-a",
      difficulty: "Početnik",
    },
    {
      id: 3,
      text: "JavaScript je striktno tipiziran programski jezik.",
      type: "TrueFalse",
      quizId: 1,
      quizTitle: "Osnove JavaScript-a",
      difficulty: "Početnik",
    },
  ];
};

// Dobijanje admin statistika
export async function getAdminStats() {
  if (USE_MOCK_DATA) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(generateMockAdminStats());
      }, 800);
    });
  }

  const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch admin stats");
  }

  return await response.json();
}

// Dobijanje svih kvizova
export async function getAllQuizzes() {
  if (USE_MOCK_DATA) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([]); // Mock data removed
      }, 500);
    });
  }

  const response = await fetch(`${API_BASE_URL}/api/admin/quizzes`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch quizzes");
  }

  return await response.json();
}

// Dobijanje svih pitanja
export async function getAllQuestions() {
  if (USE_MOCK_DATA) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(generateMockQuestions());
      }, 500);
    });
  }

  const response = await fetch(`${API_BASE_URL}/api/admin/questions`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch questions");
  }

  return await response.json();
}

// Dobijanje svih korisnika
export async function getAllUsers() {
  if (USE_MOCK_DATA) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(generateMockUsers());
      }, 600);
    });
  }

  const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  return await response.json();
}

export const adminService = {
  getAdminStats,
  getAllQuizzes,
  getAllQuestions,
  getAllUsers,
  // CRUD operacije za kvizove
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizById,
  // CRUD operacije za pitanja
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getQuestionById,
  getQuizQuestions,
  // Kategorije
  getCategories,
};

// ===== CRUD OPERACIJE ZA KVIZOVE =====

// Kreiranje novog kviza
export async function createQuiz(quizData) {
  // Mapiranje enum vrednosti na brojeve
  const difficultyMap = {
    Beginner: 1,
    Intermediate: 2,
    Advanced: 3,
  };

  // Kreiranje DTO objekta za backend sa Pascal case property names
  const createDto = {
    Title: quizData.title,
    Description: quizData.description || "",
    TimeLimitMinutes: parseInt(quizData.timeLimitMinutes),
    Difficulty: difficultyMap[quizData.difficulty] || 2, // Šalji kao broj
    CategoryId: parseInt(quizData.categoryId),
    Questions: quizData.questions || [], // Prazna lista za početak
  };

  console.log("Sending createDto:", createDto); // Debug log

  const response = await fetch(`${API_BASE_URL}/api/admin/quizzes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(createDto),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create quiz: ${error}`);
  }

  return await response.json();
}

// Ažuriranje kviza
export async function updateQuiz(id, quizData) {
  // Mapiranje enum vrednosti na brojeve
  const difficultyMap = {
    Beginner: 1,
    Intermediate: 2,
    Advanced: 3,
  };

  // Kreiranje DTO objekta za backend sa Pascal case property names
  const updateDto = {
    Title: quizData.title,
    Description: quizData.description || "",
    TimeLimitMinutes: parseInt(quizData.timeLimitMinutes),
    Difficulty: difficultyMap[quizData.difficulty] || 2, // Šalji kao broj
    CategoryId: parseInt(quizData.categoryId),
    IsActive: quizData.isActive !== undefined ? quizData.isActive : true,
  };

  console.log("Sending updateDto:", updateDto); // Debug log

  const response = await fetch(`${API_BASE_URL}/api/admin/quizzes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(updateDto),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update quiz: ${error}`);
  }

  return await response.json();
}

// Brisanje kviza
export async function deleteQuiz(id) {
  const response = await fetch(`${API_BASE_URL}/api/admin/quizzes/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to delete quiz: ${error}`);
  }

  return await response.json();
}

// Dobijanje kviza po ID-u
export async function getQuizById(id) {
  const response = await fetch(`${API_BASE_URL}/api/admin/quizzes/${id}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch quiz");
  }

  return await response.json();
}

// ===== CRUD OPERACIJE ZA PITANJA =====

// Kreiranje novog pitanja
export async function createQuestion(quizId, questionData) {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/quizzes/${quizId}/questions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(questionData),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create question: ${error}`);
  }

  return await response.json();
}

export async function updateQuestion(id, questionData) {
  const updateDto = {
    Text: questionData.Text,
    Type: questionData.Type,
    Points: questionData.Points || 1,
    OrderIndex: questionData.OrderIndex || 0,
  };

  console.log("Sending update question data:", updateDto);

  const response = await fetch(`${API_BASE_URL}/api/admin/questions/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(updateDto),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update question: ${error}`);
  }

  return await response.json();
}

// Brisanje pitanja
export async function deleteQuestion(id) {
  const response = await fetch(`${API_BASE_URL}/api/admin/questions/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to delete question: ${error}`);
  }

  return await response.json();
}

// Dobijanje pitanja po ID-u
export async function getQuestionById(id) {
  const response = await fetch(`${API_BASE_URL}/api/admin/questions/${id}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch question");
  }

  return await response.json();
}

// Dobijanje svih pitanja za kviz
export async function getQuizQuestions(quizId) {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/quizzes/${quizId}/questions`,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch quiz questions");
  }

  return await response.json();
}

// Dobijanje svih kategorija
export async function getCategories() {
  const response = await fetch(`${API_BASE_URL}/api/admin/categories`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  return await response.json();
}
