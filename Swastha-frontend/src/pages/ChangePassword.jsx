/* eslint-disable jsx-a11y/img-redundant-alt */
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { changePasswordApi } from "../apis/Api";

const ChangePassword = () => {
  const navigate = useNavigate();
  const { userId } = useParams(); // User ID is passed in the URL

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  useEffect(() => {
    if (!userId) {
      toast.error("Invalid User ID");
      navigate("/login"); // Redirect to login if user ID is invalid or missing
    }
  }, [userId, navigate]);

  const handleOldPassword = (e) => {
    setOldPassword(e.target.value);
  };

  const handleNewPassword = (e) => {
    const newPwd = e.target.value;
    setNewPassword(newPwd);

    if (newPwd === oldPassword) {
      setPasswordMessage("New password cannot be the same as the old password.");
    } else {
      setPasswordMessage("");
    }
  };

  const handleConfirmPassword = (e) => {
    setConfirmPassword(e.target.value);
  };

  // Validation function for password complexity
  const isValidPassword = (password) => {
    const specialCharacterRegex = /[!@#$%^&*(),.?":{}|<>]/;
    const uppercaseRegex = /[A-Z]/;
    const lowercaseRegex = /[a-z]/;
    const numberRegex = /[0-9]/;

    return (
      password.length >= 8 &&
      specialCharacterRegex.test(password) &&
      uppercaseRegex.test(password) &&
      lowercaseRegex.test(password) &&
      numberRegex.test(password)
    );
  };

  const handleChangePassword = async () => {
    // Validate the new password
    if (!isValidPassword(newPassword)) {
      toast.error(
        "Password must be at least 8 characters long and contain a special character, uppercase letter, lowercase letter, and number."
      );
      return;
    }
  
    if (newPassword === oldPassword) {
      toast.error("New password cannot be the same as the old password.");
      return;
    }
  
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
  
    const data = {
      oldPassword,
      newPassword,
    };

    try {
      console.log("Password change request data:", data); // Log the data being sent
  
      const response = await changePasswordApi(data, userId);
      if (response.data.success) {
        toast.success(response.data.message);
  
        // Log out the user and redirect to the login page after successful password change
        localStorage.removeItem("token"); // Remove the token from localStorage
        navigate("/login"); // Redirect to the login page after removing the token
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      console.error("Error during password change:", err.response?.data || err.message); // Log detailed error response
      toast.error("Failed to change password. Please check the input data and try again.");
    }
  };  

  return (
    <section className="row min-vh-100 align-items-center">
      <div className="container py-5 d-flex justify-content-center">
        <div className="col col-md-10 col-sm-12 col-lg-8">
          <div className="card d-flex align-items-center shadow-lg">
            <div className="row">
              {/* Back button in top left corner */}
              <div className="col-12 position-relative">
                <button
                  type="button"
                  className="btn btn-link p-0"
                  style={{
                    fontSize: "1.5rem",
                    position: "absolute",
                    top: "20px",
                    left: "20px",
                  }}
                  onClick={() => navigate("/profile")}
                >
                  <FontAwesomeIcon icon={faArrowLeft} />
                </button>
              </div>

              <div className="col-md-6 col-lg-6 order-md-1 order-lg-1 mb-4">
                <img
                  src="https://i.pinimg.com/564x/76/38/69/763869a33c8ac9e99a59500992c11127.jpg"
                  alt="change password"
                  className="img-fluid"
                  style={{ marginTop: "100px" }}
                />
              </div>

              <div className="col-md-6 col-lg-6 order-lg-3 d-flex align-items-center">
                <div className="card-body p-5 p-lg-5 text-black">
                  <form>
                    <div className="mb-4 d-flex justify-content-center">
                      <i className="fas fa-cubes fa-2x me-2"></i>
                    </div>
                    <h3 className="fw-bold mb-3 pb-3 d-flex justify-content-center">
                      Change Your Password
                    </h3>
                    <div className="form-outline mb-4">
                      <label className="form-label">Enter Old Password</label>
                      <input
                        value={oldPassword}
                        onChange={handleOldPassword}
                        type="password"
                        className="form-control form-control-lg border-2 border-black"
                        required
                      />
                    </div>
                    <div className="form-outline mb-4">
                      <label className="form-label">Enter New Password</label>
                      <input
                        value={newPassword}
                        onChange={handleNewPassword}
                        type="password"
                        className="form-control form-control-lg border-2 border-black"
                        required
                      />
                      {passwordMessage && (
                        <small className="text-danger mt-2">{passwordMessage}</small>
                      )}
                    </div>
                    <div className="form-outline mb-4">
                      <label className="form-label">Confirm New Password</label>
                      <input
                        value={confirmPassword}
                        onChange={handleConfirmPassword}
                        type="password"
                        className="form-control form-control-lg border-2 border-black"
                        required
                      />
                    </div>
                    <div className="pt-1 mb-4 d-flex text-center justify-content-center">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleChangePassword();
                        }}
                        className="btn w-50 mb-2 btn btn-dark"
                        type="button"
                      >
                        Change Password
                      </button>
                    </div>
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

export default ChangePassword;
