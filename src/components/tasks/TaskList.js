import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./TaskList.css";

function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [actionLoading, setActionLoading] = useState({});
  const [auditHistory, setAuditHistory] = useState({});
  const [expandedTasks, setExpandedTasks] = useState({});
  const [auditLoading, setAuditLoading] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(
        "https://namami-infotech.com/NIKHILOFFSET/src/task/get_task.php"
      );
      if (response.data.success) {
        setTasks(response.data.data);
        setFilteredTasks(response.data.data);
      } else {
        setError("No tasks found.");
      }
    } catch (err) {
      setError("Failed to fetch tasks.");
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditHistory = async (taskId) => {
    setAuditLoading(prev => ({ ...prev, [taskId]: true }));
    
    try {
      // Use POST request with taskId in the body
      const response = await axios.post(
        `https://namami-infotech.com/NIKHILOFFSET/src/task/get_task_audit.php`,
        { taskId: taskId.toString() },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log(`Audit API Response for task ${taskId}:`, response.data);
      
      if (response.data.success) {
        setAuditHistory(prev => ({
          ...prev,
          [taskId]: response.data.data || []
        }));
      } else {
        console.error(`Audit API error for task ${taskId}:`, response.data.message);
        setAuditHistory(prev => ({
          ...prev,
          [taskId]: []
        }));
      }
    } catch (err) {
      console.error("Error fetching audit history:", err);
      setAuditHistory(prev => ({
        ...prev,
        [taskId]: []
      }));
    } finally {
      setAuditLoading(prev => ({ ...prev, [taskId]: false }));
    }
  };

  const toggleAuditHistory = async (taskId) => {
    const isExpanded = expandedTasks[taskId];
    
    if (!isExpanded && !auditHistory[taskId]) {
      await fetchAuditHistory(taskId);
    }
    
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !isExpanded
    }));
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = tasks.filter((task) => {
      return (
        task.job_card_no?.toLowerCase().includes(value) ||
        task.milestone?.toLowerCase().includes(value) ||
        task.status_text?.toLowerCase().includes(value)
      );
    });
    setFilteredTasks(filtered);
    setPage(0);
  };

  const handleActionChange = async (taskId, action, currentStatus) => {
    const empId = "E102"; 
    
    setActionLoading(prev => ({ ...prev, [taskId]: true }));

    try {
      let targetStatus = currentStatus;
      let remarks = "";
      
      // CORRECTED STATUS FLOW:
      // Start: Pending/Hold → In Progress
      // Stop: In Progress → Complete  
      // Hold: In Progress → Hold
      
      switch (action.toLowerCase()) {
        case "start":
          if (currentStatus?.toLowerCase() === "pending" || currentStatus?.toLowerCase() === "hold") {
            targetStatus = "in progress";
            remarks = currentStatus?.toLowerCase() === "hold" ? "Work resumed from hold" : "Work started";
          }
          break;
        case "stop":
          if (currentStatus?.toLowerCase() === "in progress") {
            targetStatus = "complete";
            remarks = "Work completed";
          }
          break;
        case "hold":
          if (currentStatus?.toLowerCase() === "in progress") {
            targetStatus = "hold";
            remarks = "Work put on hold";
          }
          break;
        default:
          remarks = "Status updated";
      }

      console.log(`Changing task ${taskId} from ${currentStatus} to ${targetStatus}`);

      // Try multiple payload formats
      const payloads = [
        // Format 1: Simple action-based
        {
          taskId: taskId.toString(),
          EmpId: empId,
          action: action.toLowerCase()
        },
        // Format 2: With target status
        {
          taskId: taskId.toString(),
          EmpId: empId,
          action: action.toLowerCase(),
          targetStatus: targetStatus,
          remarks: remarks
        }
      ];

      let response;
      let lastError;

      // Try different payload formats
      for (const payload of payloads) {
        try {
          console.log("Trying payload:", payload);
          
          response = await axios.post(
            "https://namami-infotech.com/NIKHILOFFSET/src/task/task_action.php",
            payload,
            {
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );

          console.log("API Response:", response.data);

          if (response.data.success) {
            break; // Success, break the loop
          } else {
            lastError = response.data.message;
          }
        } catch (err) {
          lastError = err.message;
          console.error("Error with payload format:", err);
        }
      }

      if (response?.data.success) {
        // Refresh the task list to get updated status
        await fetchTasks();
        // Clear audit history cache for this task since it's changed
        setAuditHistory(prev => {
          const newAudit = { ...prev };
          delete newAudit[taskId];
          return newAudit;
        });
        setError(""); // Clear any previous errors
      } else {
        setError(`Failed to update task: ${lastError || "Unknown error"}`);
      }
    } catch (err) {
      if (err.response) {
        setError(`Server error: ${err.response.data.message || err.response.statusText}`);
      } else if (err.request) {
        setError("No response from server. Please check your connection.");
      } else {
        setError("Failed to update task. Please try again.");
      }
      console.error("Error updating task:", err);
    } finally {
      setActionLoading(prev => ({ ...prev, [taskId]: false }));
    }
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

  const formatDateTime = (datetime) => {
    if (!datetime) return "-";
    const dateObj = new Date(datetime);
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    const hours = String(dateObj.getHours()).padStart(2, "0");
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");
    const seconds = String(dateObj.getSeconds()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  // Function to determine status badge class
  const getStatusClass = (statusText) => {
    switch (statusText?.toLowerCase()) {
      case "complete":
        return "status-completed";
      case "in progress":
        return "status-in-progress";
      case "pending":
        return "status-pending";
      case "hold":
        return "status-hold";
      default:
        return "status-unknown";
    }
  };

  // Function to determine available actions based on current status
  const getAvailableActions = (currentStatus) => {
    const status = currentStatus?.toLowerCase();
    
    switch (status) {
      case "pending":
        return ["Start", "Hold"]; // Can start work or put on hold
      case "in progress":
        return ["Stop", "Hold"]; // Can complete the task or put on hold
      case "hold":
        return ["Start"]; // Can start work (resume) from hold
      case "complete":
        return []; // No actions for completed tasks
      default:
        return ["Start", "Hold"]; // Default actions for unknown status
    }
  };

  // Function to get display text for actions
  const getActionDisplayText = (action, currentStatus) => {
    if (action.toLowerCase() === "start" && currentStatus?.toLowerCase() === "hold") {
      return "Resume Work";
    }
    
    switch (action.toLowerCase()) {
      case "start":
        return "Start Work";
      case "stop":
        return "Complete Task";
      case "hold":
        return "Put on Hold";
      default:
        return action;
    }
  };

  // Function to get status change description
  const getStatusChangeDescription = (oldStatus, newStatus) => {
    if (oldStatus === newStatus) return "Status maintained";
    
    const changes = {
      "pending->in progress": "Work Started",
      "pending->hold": "Put on Hold",
      "in progress->complete": "Work Completed",
      "in progress->hold": "Put on Hold",
      "hold->in progress": "Resumed Work"
    };
    
    const key = `${oldStatus?.toLowerCase()}->${newStatus?.toLowerCase()}`;
    return changes[key] || `Changed from ${oldStatus} to ${newStatus}`;
  };

  const totalPages = Math.ceil(filteredTasks.length / rowsPerPage);
  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentTasks = filteredTasks.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="task-list-container">
      <div className="task-list-header">
        <div className="task-list-actions">
          <h2 className="task-list-title">Task List</h2>
          
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by Job Card, Milestone, or Status..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button 
            className="clear-error-button" 
            onClick={() => setError("")}
          >
            ×
          </button>
        </div>
      )}

      {/* Status Legend */}
      <div className="status-legend">
        <h4>Status Flow:</h4>
        <div className="status-flow">
          <span className="status-item pending">Pending</span>
          <span className="flow-arrow">→</span>
          <span className="status-item in-progress">In Progress</span>
          <span className="flow-arrow">→</span>
          <span className="status-item complete">Complete</span>
          <div className="flow-note">
            Start available for Pending and Hold. Hold available only from In Progress.
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="task-table">
          <thead>
            <tr>
              <th>Job Card No</th>
              <th>Milestone</th>
              <th>Status</th>
              <th>Created Date</th>
              <th>Updated Date</th>
              <th>Task Action</th>
              <th>Audit History</th>
            </tr>
          </thead>
<tbody>
  {currentTasks.length > 0 ? (
    currentTasks.map((task) => {
      const availableActions = getAvailableActions(task.status_text);
      const isActionLoading = actionLoading[task.id];
      const isExpanded = expandedTasks[task.id];
      const isAuditLoading = auditLoading[task.id];
      const taskAuditHistory = auditHistory[task.id] || [];

      return (
        <React.Fragment key={task.id}>
          <tr className="task-row">
            <td className="job-card-cell" data-label="Job Card">
              {task.job_card_no || "-"}
            </td>
            <td className="milestone-cell" data-label="Milestone">
              {task.milestone || "-"}
            </td>
            <td className="status-cell" data-label="Status">
              <span className={`status-badge ${getStatusClass(task.status_text)}`}>
                {task.status_text || task.status || "Unknown"}
              </span>
            </td>
            <td className="date-cell" data-label="Created Date">
              {formatDate(task.create_date)}
            </td>
            <td className="date-cell" data-label="Updated Date">
              {formatDate(task.update_date)}
            </td>
            
            <td className="task-action-cell" data-label="Task Action">
              {availableActions.length > 0 ? (
                <div className="action-container">
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        const action = e.target.value;
                        e.target.value = "";
                        
                        if (action === "Stop") {
                          if (window.confirm("Are you sure you want to mark this task as Complete?")) {
                            handleActionChange(task.id, action, task.status_text);
                          }
                        } else if (action === "Hold") {
                          if (window.confirm("Are you sure you want to put this task on Hold?")) {
                            handleActionChange(task.id, action, task.status_text);
                          }
                        } else {
                          handleActionChange(task.id, action, task.status_text);
                        }
                      }
                    }}
                    disabled={isActionLoading}
                    className="action-select"
                  >
                    <option value="">Select Action</option>
                    {availableActions.map((action) => (
                      <option key={action} value={action}>
                        {getActionDisplayText(action, task.status_text)}
                      </option>
                    ))}
                  </select>
                  {isActionLoading && (
                    <div className="action-loading">Updating...</div>
                  )}
                </div>
              ) : (
                <span className="no-actions">No actions available</span>
              )}
            </td>
            
            <td className="audit-cell" data-label="Audit History">
              <button
                className="audit-toggle-button"
                onClick={() => toggleAuditHistory(task.id)}
                disabled={isActionLoading || isAuditLoading}
              >
                {isExpanded ? "▲ Hide" : "▼ Show"} History
                {isAuditLoading && "..."}
              </button>
            </td>
          </tr>
          
          {/* Audit History Accordion */}
          {isExpanded && (
            <tr className="audit-history-row">
              <td colSpan="7" className="audit-history-cell">
                <div className="audit-history-container">
                  <h4 className="audit-history-title">
                    Audit History for Job Card: {task.job_card_no}
                  </h4>
                  
                  {isAuditLoading ? (
                    <div className="audit-loading">Loading audit history...</div>
                  ) : taskAuditHistory.length > 0 ? (
                    <div className="audit-history-table-container">
                      <table className="audit-history-table">
                        <thead>
                          <tr>
                            <th>Date & Time</th>
                            <th>Changed By</th>
                            <th>Previous Status</th>
                            <th>New Status</th>
                            <th>Action</th>
                            <th>Remarks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {taskAuditHistory.map((audit) => (
                            <tr key={audit.id} className="audit-row">
                              <td className="audit-date">
                                {formatDateTime(audit.change_time)}
                              </td>
                              <td className="audit-changed-by">
                                {audit.changed_by}
                              </td>
                              <td className="audit-old-status">
                                <span className={`status-badge ${getStatusClass(audit.old_status)}`}>
                                  {audit.old_status}
                                </span>
                              </td>
                              <td className="audit-new-status">
                                <span className={`status-badge ${getStatusClass(audit.new_status)}`}>
                                  {audit.new_status}
                                </span>
                              </td>
                              <td className="audit-action">
                                {getStatusChangeDescription(audit.old_status, audit.new_status)}
                              </td>
                              <td className="audit-remarks">
                                {audit.remarks}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="no-audit-data">
                      No audit history available for this task
                    </div>
                  )}
                </div>
              </td>
            </tr>
          )}
        </React.Fragment>
      );
    })
  ) : (
    <tr>
      <td colSpan="7" className="no-tasks">
        No tasks found
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
        
        <select
          value={rowsPerPage}
          onChange={(e) => setRowsPerPage(Number(e.target.value))}
          className="rows-per-page-select"
        >
          <option value={10}>10 per page</option>
          <option value={15}>15 per page</option>
          <option value={20}>20 per page</option>
          <option value={50}>50 per page</option>
        </select>
      </div>
    </div>
  );
}

export default TaskList;