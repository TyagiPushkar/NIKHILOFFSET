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
} from "@mui/icons-material"
import { format, parseISO, isToday } from "date-fns"
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

const EmployeeVisitManagement = () => {
  const { user } = mockUseAuth()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  
  const [employees, setEmployees] = useState([])
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [visitType, setVisitType] = useState("out")
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

  // Filter employees - only show those who are NOT currently out
  const availableEmployees = employees.filter(employee => 
    !activeVisits.some(visit => visit.EmpId === employee.EmpId && !visit.InTime)
  )

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
        `https://namami-infotech.com/NIKHILOFFSET/src/visit/get_visit_history.php?Tenent_Id=${user.tenent_id}&limit=20`,
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
      setError("Please enter purpose of visit")
      return
    }

    // Additional validation: Prevent marking "out" for employees already out
    if (visitType === "out") {
      const isAlreadyOut = activeVisits.some(visit => 
        visit.EmpId === selectedEmployee.EmpId && !visit.InTime
      )
      if (isAlreadyOut) {
        setError("This employee is already marked as out. Please mark them as 'In' first.")
        return
      }
    }

    // Additional validation: Prevent marking "in" for employees not out
    if (visitType === "in") {
      const isNotOut = !activeVisits.some(visit => 
        visit.EmpId === selectedEmployee.EmpId && !visit.InTime
      )
      if (isNotOut) {
        setError("This employee is not currently marked as out. Please mark them as 'Out' first.")
        return
      }
    }

    setLoading(true)
    setError(null)

    try {
      const visitData = {
        EmpId: selectedEmployee.EmpId,
        VisitType: visitType,
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
        setSuccess(`Visit ${visitType === "out" ? "out" : "in"} recorded successfully!`)
        setPurpose("")
        setRemarks("")
        setSelectedEmployee(null)
        
        // Refresh data
        fetchActiveVisits()
        fetchVisitHistory()
        
        // Switch to appropriate tab
        if (visitType === "out") {
          setCurrentTab(1) // Switch to "Currently Out" tab
        } else {
          setCurrentTab(2) // Switch to "History" tab
        }
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
    setSelectedEmployee({ EmpId: visit.EmpId, Name: visit.Name })
    setVisitType("in")
    setPurpose(`Return from: ${visit.Purpose}`)
    setCurrentTab(0) // Switch back to entry form
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
      <BottomNavigationAction label="Entry" icon={<Add />} />
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
          Quick Actions
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        {activeVisits.slice(0, 5).map((visit) => (
          <Button
            key={visit.VisitId}
            variant="outlined"
            fullWidth
            startIcon={<Login />}
            onClick={() => {
              quickMarkReturn(visit)
              setQuickActionsOpen(false)
            }}
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
      case 0: // Entry Form
        return (
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Add color="primary" />
                Record Visit
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Autocomplete
                    options={visitType === "out" ? availableEmployees : employees}
                    getOptionLabel={(option) => `${option.Name} (${option.EmpId})`}
                    value={selectedEmployee}
                    onChange={(event, newValue) => {
                      setSelectedEmployee(newValue)
                      if (newValue) {
                        const isOut = activeVisits.some(visit => 
                          visit.EmpId === newValue.EmpId && !visit.InTime
                        )
                        setVisitType(isOut ? "in" : "out")
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Employee"
                        variant="outlined"
                        fullWidth
                        size={isMobile ? "small" : "medium"}
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
                    <InputLabel>Visit Type</InputLabel>
                    <Select
                      value={visitType}
                      onChange={(e) => setVisitType(e.target.value)}
                      label="Visit Type"
                    >
                      <MenuItem value="out">
                        <Box display="flex" alignItems="center" gap={1}>
                          <ExitToApp color="warning" />
                          <Typography>Going Out</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="in">
                        <Box display="flex" alignItems="center" gap={1}>
                          <Login color="success" />
                          <Typography>Returning In</Typography>
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Purpose"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={isMobile ? 2 : 3}
                    size={isMobile ? "small" : "medium"}
                    placeholder="e.g., Client meeting, Bank work, Personal work..."
                  />
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
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    size={isMobile ? "medium" : "large"}
                    onClick={handleSubmit}
                    disabled={loading || !selectedEmployee || !purpose.trim()}
                    startIcon={loading ? <CircularProgress size={20} /> : 
                      visitType === "out" ? <ExitToApp /> : <Login />}
                    fullWidth
                    sx={{ py: isMobile ? 1 : 1.5 }}
                  >
                    {loading ? "Processing..." : 
                     `Record ${visitType === "out" ? "Out" : "In"}`}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )

      case 1: // Currently Out
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
                              {format(parseISO(visit.OutTime), "hh:mm a")}
                            </Typography>
                          </Box>
                        }
                      />
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<Login />}
                        onClick={() => quickMarkReturn(visit)}
                      >
                        Return
                      </Button>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        )

      case 2: // History
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Schedule color="primary" />
                Recent History
              </Typography>

              {visitHistory.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Schedule sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography color="text.secondary">
                    No visit history
                  </Typography>
                </Box>
              ) : (
                <List dense={isMobile}>
                  {visitHistory.slice(0, 10).map((visit) => (
                    <ListItem
                      key={visit.VisitId}
                      sx={{
                        border: '1px solid',
                        borderColor: 'grey.200',
                        borderRadius: 1,
                        mb: 1,
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
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              {visit.Purpose}
                            </Typography>
                            <Typography variant="caption" display="block" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <AccessTime fontSize="inherit" />
                              {format(parseISO(visit.OutTime), "hh:mm a")}
                              {/* {visit.InTime && ` → ${format(parseISO(visit.InTime), "hh:mm a"}`} */}
                            </Typography>
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
      pb: isMobile ? 7 : 3, // Add padding for bottom navigation
      backgroundColor: "#f5f5f5", 
      minHeight: "100vh" 
    }}>
      {/* Header */}
      <AppBar position="static" color="primary" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Visit Management
          </Typography>
          <Tooltip title="Refresh">
            <IconButton color="inherit" onClick={refreshData} disabled={loading}>
              {loading ? <CircularProgress size={24} color="inherit" /> : <Refresh />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

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
            <Tab label="New Entry" />
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

      {/* Edit Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => {
          setEditDialogOpen(false)
          setEditingVisit(null)
        }}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Edit color="primary" />
            Edit Visit
          </Box>
        </DialogTitle>
        <DialogContent>
          {editingVisit && (
            <Box sx={{ pt: 2 }}>
              <TextField
                label="Purpose"
                value={editingVisit.Purpose || ''}
                onChange={(e) => setEditingVisit({...editingVisit, Purpose: e.target.value})}
                fullWidth
                multiline
                rows={isMobile ? 3 : 2}
                sx={{ mb: 2 }}
                size={isMobile ? "small" : "medium"}
              />
              <TextField
                label="Remarks"
                value={editingVisit.Remarks || ''}
                onChange={(e) => setEditingVisit({...editingVisit, Remarks: e.target.value})}
                fullWidth
                multiline
                rows={isMobile ? 3 : 2}
                size={isMobile ? "small" : "medium"}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setEditDialogOpen(false)
              setEditingVisit(null)
            }}
            size={isMobile ? "large" : "medium"}
          >
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={() => handleEditVisit(editingVisit.VisitId, {
              Purpose: editingVisit.Purpose,
              Remarks: editingVisit.Remarks
            })}
            size={isMobile ? "large" : "medium"}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
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
        {badgeContent}
      </Box>
    )}
  </Box>
)

export default EmployeeVisitManagement