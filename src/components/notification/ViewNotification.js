import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, CircularProgress, Button } from '@mui/material';
import axios from 'axios';
import AddNotification from './AddNotification';
import { useAuth } from '../auth/AuthContext';
function ViewNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const { user } = useAuth()
    const fetchNotifications = async () => {
        try {
            const response = await axios.get(`https://namami-infotech.com/NIKHILOFFSET/src/notification/get_notification.php?Tenent_Id=${user.tenent_id}`);
            setNotifications(response.data.notifications);
        } catch (err) {
            setError('Failed to fetch notifications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    },[user]); // Empty dependency array means this effect runs once on mount

    const handleOpenDialog = () => setDialogOpen(true);
    const handleCloseDialog = () => setDialogOpen(false);
    const onNotificationAdded = () => fetchNotifications(); // Refresh the list

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <div>
            {user && user.role === "HR" || "Admin" ? <Button variant="contained" color="primary" onClick={handleOpenDialog} sx={{ mb: 2 }} style={{ backgroundColor: "#344C7D" }}>
                Add Notification
            </Button> : null}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead style={{ backgroundColor: "#344C7D" }}>
                        <TableRow>
                            <TableCell style={{ color: "white" }}>Subject</TableCell>
                            <TableCell style={{ color: "white" }}>Body</TableCell>
                            <TableCell style={{ color: "white" }}>URL</TableCell>
                            <TableCell style={{ color: "white" }}>Push Time</TableCell>
                            <TableCell style={{ color: "white" }}>Image</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {notifications.map((notification) => (
                            <TableRow key={notification.id}>
                                <TableCell>{notification.subject}</TableCell>
                                <TableCell>{notification.body}</TableCell>
                                <TableCell>
                                    <a href={notification.url} target="_blank" rel="noopener noreferrer">{notification.url}</a>
                                </TableCell>
                                <TableCell>{notification.push_time}</TableCell>
                                <TableCell>
                                    {notification.image && <img src={notification.image} alt="Notification" style={{ width: '100px', height: 'auto' }} />}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <AddNotification open={dialogOpen} onClose={handleCloseDialog} onNotificationAdded={onNotificationAdded} />
        </div>
    );
}

export default ViewNotifications;
