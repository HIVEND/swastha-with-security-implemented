import React, { useEffect, useState } from "react";
import { deleteUserApi, getPagination } from "../../apis/Api";
import Sidebar from "../../components/Sidebar";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt, faSearch } from "@fortawesome/free-solid-svg-icons";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getPagination(currentPage);
        if (res.data.success) {
          setUsers(res.data.users);
          setTotalPages(res.data.totalPages);
        } else {
          toast.error("Failed to fetch users.");
        }
      } catch (error) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error("Error response:", error.response.data);
          toast.error(`Error: ${error.response.data.message}`);
        } else if (error.request) {
          // The request was made but no response was received
          console.error("Error request:", error.request);
          toast.error("No response received from server.");
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error("Error message:", error.message);
          toast.error("Error setting up request.");
        }
      }
    };
  
    fetchUsers();
  }, [currentPage]);
  

  const filteredUsers = users.filter((person) =>
    person.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const res = await deleteUserApi(id);
      if (res.data.success) {
        toast.success(res.data.message);
        setUsers(users.filter(user => user._id !== id));  // Update the users list without reloading
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("An error occurred while deleting the user.");
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
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
                <h3 style={{ marginTop: 20 }}>User</h3>
                <p>Manage the list of users.</p>
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
              </div>
              <table className="table mt-2">
                <thead className="table-dark">
                  <tr>
                    <th>SN</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone Number</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user, index) => (
                      <tr key={user._id}>
                        <td>{(currentPage - 1) * 5 + index + 1}</td>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>{user.phoneNumber}</td>
                        <td>
                          <div className="d-flex">
                            <button
                              onClick={() => handleDelete(user._id)}
                              className="btn btn"
                            >
                              <FontAwesomeIcon icon={faTrashAlt} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center">
                        No users found.
                      </td>
                    </tr>
                  )}
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
                      className="page-link"
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
                      className="page-link"
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
    </>
  );
};

export default Users;
