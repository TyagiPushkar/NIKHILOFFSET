import React, { useState } from "react";
import { AppBar, Toolbar, IconButton, Typography, Drawer, List, ListItem, ListItemIcon, ListItemText, Box, CssBaseline } from "@mui/material";
import { Menu, Home, People, Work, Settings, Logout, Notifications } from "@mui/icons-material";

const drawerWidth = 240;

const HRMSLayout = () => {
  const [open, setOpen] = useState(true);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const menuItems = [
    { text: "Dashboard", icon: <Home /> },
    { text: "Employees", icon: <People /> },
    { text: "Projects", icon: <Work /> },
    { text: "Settings", icon: <Settings /> },
    { text: "Logout", icon: <Logout /> },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      {/* Navbar */}
      <AppBar position="fixed" sx={{ width: open ? `calc(100% - ${drawerWidth}px)` : "100%", ml: open ? `${drawerWidth}px` : 0, transition: "0.3s" }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={toggleDrawer} sx={{ mr: 2 }}>
            <Menu />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            HRMS System
          </Typography>
          <IconButton color="inherit">
            <Notifications />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer variant="permanent" open={open} sx={{
        width: open ? drawerWidth : 60,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: open ? drawerWidth : 60,
          transition: "0.3s",
          overflowX: "hidden",
        },
      }}>
        <Toolbar />
        <List>
          {menuItems.map((item, index) => (
            <ListItem button key={index}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              {open && <ListItemText primary={item.text} />}
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Typography variant="h4">Welcome to HRMS</Typography>
        <Typography>Manage your employees, projects, and HR tasks efficiently.</Typography>
      </Box>
    </Box>
  );
};

export default HRMSLayout;
