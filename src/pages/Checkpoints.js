import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Box, useMediaQuery } from '@mui/material';
import { useAuth } from '../components/auth/AuthContext';
import CheckpointList from '../components/checkpoints/CheckpointList';
import AddCheckpointForm from '../components/checkpoints/AddCheckpointForm';

function Checkpoints() {
    const { user } = useAuth();
    const isMobile = useMediaQuery('(max-width:600px)');
    const drawerWidth = isMobile ? 0 : 10;

    return (
        <Box sx={{ display: 'flex' }}>
            <Box sx={{ width: drawerWidth, flexShrink: 0 }}>
                <Sidebar />
            </Box>
            <Box component="main" sx={{ flexGrow: 1, p: 0, ml: drawerWidth }}>
                <Navbar />
                <div style={{ margin: "20px" }}>
                    {user && user.emp_id && window.location.href.includes('/checkpoints') && <CheckpointList />} 
                    {user && user.emp_id && window.location.href.includes('/add-checkpoint') && <AddCheckpointForm/>} 
                </div>
            </Box>
        </Box>
    );
}

export default Checkpoints;
