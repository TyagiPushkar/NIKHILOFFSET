"use client"

import React, { useMemo, useState } from "react"
import useSWR, { mutate as globalMutate } from "swr"
import axios from "axios"
import AuditDetails from "./audit-details.js"
import "./TaskList.css"
const fetcher = async (url) => {
  const res = await axios.get(url)
  return res.data
}

export default function TaskList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(15)
  const [error, setError] = useState("")
  const [expandedTasks, setExpandedTasks] = useState({})
  const [actionLoading, setActionLoading] = useState({})

  const {
    data: tasksResponse,
    isLoading,
    error: tasksErr,
  } = useSWR("https://namami-infotech.com/NIKHILOFFSET/src/task/get_task.php", fetcher)

  const tasks = tasksResponse?.success ? (tasksResponse.data ?? []) : []

  const filteredTasks = useMemo(() => {
    const value = searchTerm.toLowerCase()
    if (!value) return tasks
    return tasks.filter((task) => {
      return (
        task.job_card_no?.toLowerCase().includes(value) ||
        task.milestone?.toLowerCase().includes(value) ||
        task.status_text?.toLowerCase().includes(value)
      )
    })
  }, [tasks, searchTerm])

  const totalPages = Math.ceil(filteredTasks.length / rowsPerPage) || 1
  const startIndex = page * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const currentTasks = filteredTasks.slice(startIndex, endIndex)

  const toggleAuditHistory = (taskId) => {
    setExpandedTasks((prev) => ({ ...prev, [taskId]: !prev[taskId] }))
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setPage(0)
  }

  const handleChangePage = (newPage) => setPage(newPage)

  const handleRowsPerPage = (v) => {
    setRowsPerPage(v)
    setPage(0)
  }

  const formatDate = (datetime) => {
    if (!datetime) return "-"
    const dateObj = new Date(datetime)
    const day = String(dateObj.getDate()).padStart(2, "0")
    const month = String(dateObj.getMonth() + 1).padStart(2, "0")
    const year = dateObj.getFullYear()
    return `${day}/${month}/${year}`
  }

  const getStatusClass = (statusText) => {
    switch (statusText?.toLowerCase()) {
      case "complete":
        return "status-completed"
      case "in progress":
        return "status-in-progress"
      case "pending":
        return "status-pending"
      case "hold":
        return "status-hold"
      default:
        return "status-unknown"
    }
  }

  // Pending: Start only
  // In Progress: Hold + Stop(Complete)
  // Hold: Start only
  // Complete: No actions
  const getAvailableActions = (currentStatus) => {
    const status = currentStatus?.toLowerCase()
    switch (status) {
      case "pending":
        return ["Start"]
      case "in progress":
        return ["Stop", "Hold"]
      case "hold":
        return ["Start"]
      case "complete":
        return []
      default:
        return ["Start"]
    }
  }

  const getActionDisplayText = (action, currentStatus) => {
    if (action.toLowerCase() === "start" && currentStatus?.toLowerCase() === "hold") {
      return "Resume Work"
    }
    switch (action.toLowerCase()) {
      case "start":
        return "Start Work"
      case "stop":
        return "Complete Task"
      case "hold":
        return "Put on Hold"
      default:
        return action
    }
  }

  const handleActionChange = async (taskId, action, currentStatus) => {
    const allowed = getAvailableActions(currentStatus)
    if (!allowed.includes(action)) {
      return
    }

    const empId = "E102"
    setActionLoading((prev) => ({ ...prev, [taskId]: true }))
    setError("")

    try {
      let targetStatus = currentStatus
      let remarks = ""

      switch (action.toLowerCase()) {
        case "start":
          if (currentStatus?.toLowerCase() === "pending" || currentStatus?.toLowerCase() === "hold") {
            targetStatus = "in progress"
            remarks = currentStatus?.toLowerCase() === "hold" ? "Work resumed from hold" : "Work started"
          }
          break
        case "stop":
          if (currentStatus?.toLowerCase() === "in progress") {
            targetStatus = "complete"
            remarks = "Work completed"
          }
          break
        case "hold":
          if (currentStatus?.toLowerCase() === "in progress") {
            targetStatus = "hold"
            remarks = "Work put on hold"
          }
          break
        default:
          remarks = "Status updated"
      }

      let response
      let lastError

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
      ]

      for (const payload of payloads) {
        try {
          const res = await axios.post("https://namami-infotech.com/NIKHILOFFSET/src/task/task_action.php", payload, {
            headers: { "Content-Type": "application/json" },
          })
          response = res
          if (res.data?.success) break
          lastError = res.data?.message
        } catch (err) {
          lastError = err?.message
        }
      }

      if (response?.data?.success) {
        await globalMutate("https://namami-infotech.com/NIKHILOFFSET/src/task/get_task.php")
      } else {
        setError(`Failed to update task: ${lastError || "Unknown error"}`)
      }
    } catch (err) {
      if (err?.response) {
        setError(`Server error: ${err.response.data?.message || err.response.statusText}`)
      } else if (err?.request) {
        setError("No response from server. Please check your connection.")
      } else {
        setError("Failed to update task. Please try again.")
      }
    } finally {
      setActionLoading((prev) => ({ ...prev, [taskId]: false }))
    }
  }

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading tasks...</p>
      </div>
    )
  }

  if (tasksErr) {
    return (
      <div className="task-list-container">
        <div className="error-message">
          Failed to fetch tasks.
          <button
            className="clear-error-button"
            onClick={() => globalMutate("https://namami-infotech.com/NIKHILOFFSET/src/task/get_task.php")}
          >
            ×
          </button>
        </div>
      </div>
    )
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
          <button className="clear-error-button" onClick={() => setError("")}>
            ×
          </button>
        </div>
      )}

      <div className="status-legend">
        <h4>Allowed actions by status</h4>
        <div className="status-flow">
          <div className="status-item pending">Pending: Start</div>
          <div className="flow-arrow">↓</div>
          <div className="status-item in-progress">In Progress: Hold, Complete</div>
          <div className="flow-arrow">↕</div>
          <div className="status-item complete">Complete: No actions</div>
          <div className="flow-note">On Hold: Start only (resumes to In Progress)</div>
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
                const availableActions = getAvailableActions(task.status_text)
                const isActionBusy = !!actionLoading[task.id]
                const isExpanded = !!expandedTasks[task.id]
                const isComplete = task.status_text?.toLowerCase() === "complete"

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
                        {availableActions.length > 0 && !isComplete ? (
                          <div className="action-container">
                            <select
                              value=""
                              onChange={(e) => {
                                if (!e.target.value) return
                                const action = e.target.value
                                e.target.value = ""

                                if (action === "Stop") {
                                  if (window.confirm("Are you sure you want to mark this task as Complete?")) {
                                    handleActionChange(task.id, action, task.status_text)
                                  }
                                } else if (action === "Hold") {
                                  if (window.confirm("Are you sure you want to put this task on Hold?")) {
                                    handleActionChange(task.id, action, task.status_text)
                                  }
                                } else {
                                  handleActionChange(task.id, action, task.status_text)
                                }
                              }}
                              disabled={isActionBusy}
                              className="action-select"
                            >
                              <option value="">Select Action</option>
                              {availableActions.map((action) => (
                                <option key={action} value={action}>
                                  {getActionDisplayText(action, task.status_text)}
                                </option>
                              ))}
                            </select>
                            {isActionBusy && <div className="action-loading">Updating...</div>}
                          </div>
                        ) : (
                          <span className="no-actions">No actions available</span>
                        )}
                      </td>

                      <td className="audit-cell" data-label="Audit History">
                        <button
                          className="audit-toggle-button"
                          onClick={() => toggleAuditHistory(task.id)}
                          disabled={isActionBusy}
                        >
                          {isExpanded ? "▲ Hide" : "▼ Show"} History
                        </button>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="audit-history-row">
                        <td colSpan={7} className="audit-history-cell">
                          <div className="audit-history-container">
                            <h4 className="audit-history-title">Audit History for Job Card: {task.job_card_no}</h4>
                            <AuditDetails taskId={task.id} jobCardNo={task.job_card_no || ""} />
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })
            ) : (
              <tr>
                <td colSpan={7} className="no-tasks">
                  No tasks found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button className="pagination-button" disabled={page === 0} onClick={() => handleChangePage(page - 1)}>
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
  )
}
