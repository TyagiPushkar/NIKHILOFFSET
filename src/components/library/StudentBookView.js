import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Avatar,
} from "@mui/material";
import { useParams } from "react-router-dom";
import axios from "axios";
import MenuBookIcon from "@mui/icons-material/MenuBook"; // Import the icon
import { Book } from "@mui/icons-material";
import IssueBookDialog from "./IssueBookDialog";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const StudentBooksView = () => {
  const { studentId } = useParams();
  const [studentData, setStudentData] = useState(null);
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [returnedBooks, setReturnedBooks] = useState([]);
  const [bookDetails, setBookDetails] = useState([]);
  const [returnedBookDetails, setReturnedBookDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openIssueDialog, setOpenIssueDialog] = useState(false); // Dialog state
  const [selectedTransactions, setSelectedTransactions] = useState([]);

  const fetchStudentAndBooks = async () => {
    try {
      const studentRes = await axios.get(
        `https://namami-infotech.com/NIKHILOFFSET/src/students/get_student_id.php?StudentId=${studentId}`,
      );

      if (studentRes.data.success && studentRes.data.data) {
        const student = studentRes.data.data;
        setStudentData(student);

        const issuedRes = await axios.get(
          `https://namami-infotech.com/NIKHILOFFSET/src/library/get_library_transaction.php?StudentId=${studentId}`,
        );

        if (issuedRes.data.success && issuedRes.data.data) {
          setIssuedBooks(issuedRes.data.data);

          const bookDetailsRes = await Promise.all(
            issuedRes.data.data.map(async (transaction) => {
              const bookRes = await axios.get(
                `https://namami-infotech.com/NIKHILOFFSET/src/library/get_book.php?BookId=${transaction.BookId}`,
              );
              return bookRes.data.success ? bookRes.data.data[0] : null;
            }),
          );
          setBookDetails(bookDetailsRes.filter((book) => book != null));
        }

        const returnedRes = await axios.get(
          `https://namami-infotech.com/NIKHILOFFSET/src/library/get_library_history.php?StudentId=${studentId}`,
        );

        if (returnedRes.data.success && returnedRes.data.data) {
          setReturnedBooks(returnedRes.data.data);

          const returnedBookDetailsRes = await Promise.all(
            returnedRes.data.data.map(async (transaction) => {
              const bookRes = await axios.get(
                `https://namami-infotech.com/NIKHILOFFSET/src/library/get_book.php?BookId=${transaction.BookId}`,
              );
              return bookRes.data.success ? bookRes.data.data[0] : null;
            }),
          );
          setReturnedBookDetails(
            returnedBookDetailsRes.filter((book) => book != null),
          );
        }
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      alert("An error occurred while fetching student/book data.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchStudentAndBooks();
  }, [studentId]);
  const handleOpenIssueDialog = () => {
    setOpenIssueDialog(true);
  };

  const handleCloseIssueDialog = () => {
    setOpenIssueDialog(false);
  };
  const handleBookIssued = () => {
    // You can refresh or update the issued books list after a successful book issue
    fetchStudentAndBooks();
  };
  const handleCheckboxChange = (transactionId) => {
    setSelectedTransactions((prevSelected) =>
      prevSelected.includes(transactionId)
        ? prevSelected.filter((id) => id !== transactionId)
        : [...prevSelected, transactionId],
    );
  };

  const handleReturnSelectedBooks = async () => {
    if (selectedTransactions.length === 0) {
      alert("Please select at least one book to return.");
      return;
    }

    const confirmReturn = window.confirm(
      `Are you sure you want to return ${selectedTransactions.length} book(s)?`,
    );

    if (!confirmReturn) return;

    try {
      const response = await axios.post(
        "https://namami-infotech.com/NIKHILOFFSET/src/library/return_book.php", // Assuming you create this API
        {
          StudentId: studentId,
          TransactionIds: selectedTransactions,
        },
      );

      if (response.data.success) {
        alert("Selected books returned successfully!");
        setSelectedTransactions([]); // Clear selection
        fetchStudentAndBooks(); // Refresh
      } else {
        alert("Failed to return books.");
      }
      fetchStudentAndBooks()
    } catch (error) {
      console.error("Error returning selected books:", error);
      alert("An error occurred while returning the books.");
    }
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
          border: "1px solid #ddd",
          backgroundColor: "#f9f9f9",
        }}
      >
        {/* Go Back Button */}
        <Button
          onClick={() => window.history.back()}
          sx={{ position: "absolute", top: 5, left: -6 }}
        >
          <ArrowBackIcon />
        </Button>

        {/* Student Photo */}
        <Avatar
          src={studentData.Photo}
          alt={studentData.CandidateName}
          sx={{ width: 120, height: 120, borderRadius: "8px", marginLeft: 3 }}
        />

        {/* Student Info */}
        <Box sx={{ flex: 1, marginLeft: 3 }}>
          {/* Student Name */}
          <Typography
            variant="h5"
            fontWeight={700}
            color="#344C7D"
            gutterBottom
          >
            {studentData.CandidateName}
          </Typography>

          <Typography
            variant="subtitle1"
            color="textSecondary"
            sx={{ marginBottom: 2 }}
          >
            <strong>Course:</strong> {studentData.Course}
          </Typography>

          {/* Enrollment Year */}
        </Box>
        
        {/* Issue New Book Button */}
        <Button
          onClick={handleOpenIssueDialog}
          variant="contained"
          sx={{
            position: "absolute",
            top: 16,
            right: 36,
            backgroundColor: "#344C7D",
            "&:hover": {
              backgroundColor: "#344C7D",
            },
          }}
        >
          <AddIcon /> Issue Book
        </Button>
      </Paper>

      <IssueBookDialog
        open={openIssueDialog}
        course={studentData.Course}
        StudentId={studentId}
        onClose={handleCloseIssueDialog}
        onSuccess={handleBookIssued}
      />
      {/* Issued Books */}
      <Paper sx={{ p: 4, mb: 3, borderRadius: 3, boxShadow: 4 }}>
        <Typography variant="h5" fontWeight={700} color="#344C7D" gutterBottom>
          Issued Books
        </Typography>

        <Grid container spacing={3}>
          {issuedBooks.map((transaction) => {
            const book = bookDetails.find(
              (b) => b.BookId === transaction.BookId,
            );
            if (!book) return null;

            const isSelected = selectedTransactions.includes(
              transaction.TransactionId,
            );

            return (
              <Grid item xs={12} sm={6} md={6} key={transaction.TransactionId}>
                <Card
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "row",
                    backgroundColor: isSelected ? "#e0f7fa" : "white",
                  }}
                >
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() =>
                      handleCheckboxChange(transaction.TransactionId)
                    }
                    style={{ marginLeft: 16 }}
                  />

                  <IconButton sx={{ marginLeft: 2 }}>
                    <MenuBookIcon fontSize="large" />
                  </IconButton>
                  <CardContent sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={600}>
                      {book.Title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Author:</strong> {book.Author}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Publisher:</strong> {book.Publisher}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Issued on</strong> {transaction.CreatedAt}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {selectedTransactions.length > 0 && (
          <Box sx={{ textAlign: "center", mt: 3 }}>
            <Button
              variant="contained"
              color="error"
              onClick={handleReturnSelectedBooks}
            >
              Return Selected Books
            </Button>
          </Box>
        )}
      </Paper>

      {/* Returned Books */}
      <Paper sx={{ p: 4, mb: 3, borderRadius: 3, boxShadow: 4 }}>
        <Typography variant="h5" fontWeight={700} color="#344C7D" gutterBottom>
          Returned Books
        </Typography>

        {returnedBookDetails.length ? (
          <Grid container spacing={3}>
            {returnedBookDetails.map((book, index) => {
              const transaction = returnedBooks[index];
              return (
                <Grid item xs={12} sm={6} md={4} key={book.BookId}>
                  <Card
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      flexDirection: "row",
                    }}
                  >
                    <IconButton sx={{ marginLeft: 2 }}>
                      <MenuBookIcon fontSize="large" />
                    </IconButton>
                    <CardContent sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={600}>
                        {book.Title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Issue Date:</strong>{" "}
                        {new Date(transaction.IssueDate).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Status:</strong> {transaction.Status}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Return on</strong>{" "}
                        transaction.UpdatedAt
                          
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Typography>No books have been returned by this student.</Typography>
        )}
      </Paper>

      {/* Button */}
    </Box>
  );
};

export default StudentBooksView;
