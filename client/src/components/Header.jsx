import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Unable to log out:", error);
    }
  }

  return (
    <header>
      <Link className="site-title" to="/">
        Dinner, Sorted
      </Link>

      <nav>
        <Link to="/">Home</Link>

        {user ? (
          <>
            <Link to="/meal-plans">
              My Meal Plans
            </Link>

            <span className="user-greeting">
              Hi, {user.username}
            </span>

            <button
              className="nav-button"
              type="button"
              onClick={handleLogout}
            >
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Log In</Link>
            <Link to="/signup">Sign Up</Link>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;