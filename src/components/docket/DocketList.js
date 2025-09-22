import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, CircularProgress, TablePagination } from '@mui/material';
import axios from 'axios';

function DocketList() {
    const [menu, setMenu] = useState(null);
    const [checkpoints, setCheckpoints] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Pagination states
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5); // Default rows per page

    useEffect(() => {
        const fetchData = async () => {
            try {
                const menuResponse = await axios.get(`https://namami-infotech.com/NIKHILOFFSET/src/menu/get_menu.php`);
                const menuData = menuResponse.data.data[0];
                setMenu(menuData);

                const checkpointsResponse = await axios.get(`https://namami-infotech.com/NIKHILOFFSET/src/menu/get_checkpoints.php`);
                const filteredCheckpoints = checkpointsResponse.data.data.filter(cp => menuData.CheckpointId.split(',').includes(cp.CheckpointId.toString()));
                setCheckpoints(filteredCheckpoints);

                const transactionResponse = await axios.get(`https://namami-infotech.com/NIKHILOFFSET/src/menu/get_transaction.php?menuId=${menuData.MenuId}`);
                setTransactions(transactionResponse.data.data);
            } catch (err) {
                setError('Failed to fetch data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;

    // Pagination handlers
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <div>
            <Typography variant="h5" sx={{ mb: 2 }}>{menu?.Cat || 'Menu'}</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead style={{ backgroundColor: "#344C7D" }}>
                        <TableRow>
                            {checkpoints.map((cp) => (
                                <TableCell key={cp.CheckpointId} style={{ color: "white" }}>{cp.Description}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {transactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((transaction) => (
                            <TableRow key={transaction.ActivityId}>
                                {checkpoints.map((cp) => {
                                    const value = transaction.Details.find(d => d.ChkId === cp.CheckpointId)?.Value || '';
                                    return <TableCell key={cp.CheckpointId}>{value}</TableCell>;
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Pagination Component */}
            <TablePagination
                component="div"
                count={transactions.length}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 15]}
            />
        </div>
    );
}

export default DocketList;
