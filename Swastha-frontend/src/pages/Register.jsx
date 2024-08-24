/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { registerApi } from "../apis/Api";

const Register = () => {
  const navigate = useNavigate();
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(""); // State to track password strength
  const [emailError, setEmailError] = useState(""); // State to track email validation feedback
  const [phoneError, setPhoneError] = useState(""); // State to track phone validation feedback

  const changeUserName = (e) => {
    setUserName(e.target.value);
  };

  const changeEmail = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    validateEmail(newEmail);
  };

  const changePhoneNumber = (e) => {
    const newPhoneNumber = e.target.value;
    setPhoneNumber(newPhoneNumber);
    validatePhoneNumber(newPhoneNumber);
  };

  const changePassword = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    assessPasswordStrength(newPassword);
  };

  const changeConfirmPassword = (e) => {
    setConfirmPassword(e.target.value);
  };

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Email format is incorrect.");
    } else {
      setEmailError("");
    }
  };

  const validatePhoneNumber = (number) => {
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(number)) {
      setPhoneError("Phone number must be 10 digits.");
    } else {
      setPhoneError("");
    }
  };

  // Function to assess password strength
  const assessPasswordStrength = (password) => {
    const specialCharacterRegex = /[!@#$%^&*(),.?":{}|<>]/;
    const uppercaseRegex = /[A-Z]/;
    const lowercaseRegex = /[a-z]/;
    const numberRegex = /[0-9]/;

    let strength = "Weak";
    if (password.length >= 8) {
      if (
        specialCharacterRegex.test(password) &&
        uppercaseRegex.test(password) &&
        lowercaseRegex.test(password) &&
        numberRegex.test(password)
      ) {
        strength = "Strong";
      } else if (
        (specialCharacterRegex.test(password) &&
          uppercaseRegex.test(password)) ||
        (lowercaseRegex.test(password) && numberRegex.test(password))
      ) {
        strength = "Medium";
      }
    }

    setPasswordStrength(strength);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (emailError || phoneError) {
      toast.error("Please fix the validation errors.");
      return;
    }

    if (passwordStrength === "Weak") {
      toast.error("Password is too weak. Please choose a stronger password.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    const data = {
      username,
      email,
      phoneNumber,
      password,
      confirmPassword,
    };

    registerApi(data)
      .then((res) => {
        if (res.data.success === true) {
          toast.success(res.data.message);
          navigate("/login");
        } else {
          // Display specific error messages returned from the backend
          if (res.data.errors) {
            res.data.errors.forEach((error) => toast.error(error.msg));
          } else {
            toast.error(res.data.message);
          }
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Internal Server Error!");
      });
  };

  return (
    <>
      <section className="row min-vh-100 align-items-center">
        <div className="container py-5 d-flex justify-content-center">
          <div className="col col-md-10 col-sm-12 col-lg-8">
            <div className="card d-flex align-items-center shadow-lg">
              <div className="row">
                <div className="col-md-6 col-lg-6 order-md-1 order-lg-1 mb-4">
                  <img
                    src="https://i.pinimg.com/564x/a7/dd/af/a7ddaf4475ec3822a9b8aebb2956e253.jpg"
                    alt="Register image"
                    className="img-fluid"
                    style={{ marginTop: "100px" }}
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

                      <h3 className="fw-bold d-flex justify-content-center">
                        Register
                      </h3>

                      {/* Username */}
                      <div className="form-outline mb-2">
                        <label className="form-label">Full Name</label>
                        <input
                          onChange={changeUserName}
                          value={username}
                          type="text"
                          className="form-control form-control-lg border-2 border-black"
                        />
                      </div>
                      {/* Email */}
                      <div className="form-outline mb-2">
                        <label className="form-label">Email address</label>
                        <input
                          onChange={changeEmail}
                          value={email}
                          type="email"
                          className="form-control form-control-lg border-2 border-black"
                        />
                        {emailError && (
                          <small className="text-danger">{emailError}</small>
                        )}
                      </div>
                      {/* Phone Number */}
                      <div className="form-outline mb-2">
                        <label className="form-label">Phone Number</label>
                        <input
                          onChange={changePhoneNumber}
                          value={phoneNumber}
                          type="number"
                          className="form-control form-control-lg border-2 border-black"
                        />
                        {phoneError && (
                          <small className="text-danger">{phoneError}</small>
                        )}
                      </div>

                      {/* Password */}
                      <div className="form-outline mb-2">
                        <label className="form-label">Password</label>
                        <input
                          onChange={changePassword}
                          value={password}
                          type="password"
                          className="form-control form-control-lg border-2 border-black"
                        />
                        <small className="text-muted">
                          Password must contain at least 8 characters, including
                          an uppercase letter, a lowercase letter, a number, and
                          a special character.
                        </small>
                        <small
                          className={`password-strength mt-2 ${
                            passwordStrength === "Strong"
                              ? "text-success"
                              : passwordStrength === "Medium"
                              ? "text-warning"
                              : "text-danger"
                          }`}
                        >
                          {passwordStrength &&
                            `Password Strength: ${passwordStrength}`}
                        </small>
                      </div>
                      {/* Confirm Password */}
                      <div className="form-outline mb-2">
                        <label className="form-label">Confirm Password</label>
                        <input
                          onChange={changeConfirmPassword}
                          value={confirmPassword}
                          type="password"
                          className="form-control form-control-lg border-2 border-black"
                        />
                      </div>

                      {/* Register button */}
                      <div className="pt-1 mb-3 d-flex text-center justify-content-center">
                        <button
                          className="btn w-50 mb-2 btn btn-dark"
                          type="submit"
                        >
                          Register
                        </button>
                      </div>

                      <p className="mb-5 pb-lg-2 d-flex justify-content-center">
                        Already have an account?{" "}
                        <a
                          href="/login"
                          className="text-decoration-none text-black"
                        >
                          Login
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
    </>
  );
};

export default Register;
