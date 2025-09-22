import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Box, useMediaQuery } from '@mui/material';
import { useAuth } from '../components/auth/AuthContext';
// import ViewTickets from '../components/ticket/ViewTickets';
// import CheckpointList from '../components/checkpoints/CheckpointList';
// import AddCheckpointForm from '../components/checkpoints/AddCheckpointForm';
import MenuList from '../components/menus/MenuList';
import AddMenuForm from '../components/menus/AddMenuForm';



function Menus() {
    const { user } = useAuth();

    const isMobile = useMediaQuery('(max-width:600px)');
    const drawerWidth = isMobile ? 0 : 10;



    return (
        <Box sx={{ display: 'flex' }}>
            {/* Sidebar with fixed width */}
            <Box sx={{ width: drawerWidth, flexShrink: 0 }}>
                <Sidebar />
            </Box>
            <Box component="main" sx={{ flexGrow: 1, p: 0, ml: drawerWidth }}>
                <Navbar />
                <div style={{ margin: "20px" }}>

                    {/* Uncomment and update the ViewLeave component as needed */}
                    {user && user.emp_id && window.location.href.includes('/menus') && <MenuList />} 
                    {user && user.emp_id && window.location.href.includes('/add-menu') && <AddMenuForm/>} 
                </div>
            </Box>
        </Box>
    );
}

export default Menus;
