import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  Grid,
  Box,
  Divider,
  Button,
  TextField,
  Typography,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Autocomplete,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

function LOAForm() {
  const [pages, setPages] = useState([]);
  const [checkpoints, setCheckpoints] = useState([]);
  const [types, setTypes] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const handleChange = (id, value) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => ({ ...prev, [id]: false }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const menuRes = await axios.get(
          "https://namami-infotech.com/NIKHILOFFSET/src/menu/get_menu.php",
        );
        const checkpointRes = await axios.get(
          "https://namami-infotech.com/NIKHILOFFSET/src/menu/get_checkpoints.php",
        );
        const typeRes = await axios.get(
          "https://namami-infotech.com/NIKHILOFFSET/src/menu/get_types.php",
        );

        const checkpointIds = menuRes.data.data[1].CheckpointId.split(";").map(
          (p) => p.split(",").map((id) => parseInt(id)),
        );

        setPages(checkpointIds);
        setCheckpoints(checkpointRes.data.data);
        setTypes(typeRes.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const getType = (typeId) => {
    const type = types.find((t) => t.TypeId === typeId);
    return type ? type.Type.trim() : "Unknown";
  };

  const renderField = (cp) => {
    const type = getType(cp.TypeId).trim();
    const options = cp.Options ? cp.Options.split(",") : [];
    const value = formData[cp.CheckpointId] || "";
    const error = errors[cp.CheckpointId];
    const editable = cp.Editable === 1;

    // Special layout for Header / Description
    if (type.toLowerCase().includes("header")) {
      return (
        <Typography variant="h6" sx={{ mt: 3, mb: 1, textAlign: "center" }}>
          {cp.Description}
        </Typography>
      );
    }

    if (type.toLowerCase().includes("description")) {
      return <Typography sx={{ mb: 2 }}>{cp.Description}</Typography>;
    }

    // Common layout: Label left, Field right
    return (
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={4}>
          <Typography>{cp.Description}</Typography>
        </Grid>
        <Grid item xs={8}>
          {(() => {
            switch (type) {
              case "Text":
                return (
                  <TextField
                    fullWidth
                    type="text"
                    value={value}
                    onChange={(e) =>
                      handleChange(cp.CheckpointId, e.target.value)
                    }
                    error={error}
                    helperText={error ? "This field is required" : ""}
                    disabled={!editable}
                  />
                );

              case "Email":
                return (
                  <TextField
                    fullWidth
                    type="email"
                    value={value}
                    onChange={(e) =>
                      handleChange(cp.CheckpointId, e.target.value)
                    }
                    error={error}
                    helperText={error ? "This field is required" : ""}
                    disabled={!editable}
                  />
                );
              case "Number":
                return (
                  <TextField
                    fullWidth
                    type="number"
                    value={value}
                    onChange={(e) =>
                      handleChange(cp.CheckpointId, e.target.value)
                    }
                    error={error}
                    helperText={error ? "This field is required" : ""}
                    disabled={!editable}
                  />
                );
              case "Digit":
                return (
                  <TextField
                    fullWidth
                    type="number"
                    value={value}
                    onChange={(e) =>
                      handleChange(cp.CheckpointId, e.target.value)
                    }
                    error={error}
                    helperText={error ? "This field is required" : ""}
                    disabled={!editable}
                  />
                );

              case "Long Text":
                return (
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={value}
                    onChange={(e) =>
                      handleChange(cp.CheckpointId, e.target.value)
                    }
                    error={error}
                    helperText={error ? "This field is required" : ""}
                    disabled={!editable}
                  />
                );

              case "Date":
                return (
                  <TextField
                    fullWidth
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={value}
                    onChange={(e) =>
                      handleChange(cp.CheckpointId, e.target.value)
                    }
                    error={error}
                    helperText={error ? "This field is required" : ""}
                    disabled={!editable}
                  />
                );

              case "Dropdown":
  const isMultiSelect = cp.Correct === "1";

  return (
    <Autocomplete
      fullWidth
      multiple={isMultiSelect}
      options={options}
      value={
        isMultiSelect
          ? (value ? value.split(",") : [])
          : value || null
      }
      onChange={(event, newValue) => {
        const finalValue = isMultiSelect ? newValue.join(",") : newValue;
        handleChange(cp.CheckpointId, finalValue);
      }}
      disabled={!editable}
      renderInput={(params) => (
        <TextField
          {...params}
          label=""
          error={error}
          helperText={error ? "This field is required" : ""}
        />
      )}
    />
  );


              case "Radio":
                return (
                  <>
                    <RadioGroup
                      row
                      value={value}
                      onChange={(e) =>
                        handleChange(cp.CheckpointId, e.target.value)
                      }
                    >
                      {options.map((opt) => (
                        <FormControlLabel
                          key={opt}
                          value={opt}
                          control={<Radio disabled={!editable} />}
                          label={opt}
                        />
                      ))}
                    </RadioGroup>
                    {error && (
                      <Typography color="error" variant="body2">
                        This field is required
                      </Typography>
                    )}
                  </>
                );

              case "Checkbox":
                return (
                  <FormGroup row>
                    {options.map((opt) => (
                      <FormControlLabel
                        key={opt}
                        control={
                          <Checkbox
                            checked={value?.includes(opt)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              const updated = checked
                                ? [...(value || []), opt]
                                : (value || []).filter((v) => v !== opt);
                              handleChange(cp.CheckpointId, updated);
                            }}
                            disabled={!editable}
                          />
                        }
                        label={opt}
                      />
                    ))}
                  </FormGroup>
                );

              case "Pic/Camera":
                return (
                  <TextField
                    fullWidth
                    type="file"
                    inputProps={{ accept: "image/png, image/jpeg" }}
                    onChange={(e) =>
                      handleChange(cp.CheckpointId, e.target.files[0])
                    }
                    disabled={!editable}
                  />
                );

              default:
                return <TextField size="small" disabled />;
            }
          })()}
        </Grid>
      </Grid>
    );
  };

  const pageData = pages[currentPage];

  const handleNext = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (isDraft = false) => {
    const menuId = 2;
    const date = new Date();
    const dateTime = date.toISOString().slice(0, 19).replace("T", " ");

    navigator.geolocation.getCurrentPosition((pos) => {
      const latLong = `${pos.coords.latitude}, ${pos.coords.longitude}`;
      const activityId = `${dateTime.replace(/\D/g, "")}_${latLong.replace(/[^0-9]/g, "")}`;

      const submitData = async () => {
        const textData = {};
        const imageData = {};

        for (const cp of checkpoints) {
          const id = cp.CheckpointId.toString();
          const type = getType(cp.TypeId).toLowerCase();
          const value = formData[id];

          if (type === "pic/camera") {
            if (value) {
              const base64 = await convertToBase64(value);
              imageData[id] = base64;
            }
            continue;
          }

          if (
            value === undefined ||
            value === null ||
            (typeof value === "string" && value.trim() === "") ||
            (Array.isArray(value) && value.length === 0)
          ) {
            textData[id] = null;
          } else {
            textData[id] = Array.isArray(value) ? value.join(",") : value;
          }
        }

        try {
          await axios.post(
            "https://namami-infotech.com/NIKHILOFFSET/src/menu/add_transaction.php",
            {
              menuId,
              ActivityId: activityId,
              LatLong: latLong,
              Draft: isDraft ? 1 : 0,
              data: textData,
            },
          );

          if (Object.keys(imageData).length > 0) {
            await axios.post(
              "https://namami-infotech.com/NIKHILOFFSET/src/menu/add_image.php",
              {
                menuId,
                ActivityId: activityId,
                LatLong: latLong,
               
                data: imageData,
              },
            );
          }

          Swal.fire(
            "Success",
            isDraft
              ? "Draft saved successfully!"
              : "Form submitted successfully!",
            "success",
          );
          navigate("/loa");
        } catch (error) {
          console.error("Submission error", error);
          Swal.fire("Error", "Submission failed", "error");
        }
      };

      submitData(); // call the async inner function
    });
  };
const handlePrevious = () => {
  setCurrentPage((prev) => Math.max(prev - 1, 0));
};

  return (
    // Update only styles & spacing for more compact layout:
    <Box sx={{ mt: 1, px: 1 }}>
      <Box
        sx={{
          background: "linear-gradient(to right, #344C7D, #FFC107)",
          color: "white",
          py: 1,
          borderRadius: 1,
          textAlign: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5">Letter Of Allotment Form</Typography>
        <Typography variant="body2">Please complete all sections</Typography>
      </Box>

      <Stepper activeStep={currentPage} alternativeLabel sx={{ mb: 2 }}>
        {pages.map((_, index) => (
          <Step key={index}>
            <StepLabel>Step {index + 1}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {pageData?.map((id, index) => {
        const cp = checkpoints.find((c) => c.CheckpointId === id);
        if (!cp) return null;

        const isEven = index % 2 === 0;
        const bgColor = isEven ? "#f0f0f0" : "#dcdcdc"; // light grey and grey

        return (
          <Box key={id} sx={{ mb: 1 }}>
            <Paper
              elevation={1}
              sx={{
                p: 1,
                borderRadius: 1,
                maxWidth: "70%",
                mx: "auto",
                backgroundColor: bgColor,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                
                <Box sx={{ flexGrow: 1 }}>{renderField(cp)}</Box>
              </Box>
            </Paper>
          </Box>
        );
      })}

      <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 2 }}>
  {currentPage > 0 && (
    <Button
      variant="contained"
      sx={{ backgroundColor: "#1976d2", minWidth: "100px" }}
      onClick={handlePrevious}
    >
      Previous
    </Button>
  )}

  {currentPage === pages.length - 1 ? (
    <>
      <Button
        variant="contained"
        sx={{ backgroundColor: "#999", minWidth: "100px" }}
        onClick={() => handleSubmit(true)} // Save Draft
      >
        Save Draft
      </Button>
      <Button
        variant="contained"
        sx={{ backgroundColor: "#344C7D", minWidth: "100px" }}
        onClick={() => {
          const currentIds = pages[currentPage];
          const newErrors = {};

          currentIds.forEach((id) => {
            const cp = checkpoints.find((c) => c.CheckpointId === id);
            const value = formData[id];
            if (!cp) return;

            const type = getType(cp.TypeId).toLowerCase();
            if (type.includes("header") || type.includes("description")) return;

            if (
              cp.Mandatory === 1 &&
              (value === undefined ||
                value === null ||
                (typeof value === "string" && value.trim() === "") ||
                (Array.isArray(value) && value.length === 0))
            ) {
              newErrors[id] = true;
            }
          });

          if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            Swal.fire({
              icon: "error",
              title: "Missing Required Fields",
              text: "Please fill all mandatory fields before submitting.",
            });
          } else {
            setErrors({});
            handleSubmit(false);
          }
        }}
      >
        Submit
      </Button>
    </>
  ) : (
    <Button
      variant="contained"
      sx={{ backgroundColor: "#344C7D", minWidth: "100px" }}
      onClick={handleNext}
    >
      Next
    </Button>
  )}
</Box>

    </Box>
  );
}

export default LOAForm;
