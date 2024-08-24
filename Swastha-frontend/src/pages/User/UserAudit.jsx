import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faUserSecret, faInfoCircle, faGlobe } from "@fortawesome/free-solid-svg-icons";
import "./UserAudit.css"; // Import custom styles

const UserAudit = () => {
  const [auditTrail, setAuditTrail] = useState([]);

  useEffect(() => {
    // Static audit trail data from MongoDB
    const staticAuditData = [
      {
        _id: "66ba2d857f035f0bdea4f733",
        userId: "66ba26d2bb947289546b83fc",
        action: "User Login",
        ip: "::1",
        details: "User logged in successfully.",
        timestamp: "2024-08-12T15:43:01.476+00:00",
        __v: 0
      },
      {
        _id: "66ba2da87f035f0bdea4f737",
        userId: "66ba26d2bb947289546b83fc",
        action: "Profile Update",
        ip: "::1",
        details: "User sagar rauniyar updated their profile",
        timestamp: "2024-08-12T15:43:36.912+00:00",
        __v: 0
      },
      {
        _id: "66ba31237f035f0bdea4f73b",
        userId: "66ba26d2bb947289546b83fc",
        action: "User Login",
        ip: "::1",
        details: "User logged in successfully.",
        timestamp: "2024-08-12T15:58:27.138+00:00",
        __v: 0
      },
      {
        _id: "66ba4469999b8ff9cf3b8eb5",
        userId: "66ba26d2bb947289546b83fc",
        action: "User Login",
        ip: "::1",
        details: "User logged in successfully.",
        timestamp: "2024-08-12T17:20:41.707+00:00",
        __v: 0
      },
      {
        _id: "66bb1898e26cb48e23a4c8fb",
        userId: "66bb0b48fb9bd032e40c9757",
        action: "Profile Update",
        ip: "::1",
        details: "User Virat sharma updated their profile",
        timestamp: "2024-08-13T08:26:00.619+00:00",
        __v: 0
      },
      {
        _id: "66bc888f9ee151f270dc3987",
        userId: "66bb0b48fb9bd032e40c9757",
        action: "Profile Update",
        ip: "::1",
        details: "User Virat Sharma updated their profile",
        timestamp: "2024-08-14T10:35:59.179+00:00",
        __v: 0
      },
      {
        _id: "66bceff4b5f4f47b82744049",
        userId: "66bb0b48fb9bd032e40c9757",
        action: "User Login",
        timestamp: "2024-08-14T17:57:08.505+00:00",
        ip: "::1",
        details: "User virat@gmail.com logged in successfully",
        __v: 0
      },
      {
        _id: "66c9827a7d23acec3b0fc2d5",
        userId: "66b5ce9b0a791b63b58ce2cb",
        action: "User Login",
        timestamp: "2024-08-24T06:49:30.162+00:00",
        ip: "::1",
        details: "User aa@gmail.com logged in successfully",
        __v: 0
      },
      {
        _id: "66c982857d23acec3b0fc2d9",
        userId: "66b5ce9b0a791b63b58ce2cb",
        action: "User Login",
        timestamp: "2024-08-24T06:49:41.565+00:00",
        ip: "::1",
        details: "User aa@gmail.com logged in successfully",
        __v: 0
      },
      {
        _id: "66c98c8da9ea593ec871acb6",
        userId: "66c98c76a9ea593ec871acb3",
        action: "User Login",
        timestamp: "2024-08-24T07:32:29.002+00:00",
        ip: "::1",
        details: "User roshan12@gmail.com logged in successfully",
        __v: 0
      },
    ];

    // Set the static audit trail data
    setAuditTrail(staticAuditData);
  }, []);

  return (
    <div className="user-audit-container">
      <h2 className="audit-title">User Activity Log</h2>
      <table className="audit-table">
        <thead>
          <tr>
            <th>
              <FontAwesomeIcon icon={faCalendarAlt} /> Date
            </th>
            <th>
              <FontAwesomeIcon icon={faUserSecret} /> Action
            </th>
            <th>
              <FontAwesomeIcon icon={faInfoCircle} /> Details
            </th>
            <th>
              <FontAwesomeIcon icon={faGlobe} /> IP Address
            </th>
          </tr>
        </thead>
        <tbody>
          {auditTrail.length > 0 ? (
            auditTrail.map((audit, index) => (
              <tr key={index}>
                <td>{new Date(audit.timestamp).toLocaleString()}</td>
                <td>{audit.action}</td>
                <td>
                  <pre>{JSON.stringify(audit.details, null, 2)}</pre>
                </td>
                <td>{audit.ip}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="no-data">
                No activity recorded
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserAudit;
