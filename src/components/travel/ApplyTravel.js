import React, { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';
import Alert from '@mui/material/Alert';

function ApplyTravel({ open, onClose, onTravelApplied }) {
    const { user } = useAuth();
    const [travelEntry, setTravelEntry] = useState({
        empId: user.emp_id,
        travelDate: '',
        travelDestination: '',
        travelFrom: '',
        travelTo: '',
        travelType: '',
        status: 'Pending'
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');

    const handleChange = (field, value) => {
        setTravelEntry({ ...travelEntry, [field]: value });
    };

    const handleSubmit = async () => {
        if (!user || !user.emp_id) {
            return;
        }

        const isValid = Object.values(travelEntry).every(value => value.trim() !== '');

        if (!isValid) {
            return;
        }

        setLoading(true);
        setSuccess('');

        try {
            const payload = {
                application: travelEntry
            };
            const response = await axios.post('https://namami-infotech.com/NIKHILOFFSET/src/travel/apply_travel.php', payload);
            if (response.data.success) {
                setSuccess('Travel application submitted successfully.');
                onTravelApplied();
                onClose();
            } else {
            }
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Apply for Travel</DialogTitle>
            <DialogContent>
                <TextField
                    label="Travel Date"
                    type="date"
                    value={travelEntry.travelDate}
                    onChange={(e) => handleChange('travelDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Travel Destination"
                    value={travelEntry.travelDestination}
                    onChange={(e) => handleChange('travelDestination', e.target.value)}
                    variant="outlined"
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Travel From"
                    type="text"
                    value={travelEntry.travelFrom}
                    onChange={(e) => handleChange('travelFrom', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Travel To"
                    type="text"
                    value={travelEntry.travelTo}
                    onChange={(e) => handleChange('travelTo', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Travel Type"
                    value={travelEntry.travelType}
                    onChange={(e) => handleChange('travelType', e.target.value)}
                    variant="outlined"
                    fullWidth
                    margin="normal"
                />
                {loading && <CircularProgress />}
                {/* {error && <Alert severity="error">{error}</Alert>} */}
                {success && <Alert severity="success">{success}</Alert>}
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

export default ApplyTravel;
