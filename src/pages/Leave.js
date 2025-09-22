import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Box, Button, useMediaQuery } from '@mui/material';
import ApplyLeave from '../components/leave/ApplyLeave';
import ViewLeave from '../components/leave/ViewLeave';
import { useAuth } from '../components/auth/AuthContext'; // Assuming AuthContext is where you get user info


function Leave() {
    const { user } = useAuth();
    const isMobile = useMediaQuery('(max-width:600px)');
    const drawerWidth = isMobile ? 0 : 11;
    const [openApplyLeaveDialog, setOpenApplyLeaveDialog] = useState(false);

    const handleOpenApplyLeaveDialog = () => setOpenApplyLeaveDialog(true);
    const handleCloseApplyLeaveDialog = () => setOpenApplyLeaveDialog(false);

    const handleLeaveApplied = () => {
        // Handle the leave application success here if needed
        // For example, showing a confirmation message or refreshing data
        handleCloseApplyLeaveDialog();
    };

    return (
        <Box sx={{ display: 'flex' }}>
            {/* Sidebar with fixed width */}
            <Box sx={{ width: drawerWidth, flexShrink: 0 }}>
                <Sidebar />
            </Box>
            <Box component="main" sx={{ flexGrow: 1, p: 0, ml: drawerWidth }}>
                <Navbar />
                <div style={{ marginTop: "0px", marginLeft: "0px" }}>
                    {/* <Button variant="contained" color="primary" onClick={handleOpenApplyLeaveDialog} style={{ backgroundColor: "#344C7D" }}>
                        Apply for Leave
                    </Button>
                    <ApplyLeave
                        open={openApplyLeaveDialog}
                        onClose={handleCloseApplyLeaveDialog}
                        onLeaveApplied={handleLeaveApplied}
                    /> */}
                    {user && user.emp_id && <ViewLeave EmpId={user.emp_id} />}
                </div>
            </Box>
        </Box>
    );
}

export default Leave;
