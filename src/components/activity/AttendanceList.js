import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Alert,
  // MenuItem,
  // Select,
  FormControl,
  // InputLabel,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  useMediaQuery,
  Autocomplete,
  TextField,
  Box,
} from "@mui/material";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

const locales = {
  "en-US": require("date-fns/locale/en-US"),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date()),
  getDay,
  locales,
});
//01144712929
// const CustomEvent = ({ event }) => (
//   <div style={{ padding: "5px" }}>
//     <strong>First In:</strong> {event.firstIn} <br />
//     <strong>Last Out:</strong> {event.lastOut} <br />
//     <strong>Hours:</strong> {event.workingHours}
//   </div>
// );

const generateMapUrl = (geoLocation) => {
  if (!geoLocation) {
    return "#"; // Return a dummy link or handle it as needed
  }

  const [latitude, longitude] = geoLocation.split(",");

  // Check if latitude and longitude are present after splitting
  if (!latitude || !longitude) {
    return "#"; // Handle missing latitude or longitude
  }

  // Ensure latitude and longitude are valid numbers
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);

  if (isNaN(lat) || isNaN(lon)) {
    return "#"; // Handle invalid latitude or longitude
  }

  return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}&zoom=15&basemap=satellite&markercolor=red`;
};

const AttendanceList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState(
    user.role === "HR" ? "" : user.emp_id,
  );
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const isMobile = useMediaQuery("(max-width:600px)");

  // const getShiftStartTime = (shift) => {
  //   const [startTime] = shift.split(" - ");
  //   return startTime;
  // };

  const regularise = () => {
    navigate("/regularise");
  };
  const parseTime = (timeString) => {
    const [time, modifier] = timeString.split(" ");
    let [hours, minutes] = time.split(":");

    // Ensure hours is a string before calling padStart
    hours = String(hours);

    if (hours === "12") {
      hours = "00";
    }
    if (modifier === "PM" && hours !== "12") {
      hours = String(parseInt(hours, 10) + 12);
    } else if (modifier === "AM" && hours === "12") {
      hours = "00";
    }

    return `${hours.padStart(2, "0")}:${minutes}`;
  };

  const compareTimes = (attendanceTime, shiftTime) => {
    if (attendanceTime === "N/A") {
      return "red"; // If no attendance recorded
    }

    const shiftStartTime = parseTime(shiftTime.split(" - ")[0]); // Convert shift start time
    const attendanceTime24 = parseTime(attendanceTime); // Convert attendance time

    const shiftStart = new Date(`1970-01-01T${shiftStartTime}:00`);
    const attendance = new Date(`1970-01-01T${attendanceTime24}:00`);

    const diffInMinutes = (attendance - shiftStart) / (1000 * 60); // Calculate minutes difference

    // If on time, early, or late by up to 10 minutes → green
    if (diffInMinutes <= 10) {
      return "green";
    } else {
      return "red"; // Late by more than 10 minutes
    }
  };

  useEffect(() => {
    if (user.role === "Teacher") {
      const fetchEmployees = async () => {
        try {
          const response = await axios.get(
            `https://namami-infotech.com/NIKHILOFFSET/src/employee/list_employee.php?Tenent_Id=${user.tenent_id}`,
          );
          setEmployees(response.data.data);
        } catch (error) {
          setError("Error fetching employee list: " + error.message);
        }
      };
      fetchEmployees();
    }
  }, [user.role]);
  const fetchAttendance = async () => {
    setError(null);

    try {
      const response = await axios.get(
        `https://namami-infotech.com/NIKHILOFFSET/src/attendance/view_attendance.php`,
        { params: { EmpId: selectedEmpId } },
      );

      if (response.data.success) {
        const attendanceData = response.data.data
          .map((activity) => {
            if (!activity.date) return null; // Skip if date is missing

            // Ensure valid date parsing
            const formattedDate = parse(
              activity.date,
              "dd/MM/yyyy",
              new Date(),
            );
            if (isNaN(formattedDate)) {
              console.error("Invalid date:", activity.date);
              return null; // Skip invalid dates
            }

            return {
              title: (
  <>
    In: {activity.firstIn} <br /> Out: {activity.lastOut}
  </>
),

              start: formattedDate,
              end: formattedDate,
              firstIn: activity.firstIn,
              lastOut: activity.lastOut,
              firstInLocation: activity.firstInLocation,
              lastOutLocation: activity.lastOutLocation,
              workingHours: activity.workingHours,
              allDay: true,
              color: compareTimes(activity.firstIn, user.shift),
              firstEvent: activity.firstEvent,
              lastEvent: activity.lastEvent,
            };
          })
          .filter(Boolean); // Remove null values

        // attendanceData.forEach((record) => {
        //   const attendanceColor = compareTimes(record.firstIn, user.shift);
        //   // console.log(`Date: ${record.date}, First In: ${record.firstIn}, Color: ${attendanceColor}`);
        // });
        setActivities(attendanceData);
        console.log(attendanceData);
      } else {
        setActivities([]);
        setError("No attendance data found for the selected employee");
      }
    } catch (error) {
      setError("Error fetching attendance: " + error.message);
    }
  };

  useEffect(() => {
    if (selectedEmpId) {
      fetchAttendance();
    }
  }, [selectedEmpId]);

  const exportToCsv = () => {
    const csvRows = [
      ["Emp ID", "Date", "In", "Out", "Working Hours", "Last Event"],
    ];

    activities.forEach(
      ({
        empId,
        date,
        firstIn,
        lastOut,
        lastOutLocation,
        workingHours,
        lastEvent,
      }) => {
        csvRows.push([
          empId,
          date,
          firstIn,
          lastOut,
          lastOutLocation,
          workingHours,
          lastEvent,
        ]);
      },
    );

    const csvContent = csvRows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", "attendance.csv");
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {user.role === "Teacher" && (
          <FormControl variant="outlined" sx={{ mb: 0, width: "150px" }}>
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
                  label="Employee"
                  variant="outlined"
                  sx={{
                    width: "200px",
                    mb: 0,
                    "& .MuiInputBase-root": {
                      height: "30px", // Reduce height
                      fontSize: "12px", // Reduce font size
                    },
                    "& .MuiInputLabel-root": {
                      fontSize: "12px", // Smaller label
                    },
                    "& .MuiAutocomplete-input": {
                      fontSize: "12px", // Smaller input text
                    },
                  }}
                />
              )}
              sx={{
                width: "200px",
                mb: 0,
                "& .MuiAutocomplete-inputRoot": {
                  padding: "0px 8px !important", // Reduce padding
                  minHeight: "40px", // Smaller height
                },
                borderRadius: "20px",
              }}
            />
          </FormControl>
        )}
        {user.role === "HR" && (
          <Button
            variant="contained"
            style={{ backgroundColor: "#344C7D", color: "white" }}
            onClick={regularise}
            sx={{ m: 1 }}
          >
            Regularise
          </Button>
        )}
        <Button
          variant="contained"
          style={{ backgroundColor: "#344C7D", color: "white" }}
          onClick={exportToCsv}
          sx={{ m: 1 }}
        >
          Export to CSV
        </Button>
      </div>

      {error && <Alert severity="error">{error}</Alert>}

      <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={2}>
        <Box flex={1}>
          <Calendar
            localizer={localizer}
            events={activities}
            startAccessor="start"
            endAccessor="end"
            style={{
              height: 500,
              backgroundColor: "#fff",
              padding: 10,
              borderRadius: 8,
            }}
            eventPropGetter={(event) => ({
              style: {
                backgroundColor: event.color || "blue",
                color: "#fff",
                fontSize: "10px", // Reduce font size
                borderRadius: "5px",
                padding: "2px",
                whiteSpace: "nowrap", // Prevent text wrapping
                overflow: "hidden",
                textOverflow: "ellipsis", // Add "..." if text is too long
                height: "40px", // Fix height to prevent stretching
              },
            })}
          />
        </Box>

        <Box flex={1}>
          <Paper sx={{ overflow: "hidden", borderRadius: 2 }}>
            <TableContainer sx={{ maxHeight: 500 }} stickyHeader>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#344C7D" }}>
                    <TableCell sx={{ color: "white" }}>Date</TableCell>
                    {!isMobile && (
                      <TableCell sx={{ color: "white" }}>In</TableCell>
                    )}
                    {!isMobile && (
                      <TableCell sx={{ color: "white" }}>Out</TableCell>
                    )}
                    <TableCell sx={{ color: "white" }}>Working Hours</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activities
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((activity, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {activity.start
                            ? format(activity.start, "dd/MM/yyyy")
                            : "N/A"}
                        </TableCell>
                        {!isMobile && (
                          <TableCell>
                            <a
                              href={generateMapUrl(activity.firstInLocation)}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: "#344C7D",
                                textDecoration: "none",
                              }}
                            >
                              {activity.firstIn}({activity.firstEvent})
                            </a>
                          </TableCell>
                        )}
                        {!isMobile && (
                          <TableCell>
                            {activity.lastOutLocation != "N/A" ? (
                              <a
                                href={generateMapUrl(activity.lastOutLocation)}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  color: "#344C7D",
                                  textDecoration: "none",
                                }}
                              >
                                {`${activity.lastOut} (${activity.lastEvent})`}
                              </a>
                            ) : (
                              activity.lastOut
                            )}
                          </TableCell>
                        )}
                        <TableCell>{activity.workingHours}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              component="div"
              count={activities.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(event, newPage) => setPage(newPage)}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setPage(0);
              }}
            />
          </Paper>
        </Box>
      </Box>
    </>
  );
};

export default AttendanceList;
