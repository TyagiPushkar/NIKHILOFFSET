import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  TablePagination,
  TableFooter,
  Button,
} from "@mui/material";
import axios from "axios";
import AddFeeStructureDialog from "./AddFeeStructureDialog";
import { useNavigate } from "react-router-dom";

const StructureList = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [structures, setStructures] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    fetchFeeStructures();
  }, []);

  const fetchFeeStructures = async () => {
    try {
      const response = await axios.get(
        "https://namami-infotech.com/NIKHILOFFSET/src/fees/get_fee_structure.php",
      );
      if (response.data.success) {
        setStructures(response.data.data);
      } else {
        setSnackbarMessage(response.data.message);
        setOpenSnackbar(true);
      }
    } catch (error) {
      setSnackbarMessage("Failed to fetch fee structures.");
      setOpenSnackbar(true);
    }
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 0,
        }}
      >
              <h2>Fee Structure List</h2>
               {/* <Button
          onClick={() => navigate('/fees-payment')}
          style={{ backgroundColor: "#344C7D", color: "white" }}
        >
           FEES PAYMENT
        </Button> */}
        <Button
          onClick={() => setDialogOpen(true)}
          style={{ backgroundColor: "#344C7D", color: "white" }}
        >
          Add Fee Structure
        </Button>
      </div>
      <AddFeeStructureDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={fetchFeeStructures}
      />
      <TableContainer component={Paper}>
        <Table>
          <TableHead style={{ backgroundColor: "#344C7D" }}>
            <TableRow>
              <TableCell style={{ color: "white" }}>ID</TableCell>
              <TableCell style={{ color: "white" }}>Course</TableCell>
              <TableCell style={{ color: "white" }}>Installment</TableCell>
              <TableCell style={{ color: "white" }}>Tuition Fees</TableCell>
              <TableCell style={{ color: "white" }}>Exam Fees</TableCell>
              <TableCell style={{ color: "white" }}>Hostel Fees</TableCell>
              <TableCell style={{ color: "white" }}>Admission Fees</TableCell>
              <TableCell style={{ color: "white" }}>Prospectus Fees</TableCell>
              <TableCell style={{ color: "white" }}>Due Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {structures
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.course}</TableCell>
                  <TableCell>{row.installment}</TableCell>
                  <TableCell>{row.tution_fees}</TableCell>
                  <TableCell>{row.exam_fees}</TableCell>
                  <TableCell>{row.hostel_fees}</TableCell>
                  <TableCell>{row.admission_fees}</TableCell>
                  <TableCell>{row.prospectus_fees}</TableCell>
                  <TableCell>{row.due_date ?? "N/A"}</TableCell>
                </TableRow>
              ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                count={structures.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        message={snackbarMessage}
      />
    </div>
  );
};

export default StructureList;
