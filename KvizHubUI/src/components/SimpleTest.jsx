import { useEffect, useState } from "react";

function SimpleTest() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    console.log("SimpleTest component mounted");
    alert("SimpleTest component mounted - check console for API test");
    setMessage("Component loaded successfully!");

    // Test osnovni fetch
    const testAPI = async () => {
      try {
        console.log("Starting API test...");
        alert("Starting API test...");
        const response = await fetch("http://localhost:5291/api/quiz/10");
        console.log("API response:", response.ok, response.status);
        alert(`API response: ${response.ok}, status: ${response.status}`);

        if (response.ok) {
          const data = await response.json();
          console.log("API data:", data);
          setMessage(`Success! Quiz: ${data.title}`);
          alert(`Success! Quiz: ${data.title}`);
        } else {
          setMessage(`API Error: ${response.status}`);
          alert(`API Error: ${response.status}`);
        }
      } catch (error) {
        console.error("API Error:", error);
        setMessage(`Network Error: ${error.message}`);
        alert(`Network Error: ${error.message}`);
      }
    };

    setTimeout(testAPI, 1000);
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>Simple API Test</h1>
      <p>Status: {message}</p>
      <p>Check browser console for detailed logs.</p>
      <p>You should see alerts indicating component lifecycle.</p>
    </div>
  );
}

export default SimpleTest;
