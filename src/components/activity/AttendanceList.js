"use client"

import React from "react"

import { useState, useEffect } from "react"
import {
  Alert,
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
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Grid,
  Divider,
  useTheme,
  Stack,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ButtonGroup,
  Badge,
} from "@mui/material"
import {
  Download,
  Settings,
  LocationOn,
  AccessTime,
  CalendarToday,
  Person,
  Schedule,
  TrendingUp,
  Refresh,
  FilterList,
  DateRange,
  Weekend,
  Event,
  BeachAccess,
  Info,
} from "@mui/icons-material"
import { Calendar, dateFnsLocalizer } from "react-big-calendar"
import {
  format,
  parse,
  startOfWeek,
  getDay,
  isWithinInterval,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  parseISO,
} from "date-fns"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { useAuth } from "../auth/AuthContext"
import { useNavigate } from "react-router-dom"
import axios from "axios"

const locales = {
  "en-US": require("date-fns/locale/en-US"),
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date()),
  getDay,
  locales,
})

// Mock auth context and navigate for demo
const mockUseAuth = () => ({
  user: {
    role: "HR",
    emp_id: "NI003",
    tenent_id: "1",
    shift: "10:00 AM - 7:00 PM",
    name: "Yash Jain",
    weekOff: "Saturday,Sunday",
  },
})

const mockUseNavigate = () => (path) => console.log(`Navigate to: ${path}`)

const generateMapUrl = (geoLocation) => {
  if (!geoLocation || geoLocation === "N/A") {
    return "#"
  }

  const [latitude, longitude] = geoLocation.split(",")

  if (!latitude || !longitude) {
    return "#"
  }

  const lat = Number.parseFloat(latitude)
  const lon = Number.parseFloat(longitude)

  if (isNaN(lat) || isNaN(lon)) {
    return "#"
  }

  return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}&zoom=15&basemap=satellite&markercolor=red`
}

const AttendanceStatusChip = ({ status, time }) => {
  const getStatusProps = () => {
    switch (status) {
      case "on-time":
        return { color: "success", label: "On Time" }
      case "late":
        return { color: "error", label: "Late" }
      case "early":
        return { color: "info", label: "Early" }
      case "holiday":
        return { color: "warning", label: "Holiday" }
      case "weekoff":
        return { color: "secondary", label: "Week Off" }
      case "leave":
        return { color: "info", label: "Leave" }
      default:
        return { color: "default", label: "N/A" }
    }
  }

  const { color, label } = getStatusProps()

  return (
    <Chip
      size="small"
      color={color}
      label={`${label} ${time !== "N/A" && time ? `(${time})` : ""}`}
      sx={{ fontSize: "0.75rem" }}
    />
  )
}

const AttendanceCard = ({ activity, isMobile }) => {
  const theme = useTheme()

  const getCardColor = () => {
    switch (activity.type) {
      case "attendance":
        return activity.color === "green" ? theme.palette.success.main : theme.palette.error.main
      case "holiday":
        return theme.palette.warning.main
      case "weekoff":
        return theme.palette.secondary.main
      case "leave":
        return theme.palette.info.main
      default:
        return theme.palette.grey[500]
    }
  }

  return (
    <Card
      sx={{
        mb: 2,
        borderLeft: `4px solid ${getCardColor()}`,
        "&:hover": {
          boxShadow: theme.shadows[4],
          transform: "translateY(-2px)",
          transition: "all 0.2s ease-in-out",
        },
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <Box display="flex" alignItems="center" gap={1}>
              <CalendarToday fontSize="small" color="primary" />
              <Typography variant="body2" fontWeight="medium">
                {activity.start ? format(activity.start, "dd/MM/yyyy") : "N/A"}
              </Typography>
            </Box>
          </Grid>

          {activity.type === "attendance" ? (
            <>
              <Grid item xs={6} sm={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <AccessTime fontSize="small" color="success" />
                  <Tooltip title={`Check-in location: ${activity.firstInLocation || "N/A"}`}>
                    <Typography
                      variant="body2"
                      component="a"
                      href={generateMapUrl(activity.firstInLocation)}
                      target="_blank"
                      sx={{
                        textDecoration: "none",
                        color: "primary.main",
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      {activity.firstIn}
                    </Typography>
                  </Tooltip>
                </Box>
              </Grid>

              <Grid item xs={6} sm={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Schedule fontSize="small" color="warning" />
                  {activity.lastOutLocation !== "N/A" ? (
                    <Tooltip title={`Check-out location: ${activity.lastOutLocation}`}>
                      <Typography
                        variant="body2"
                        component="a"
                        href={generateMapUrl(activity.lastOutLocation)}
                        target="_blank"
                        sx={{
                          textDecoration: "none",
                          color: "primary.main",
                          "&:hover": { textDecoration: "underline" },
                        }}
                      >
                        {activity.lastOut}
                      </Typography>
                    </Tooltip>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      {activity.lastOut}
                    </Typography>
                  )}
                </Box>
              </Grid>

              <Grid item xs={6} sm={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <TrendingUp fontSize="small" color="info" />
                  <Typography variant="body2" fontWeight="medium">
                    {activity.workingHours}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6} sm={3}>
                <AttendanceStatusChip
                  status={activity.color === "green" ? "on-time" : "late"}
                  time={activity.firstIn}
                />
              </Grid>
            </>
          ) : (
            <Grid item xs={12} sm={9}>
              <Box display="flex" alignItems="center" gap={2}>
                {activity.type === "holiday" && <Event fontSize="small" color="warning" />}
                {activity.type === "weekoff" && <Weekend fontSize="small" color="secondary" />}
                {activity.type === "leave" && <BeachAccess fontSize="small" color="info" />}
                <Typography variant="body2" fontWeight="medium">
                  {activity.title}
                </Typography>
                <AttendanceStatusChip status={activity.type} />
              </Box>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  )
}

// Legend Component
const CalendarLegend = () => {
  const theme = useTheme()

  const legendItems = [
    { color: theme.palette.success.main, label: "On Time", icon: <AccessTime fontSize="small" /> },
    { color: theme.palette.error.main, label: "Late", icon: <Schedule fontSize="small" /> },
    { color: theme.palette.warning.main, label: "Holiday", icon: <Event fontSize="small" /> },
    { color: theme.palette.secondary.main, label: "Week Off", icon: <Weekend fontSize="small" /> },
    { color: theme.palette.info.main, label: "Leave", icon: <BeachAccess fontSize="small" /> },
  ]

  return (
    <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
      <Typography variant="subtitle2" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Info fontSize="small" />
        Calendar Legend
      </Typography>
      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
        {legendItems.map((item, index) => (
          <Box key={index} display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 16,
                height: 16,
                backgroundColor: item.color,
                borderRadius: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {React.cloneElement(item.icon, { sx: { fontSize: 10, color: "white" } })}
            </Box>
            <Typography variant="caption">{item.label}</Typography>
          </Box>
        ))}
      </Stack>
    </Paper>
  )
}

const AttendanceList = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const theme = useTheme()
  const [employees, setEmployees] = useState([])
  const [students, setStudents] = useState([])
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [selectedEmpId, setSelectedEmpId] = useState(user.role === "HR" || user.role === "Admin" ? "" : user.emp_id)
  const [allActivities, setAllActivities] = useState([])
  const [filteredActivities, setFilteredActivities] = useState([])
  const [holidays, setHolidays] = useState([])
  const [leaves, setLeaves] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [viewMode, setViewMode] = useState("calendar")
  const [viewType, setViewType] = useState("employee")

  // Date filtering states
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  // Generate month and year options
  const months = [
    { value: 0, label: "January" },
    { value: 1, label: "February" },
    { value: 2, label: "March" },
    { value: 3, label: "April" },
    { value: 4, label: "May" },
    { value: 5, label: "June" },
    { value: 6, label: "July" },
    { value: 7, label: "August" },
    { value: 8, label: "September" },
    { value: 9, label: "October" },
    { value: 10, label: "November" },
    { value: 11, label: "December" },
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

  // Generate week off events
  const generateWeekOffEvents = (employee, startDate, endDate) => {
    if (!employee?.WeekOff) return []

    const weekOffDays = employee.WeekOff.split(",").map((day) => day.trim().toLowerCase())
    const dayMap = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    }

    const weekOffNumbers = weekOffDays.map((day) => dayMap[day]).filter((num) => num !== undefined)
    const events = []

    const days = eachDayOfInterval({ start: startDate, end: endDate })

    days.forEach((day) => {
      if (weekOffNumbers.includes(day.getDay())) {
        events.push({
          title: "Week Off",
          start: day,
          end: day,
          allDay: true,
          type: "weekoff",
          color: theme.palette.secondary.main,
        })
      }
    })

    return events
  }

  // Generate holiday events
  const generateHolidayEvents = () => {
    return holidays.map((holiday) => ({
      title: holiday.title,
      start: parseISO(holiday.date),
      end: parseISO(holiday.date),
      allDay: true,
      type: "holiday",
      color: theme.palette.warning.main,
    }))
  }

  // Generate leave events
  const generateLeaveEvents = (empId) => {
    return leaves
      .filter((leave) => leave.EmpId === empId && leave.Status === "Approved")
      .flatMap((leave) => {
        const startDate = parseISO(leave.StartDate)
        const endDate = parseISO(leave.EndDate)
        const days = eachDayOfInterval({ start: startDate, end: endDate })

        return days.map((day) => ({
          title: `Leave (${leave.Category}) - ${leave.Reason}`,
          start: day,
          end: day,
          allDay: true,
          type: "leave",
          color: theme.palette.info.main,
          category: leave.Category,
          reason: leave.Reason,
        }))
      })
  }

  // Filter activities based on selected month and year
  useEffect(() => {
    const startDate = startOfMonth(new Date(selectedYear, selectedMonth))
    const endDate = endOfMonth(new Date(selectedYear, selectedMonth))

    let filtered = []

    // Add attendance data
    const attendanceEvents = allActivities.filter((activity) => {
      if (!activity.start || activity.type !== "attendance") return false
      return isWithinInterval(activity.start, { start: startDate, end: endDate })
    })

    // Add week off events
    const weekOffEvents = selectedEmployee ? generateWeekOffEvents(selectedEmployee, startDate, endDate) : []

    // Add holiday events
    const holidayEvents = generateHolidayEvents().filter((holiday) =>
      isWithinInterval(holiday.start, { start: startDate, end: endDate }),
    )

    // Add leave events
    const leaveEvents = selectedEmpId
      ? generateLeaveEvents(selectedEmpId).filter((leave) =>
          isWithinInterval(leave.start, { start: startDate, end: endDate }),
        )
      : []

    filtered = [...attendanceEvents, ...weekOffEvents, ...holidayEvents, ...leaveEvents]

    setFilteredActivities(filtered)
    setPage(0)
  }, [allActivities, selectedMonth, selectedYear, selectedEmployee, selectedEmpId, holidays, leaves])

  const fetchAttendance = async () => {
    if (!selectedEmpId) return

    setError(null)
    setLoading(true)

    try {
      console.log("Fetching attendance for EmpId:", selectedEmpId)
      
      const response = await axios.get(
        `https://namami-infotech.com/NIKHILOFFSET/src/attendance/view_attendance.php`,
        { 
          params: { EmpId: selectedEmpId },
          timeout: 10000 // 10 second timeout
        }
      )

      console.log("Attendance API Response:", response.data)

      if (response.data.success && response.data.data) {
        const attendanceData = response.data.data
          .map((activity) => {
            if (!activity.date) {
              console.warn("Activity missing date:", activity)
              return null
            }

            let formattedDate
            try {
              // Try parsing the date in dd/MM/yyyy format
              formattedDate = parse(activity.date, "dd/MM/yyyy", new Date())
              if (isNaN(formattedDate)) {
                // If that fails, try parsing as ISO date
                formattedDate = parseISO(activity.date)
                if (isNaN(formattedDate)) {
                  console.error("Invalid date format:", activity.date)
                  return null
                }
              }
            } catch (error) {
              console.error("Date parsing error:", error, activity.date)
              return null
            }

            const employeeShift = selectedEmployee?.Shift || user.shift || "9:00 AM - 6:00 PM"

            return {
              title: `In: ${activity.firstIn || "N/A"}\nOut: ${activity.lastOut || "N/A"}`,
              start: formattedDate,
              end: formattedDate,
              firstIn: activity.firstIn || "N/A",
              lastOut: activity.lastOut || "N/A",
              firstInLocation: activity.firstInLocation || "N/A",
              lastOutLocation: activity.lastOutLocation || "N/A",
              workingHours: activity.workingHours || "0h 0m",
              allDay: true,
              color: compareTimes(activity.firstIn, employeeShift),
              firstEvent: activity.firstEvent || "Unknown",
              lastEvent: activity.lastEvent || "Unknown",
              type: "attendance",
            }
          })
          .filter(Boolean)

        console.log("Processed attendance data:", attendanceData)
        setAllActivities(attendanceData)
      } else {
        console.log("No attendance data found or API returned error:", response.data)
        setAllActivities([])
        if (!response.data.success) {
          setError(response.data.message || "No attendance data found for the selected employee")
        }
      }
    } catch (error) {
      console.error("Error fetching attendance:", error)
      setError("Error fetching attendance: " + (error.response?.data?.message || error.message))
      setAllActivities([])
    } finally {
      setLoading(false)
    }
  }

  const fetchHolidays = async () => {
    try {
      console.log("Fetching holidays for Tenent_Id:", user.tenent_id)
      
      const response = await axios.get(
        `https://namami-infotech.com/NIKHILOFFSET/src/holiday/view_holiday.php?Tenent_Id=${user.tenent_id}`,
        { timeout: 10000 }
      )
      
      console.log("Holidays API Response:", response.data)
      
      if (response.data.success && response.data.data) {
        setHolidays(response.data.data)
      } else {
        setHolidays([])
      }
    } catch (error) {
      console.error("Error fetching holidays:", error)
      setHolidays([])
    }
  }

  const fetchLeaves = async (empId) => {
    if (!empId) return

    try {
      console.log("Fetching leaves for empId:", empId)
      
      const response = await axios.get(
        `https://namami-infotech.com/NIKHILOFFSET/src/leave/get_leave.php?empId=${empId}`,
        { timeout: 10000 }
      )
      
      console.log("Leaves API Response:", response.data)
      
      if (response.data.success && response.data.data) {
        setLeaves(response.data.data)
      } else {
        setLeaves([])
      }
    } catch (error) {
      console.error("Error fetching leaves:", error)
      setLeaves([])
    }
  }

  // Add employee fetching for HR role
 useEffect(() => {
  if (user.role === "HR" || user.role === "Admin") {
    const fetchData = async () => {
      await fetchEmployees()
      await fetchStudents()
    }
    fetchData()
  } else {
    // For non-HR users, set the current user as selected employee
    const currentUserEmployee = {
      EmpId: user.emp_id,
      Name: user.name,
      WeekOff: user.weekOff || "Saturday,Sunday",
      Shift: user.shift || "9:00 AM - 6:00 PM"
    }
    setSelectedEmployee(currentUserEmployee)
    setEmployees([currentUserEmployee])
  }
  // Fetch holidays
  fetchHolidays()
}, [user.role, user.tenent_id])
const fetchStudents = async () => {
  try {
    setLoading(true)
    console.log("Fetching students for Tenent_Id:", user.tenent_id)
    const response = await axios.get(
      `https://namami-infotech.com/NIKHILOFFSET/src/employee/list_student.php?Tenent_Id=${user.tenent_id}`,
      { timeout: 10000 }
    )
    console.log("Students API Response:", response.data)
    if (response.data.success && response.data.data) {
      setStudents(response.data.data)
    } else {
      setStudents([])
      setError("Error fetching student list: " + (response.data.message || "Unknown error"))
    }
  } catch (error) {
    console.error("Error fetching students:", error)
    setError("Error fetching student list: " + error.message)
    setStudents([])
  } finally {
    setLoading(false)
  }
  }
  const fetchEmployees = async () => {
  try {
    setLoading(true)
    console.log("Fetching employees for Tenent_Id:", user.tenent_id)
    const response = await axios.get(
      `https://namami-infotech.com/NIKHILOFFSET/src/employee/list_employee.php?Tenent_Id=${user.tenent_id}`,
      { timeout: 10000 }
    )
    console.log("Employees API Response:", response.data)
    if (response.data.success && response.data.data) {
      setEmployees(response.data.data)
    } else {
      setEmployees([])
      setError("Error fetching employee list: " + (response.data.message || "Unknown error"))
    }
  } catch (error) {
    console.error("Error fetching employees:", error)
    setError("Error fetching employee list: " + error.message)
    setEmployees([])
  } finally {
    setLoading(false)
  }
}
  // Update the attendance fetching effect
  useEffect(() => {
    if (selectedEmpId) {
      console.log("Selected EmpId changed to:", selectedEmpId)
      fetchAttendance()
      fetchLeaves(selectedEmpId)
    }
  }, [selectedEmpId])

  const parseTime = (timeString) => {
    if (!timeString || timeString === "N/A") return null

    const [time, modifier] = timeString.split(" ")
    if (!time || !modifier) return null

    let [hours, minutes] = time.split(":")
    if (!hours || !minutes) return null

    hours = String(hours)

    if (hours === "12") {
      hours = "00"
    }
    if (modifier === "PM" && hours !== "12") {
      hours = String(Number.parseInt(hours, 10) + 12)
    } else if (modifier === "AM" && hours === "12") {
      hours = "00"
    }

    return `${hours.padStart(2, "0")}:${minutes}`
  }

  const compareTimes = (attendanceTime, shiftTime) => {
    if (!attendanceTime || attendanceTime === "N/A" || !shiftTime) {
      return "red"
    }

    try {
      const shiftStartTime = parseTime(shiftTime.split(" - ")[0])
      const attendanceTime24 = parseTime(attendanceTime)

      if (!shiftStartTime || !attendanceTime24) {
        return "red"
      }

      const shiftStart = new Date(`1970-01-01T${shiftStartTime}:00`)
      const attendance = new Date(`1970-01-01T${attendanceTime24}:00`)

      const diffInMinutes = (attendance - shiftStart) / (1000 * 60)

      if (diffInMinutes <= 10) {
        return "green"
      } else {
        return "red"
      }
    } catch (error) {
      console.error("Error comparing times:", error)
      return "red"
    }
  }

  const exportToCsv = () => {
    const csvRows = [["Date", "Type", "Check In", "Check Out", "Working Hours", "Status", "Notes"]]

    filteredActivities.forEach((activity) => {
      if (activity.type === "attendance") {
        csvRows.push([
          activity.start ? format(activity.start, "dd/MM/yyyy") : "N/A",
          "Attendance",
          activity.firstIn,
          activity.lastOut,
          activity.workingHours,
          activity.color === "green" ? "On Time" : "Late",
          "",
        ])
      } else {
        csvRows.push([
          activity.start ? format(activity.start, "dd/MM/yyyy") : "N/A",
          activity.type.charAt(0).toUpperCase() + activity.type.slice(1),
          "-",
          "-",
          "-",
          activity.type.charAt(0).toUpperCase() + activity.type.slice(1),
          activity.title,
        ])
      }
    })

    const csvContent = csvRows.map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.href = url
    link.setAttribute("download", `attendance_${selectedEmpId}_${months[selectedMonth].label}_${selectedYear}.csv`)
    link.click()
    URL.revokeObjectURL(url)
  }

  const refreshData = () => {
    console.log("Refreshing data...")
    if (selectedEmpId) {
      fetchAttendance()
      fetchLeaves(selectedEmpId)
    }
    fetchHolidays()
  }

  const regularise = () => {
    navigate("/regularise")
  }

  // Calculate statistics for filtered data (only attendance records)
  const attendanceRecords = filteredActivities.filter((a) => a.type === "attendance")
  const totalDays = attendanceRecords.length
  const onTimeDays = attendanceRecords.filter((a) => a.color === "green").length
  const lateDays = attendanceRecords.filter((a) => a.color === "red").length
  const avgHours =
    attendanceRecords.length > 0
      ? attendanceRecords.reduce((acc, activity) => {
          const hours = Number.parseFloat(activity.workingHours.replace(/[^\d.]/g, "")) || 0
          return acc + hours
        }, 0) / attendanceRecords.length
      : 0

  // Count other types
  const holidayCount = filteredActivities.filter((a) => a.type === "holiday").length
  const weekOffCount = filteredActivities.filter((a) => a.type === "weekoff").length
  const leaveCount = filteredActivities.filter((a) => a.type === "leave").length

  const eventStyleGetter = (event) => {
    let backgroundColor = "#3174ad"

    switch (event.type) {
      case "attendance":
        backgroundColor = event.color === "green" ? theme.palette.success.main : theme.palette.error.main
        break
      case "holiday":
        backgroundColor = theme.palette.warning.main
        break
      case "weekoff":
        backgroundColor = theme.palette.secondary.main
        break
      case "leave":
        backgroundColor = theme.palette.info.main
        break
    }

    return {
      style: {
        backgroundColor,
        color: "#fff",
        fontSize: "12px",
        borderRadius: "4px",
        border: "none",
        padding: "4px",
      },
    }
  }

  return (
    <Box sx={{ p: { xs: 0, md: 0 }, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Header Section */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" fontWeight="bold" color="primary">
            Attendance Management
          </Typography>
          <Box display="flex" gap={1}>
            <Tooltip title="Refresh Data">
              <IconButton onClick={refreshData} disabled={loading}>
                {loading ? <CircularProgress size={20} /> : <Refresh />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Controls Section */}
        <Grid container spacing={2} alignItems="center">
          {user.role === "HR" || user.role === "Admin" && (
  <Grid item xs={12} sm={6} md={3}>
    <Autocomplete
      options={viewType === "employee" ? employees : students}
      getOptionLabel={(option) => `${option.Name} (${option.EmpId || option.StudentId})`}
      value={
        (viewType === "employee" 
          ? employees.find((emp) => emp.EmpId === selectedEmpId)
          : students.find((stu) => stu.StudentId === selectedEmpId)) || null
      }
      onChange={(event, newValue) => {
        console.log("Selection changed:", newValue)
        setSelectedEmpId(newValue ? (newValue.EmpId || newValue.StudentId) : "")
        setSelectedEmployee(newValue)
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={`Select ${viewType === "employee" ? "Employee" : "Student"}`}
          variant="outlined"
          fullWidth
          InputProps={{
            ...params.InputProps,
            startAdornment: <Person sx={{ mr: 1, color: "text.secondary" }} />,
          }}
        />
      )}
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          <Avatar sx={{ mr: 2, width: 32, height: 32 }}>{option.Name.charAt(0)}</Avatar>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {option.Name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {option.EmpId || option.StudentId} • 
              {viewType === "employee" ? ` Week Off: ${option.WeekOff || "Not set"}` : " Student"}
            </Typography>
          </Box>
        </Box>
      )}
      loading={loading}
    />
  </Grid>
)}

          {/* Month Selector */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Month</InputLabel>
              <Select
                value={selectedMonth}
                label="Month"
                onChange={(e) => setSelectedMonth(e.target.value)}
                startAdornment={<DateRange sx={{ mr: 1, color: "text.secondary" }} />}
              >
                {months.map((month) => (
                  <MenuItem key={month.value} value={month.value}>
                    {month.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Year Selector */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Year</InputLabel>
              <Select
                value={selectedYear}
                label="Year"
                onChange={(e) => setSelectedYear(e.target.value)}
                startAdornment={<CalendarToday sx={{ mr: 1, color: "text.secondary" }} />}
              >
                {years.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Stack direction="row" spacing={1}>
              <Button
                variant={viewMode === "calendar" ? "contained" : "outlined"}
                onClick={() => setViewMode("calendar")}
                startIcon={<CalendarToday />}
                size="small"
              >
                Calendar
              </Button>
              <Button
                variant={viewMode === "list" ? "contained" : "outlined"}
                onClick={() => setViewMode("list")}
                startIcon={<FilterList />}
                size="small"
              >
                List
              </Button>
            </Stack>
          </Grid>

          {/* <Grid item xs={12} sm={12} md={3}>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              {user.role === "HR" && (
                <Button variant="outlined" startIcon={<Settings />} onClick={regularise}>
                  Regularise
                </Button>
              )}
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={exportToCsv}
                disabled={filteredActivities.length === 0}
              >
                Export CSV
              </Button>
            </Stack>
          </Grid> */}
        </Grid>

        {/* Selected Period Display */}
        <Box sx={{ mt: 2, p: 2, backgroundColor: "primary.light", borderRadius: 1 }}>
  <Typography variant="body2" color="primary.contrastText" fontWeight="medium">
    📅 Viewing: {months[selectedMonth].label} {selectedYear} •
    {attendanceRecords.length > 0 && ` ${attendanceRecords.length} attendance records`}
    {holidayCount > 0 && ` • ${holidayCount} holidays`}
    {weekOffCount > 0 && ` • ${weekOffCount} week offs`}
    {leaveCount > 0 && ` • ${leaveCount} leaves`}
    {selectedEmployee && ` • ${viewType === "employee" ? "Employee" : "Student"}: ${selectedEmployee.Name}`}
  </Typography>
</Box>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Loading Alert */}
      {loading && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Box display="flex" alignItems="center" gap={2}>
            <CircularProgress size={20} />
            Loading attendance data...
          </Box>
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)" }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Working Days
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {totalDays}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Attendance records
                  </Typography>
                </Box>
                <CalendarToday color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: "linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)" }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    On Time
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="success.main">
                    {onTimeDays}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {totalDays > 0 ? `${((onTimeDays / totalDays) * 100).toFixed(1)}%` : "0%"}
                  </Typography>
                </Box>
                <AccessTime color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: "linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)" }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Late Arrivals
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="error.main">
                    {lateDays}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {totalDays > 0 ? `${((lateDays / totalDays) * 100).toFixed(1)}%` : "0%"}
                  </Typography>
                </Box>
                <Schedule color="error" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: "linear-gradient(135deg, #fff3e0 0%, #ffcc80 100%)" }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Non-Working
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="warning.main">
                    {holidayCount + weekOffCount + leaveCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Holidays, Leaves, Week offs
                  </Typography>
                </Box>
                <Badge badgeContent={`${holidayCount + weekOffCount + leaveCount}`} color="warning">
                  <Event color="warning" sx={{ fontSize: 40 }} />
                </Badge>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Calendar Legend */}
      <CalendarLegend />

      {/* Main Content */}
      {viewMode === "calendar" ? (
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Attendance Calendar - {months[selectedMonth].label} {selectedYear}
          </Typography>
          <Calendar
            localizer={localizer}
            events={filteredActivities}
            startAccessor="start"
            endAccessor="end"
            style={{
              height: 500,
              backgroundColor: "#fff",
            }}
            eventPropGetter={eventStyleGetter}
            views={["month", "week", "day"]}
            popup
            date={new Date(selectedYear, selectedMonth, 1)}
            onNavigate={(date) => {
              setSelectedMonth(date.getMonth())
              setSelectedYear(date.getFullYear())
            }}
            tooltipAccessor={(event) => {
              if (event.type === "attendance") {
                return `${event.title}\nWorking Hours: ${event.workingHours}`
              }
              return event.title
            }}
          />
        </Paper>
      ) : (
        <Paper sx={{ borderRadius: 2 }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              All Records - {months[selectedMonth].label} {selectedYear}
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {filteredActivities.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <CalendarToday sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No records found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedEmpId 
                    ? `No data available for ${months[selectedMonth].label} ${selectedYear}`
                    : "Please select an employee to view attendance data"
                  }
                </Typography>
              </Box>
            ) : isMobile ? (
              <Box>
                {filteredActivities
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((activity, index) => (
                    <AttendanceCard key={index} activity={activity} isMobile={isMobile} />
                  ))}
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>Date</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>Type</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>Check In</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>Check Out</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>Working Hours</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredActivities
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((activity, index) => (
                        <TableRow
                          key={index}
                          sx={{
                            "&:hover": { backgroundColor: theme.palette.action.hover },
                            borderLeft: `4px solid ${
                              activity.type === "attendance"
                                ? activity.color === "green"
                                  ? theme.palette.success.main
                                  : theme.palette.error.main
                                : activity.type === "holiday"
                                  ? theme.palette.warning.main
                                  : activity.type === "weekoff"
                                    ? theme.palette.secondary.main
                                    : theme.palette.info.main
                            }`,
                          }}
                        >
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <CalendarToday fontSize="small" color="primary" />
                              {activity.start ? format(activity.start, "dd/MM/yyyy") : "N/A"}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              {activity.type === "attendance" && <Person fontSize="small" />}
                              {activity.type === "holiday" && <Event fontSize="small" />}
                              {activity.type === "weekoff" && <Weekend fontSize="small" />}
                              {activity.type === "leave" && <BeachAccess fontSize="small" />}
                              <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
                                {activity.type}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {activity.type === "attendance" ? (
                              <Tooltip title={`Location: ${activity.firstInLocation || "N/A"}`}>
                                <Box
                                  component="a"
                                  href={generateMapUrl(activity.firstInLocation)}
                                  target="_blank"
                                  sx={{
                                    textDecoration: "none",
                                    color: "primary.main",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    "&:hover": { textDecoration: "underline" },
                                  }}
                                >
                                  <LocationOn fontSize="small" />
                                  {activity.firstIn} ({activity.firstEvent})
                                </Box>
                              </Tooltip>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                -
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {activity.type === "attendance" ? (
                              activity.lastOutLocation !== "N/A" ? (
                                <Tooltip title={`Location: ${activity.lastOutLocation}`}>
                                  <Box
                                    component="a"
                                    href={generateMapUrl(activity.lastOutLocation)}
                                    target="_blank"
                                    sx={{
                                      textDecoration: "none",
                                      color: "primary.main",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                      "&:hover": { textDecoration: "underline" },
                                    }}
                                  >
                                    <LocationOn fontSize="small" />
                                    {activity.lastOut} ({activity.lastEvent})
                                  </Box>
                                </Tooltip>
                              ) : (
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Schedule fontSize="small" color="disabled" />
                                  {activity.lastOut}
                                </Box>
                              )
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                -
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {activity.type === "attendance" ? (
                              <Box display="flex" alignItems="center" gap={1}>
                                <AccessTime fontSize="small" color="info" />
                                <Typography fontWeight="medium">{activity.workingHours}</Typography>
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                -
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {activity.type === "attendance" ? (
                              <AttendanceStatusChip status={activity.color === "green" ? "on-time" : "late"} time="" />
                            ) : (
                              <AttendanceStatusChip status={activity.type} />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {filteredActivities.length > 0 && (
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={filteredActivities.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(event, newPage) => setPage(newPage)}
                onRowsPerPageChange={(event) => {
                  setRowsPerPage(Number.parseInt(event.target.value, 10))
                  setPage(0)
                }}
              />
            )}
          </Box>
        </Paper>
      )}
    </Box>
  )
}

export default AttendanceList
