"use client";

import React, { useMemo, useState } from "react";
import useSWR, { mutate as globalMutate } from "swr";
import axios from "axios";
import AuditDetails from "./audit-details.js";
import "./TaskList.css";

const fetcher = async (url) => {
  const res = await axios.get(url);
  return res.data;
};

export default function TaskList() {
  const [selectedMilestone, setSelectedMilestone] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [error, setError] = useState("");
  const [expandedTasks, setExpandedTasks] = useState({});
  const [actionLoading, setActionLoading] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: tasksResponse,
    isLoading,
    error: tasksErr,
  } = useSWR(
    "https://namami-infotech.com/NIKHILOFFSET/src/task/get_task.php",
    fetcher
  );

  const tasks = tasksResponse?.success ? tasksResponse.data ?? [] : [];

  // Extract DISTINCT milestones from tasks
  const distinctMilestones = useMemo(() => {
    const milestoneSet = new Set();
    tasks.forEach((task) => {
      if (task.milestone && task.milestone.trim() !== "") {
        milestoneSet.add(task.milestone.trim());
      }
    });
    // Convert to array and sort alphabetically
    return Array.from(milestoneSet).sort((a, b) => a.localeCompare(b));
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Apply DISTINCT milestone filter
    if (selectedMilestone !== "all") {
      filtered = filtered.filter(
        (task) => task.milestone && task.milestone.trim() === selectedMilestone
      );
    }

    // Apply global search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((task) => {
        return (
          (task.chk5_value && task.chk5_value.toLowerCase().includes(query)) ||
          (task.chk3_value && task.chk3_value.toLowerCase().includes(query)) ||
          (task.milestone && task.milestone.toLowerCase().includes(query)) ||
          (task.job_card_no &&
            task.job_card_no.toLowerCase().includes(query)) ||
          (task.status && task.status.toLowerCase().includes(query))
        );
      });
    }

    return filtered;
  }, [tasks, selectedMilestone, searchQuery]);

  const totalPages = Math.ceil(filteredTasks.length / rowsPerPage) || 1;
  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentTasks = filteredTasks.slice(startIndex, endIndex);

  const toggleAuditHistory = (taskId) => {
    setExpandedTasks((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const handleMilestoneFilter = (e) => {
    setSelectedMilestone(e.target.value);
    setPage(0);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(0);
  };

  const clearFilters = () => {
    setSelectedMilestone("all");
    setSearchQuery("");
    setPage(0);
  };

  const handleChangePage = (newPage) => setPage(newPage);

  const handleRowsPerPage = (v) => {
    setRowsPerPage(v);
    setPage(0);
  };

  const formatDate = (datetime) => {
    if (!datetime) return "-";
    const dateObj = new Date(datetime);
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  };

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

  const getAvailableActions = (currentStatus) => {
    const status = currentStatus?.toLowerCase();
    switch (status) {
      case "pending":
        return ["Complete", "Hold"];
      case "in progress":
        return ["Complete", "Hold"];
      case "hold":
        return ["Start"];
      case "complete":
        return [];
      default:
        return ["Complete", "Hold"];
    }
  };

  const getActionDisplayText = (action, currentStatus) => {
    if (
      action.toLowerCase() === "start" &&
      currentStatus?.toLowerCase() === "hold"
    ) {
      return "Resume Work";
    }
    switch (action.toLowerCase()) {
      case "start":
        return "Start Work";
      case "complete":
        return "Mark as Complete";
      case "hold":
        return "Put on Hold";
      default:
        return action;
    }
  };

  const handleActionChange = async (taskId, action, currentStatus) => {
    const allowed = getAvailableActions(currentStatus);
    if (!allowed.includes(action)) {
      return;
    }

    const empId = "E102";
    setActionLoading((prev) => ({ ...prev, [taskId]: true }));
    setError("");

    try {
      let targetStatus = currentStatus;
      let remarks = "";

      switch (action.toLowerCase()) {
        case "start":
          if (currentStatus?.toLowerCase() === "hold") {
            targetStatus = "in progress";
            remarks = "Work resumed from hold";
          }
          break;
        case "complete":
          if (currentStatus?.toLowerCase() === "pending") {
            targetStatus = "complete";
            remarks = "Task marked as complete without starting work";
          } else if (currentStatus?.toLowerCase() === "in progress") {
            targetStatus = "complete";
            remarks = "Work completed";
          }
          break;
        case "hold":
          if (currentStatus?.toLowerCase() === "pending") {
            targetStatus = "hold";
            remarks = "Task put on hold without starting work";
          } else if (currentStatus?.toLowerCase() === "in progress") {
            targetStatus = "hold";
            remarks = "Work put on hold";
          }
          break;
        default:
          remarks = "Status updated";
      }

      let response;
      let lastError;

      const payloads = [
        {
          taskId: String(taskId),
          EmpId: empId,
          action: action.toLowerCase(),
        },
        {
          taskId: String(taskId),
          EmpId: empId,
          action: action.toLowerCase(),
          targetStatus,
          remarks,
        },
      ];

      for (const payload of payloads) {
        try {
          const res = await axios.post(
            "https://namami-infotech.com/NIKHILOFFSET/src/task/task_action.php",
            payload,
            {
              headers: { "Content-Type": "application/json" },
            }
          );
          response = res;
          if (res.data?.success) break;
          lastError = res.data?.message;
        } catch (err) {
          lastError = err?.message;
        }
      }

      if (response?.data?.success) {
        await globalMutate(
          "https://namami-infotech.com/NIKHILOFFSET/src/task/get_task.php"
        );
      } else {
        setError(`Failed to update task: ${lastError || "Unknown error"}`);
      }
    } catch (err) {
      if (err?.response) {
        setError(
          `Server error: ${
            err.response.data?.message || err.response.statusText
          }`
        );
      } else if (err?.request) {
        setError("No response from server. Please check your connection.");
      } else {
        setError("Failed to update task. Please try again.");
      }
    } finally {
      setActionLoading((prev) => ({ ...prev, [taskId]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading tasks...</p>
      </div>
    );
  }

  if (tasksErr) {
    return (
      <div className="task-list-container">
        <div className="error-message">
          Failed to fetch tasks.
          <button
            className="clear-error-button"
            onClick={() =>
              globalMutate(
                "https://namami-infotech.com/NIKHILOFFSET/src/task/get_task.php"
              )
            }
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="task-list-container">
      <div className="task-list-header">
        <h2 className="task-list-title">Task List</h2>

        <div className="filters-container">
          {/* Global Search Bar */}
          <div className="filter-group">
            <label htmlFor="global-search" className="filter-label">
              Search Tasks
            </label>
            <div className="search-container">
              <input
                id="global-search"
                type="text"
                placeholder="Search by Job Card, Client, Milestone, Status..."
                value={searchQuery}
                onChange={handleSearch}
                className="search-input"
              />
              {searchQuery && (
                <button
                  className="search-clear-button"
                  onClick={() => setSearchQuery("")}
                  title="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          <div className="filter-group">
            <label htmlFor="milestone-filter" className="filter-label">
              Filter by Milestone
            </label>
            <select
              id="milestone-filter"
              value={selectedMilestone}
              onChange={handleMilestoneFilter}
              className="milestone-filter-select"
            >
              <option value="all">
                All Milestones ({distinctMilestones.length})
              </option>
              {distinctMilestones.map((milestone, index) => (
                <option key={`${milestone}-${index}`} value={milestone}>
                  {milestone}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label invisible">Actions</label>
            <button
              onClick={clearFilters}
              className="clear-filters-button"
              disabled={selectedMilestone === "all" && !searchQuery}
            >
              Clear All Filters
            </button>
          </div>

          <div className="filter-stats">
            <span className="filter-count">
              Showing {filteredTasks.length} of {tasks.length} tasks
            </span>
            {(selectedMilestone !== "all" || searchQuery) && (
              <span className="filter-badge">
                {selectedMilestone !== "all" &&
                  `Milestone: ${selectedMilestone}`}
                {selectedMilestone !== "all" && searchQuery && " | "}
                {searchQuery && `Search: "${searchQuery}"`}
              </span>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button className="clear-error-button" onClick={() => setError("")}>
            ×
          </button>
        </div>
      )}

      <div className="table-container">
        <table className="task-table">
          <thead>
            <tr>
              <th>Job Card Name</th>
              <th>Client Name</th>
              <th>Milestone</th>
              <th>Status</th>
              <th>Created Date</th>
              <th>Updated Date</th>
              <th>Task Action</th>
            </tr>
          </thead>

          <tbody>
            {currentTasks.length > 0 ? (
              currentTasks.map((task) => {
                const availableActions = getAvailableActions(task.status);
                const isActionBusy = !!actionLoading[task.id];
                const isExpanded = !!expandedTasks[task.id];
                const isComplete =
                  task.status?.toLowerCase() === "complete";

                return (
                  <React.Fragment key={task.id}>
                    <tr
                      className={`task-row ${
                        isComplete ? "task-completed" : ""
                      }`}
                    >
                      <td className="job-card-cell" data-label="Job Card Name">
                        <div className="job-card-info">
                          {task.chk5_value || "-"}
                          <button
                            className="audit-history-toggle"
                            onClick={() => toggleAuditHistory(task.id)}
                            title="View Audit History"
                          >
                            {isExpanded ? "▲" : "▼"}
                          </button>
                        </div>
                      </td>
                      <td className="job-card-cell" data-label="Client Name">
                        {task.chk3_value || "-"}
                      </td>
                      <td className="milestone-cell" data-label="Milestone">
                        {task.milestone || "-"}
                      </td>
                      <td className="status-cell" data-label="Status">
                        <span
                          className={`status-badge ${getStatusClass(
                            task.status
                          )}`}
                        >
                          {task.status || task.status || "Unknown"}
                        </span>
                      </td>
                      <td className="date-cell" data-label="Created Date">
                        {formatDate(task.create_date)}
                      </td>
                      <td className="date-cell" data-label="Updated Date">
                        {formatDate(task.update_date)}
                      </td>

                      <td className="task-action-cell" data-label="Task Action">
                        {!isComplete && availableActions.length > 0 ? (
                          <div className="action-container">
                            <select
                              value=""
                              onChange={(e) => {
                                if (!e.target.value) return;
                                const action = e.target.value;
                                e.target.value = "";

                                if (action === "Complete") {
                                  const message =
                                    task.status?.toLowerCase() ===
                                    "pending"
                                      ? "Are you sure you want to mark this pending task as Complete without starting work?"
                                      : "Are you sure you want to mark this task as Complete?";

                                  if (window.confirm(message)) {
                                    handleActionChange(
                                      task.id,
                                      action,
                                      task.status
                                    );
                                  }
                                } else if (action === "Hold") {
                                  const message =
                                    task.status?.toLowerCase() ===
                                    "pending"
                                      ? "Are you sure you want to put this pending task on Hold without starting work?"
                                      : "Are you sure you want to put this task on Hold?";

                                  if (window.confirm(message)) {
                                    handleActionChange(
                                      task.id,
                                      action,
                                      task.status
                                    );
                                  }
                                } else {
                                  handleActionChange(
                                    task.id,
                                    action,
                                    task.status
                                  );
                                }
                              }}
                              disabled={isActionBusy}
                              className="action-select"
                            >
                              <option value="">Select Action</option>
                              {availableActions.map((action) => (
                                <option key={action} value={action}>
                                  {getActionDisplayText(
                                    action,
                                    task.status
                                  )}
                                </option>
                              ))}
                            </select>
                            {isActionBusy && (
                              <div className="action-loading">Updating...</div>
                            )}
                          </div>
                        ) : (
                          <span className="no-actions">
                            {isComplete
                              ? "Task Completed"
                              : "No actions available"}
                          </span>
                        )}
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="audit-history-row">
                        <td colSpan={7} className="audit-history-cell">
                          <div className="audit-history-container">
                            <h4 className="audit-history-title">
                              Audit History for Job Card: {task.job_card_no}
                            </h4>
                            <AuditDetails
                              taskId={task.id}
                              jobCardNo={task.job_card_no || ""}
                            />
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="no-tasks">
                  <div className="no-results-message">
                    No tasks found
                    {(selectedMilestone !== "all" || searchQuery) && (
                      <>
                        {" "}
                        matching your criteria
                        {selectedMilestone !== "all" &&
                          ` for milestone: ${selectedMilestone}`}
                        {searchQuery && ` and search: "${searchQuery}"`}
                        <button
                          onClick={clearFilters}
                          className="clear-filters-inline"
                        >
                          Clear all filters
                        </button>
                      </>
                    )}
                  </div>
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
          Page {page + 1} of {totalPages}
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
          onChange={(e) => handleRowsPerPage(Number(e.target.value))}
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
