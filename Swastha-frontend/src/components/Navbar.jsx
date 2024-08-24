import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  // Safely get user data from local storage
  let user;
  try {
    const userJson = localStorage.getItem("user");
    user = userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error("Error parsing user data from localStorage:", error);
    user = null; // Fallback to null if there's an error
  }

  // Logout function
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
    window.location.reload();
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleRegister = () => {
    navigate("/register");
  };

  const handleAppointmentHistory = () => {
    navigate("/history");
  };

  const handleNavigation = (path) => {
    if (user) {
      navigate(path);
    } else {
      navigate("/login");
    }
  };

  return (
    <>
      <header className="fixed-top bg-white sticky">
        <div className="container">
          <nav className="navbar navbar-expand-lg navbar-light">
            <a className="navbar-brand text-danger fw-bold" href="/">
              <img
                src="../assets/images/logo.png"
                style={{
                  width: "60px", // Reduced logo size
                  marginLeft: "0px",
                }}
                alt="logo"
              />
            </a>
            <button
              className="navbar-toggler"
              type="button"
              data-toggle="collapse"
              data-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="true"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            <div
              className="collapse navbar-collapse justify-content-center"
              id="navbarNav"
            >
              <ul className="navbar-nav">
                <li className="nav-item">
                  <a
                    className="nav-link active"
                    href="/"
                    style={{ fontSize: "0.9rem", padding: "8px 10px" }} // Reduced font size and padding
                  >
                    Home
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link active"
                    href="#about"
                    style={{ fontSize: "0.9rem", padding: "8px 10px" }} // Reduced font size and padding
                  >
                    About
                  </a>
                </li>
                <li className="nav-item">
                  <button
                    className="btn btn-link nav-link active"
                    onClick={() => handleNavigation("/healthpackages")}
                    style={{ fontSize: "0.9rem", padding: "8px 10px" }} // Reduced font size and padding
                  >
                    Health Packages
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className="btn btn-link nav-link active"
                    onClick={() => handleNavigation("/childcare")}
                    style={{ fontSize: "0.9rem", padding: "8px 10px" }} // Reduced font size and padding
                  >
                    Childcare
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className="btn btn-link nav-link active"
                    onClick={() => handleNavigation("/homepage")}
                    style={{ fontSize: "0.9rem", padding: "8px 10px" }} // Reduced font size and padding
                  >
                    Book Appointment
                  </button>
                </li>
              </ul>
            </div>

            <form className="d-flex gap-2" role="search">
              {user ? (
                <div className="dropdown">
                  <button
                    className="btn btn-primary dropdown-toggle"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style={{
                      fontSize: "0.9rem", // Reduced font size
                      padding: "8px 60px", // Reduced padding
                    }}
                  >
                    {user.UserName}
                  </button>
                  <ul className="dropdown-menu">
                    <li>
                      <Link className="dropdown-item" to="/profile">
                        Profile
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/audit">
                        User Audit
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/emergency">
                        Emergency Contacts
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={handleAppointmentHistory}
                        className="dropdown-item"
                      >
                        Appointment History
                      </button>
                    </li>
                    <li>
                      <button onClick={handleLogout} className="dropdown-item">
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-outline-primary"
                    onClick={handleRegister}
                    style={{ fontSize: "0.9rem", padding: "8px 16px" }} // Reduced font size and padding
                  >
                    Sign Up
                  </button>
                  <button
                    className="btn btn-outline-danger"
                    onClick={handleLogin}
                    style={{ fontSize: "0.9rem", padding: "8px 16px" }} // Reduced font size and padding
                  >
                    Login
                  </button>
                </div>
              )}
            </form>
          </nav>
        </div>
      </header>
    </>
  );
};

export default Navbar;
