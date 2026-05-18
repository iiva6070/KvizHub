import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminStats from "../components/Admin/AdminStats";
import QuestionManagement from "../components/Admin/QuestionManagement";
import QuizManagement from "../components/Admin/QuizManagement";
import UserManagement from "../components/Admin/UserManagement";
import { getUserRole, isAuthenticated } from "../services/authService";
import "./AdminPanel.css";

function AdminPanel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("stats");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Proverava da li je korisnik ulogovan i da li ima admin dozvolu
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    const userRole = getUserRole();
    if (userRole !== "Admin") {
      navigate("/"); // Preusmeri na home ako nije admin
      return;
    }

    setIsLoading(false);
  }, [navigate]);

  const tabs = [
    { id: "stats", label: " Statistike", component: AdminStats },
    { id: "quizzes", label: " Kvizovi", component: QuizManagement },
    { id: "questions", label: " Pitanja", component: QuestionManagement },
    { id: "users", label: " Korisnici", component: UserManagement },
  ];

  if (isLoading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Učitavanje admin panela...</p>
      </div>
    );
  }

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component;

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <div className="admin-title">
          <h1> Admin Panel</h1>
          <p>Upravljanje QuizHub platformom</p>
        </div>
      </div>

      <div className="admin-content">
        <nav className="admin-nav">
          <div className="admin-nav-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`admin-tab ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        <div className="admin-main">
          {ActiveComponent && <ActiveComponent />}
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
