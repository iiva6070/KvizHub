import { getToken } from "./authService";

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:5291";
const USE_MOCK_DATA = false;

// Mock korisnički profil
const generateMockProfile = () => {
  return {
    id: "user123",
    username: "marko.petrovic",
    email: "marko@example.com",
    firstName: "Marko",
    lastName: "Petrović",
    bio: "Passionate software developer with a love for learning new technologies and solving complex problems. Always eager to take on new challenges.",
    location: "Beograd, Srbija",
    website: "https://marko-dev.com",
    profileImageUrl: null, // ili URL do slike
    registeredAt: "2023-12-01T10:00:00Z",
    stats: {
      completedQuizzes: 15,
      averageScore: 78,
      bestScore: 95,
      totalPoints: 1250,
      totalTimeSpent: 7200, // u sekundama
    },
    achievements: [
      {
        icon: "🥇",
        name: "Prvi kviz",
        description: "Završio prvi kviz na platformi",
      },
      {
        icon: "Books",
        name: "Student",
        description: "Završio 10 kvizova",
      },
      {
        icon: "Target",
        name: "Preciznost",
        description: "Postigao 90%+ na kvizu",
      },
      {
        icon: "⚡",
        name: "Brzina",
        description: "Završio kviz za rekordno vreme",
      },
    ],
  };
};

export async function getUserProfile(userId = null) {
  if (USE_MOCK_DATA) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(generateMockProfile());
      }, 600);
    });
  }

  try {
    const [profileResponse, statsResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/api/user/me`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }),
      fetch(`${API_BASE_URL}/api/QuizAttempt/stats/user/me`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }),
    ]);

    if (!profileResponse.ok) {
      throw new Error("Failed to fetch user profile");
    }

    const profile = await profileResponse.json();

    let stats = {
      completedQuizzes: 0,
      averageScore: 0,
      bestScore: 0,
      totalPoints: 0,
    };

    if (statsResponse.ok) {
      stats = await statsResponse.json();
    }

    // Combine profile and stats
    return {
      ...profile,
      stats: stats,
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
}

export async function updateUserProfile(profileData) {
  if (USE_MOCK_DATA) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockProfile = generateMockProfile();
        const updatedProfile = {
          ...mockProfile,
          username: profileData.username || mockProfile.username,
          email: profileData.email || mockProfile.email,
          firstName: profileData.firstName || mockProfile.firstName,
          lastName: profileData.lastName || mockProfile.lastName,
          bio: profileData.bio || mockProfile.bio,
          location: profileData.location || mockProfile.location,
          website: profileData.website || mockProfile.website,
        };

        if (profileData.profileImage) {
          updatedProfile.profileImageUrl = `https://example.com/images/${Date.now()}.jpg`;
        }

        resolve(updatedProfile);
      }, 1000);
    });
  }

  const updateData = {
    firstName: profileData.firstName || null,
    lastName: profileData.lastName || null,
    bio: profileData.bio || null,
    location: profileData.location || null,
    website:
      profileData.website && profileData.website.trim() !== ""
        ? profileData.website
        : null,
  };

  console.log(" Šaljem podatke na backend:", updateData);

  const response = await fetch(`${API_BASE_URL}/api/user/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(updateData),
  });

  console.log(" Response status:", response.status);
  console.log(" Response headers:", response.headers);

  if (!response.ok) {
    const error = await response.text();
    console.error("Backend error:", error);
    throw new Error(`Failed to update user profile: ${error}`);
  }

  const currentProfile = await getUserProfile();
  return {
    ...currentProfile,
    ...updateData,
  };
}

export async function uploadProfileImage(imageFile) {
  if (USE_MOCK_DATA) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          profileImageUrl: `https://example.com/images/${Date.now()}.jpg`,
        });
      }, 1500);
    });
  }

  const formData = new FormData();
  formData.append("profileImage", imageFile);

  const response = await fetch(`${API_BASE_URL}/api/user/profile/image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload profile image");
  }

  return await response.json();
}

export async function deleteProfileImage() {
  if (USE_MOCK_DATA) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 500);
    });
  }

  const response = await fetch(`${API_BASE_URL}/api/user/profile/image`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete profile image");
  }

  return await response.json();
}

export async function getPublicUserProfile(userId) {
  if (USE_MOCK_DATA) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockProfile = generateMockProfile();
        const publicProfile = {
          id: mockProfile.id,
          username: mockProfile.username,
          firstName: mockProfile.firstName,
          lastName: mockProfile.lastName,
          bio: mockProfile.bio,
          location: mockProfile.location,
          website: mockProfile.website,
          profileImageUrl: mockProfile.profileImageUrl,
          registeredAt: mockProfile.registeredAt,
          stats: mockProfile.stats,
          achievements: mockProfile.achievements,
        };
        resolve(publicProfile);
      }, 400);
    });
  }

  const response = await fetch(
    `${API_BASE_URL}/api/user/public-profile/${userId}`,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch public user profile");
  }

  return await response.json();
}

export const userProfileService = {
  getUserProfile,
  updateUserProfile,
  uploadProfileImage,
  deleteProfileImage,
  getPublicUserProfile,
};
