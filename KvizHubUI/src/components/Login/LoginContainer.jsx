import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginModel from "../../models/loginModel";
import { login } from "../../services/authService";
import "../Auth/AuthForm.css";

function LoginContainer() {
  const navigate = useNavigate();
  const [loginModel, setLoginModel] = useState(new LoginModel());
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
  };

  const formGroupStyle = {
    width: "100%",
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedModel = new LoginModel(
      name === "usernameOrEmail" ? value : loginModel.usernameOrEmail,
      name === "password" ? value : loginModel.password
    );

    setLoginModel(updatedModel);
    setErrors({ ...errors, [name]: undefined });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const validation = loginModel.validate();

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);

    try {
      await login(loginModel.toJSON());
      navigate("/");
    } catch (err) {
      setServerError(err.message || "Greška pri prijavi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="auth-container">
        <form
          onSubmit={handleSubmit}
          className="auth-form"
          style={{ width: "100%" }}
        >
          <h2 className="auth-title">Prijava</h2>

          <div className="form-group" style={formGroupStyle}>
            <input
              name="usernameOrEmail"
              type="text"
              placeholder="Korisničko ime ili email"
              value={loginModel.usernameOrEmail}
              onChange={handleChange}
              className={`form-input ${
                errors.usernameOrEmail ? "error" : ""
              }`}
              autoComplete="username"
              style={inputStyle}
            />

            {errors.usernameOrEmail && (
              <div className="error-message">
                {errors.usernameOrEmail}
              </div>
            )}
          </div>

          <div className="form-group" style={formGroupStyle}>
            <input
              name="password"
              type="password"
              placeholder="Lozinka"
              value={loginModel.password}
              onChange={handleChange}
              className={`form-input ${errors.password ? "error" : ""}`}
              autoComplete="current-password"
              style={inputStyle}
            />

            {errors.password && (
              <div className="error-message">{errors.password}</div>
            )}
          </div>

          {serverError && (
            <div className="server-error">{serverError}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="auth-button"
          >
            {loading && <span className="loading-spinner"></span>}
            {loading ? "Prijavljivanje..." : "Prijavi se"}
          </button>

          <div className="auth-link-container">
            <span>Nemate nalog? </span>

            <a
              href="/register"
              className="auth-link"
              onClick={(e) => {
                e.preventDefault();
                navigate("/register");
              }}
            >
              Registrujte se
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginContainer;