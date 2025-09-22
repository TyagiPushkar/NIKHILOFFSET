import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function CheckpointList() {
    const [checkpoints, setCheckpoints] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(13);
    const navigate = useNavigate()
    // Fetch checkpoint data from API
    const fetchCheckpoints = async () => {
        try {
            const response = await axios.get('https://namami-infotech.com/NIKHILOFFSET/src/menu/get_checkpoints.php');
            if (response.data.success) {
                setCheckpoints(response.data.data);
            } else {
                console.error('Failed to fetch checkpoints:', response.data.message);
            }
        } catch (err) {
            console.error('Error fetching checkpoints:', err);
        }
    };

    useEffect(() => {
        fetchCheckpoints();
    }, []);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
  const addCheckpoint = () => {
        navigate("/add-checkpoint");
    };

    return (
        <div>
            <div style={{display:"flex", justifyContent:"space-between"}}>
            <Typography variant="h6" gutterBottom style={{ marginBottom: '20px', color: '#344C7D' }}>
                Checkpoints List
            </Typography>
 <Button variant="contained" color="primary" onClick={addCheckpoint} sx={{ mb: 2 }} style={{ backgroundColor: "#344C7D" }}>
                Add Checkpoint
                </Button> 
                </div>
            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead style={{ backgroundColor: '#344C7D' }}>
                        <TableRow>
                            <TableCell style={{ color: 'white' }}>Checkpoint ID</TableCell>
                            <TableCell style={{ color: 'white' }}>Description</TableCell>
                            <TableCell style={{ color: 'white' }}>Value</TableCell>
                            <TableCell style={{ color: 'white' }}>Type</TableCell>
                            <TableCell style={{ color: 'white' }}>Mandatory</TableCell>
                            <TableCell style={{ color: 'white' }}>Editable</TableCell>
                            <TableCell style={{ color: 'white' }}>Validation</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {checkpoints
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((checkpoint) => (
                                <TableRow key={checkpoint.CheckpointId}>
                                    <TableCell>{checkpoint.CheckpointId}</TableCell>
                                    <TableCell>{checkpoint.Description}</TableCell>
                                    <TableCell>{checkpoint.Value || 'N/A'}</TableCell>
                                    <TableCell>{checkpoint.TypeId}</TableCell>
                                    <TableCell>{checkpoint.Mandatory ? 'Yes' : 'No'}</TableCell>
                                    <TableCell>{checkpoint.Editable ? 'Yes' : 'No'}</TableCell>
                                    <TableCell>{checkpoint.Validation || 'None'}</TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                component="div"
                count={checkpoints.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
            />
        </div>
    );
}

export default CheckpointList;
