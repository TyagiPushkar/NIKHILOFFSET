import {
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Box,
  Grid,
  Divider,
} from "@mui/material";
import logo from "../../assets/images (1).png";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRef } from "react";
// Utility to convert number to words
const numberToWords = (num) => {
  const a = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const numToWords = (n) => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
    if (n < 1000)
      return (
        a[Math.floor(n / 100)] +
        " Hundred" +
        (n % 100 ? " " + numToWords(n % 100) : "")
      );
    if (n < 100000)
      return (
        numToWords(Math.floor(n / 1000)) +
        " Thousand" +
        (n % 1000 ? " " + numToWords(n % 1000) : "")
      );
    if (n < 10000000)
      return (
        numToWords(Math.floor(n / 100000)) +
        " Lakh" +
        (n % 100000 ? " " + numToWords(n % 100000) : "")
      );
    return (
      numToWords(Math.floor(n / 10000000)) +
      " Crore" +
      (n % 10000000 ? " " + numToWords(n % 10000000) : "")
    );
  };

  if (isNaN(num)) return "";
  return numToWords(Number(num)).trim() + " Rupees Only";
};

const TransactionDialog = ({ open, transactionData, onClose, student }) => {
  const contentRef = useRef();
  if (!transactionData) return null;
  const total = Number(transactionData.total_amount);
  // Add this helper to calculate the breakdown total
  const getBreakdownTotal = (data) => {
    return (
      Number(data.tuition_fees || 0) +
      Number(data.exam_fees || 0) +
      Number(data.hostel_fees || 0) +
      Number(data.admission_fees || 0) +
      Number(data.prospectus_fees || 0)
    );
  };

  const handleDownload = async () => {
    const canvas = await html2canvas(contentRef.current);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save(`receipt_${transactionData.stu_id}.pdf`);
  };

  // Generate PDF blob and share on WhatsApp
  const handleShare = async () => {
    const canvas = await html2canvas(contentRef.current);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, width, height);

    const blob = pdf.output("blob");

    const file = new File([blob], "receipt.pdf", { type: "application/pdf" });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: "Receipt",
        text: "Please find the attached receipt.",
        files: [file],
      });
    } else {
      alert("WhatsApp share is only available on supported devices/browsers.");
    }
  };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <Box ref={contentRef}>
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <img src={logo} alt="College Logo" style={{ height: 60 }} />
            <Box textAlign="right">
              <Typography variant="h6" fontWeight={700}>
                Lakshay Institute Of Technology
              </Typography>
              <Typography variant="body2">
                M4/46, near water tank, Acharya Vihar, Bhubaneswar, Odisha
                751013
              </Typography>
              <Typography variant="body2">Phone: +91 - 6742544690</Typography>
              <Typography variant="body2">
                Email: connect@litindia.ac.in
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          <Box my={2}>
            <Typography
              variant="h6"
              align="center"
              fontWeight={700}
              gutterBottom
            >
              Fee Payment Receipt
            </Typography>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Student Details */}
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Student Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box display="flex" justifyContent="space-between">
                <strong>Student ID:</strong>{" "}
                <span>{transactionData.stu_id}</span>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <strong>Name:</strong>{" "}
                <span>{student?.CandidateName || "-"}</span>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <strong>Mobile:</strong>{" "}
                <span>{student?.StudentContactNo || "-"}</span>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <strong>Address:</strong>{" "}
                <span>{student?.PermanentAddress || "-"}</span>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box display="flex" justifyContent="space-between">
                <strong>Course:</strong> <span>{transactionData.course}</span>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <strong>Semester:</strong> <span>{student.Sem}</span>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <strong>Installment:</strong>{" "}
                <span>{transactionData.installment}</span>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <strong>Payment Mode:</strong>{" "}
                <span>{transactionData.mode}</span>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Transaction Details */}
          {/* Transaction Details */}
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Payment Breakdown
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              {Number(transactionData.tuition_fees) > 0 && (
                <Box display="flex" justifyContent="space-between">
                  <strong>Tuition Fees:</strong>{" "}
                  <span>₹{transactionData.tuition_fees}</span>
                </Box>
              )}
              {Number(transactionData.exam_fees) > 0 && (
                <Box display="flex" justifyContent="space-between">
                  <strong>Exam Fees:</strong>{" "}
                  <span>₹{transactionData.exam_fees}</span>
                </Box>
              )}
              {Number(transactionData.hostel_fees) > 0 && (
                <Box display="flex" justifyContent="space-between">
                  <strong>Hostel Fees:</strong>{" "}
                  <span>₹{transactionData.hostel_fees}</span>
                </Box>
              )}
              {Number(transactionData.admission_fees) > 0 && (
                <Box display="flex" justifyContent="space-between">
                  <strong>Admission Fees:</strong>{" "}
                  <span>₹{transactionData.admission_fees}</span>
                </Box>
              )}
              {Number(transactionData.prospectus_fees) > 0 && (
                <Box display="flex" justifyContent="space-between">
                  <strong>Prospectus Fees:</strong>{" "}
                  <span>₹{transactionData.prospectus_fees}</span>
                </Box>
              )}
              {(() => {
                const breakdownTotal = getBreakdownTotal(transactionData);
                const scholarship = breakdownTotal - total;
                return scholarship > 0 ? (
                  <Box mt={2} display="flex" justifyContent="space-between">
                    <strong>Scholarship:</strong> <span>₹{scholarship}</span>
                  </Box>
                ) : null;
              })()}
            </Grid>

            <Grid item xs={6}>
              <Box display="flex" justifyContent="space-between">
                <strong>Total Amount:</strong> <span>₹{total}</span>
              </Box>
              {Number(transactionData.deposit_amount) > 0 && (
                <Box display="flex" justifyContent="space-between">
                  <strong>Deposit Amount:</strong>{" "}
                  <span>₹{transactionData.deposit_amount}</span>
                </Box>
              )}
              {Number(transactionData.balance_amount) > 0 && (
                <Box display="flex" justifyContent="space-between">
                  <strong>Balance Amount:</strong>{" "}
                  <span>₹{transactionData.balance_amount}</span>
                </Box>
              )}
              {/* <Box display="flex" justifyContent="space-between">
              <strong>Date/Time:</strong>{" "}
              <span>{transactionData.date_time}</span>
            </Box> */}
              <Box mt={2} display="flex" justifyContent="space-between">
                <strong>In Words:</strong> <span>{numberToWords(total)}</span>
              </Box>

              {/* Scholarship Display */}
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />
          <Box textAlign="center">
            <Typography variant="body2" fontStyle="italic">
              This is a system-generated receipt and does not require a
              signature.
            </Typography>
          </Box>
        </DialogContent>
      </Box>
      <DialogActions>
        <Button onClick={handleShare} color="success" variant="outlined">
          Share
        </Button>
        <Button onClick={handleDownload} color="secondary" variant="outlined">
          Download
        </Button>
        <Button onClick={onClose} color="primary" variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransactionDialog;
