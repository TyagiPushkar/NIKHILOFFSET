// src/pages/Dealer.js

import React from 'react';
import { Box, useMediaQuery } from '@mui/material';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import VisitTable from '../components/dealers/VisitTable';
import { useLocation } from 'react-router-dom';
import PlanVisit from '../components/dealers/PlanVisit';

function Visit() {

    const isMobile = useMediaQuery('(max-width:600px)');
    const drawerWidth = isMobile ? 0 : 100;
    const location = useLocation()

    return (
        <Box sx={{ display: 'flex', height: '100vh' }}>
            {/* Sidebar with fixed width */}
            <Box sx={{ width: drawerWidth, flexShrink: 0 }}>
                <Sidebar />
            </Box>
            <Box component="main" sx={{ flexGrow: 1, p: 0 }}>
                <Navbar />
                <Box sx={{ mt: 1, p:1 }}>
                  {location.pathname === '/visit' ? <VisitTable /> : <PlanVisit/>}
                   
                </Box>
            </Box>
        </Box>
    );
}

export default Visit;
