import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Button,
  Avatar,
  Card,
  CardContent,
  Grid,
  Dialog,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useParams } from "react-router-dom";
import axios from "axios";
import PaymentsIcon from "@mui/icons-material/Payments";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PaymentDialog from "./PaymentDialog";
import TransactionDialog from "./TransactionDialog";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
const StudentFeesTransaction = () => {
  const { studentId } = useParams();
  const [studentData, setStudentData] = useState(null);
  const [feesData, setFeesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFee, setSelectedFee] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [transactionData, setTransactionData] = useState(null);
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);

  
  const fetchStudentAndFees = async () => {
    try {
      const studentRes = await axios.get(
        `https://namami-infotech.com/NIKHILOFFSET/src/students/get_student_id.php?StudentId=${studentId}`,
      );
      if (studentRes.data.success && studentRes.data.data) {
        setStudentData(studentRes.data.data);
      }

      const feesRes = await axios.get(
        `https://namami-infotech.com/NIKHILOFFSET/src/fees/get_student_fee_structure.php?StudentId=${studentId}`,
      );
      if (feesRes.data.success && feesRes.data.data) {
        setFeesData(feesRes.data.data);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      alert("Failed to fetch student or fee data.");
    } finally {
      setLoading(false);
    }
  };
  const fetchTransactionData = async (transactionId) => {
    try {
      const res = await axios.get(
        `https://namami-infotech.com/NIKHILOFFSET/src/fees/get_fee_transaction.php?id=${transactionId}`,
      );
      if (res.data.success && res.data.data) {
        setTransactionData(res.data.data);
        setTransactionDialogOpen(true);
      }
    } catch (err) {
      console.error("Error fetching transaction data:", err);
      alert("Failed to fetch transaction data.");
    }
  };

  useEffect(() => {
    fetchStudentAndFees();
  }, [studentId]);

  const handleOpenDialog = (fee) => {
    setSelectedFee(fee);
    setDialogOpen(true);
  };


  if (loading) return <CircularProgress sx={{ mt: 5 }} />;

  if (!studentData) {
    return (
      <Box sx={{ textAlign: "center", mt: 5 }}>
        <Typography variant="h6" color="error">
          Student not found.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, backgroundColor: "#fff", minHeight: "100vh" }}>
      {/* Student Info */}
      <Paper
        sx={{
          p: 4,
          mb: 3,
          borderRadius: 3,
          boxShadow: 4,
          position: "relative",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#f9f9f9",
        }}
      >
        <Button
          onClick={() => window.history.back()}
          sx={{ position: "absolute", top: 5, left: -6 }}
        >
          <ArrowBackIcon />
        </Button>

        <Avatar
          src={studentData.Photo}
          alt={studentData.CandidateName}
          sx={{ width: 120, height: 120, borderRadius: "8px", marginLeft: 3 }}
        />

        <Box sx={{ flex: 1, marginLeft: 3 }}>
          <Typography
            variant="h5"
            fontWeight={700}
            color="#344C7D"
            gutterBottom
          >
            {studentData.CandidateName}
          </Typography>

          <Typography variant="subtitle1" color="textSecondary">
            <strong>Course:</strong> {studentData.Course}
          </Typography><Typography variant="subtitle1" color="textSecondary">
            <strong>Student Id:</strong> {studentId}
          </Typography>
        </Box>
      </Paper>

      {/* Fee Installments */}
      <Paper sx={{ p: 4, mb: 3, borderRadius: 3, boxShadow: 4 }}>
        <Typography variant="h5" fontWeight={700} color="#344C7D" gutterBottom>
          Fee Installments
        </Typography>

        <Grid container spacing={2}>
          {feesData
            .filter((fee) => {
              return (
                Number(fee.tution_fees) !== 0 ||
                Number(fee.exam_fees) !== 0 ||
                Number(fee.hostel_fees) !== 0 ||
                Number(fee.admission_fees) !== 0 ||
                Number(fee.prospectus_fees) !== 0 ||
                Number(fee.Scholarship) !== 0
              );
            })
            .map((fee) => {
              const total =
                Number(fee.tution_fees) +
                Number(fee.exam_fees) +
                Number(fee.hostel_fees) +
                Number(fee.admission_fees) +
                Number(fee.prospectus_fees) -
                Number(fee.Scholarship || 0);

              return (
                <Grid item xs={12} sm={6} md={3} key={fee.id}>
                  <Card
                    sx={{
                      backgroundColor: "#fefefe",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      {/* Top Section */}
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <PaymentsIcon color="primary" />
                        <Typography fontWeight={600}>
                          Installment {fee.installment} – ₹{total}{" "}
                          {fee.Paid ? "(Paid)" : "(Due)"}
                        </Typography>
                      </Box>

                      {/* Accordion for details */}
                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography variant="body2">View Details</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          {fee.tution_fees != 0 && (
                            <Typography variant="body2">
                              <strong>Tuition:</strong> ₹{fee.tution_fees}
                            </Typography>
                          )}
                          {fee.exam_fees != 0 && (
                            <Typography variant="body2">
                              <strong>Exam:</strong> ₹{fee.exam_fees}
                            </Typography>
                          )}
                          {fee.hostel_fees != 0 && (
                            <Typography variant="body2">
                              <strong>Hostel:</strong> ₹{fee.hostel_fees}
                            </Typography>
                          )}
                          {fee.admission_fees != 0 && (
                            <Typography variant="body2">
                              <strong>Admission:</strong> ₹{fee.admission_fees}
                            </Typography>
                          )}
                          {fee.prospectus_fees != 0 && (
                            <Typography variant="body2">
                              <strong>Prospectus:</strong> ₹
                              {fee.prospectus_fees}
                            </Typography>
                          )}
                          {fee.Scholarship != 0 && (
                            <Typography variant="body2">
                              <strong>Scholarship:</strong> ₹{fee.Scholarship}
                            </Typography>
                          )}
                          <Box
                            display="flex"
                            alignItems="center"
                            gap={1}
                            mt={1}
                          >
                            <ScheduleIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              <strong>Due Date:</strong> {fee.due_date}
                            </Typography>
                          </Box>
                        </AccordionDetails>
                      </Accordion>
                    </CardContent>

                    {/* Bottom Section */}
                    <Box p={2}>
                      {Number(fee.Paid) > 0 ? (
                        <Button
                          variant="outlined"
                          fullWidth
                          sx={{ color: "green", borderColor: "green" }}
                          onClick={() => fetchTransactionData(fee.Paid)}
                        >
                          Paid
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={() => handleOpenDialog(fee)}
                          sx={{ color: "white", backgroundColor: "#344C7D" }}
                        >
                          Pay
                        </Button>
                      )}
                    </Box>
                  </Card>
                </Grid>
              );
            })}
        </Grid>
      </Paper>
      {transactionData && (
              <TransactionDialog
                  student={studentData}
          open={transactionDialogOpen}
          transactionData={transactionData}
          onClose={() => setTransactionDialogOpen(false)}
        />
      )}

      {/* Payment Dialog */}
      {selectedFee && (
        <PaymentDialog
          open={dialogOpen}
          feeData={selectedFee}
          onClose={(shouldRefresh) => {
            setDialogOpen(false);
            setSelectedFee(null);
            if (shouldRefresh) fetchStudentAndFees(); // Refresh after payment
          }}
          student={studentData}
        />
      )}
    </Box>
  );
};

export default StudentFeesTransaction;
