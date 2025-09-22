import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Box, useMediaQuery } from '@mui/material';
import LOAList from '../components/loa/LOAList';
import LOAForm from '../components/loa/LOAForm';
import DraftLOA from '../components/loa/DraftLOA';
import EditDraftLOA from '../components/loa/EditDraftLOA';

function LOA() {
    const isMobile = useMediaQuery('(max-width:600px)');
    const drawerWidth = isMobile ? 0 : 100;

    return (
        <Box sx={{ display: 'flex', height: '100vh' }}>
            {/* Sidebar with fixed width */}
            <Box sx={{ width: drawerWidth, flexShrink: 0 }}>
                <Sidebar />
            </Box>
            <Box component="main" sx={{ flexGrow: 1, p: 0 }}>
                <Navbar />
                <Box sx={{ mt: 1, p: 1 }}>
                   
                    {window.location.href.includes('/loa') && <LOAList />} 
                    {window.location.href.includes('/draft-list') && <DraftLOA />} 
                    {window.location.href.includes('/create-loa') && <LOAForm />} 
                    {window.location.href.includes('/edit-loa') && <EditDraftLOA/>} 
                                  
                </Box>
            </Box>
        </Box>
    );
}

export default LOA;
