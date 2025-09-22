import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  TablePagination,
  TextField,
  Box,
  Button,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";

function LOAList() {
  const [tempRecords, setTempRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTempData = async () => {
      try {
        const response = await axios.get(
          "https://namami-infotech.com/NIKHILOFFSET/src/menu/get_temp.php?menuId=1",
        );
        if (response.data.success) {
          setTempRecords(response.data.data);
          setFilteredRecords(response.data.data);
        } else {
          setError("No data found.");
        }
      } catch (err) {
        setError("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };
    fetchTempData();
  }, []);

  const handleSearch = (e) => {
  const value = e.target.value.toLowerCase();
  setSearchTerm(value);
  const filtered = tempRecords.filter((record) => {
    const nameEntry = record.chkData?.find((chk) => chk.ChkId === 3);
    const tenderno = nameEntry?.Value?.toLowerCase() || "";
    const nameEntry2 = record.chkData?.find((chk) => chk.ChkId === 6);
    const name = nameEntry2?.Value?.toLowerCase() || "";

    return tenderno.includes(value) || name.includes(value);
  });
  setFilteredRecords(filtered);
  setPage(0);
};


  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (datetime) => {
    const dateObj = new Date(datetime);
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  };

  if (loading) return <CircularProgress />;
  // if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box p={2}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5" fontWeight="bold">
          LOA List
        </Typography>

        <Box display="flex" gap={2}>
          <TextField
            label="Search by LOA No. or Buyer Name"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearch}
            sx={{ width: 300 }}
          />
         
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: "#344C7D" }}>
            <TableRow>
              <TableCell sx={{ color: "white" }}>LOA No.</TableCell>
              <TableCell sx={{ color: "white" }}>Buyer</TableCell>
              <TableCell sx={{ color: "white" }}>Date</TableCell>
              <TableCell sx={{ color: "white" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRecords
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((record) => {
                const nameEntry = record.chkData?.find(
                  (chk) => chk.ChkId === 29,
                );
                const nameEntry2 = record.chkData?.find(
                  (chk) => chk.ChkId === 6,
                );
                return (
                  <TableRow key={record.ID} hover>
                    <TableCell>{nameEntry?.Value || "-"}</TableCell>
                    <TableCell>{nameEntry2?.Value || "-"}</TableCell>
                    <TableCell>{formatDate(record.Datetime)}</TableCell>
                    <TableCell>
                      <VisibilityIcon
                        color="primary"
                        sx={{ cursor: "pointer" }}
                        onClick={() =>
                          navigate(`/loa/view/${record.ActivityId}`)
                        }
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredRecords.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 15]}
      />
    </Box>
  );
}

export default LOAList;
