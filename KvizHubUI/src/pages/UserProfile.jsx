import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, isAuthenticated } from "../services/authService";
import { userProfileService } from "../services/userProfileService";
import "./UserProfile.css";

function UserProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    bio: "",
    location: "",
    website: "",
    profileImage: null,
  });

  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    loadUserProfile();
  }, [navigate]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      try {
        console.log("Pokušavam da učitam profil iz backend-a...");
        const data = await userProfileService.getUserProfile();
        console.log("Backend profil podaci:", data);
        console.log(
          "Sva polja:",
          Object.keys(data).map((key) => `${key}: ${data[key]}`)
        );
        setProfile(data);
        setFormData({
          username: data.username || "",
          email: data.email || "",
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          bio: data.bio || "",
          location: data.location || "",
          website: data.website || "",
          profileImage: null,
        });
        setPreviewImage(data.profileImageUrl);
        return;
      } catch (backendError) {
        console.log("Backend greška:", backendError.message);

        const jwtUser = getCurrentUser();
        console.log("Fallback na JWT podatke:", jwtUser);

        if (jwtUser) {
          const profileData = {
            id: jwtUser.id || "unknown",
            firstName: jwtUser.firstName || jwtUser.given_name || "",
            lastName: jwtUser.lastName || jwtUser.family_name || "",
            email: jwtUser.email || "N/A",
            username:
              jwtUser.username || jwtUser.name || jwtUser.email || "N/A",
            bio: "",
            location: "",
            website: "",
            profileImage: null,
            profileImageUrl: null,
            registeredAt: new Date().toISOString(),
            dateJoined: new Date().toISOString(),
            stats: {
              completedQuizzes: 0,
              averageScore: 0,
              bestScore: 0,
              totalPoints: 0,
            },
            totalQuizzesTaken: 0,
            averageScore: 0,
          };

          setProfile(profileData);
          setFormData({
            username: profileData.username,
            email: profileData.email,
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            bio: profileData.bio,
            location: profileData.location,
            website: profileData.website,
            profileImage: null,
          });
          setPreviewImage(profileData.profileImageUrl);
        } else {
          setError("Nisu pronađeni podaci o korisniku");
        }
      }
    } catch (err) {
      console.error("Error loading profile:", err);
      setError("Greška pri učitavanju profila");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Slika ne sme biti veća od 5MB");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        profileImage: file,
      }));

      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setSaveLoading(true);
      setError(null);

      const updatedProfile = await userProfileService.updateUserProfile(
        formData
      );
      setProfile(updatedProfile);
      setIsEditing(false);

      if (formData.profileImage) {
        setPreviewImage(updatedProfile.profileImageUrl);
      }
    } catch (err) {
      setError("Greška pri čuvanju profila");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancel = () => {
    if (!profile) return;

    setIsEditing(false);
    setFormData({
      username: profile.username || "",
      email: profile.email || "",
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      bio: profile.bio || "",
      location: profile.location || "",
      website: profile.website || "",
      profileImage: null,
    });
    setPreviewImage(profile.profileImageUrl);
    setError(null);
  };

  const getInitials = (firstName, lastName, username) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (username) {
      return username.slice(0, 2).toUpperCase();
    }
    return "??";
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Učitavanje profila...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-error">
        <h2>Profil nije pronađen</h2>
        <button onClick={() => navigate("/")} className="btn-primary">
          Nazad na početnu
        </button>
      </div>
    );
  }

  return (
    <div className="user-profile">
      <div className="profile-header">
        <div className="profile-cover">
          <div className="profile-avatar-section">
            <div className="profile-avatar-container">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Profile"
                  className="profile-avatar"
                />
              ) : (
                <div className="profile-avatar-placeholder">
                  {getInitials(
                    profile.firstName,
                    profile.lastName,
                    profile.username
                  )}
                </div>
              )}

              {isEditing && (
                <div className="avatar-upload">
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="avatar-input"
                  />
                  <label htmlFor="avatar-upload" className="avatar-upload-btn">
                    📷
                  </label>
                </div>
              )}
            </div>

            <div className="profile-name-section">
              <h1>
                {profile.firstName && profile.lastName
                  ? `${profile.firstName} ${profile.lastName}`
                  : profile.username}
              </h1>
              <p className="profile-username">@{profile.username}</p>
            </div>
          </div>

          <div className="profile-actions">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-primary"
              >
                ✏️ Uredi profil
              </button>
            ) : (
              <div className="edit-actions">
                <button
                  onClick={handleCancel}
                  className="btn-secondary"
                  disabled={saveLoading}
                >
                  Otkaži
                </button>
                <button
                  onClick={handleSave}
                  className="btn-primary"
                  disabled={saveLoading}
                >
                  {saveLoading ? "Čuvanje..." : "Sačuvaj"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="profile-content">
        <div className="profile-main">
          <div className="profile-info-card">
            <h2>Lične informacije</h2>

            {isEditing ? (
              <div className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">Ime:</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName">Prezime:</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="username">Korisničko ime:</label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="bio">O meni:</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="form-textarea"
                    rows="4"
                    placeholder="Napišite nešto o sebi..."
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="location">Lokacija:</label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="npr. Beograd, Srbija"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="website">Website:</label>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="profile-display">
                <div className="info-item">
                  <label>Email:</label>
                  <span>{profile.email}</span>
                </div>

                {profile.bio && (
                  <div className="info-item">
                    <label>O meni:</label>
                    <p className="bio-text">{profile.bio}</p>
                  </div>
                )}

                {profile.location && (
                  <div className="info-item">
                    <label>Lokacija:</label>
                    <span> {profile.location}</span>
                  </div>
                )}

                {profile.website && (
                  <div className="info-item">
                    <label>Website:</label>
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      🔗 {profile.website}
                    </a>
                  </div>
                )}

                <div className="info-item">
                  <label>Član od:</label>
                  <span>
                    {new Date(profile.createdAt).toLocaleDateString("sr-RS")}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="profile-sidebar">
          <div className="stats-card">
            <h3> Statistike</h3>
            <div className="stat-item">
              <span className="stat-label">Završeni kvizovi:</span>
              <span className="stat-value">
                {profile.stats?.completedQuizzes || 0}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Prosečan rezultat:</span>
              <span className="stat-value">
                {profile.stats?.averageScore || 0}%
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Najbolji rezultat:</span>
              <span className="stat-value">
                {profile.stats?.bestScore || 0}%
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Ukupni bodovi:</span>
              <span className="stat-value">
                {profile.stats?.totalPoints || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
