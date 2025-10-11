"use client"
import useSWR from "swr"
import axios from "axios"
import "./TaskList.css"

const postJson = async (url, body) => {
  const res = await axios.post(url, body, {
    headers: { "Content-Type": "application/json" },
  })
  return res.data
}

function getStatusClass(statusText) {
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

function formatDateTime(datetime) {
  if (!datetime) return "-"
  const dateObj = new Date(datetime)
  const day = String(dateObj.getDate()).padStart(2, "0")
  const month = String(dateObj.getMonth() + 1).padStart(2, "0")
  const year = dateObj.getFullYear()
  const hours = String(dateObj.getHours()).padStart(2, "0")
  const minutes = String(dateObj.getMinutes()).padStart(2, "0")
  const seconds = String(dateObj.getSeconds()).padStart(2, "0")
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
}

function getStatusChangeDescription(oldStatus, newStatus) {
  if (oldStatus === newStatus) return "Status maintained"
  const changes = {
    "pending->in progress": "Work Started",
    "pending->hold": "Put on Hold",
    "in progress->complete": "Work Completed",
    "in progress->hold": "Put on Hold",
    "hold->in progress": "Resumed Work",
  }
  const key = `${oldStatus?.toLowerCase()}->${newStatus?.toLowerCase()}`
  return changes[key] || `Changed from ${oldStatus} to ${newStatus}`
}

export default function AuditDetails({ taskId, jobCardNo }) {
  const { data, isLoading, error } = useSWR(
    ["https://namami-infotech.com/NIKHILOFFSET/src/task/get_task_audit.php", taskId],
    async ([url, id]) => {
      return postJson(url, { taskId: String(id) })
    },
  )

  if (isLoading) {
    return <div className="audit-loading">Loading audit history...</div>
  }

  if (error || !data?.success) {
    return <div className="no-audit-data">No audit history available for this task</div>
  }

  const items = data?.data ?? []

  if (!items.length) {
    return <div className="no-audit-data">No audit history available for this task</div>
  }

  return (
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
          {items.map((audit) => (
            <tr key={audit.id} className="audit-row">
              <td className="audit-date">{formatDateTime(audit.change_time)}</td>
              <td className="audit-changed-by">{audit.changed_by}</td>
              <td className="audit-old-status">
                <span className={`status-badge ${getStatusClass(audit.old_status)}`}>{audit.old_status}</span>
              </td>
              <td className="audit-new-status">
                <span className={`status-badge ${getStatusClass(audit.new_status)}`}>{audit.new_status}</span>
              </td>
              <td className="audit-action">{getStatusChangeDescription(audit.old_status, audit.new_status)}</td>
              <td className="audit-remarks">{audit.remarks}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
