import { useEffect, useState } from "react";
import { adminService } from "../../services/adminService";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Učitavanje korisnika...</p>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="management-header">
        <h2>👥 Upravljanje korisnicima</h2>
        <div className="user-stats">
          <span>Ukupno: {users.length} korisnika</span>
        </div>
      </div>

      <div className="user-list">
        {users.map((user) => (
          <div key={user.id} className="user-item">
            <div className="user-avatar">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <h3>{user.username}</h3>
              <p>{user.email}</p>
              <div className="user-meta">
                <span>Rola: {user.role}</span>
                <span>
                  Registrovan:{" "}
                  {new Date(user.registeredAt).toLocaleDateString()}
                </span>
                <span>Kvizovi: {user.completedQuizzes}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserManagement;
