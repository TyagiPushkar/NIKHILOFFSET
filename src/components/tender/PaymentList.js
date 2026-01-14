import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./TenderList.css";

function PaymentList() {
  const [tempRecords, setTempRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [taskStatus, setTaskStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const empId = user.emp_id || "";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tempResponse, taskResponse] = await Promise.all([
          axios.get(
            "https://namami-infotech.com/NIKHILOFFSET/src/menu/get_temp.php?menuId=1"
          ),
          axios.get(
            "https://namami-infotech.com/NIKHILOFFSET/src/task/get_task.php"
          ),
        ]);

        if (tempResponse.data.success) {
          setTempRecords(tempResponse.data.data);
        } else {
          setError("No temp data found.");
        }

        if (taskResponse.data.success) {
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

  useEffect(() => {
    // Filter records to only show "Complete" status
    const completedRecords = tempRecords.filter((record) => {
      const taskInfo = taskStatus[record.ActivityId];
      return taskInfo && taskInfo.status === "Complete";
    });

    setFilteredRecords(completedRecords);
  }, [tempRecords, taskStatus]);

  const processTaskData = (taskData) => {
    const statusMap = {};
    taskData.forEach((task) => {
      const { activityId, status, milestone, update_date } = task;
      if (
        !statusMap[activityId] ||
        new Date(update_date) > new Date(statusMap[activityId].update_date)
      ) {
        statusMap[activityId] = { status, milestone, update_date };
      }
    });
    return statusMap;
  };

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
        return {
          text: `In Progress - ${milestone}`,
          className: "status-pending",
        };
    }
  };

  const handlePaymentClick = (record) => {
    setSelectedRecord(record);
    setShowConfirmModal(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedRecord) return;

    setConfirmLoading(true);
    try {
      const response = await axios.post(
        "https://namami-infotech.com/NIKHILOFFSET/src/menu/update_payment_received.php",
        { ActivityId: selectedRecord.ActivityId, PaymentReceived: 1 }
      );

      if (response.data.success) {
        // Update local state
        setTempRecords((prev) =>
          prev.map((rec) =>
            rec.ActivityId === selectedRecord.ActivityId
              ? { ...rec, PaymentReceived: 1 }
              : rec
          )
        );

        setFilteredRecords((prev) =>
          prev.map((rec) =>
            rec.ActivityId === selectedRecord.ActivityId
              ? { ...rec, PaymentReceived: 1 }
              : rec
          )
        );

        // Close modal and show success message
        setShowConfirmModal(false);
        setSelectedRecord(null);

        // Show success UI message instead of alert
        setError(""); // Clear any previous errors
        // You might want to use a toast notification here instead
        // For now, we'll show a temporary success message
        const successMsg = "Payment status updated successfully!";
        setError(successMsg);
        setTimeout(() => setError(""), 3000); // Clear after 3 seconds
      } else {
        setError("Failed to update payment: " + response.data.message);
      }
    } catch (err) {
      console.error("Payment update error:", err);
      setError("Error updating payment. Please try again.");
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleCancelPayment = () => {
    setShowConfirmModal(false);
    setSelectedRecord(null);
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = tempRecords.filter((record) => {
      const taskInfo = taskStatus[record.ActivityId];
      // Only filter if status is Complete
      if (!taskInfo || taskInfo.status !== "Complete") return false;

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

  const totalPages = Math.ceil(filteredRecords.length / rowsPerPage);
  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRecords = filteredRecords.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading completed tenders...</p>
      </div>
    );
  }

  return (
    <div className="tender-list-container">
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="confirmation-modal">
            <div className="modal-header">
              <h3>Confirm Payment Receipt</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to mark this payment as received?</p>
              {selectedRecord && (
                <div className="record-info">
                  <p>
                    <strong>Job Name:</strong>{" "}
                    {selectedRecord.chkData?.find((chk) => chk.ChkId === "5")
                      ?.Value || "-"}
                  </p>
                
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button
                className="cancel-button"
                onClick={handleCancelPayment}
                disabled={confirmLoading}
              >
                Cancel
              </button>
              <button
                className="confirm-button"
                onClick={handleConfirmPayment}
                disabled={confirmLoading}
              >
                {confirmLoading ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="tender-list-header">
        <div className="tender-list-actions">
          <h2 className="tender-list-title">
            Payment Status List 
          </h2>
          
        </div>
        
      </div>

      {error && (
        <div
          className={`message-banner ${
            error.includes("success") ? "success" : "error"
          }`}
        >
          {error}
        </div>
      )}

      <div className="table-container">
        <table className="tender-table">
          <thead>
            <tr>
              <th>Job Name</th>
              <th>Payment Status</th>
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
                  <tr
                    style={{ cursor: "pointer" }}
                    key={record.ID}
                    onClick={() =>
                      navigate(`/tender/view/${record.ActivityId}`, {
                        state: { tempId: record.TempId },
                      })
                    }
                  >
                    <td>{nameEntry?.Value || "-"}</td>

                    <td>
                      {record.PaymentReceived === 0 && empId === "NIOF004" ? (
                        <button
                          className="mark-payment-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePaymentClick(record);
                          }}
                        >
                          Mark Payment Complete
                        </button>
                      ) : record.PaymentReceived === 1 ? (
                        <span className="payment-received">Received</span>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="3" className="no-records">
                  {searchTerm
                    ? "No matching completed jobs found"
                    : "No completed jobs found"}
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

export default PaymentList;
