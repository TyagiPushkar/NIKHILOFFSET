// src/components/dealers/AddDealers.js

import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, Snackbar } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';
import { useGeolocated } from 'react-geolocated';

function AddDealers({ open, onClose, onDealerAdded }) {
    const [dealerName, setDealerName] = useState('');
    const [address, setAddress] = useState('');
    const [contactInfo, setContactInfo] = useState('');
    const [latLong, setLatLong] = useState('');
    const { user } = useAuth();  // Get empId from authenticated user
    const { coords } = useGeolocated();

    useEffect(() => {
        if (coords) {
            setLatLong(`${coords.latitude},${coords.longitude}`);
        }
    }, [coords]);

    const handleSubmit = async () => {
        try {
            const response = await axios.post('https://namami-infotech.com/NIKHILOFFSET/src/dealer/add_dealers.php', {
                dealerName,
                address,
                contactInfo,
                latLong,
                addedByEmpId: user.emp_id
            });

            if (response.data.success) {
                onDealerAdded();
                onClose();
            } else {
                console.error('Failed to add dealer');
            }
        } catch (err) {
            console.error('Error adding dealer:', err);
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle style={{ backgroundColor: "#344C7D", color: "white" }}>Add Dealer</DialogTitle>
            <DialogContent>
                <TextField
                    label="Dealer Name"
                    value={dealerName}
                    onChange={(e) => setDealerName(e.target.value)}
                    fullWidth
                    margin="dense"
                />
                <TextField
                    label="Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    fullWidth
                    margin="dense"
                />
                <TextField
                    label="Contact Info"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    fullWidth
                    margin="dense"
                />
                <TextField
                    label="Lat/Long"
                    value={latLong}
                    onChange={(e) => setLatLong(e.target.value)}
                    fullWidth
                    margin="dense"
                    disabled
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

export default AddDealers;
