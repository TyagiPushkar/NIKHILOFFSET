import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";

function DashboardData() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(
        "https://namami-infotech.com/NIKHILOFFSET/src/dashboard/dashboard.php"
      );
      
      if (response.data.success) {
        setDashboardData(response.data.data);
      } else {
        setError("Failed to fetch dashboard data.");
      }
    } catch (err) {
      setError("Failed to connect to the server.");
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "complete":
        return "#28a745";
      case "in progress":
        return "#007bff";
      case "pending":
        return "#ffc107";
      case "hold":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "complete":
        return "status-complete";
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

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <div className="error-message">{error}</div>
        <button onClick={fetchDashboardData} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="dashboard-error">
        <div className="error-message">No data available</div>
        <button onClick={fetchDashboardData} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  const { total_job_cards, total_tasks, status_summary, milestone_summary } = dashboardData;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <button onClick={fetchDashboardData} className="refresh-button">
          🔄 Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card total-jobs">
          <div className="card-icon">📋</div>
          <div className="card-content">
            <h3 className="card-value">{total_job_cards}</h3>
            <p className="card-label">Total Job Cards</p>
          </div>
        </div>

        {/* <div className="summary-card total-tasks">
          <div className="card-icon">✅</div>
          <div className="card-content">
            <h3 className="card-value">{total_tasks}</h3>
            <p className="card-label">Total Tasks</p>
          </div>
        </div> */}

        <div className="summary-card completed-tasks">
          <div className="card-icon">🏆</div>
          <div className="card-content">
            <h3 className="card-value">{status_summary?.Complete || 0}</h3>
            <p className="card-label">Completed Tasks</p>
          </div>
        </div>

        <div className="summary-card in-progress-tasks">
          <div className="card-icon">⚡</div>
          <div className="card-content">
            <h3 className="card-value">{status_summary?.["Pending"] || 0}</h3>
            <p className="card-label">In Progress</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        
        {/* Milestone Summary */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Milestone Progress</h2>
          </div>
          <div className="milestone-cards">
            {Object.entries(milestone_summary || {}).map(([milestone, data]) => (
              <div key={milestone} className="milestone-card">
                <div className="milestone-header">
                  <h3 className="milestone-name">{milestone}</h3>
                  <span className="milestone-total">Total: {data.total}</span>
                </div>
                
                <div className="milestone-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${((data.Complete || 0) / data.total) * 100}%`,
                        backgroundColor: getStatusColor("Complete")
                      }}
                    ></div>
                  </div>
                  <div className="progress-text">
                    {Math.round(((data.Complete || 0) / data.total) * 100)}% Complete
                  </div>
                </div>

                <div className="milestone-statuses">
                  <div className="status-item">
                    <span className="status-dot pending"></span>
                    <span>Pending: {data.Pending || 0}</span>
                  </div>
                 
                  <div className="status-item">
                    <span className="status-dot hold"></span>
                    <span>Hold: {data.Hold || 0}</span>
                  </div>
                  <div className="status-item">
                    <span className="status-dot complete"></span>
                    <span>Complete: {data.Complete || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardData;