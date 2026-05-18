import { getToken } from "./authService";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function createQuestion(quizId, questionData) {
  const response = await fetch(
    `${API_BASE_URL}/quiz/${quizId}/createQuestion`,
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
    let errorPayload;
    try {
      errorPayload = await response.json();
    } catch {
      throw new Error(`Failed to create question. Status: ${response.status}`);
    }

    if (errorPayload?.errors) {
      const error = new Error("Validation failed");
      error.errors = errorPayload.errors.map((e) => e.ErrorMessage);
      throw error;
    }

    throw new Error(errorPayload.error || "Failed to create question");
  }

  return await response.json();
}

export async function getQuestionForEdit(quizId, questionId) {
  const res = await fetch(
    `${API_BASE_URL}/quiz/getQuestionForEdit/${quizId}/questions/${questionId}`,
    {
      headers: { Authorization: `Bearer ${getToken()}` },
    }
  );
  if (!res.ok) throw new Error("Failed to load question");
  return await res.json();
}

export async function updateQuestion(quizId, dto) {
  try {
    console.log("Sending DTO to backend:", dto);

    const res = await fetch(
      `${API_BASE_URL}/quiz/update/${quizId}/questions/${dto.id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dto),
      }
    );

    if (!res.ok) {
      let errorData;

      try {
        errorData = await res.json();
      } catch {
        const text = await res.text();
        errorData = {
          error: text || `Failed to update question. Status: ${res.status}`,
        };
      }

      console.error("Backend update error:", errorData);
      throw errorData;
    }

    console.log("Question updated successfully:", dto);
    return await res.json();
  } catch (err) {
    console.error("Fetch error while updating question:", err);
    throw err;
  }
}

export async function deleteQuestion(quizId, questionId) {
  const res = await fetch(
    `${API_BASE_URL}/quiz/delete/${quizId}/questions/${questionId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    }
  );

  if (!res.ok) {
    const rawBody = await res.text();
    let errorMessage = `Failed to delete question. Status: ${res.status}`;

    if (rawBody) {
      try {
        const parsed = JSON.parse(rawBody);
        errorMessage = parsed.error || JSON.stringify(parsed);
      } catch {
        errorMessage = rawBody;
      }
    }

    console.error("Backend delete error:", errorMessage);
    throw new Error(errorMessage);
  }

  console.log(
    ` Question ${questionId} from quiz ${quizId} deleted successfully`
  );
}
