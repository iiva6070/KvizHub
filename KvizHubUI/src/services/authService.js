import { jwtDecode } from "jwt-decode";

const TOKEN_KEY = "token";

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  const token = localStorage.getItem(TOKEN_KEY);
  console.log(
    "🔑 getToken called, token exists:",
    !!token,
    token ? "length: " + token.length : "no token"
  );
  return token;
}

export function decodeToken() {
  const token = getToken();
  if (!token) {
    console.log("Token not found in localStorage");
    return null;
  }

  try {
    console.log("Raw token:", token);
    const decoded = jwtDecode(token);
    console.log("Decoded token:", decoded);
    return decoded;
  } catch (err) {
    console.error("Invalid token:", err.message);
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
}

export function getUserId() {
  const USE_MOCK_AUTH = false;

  if (USE_MOCK_AUTH) {
    return "user123";
  }

  const decoded = decodeToken();
  console.log(" getUserId - decoded token:", decoded);

  if (decoded) {
    const userId =
      decoded.sub ||
      decoded.userId ||
      decoded[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ] ||
      decoded.nameid ||
      decoded.id;

    console.log(" Found userId:", userId);
    return userId;
  }

  return null;
}

export function getCurrentUser() {
  const decoded = decodeToken();
  if (!decoded) return null;

  return {
    id:
      decoded[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ] ||
      decoded.sub ||
      decoded.userId,
    username:
      decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
      decoded.username ||
      decoded.name,
    email:
      decoded[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
      ] || decoded.email,
    role:
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      decoded.role ||
      decoded.Role ||
      decoded.roles ||
      decoded.Roles,
    isActive: decoded.IsActive,
  };
}

export function getUserRole() {
  const USE_MOCK_AUTH = false;

  if (USE_MOCK_AUTH) {
    return "Admin";
  }

  const decoded = decodeToken();

  return (
    decoded?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
    decoded?.role ||
    decoded?.Role ||
    decoded?.roles ||
    decoded?.Roles ||
    null
  );
}

export function isAuthenticated() {
  const USE_MOCK_AUTH = false;

  if (USE_MOCK_AUTH) {
    return true;
  }

  const token = getToken();
  if (!token) return false;

  try {
    const { exp } = jwtDecode(token);
    return exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function isAdmin() {
  return getUserRole() === "Admin";
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
}

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:5291";

export async function login(credentials) {
  console.log("Sending login data:", credentials);

  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Login failed");
  }

  const data = await response.json();
  saveToken(data.token);
  return data;
}

export async function register(userDetails) {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userDetails),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Registration failed");
  }

  const data = await response.json();
  return data;
}