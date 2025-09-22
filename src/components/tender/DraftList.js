import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./DraftList.css"; // You would need to create this CSS file

function DraftList() {
  const [tempRecords, setTempRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTempData = async () => {
      try {
        const response = await axios.get(
          "https://namami-infotech.com/NIKHILOFFSET/src/menu/get_temp_draft.php?menuId=1",
        );
        if (response.data.success) {
          setTempRecords(response.data.data);
          setFilteredRecords(response.data.data);
        } else {
          setError("No data found.");
        }
      } catch (err) {
        setError("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };
    fetchTempData();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = tempRecords.filter((record) => {
      const nameEntry = record.chkData?.find((chk) => chk.ChkId === "3");
      const tenderno = nameEntry?.Value?.toLowerCase() || "";
      const nameEntry2 = record.chkData?.find((chk) => chk.ChkId === "6");
      const name = nameEntry2?.Value?.toLowerCase() || "";

      return tenderno.includes(value) || name.includes(value);
    });
    setFilteredRecords(filtered);
    setPage(0);
  };

  const handleChangePage = (newPage) => setPage(newPage);

  const formatDate = (datetime) => {
    if (!datetime) return "-";
    const dateObj = new Date(datetime);
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Calculate time since last update
  const getTimeSince = (lastUpdate) => {
    if (!lastUpdate) return "-";
    
    // If lastUpdate is already formatted as a relative time, return it
    if (typeof lastUpdate === "string" && !lastUpdate.includes("-") && !lastUpdate.includes(":")) {
      return lastUpdate;
    }
    
    const updateDate = new Date(lastUpdate);
    const now = new Date();
    const diffMs = now - updateDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMins > 0) {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else {
      return "Just now";
    }
  };

  const totalPages = Math.ceil(filteredRecords.length / rowsPerPage);
  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRecords = filteredRecords.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading drafts...</p>
      </div>
    );
  }

  return (
    <div className="draft-list-container">
      <div className="draft-list-header">
        <div className="title-container">
          <h2 className="draft-list-title">Tender Draft List</h2>
          <span className="draft-count">{filteredRecords.length} Drafts</span>
        </div>

        <div className="draft-list-actions">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by Tender No. or Buyer Name"
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          <button 
            className="action-button tenders-button"
            onClick={() => navigate("/tender")}
          >
            <span className="button-icon">📋</span>
            Tenders List
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="table-container">
        <table className="draft-table">
          <thead>
            <tr>
              <th>Tender No.</th>
              <th>LOA No.</th>
              <th>Buyer</th>
              <th>Created Date</th>
              <th>Last Update</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.length > 0 ? (
              currentRecords.map((record) => {
                const nameEntry = record.chkData?.find((chk) => chk.ChkId === "4");
                const nameEntry2 = record.chkData?.find((chk) => chk.ChkId === "7");
                const nameEntry3 = record.chkData?.find((chk) => chk.ChkId === "60");
                const timeSince = getTimeSince(record.LastUpdate);

                return (
                  <tr key={record.ID}>
                    <td className="tender-no">{nameEntry?.Value || "-"}</td>
                    <td>{nameEntry3?.Value || "-"}</td>
                    <td>{nameEntry2?.Value || "-"}</td>
                    <td>{formatDate(record.Datetime)}</td>
                    <td>
                      <span className={`time-badge ${timeSince.includes("day") ? "old" : "recent"}`}>
                        {timeSince}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button 
                          className="view-button"
                          title="View Draft"
                          onClick={() => navigate(`/edit-draft/${record.ActivityId}`)}
                        >
                          <span className="button-icon">👁️</span>
                        </button>
                        <button 
                          className="edit-button"
                          title="Edit Draft"
                          onClick={() => navigate(`/edit-draft/${record.ActivityId}`)}
                        >
                          <span className="button-icon">✏️</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="no-records">
                  No draft records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination-container">
        <div className="pagination">
          <button 
            className="pagination-button"
            disabled={page === 0}
            onClick={() => handleChangePage(page - 1)}
          >
            Previous
          </button>
          
          <div className="page-numbers">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Logic to show pages around current page
              let pageNum = page;
              if (totalPages <= 5) {
                pageNum = i;
              } else if (page < 3) {
                pageNum = i;
              } else if (page > totalPages - 3) {
                pageNum = totalPages - 5 + i;
              } else {
                pageNum = page - 2 + i;
              }

              return (
                <button 
                  key={pageNum} 
                  className={`page-number ${pageNum === page ? 'active' : ''}`}
                  onClick={() => handleChangePage(pageNum)}
                >
                  {pageNum + 1}
                </button>
              );
            })}
          </div>
          
          <button 
            className="pagination-button"
            disabled={page >= totalPages - 1}
            onClick={() => handleChangePage(page + 1)}
          >
            Next
          </button>
        </div>
        
        <div className="page-info">
          Showing {startIndex + 1} - {Math.min(endIndex, filteredRecords.length)} of {filteredRecords.length} records
        </div>
      </div>

      {/* Summary stats */}
      {/* <div className="stats-container">
        <div className="stat-item">
          <div className="stat-label">Total Drafts</div>
          <div className="stat-value">{tempRecords.length}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Filtered Results</div>
          <div className="stat-value">{filteredRecords.length}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Page</div>
          <div className="stat-value">{page + 1} of {totalPages || 1}</div>
        </div>
      </div> */}
    </div>
  );
}

export default DraftList;