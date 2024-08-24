/* eslint-disable eqeqeq */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/img-redundant-alt */
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { loginApi } from "../apis/Api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const changeEmail = (e) => {
    setEmail(e.target.value);
  };

  const changePassword = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    const data = {
      email,
      password,
    };
  
    // API Call
    loginApi(data)
      .then((res) => {
        if (!res.data.success) {
          toast.error(res.data.message || "Login failed. Please try again.");
        } else {
          toast.success(res.data.message);
  
          // Store the token in localStorage
          localStorage.setItem("token", res.data.token);
  
          // Store the user data in localStorage as a stringified JSON object
          const userData = {
            id: res.data.userData.id,
            email: res.data.userData.email,
            isAdmin: res.data.userData.isAdmin,
            username: res.data.userData.username, // Ensure username is saved
            phoneNumber: res.data.userData.phoneNumber, // Ensure phoneNumber is saved
          };
          localStorage.setItem("user", JSON.stringify(userData));
  
          // Redirect to appropriate page based on admin status
          if (res.data.userData.isAdmin) {
            navigate("/admin");
          } else {
            navigate("/userdashboard");
          }
        }
      })
      .catch((err) => {
        console.error("Login error:", err);
  
        // Handle specific error codes
        if (err.response) {
          if (err.response.status === 400) {
            toast.error("Invalid credentials. Please check your email and password.");
          } else if (err.response.status === 403) {
            toast.error(err.response.data.message || "Too many attempts, your account is temporarily locked.");
          } else if (err.response.status === 404) {
            toast.error("User does not exist. Please check your email and try again.");
          } else {
            toast.error(err.response.data.message || "An error occurred. Please try again later.");
          }
        } else {
          toast.error("Too many attempts, your account is temporarily locked. Try again after a few minutes.");
        }
      });
  };
  

  return (
    <section className="row min-vh-100 align-items-center">
      <div className="container py-5 d-flex justify-content-center">
        <div className="col col-md-10 col-sm-12 col-lg-8">
          <div className="card d-flex align-items-center shadow-lg">
            <div className="row">
              <div className="col-md-6 col-lg-6 order-md-1 order-lg-1 mb-4">
                <img
                  src="../assets/images/login.png"
                  alt="login image"
                  className="img-fluid"
                  style={{ marginTop: 20 }}
                />
              </div>

              <div>
                <a
                  className="position-absolute top-0 end-0 m-2 text-black"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate("/")}
                >
                  <FontAwesomeIcon icon={faClose} />
                </a>
              </div>
              <div className="col-md-6 col-lg-6 order-lg-3 d-flex align-items-center">
                <div className="card-body p-5 p-lg-5 text-black">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4 d-flex justify-content-center">
                      <i className="fas fa-cubes fa-2x me-2"></i>
                    </div>

                    <h3 className="fw-bold d-flex justify-content-center mb-4">
                      Log In!!!
                    </h3>

                    <div className="form-outline mb-3">
                      <label className="form-label">Email address</label>
                      <input
                        onChange={changeEmail}
                        value={email}
                        type="email"
                        className="form-control form-control-lg border-2 border-black"
                      />
                    </div>

                    <div className="form-outline mb-3">
                      <label className="form-label">Password</label>
                      <input
                        onChange={changePassword}
                        value={password}
                        type="password"
                        className="form-control form-control-lg border-2 border-black"
                      />
                    </div>

                    <a
                      href="/forgotPassword"
                      className="text-decoration-none text-black ms-2 mb-2"
                    >
                      Forgot password?
                    </a>

                    <div className="pt-1 mb-3 d-flex text-center justify-content-center">
                      <button
                        className="btn w-50 mb-2 btn btn-dark"
                        type="submit"
                      >
                        Login
                      </button>
                    </div>

                    <p className="mb-2 d-flex justify-content-center">
                      Don't have an account?
                      <a
                        href="/register"
                        className="text-decoration-none text-black ms-1"
                      >
                        Click here
                      </a>
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
