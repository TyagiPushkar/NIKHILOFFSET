import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Box, useMediaQuery, Container } from '@mui/material';
import DashboardData from '../components/dashboard/DashboardData';

function Dashboard() {
    const isMobile = useMediaQuery('(max-width:600px)');
    const drawerWidth = isMobile ? 0 : 80;

    return (
        <Box sx={{ display: 'flex', height: '100vh' }}>
            {/* Sidebar with fixed width */}
            <Box sx={{ width: drawerWidth, flexShrink: 0 }}>
                <Sidebar />
            </Box>
           
            <Box component="main" sx={{ flexGrow: 1, p: 0 }}>
                <Navbar />
                <Container maxWidth="xl" sx={{bgcolor:"#f5f5f5"}}>
                    
                            <Box sx={{ mt: 0 }}>
                                <DashboardData />
                            </Box>
                      
                </Container>
            </Box>
        </Box>
    );
}

export default Dashboard;
