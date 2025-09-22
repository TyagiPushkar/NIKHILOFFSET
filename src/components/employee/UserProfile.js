"use client"

import { useState, useEffect, useRef } from "react"
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Grid,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  CircularProgress,
  IconButton,
  Fade,
  Slide,
  useTheme,
  useMediaQuery,
  Divider,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import { useAuth } from "../auth/AuthContext"
import axios from "axios"
import {
  Lock as LockIcon,
  Badge as BadgeIcon,
  Email as EmailIcon,
  Work as WorkIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Cake as CakeIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material"

// Styled components for custom UI elements
const ProfileCard = styled(Paper)(({ theme }) => ({
  position: "relative",
  overflow: "hidden",
  borderRadius: 16,
  background: "rgba(255, 255, 255, 0.9)",
  backdropFilter: "blur(10px)",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0 15px 35px rgba(0, 0, 0, 0.15)",
  },
}))

const ProfileHeader = styled(Box)(({ theme }) => ({
  position: "relative",
  height: 200,
  background: "linear-gradient(135deg, #344C7D, #344C7D)",
  borderRadius: "16px 16px 0 0",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "url('/profile-pattern.png')",
    backgroundSize: "cover",
    opacity: 0.2,
  },
}))

const AvatarContainer = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: 50,
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 10,
  transition: "transform 0.3s ease",
  "&:hover": {
    transform: "translateX(-50%) scale(1.05)",
  },
}))

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  border: "5px solid white",
  boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)",
  transition: "all 0.3s ease",
}))

const InfoItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1.5),
  borderRadius: 8,
  background: "rgba(0, 0, 0, 0.02)",
  transition: "background 0.2s ease",
  "&:hover": {
    background: "rgba(0, 0, 0, 0.04)",
  },
}))

const GradientButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(45deg, #EA4096, #EA4096)",
  color: "white",
  borderRadius: 30,
  padding: "10px 25px",
  fontWeight: 600,
  textTransform: "none",
  boxShadow: "0 4px 10px rgba(245, 124, 0, 0.3)",
  transition: "all 0.3s ease",
  "&:hover": {
    background: "linear-gradient(45deg, #344C7D, #344C7D)",
    boxShadow: "0 6px 15px rgba(245, 124, 0, 0.4)",
    transform: "translateY(-2px)",
  },
}))

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 8,
    transition: "all 0.2s ease",
    "&.Mui-focused": {
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "#344C7D",
        borderWidth: 2,
      },
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#344C7D",
    },
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#344C7D",
  },
}))

