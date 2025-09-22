import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function MenuList() {
    const [checkpoints, setCheckpoints] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(13);
    const navigate = useNavigate()
    // Fetch checkpoint data from API
    const fetchCheckpoints = async () => {
        try {
            const response = await axios.get('https://namami-infotech.com/NIKHILOFFSET/src/menu/get_menu.php');
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
        navigate("/add-menu");
    };

    return (
        <div>
            <div style={{display:"flex", justifyContent:"space-between"}}>
            <Typography variant="h6" gutterBottom style={{ marginBottom: '20px', color: '#344C7D' }}>
                Menu List
            </Typography>
 <Button variant="contained" color="primary" onClick={addCheckpoint} sx={{ mb: 2 }} style={{ backgroundColor: "#344C7D" }}>
                Add Menu
                </Button> 
                </div>
            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead style={{ backgroundColor: '#344C7D' }}>
                        <TableRow>
                            <TableCell style={{ color: 'white' }}>Menu ID</TableCell>
                            <TableCell style={{ color: 'white' }}>Category</TableCell>
                            <TableCell style={{ color: 'white' }}>Checkpoint Id</TableCell>  
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {checkpoints
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((checkpoint) => (
                                <TableRow key={checkpoint.MenuId}>
                                    <TableCell>{checkpoint.MenuId}</TableCell>
                                    <TableCell>{checkpoint.Cat}</TableCell>
                                    <TableCell>{checkpoint.CheckpointId || 'N/A'}</TableCell>
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

export default MenuList;
