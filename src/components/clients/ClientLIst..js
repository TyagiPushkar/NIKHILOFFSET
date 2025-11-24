import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ClientList.css";

function ClientList() {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  // dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [editClientData, setEditClientData] = useState(null);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await axios.get(
        "https://namami-infotech.com/NIKHILOFFSET/src/clients/clients.php"
      );

      if (response.data.success) {
        setClients(response.data.data);
        setFilteredClients(response.data.data);
      } else {
        setError("No clients found.");
      }
    } catch (err) {
      setError("Failed to fetch client data.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = clients.filter((client) => {
      const fullName = `${client.FirstName} ${client.LastName}`.toLowerCase();
      return (
        fullName.includes(value) ||
        (client.Email?.toLowerCase().includes(value)) ||
        (client.CompanyName?.toLowerCase().includes(value))
      );
    });

    setFilteredClients(filtered);
    setPage(0);
  };

  const handleChangePage = (newPage) => setPage(newPage);

  const totalPages = Math.ceil(filteredClients.length / rowsPerPage);
  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRecords = filteredClients.slice(startIndex, endIndex);

  const handleEdit = (client) => {
    console.log("Editing client:", client); // Debug log
    setEditClientData({ ...client });
    setOpenDialog(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditClientData({ ...editClientData, [name]: value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Validate that ClientID exists
      if (!editClientData.ClientID) {
        alert("Error: Client ID is missing!");
        setSaving(false);
        return;
      }

      // Create update data with ClientID explicitly included
      const updateData = {
        ClientID: editClientData.ClientID,
        FirstName: editClientData.FirstName,
        LastName: editClientData.LastName,
        Email: editClientData.Email,
        PhoneNumber: editClientData.PhoneNumber,
        CompanyName: editClientData.CompanyName,
        Address: editClientData.Address,
        City: editClientData.City,
        State: editClientData.State,
        Country: editClientData.Country,
        PostalCode: editClientData.PostalCode,
        action: 'update' // Add action parameter for backend
      };

      console.log("Sending update data:", updateData); // Debug log

      const response = await axios.post(
        "https://namami-infotech.com/NIKHILOFFSET/src/clients/clients.php",
        updateData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      console.log("Server response:", response.data); // Debug log

      if (response.data.success) {
        alert("Client updated successfully");
        setOpenDialog(false);
        fetchClients();
      } else {
        alert(response.data.message || "Update failed!");
      }
    } catch (e) {
      console.error("Update error:", e);
      alert("Failed to update client: " + (e.response?.data?.message || e.message));
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading Clients...</p>
      </div>
    );
  }

  return (
    <div className="tender-list-container">
      <div className="tender-list-header">
        <div className="tender-list-actions">
          <h2 className="tender-list-title">Client List</h2>
          
          {/* Search Input */}
          <div className="search-container">
            <input
              type="text"
              placeholder="Search clients by name, email, or company..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>

          <button
            className="action-button new-tender-button"
            onClick={() => navigate("/add-client")}
          >
            Add Client
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="table-container">
        <table className="tender-table">
          <thead>
            <tr>
              <th>Client ID</th>
              <th>Client Name</th>
              <th>Email</th>
              <th>Company</th>
              <th>Phone</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {currentRecords.length > 0 ? (
              currentRecords.map((client) => (
                <tr key={client.ClientID}>
                  <td>{client.ClientID}</td>
                  <td>{client.FirstName} {client.LastName}</td>
                  <td>{client.Email}</td>
                  <td>{client.CompanyName || "-"}</td>
                  <td>{client.PhoneNumber || "-"}</td>
                  <td>
                    <button
                      className="edit-button"
                      onClick={() => handleEdit(client)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-records">No Clients Found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          className="pagination-button"
          disabled={page === 0}
          onClick={() => handleChangePage(page - 1)}
        >
          Previous
        </button>
        <span className="page-info">
          Page {page + 1} of {totalPages || 1}
        </span>
        <button
          className="pagination-button"
          disabled={page >= totalPages - 1}
          onClick={() => handleChangePage(page + 1)}
        >
          Next
        </button>
      </div>

      {/* Edit Dialog */}
      {openDialog && editClientData && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h3 className="dialog-title">Edit Client (ID: {editClientData.ClientID})</h3>

            {/* Hidden ClientID field to ensure it's preserved */}
            <input 
              type="hidden"
              name="ClientID" 
              value={editClientData.ClientID || ''} 
            />

            <div className="dialog-grid">
              <div className="form-group">
                <label>First Name *</label>
                <input 
                  name="FirstName" 
                  value={editClientData.FirstName || ''} 
                  onChange={handleEditChange}
                  className="dialog-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input 
                  name="LastName" 
                  value={editClientData.LastName || ''} 
                  onChange={handleEditChange}
                  className="dialog-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input 
                  name="Email" 
                  type="email"
                  value={editClientData.Email || ''} 
                  onChange={handleEditChange}
                  className="dialog-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input 
                  name="PhoneNumber" 
                  value={editClientData.PhoneNumber || ''} 
                  onChange={handleEditChange}
                  className="dialog-input"
                />
              </div>
              <div className="form-group">
                <label>Company Name</label>
                <input 
                  name="CompanyName" 
                  value={editClientData.CompanyName || ''} 
                  onChange={handleEditChange}
                  className="dialog-input"
                />
              </div>
              <div className="form-group full-width">
                <label>Address</label>
                <input 
                  name="Address" 
                  value={editClientData.Address || ''} 
                  onChange={handleEditChange}
                  className="dialog-input"
                />
              </div>
              <div className="form-group">
                <label>City</label>
                <input 
                  name="City" 
                  value={editClientData.City || ''} 
                  onChange={handleEditChange}
                  className="dialog-input"
                />
              </div>
              <div className="form-group">
                <label>State</label>
                <input 
                  name="State" 
                  value={editClientData.State || ''} 
                  onChange={handleEditChange}
                  className="dialog-input"
                />
              </div>
              <div className="form-group">
                <label>Country</label>
                <input 
                  name="Country" 
                  value={editClientData.Country || ''} 
                  onChange={handleEditChange}
                  className="dialog-input"
                />
              </div>
              <div className="form-group">
                <label>Postal Code</label>
                <input 
                  name="PostalCode" 
                  value={editClientData.PostalCode || ''} 
                  onChange={handleEditChange}
                  className="dialog-input"
                />
              </div>
            </div>

            <div className="dialog-actions">
              <button 
                className="cancel-button" 
                onClick={() => setOpenDialog(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button 
                className="save-button" 
                onClick={handleSave} 
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientList;