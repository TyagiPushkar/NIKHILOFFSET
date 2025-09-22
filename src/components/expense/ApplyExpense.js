import React, { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, IconButton } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';

function ApplyExpense({ open, onClose, onExpenseApplied }) {
    const { user } = useAuth();
    const [expenseEntries, setExpenseEntries] = useState([
        { empId: user.emp_id, expenseDate: '', expenseType: '', expenseAmount: '', image: null, Status: "Pending" }
    ]);

    const handleChange = (index, field, value) => {
        const newEntries = [...expenseEntries];
        newEntries[index][field] = value;
        setExpenseEntries(newEntries);
    };

    const handleAddEntry = () => {
        setExpenseEntries([...expenseEntries, { empId: user.emp_id, expenseDate: '', expenseType: '', expenseAmount: '', image: null, Status: "Pending" }]);
    };

    const handleRemoveEntry = (index) => {
        const newEntries = expenseEntries.filter((_, i) => i !== index);
        setExpenseEntries(newEntries);
    };

    const handleImageChange = (index, file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const newEntries = [...expenseEntries];
            newEntries[index].image = reader.result;
            setExpenseEntries(newEntries);
        };
        if (file) {
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        if (!user || !user.emp_id) {
            console.error('User is not authenticated');
            return;
        }

        try {
            const payload = {
                expenses: expenseEntries
            };
            const response = await axios.post('https://namami-infotech.com/NIKHILOFFSET/src/expense/apply_expense.php', payload);
            if (response.data.success) {
                onExpenseApplied();
                onClose();
            } else {
                console.error('Failed to apply for expenses:', response.data.message);
            }
        } catch (err) {
            console.error('Error applying for expenses:', err);
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Apply for Expenses</DialogTitle>
            <DialogContent>
                {expenseEntries.map((entry, index) => (
                    <div key={index} style={{ marginBottom: 10 }}>
                        <TextField
                            label="Expense Date"
                            type="date"
                            value={entry.expenseDate}
                            onChange={(e) => handleChange(index, 'expenseDate', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            variant="outlined"
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Expense Type"
                            value={entry.expenseType}
                            onChange={(e) => handleChange(index, 'expenseType', e.target.value)}
                            variant="outlined"
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Expense Amount"
                            value={entry.expenseAmount}
                            onChange={(e) => handleChange(index, 'expenseAmount', e.target.value)}
                            variant="outlined"
                            fullWidth
                            margin="normal"
                        />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(index, e.target.files[0])}
                            style={{ marginTop: 10 }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                            <IconButton onClick={handleAddEntry} color="primary">
                                <AddCircleOutlineIcon />
                            </IconButton>
                            {expenseEntries.length > 1 && (
                                <IconButton onClick={() => handleRemoveEntry(index)} color="secondary">
                                    <RemoveCircleOutlineIcon />
                                </IconButton>
                            )}
                        </div>
                    </div>
                ))}
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

export default ApplyExpense;
