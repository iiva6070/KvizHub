import { Link, Route } from "react-router-dom";
import FullQuizComponent from "../components/Quiz/FullQuizComponent";
import NewQuizTaking from "../components/Quiz/NewQuizTaking";
import QuizTaking from "../components/Quiz/QuizTaking";
import QuizTakingMinimal from "../components/Quiz/QuizTakingMinimal";
import SuperSimpleQuiz from "../components/Quiz/SuperSimpleQuiz";
import QuizDebugger from "../components/QuizDebugger";
import SimpleTest from "../components/SimpleTest";
import TestComponent from "../components/TestComponent";
import AdminPanel from "../pages/AdminPanel";
import Leaderboard from "../pages/Leaderboard";
import Login from "../pages/Login";
import QuizBrowser from "../pages/QuizBrowser";
import QuizResultDetail from "../pages/QuizResultDetail";
import QuizResults from "../pages/QuizResults";
import Register from "../pages/Register";
import UserProfile from "../pages/UserProfile";
import UserResults from "../pages/UserResults";

// Privremena home komponenta
const Home = () => (
  <div
    style={{
      textAlign: "center",
      padding: "60px 40px",
      maxWidth: "800px",
      margin: "0 auto",
      minHeight: "calc(100vh - 200px)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    }}
  >
    <div
      style={{
        background: "#dcebff",
        padding: "50px",
        borderRadius: "24px",
        boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
      }}
    >
      <h1 style={{ color: "#1976d2", marginBottom: "20px", fontSize: "3rem" }}>
        Dobrodošli u KvizHub
      </h1>

      <p
        style={{
          fontSize: "18px",
          color: "#666",
          marginBottom: "40px",
          lineHeight: "1.6",
        }}
      >
        Platforma za testiranje znanja sa rang listom
      </p>

      <div
        style={{
          display: "flex",
          gap: "20px",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <Link
          to="/login"
          style={{
            padding: "16px 32px",
            background: "#1976d2",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
            fontWeight: "600",
            fontSize: "16px",
            transition: "all 0.3s ease",
          }}
        >
          Prijavi se
        </Link>

       <Link
  to="/register"
  style={{
    padding: "16px 32px",
    background: "#757575",
    color: "white",
    textDecoration: "none",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "16px",
    transition: "all 0.3s ease",
  }}
>
  Registruj se
</Link>

        <Link
          to="/quiz-browser"
          style={{
            padding: "16px 32px",
            background: "#4caf50",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
            fontWeight: "600",
            fontSize: "16px",
            transition: "all 0.3s ease",
          }}
        >
          Pregledaj kvizove
        </Link>
      </div>
    </div>
  </div>
);

export const primaryRoutes = [
  <Route key="home" path="/" element={<Home />} />,
  <Route key="quizzes" path="/quizzes" element={<QuizBrowser />} />,
  <Route key="quiz-browser" path="/quiz-browser" element={<QuizBrowser />} />,
  <Route key="quiz-taking" path="/quiz/:quizId" element={<QuizTaking />} />,
  <Route key="new-quiz" path="/newquiz/:quizId" element={<NewQuizTaking />} />,
  <Route
    key="simple-quiz"
    path="/simple/:quizId"
    element={<SuperSimpleQuiz />}
  />,
  <Route
    key="full-quiz"
    path="/full/:quizId"
    element={<FullQuizComponent />}
  />,
  <Route
    key="quiz-minimal"
    path="/minimal/:quizId"
    element={<QuizTakingMinimal />}
  />,
  <Route
    key="quiz-results"
    path="/quiz-results/:quizId"
    element={<QuizResults />}
  />,
  <Route key="user-results" path="/my-results" element={<UserResults />} />,
  <Route
    key="result-detail"
    path="/my-results/:resultId"
    element={<QuizResultDetail />}
  />,
  <Route key="leaderboard" path="/leaderboard" element={<Leaderboard />} />,
  <Route key="profile" path="/profile" element={<UserProfile />} />,
  <Route key="admin" path="/admin" element={<AdminPanel />} />,
  <Route key="debug" path="/debug" element={<QuizDebugger />} />,
  <Route key="simple-test" path="/simple-test" element={<SimpleTest />} />,
  <Route key="test" path="/test" element={<TestComponent />} />,
  <Route key="login" path="/login" element={<Login />} />,
  <Route key="register" path="/register" element={<Register />} />,
];