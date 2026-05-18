import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RegisterModel from "../../models/registerModel";
import { register } from "../../services/authService";
import "../Auth/AuthForm.css";

function RegisterContainer() {
  const navigate = useNavigate();
  const [registerModel, setRegisterModel] = useState(new RegisterModel());
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
    const updatedModel = new RegisterModel(
      name === "username" ? value : registerModel.username,
      name === "email" ? value : registerModel.email,
      name === "password" ? value : registerModel.password,
      name === "confirmPassword" ? value : registerModel.confirmPassword,
      name === "firstName" ? value : registerModel.firstName,
      name === "lastName" ? value : registerModel.lastName
    );
    setRegisterModel(updatedModel);
    setErrors({ ...errors, [name]: undefined });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const validation = registerModel.validate();
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    try {
      await register(registerModel.toJSON());
      navigate("/login");
    } catch (err) {
      setServerError(err.message || "Greška pri registraciji.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form" style={{ width: "100%" }}>
        <h2 className="auth-title">Registracija</h2>

        <div className="form-group" style={formGroupStyle}>
          <input
            name="username"
            type="text"
            placeholder="Korisničko ime"
            value={registerModel.username}
            onChange={handleChange}
            className={`form-input ${errors.username ? "error" : ""}`}
            autoComplete="username"
            style={inputStyle}
          />
          {errors.username && <div className="error-message">{errors.username}</div>}
        </div>

        <div className="form-group" style={formGroupStyle}>
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={registerModel.email}
            onChange={handleChange}
            className={`form-input ${errors.email ? "error" : ""}`}
            autoComplete="email"
            style={inputStyle}
          />
          {errors.email && <div className="error-message">{errors.email}</div>}
        </div>

        <div className="form-group" style={formGroupStyle}>
          <input
            name="password"
            type="password"
            placeholder="Lozinka"
            value={registerModel.password}
            onChange={handleChange}
            className={`form-input ${errors.password ? "error" : ""}`}
            autoComplete="new-password"
            style={inputStyle}
          />
          {errors.password && <div className="error-message">{errors.password}</div>}
        </div>

        <div className="form-group" style={formGroupStyle}>
          <input
            name="confirmPassword"
            type="password"
            placeholder="Potvrdite lozinku"
            value={registerModel.confirmPassword}
            onChange={handleChange}
            className={`form-input ${errors.confirmPassword ? "error" : ""}`}
            autoComplete="new-password"
            style={inputStyle}
          />
          {errors.confirmPassword && (
            <div className="error-message">{errors.confirmPassword}</div>
          )}
        </div>

        <div className="form-group" style={formGroupStyle}>
          <input
            name="firstName"
            type="text"
            placeholder="Ime (opciono)"
            value={registerModel.firstName}
            onChange={handleChange}
            className={`form-input ${errors.firstName ? "error" : ""}`}
            autoComplete="given-name"
            style={inputStyle}
          />
          {errors.firstName && <div className="error-message">{errors.firstName}</div>}
        </div>

        <div className="form-group" style={formGroupStyle}>
          <input
            name="lastName"
            type="text"
            placeholder="Prezime (opciono)"
            value={registerModel.lastName}
            onChange={handleChange}
            className={`form-input ${errors.lastName ? "error" : ""}`}
            autoComplete="family-name"
            style={inputStyle}
          />
          {errors.lastName && <div className="error-message">{errors.lastName}</div>}
        </div>

        {serverError && <div className="server-error">{serverError}</div>}

        <button type="submit" disabled={loading} className="auth-button">
          {loading && <span className="loading-spinner"></span>}
          {loading ? "Registracija..." : "Registruj se"}
        </button>

        <div className="auth-link-container">
          <span>Već imate nalog? </span>
          <a
            href="/login"
            className="auth-link"
            onClick={(e) => {
              e.preventDefault();
              navigate("/login");
            }}
          >
            Prijavite se
          </a>
        </div>
      </form>
    </div>
  );
}

export default RegisterContainer;