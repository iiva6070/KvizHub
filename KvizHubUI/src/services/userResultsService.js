import { getToken } from "./authService";

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:5291";
const USE_MOCK_DATA = false;

// Dobijanje svih rezultata trenutnog korisnika
export async function getUserResults() {
  if (USE_MOCK_DATA) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Sortiranje po datumu
        const sortedResults = [...mockUserResults].sort(
          (a, b) => new Date(b.dateTaken) - new Date(a.dateTaken)
        );
        resolve(sortedResults);
      }, 500);
    });
  }

  const response = await fetch(`${API_BASE_URL}/api/user/results`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user results");
  }

  return await response.json();
}

// Dobijanje filtriranih rezultata
export async function getFilteredUserResults(filters = {}) {
  if (USE_MOCK_DATA) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filtered = [...mockUserResults];

        // Filtriranje po kategoriji
        if (filters.category) {
          filtered = filtered.filter(
            (result) =>
              result.quizCategory.toLowerCase() ===
              filters.category.toLowerCase()
          );
        }

        if (filters.dateRange) {
          const now = new Date();
          let startDate;

          switch (filters.dateRange) {
            case "lastMonth":
              startDate = new Date(
                now.getFullYear(),
                now.getMonth() - 1,
                now.getDate()
              );
              break;
            case "last3Months":
              startDate = new Date(
                now.getFullYear(),
                now.getMonth() - 3,
                now.getDate()
              );
              break;
            case "lastYear":
              startDate = new Date(
                now.getFullYear() - 1,
                now.getMonth(),
                now.getDate()
              );
              break;
            default:
              startDate = null;
          }

          if (startDate) {
            filtered = filtered.filter(
              (result) => new Date(result.dateTaken) >= startDate
            );
          }
        }

        // Filtriranje po kvizu
        if (filters.quizId) {
          filtered = filtered.filter(
            (result) => result.quizId === parseInt(filters.quizId)
          );
        }

        // Sortiranje po datumu
        filtered.sort((a, b) => new Date(b.dateTaken) - new Date(a.dateTaken));

        resolve(filtered);
      }, 300);
    });
  }

  const params = new URLSearchParams();
  if (filters.category) params.append("category", filters.category);
  if (filters.dateRange) params.append("dateRange", filters.dateRange);
  if (filters.quizId) params.append("quizId", filters.quizId);

  const response = await fetch(
    `${API_BASE_URL}/api/user/results/filtered?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch filtered results");
  }

  return await response.json();
}

export async function getDetailedResult(resultId) {
  console.log(` getDetailedResult called for ID: ${resultId}`);

  if (USE_MOCK_DATA) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const detailedResult = mockDetailedResults[resultId];
        if (detailedResult) {
          resolve(detailedResult);
        } else {
          reject(new Error("Result not found"));
        }
      }, 400);
    });
  }

  const url = `${API_BASE_URL}/api/QuizAttempt/${resultId}/details`;
  console.log(` Making API call to: ${url}`);

  const token = getToken();
  console.log(` Using token: ${token ? "exists" : "missing"}`);

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log(`📡 API response: ${response.status} ${response.statusText}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API Error: ${response.status} - ${errorText}`);

    if (response.status === 404) {
      throw new Error(
        `Quiz attempt ${resultId} not found or you don't have access to it`
      );
    } else if (response.status === 403) {
      throw new Error(
        `You don't have permission to access quiz attempt ${resultId}`
      );
    } else {
      throw new Error(
        `Failed to fetch detailed result: ${response.status} ${response.statusText}`
      );
    }
  }

  const responseData = await response.json();
  console.log(`API Response Data:`, responseData);
  console.log(`Data structure check:`, {
    hasUserAnswers: !!responseData.userAnswers,
    userAnswersCount: responseData.userAnswers?.length || 0,
    hasQuestions: !!responseData.questions,
    sampleKeys: Object.keys(responseData).slice(0, 10),
  });

  return responseData;
}

// Dobijanje statistika korisnika
export async function getUserStats() {
  if (USE_MOCK_DATA) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const totalQuizzes = mockUserResults.length;
        const totalQuestions = mockUserResults.reduce(
          (sum, result) => sum + result.totalQuestions,
          0
        );
        const totalCorrect = mockUserResults.reduce(
          (sum, result) => sum + result.correctAnswers,
          0
        );
        const averageScore =
          totalQuestions > 0
            ? Math.round((totalCorrect / totalQuestions) * 100)
            : 0;
        const bestScore = Math.max(...mockUserResults.map((r) => r.percentage));
        const totalTimeSpent = mockUserResults.reduce(
          (sum, result) => sum + result.timeSpent,
          0
        );

        // Grupiranje po kategorijama
        const categoryStats = mockUserResults.reduce((acc, result) => {
          if (!acc[result.quizCategory]) {
            acc[result.quizCategory] = {
              count: 0,
              totalScore: 0,
              bestScore: 0,
            };
          }
          acc[result.quizCategory].count++;
          acc[result.quizCategory].totalScore += result.percentage;
          acc[result.quizCategory].bestScore = Math.max(
            acc[result.quizCategory].bestScore,
            result.percentage
          );
          return acc;
        }, {});

        Object.keys(categoryStats).forEach((category) => {
          categoryStats[category].averageScore = Math.round(
            categoryStats[category].totalScore / categoryStats[category].count
          );
        });

        resolve({
          totalQuizzes,
          totalQuestions,
          totalCorrect,
          averageScore,
          bestScore,
          totalTimeSpent,
          categoryStats,
        });
      }, 400);
    });
  }

  const response = await fetch(`${API_BASE_URL}/api/user/stats`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user stats");
  }

  return await response.json();
}

export async function getProgressData(quizId) {
  if (USE_MOCK_DATA) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const quizResults = mockUserResults
          .filter((result) => result.quizId === parseInt(quizId))
          .sort((a, b) => new Date(a.dateTaken) - new Date(b.dateTaken));

        const progressData = quizResults.map((result, index) => ({
          attempt: index + 1,
          score: result.percentage,
          date: result.dateTaken,
          rank: result.rank,
        }));

        resolve(progressData);
      }, 300);
    });
  }

  const response = await fetch(`${API_BASE_URL}/api/user/progress/${quizId}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch progress data");
  }

  return await response.json();
}

export const userResultsService = {
  getUserResults,
  getFilteredUserResults,
  getDetailedResult,
  getUserStats,
  getProgressData,
};
