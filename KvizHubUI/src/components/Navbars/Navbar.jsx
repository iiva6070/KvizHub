import { useLocation, useNavigate } from "react-router-dom";
import {
  getUserRole,
  isAuthenticated,
  logout,
} from "../../services/authService";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const authenticated = isAuthenticated();
  const userRole = getUserRole();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand" onClick={() => navigate("/")}>
          <span className="brand-icon">💡</span>
          <span className="brand-text">KvizHub</span>
        </div>

        <div className="navbar-menu">
          <button
            className={`nav-link ${isActivePath("/") ? "active" : ""}`}
            onClick={() => navigate("/")}
          >
            Početna
          </button>

          <button
            className={`nav-link ${isActivePath("/quizzes") ? "active" : ""}`}
            onClick={() => navigate("/quizzes")}
          >
            Kvizovi
          </button>

          {authenticated && (
            <>
              <button
                className={`nav-link ${
                  isActivePath("/my-results") ? "active" : ""
                }`}
                onClick={() => navigate("/my-results")}
              >
                Moji rezultati
              </button>

              <button
                className={`nav-link ${
                  isActivePath("/leaderboard") ? "active" : ""
                }`}
                onClick={() => navigate("/leaderboard")}
              >
                Rang lista
              </button>

              {userRole === "Admin" && (
                <button
                  className={`nav-link ${
                    isActivePath("/admin") ? "active" : ""
                  }`}
                  onClick={() => navigate("/admin")}
                >
                  Admin panel
                </button>
              )}
            </>
          )}
        </div>

        <div className="navbar-actions">
          {authenticated ? (
            <div className="auth-actions">
              <button
                className={`profile-button ${
                  isActivePath("/profile") ? "active" : ""
                }`}
                onClick={() => navigate("/profile")}
              >
                Moj Profil
              </button>

              <button className="logout-button" onClick={handleLogout}>
                Odjavi se
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <button
                className="login-button"
                onClick={() => navigate("/login")}
              >
                Prijavi se
              </button>

              <button
                className="register-button"
                onClick={() => navigate("/register")}
              >
                Registruj se
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;