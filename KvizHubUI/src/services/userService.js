import { getToken } from "./authService";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const registerUser = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/users/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    let errorPayload;
    try {
      errorPayload = await response.json();
    } catch {
      throw new Error("Registration failed");
    }

    if (errorPayload?.errors) {
      const error = new Error("Validation failed");
      error.errors = errorPayload.errors.map((e) => e.ErrorMessage);
      throw error;
    }

    throw new Error(errorPayload.error || "Registration failed");
  }

  return await response.json();
};

export const loginUser = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Login failed");
  }

  const data = await response.json();

  localStorage.setItem("token", data.token);

  return data.token;
};

export async function fetchAllUsers() {
  const res = await fetch(`${API_BASE_URL}/users/getAllUsers`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error("Failed to fetch users");
  return await res.json();
}
