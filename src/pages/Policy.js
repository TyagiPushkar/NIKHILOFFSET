import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Box, useMediaQuery } from '@mui/material';
import PolicyList from '../components/policy/PolicyList';
import AddPolicy from '../components/policy/AddPolicy'


function Policy() {

    const isMobile = useMediaQuery('(max-width:600px)');
    const drawerWidth = isMobile ? 0 : 11;
    return (
        <Box sx={{ display: 'flex' }}>
            {/* Sidebar with fixed width */}
            <Box sx={{ width: drawerWidth, flexShrink: 0 }}>
                <Sidebar />
            </Box>
            <Box component="main" sx={{ flexGrow: 1, p: 0, ml: drawerWidth }}>
                <Navbar />
                <div style={{ marginTop: "20px", marginLeft: "10px" }}>
                    <AddPolicy />
                    <PolicyList />
                </div>

            </Box>
        </Box>
    );
}

export default Policy;
