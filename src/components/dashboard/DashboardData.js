import React, { useEffect, useState } from 'react';
import {
    Avatar,
    Box,
    CircularProgress,
    Divider,
    // Grid,
    LinearProgress,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Tab,
    Tabs,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
    Card,
    // CardContent,
    Paper,
} from '@mui/material';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';
// import UserProfile from '../employee/UserProfile';

const DashboardData = () => {
    const [employeeData, setEmployeeData] = useState(null);
    const [leaveDetails, setLeaveDetails] = useState(null);
    const [expenseDetails, setExpenseDetails] = useState(null);
    const [attendanceDetails, setAttendanceDetails] = useState([]);
    const [assetDetails, setAssetDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState(0);

    const { user } = useAuth();
    const EmpId = user.emp_id;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const responses = await Promise.all([
                    axios.get(`https://namami-infotech.com/NIKHILOFFSET/src/employee/view_employee.php?EmpId=${EmpId}`),
                    axios.get(`https://namami-infotech.com/NIKHILOFFSET/src/leave/balance_leave.php?empid=${EmpId}`),
                    axios.get(`https://namami-infotech.com/NIKHILOFFSET/src/expense/get_expense.php?EmpId=${EmpId}`),
                    axios.get(`https://namami-infotech.com/NIKHILOFFSET/src/attendance/view_attendance.php?EmpId=${EmpId}`),
                    axios.get(`https://namami-infotech.com/NIKHILOFFSET/src/assets/get_issue_asset.php?EmpId=${EmpId}`)
                ]);

                setEmployeeData(responses[0].data.data);
                setLeaveDetails(responses[1].data.data);
                setExpenseDetails(responses[2].data.data);
                setAttendanceDetails(responses[3].data.data);
                setAssetDetails(responses[4].data.data);
            } catch (err) {
                setError('Failed to fetch data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [EmpId]);

    if (loading) return <CircularProgress sx={{ display: 'block', margin: 'auto' }} />;
    if (error) return <Typography color="error">{error}</Typography>;

    const handleTabChange = (event, newValue) => setActiveTab(newValue);

    return (
        <Box sx={{ maxWidth: 1500, mx: 'auto', p: 1 }}>
            {/* Profile Section */}
            <Card sx={{ display: 'flex', alignItems: 'center', p: 3, boxShadow: 3 }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <Avatar sx={{ width: 100, height: 100 }} src={employeeData?.Pic} />
                </motion.div>
                <Box sx={{ ml: 3 }}>
                    <Typography variant="h5" fontWeight="bold">{employeeData?.Name || 'N/A'}</Typography>
                    <Typography color="textSecondary">{employeeData?.Designation || 'N/A'}</Typography>
                    <Typography color="textSecondary">Emp ID: {employeeData?.EmpId || 'N/A'}</Typography>
                </Box>
            </Card>
            {/* <UserProfile/> */}
            <Divider sx={{ my: 3 }} />

            {/* Tabs Section */}
            <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth" sx={{ mb: 3 }}>
                <Tab label="Attendance" />
                <Tab label="Leave" />
                <Tab label="Expense" />
                <Tab label="Assets" />
            </Tabs>

            {/* Attendance Tab */}
            {activeTab === 0 && (
                <Table component={Paper} sx={{ p: 2 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>In</TableCell>
                            <TableCell>Out</TableCell>
                            <TableCell>Working Hours</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {attendanceDetails.slice(0, 7).map((day, index) => (
                            <TableRow key={index}>
                                <TableCell>{day.date}</TableCell>
                                <TableCell>{day.firstIn}</TableCell>
                                <TableCell>{day.lastOut}</TableCell>
                                <TableCell>{day.workingHours} hrs</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            {/* Leave Tab */}
            {activeTab === 1 && (
                <Card sx={{ p: 3, boxShadow: 2 }}>
                    <Typography variant="h6">Sick Leave Balance: {leaveDetails?.SL || 0}</Typography>
                    <LinearProgress variant="determinate" value={(leaveDetails?.SL / 12) * 100} />
                </Card>
            )}

            {/* Expense Tab */}
            {activeTab === 2 && (
                <List>
                    {expenseDetails.map((expense) => (
                        <ListItem key={expense.detailId}>
                            <ListItemAvatar>
                                <Avatar src={expense.image} />
                            </ListItemAvatar>
                            <ListItemText
                                primary={`${expense.expenseType} - ₹${expense.expenseAmount}`}
                                secondary={`Date: ${expense.expenseDate} | Status: ${expense.Status}`}
                            />
                        </ListItem>
                    ))}
                </List>
            )}

            {/* Assets Tab */}
            {activeTab === 3 && (
                <Table component={Paper} sx={{ p: 2 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Asset</TableCell>
                            <TableCell>Make</TableCell>
                            <TableCell>Model</TableCell>
                            <TableCell>Serial No.</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {assetDetails.map((asset, index) => (
                            <TableRow key={index}>
                                <TableCell>{asset.asset_name}</TableCell>
                                <TableCell>{asset.make_name}</TableCell>
                                <TableCell>{asset.model_name}</TableCell>
                                <TableCell>{asset.serial_number}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </Box>
    );
};

export default DashboardData;