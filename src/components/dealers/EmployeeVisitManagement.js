"use client"

import React, { useState, useEffect } from "react"
import {
  Box,
  Paper,
  Typography,
  Autocomplete,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  IconButton,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
  useTheme,
  AppBar,
  Toolbar,
  Tabs,
  Tab,
  BottomNavigation,
  BottomNavigationAction,
  Fab,
  SwipeableDrawer,
} from "@mui/material"
import {
  Person,
  ExitToApp,
  Login,
  Schedule,
  AccessTime,
  Edit,
  Delete,
  Refresh,
  Add,
  Close,
  Home,
  History,
  Group,
  FilterList,
} from "@mui/icons-material"
import { format, parseISO, isToday, startOfDay, endOfDay, subDays } from "date-fns"
import axios from "axios"

// Mock auth context
const mockUseAuth = () => ({
  user: {
    role: "HR",
    emp_id: "HR001",
    tenent_id: "1",
    name: "HR Manager",
  },
})

// Predefined reasons for visits
const PREDEFINED_REASONS = [
  "Client Meeting",
  "Bank Work",
  "Site Visit",
  "Personal Work",
  "Medical Appointment",
  "Vendor Meeting",
  "Training/Workshop",
  "Official Errand",
  "Field Work",
  "Other"
]

