import React, { useState } from 'react';
import { Box, useMediaQuery, Button, Stack } from '@mui/material';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import MapPage from '../components/dealers/MapPage';
import LiveTrack from '../components/dealers/LiveTrack';

function Maps() {
    const [selectedTab, setSelectedTab] = useState("visitMap"); // Default tab
    const isMobile = useMediaQuery('(max-width:600px)');
    const drawerWidth = isMobile ? 0 : 100;

    return (
        <Box sx={{ display: 'flex', height: '100vh' }}>
            {/* Sidebar */}
            <Box sx={{ width: drawerWidth, flexShrink: 0 }}>
                <Sidebar />
            </Box>

            {/* Main Content */}
            <Box component="main" sx={{ flexGrow: 1, p: 0 }}>
                <Navbar />

                {/* Buttons for switching between views */}
                <Stack direction="row" spacing={2} sx={{ mt: 2, mb: 2, justifyContent: "center" }}>
                    <Button 
                        variant="contained"
                        onClick={() => setSelectedTab("visitMap")}
                        sx={{ 
                            backgroundColor: selectedTab === "visitMap" ? "#344C7D" : "#B0BEC5", 
                            color: selectedTab === "visitMap" ? "white" : "#344C7D",
                            '&:hover': { backgroundColor: selectedTab === "visitMap" ? "#16263D" : "#90A4AE" }
                        }}
                    >
                        Visit Track
                    </Button>
                    <Button 
                        variant="contained"
                        onClick={() => setSelectedTab("liveField")}
                        sx={{ 
                            backgroundColor: selectedTab === "liveField" ? "#344C7D" : "#B0BEC5", 
                            color: selectedTab === "liveField" ? "white" : "#344C7D",
                            '&:hover': { backgroundColor: selectedTab === "liveField" ? "#16263D" : "#90A4AE" }
                        }}
                    >
                        Live Track
                    </Button>
                </Stack>

                {/* Render components based on selected tab */}
                <Box sx={{ mt: 1, p: 1 }}>
                    {selectedTab === "visitMap" ? <MapPage /> : <LiveTrack/>}
                </Box>
            </Box>
        </Box>
    );
}

export default Maps;
