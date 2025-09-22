import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button, TextField } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateTime } from 'luxon';
import AddHoliday from './AddHoliday';
import EditHoliday from './EditHoliday';
import { useAuth } from '../auth/AuthContext';

const localizer = momentLocalizer(moment);

function ViewHoliday() {
    const [holidays, setHolidays] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(DateTime.now());
    const { user } = useAuth()

    const fetchHolidays = async () => {
        try {
            const response = await axios.get(`https://namami-infotech.com/NIKHILOFFSET/src/holiday/view_holiday.php?Tenent_Id=${user.tenent_id}`);
            if (response.data.success) {
                const holidayEvents = response.data.data.map(holiday => ({
                    title: holiday.title,
                    start: new Date(holiday.date),  // convert ISO date to JS Date
                    end: new Date(holiday.date),
                    allDay: true,
                }));
                setHolidays(holidayEvents);
            } else {
                console.error('Failed to fetch holidays');
            }
        } catch (err) {
            console.error('Error fetching holidays:', err);
        }
    };

    useEffect(() => {
        fetchHolidays();
    });

    // Handle month and year changes
    const handleMonthYearChange = (date) => {
        if (date) {
            setSelectedDate(date);
        }
    };

    return (
        <div className="calendar-container">
            <div style={{ display: "flex", gap: "100px" }}>

                {user && user.role === "HR" ?
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setDialogOpen(true)}
                        sx={{ mb: 2 }}
                        style={{ backgroundColor: "#344C7D" }}
                    >
                        Add Holiday
                    </Button> : null}

                {/* Month and Year Picker */}
                <LocalizationProvider dateAdapter={AdapterLuxon}>
                    <DatePicker
                        views={['year', 'month']}
                        value={selectedDate}
                        onChange={handleMonthYearChange}
                        renderInput={(params) => <TextField {...params} label="Select Month and Year" />}
                    />
                </LocalizationProvider>
            </div>
            <br />

            <div className="calendar-wrapper">
                <Calendar
                    localizer={localizer}
                    events={holidays}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 600, width: '100%', margin: '0 auto' }}
                    views={['month', 'agenda', 'day']}
                    date={selectedDate.toJSDate()}
                    onNavigate={(date) => setSelectedDate(DateTime.fromJSDate(date))}  // Handle navigation in the calendar
                    selectable={false}  // Disable day clicking
                />
            </div>

            {/* Add/Edit Holiday modals */}
            <AddHoliday open={dialogOpen} onClose={() => setDialogOpen(false)} onHolidayAdded={fetchHolidays} />
            <EditHoliday open={editDialogOpen} onClose={() => setEditDialogOpen(false)}  onHolidayUpdated={fetchHolidays} />

            <style jsx>{`
                .calendar-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    box-sizing: border-box;
                }
                .calendar-wrapper {
                    width: 100%;
                    margin: 0 auto;
                    border-radius: 10px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    background: white;
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
}

export default ViewHoliday;
