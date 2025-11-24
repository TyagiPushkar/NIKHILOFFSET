import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ClientList.css"; // optional css file

function AddClient() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    FirstName: "",
    LastName: "",
    Email: "",
    PhoneNumber: "",
    CompanyName: "",
    Address: "",
    City: "",
    State: "",
    Country: "",
    PostalCode: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        "https://namami-infotech.com/NIKHILOFFSET/src/clients/clients.php",
        formData
      );

      if (response.data.success) {
        setSuccess("Client added successfully!");
        setTimeout(() => navigate("/clients"), 1500);
      } else {
        setError(response.data.message || "Something went wrong!");
      }
    } catch (err) {
      setError("Failed to add client!");
    }
    setLoading(false);
  };

  return (
    <div className="add-client-container">
      <h2>Add New Client</h2>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <div className="form-grid">
        <input name="FirstName" placeholder="First Name" value={formData.FirstName} onChange={handleChange} />
        <input name="LastName" placeholder="Last Name" value={formData.LastName} onChange={handleChange} />
        <input name="Email" placeholder="Email" value={formData.Email} onChange={handleChange} />
        <input name="PhoneNumber" placeholder="Phone Number" value={formData.PhoneNumber} onChange={handleChange} />
        <input name="CompanyName" placeholder="Company Name" value={formData.CompanyName} onChange={handleChange} />
        <input name="City" placeholder="City" value={formData.City} onChange={handleChange} />
        <input name="State" placeholder="State" value={formData.State} onChange={handleChange} />
        <input name="Country" placeholder="Country" value={formData.Country} onChange={handleChange} />
        <input name="PostalCode" placeholder="Postal Code" value={formData.PostalCode} onChange={handleChange} />
        <textarea name="Address" placeholder="Full Address" value={formData.Address} onChange={handleChange} />
      </div>

      <div className="button-row">
        <button className="save-button" onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving..." : "Save Client"}
        </button>
        <button className="cancel-button" onClick={() => navigate("/client-list")}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default AddClient;
