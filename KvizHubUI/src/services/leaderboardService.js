import { getToken, getUserId } from "./authService";

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:5291";
const USE_MOCK_DATA = false; 

// Dobijanje globalne rang liste
export async function getLeaderboard(filters = {}) {
  if (USE_MOCK_DATA) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filtered = []; // Mock data removed
        const currentUserId = getUserId();

        // Filtriranje po kategoriji
        if (filters.category) {
          filtered = filtered.filter(
            (entry) =>
              entry.quizCategory.toLowerCase() ===
              filters.category.toLowerCase()
          );
        }

        // Filtriranje po periodu
        if (filters.period && filters.period !== "all-time") {
          const now = new Date();
          let startDate;

          if (filters.period === "weekly") {
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          } else if (filters.period === "monthly") {
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          }

          if (startDate) {
            filtered = filtered.filter(
              (entry) => new Date(entry.dateTaken) >= startDate
            );
          }
        }

        // Filtriranje po kvizu
        if (filters.quizId) {
          filtered = filtered.filter(
            (entry) => entry.quizId === parseInt(filters.quizId)
          );
        }

       
        filtered.sort((a, b) => {
          if (b.percentage !== a.percentage) {
            return b.percentage - a.percentage;
          }
          
          return a.timeSpent - b.timeSpent;
        });

        
        const rankedData = filtered.map((entry, index) => ({
          ...entry,
          position: index + 1,
          isCurrentUser: entry.userId === currentUserId,
        }));

        resolve(rankedData);
      }, 500);
    });
  }

  const params = new URLSearchParams();
  if (filters.category) params.append("category", filters.category);
  if (filters.period) params.append("period", filters.period);
  if (filters.quizId) params.append("quizId", filters.quizId);

  const response = await fetch(
    `${API_BASE_URL}/leaderboard?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch leaderboard");
  }

  return await response.json();
}


export async function getQuizLeaderboard(quizId) {
  if (USE_MOCK_DATA) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const quizResults = []; // Mock data removed

        // Sortiranje po rezultatu
        quizResults.sort((a, b) => {
          if (b.percentage !== a.percentage) {
            return b.percentage - a.percentage;
          }
          return a.timeSpent - b.timeSpent;
        });

        // Uzmi top 10
        const top10 = quizResults.slice(0, 10).map((entry, index) => ({
          ...entry,
          position: index + 1,
          isCurrentUser: entry.userId === getUserId(),
        }));

        resolve(top10);
      }, 400);
    });
  }

  const response = await fetch(`${API_BASE_URL}/leaderboard/quiz/${quizId}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch quiz leaderboard");
  }

  return await response.json();
}

// Dobijanje pozicije korisnika u rang listi
export async function getUserRanking(userId = null) {
  if (USE_MOCK_DATA) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const targetUserId = userId || getUserId();
        const sortedData = []; 

        const userEntries = sortedData.filter(
          (entry) => entry.userId === targetUserId
        );

        if (userEntries.length === 0) {
          resolve({ position: null, totalParticipants: sortedData.length });
          return;
        }

        // Najbolji rezultat korisnika
        const bestResult = userEntries[0];
        const position =
          sortedData.findIndex(
            (entry) =>
              entry.userId === targetUserId &&
              entry.percentage === bestResult.percentage &&
              entry.timeSpent === bestResult.timeSpent
          ) + 1;

        resolve({
          position,
          totalParticipants: sortedData.length,
          bestResult,
        });
      }, 300);
    });
  }

  const targetUserId = userId || getUserId();
  const response = await fetch(
    `${API_BASE_URL}/leaderboard/user/${targetUserId}`,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch user ranking");
  }

  return await response.json();
}

export const leaderboardService = {
  getLeaderboard,
  getQuizLeaderboard,
  getUserRanking,
};
