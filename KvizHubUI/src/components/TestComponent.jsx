function TestComponent() {
  console.log("TestComponent rendering...");

  const handleClick = async () => {
    console.log("Button clicked - starting API test");
    try {
      const response = await fetch("http://localhost:5232/api/quiz/10");
      console.log("Response received:", response.ok, response.status);
      alert(`Response: ${response.ok}, Status: ${response.status}`);
    } catch (error) {
      console.log("Error:", error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Ultra Simple Test</h1>
      <button
        onClick={handleClick}
        style={{ padding: "10px 20px", fontSize: "16px" }}
      >
        Test API Call
      </button>
      <p>Click button to test API manually.</p>
    </div>
  );
}

export default TestComponent;
