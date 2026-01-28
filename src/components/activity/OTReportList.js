"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  TablePagination,
  TextField,
  Box,
  Button,
  Alert,
  Grid,
  Chip,
  Autocomplete,
} from "@mui/material";
import { Search, Filter, Download } from "lucide-react";

const ATTENDANCE_API_URL =
  "https://namami-infotech.com/NIKHILOFFSET/src/attendance/get_employee_attendance.php";
const EMPLOYEE_API_URL =
  "https://namami-infotech.com/NIKHILOFFSET/src/employee/list_employee.php";
const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100];
const DEFAULT_ROWS_PER_PAGE = 25;

// Helper function to add two time strings (HH:MM:SS)
const addTimes = (time1, time2) => {
  const parseTime = (timeStr) => {
    if (!timeStr || timeStr === "00:00:00")
      return { hours: 0, minutes: 0, seconds: 0 };
    const [hours, minutes, seconds] = timeStr.split(":").map(Number);
    return { hours, minutes, seconds };
  };

  const t1 = parseTime(time1);
  const t2 = parseTime(time2);

  let seconds = t1.seconds + t2.seconds;
  let minutes = t1.minutes + t2.minutes;
  let hours = t1.hours + t2.hours;

  if (seconds >= 60) {
    minutes += Math.floor(seconds / 60);
    seconds %= 60;
  }

  if (minutes >= 60) {
    hours += Math.floor(minutes / 60);
    minutes %= 60;
  }

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

// Helper function to format time for display
const formatTimeDisplay = (timeStr) => {
  if (!timeStr || timeStr === "00:00:00") return "00:00";
  const [hours, minutes] = timeStr.split(":");
  return `${hours}:${minutes}`;
};

// NEW: Helper function to check if a date is Sunday
const isSunday = (dateString) => {
  if (!dateString) return false;

  // Parse the date string (assuming format is YYYY-MM-DD or similar)
  const date = new Date(dateString);

  // Check if the date is valid
  if (isNaN(date.getTime())) return false;

  // getDay() returns 0 for Sunday, 1 for Monday, etc.
  return date.getDay() === 0;
};

// NEW: Calculate working hours and OT for Sunday
const calculateSundayHours = (workingHours, currentOT, inDate) => {
  if (isSunday(inDate)) {
    // If it's Sunday, all working hours become OT
    // Working hours should be 00:00:00
    // OT should be the original working hours + any existing OT
    const totalOT = addTimes(
      workingHours || "00:00:00",
      currentOT || "00:00:00",
    );

    return {
      working_hours: "00:00:00", // Working hours is 0 on Sunday
      ot: totalOT, // All hours go to OT
      total_hours: totalOT, // Total hours = OT hours (since working is 0)
    };
  }

  // For non-Sunday days, keep original values
  const totalHours = addTimes(
    workingHours || "00:00:00",
    currentOT || "00:00:00",
  );
  return {
    working_hours: workingHours || "00:00:00",
    ot: currentOT || "00:00:00",
    total_hours: totalHours,
  };
};

const OTReportList = () => {
  // State management
  const [state, setState] = useState({
    attendanceRecords: [],
    employees: [],
    loading: true,
    error: "",
    searchTerm: "",
    page: 0,
    rowsPerPage: DEFAULT_ROWS_PER_PAGE,
    selectedEmployee: "all",
    fromDate: "",
    toDate: "",
    activeFilters: [],
    totalRecords: 0,
  });

  // Format date to YYYY-MM-DD
  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  // Initialize date filters (default: last 7 days)
  useEffect(() => {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    setState((prev) => ({
      ...prev,
      fromDate: formatDate(sevenDaysAgo),
      toDate: formatDate(today),
    }));
  }, []);

  // Build API URL with filters
  const buildApiUrl = useCallback(() => {
    const params = new URLSearchParams();

    // Add employee filter
    if (state.selectedEmployee && state.selectedEmployee !== "all") {
      params.append("EmpId", state.selectedEmployee);
    }

    // Add date range filter
    if (state.fromDate && state.toDate) {
      params.append("from_date", state.fromDate);
      params.append("to_date", state.toDate);
    } else if (state.fromDate) {
      // If only from date is provided, use it as single date
      params.append("date", state.fromDate);
    }

    return `${ATTENDANCE_API_URL}${
      params.toString() ? `?${params.toString()}` : ""
    }`;
  }, [state.selectedEmployee, state.fromDate, state.toDate]);

  // Update active filters display
  const updateActiveFilters = useCallback(() => {
    const filters = [];

    if (state.selectedEmployee && state.selectedEmployee !== "all") {
      const emp = state.employees.find(
        (e) => e.EmpId === state.selectedEmployee,
      );
      filters.push(`Employee: ${emp?.Name || state.selectedEmployee}`);
    }

    if (state.fromDate && state.toDate) {
      filters.push(`Date Range: ${state.fromDate} to ${state.toDate}`);
    } else if (state.fromDate) {
      filters.push(`Date: ${state.fromDate}`);
    }

    setState((prev) => ({ ...prev, activeFilters: filters }));
  }, [state.selectedEmployee, state.fromDate, state.toDate, state.employees]);

  // Fetch attendance data with filters
  const fetchAttendanceData = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: "" }));

      const url = buildApiUrl();
      console.log("Fetching from:", url); // For debugging

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        // Process data to calculate Sunday OT
        const processedData = (data.data || []).map((record) => {
          // Calculate adjusted hours considering Sunday
          const adjustedHours = calculateSundayHours(
            record.working_hours,
            record.ot,
            record.in_date,
          );

          return {
            ...record,
            // Override with adjusted values
            working_hours: adjustedHours.working_hours,
            ot: adjustedHours.ot,
            total_hours: adjustedHours.total_hours,
            // Flag to indicate if it's Sunday
            is_sunday: isSunday(record.in_date),
          };
        });

        setState((prev) => ({
          ...prev,
          attendanceRecords: processedData,
          totalRecords: data.totalRecords || processedData.length || 0,
          loading: false,
          error: "",
        }));
        updateActiveFilters();
      } else {
        setState((prev) => ({
          ...prev,
          error: data.message || "No attendance data found.",
          loading: false,
          attendanceRecords: [],
          totalRecords: 0,
        }));
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setState((prev) => ({
        ...prev,
        error: "Failed to fetch attendance data. Please check your connection.",
        loading: false,
        attendanceRecords: [],
        totalRecords: 0,
      }));
    }
  }, [buildApiUrl, updateActiveFilters]);

  // Fetch employees list
  const fetchEmployees = useCallback(async () => {
    try {
      const response = await fetch(`${EMPLOYEE_API_URL}?Tenent_Id=1`);
      const data = await response.json();

      if (data.success) {
        setState((prev) => ({
          ...prev,
          employees: data.data,
        }));
      }
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    }
  }, []);

  // Calculate OT summary (UPDATED for Sunday logic)
  const otSummary = useMemo(() => {
    const summary = {
      totalRecords: state.attendanceRecords.length,
      totalOTHours: 0,
      totalWorkingHours: 0,
      totalCombinedHours: 0,
      employeesWithOT: new Set(),
      maxOT: "00:00:00",
      totalOTFormatted: "00:00:00",
      totalWorkingFormatted: "00:00:00",
      totalCombinedFormatted: "00:00:00",
      // NEW: Track Sunday-specific data
      sundayRecords: 0,
      sundayOTHours: 0,
      sundayOTFormatted: "00:00:00",
      // NEW: Track regular working days
      regularRecords: 0,
      regularWorkingHours: 0,
      regularWorkingFormatted: "00:00:00",
    };

    let maxOTHours = 0;

    state.attendanceRecords.forEach((record) => {
      // Parse working hours (already adjusted for Sunday)
      if (record.working_hours && record.working_hours !== "00:00:00") {
        const [wHours, wMinutes, wSeconds] = record.working_hours
          .split(":")
          .map(Number);
        summary.totalWorkingHours += wHours * 3600 + wMinutes * 60 + wSeconds;

        // Track regular working hours (non-Sunday)
        if (!record.is_sunday) {
          summary.regularWorkingHours +=
            wHours * 3600 + wMinutes * 60 + wSeconds;
          summary.regularRecords++;
        }
      }

      // Parse OT hours
      if (record.ot && record.ot !== "00:00:00") {
        summary.employeesWithOT.add(record.emp_id);

        const [oHours, oMinutes, oSeconds] = record.ot.split(":").map(Number);
        const totalSeconds = oHours * 3600 + oMinutes * 60 + oSeconds;
        summary.totalOTHours += totalSeconds;

        // Track max OT
        if (totalSeconds > maxOTHours) {
          maxOTHours = totalSeconds;
          summary.maxOT = record.ot;
        }

        // NEW: Track Sunday OT separately
        if (record.is_sunday) {
          summary.sundayRecords++;
          summary.sundayOTHours += totalSeconds;
        }
      }
    });

    // Convert total seconds back to HH:MM:SS
    const formatSecondsToTime = (totalSeconds) => {
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = Math.floor(totalSeconds % 60);
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };

    summary.totalWorkingFormatted = formatSecondsToTime(
      summary.totalWorkingHours,
    );
    summary.totalOTFormatted = formatSecondsToTime(summary.totalOTHours);
    summary.sundayOTFormatted = formatSecondsToTime(summary.sundayOTHours);
    summary.regularWorkingFormatted = formatSecondsToTime(
      summary.regularWorkingHours,
    );

    // Calculate combined total
    summary.totalCombinedHours =
      summary.totalWorkingHours + summary.totalOTHours;
    summary.totalCombinedFormatted = formatSecondsToTime(
      summary.totalCombinedHours,
    );

    summary.employeesWithOTCount = summary.employeesWithOT.size;

    return summary;
  }, [state.attendanceRecords]);

  // Event handlers
  const handleSearch = (e) => {
    const value = e.target.value;
    setState((prev) => ({
      ...prev,
      searchTerm: value,
      page: 0,
    }));
  };

  const handleEmployeeChange = (e) => {
    setState((prev) => ({
      ...prev,
      selectedEmployee: e.target.value,
      page: 0,
    }));
  };

  const handleDateChange = (e, field) => {
    setState((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const applyFilters = () => {
    setState((prev) => ({ ...prev, page: 0 }));
    fetchAttendanceData();
  };

  const resetFilters = () => {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    setState((prev) => ({
      ...prev,
      selectedEmployee: "all",
      fromDate: formatDate(sevenDaysAgo),
      toDate: formatDate(today),
      searchTerm: "",
      page: 0,
      activeFilters: [],
    }));
  };

  const handleChangePage = (_, newPage) => {
    setState((prev) => ({ ...prev, page: newPage }));
  };

  const handleChangeRowsPerPage = (e) => {
    const newRowsPerPage = Number.parseInt(e.target.value, 10);
    setState((prev) => ({
      ...prev,
      rowsPerPage: newRowsPerPage,
      page: 0,
    }));
  };

  const removeFilter = (filterToRemove) => {
    if (filterToRemove.includes("Employee:")) {
      setState((prev) => ({ ...prev, selectedEmployee: "all" }));
    } else if (filterToRemove.includes("Date")) {
      const today = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 7);
      setState((prev) => ({
        ...prev,
        fromDate: formatDate(sevenDaysAgo),
        toDate: formatDate(today),
      }));
    }
  };

  const formatDate1 = (datetime) => {
    if (!datetime) return "-";
    const dateObj = new Date(datetime);
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Get day name from date
  const getDayName = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[date.getDay()];
  };

  const exportToCSV = () => {
    const headers = [
      "Employee ID",
      "Employee Name",
      "Date",
      "Day",
      "In Time",
      "Out Time",
      "Working Hours",
      "OT Hours",
      "Total Hours",
      "Remarks",
    ];
    const csvContent = [
      headers.join(","),
      ...state.attendanceRecords.map((record) => {
        const dayName = getDayName(record.in_date);
        const isSunday = record.is_sunday;

        return [
          record.emp_id,
          `"${record.employee_name}"`,
          record.in_date,
          dayName,
          record.in_time,
          record.out_time,
          record.working_hours,
          record.ot,
          record.total_hours,
          isSunday ? "Sunday - All hours counted as OT" : "Regular Day",
        ].join(",");
      }),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ot_report_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  // Client-side search filtering
  const searchedRecords = useMemo(() => {
    if (!state.searchTerm) return state.attendanceRecords;

    const term = state.searchTerm.toLowerCase();
    return state.attendanceRecords.filter(
      (record) =>
        record.employee_name?.toLowerCase().includes(term) ||
        record.emp_id?.toLowerCase().includes(term) ||
        record.in_date?.toLowerCase().includes(term) ||
        getDayName(record.in_date).toLowerCase().includes(term),
    );
  }, [state.attendanceRecords, state.searchTerm]);

  // Effects
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    fetchAttendanceData();
  }, [fetchAttendanceData]);

  // Render loading state
  if (state.loading && state.attendanceRecords.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="80vh"
        flexDirection="column"
      >
        <CircularProgress sx={{ color: "#344C7D" }} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading OT Report data...
        </Typography>
      </Box>
    );
  }

  // Main render
  return (
    <Box p={0}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        flexWrap="wrap"
        gap={2}
      >
        <Typography variant="h5" fontWeight="bold" color="#333">
          OT Report List
          <Typography
            variant="caption"
            display="block"
            color="error"
            fontWeight="bold"
          >
            Note: Sunday working hours are counted as OT
          </Typography>
        </Typography>
        <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
          <Button
            variant="outlined"
            onClick={exportToCSV}
            disabled={state.attendanceRecords.length === 0}
            sx={{
              borderColor: "#344C7D",
              color: "#344C7D",
              "&:hover": {
                backgroundColor: "#344C7D",
                color: "white",
                borderColor: "#344C7D",
              },
            }}
          >
            <Download size={18} />
          </Button>
        </Box>
      </Box>

      {/* Active Filters */}
      {state.activeFilters.length > 0 && (
        <Box
          sx={{
            mb: 2,
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <Typography variant="body2" color="textSecondary">
            Active Filters:
          </Typography>
          {state.activeFilters.map((filter, index) => (
            <Chip
              key={index}
              label={filter}
              onDelete={() => removeFilter(filter)}
              size="small"
              color="primary"
              variant="outlined"
            />
          ))}
          <Button size="small" onClick={resetFilters} color="error">
            Clear All
          </Button>
        </Box>
      )}

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              borderRadius: 2,
              borderLeft: "4px solid #344C7D",
            }}
          >
            <Typography variant="subtitle2" color="textSecondary">
              Total Records
            </Typography>
            <Typography variant="h5" fontWeight="bold" color="#333">
              {otSummary.totalRecords}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              borderRadius: 2,
              borderLeft: "4px solid #1976d2",
            }}
          >
            <Typography variant="subtitle2" color="textSecondary">
              Total OT Hours
            </Typography>
            <Typography variant="h5" fontWeight="bold" color="#1976d2">
              {formatTimeDisplay(otSummary.totalOTFormatted)}
            </Typography>
            {otSummary.sundayRecords > 0 && (
              <Typography variant="caption" color="error">
                ({otSummary.sundayRecords} Sundays)
              </Typography>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              borderRadius: 2,
              borderLeft: "4px solid #388e3c",
            }}
          >
            <Typography variant="subtitle2" color="textSecondary">
              Working Hours
            </Typography>
            <Typography variant="h5" fontWeight="bold" color="#388e3c">
              {formatTimeDisplay(otSummary.regularWorkingFormatted)}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              ({otSummary.regularRecords} regular days)
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              borderRadius: 2,
              borderLeft: "4px solid #d32f2f",
            }}
          >
            <Typography variant="subtitle2" color="textSecondary">
              Sunday OT Hours
            </Typography>
            <Typography variant="h5" fontWeight="bold" color="#d32f2f">
              {formatTimeDisplay(otSummary.sundayOTFormatted)}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              ({otSummary.sundayRecords} Sundays)
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              borderRadius: 2,
              borderLeft: "4px solid #f57c00",
            }}
          >
            <Typography variant="subtitle2" color="textSecondary">
              Employees with OT
            </Typography>
            <Typography variant="h5" fontWeight="bold" color="#f57c00">
              {otSummary.employeesWithOTCount}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Sunday OT Notice */}
      {otSummary.sundayRecords > 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight="bold">
            Sunday OT Policy Applied:
          </Typography>
          <Typography variant="body2">
            For {otSummary.sundayRecords} Sunday record(s), all working hours
            have been counted as OT. Working hours are shown as 00:00 and total
            hours equal OT hours for Sunday entries.
          </Typography>
        </Alert>
      )}

      {/* Filters Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight="bold" color="#333" sx={{ mb: 2 }}>
          <Filter
            size={20}
            style={{ marginRight: "8px", verticalAlign: "middle" }}
          />
          Filter Options
        </Typography>

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <Autocomplete
              size="small"
              fullWidth
              options={[
                { EmpId: "all", Name: "All Employees" },
                ...state.employees,
              ]}
              getOptionLabel={(option) =>
                option.EmpId === "all"
                  ? "All Employees"
                  : `${option.Name} (${option.EmpId})`
              }
              value={
                state.selectedEmployee === "all"
                  ? { EmpId: "all", Name: "All Employees" }
                  : state.employees.find(
                      (emp) => emp.EmpId === state.selectedEmployee,
                    ) || null
              }
              onChange={(event, newValue) => {
                handleEmployeeChange({
                  target: {
                    value: newValue ? newValue.EmpId : "all",
                  },
                });
              }}
              renderInput={(params) => (
                <TextField {...params} label="Employee" />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Box display="flex" gap={2} alignItems="center">
              <TextField
                label="From Date"
                type="date"
                size="small"
                value={state.fromDate}
                onChange={(e) => handleDateChange(e, "fromDate")}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <Typography variant="body2" color="textSecondary">
                to
              </Typography>
              <TextField
                label="To Date"
                type="date"
                size="small"
                value={state.toDate}
                onChange={(e) => handleDateChange(e, "toDate")}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={3}>
            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                onClick={applyFilters}
                sx={{
                  backgroundColor: "#344C7D",
                  "&:hover": { backgroundColor: "#e08416" },
                  flex: 1,
                }}
              >
                Apply
              </Button>
              <Button
                variant="outlined"
                onClick={resetFilters}
                sx={{ flex: 1 }}
              >
                Reset
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {state.error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {state.error}
        </Alert>
      )}

      {/* Search Bar */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search by employee name, ID, date, or day..."
        value={state.searchTerm}
        onChange={handleSearch}
        size="small"
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <Search size={20} style={{ marginRight: "8px", color: "#999" }} />
          ),
        }}
      />

      {/* OT Report Table */}
      <TableContainer
        component={Paper}
        sx={{
          mb: 2,
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
        }}
      >
        <Table size="medium">
          <TableHead sx={{ backgroundColor: "#344C7D" }}>
            <TableRow>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Employee ID
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Employee Name
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Date
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Day
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                In Time
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Out Time
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Working Hours
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                OT Hours
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Total Hours
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {searchedRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                  <Typography color="textSecondary">
                    {state.attendanceRecords.length === 0
                      ? "No attendance records found for the selected filters"
                      : "No records match your search"}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              searchedRecords
                .slice(
                  state.page * state.rowsPerPage,
                  state.page * state.rowsPerPage + state.rowsPerPage,
                )
                .map((record) => {
                  const isSunday = record.is_sunday;
                  const dayName = getDayName(record.in_date);

                  return (
                    <TableRow
                      key={`${record.id}-${record.in_date}`}
                      hover
                      sx={{
                        "&:hover": {
                          backgroundColor: isSunday
                            ? "rgba(255, 235, 238, 0.5)"
                            : "rgba(246, 147, 32, 0.04)",
                        },
                        backgroundColor: isSunday
                          ? "rgba(255, 235, 238, 0.3)"
                          : "inherit",
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight="500">
                          {record.emp_id}
                        </Typography>
                      </TableCell>
                      <TableCell>{record.employee_name}</TableCell>
                      <TableCell>{formatDate1(record.in_date)}</TableCell>
                      <TableCell>
                        <Chip
                          label={dayName}
                          size="small"
                          color={isSunday ? "error" : "default"}
                          variant={isSunday ? "filled" : "outlined"}
                          sx={{
                            fontWeight: isSunday ? "bold" : "normal",
                          }}
                        />
                      </TableCell>
                      <TableCell>{record.in_time || "-"}</TableCell>
                      <TableCell>{record.out_time || "-"}</TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            color: isSunday ? "#999" : "inherit",
                            fontStyle: isSunday ? "italic" : "normal",
                          }}
                        >
                          {formatTimeDisplay(record.working_hours)}
                          {isSunday && (
                            <Typography
                              component="span"
                              variant="caption"
                              sx={{ ml: 0.5, color: "#d32f2f" }}
                            >
                              (Sunday)
                            </Typography>
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            color: isSunday ? "#d32f2f" : "#f57c00",
                            bgcolor: isSunday ? "#ffebee" : "#fff3e0",
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            display: "inline-block",
                            fontWeight: "bold",
                          }}
                        >
                          {formatTimeDisplay(record.ot)}
                          {isSunday && (
                            <Typography
                              component="span"
                              variant="caption"
                              sx={{ ml: 1, color: "#d32f2f" }}
                            >
                              (Full Day OT)
                            </Typography>
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          sx={{
                            color: isSunday ? "#d32f2f" : "#1976d2",
                            bgcolor: isSunday ? "#ffebee" : "#e3f2fd",
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            display: "inline-block",
                          }}
                        >
                          {formatTimeDisplay(record.total_hours)}
                          {isSunday && record.ot !== "00:00:00" && (
                            <Typography
                              component="span"
                              variant="caption"
                              sx={{ ml: 0.5, color: "#d32f2f" }}
                            >
                              = OT Hours
                            </Typography>
                          )}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={searchedRecords.length}
        page={state.page}
        rowsPerPage={state.rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
        sx={{
          ".MuiTablePagination-selectIcon": { color: "#344C7D" },
          ".MuiTablePagination-select": { fontWeight: 500 },
          ".Mui-selected": {
            backgroundColor: "#344C7D !important",
            color: "white",
          },
        }}
      />
    </Box>
  );
};

export default OTReportList;
