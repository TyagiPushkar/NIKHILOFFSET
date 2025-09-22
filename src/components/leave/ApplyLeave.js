import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, MenuItem } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';

function ApplyLeave({ open, onClose, onLeaveApplied }) {
    const { user } = useAuth();
    const [leaveDetails, setLeaveDetails] = useState({
        empid: user?.emp_id || '', // Use 'empid' instead of 'EmpId'
        startDate: '',
        endDate: '',
        reason: '',
        status: 'Pending', // Use 'status' instead of 'Status'
        category: ''
    });

    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    const formatDate = (date) => {
        return date.toISOString().split('T')[0];
    };

    const today = new Date();

    useEffect(() => {
        const fetchLeaveBalances = async () => {
            try {
                const response = await axios.get(`https://namami-infotech.com/NIKHILOFFSET/src/leave/balance_leave.php?empid=${user.emp_id}`);
                if (response.data.success) {
                    const data = response.data.data;
                    const availableCategories = Object.keys(data)
                        .filter(key => key !== 'id' && key !== 'empid' && data[key] > 0)
                        .map(key => ({ label: key, value: key }));

                    setCategories(availableCategories);
                }
            } catch (err) {
                console.error('Error fetching leave balances:', err);
            } finally {
                setLoadingCategories(false);
            }
        };

        if (user?.emp_id) {
            fetchLeaveBalances();
        }
    }, [user]);

    const handleChange = (field, value) => {
        setLeaveDetails({ ...leaveDetails, [field]: value });
    };

    const handleSubmit = async () => {
        if (!user || !user.emp_id) {
            console.error('User is not authenticated');
            return;
        }

        try {
            const response = await axios.post('https://namami-infotech.com/NIKHILOFFSET/src/leave/apply_leave.php', leaveDetails);
            if (response.data.success) {
                onLeaveApplied();
                onClose();
            } else {
                console.error('Failed to apply for leave:', response.data.message);
            }
        } catch (err) {
            console.error('Error applying for leave:', err);
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Apply for Leave</DialogTitle>
            <DialogContent>
                <TextField
                    label="Employee ID"
                    value={leaveDetails.empid}
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    disabled
                />
                <TextField
                    label="Start Date"
                    type="date"
                    value={leaveDetails.startDate}
                    onChange={(e) => handleChange('startDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    inputProps={{
                        min: formatDate(today)
                    }}
                />
                <TextField
                    label="End Date"
                    type="date"
                    value={leaveDetails.endDate}
                    onChange={(e) => handleChange('endDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    inputProps={{
                        min: leaveDetails.startDate || formatDate(today)
                    }}
                />
                <TextField
                    select
                    label="Category"
                    value={leaveDetails.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    disabled={loadingCategories || categories.length === 0}
                >
                    {categories.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </TextField>
                <TextField
                    label="Reason"
                    value={leaveDetails.reason}
                    onChange={(e) => handleChange('reason', e.target.value)}
                    variant="outlined"
                    fullWidth
                    margin="normal"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">
                    Cancel
                </Button>
                <Button onClick={handleSubmit} color="primary">
                    Submit
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default ApplyLeave;
