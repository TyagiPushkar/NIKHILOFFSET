import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import {
    Box,
    useMediaQuery,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Typography,
    Paper,
    Grid
} from '@mui/material';
import InternalExam from '../components/report/InternalExam';
import AssignmentReport from '../components/report/AssignmentReport';
import { Category } from '@mui/icons-material';

function StudentReport() {
    const isMobile = useMediaQuery('(max-width:600px)');
    const drawerWidth = isMobile ? 0 : 100;
    const [category, setCategory] = useState('Internal Exam');

    const renderComponent = () => {
        switch (category) {
            case 'Internal Exam':
                return <InternalExam />;
            case 'CBT':
                return <Typography mt={2}>CBT Report Coming Soon</Typography>;
            case 'Class Test':
                return <Typography mt={2}>Class Test Report Coming Soon</Typography>;
            case 'Assignment':
                return <AssignmentReport />;
            default:
                return null;
        }
    };

    return (
        <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#f4f6f8' }}>
            {/* Sidebar */}
            <Box sx={{ width: drawerWidth, flexShrink: 0 }}>
                <Sidebar />
            </Box>

            {/* Main Content */}
            <Box component="main" sx={{ flexGrow: 1, overflowY: 'auto' }}>
                <Navbar />

                <Box sx={{ px: 3, py: 2 }}>
                    {/* Header & Category Selector */}
                    <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2, backgroundColor: '#ffffff' }}>
                        <Grid container alignItems="center" spacing={2} justifyContent="space-between">
                            <Grid item xs={12} md="auto">
                                <Typography variant="h6" color="#344C7D" fontWeight="bold">
                                    {category} Report Dashboard
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <FormControl fullWidth size="small">
                                    <InputLabel id="category-label">Report Category</InputLabel>
                                    <Select
                                        labelId="category-label"
                                        value={category}
                                        label="Report Category"
                                        onChange={(e) => setCategory(e.target.value)}
                                    >
                                        <MenuItem value="Internal Exam">Internal Exam</MenuItem>
                                        <MenuItem value="CBT">CBT</MenuItem>
                                        <MenuItem value="Class Test">Class Test</MenuItem>
                                        <MenuItem value="Assignment">Assignment</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Dynamic Report Component */}
                    <Box elevation={1} sx={{ p: 0, borderRadius: 2 }}>
                        {renderComponent()}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

export default StudentReport;
