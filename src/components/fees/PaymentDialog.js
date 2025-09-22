import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Typography,
  Box,
  Alert,
} from "@mui/material";
import axios from "axios";

const PaymentDialog = ({ open, onClose, feeData, student  }) => {
  const [mode, setMode] = useState("Cash");
  const [modeId, setModeId] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  if (!feeData) return null;

  const total =
    Number(feeData.tution_fees) +
    Number(feeData.exam_fees) +
    Number(feeData.hostel_fees) +
    Number(feeData.admission_fees) +
    Number(feeData.prospectus_fees) -
    Number(feeData.Scholarship || 0);

  const balance = total - Number(depositAmount || 0);

  const handleSubmit = async () => {
    setSubmitting(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
     const payload = {
  stu_id: student.StudentID, 
  course: student.Course, 
  installment: feeData.installment,
  tuition_fees: feeData.tution_fees,
  exam_fees: feeData.exam_fees,
  hostel_fees: feeData.hostel_fees,
  admission_fees: feeData.admission_fees,
  prospectus_fees: feeData.prospectus_fees,
  mode,
  mode_id: modeId,
  total_amount: total,
  deposit_amount: depositAmount,
  balance_amount: balance
};

      const res = await axios.post(
        "https://namami-infotech.com/NIKHILOFFSET/src/fees/add_fee_transaction.php",
        payload
      );

      if (res.data.success) {
        setSuccessMsg("Payment recorded successfully.");
        setTimeout(() => {
          onClose(true); // Notify parent to refresh
        }, 1000);
      } else {
        setErrorMsg(res.data.message || "Payment failed.");
      }
    } catch (err) {
      setErrorMsg("Error submitting payment.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Make Payment - Installment {feeData.installment}</DialogTitle>
      <DialogContent>
        {successMsg && <Alert severity="success">{successMsg}</Alert>}
        {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

        <Typography variant="subtitle1" mt={2}>
          <strong>Total Amount:</strong> ₹{total}
        </Typography>

        <TextField
          fullWidth
          margin="normal"
          select
          label="Payment Mode"
          value={mode}
          onChange={(e) => setMode(e.target.value)}
        >
          {["Cash", "Online", "UPI", "Cheque"].map((option) => (
            <MenuItem key={option} value={option}>{option}</MenuItem>
          ))}
        </TextField>

        <TextField
          fullWidth
          margin="normal"
          label="Transaction/Reference ID"
          value={modeId}
          onChange={(e) => setModeId(e.target.value)}
        />

        <TextField
          fullWidth
          margin="normal"
          type="number"
          label="Deposit Amount"
          value={depositAmount}
          onChange={(e) => setDepositAmount(e.target.value)}
        />

        <Box mt={2}>
          <Typography>
            <strong>Balance:</strong> ₹{isNaN(balance) ? "-" : balance}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={() => onClose(false)} disabled={submitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!depositAmount || submitting}
          variant="contained"
          color="primary"
        >
          {submitting ? "Submitting..." : "Submit Payment"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentDialog;
