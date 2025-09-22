import React, { useEffect, useState } from "react";
import {
  Typography,
  Paper,
  Box,
  CircularProgress,
  Button,
  TextField,
  IconButton,
  List,
  ListItem
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";

const FinalizeAdmissionView = () => {
  const [formDataList, setFormDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(true);
  const [originalData, setOriginalData] = useState([]);
  const [scholarshipAmount, setScholarshipAmount] = useState("");
  const navigate = useNavigate();
  const { state } = useLocation();

  const feeFields = {
    
    tution_fees: "Tuition Fees",
    exam_fees: "Exam Fees",
    hostel_fees: "Hostel Fees",
    admission_fees: "Admission Fees",
    prospectus_fees: "Prospectus Fees",
    due_date: "Due Date",
    Scholarship: "Scholarship"
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      const studentId = state?.studentId || localStorage.getItem("studentId");
      const course = state?.course || localStorage.getItem("course");

      if (!studentId || !course) {
        alert("Student ID or Course not found. Please go back and try again.");
        setLoading(false);
        return;
      }

      const fetchFeeStructure = async () => {
        try {
          const res = await axios.get(
            "https://namami-infotech.com/NIKHILOFFSET/src/fees/get_fee_structure.php"
          );

          if (res.data.success && Array.isArray(res.data.data)) {
            const matched = res.data.data.filter((item) => item.course === course);

            const withStudentId = matched.map((item) => ({
              ...item,
              StudentId: studentId
            }));

            setFormDataList(withStudentId);
            setOriginalData(withStudentId);
          } else {
            console.warn("No data found or unexpected response format.");
          }
        } catch (err) {
          console.error("API error:", err);
          alert("Error loading fee structure.");
        } finally {
          setLoading(false);
        }
      };

      fetchFeeStructure();
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  const handleInputChange = (index, field, value) => {
    const updated = [...formDataList];
    updated[index][field] = value;
    setFormDataList(updated);
  };

  const handleCancelEdit = () => {
    setFormDataList(originalData);
    setEditMode(false);
  };

  const handleScholarshipApply = () => {
    const totalInstallments = formDataList.length;
    const amount = parseFloat(scholarshipAmount);

    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid scholarship amount.");
      return;
    }

    const perInstallment = Math.round(amount / totalInstallments);
    const updated = formDataList.map((item) => ({
      ...item,
      Scholarship: perInstallment
    }));

    setFormDataList(updated);
  };

  const handleSubmit = async () => {
    try {
      for (const data of formDataList) {
        await axios.post(
          "https://namami-infotech.com/NIKHILOFFSET/src/fees/add_student_fee_structure.php",
          data
        );
      }
      alert("Fee structure submitted successfully.");
      setOriginalData(formDataList);
      setEditMode(false);
      navigate("/admissions")
    } catch (error) {
      console.error("Submission error:", error);
      alert("An error occurred during submission.");
    }
  };

  if (loading) return <CircularProgress sx={{ mt: 5 }} />;

  if (!formDataList.length) {
    return (
      <Box sx={{ mt: 5, textAlign: "center" }}>
        <Typography variant="h6" color="error">
          No fee structure available for this course.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, background: "#fff", pb: 10 }}>
      {/* Header with Scholarship input */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
          gap: 2
        }}
      >
        <Typography variant="h5" fontWeight={700} color="#344C7D" sx={{ flexGrow: 1 }}>
          Student Fee Structure
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h6" fontWeight={700} color="#344C7D" sx={{ flexGrow: 1 }}>
          Total Scholarship
        </Typography>
          <TextField
            label="Scholarship"
            variant="outlined"
            size="small"
            value={scholarshipAmount}
            onChange={(e) => setScholarshipAmount(e.target.value)}
            disabled={!editMode}
          />
          <Button
            variant="outlined"
            onClick={handleScholarshipApply}
            disabled={!editMode}
          >
            Apply
          </Button>
        </Box>

        
      </Box>

      {/* Installments UI */}
      {formDataList.map((formData, index) => (
        <Paper key={index} sx={{ p: 4, mb: 4, borderRadius: 3, boxShadow: 4 }}>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Installment {formData.installment}
          </Typography>
          <List sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            {Object.entries(feeFields).map(([key, label]) => (
              <ListItem key={key} disablePadding sx={{ width: { xs: "100%", sm: "48%", md: "32%" } }}>
                <Box sx={{ width: "100%" }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {label}
                  </Typography>
                  {editMode ? (
                    <TextField
                      variant="outlined"
                      size="small"
                      fullWidth
                      value={formData[key] || ""}
                      onChange={(e) => handleInputChange(index, key, e.target.value)}
                    />
                  ) : (
                    <Typography variant="body1">{formData[key] || "—"}</Typography>
                  )}
                </Box>
              </ListItem>
            ))}
          </List>
        </Paper>
      ))}

      {/* Bottom submit button */}
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          p: 2,
          display: "flex",
          justifyContent: "flex-end",
          backgroundColor: "#fff",
          boxShadow: "0 -2px 8px rgba(0,0,0,0.05)",
          zIndex: 1000
        }}
      >
        <Button
          variant="contained"
          sx={{ backgroundColor: "#344C7D" }}
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </Box>
    </Box>
  );
};

export default FinalizeAdmissionView;