const EmployeeVisitManagement = () => {
  const { user } = mockUseAuth()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  
  const [employees, setEmployees] = useState([])
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [purpose, setPurpose] = useState("")
  const [remarks, setRemarks] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [activeVisits, setActiveVisits] = useState([])
  const [visitHistory, setVisitHistory] = useState([])
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingVisit, setEditingVisit] = useState(null)
  const [currentTab, setCurrentTab] = useState(0)
  const [quickActionsOpen, setQuickActionsOpen] = useState(false)
  const [dateFilter, setDateFilter] = useState("today")

  // Filter employees - only show those who are NOT currently out
  const availableEmployees = employees.filter(employee => 
    !activeVisits.some(visit => visit.EmpId === employee.EmpId && !visit.InTime)
  )

  // Filter history based on date filter
  const filteredHistory = visitHistory.filter(visit => {
    const visitDate = parseISO(visit.OutTime)
    const today = new Date()
    
    switch (dateFilter) {
      case "today":
        return isToday(visitDate)
      case "yesterday":
        return isToday(visitDate) || visitDate >= startOfDay(subDays(today, 1))
      case "week":
        return visitDate >= startOfDay(subDays(today, 7))
      case "month":
        return visitDate >= startOfDay(subDays(today, 30))
      default:
        return true
    }
  })

  // Fetch employees list
  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const response = await axios.get(
        `https://namami-infotech.com/NIKHILOFFSET/src/employee/list_employee.php?Tenent_Id=${user.tenent_id}`,
        { timeout: 10000 }
      )
      
      if (response.data.success && response.data.data) {
        setEmployees(response.data.data)
      } else {
        setEmployees([])
        setError("Error fetching employee list")
      }
    } catch (error) {
      console.error("Error fetching employees:", error)
      setError("Error fetching employee list: " + error.message)
      setEmployees([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch active visits (out entries without in entries)
  const fetchActiveVisits = async () => {
    try {
      const response = await axios.get(
        `https://namami-infotech.com/NIKHILOFFSET/src/visit/get_active_visits.php?Tenent_Id=${user.tenent_id}`,
        { timeout: 10000 }
      )
      
      if (response.data.success && response.data.data) {
        setActiveVisits(response.data.data)
      } else {
        setActiveVisits([])
      }
    } catch (error) {
      console.error("Error fetching active visits:", error)
      setActiveVisits([])
    }
  }

  // Fetch visit history
  const fetchVisitHistory = async () => {
    try {
      const response = await axios.get(
        `https://namami-infotech.com/NIKHILOFFSET/src/visit/get_visit_history.php?Tenent_Id=${user.tenent_id}&limit=50`,
        { timeout: 10000 }
      )
      
      if (response.data.success && response.data.data) {
        setVisitHistory(response.data.data)
      } else {
        setVisitHistory([])
      }
    } catch (error) {
      console.error("Error fetching visit history:", error)
      setVisitHistory([])
    }
  }

  useEffect(() => {
    fetchEmployees()
    fetchActiveVisits()
    fetchVisitHistory()
  }, [user.tenent_id])

  const handleSubmit = async () => {
    if (!selectedEmployee) {
      setError("Please select an employee")
      return
    }

    if (!purpose.trim()) {
      setError("Please select a purpose")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const visitData = {
        EmpId: selectedEmployee.EmpId,
        VisitType: "out", // Always "out" for new entries
        Purpose: purpose,
        Remarks: remarks,
        Tenent_Id: user.tenent_id,
        CreatedBy: user.emp_id,
      }

      const response = await axios.post(
        "https://namami-infotech.com/NIKHILOFFSET/src/visit/create_visit.php",
        visitData,
        { timeout: 10000 }
      )

      if (response.data.success) {
        setSuccess("Visit out recorded successfully!")
        setPurpose("")
        setRemarks("")
        setSelectedEmployee(null)
        
        // Refresh data
        fetchActiveVisits()
        fetchVisitHistory()
        
        // Switch to "Currently Out" tab
        setCurrentTab(1)
      } else {
        setError(response.data.message || "Failed to record visit")
      }
    } catch (error) {
      console.error("Error recording visit:", error)
      setError("Error recording visit: " + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleMarkReturn = async (visit) => {
    setLoading(true)
    setError(null)

    try {
      const visitData = {
        EmpId: visit.EmpId,
        VisitType: "in",
        Purpose: `Return from: ${visit.Purpose}`,
        Remarks: "Auto-generated return entry",
        Tenent_Id: user.tenent_id,
        CreatedBy: user.emp_id,
      }

      const response = await axios.post(
        "https://namami-infotech.com/NIKHILOFFSET/src/visit/create_visit.php",
        visitData,
        { timeout: 10000 }
      )

      if (response.data.success) {
        setSuccess("Return marked successfully!")
        
        // Refresh data
        fetchActiveVisits()
        fetchVisitHistory()
        
        // Switch to "History" tab
        setCurrentTab(2)
      } else {
        setError(response.data.message || "Failed to mark return")
      }
    } catch (error) {
      console.error("Error marking return:", error)
      setError("Error marking return: " + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleEditVisit = async (visitId, updates) => {
    try {
      const response = await axios.post(
        "https://namami-infotech.com/NIKHILOFFSET/src/visit/update_visit.php",
        { VisitId: visitId, ...updates },
        { timeout: 10000 }
      )

      if (response.data.success) {
        setSuccess("Visit updated successfully!")
        fetchActiveVisits()
        fetchVisitHistory()
        setEditDialogOpen(false)
        setEditingVisit(null)
      } else {
        setError(response.data.message || "Failed to update visit")
      }
    } catch (error) {
      console.error("Error updating visit:", error)
      setError("Error updating visit: " + error.message)
    }
  }

  const handleDeleteVisit = async (visitId) => {
    if (!window.confirm("Are you sure you want to delete this visit record?")) {
      return
    }

    try {
      const response = await axios.post(
        "https://namami-infotech.com/NIKHILOFFSET/src/visit/delete_visit.php",
        { VisitId: visitId },
        { timeout: 10000 }
      )

      if (response.data.success) {
        setSuccess("Visit record deleted successfully!")
        fetchActiveVisits()
        fetchVisitHistory()
      } else {
        setError(response.data.message || "Failed to delete visit")
      }
    } catch (error) {
      console.error("Error deleting visit:", error)
      setError("Error deleting visit: " + error.message)
    }
  }

  const quickMarkReturn = (visit) => {
    handleMarkReturn(visit)
    setQuickActionsOpen(false)
  }

  const refreshData = () => {
    fetchEmployees()
    fetchActiveVisits()
    fetchVisitHistory()
    setError(null)
    setSuccess(null)
  }

  const VisitStatusChip = ({ visit }) => {
    if (!visit.InTime) {
      return <Chip icon={<ExitToApp />} label="Out" color="warning" size="small" />
    }
    
    const outTime = parseISO(visit.OutTime)
    const inTime = parseISO(visit.InTime)
    const duration = Math.round((inTime - outTime) / (1000 * 60))
    
    return (
      <Chip 
        icon={<Login />} 
        label={`Returned (${duration}m)`} 
        color="success" 
        size="small" 
      />
    )
  }

  // Mobile Bottom Navigation
  const MobileBottomNav = () => (
    <BottomNavigation
      value={currentTab}
      onChange={(event, newValue) => setCurrentTab(newValue)}
      showLabels
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTop: '1px solid',
        borderColor: 'divider',
        zIndex: 1000,
      }}
    >
      <BottomNavigationAction label="New Out" icon={<Add />} />
      <BottomNavigationAction 
        label="Out Now" 
        icon={
          <Badge badgeContent={activeVisits.length} color="warning">
            <ExitToApp />
          </Badge>
        } 
      />
      <BottomNavigationAction label="History" icon={<History />} />
    </BottomNavigation>
  )

  // Quick Action FAB for mobile
  const QuickActionFab = () => (
    <Fab
      color="primary"
      aria-label="quick actions"
      sx={{
        position: 'fixed',
        bottom: 80,
        right: 16,
        zIndex: 1000,
      }}
      onClick={() => setQuickActionsOpen(true)}
    >
      <Group />
    </Fab>
  )

  // Quick Actions Drawer
  const QuickActionsDrawer = () => (
    <SwipeableDrawer
      anchor="bottom"
      open={quickActionsOpen}
      onClose={() => setQuickActionsOpen(false)}
      onOpen={() => setQuickActionsOpen(true)}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Quick Return Actions
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        {activeVisits.slice(0, 5).map((visit) => (
          <Button
            key={visit.VisitId}
            variant="outlined"
            fullWidth
            startIcon={<Login />}
            onClick={() => quickMarkReturn(visit)}
            sx={{ mb: 1, justifyContent: 'flex-start' }}
          >
            Mark {visit.Name} Return
          </Button>
        ))}
        
        {activeVisits.length === 0 && (
          <Typography color="text.secondary" textAlign="center" sx={{ py: 2 }}>
            No active visits for quick actions
          </Typography>
        )}
      </Box>
    </SwipeableDrawer>
  )

  // Main content with tabs for mobile
  const renderTabContent = () => {
    switch (currentTab) {
      case 0: // Entry Form - Only for marking OUT
        return (
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ExitToApp color="primary" />
                Mark Employee Out
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Autocomplete
                    options={availableEmployees}
                    getOptionLabel={(option) => `${option.Name} (${option.EmpId})`}
                    value={selectedEmployee}
                    onChange={(event, newValue) => setSelectedEmployee(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Employee"
                        variant="outlined"
                        fullWidth
                        size={isMobile ? "small" : "medium"}
                        helperText="Only employees currently in office are shown"
                      />
                    )}
                    renderOption={(props, option) => (
                      <Box component="li" {...props}>
                        <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                          {option.Name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {option.Name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {option.EmpId}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                    <InputLabel>Purpose *</InputLabel>
                    <Select
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      label="Purpose *"
                    >
                      {PREDEFINED_REASONS.map((reason) => (
                        <MenuItem key={reason} value={reason}>
                          {reason}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Remarks (Optional)"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={isMobile ? 2 : 3}
                    size={isMobile ? "small" : "medium"}
                    placeholder="Any additional details..."
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    size={isMobile ? "medium" : "large"}
                    onClick={handleSubmit}
                    disabled={loading || !selectedEmployee || !purpose}
                    startIcon={loading ? <CircularProgress size={20} /> : <ExitToApp />}
                    fullWidth
                    sx={{ py: isMobile ? 1 : 1.5 }}
                  >
                    {loading ? "Processing..." : "Mark Employee Out"}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )

      case 1: // Currently Out - Only for marking IN
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ExitToApp color="warning" />
                Currently Out of Office
                <Chip label={activeVisits.length} color="warning" size="small" />
              </Typography>

              {activeVisits.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <ExitToApp sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography color="text.secondary">
                    No employees are currently out
                  </Typography>
                </Box>
              ) : (
                <List dense={isMobile}>
                  {activeVisits.map((visit) => (
                    <ListItem
                      key={visit.VisitId}
                      sx={{
                        border: '1px solid',
                        borderColor: 'warning.light',
                        borderRadius: 1,
                        mb: 1,
                        backgroundColor: 'warning.light',
                      }}
                    >
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: 'warning.main', width: 40, height: 40 }}>
                          {visit.Name?.charAt(0) || 'E'}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" fontWeight="bold">
                            {visit.Name}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              {visit.EmpId}
                            </Typography>
                            <Typography variant="caption" display="block" fontWeight="medium">
                              {visit.Purpose}
                            </Typography>
                            <Typography variant="caption" display="block" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <AccessTime fontSize="inherit" />
                              Out since: {format(parseISO(visit.OutTime), "hh:mm a")}
                            </Typography>
                            {visit.Remarks && (
                              <Typography variant="caption" display="block" fontStyle="italic">
                                Remarks: {visit.Remarks}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<Login />}
                        onClick={() => handleMarkReturn(visit)}
                        disabled={loading}
                      >
                        Mark Return
                      </Button>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        )

      case 2: // History with Date Filter
        return (
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Schedule color="primary" />
                  Visit History
                </Typography>
                
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    startAdornment={<FilterList fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />}
                  >
                    <MenuItem value="today">Today</MenuItem>
                    <MenuItem value="yesterday">Yesterday</MenuItem>
                    <MenuItem value="week">Last Week</MenuItem>
                    <MenuItem value="month">Last Month</MenuItem>
                    <MenuItem value="all">All Time</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {filteredHistory.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Schedule sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography color="text.secondary">
                    No visit history for {dateFilter}
                  </Typography>
                </Box>
              ) : (
                <List dense={isMobile}>
                  {filteredHistory.map((visit) => (
                    <ListItem
                      key={visit.VisitId}
                      sx={{
                        border: '1px solid',
                        borderColor: visit.InTime ? 'success.light' : 'warning.light',
                        borderRadius: 1,
                        mb: 1,
                        backgroundColor: visit.InTime ? 'success.light' : 'warning.light',
                      }}
                    >
                      <ListItemIcon>
                        <Avatar sx={{ 
                          bgcolor: visit.InTime ? 'success.main' : 'warning.main',
                          width: 40, height: 40 
                        }}>
                          {visit.Name?.charAt(0) || 'E'}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" fontWeight="medium">
                            {visit.Name}
                            <Chip 
                              label={visit.InTime ? "Returned" : "Out"} 
                              color={visit.InTime ? "success" : "warning"}
                              size="small" 
                              sx={{ ml: 1 }}
                            />
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              {visit.EmpId} • {format(parseISO(visit.OutTime), "MMM dd, hh:mm a")}
                            </Typography>
                            <Typography variant="caption" display="block" fontWeight="medium">
                              {visit.Purpose}
                            </Typography>
                            {visit.InTime && (
                              <Typography variant="caption" display="block">
                                Returned: {format(parseISO(visit.InTime), "hh:mm a")}
                              </Typography>
                            )}
                            {visit.Remarks && (
                              <Typography variant="caption" display="block" fontStyle="italic">
                                {visit.Remarks}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <Box sx={{ 
      pb: isMobile ? 7 : 3,
      backgroundColor: "#f5f5f5", 
      minHeight: "100vh" 
    }}>
      
      {/* Main Content */}
      <Box sx={{ p: isMobile ? 1 : 3 }}>
        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Desktop Tabs */}
        {!isMobile && (
          <Tabs
            value={currentTab}
            onChange={(event, newValue) => setCurrentTab(newValue)}
            sx={{ mb: 3 }}
          >
            <Tab label="Mark Out" />
            <Tab label={`Currently Out (${activeVisits.length})`} />
            <Tab label="History" />
          </Tabs>
        )}

        {/* Content */}
        {renderTabContent()}
      </Box>

      {/* Mobile Bottom Navigation */}
      {isMobile && <MobileBottomNav />}
      
      {/* Quick Action FAB */}
      {isMobile && activeVisits.length > 0 && <QuickActionFab />}
      
      {/* Quick Actions Drawer */}
      {isMobile && <QuickActionsDrawer />}
    </Box>
  )
}

// Badge component for mobile navigation
const Badge = ({ badgeContent, color, children }) => (
  <Box sx={{ position: 'relative' }}>
    {children}
    {badgeContent > 0 && (
      <Box
        sx={{
          position: 'absolute',
          top: -8,
          right: -8,
          backgroundColor: color === 'warning' ? '#ed6c02' : '#1976d2',
          color: 'white',
          borderRadius: '50%',
          width: 20,
          height: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.75rem',
          fontWeight: 'bold',
        }}
      >
        {badgeContent > 9 ? '9+' : badgeContent}
      </Box>
    )}
  </Box>
)

export default EmployeeVisitManagement