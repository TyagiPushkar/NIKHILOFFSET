import React, { useEffect, useState } from 'react';
import { Box, Typography, useMediaQuery, Grid, Card, CardContent } from '@mui/material';
import axios from 'axios';
import ListBook from './ListBook';

function DashboardLib() {
    const isMobile = useMediaQuery('(max-width:600px)');
    const [dashboardData, setDashboardData] = useState(null);
    const [activeComponent, setActiveComponent] = useState('dashboard'); // initially show dashboard

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await axios.get('https://namami-infotech.com/NIKHILOFFSET/src/library/library_dash.php');
            if (response.data.success) {
                setDashboardData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    const cardStyles = {
        borderRadius: '20px',
        color: '#fff',
        cursor: 'pointer',
        transition: 'transform 0.3s',
        '&:hover': {
            transform: 'scale(1.05)',
        }
    };

    const cardColors = ['#4caf50', '#2196f3', '#344C7D', '#e91e63', '#9c27b0'];

    const cardTitles = [
        { label: 'Total Students', key: 'total_unique_students', component: 'students' },
        { label: 'Total Books', key: 'total_books', component: 'books' },
        { label: 'Unique Books', key: 'distinct_titles', component: 'uniqueBooks' },
        { label: 'Issued Books', key: 'issued_books', component: 'issuedBooks' },
        { label: 'Total Authors', key: 'total_authors', component: 'authors' },
    ];

    // Render based on active component
    const renderComponent = () => {
    switch (activeComponent) {
        case 'books':
            return <ListBook setView={setActiveComponent} />;
        case 'issuedBooks':
            return <ListBook setView={setActiveComponent} defaultStatusFilter="Issued" />;
        default:
            return (
                <Box sx={{ padding: 3 }}>
                    <Typography variant="h4" mb={3}>Library Dashboard</Typography>
                    <Grid container spacing={3}>
                        {dashboardData && cardTitles.map((card, index) => (
                            <Grid item xs={12} sm={6} md={4} key={card.key}>
                                <Card
                                    sx={{ ...cardStyles, backgroundColor: cardColors[index % cardColors.length] }}
                                    onClick={() => setActiveComponent(card.component)}
                                >
                                    <CardContent>
                                        <Typography variant="h6" mb={1}>{card.label}</Typography>
                                        <Typography variant="h4">{dashboardData[card.key]}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            );
    }
};


    return (
        <Box sx={{ display: 'flex' }}>
            <Box sx={{ flexGrow: 1 }}>
                {renderComponent()}
            </Box>
        </Box>
    );
}

export default DashboardLib;
