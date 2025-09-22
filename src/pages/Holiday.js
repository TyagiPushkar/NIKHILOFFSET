import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Box, useMediaQuery } from '@mui/material';
import AddHoliday from '../components/holiday/AddHoliday';
import ViewHoliday from '../components/holiday/ViewHoliday';

import { useAuth } from '../components/auth/AuthContext';

function Holiday() {
    const { user } = useAuth(); // Get the current user from the AuthContext
    console.log(user)
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
                    {user && user.role === 'HR' ? <AddHoliday /> : null}

                    <ViewHoliday />
                </div>

            </Box>
        </Box>
    );
}

export default Holiday;