const UserProfile = () => {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [animateIn, setAnimateIn] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const avatarRef = useRef(null)

  // Mock additional user data (replace with actual data from your API)
  const additionalUserData = {
    position: "Senior Developer",
    location: "New York, USA",
    phone: "+1 (555) 123-4567",
    birthday: "January 15, 1990",
    joinDate: "March 10, 2020",
  }

  useEffect(() => {
    // Trigger animations after component mounts
    setAnimateIn(true)

    // Optional: Add 3D tilt effect to avatar on mouse move
    const avatarElement = avatarRef.current
    if (avatarElement && !isMobile) {
      const handleMouseMove = (e) => {
        const rect = avatarElement.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const centerX = rect.width / 2
        const centerY = rect.height / 2
        const tiltX = (y - centerY) / 10
        const tiltY = (centerX - x) / 10

        avatarElement.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`
      }

      const handleMouseLeave = () => {
        avatarElement.style.transform = "perspective(1000px) rotateX(0) rotateY(0)"
      }

      avatarElement.addEventListener("mousemove", handleMouseMove)
      avatarElement.addEventListener("mouseleave", handleMouseLeave)

      return () => {
        avatarElement.removeEventListener("mousemove", handleMouseMove)
        avatarElement.removeEventListener("mouseleave", handleMouseLeave)
      }
    }
  }, [isMobile])

  const handleOpen = () => {
    setOpen(true)
    setCurrentPassword("")
    setNewPassword("")
    setError("")
    setSuccess("")
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      setError("Please fill in all fields")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await axios.post("https://namami-infotech.com/NIKHILOFFSET/src/auth/change_password.php", {
        EmpId: user?.emp_id,
        currentPassword,
        newPassword,
      })

      if (response.data.success) {
        setSuccess(response.data.message || "Password changed successfully!")
        setTimeout(() => {
          handleClose()
        }, 2000)
      } else {
        setError(response.data.message || "Failed to change password")
      }
    } catch (err) {
      console.error("Password change error:", err)
      setError("Failed to change password. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        padding: { xs: 2, md: 4 },
        background: "#ffffff",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            "radial-gradient(circle at 25% 25%, rgba(255, 152, 0, 0.05) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(245, 124, 0, 0.05) 0%, transparent 50%)",
          pointerEvents: "none",
        },
      }}
    >
      <Fade in={animateIn} timeout={800}>
        <Box
          sx={{
            maxWidth: 1000,
            margin: "0 auto",
            position: "relative",
            zIndex: 1,
          }}
        >
          <ProfileCard>
            <ProfileHeader />

            <AvatarContainer>
              <Box ref={avatarRef} sx={{ transition: "transform 0.3s ease" }}>
                <StyledAvatar src={user?.image || "/placeholder-avatar.png"} alt={user?.username || "User"} />
              </Box>
            </AvatarContainer>

            <Box sx={{ pt: 10, px: 4, pb: 4, textAlign: "center" }}>
              <Slide direction="up" in={animateIn} timeout={1000}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    mb: 1,
                    background: "linear-gradient(45deg, #333, #666)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {user?.username || "User Name"}
                </Typography>
              </Slide>

              <Slide direction="up" in={animateIn} timeout={1200}>
                <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
                  {user.designation || "Position"}
                </Typography>
              </Slide>

              <Divider sx={{ my: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Slide direction="right" in={animateIn} timeout={1300}>
                    <Box>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, textAlign: "left" }}>
                        Personal Information
                      </Typography>

                      <InfoItem>
                        <BadgeIcon sx={{ color: "#344C7D", mr: 2 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Employee ID
                          </Typography>
                          <Typography variant="body1" fontWeight={500}>
                            {user?.emp_id || "N/A"}
                          </Typography>
                        </Box>
                      </InfoItem>

                      

                     
                    </Box>
                  </Slide>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Slide direction="left" in={animateIn} timeout={1400}>
                    <Box>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, textAlign: "left" }}>
                        Work Information
                      </Typography>

                      <InfoItem>
                        <EmailIcon sx={{ color: "#344C7D", mr: 2 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Email Address
                          </Typography>
                          <Typography variant="body1" fontWeight={500}>
                            {user?.email || "N/A"}
                          </Typography>
                        </Box>
                      </InfoItem>
                    </Box>
                  </Slide>
                </Grid>
              </Grid>

              <Box sx={{ mt: 6, display: "flex", justifyContent: "center" }}>
                <Fade in={animateIn} timeout={1600}>
                  <GradientButton startIcon={<LockIcon />} onClick={handleOpen} size="large">
                    Change Password
                  </GradientButton>
                </Fade>
              </Box>
            </Box>
          </ProfileCard>
        </Box>
      </Fade>

      {/* Password Change Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
            overflow: "hidden",
          },
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(45deg, #344C7D, #344C7D)",
            color: "white",
            py: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <LockIcon sx={{ mr: 1 }} />
            Change Password
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 3, pb: 1 }}>
          <Box sx={{ position: "relative", mb: 2 }}>
            <StyledTextField
              autoFocus
              margin="dense"
              label="Current Password"
              type={showCurrentPassword ? "text" : "password"}
              fullWidth
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => setShowCurrentPassword(!showCurrentPassword)} edge="end">
                    {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                ),
              }}
            />
          </Box>

          <Box sx={{ position: "relative", mb: 2 }}>
            <StyledTextField
              margin="dense"
              label="New Password"
              type={showNewPassword ? "text" : "password"}
              fullWidth
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                    {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                ),
              }}
            />
          </Box>

          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
              <CircularProgress size={28} sx={{ color: "#344C7D" }} />
            </Box>
          )}

          {error && (
            <Typography
              color="error"
              variant="body2"
              sx={{
                mt: 1,
                p: 1,
                borderRadius: 1,
                bgcolor: "rgba(211, 47, 47, 0.1)",
              }}
            >
              {error}
            </Typography>
          )}

          {success && (
            <Typography
              color="success.main"
              variant="body2"
              sx={{
                mt: 1,
                p: 1,
                borderRadius: 1,
                bgcolor: "rgba(76, 175, 80, 0.1)",
              }}
            >
              {success}
            </Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={handleClose}
            sx={{
              color: "#666",
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 500,
            }}
          >
            Cancel
          </Button>

          <GradientButton
            onClick={handleChangePassword}
            disabled={loading || !currentPassword || !newPassword}
            sx={{ px: 3 }}
          >
            Update Password
          </GradientButton>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default UserProfile
