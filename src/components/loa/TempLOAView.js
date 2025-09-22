import React, { useEffect, useState } from "react";
import {
  Typography,
  Paper,
  Box,
  CircularProgress,
  Grid,
  Button,
  Divider,
  Dialog,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../../assets/images (1).png";

function TempLoaView() {
  const { activityId } = useParams();
  const [details, setDetails] = useState([]);
  const [checkpoints, setCheckpoints] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  const loaSection = {
    LOA: [28,29,30,31,32,63,64,65,66,67,68,69,70,71,72,73,81,82],
  };

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [detailsRes, checkpointsRes] = await Promise.all([
          axios.get(
            `https://namami-infotech.com/NIKHILOFFSET/src/menu/get_transaction_dtl.php?activityId=${encodeURIComponent(activityId)}`
          ),
          axios.get(
            `https://namami-infotech.com/NIKHILOFFSET/src/menu/get_checkpoints.php`
          ),
        ]);

        if (detailsRes.data.success && checkpointsRes.data.success) {
          const checkpointMap = {};
          checkpointsRes.data.data.forEach((cp) => {
            checkpointMap[cp.CheckpointId] = cp.Description;
          });
          setCheckpoints(checkpointMap);
          setDetails(detailsRes.data.data);
        } else {
          setError("No details or checkpoints found.");
        }
      } catch (err) {
        setError("Failed to fetch LOA details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [activityId]);

  const isFileUrl = (value) =>
    typeof value === "string" &&
    value.startsWith("https://namami-infotech.com/");
  
  const isImageFile = (url) =>
    /\.(jpeg|jpg|png|gif)$/i.test(url.split("?")[0]);
  
  const getLabel = (chkId) => {
    if (chkId.includes("_")) {
      const [parent, child] = chkId.split("_").map(Number);
      const parentLabel = checkpoints[parent] || `Checkpoint #${parent}`;
      const childLabel = checkpoints[child] || `Checkpoint #${child}`;
      return `${childLabel} of ${parentLabel}`;
    }
    return checkpoints[chkId] || `Checkpoint #${chkId}`;
  };
  
  const renderSection = (title, checkpointIds) => {
    const sectionData = details.filter((item) => {
      const chkId = item.ChkId;
      const parsedChkId = chkId.includes("_")
        ? parseInt(chkId.split("_")[0])
        : parseInt(chkId);
      return checkpointIds.includes(parsedChkId);
    });
  
    if (sectionData.length === 0) return null;
  
    return (
      <Box key={title} sx={{ mb: 5 }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ color: "#344C7D", fontWeight: 700 }}
        >
          {title}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          {sectionData.map((item, index) => {
            const value = item.Value;
            const label = getLabel(item.ChkId);
  
            return (
              <Grid item xs={12} sm={3} key={index}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {label}
                </Typography>
                {isFileUrl(value) ? (
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ mt: 1 }}
                    onClick={() => window.open(value, "_blank")}
                  >
                    View
                  </Button>
                ) : (
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {value || "—"}
                  </Typography>
                )}
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  };
  

  if (loading) return <CircularProgress sx={{ mt: 5 }} />;
  if (error)
    return (
      <Typography color="error" sx={{ mt: 3 }}>
        {error}
      </Typography>
    );

  return (
    <Box sx={{ p: 2, background: "#fff", pb: 10 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => navigate(-1)}
            sx={{ color: "#344C7D", borderColor: "#344C7D" }}
          >
            Back
          </Button>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#344C7D" }}>
               Letter Of Allotment
            </Typography>
            <Typography variant="subtitle1">LOA Form Details</Typography>
          </Box>
        </Box>
        <img src={logo} alt="College Logo" />
      </Box>

      {/* Main Paper */}
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 4 }}>
        {Object.entries(loaSection).map(([sectionTitle, ids]) =>
          renderSection(sectionTitle, ids)
        )}
      </Paper>

      {/* Footer Buttons */}
     <Box
             sx={{
               position: "fixed",
               bottom: 0,
               left: 0,
               right: 0,
               p: 2,
               display: "flex",
               justifyContent: "flex-end",
               gap: "100px",
               backgroundColor: "#fff",
               boxShadow: "0 -2px 8px rgba(0,0,0,0.05)",
               zIndex: 1000,
             }}
           >
             
             <Button
               variant="contained"
               sx={{ backgroundColor: "#344C7D" }}
               onClick={() => navigate(`/tender/view/${activityId}`)}
             >
               Tender
             </Button>
           </Box>
         </Box>
  );
}

export default TempLoaView;
