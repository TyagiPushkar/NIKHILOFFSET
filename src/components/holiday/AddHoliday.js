import React, { useState } from 'react';
import {
    Dialog, DialogActions, DialogContent, DialogTitle,
    Button, TextField, IconButton, Autocomplete, MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';

const courseOptions = ['BCA', 'B. Sc'];
const semesterOptions = ['1', '2', '3', '4', '5', '6'];

function AddHoliday({ open, onClose, onHolidayAdded }) {
    const { user } = useAuth();
    const [holidays, setHolidays] = useState([
        { date: '', title: '', Course: 'All', Sem: 'All' }
    ]);

    const handleHolidayChange = (index, field, value) => {
        const newHolidays = [...holidays];
        newHolidays[index][field] = value;
        setHolidays(newHolidays);
    };

    const handleAddHoliday = () => {
        setHolidays([...holidays, { date: '', title: '', Course: 'All', Sem: 'All' }]);
    };

    const handleRemoveHoliday = (index) => {
        setHolidays(holidays.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        try {
            const payload = {
                Tenent_Id: user.tenent_id,
                holidays
            };

            const response = await axios.post('https://namami-infotech.com/NIKHILOFFSET/src/holiday/add_holiday.php', payload);

            if (response.data.success) {
                onHolidayAdded();
                onClose();
            } else {
                console.error('Failed to add holidays:', response.data.message);
            }
        } catch (err) {
            console.error('Error adding holidays:', err);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle style={{ backgroundColor: "#344C7D", color: "white" }}>Add Holidays</DialogTitle>
            <DialogContent>
                {holidays.map((holiday, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                        <br/>
                        <TextField
                            label="Date"
                            type="date"
                            value={holiday.date}
                            onChange={(e) => handleHolidayChange(index, 'date', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            variant="outlined"
                            fullWidth
                        />
                        <TextField
                            label="Title"
                            value={holiday.title}
                            onChange={(e) => handleHolidayChange(index, 'title', e.target.value)}
                            variant="outlined"
                            fullWidth
                        />
                        <Autocomplete
                            options={['All', ...courseOptions]}
                            value={holiday.Course}
                            onChange={(_, value) => handleHolidayChange(index, 'Course', value)}
                            renderInput={(params) => (
                                <TextField {...params} label="Course" variant="outlined" fullWidth />
                            )}
                        />
                        <TextField
                            select
                            label="Semester"
                            value={holiday.Sem}
                            onChange={(e) => handleHolidayChange(index, 'Sem', e.target.value)}
                            variant="outlined"
                            fullWidth
                        >
                            <MenuItem value="All">All</MenuItem>
                            {semesterOptions.map((sem) => (
                                <MenuItem key={sem} value={sem}>{sem}</MenuItem>
                            ))}
                        </TextField>
                        {holidays.length > 1 && (
                            <IconButton onClick={() => handleRemoveHoliday(index)} color="secondary">
                                <RemoveIcon />
                            </IconButton>
                        )}
                    </div>
                ))}
                <Button startIcon={<AddIcon />} onClick={handleAddHoliday}>
                    Add Another Holiday
                </Button>
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

export default AddHoliday;
