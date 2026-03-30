import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div>
      <nav className="navbar">
        <div className="nav-left">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/customers">Customers</Link>
          <Link to="/opportunities">Opportunities</Link>
        </div>

        <div className="nav-right">
          <span>{user?.username}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <main className="page-container">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;