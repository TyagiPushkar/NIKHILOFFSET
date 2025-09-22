// BuyerForm.js
import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  Alert,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AddNewParticipant() {
  const [form, setForm] = useState({
    CompanyName: "",
    ContactPerson: "",
    Mobile: "",
    Mail: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
  if (!form.CompanyName || !form.ContactPerson || !form.Mobile || !form.Mail) {
    setErrorMsg("Please fill in all required fields.");
    return;
  }

  // Proceed with API call
  setLoading(true);
  setSuccessMsg("");
  setErrorMsg("");

  try {
    const response = await axios.post(
      "https://namami-infotech.com/NIKHILOFFSET/src/participant/add_participant.php",
      form
    );

    if (response.data.success) {
      setSuccessMsg("Participant added successfully!");
      setTimeout(() => navigate("/participant"), 1000);
    } else {
      setErrorMsg(response.data.message || "Failed to add buyer.");
    }
  } catch (error) {
    setErrorMsg("API error: Failed to add buyer.");
  } finally {
    setLoading(false);
  }
};


  return (
    <Box p={3} component={Paper} maxWidth={600} mx="auto">
      <Typography variant="h5" mb={2} fontWeight="bold">
        Add New Participant
      </Typography>

      <Grid container spacing={2}>
        {[
          { name: "CompanyName", label: "Company Name" },
          { name: "ContactPerson", label: "Contact Person" },
          { name: "Mobile", label: "Mobile" },
          { name: "Mail", label: "Mail" }
        ].map((field) => (
          <Grid item xs={12} sm={6} key={field.name}>
            <TextField
  fullWidth
  name={field.name}
  label={field.label}
  value={form[field.name]}
  onChange={handleChange}
  size="small"
  required
/>

          </Grid>
        ))}
      </Grid>

      {errorMsg && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {errorMsg}
        </Alert>
      )}
      {successMsg && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {successMsg}
        </Alert>
      )}

      <Box mt={3}>
        <Button
          variant="contained"
          disabled={loading}
          onClick={handleSubmit}
          style={{ backgroundColor: "#344C7D" }}
        >
          {loading ? "Submitting..." : "Submit"}
        </Button>
      </Box>
    </Box>
  );
}

export default AddNewParticipant;
