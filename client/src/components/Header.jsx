import { Link, useNavigate } from "react-router-dom";

import useAuth from "../context/useAuth";

import "./Header.css";


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
    <header className="site-header">
      <div className="site-header-inner">
        <Link
          className="site-title"
          to="/"
          aria-label="Dinner, Sorted home"
        >
          <span className="site-title-dinner">
            Dinner,
          </span>{" "}
          <span className="site-title-sorted">
            Sorted
          </span>
        </Link>

        <nav
          className="site-nav"
          aria-label="Main navigation"
        >
          <Link to="/">
            Home
          </Link>

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
              <Link to="/login">
                Log In
              </Link>

              <Link to="/signup">
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}


export default Header;