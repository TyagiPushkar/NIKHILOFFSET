import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  Alert,
  Autocomplete,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AddContactStation() {
    const navigate = useNavigate();
  const [buyerData, setBuyerData] = useState([]);
  const [form, setForm] = useState({
    Type: "",
    TypeId: "",
    ContactNumber: "",
    ContactPerson: "",
    ContactMail: "",
  });
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const typeOptions = ["Zone", "Division", "Station"];

  useEffect(() => {
    axios
      .get("https://namami-infotech.com/NIKHILOFFSET/src/buyer/buyer_list.php")
      .then((res) => {
        if (res.data.success) {
          setBuyerData(res.data.data);
        }
      });
  }, []);

  const getTypeOptions = () => {
    switch (form.Type) {
      case "Zone":
        return [
          ...new Map(buyerData.map((b) => [b.ZoneID, { id: b.ZoneID, label: `${b.ZoneName} (${b.ZoneID})` }])).values(),
        ];
      case "Division":
        return [
          ...new Map(buyerData.map((b) => [b.DivisionID, { id: b.DivisionID, label: `${b.DivisionName} (${b.DivisionID})` }])).values(),
        ];
      case "Station":
        return [
          ...new Map(buyerData.map((b) => [b.StationID, { id: b.StationID, label: `${b.StationName} (${b.StationID})` }])).values(),
        ];
      default:
        return [];
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const response = await axios.post(
        "https://namami-infotech.com/NIKHILOFFSET/src/buyer/add_contact_station.php",
        form
      );

      if (response.data.success) {
        setSuccessMsg("Contact Station added successfully!");
        setForm({
          Type: "",
          TypeId: "",
          ContactNumber: "",
          ContactPerson: "",
          ContactMail: "",
        });
        navigate("/buyer");
      } else {
        setErrorMsg(response.data.message || "Failed to add contact station.");
      }
    } catch (error) {
      setErrorMsg("API error: Failed to add contact station.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <Box p={3} component={Paper} maxWidth={800} mx="auto">
      <Typography variant="h5" mb={2} fontWeight="bold">
        Add Contact Station
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Autocomplete
            options={typeOptions}
            value={form.Type}
            onChange={(e, value) => setForm({ ...form, Type: value, TypeId: "" })}
            renderInput={(params) => (
              <TextField {...params} label="Select Type" size="small" fullWidth />
            )}
          />
        </Grid>

        {form.Type && (
          <Grid item xs={12}>
            <Autocomplete
              options={getTypeOptions()}
              value={getTypeOptions().find((opt) => opt.id === form.TypeId) || null}
              onChange={(e, value) => setForm({ ...form, TypeId: value?.id || "" })}
              renderInput={(params) => (
                <TextField {...params} label={`Select ${form.Type}`} size="small" fullWidth />
              )}
            />
          </Grid>
        )}


        <Grid item xs={6}>
          <TextField
            name="ContactNumber"
            label="Contact Number"
            value={form.ContactNumber}
            onChange={handleChange}
            fullWidth
            size="small"
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            name="ContactPerson"
            label="Contact Person"
            value={form.ContactPerson}
            onChange={handleChange}
            fullWidth
            size="small"
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            name="ContactMail"
            label="Contact Mail"
            value={form.ContactMail}
            onChange={handleChange}
            fullWidth
            size="small"
          />
        </Grid>
      </Grid>

      {errorMsg && <Alert severity="error" sx={{ mt: 2 }}>{errorMsg}</Alert>}
      {successMsg && <Alert severity="success" sx={{ mt: 2 }}>{successMsg}</Alert>}

      <Box mt={3}>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          style={{ backgroundColor: "#344C7D" }}
        >
          {loading ? "Submitting..." : "Submit"}
        </Button>
      </Box>
    </Box>
  );
}

export default AddContactStation;
