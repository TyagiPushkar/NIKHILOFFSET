import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Snackbar
} from '@mui/material';
import axios from 'axios';

const AddFeeStructureDialog = ({ open, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        course: '',
        installment: '',
        tution_fees: '',
        exam_fees: '',
        hostel_fees: '',
        admission_fees: '',
        prospectus_fees: '',
        due_date: '',
    });

    const [snackbar, setSnackbar] = useState({ open: false, message: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        const {
            course, installment, tution_fees,
            exam_fees, hostel_fees, admission_fees,
            prospectus_fees, due_date
        } = formData;

        if (!course || !installment || !tution_fees || !exam_fees || !hostel_fees || !admission_fees || !prospectus_fees) {
            setSnackbar({ open: true, message: 'Please fill all required fields.' });
            return;
        }

        try {
            const res = await axios.post('https://namami-infotech.com/NIKHILOFFSET/src/fees/add_fee_structure.php', {
                ...formData,
                installment: parseInt(installment),
                tution_fees: parseInt(tution_fees),
                exam_fees: parseInt(exam_fees),
                hostel_fees: parseInt(hostel_fees),
                admission_fees: parseInt(admission_fees),
                prospectus_fees: parseInt(prospectus_fees),
            });

            if (res.data.success) {
                setSnackbar({ open: true, message: 'Fee structure added successfully!' });
                onSuccess();
                onClose();
            } else {
                setSnackbar({ open: true, message: res.data.message || 'Failed to add structure.' });
            }
        } catch (err) {
            setSnackbar({ open: true, message: 'Error adding fee structure.' });
        }
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} fullWidth>
                <DialogTitle>Add Fee Structure</DialogTitle>
                <DialogContent>
                    <TextField label="Course" name="course" value={formData.course} onChange={handleChange} fullWidth margin="normal" />
                    <TextField label="Installment" name="installment" type="number" value={formData.installment} onChange={handleChange} fullWidth margin="normal" />
                    <TextField label="Tuition Fees" name="tution_fees" type="number" value={formData.tution_fees} onChange={handleChange} fullWidth margin="normal" />
                    <TextField label="Exam Fees" name="exam_fees" type="number" value={formData.exam_fees} onChange={handleChange} fullWidth margin="normal" />
                    <TextField label="Hostel Fees" name="hostel_fees" type="number" value={formData.hostel_fees} onChange={handleChange} fullWidth margin="normal" />
                    <TextField label="Admission Fees" name="admission_fees" type="number" value={formData.admission_fees} onChange={handleChange} fullWidth margin="normal" />
                    <TextField label="Prospectus Fees" name="prospectus_fees" type="number" value={formData.prospectus_fees} onChange={handleChange} fullWidth margin="normal" />
                    <TextField
                        label="Due Date"
                        name="due_date"
                        type="text"
                        value={formData.due_date}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" style={{backgroundColor:"#344C7D"}}>Add</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ open: false, message: '' })}
                message={snackbar.message}
            />
        </>
    );
};

export default AddFeeStructureDialog;
