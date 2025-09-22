import React, { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    Button,
    FormControl,
    // InputLabel,
    // Select,
    // MenuItem,
    Box,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Typography,
    Autocomplete
} from '@mui/material';
import { Visibility, RotateLeft, RotateRight } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';
// import VisitMap from './VisitMap';
import { useNavigate } from 'react-router-dom';

function VisitTable() {
    const [visits, setVisits] = useState([]);
    const { user } = useAuth();
    const navigate = useNavigate()
    // const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 });
    const [selectedDate, setSelectedDate] = useState(new Date());
    // const [markers, setMarkers] = useState([]);
    // const [directions, setDirections] = useState(null);
    // const [distances, setDistances] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [selectedEmpId, setSelectedEmpId] = useState(user.role === 'HR' ? '' : user.emp_id);
    // const [showMap, setShowMap] = useState(false);
    const [loading, setLoading] = useState(false);
    const [address, setAddress] = useState('');
        const [noData, setNoData] = useState(false);

    // Popup states for image
    const [openDialog, setOpenDialog] = useState(false);
    const [imageData, setImageData] = useState('');
    const [rotation, setRotation] = useState(0);

    useEffect(() => {
        if (user.role === 'HR') {
            const fetchEmployees = async () => {
                try {
                    const response = await axios.get(`https://namami-infotech.com/NIKHILOFFSET/src/employee/list_employee.php?Tenent_Id=${user.tenent_id}`);
                    
                    if (response.data.success) {
                        setEmployees(response.data.data);
                    } else {
                        console.log('Failed to fetch employee list');
                    }
                } catch (error) {
                    console.log('Error fetching employee list:', error.message);
                }
            };
            fetchEmployees();
        }
    }, [user.role]);
// useEffect(() => {
//     // Calculate the center of all markers if there are any
//     if (markers.length > 0) {
//         const avgLat = markers.reduce((sum, marker) => sum + marker.lat, 0) / markers.length;
//         const avgLng = markers.reduce((sum, marker) => sum + marker.lng, 0) / markers.length;
//         // setMapCenter({ lat: avgLat, lng: avgLng });
//     }
// }, [markers]);

     const fetchVisits = async () => {
        setLoading(true);
        setNoData(false);
        try {
            const formattedDate = selectedDate.toISOString().substr(0, 10);
            const url = `https://namami-infotech.com/NIKHILOFFSET/src/visit/view_visit.php?empId=${selectedEmpId}&date=${formattedDate}`;
            
            const response = await axios.get(url);
            if (response.data.success && response.data.data.length > 0) {
                const visitData = response.data.data;
                console.log("Visit Data:", visitData);
                
            

                setVisits(visitData);
                // setMarkers(markerData);
            } else {
                setVisits([]);
                setNoData(true);
            }
        } catch (err) {
            console.error('Error fetching visits:', err);
            setNoData(true);
        }
        setLoading(false);
    };

    const handleDateChange = (event) => {
        setSelectedDate(new Date(event.target.value));
    };
    const planVisit = (event) => {
        navigate("/plan-visit");
    };

   
const handleViewImage = async (visitId) => {
        try {
            const response = await axios.get(`https://namami-infotech.com/NIKHILOFFSET/src/visit/view_one_visit.php?visit_id=${visitId}`);
            const base64Data = response.data.data[0].Attachment;
            setImageData(`data:image/jpeg;base64,${base64Data}`);
            setRotation(0);
            setOpenDialog(true);

            // Fetch and set address
            const address = await fetchAddressFromLatLong(response.data.data[0].VisitLatLong);
            setAddress(address);
        } catch (error) {
            console.error('Error fetching image:', error);
        }
    };
    const handleRotateLeft = () => {
        setRotation((prevRotation) => prevRotation - 90);
    };

    const handleRotateRight = () => {
        setRotation((prevRotation) => prevRotation + 90);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

     const fetchAddressFromLatLong = async (latLong) => {
        const [lat, lng] = latLong.split(',').map(Number);
        const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;

        try {
            const response = await axios.get(nominatimUrl);
            if (response.data && response.data.display_name) {
                return response.data.display_name;
            } else {
                return "Address not found";
            }
        } catch (error) {
            console.error("Error fetching address from Nominatim:", error);
            return "Address not found";
        }
    };

    return (
        <>
            <div style={{display:'flex', justifyContent:"space-between"}}>
            <div style={{display:'flex', gap:'10px'}}>
            {user.role === 'HR' && (
                <FormControl variant="outlined" sx={{ mb: 2, width: "200px" }}>
                    
                            <Autocomplete
                                          options={employees}
                                          getOptionLabel={(option) => `${option.Name} (${option.EmpId})`}
                                          value={
                                            employees.find((emp) => emp.EmpId === selectedEmpId) || null
                                          }
                                         onChange={(event, newValue) => {
                                           setSelectedEmpId(newValue ? newValue.EmpId : ""); // Update selected employee
                                         }}
                                          renderInput={(params) => (
                                            <TextField
                                              {...params}
                                              label="Select Employee"
                                              variant="outlined"
                                              sx={{ width: "200px", mb: 0 }}
                                            />
                                          )}
                                          sx={{ width: "200px", mb: 0 }}
                                        />
                </FormControl>
            )}
            
            <TextField
                type="date"
                value={selectedDate.toISOString().substr(0, 10)}
                onChange={handleDateChange}
                variant="outlined"
            />
            <Button
                variant="contained"
                style={{ marginBottom: 20, backgroundColor: "#344C7D", color: "white" }}
                onClick={fetchVisits}
            >
                Go
            </Button>

                </div>
                <div>
                    <Button
                variant="contained"
                style={{ marginBottom: 20, backgroundColor: "#344C7D", color: "white" }}
                onClick={planVisit}
            >
                Plan Visits
            </Button>
                </div>
                </div>
          
            {/* <Button
                variant="contained"
                style={{ backgroundColor: "#344C7D", color: "white", marginTop: 10 }}
                onClick={() => setShowMap(!showMap)}
            >
                {showMap ? 'Hide Map' : 'Show Map'}
            </Button>
            <br /> <br />

            {showMap && (
                <VisitMap
                    markers={markers}
                    mapCenter={mapCenter}
                    directions={directions}
                    distances={distances}
                />
            )} */}

           {loading ? (
    <Box display="flex" justifyContent="center" alignItems="center" height="100px">
        <CircularProgress />
    </Box>
) : noData ? (
    <Box display="flex" justifyContent="center" alignItems="center" height="100px">
        <Typography>No visits found for the selected date.</Typography>
    </Box>
) : (
    <TableContainer component={Paper}>
        <Table>
            <TableHead style={{ backgroundColor: "#344C7D" }}>
                <TableRow>
                    <TableCell style={{ color: "white" }}>Company Name</TableCell>
                    <TableCell style={{ color: "white" }}>Dealer Name</TableCell>
                    <TableCell style={{ color: "white" }}>Visit Time</TableCell>
                                        <TableCell style={{ color: "white" }}>Dealer Mobile</TableCell>
                                        <TableCell style={{ color: "white" }}>Visit By</TableCell>
                    <TableCell
                     style={{ color: "white" }}>Attachment</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {visits
                    .filter(visit => {
                        const visitDate = new Date(visit.VisitTime).toLocaleDateString();
                        return visitDate === selectedDate.toLocaleDateString();
                    })
                    .sort((a, b) => new Date(b.VisitTime) - new Date(a.VisitTime))
                    .map((visit, index) => (
                        <TableRow key={`${visit.DealerID}-${index}`}>
                            <TableCell>
                                <a
                                    href={`https://www.google.com/maps?q=${visit.VisitLatLong}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: 'blue', textDecoration: 'underline' }}
                                >
                                    {visit.CompanyName}
                                </a>
                            </TableCell>
                            <TableCell>{visit.DealerName}</TableCell>
                            <TableCell>{new Date(visit.VisitTime).toLocaleString()}</TableCell>
                            <TableCell>{visit.MobileNo}</TableCell>
                             <TableCell>{visit.EmpId}</TableCell>
                            <TableCell>
                                <IconButton onClick={() => handleViewImage(visit.VisitID)}>
                                    <Visibility />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
            </TableBody>
        </Table>
    </TableContainer>
)}

            {/* Image View Popup */}
          <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>View Attachment</DialogTitle>
                <DialogContent>
                     {address && (
                        <>
                         <Typography variant="body2" color="textSecondary" style={{ marginTop: '10px', fontWeight:'700' }}>
                            Address: {address}
                            </Typography>
                             <Typography variant="body2" color="textSecondary" style={{ marginTop: '10px' }}>
                            Time: {address}
                        </Typography>
                        </>
                       
                    )}
                    {imageData ? (
                        <img
                            src={imageData}
                            alt="Visit Attachment"
                            style={{
                                width: '100%',
                                height: 'auto',
                                transform: `rotate(${rotation}deg)`,
                            }}
                        />
                    ) : (
                        <Typography>No attachment available.</Typography>
                    )}
                   
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleRotateLeft} startIcon={<RotateLeft />}>
                        Rotate Left
                    </Button>
                    <Button onClick={handleRotateRight} startIcon={<RotateRight />}>
                        Rotate Right
                    </Button>
                    <Button onClick={handleCloseDialog} color="secondary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default VisitTable;
