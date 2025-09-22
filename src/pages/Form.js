import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Box, useMediaQuery } from '@mui/material';
import AdmissionFormLogic from '../components/form/AdmissionFormLogic';

function Form() {
  const isMobile = useMediaQuery('(max-width:600px)');
  const drawerWidth = isMobile ? 0 : 100;

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Box sx={{ width: drawerWidth, flexShrink: 0 }}>
        <Sidebar />
      </Box>
      <Box component="main" sx={{ flexGrow: 1, p: 0 }}>
        <Navbar />
        <Box sx={{ mt: -1, p: 1 }}>
          <AdmissionFormLogic /> {/* ✅ use the component, not the hook */}
        </Box>
      </Box>
    </Box>
  );
}

export default Form;
