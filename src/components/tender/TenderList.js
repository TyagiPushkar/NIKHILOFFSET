import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import "./TenderList.css";

function TenderList() {
  const [tempRecords, setTempRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [taskStatus, setTaskStatus] = useState({}); // Store task status by activityId
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both temp data and task data in parallel
        const [tempResponse, taskResponse] = await Promise.all([
          axios.get("https://namami-infotech.com/NIKHILOFFSET/src/menu/get_temp.php?menuId=1"),
          axios.get("https://namami-infotech.com/NIKHILOFFSET/src/task/get_task.php")
        ]);

        if (tempResponse.data.success) {
          setTempRecords(tempResponse.data.data);
          setFilteredRecords(tempResponse.data.data);
        } else {
          setError("No temp data found.");
        }

        if (taskResponse.data.success) {
          // Process task data to get latest status for each activityId
          const statusMap = processTaskData(taskResponse.data.data);
          setTaskStatus(statusMap);
        } else {
          console.warn("No task data found.");
        }
      } catch (err) {
        setError("Failed to fetch data.");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Process task data to get the latest status for each activityId
  const processTaskData = (taskData) => {
    const statusMap = {};
    
    taskData.forEach(task => {
      const { activityId, status, milestone, update_date } = task;
      
      // If we haven't seen this activityId, or if this task has a more recent update
      if (!statusMap[activityId] || 
          new Date(update_date) > new Date(statusMap[activityId].update_date)) {
        statusMap[activityId] = {
          status,
          milestone,
          update_date
        };
      }
    });
    
    return statusMap;
  };

  // Get status display for a record
  const getStatusDisplay = (record) => {
    const taskInfo = taskStatus[record.ActivityId];
    
    if (!taskInfo) {
      return { text: "Not Started", className: "status-not-started" };
    }
    
    const { status, milestone } = taskInfo;
    
    switch (status) {
      case "Complete":
        return { text: `Completed`, className: "status-complete" };
      case "Pending":
        return { text: `WIP - ${milestone}`, className: "status-pending" };
      case "Hold":
        return { text: `On Hold - ${milestone}`, className: "status-hold" };
      default:
        return { text: `In Progress - ${milestone}`, className: "status-pending" };
    }
  };

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
    const dateObj = new Date(datetime);
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const totalPages = Math.ceil(filteredRecords.length / rowsPerPage);
  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRecords = filteredRecords.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading tenders...</p>
      </div>
    );
  }

  return (
    <div className="tender-list-container">
      <div className="tender-list-header">
        <div className="tender-list-actions">
          <h2 className="tender-list-title">Job Card List</h2>
          
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by Job Card or Client..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>

          <button
            className="action-button new-tender-button"
            onClick={() => navigate("/create-job-card")}
          >
            New Job Card
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="table-container">
        <table className="tender-table">
          <thead>
            <tr>
              <th>Job Name</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.length > 0 ? (
              currentRecords.map((record) => {
                const nameEntry = record.chkData?.find(
                  (chk) => chk.ChkId === "5"
                );
                const statusInfo = getStatusDisplay(record);

                return (
                  <tr style={{cursor:"pointer"}} key={record.ID} onClick={() =>
                          navigate(`/tender/view/${record.ActivityId}`, {
                            state: { tempId: record.TempId },
                          })
                        }>
                    <td>{nameEntry?.Value || "-"}</td>
                    <td>
                      <span className={`status-badge ${statusInfo.className}`}>
                        {statusInfo.text}
                      </span>
                    </td>
                    
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="no-records">
                  No records found
                </td>
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
    </div>
  );
}

export default TenderList;