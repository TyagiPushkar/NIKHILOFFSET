import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Box, Button, useMediaQuery } from '@mui/material';
import { useAuth } from '../components/auth/AuthContext';
import ApplyTravel from '../components/travel/ApplyTravel';
import ViewTravel from '../components/travel/ViewTravel';


function Travel() {
    const { user } = useAuth();
    const [openApplyExpenseDialog, setOpenApplyExpenseDialog] = useState(false);

    const isMobile = useMediaQuery('(max-width:600px)');
    const drawerWidth = isMobile ? 0 : 11;

    const handleOpenApplyExpenseDialog = () => setOpenApplyExpenseDialog(true);
    const handleCloseApplyExpenseDialog = () => setOpenApplyExpenseDialog(false);



    const handleExpenseApplied = () => {
        // Handle the expense application success here if needed
        // For example, showing a confirmation message or refreshing data
        handleCloseApplyExpenseDialog();
    };

    return (
        <Box sx={{ display: 'flex' }}>
            {/* Sidebar with fixed width */}
            <Box sx={{ width: drawerWidth, flexShrink: 0 }}>
                <Sidebar />
            </Box>
            <Box component="main" sx={{ flexGrow: 1, p: 0, ml: drawerWidth }}>
                <Navbar />
                <div style={{ marginTop: "20px", marginLeft: "10px" }}>

                    <Button variant="contained" color="primary" onClick={handleOpenApplyExpenseDialog} style={{ marginLeft: '10px', backgroundColor: "#344C7D" }} >
                        Apply for Expense
                    </Button>

                    <ApplyTravel
                        open={openApplyExpenseDialog}
                        onClose={handleCloseApplyExpenseDialog}
                        onExpenseApplied={handleExpenseApplied}
                    />
                    <br />
                    <br />
                    {/* Uncomment and update the ViewLeave component as needed */}
                    {user && user.emp_id && <ViewTravel EmpId={user.emp_id} />}
                </div>
            </Box>
        </Box>
    );
}

export default Travel;
