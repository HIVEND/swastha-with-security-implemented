/* eslint-disable eqeqeq */
/* eslint-disable no-unused-vars */
import {
  faEdit,
  faEye,
  faSearch,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  createDoctorApi,
  deleteDoctorApi,
  getPaginationApi,
} from "../../apis/Api";
import Sidebar from "../../components/Sidebar";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const filteredDoctors = doctors.filter((person) =>
    person.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const user = JSON.parse(localStorage.getItem("user"));
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [qualification, setQualification] = useState("");
  const [servicesOffered, setServicesOffered] = useState("");

  const [uploadValidId, setValidId] = useState(null);
  const [previewId, setPreviewId] = useState(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    setValidId(file);
    setPreviewId(URL.createObjectURL(file));
  };

  useEffect(() => {
    getPaginationApi(currentPage).then((res) => {
      setDoctors(res.data.doctors);
      setTotalPages(res.data.totalPages);
    });
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const [emailValidationMessage, setEmailValidationMessage] = useState("");
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
      setEmailValidationMessage("Invalid email format.");
    } else {
      setEmailValidationMessage("");
    }
  };

  const handleEmailChange = (e) => {
    const emailValue = e.target.value;
    setEmail(emailValue);
    validateEmail(emailValue);
  };

  const handlePasswordChange = (e) => {
    const passwordValue = e.target.value;
    setPassword(passwordValue);
  };

  const [validationMessage, setValidationMessage] = useState("");

  const validatePhoneNumber = (number) => {
    const regex = /^\d{10}$/;
    if (!regex.test(number)) {
      setValidationMessage("Invalid phone number. Must be 10 digits.");
    } else {
      setValidationMessage("");
    }
  };

  const handlePhoneNumberChange = (e) => {
    const number = e.target.value;
    setPhoneNumber(number);
    validatePhoneNumber(number);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (emailValidationMessage || validationMessage) {
      toast.error("Please correct the validation errors before submitting.");
      return;
    }

    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("phoneNumber", phoneNumber);
    formData.append("gender", gender);
    formData.append("address", address);
    formData.append("city", city);
    formData.append("state", state);
    formData.append("qualification", qualification);
    formData.append("servicesOffered", servicesOffered);
    formData.append("uploadValidId", uploadValidId);
    formData.append("user", user);

    createDoctorApi(formData)
      .then((res) => {
        if (res.data.success === false) {
          toast.error(res.data.message);
        } else {
          toast.success(res.data.message);
          // Reset form fields after successful submission
          setFullName("");
          setEmail("");
          setPassword("");
          setPhoneNumber("");
          setGender("");
          setAddress("");
          setCity("");
          setState("");
          setQualification("");
          setServicesOffered("");
          setValidId(null);
          setPreviewId(null);
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Internal Server Error!");
      });
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this doctor's information?"
    );
    if (!confirmDelete) {
      return;
    }

    deleteDoctorApi(id)
      .then((res) => {
        if (res.data.success === false) {
          toast.error(res.data.message);
        } else {
          toast.success(res.data.message);
          setDoctors(doctors.filter((doctor) => doctor._id !== id));
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to delete doctor. Please try again.");
      });
  };

  return (
    <>
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-3 col-lg-2">
            <Sidebar />
          </div>

          <div className="col-md-9 col-lg-10">
            <div className="row">
              <div className="col">
                <h1 style={{ marginTop: 20 }}>Welcome Admin</h1>
                <h3 style={{ marginTop: 20 }}>Doctor Management</h3>
                <p>Manage the list of doctors.</p>

                <div className="d-flex justify-content-center">
                  <div
                    className="input-group mb-3 mx-auto"
                    style={{ maxWidth: "700px" }}
                  >
                    <span className="input-group-text">
                      <FontAwesomeIcon icon={faSearch} />
                    </span>
                    <input
                      type="text"
                      placeholder="Search by Name"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  className="btn w-20 mb-2 btn btn-dark"
                  data-bs-toggle="modal"
                  data-bs-target="#exampleModal"
                >
                  Add Doctor
                </button>
                <div
                  className="modal fade"
                  id="exampleModal"
                  tabIndex="-1"
                  aria-labelledby="exampleModalLabel"
                  aria-hidden="true"
                >
                  <div className="modal-dialog">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h1 className="modal-title fs-5" id="exampleModalLabel">
                          Add new doctor
                        </h1>
                        <button
                          type="button"
                          className="btn-close"
                          data-bs-dismiss="modal"
                          aria-label="Close"
                        ></button>
                      </div>
                      <div className="modal-body">
                        <label>Full Name</label>
                        <input
                          onChange={(e) => setFullName(e.target.value)}
                          value={fullName}
                          className="form-control mb-2"
                          type="text"
                          placeholder=""
                        />

                        <label>Email</label>
                        <input
                          onChange={handleEmailChange}
                          value={email}
                          className="form-control mb-2"
                          type="email"
                          placeholder=""
                        />
                        {emailValidationMessage && (
                          <div className="text-danger">
                            {emailValidationMessage}
                          </div>
                        )}
                        <label>Password</label>
                        <input
                          onChange={handlePasswordChange}
                          value={password}
                          className="form-control mb-2"
                          type="password"
                          placeholder=""
                        />

                        <label>Phone Number</label>
                        <input
                          onChange={handlePhoneNumberChange}
                          value={phoneNumber}
                          className="form-control mb-2"
                          type="number"
                          placeholder=""
                        />
                        {validationMessage && (
                          <div className="text-danger">{validationMessage}</div>
                        )}

                        <label>Gender</label>
                        <select
                          onChange={(e) => setGender(e.target.value)}
                          value={gender}
                          className="form-control mb-2"
                        >
                          <option value="">------Select------</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Others">Others</option>
                        </select>
                        <label>Address</label>
                        <input
                          onChange={(e) => setAddress(e.target.value)}
                          value={address}
                          className="form-control mb-2"
                          type="text"
                          placeholder=""
                        />

                        <label>City</label>
                        <input
                          onChange={(e) => setCity(e.target.value)}
                          value={city}
                          className="form-control mb-2"
                          type="text"
                          placeholder=""
                        />

                        <label>State</label>
                        <select
                          onChange={(e) => setState(e.target.value)}
                          value={state}
                          className="form-control mb-2"
                        >
                          <option value="">------Select------</option>
                          <option value="Province 1">Province 1</option>
                          <option value="Province 2">Province 2</option>
                          <option value="Bagmati Province">
                            Bagmati Province
                          </option>
                          <option value="Gandaki Province">
                            Gandaki Province
                          </option>
                          <option value="Lumbini Province">
                            Lumbini Province
                          </option>
                          <option value="Karnali Province">
                            Karnali Province
                          </option>
                          <option value="Sudurpashchim Province">
                            Sudurpashchim Province
                          </option>
                        </select>

                        <label>Qualification/Specialization</label>
                        <input
                          onChange={(e) => setQualification(e.target.value)}
                          value={qualification}
                          className="form-control mb-2"
                          type="text"
                          placeholder=""
                        />

                        <label>Services Offered</label>
                        <textarea
                          onChange={(e) => setServicesOffered(e.target.value)}
                          value={servicesOffered}
                          className="form-control mb-2"
                          placeholder=""
                        />

                        <label>Profile Picture</label>
                        <input
                          onChange={handleImageUpload}
                          className="form-control mb-2"
                          type="file"
                        />
                        {previewId && (
                          <img
                            src={previewId}
                            alt="Profile Preview"
                            className="img-fluid mt-2"
                          />
                        )}
                      </div>
                      <div className="modal-footer">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          data-bs-dismiss="modal"
                        >
                          Close
                        </button>
                        <button
                          onClick={handleSubmit}
                          type="button"
                          className="btn btn-primary"
                          data-bs-dismiss="modal"
                        >
                          Save changes
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col">
                <table className="table mt-2">
                  <thead className="table-dark">
                    <tr>
                      <th>SN</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone Number</th>
                      <th>Gender</th>
                      <th>Address</th>
                      <th>Qualification</th>
                      <th>Actions</th>
                    </tr>
                    </thead>
                  <tbody>
                    {filteredDoctors.map((doctor, index) => (
                      <tr key={doctor._id}>
                        <td>{index + 1}</td>
                        <td>{doctor.fullName}</td>
                        <td>{doctor.email}</td>
                        <td>{doctor.phoneNumber}</td>
                        <td>{doctor.gender}</td>
                        <td>{doctor.address}</td>
                        <td>{doctor.qualification}</td>
                        <td>
                          <div className="d-flex">
                            <Link
                              to={`/admin/view/${doctor._id}`}
                              className="btn btn me-2"
                            >
                              <FontAwesomeIcon icon={faEye} />
                            </Link>
                            <Link
                              to={`/admin/edit/${doctor._id}`}
                              className="btn btn me-2"
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </Link>
                            <button
                              onClick={() => handleDelete(doctor._id)}
                              className="btn btn"
                            >
                              <FontAwesomeIcon icon={faTrashAlt} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="row">
              <div className="col">
                <nav aria-label="Page navigation">
                  <ul className="pagination justify-content-center">
                    <li
                      className={`page-item ${
                        currentPage <= 1 ? "disabled" : ""
                      }`}
                    >
                      <button
                        className="page-link btn-dark"
                        onClick={() => handlePageChange(currentPage - 1)}
                        aria-label="Previous"
                      >
                        &laquo;
                      </button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <li
                          key={page}
                          className={`page-item ${
                            currentPage === page ? "active" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </button>
                        </li>
                      )
                    )}
                    <li
                      className={`page-item ${
                        currentPage >= totalPages ? "disabled" : ""
                      }`}
                    >
                      <button
                        className="page-link btn-dark"
                        onClick={() => handlePageChange(currentPage + 1)}
                        aria-label="Next"
                      >
                        &raquo;
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
