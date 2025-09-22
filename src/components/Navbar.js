"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "./auth/AuthContext"
import { useNavigate, useLocation, Link } from "react-router-dom"
import {
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Badge,
  Tooltip,
  InputBase,
  alpha,
  Divider,
  useMediaQuery,
  useTheme,
  Paper,
} from "@mui/material"
import {
  Notifications,
  Menu as MenuIcon,
  Search as SearchIcon,
  Settings,
  Help,
  ChevronRight,
  Dashboard,
} from "@mui/icons-material"
import HRSmileLogo from "../assets/images (1).png"

function Navbar({ onMenuToggle, sidebarOpen }) {
  const [anchorEl, setAnchorEl] = useState(null)
  const [notificationEl, setNotificationEl] = useState(null)
  const [greeting, setGreeting] = useState("")
  const [searchFocused, setSearchFocused] = useState(false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const isTablet = useMediaQuery(theme.breakpoints.down("md"))

  // Mock notifications for demo
  const notifications = [
    // { id: 1, text: "New tender application submitted", read: false, time: "10 min ago" },
    // { id: 2, text: "Your profile was updated", read: true, time: "1 hour ago" },
    // { id: 3, text: "New directory entry added", read: false, time: "3 hours ago" },
  ]

  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) {
      setGreeting("Good Morning")
    } else if (hour < 18) {
      setGreeting("Good Afternoon")
    } else {
      setGreeting("Good Evening")
    }
  }, [])

  const handleMenu = (event) => setAnchorEl(event.currentTarget)
  const handleClose = () => setAnchorEl(null)
  const handleProfile = () => {
    setAnchorEl(null)
    navigate("/profile")
  }
  const handleLogout = () => {
    logout()
    navigate("/")
  }
  
  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileDrawerOpen(!mobileDrawerOpen)
    } else if (onMenuToggle) {
      onMenuToggle()
    }
  }

  const handleNotificationOpen = (event) => setNotificationEl(event.currentTarget)
  const handleNotificationClose = () => setNotificationEl(null)
  const handleNotificationClick = (id) => {
    // Handle notification click - mark as read, navigate, etc.
    handleNotificationClose()
    navigate("/notification")
  }

  const drawer = (
    <Box sx={{ width: 280, height: "100%", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 2,
          borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <img
            src={HRSmileLogo || "/placeholder.svg"}
            alt="Logo"
            style={{ width: 40, height: "auto", marginRight: 12 }}
          />
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#333" }}>
            Dashboard
          </Typography>
        </Box>
        <IconButton onClick={handleDrawerToggle} sx={{ color: "#666" }}>
          <ChevronRight />
        </IconButton>
      </Box>

      <List sx={{ flexGrow: 1, px: 1 }}>
        <ListItem
          button
          component={Link}
          to="/dashboard"
          selected={location.pathname === "/dashboard"}
          sx={{
            borderRadius: "10px",
            mb: 1,
            color: location.pathname === "/dashboard" ? "#344C7D" : "#666",
            backgroundColor: location.pathname === "/dashboard" ? "rgba(246, 147, 32, 0.08)" : "transparent",
            "&:hover": {
              backgroundColor: location.pathname === "/dashboard" ? "rgba(246, 147, 32, 0.12)" : "rgba(0, 0, 0, 0.04)",
            },
            transition: "all 0.2s ease",
          }}
        >
          <Dashboard
            sx={{
              mr: 2,
              color: "inherit",
              fontSize: "1.2rem",
            }}
          />
          <ListItemText
            primary="Dashboard"
            primaryTypographyProps={{
              fontWeight: location.pathname === "/dashboard" ? 600 : 500,
            }}
          />
        </ListItem>

        <ListItem
          button
          component={Link}
          to="/notification"
          selected={location.pathname === "/notification"}
          sx={{
            borderRadius: "10px",
            mb: 1,
            color: location.pathname === "/notification" ? "#344C7D" : "#666",
            backgroundColor: location.pathname === "/notification" ? "rgba(246, 147, 32, 0.08)" : "transparent",
            "&:hover": {
              backgroundColor:
                location.pathname === "/notification" ? "rgba(246, 147, 32, 0.12)" : "rgba(0, 0, 0, 0.04)",
            },
            transition: "all 0.2s ease",
          }}
        >
          <Notifications
            sx={{
              mr: 2,
              color: "inherit",
              fontSize: "1.2rem",
            }}
          />
          <ListItemText
            primary="Notifications"
            primaryTypographyProps={{
              fontWeight: location.pathname === "/notification" ? 600 : 500,
            }}
          />
          {unreadCount > 0 && (
            <Box
              sx={{
                minWidth: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: "#344C7D",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem",
                fontWeight: "bold",
                ml: 1,
              }}
            >
              {unreadCount}
            </Box>
          )}
        </ListItem>
      </List>

      {user && (
        <Box
          sx={{
            p: 2,
            borderTop: "1px solid rgba(0, 0, 0, 0.08)",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Avatar
            src={user.image}
            sx={{
              width: 40,
              height: 40,
              bgcolor: user.image ? "transparent" : "rgba(246, 147, 32, 0.2)",
              color: "#344C7D",
              fontWeight: "bold",
              fontSize: "1rem",
            }}
          >
            {!user.image && (user.username ? user.username.charAt(0).toUpperCase() : "U")}
          </Avatar>
          <Box sx={{ ml: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#333" }}>
              {user.username || "User"}
            </Typography>
            <Typography variant="caption" sx={{ color: "#666" }}>
              {user.role || "User Role"}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  )

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "#ffffff",
          borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
          backdropFilter: "blur(20px)",
          transition: "all 0.3s ease",
          width: { xs: '100%', sm: sidebarOpen ? `calc(100% - 240px)` : `calc(100% - 80px)` },
          marginLeft: { xs: 0, sm: sidebarOpen ? 240 : 80 },
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "flex-end", px: { xs: 1, sm: 2 } }}>
          <Box sx={{ display: "flex", alignItems: "center", mr: "auto" }}>
            {isMobile && (
              <IconButton
                onClick={handleDrawerToggle}
                sx={{
                  mr: 1,
                  color: "#666",
                  "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
                }}
              >
                <MenuIcon />
              </IconButton>
            )}

            <Typography
              variant="h6"
              sx={{
                color: "#333",
                fontWeight: 500,
                fontSize: { xs: "0.9rem", sm: "1.1rem" },
                display: "flex",
                alignItems: "center",
              }}
            >
              <span style={{ fontWeight: 600 }}>{greeting}</span>
              <span style={{ marginLeft: 4 }}>{user ? user.username : "Guest"}!</span>
            </Typography>
          </Box>

          {!isMobile && (
            <Paper
              component="form"
              elevation={0}
              sx={{
                display: "flex",
                alignItems: "center",
                width: { sm: 180, md: 220 },
                borderRadius: "20px",
                px: 2,
                py: 0.5,
                ml: 2,
                mr: 2,
                border: "1px solid",
                borderColor: searchFocused ? "#344C7D" : "rgba(0, 0, 0, 0.08)",
                backgroundColor: searchFocused ? alpha("#344C7D", 0.04) : "rgba(0, 0, 0, 0.02)",
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: alpha("#344C7D", 0.02),
                },
              }}
            >
              <SearchIcon sx={{ color: searchFocused ? "#344C7D" : "#999", mr: 1 }} />
              <InputBase
                placeholder="Search..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                sx={{
                  flex: 1,
                  fontSize: "0.9rem",
                  "& .MuiInputBase-input": {
                    padding: "6px 0",
                  },
                }}
              />
            </Paper>
          )}

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Tooltip title="Notifications">
              <IconButton
                onClick={handleNotificationOpen}
                sx={{
                  color: "#666",
                  "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
                }}
              >
                <Badge badgeContent={unreadCount} color="primary">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title="Account settings">
              <IconButton
                onClick={handleMenu}
                sx={{
                  ml: 1,
                  color: "#666",
                  "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: "rgba(246, 147, 32, 0.2)",
                    color: "#344C7D",
                    fontWeight: "bold",
                    fontSize: "0.9rem",
                  }}
                >
                  {user && user.username ? user.username.charAt(0).toUpperCase() : "U"}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileDrawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 280,
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: sidebarOpen ? 240 : 80,
            transition: theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: "hidden",
          },
        }}
        open
      >
        {drawer}
      </Drawer>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationEl}
        open={Boolean(notificationEl)}
        onClose={handleNotificationClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 300,
            maxWidth: 400,
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          },
        }}
      >
        <Box sx={{ py: 1, px: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Notifications
          </Typography>
        </Box>
        <Divider />
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => handleNotificationClick(notification.id)}
              sx={{ py: 1.5, borderBottom: "1px solid rgba(0,0,0,0.06)" }}
            >
              <Box>
                <Typography variant="body2" sx={{ fontWeight: notification.read ? 400 : 600 }}>
                  {notification.text}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {notification.time}
                </Typography>
              </Box>
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>
            <Typography variant="body2" sx={{ color: "text.secondary", py: 2 }}>
              No notifications
            </Typography>
          </MenuItem>
        )}
      </Menu>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 180,
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          },
        }}
      >
        <MenuItem onClick={handleProfile}>
          <Avatar sx={{ width: 24, height: 24, mr: 1.5, fontSize: "0.8rem" }}>
            {user && user.username ? user.username.charAt(0).toUpperCase() : "U"}
          </Avatar>
          Profile
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <Settings sx={{ mr: 1.5, fontSize: "1.2rem" }} />
          Settings
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <Help sx={{ mr: 1.5, fontSize: "1.2rem" }} />
          Help
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
          Logout
        </MenuItem>
      </Menu>
    </>
  )
}

export default Navbar