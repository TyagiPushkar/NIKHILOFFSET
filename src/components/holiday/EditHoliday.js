import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button } from '@mui/material';
import axios from 'axios';

function EditHoliday({ open, onClose, holiday, onHolidayUpdated }) {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');

    useEffect(() => {
        if (holiday) {
            setTitle(holiday.title);
            setDate(holiday.date);
        }
    }, [holiday]);

    const handleSubmit = async () => {
        try {
            const response = await axios.post('https://namami-infotech.com/NIKHILOFFSET/src/holiday/edit_holiday.php', {
                id: holiday.id,
                title,
                date
            });
            if (response.data.success) {
                onHolidayUpdated();
                onClose();
            } else {
                console.error('Failed to edit holiday');
            }
        } catch (err) {
            console.error('Error editing holiday:', err);
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Edit Holiday</DialogTitle>
            <DialogContent>
                <TextField
                    margin="dense"
                    label="Holiday Name"
                    fullWidth
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <TextField
                    margin="dense"
                    label="Holiday Date"
                    fullWidth
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">
                    Cancel
                </Button>
                <Button onClick={handleSubmit} color="primary">
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default EditHoliday;
