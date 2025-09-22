import React, { useEffect, useState } from 'react';
import {
    // CircularProgress,
    Typography,
    // Table,
    // TableBody,
    // TableCell,
    // TableContainer,
    // TableHead,
    // TableRow,
    // Paper,
    Box,
    TextField,
    Button,
} from '@mui/material';
import axios from 'axios';
import { saveAs } from 'file-saver';
import GetAppIcon from '@mui/icons-material/GetApp';
import AttendanceReport from './AttendanceReport';
import SalaryList from '../employee/SalaryList';
// import SalarySlip from '../employee/SalarySlip';
const VisitList = () => {
    const [employees, setEmployees] = useState([]);
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await axios.get('https://namami-infotech.com/NIKHILOFFSET/src/employee/list_employee.php');
                if (response.data.success) {
                    setEmployees(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching employees:', error);
            }
        };

        fetchEmployees();
    }, []);

    useEffect(() => {
        const fetchVisits = async () => {
            if (!fromDate || !toDate) return;

            setLoading(true);
            setError('');
            try {
                const response = await axios.get(
                    `https://namami-infotech.com/NIKHILOFFSET/src/visit/get_visits_entry.php?role=HR`
                );
                if (response.data.success) {
                    const filteredVisits = response.data.data.filter((visit) => {
                        const visitDate = new Date(visit.VisitDateTime);
                        return visitDate >= new Date(fromDate) && visitDate <= new Date(toDate);
                    });
                    setVisits(filteredVisits);
                } else {
                    setVisits([]);
                    setError('No visits found.');
                }
            } catch (error) {
                setError('Error fetching visit history.');
                setVisits([]);
            } finally {
                setLoading(false);
            }
        };

        fetchVisits();
    }, [fromDate, toDate]);

    const handleDateChange = (event, type) => {
        type === "from" ? setFromDate(event.target.value) : setToDate(event.target.value);
    };

    const exportSummaryToCSV = () => {
        const summaryData = employees.map((employee) => {
            const dealerVisits = visits.filter((visit) => visit.EmpId === employee.EmpId && visit.SourceEvent !== 'In' && visit.SourceEvent !== 'Out');
            const totalDistance = dealerVisits.reduce((total, visit) => total + parseFloat(visit.Distance || 0), 0).toFixed(2);

            return {
                Employee: employee.Name,
                DateRange: `${new Date(fromDate).toLocaleDateString()} - ${new Date(toDate).toLocaleDateString()}`,
                TotalVisits: dealerVisits.length,
                TotalDistance: `${totalDistance} km`,
            };
        });

        const csvContent = [
            ["Employee", "Date Range", "Total Visits", "Total Distance (km)"],
            ...summaryData.map((row) => Object.values(row)),
        ]
            .map((e) => e.join(","))
            .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        saveAs(blob, "summary_report.csv");
    };

    const exportDetailToCSV = () => {
    const csvData = visits
        .filter((visit) => visit.SourceEvent !== 'In' && visit.SourceEvent !== 'Out')  // Only export dealer visits
        .map((visit) => ({
            Employee: employees.find((emp) => emp.EmpId === visit.EmpId)?.Name || "N/A",
            Event: visit.SourceEvent,
            DateTime: `"${new Date(visit.SourceTime).toLocaleString()}"`,  // Enclose DateTime in quotes
            Distance: `${visit.Distance} km`,
        }));

    const csvContent = [
        ["Employee", "Event", "DateTime", "Distance (km)"],
        ...csvData.map((row) => Object.values(row)),
    ]
        .map((e) => e.join(","))
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "detailed_report.csv");
};


    // const filterDealerVisits = (visits) =>
    //     visits.filter((visit) => visit.SourceEvent !== 'In' && visit.SourceEvent !== 'Out');

    return (
        <>
        <Box sx={{ padding: 2 }}>
            <Typography variant="h5" component="h2" sx={{ marginBottom: 2 }}>
                Visit Report
            </Typography>

            {/* Date Range Controls */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                    label="From Date"
                    type="date"
                    variant="outlined"
                    size="small"
                    value={fromDate}
                    onChange={(e) => handleDateChange(e, "from")}
                    sx={{ width: "200px" }}
                    InputLabelProps={{ shrink: true }}
                />

                <TextField
                    label="To Date"
                    type="date"
                    variant="outlined"
                    size="small"
                    value={toDate}
                    onChange={(e) => handleDateChange(e, "to")}
                    sx={{ width: "200px" }}
                    InputLabelProps={{ shrink: true }}
                />

                <Button variant="contained" onClick={exportSummaryToCSV} size="small" sx={{ backgroundColor: '#344C7D' }}>
                     Summary  <GetAppIcon/>
                </Button>
                <Button variant="contained" onClick={exportDetailToCSV} size="small" sx={{ backgroundColor: '#344C7D' }}>
                     Detailed  <GetAppIcon/>
                </Button>
            </Box>

           
            </Box>
            <AttendanceReport />
            <SalaryList />
            {/* <SalarySlip/> */}
        </>
        
    );
};

export default VisitList;
