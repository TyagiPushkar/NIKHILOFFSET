import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  Grid,
  Box,
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
import { useNavigate, useParams } from "react-router-dom";

function EditDraftLOA() {
  const { ActivityId } = useParams();
  console.log("Activity ID:", ActivityId);
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

  const getType = (typeId) => {
    const type = types.find((t) => t.TypeId === typeId);
    return type ? type.Type.trim() : "Unknown";
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

        if (ActivityId) {
          const transRes = await axios.get(
            `https://namami-infotech.com/NIKHILOFFSET/src/menu/get_transaction_dtl.php?activityId=${ActivityId}`,
          );

          const existingData = {};
          for (const item of transRes.data.data) {
            const chkId = item.ChkId.toString();
            const value = item.Value;

            const cp = checkpointRes.data.data.find(
              (c) => c.CheckpointId === item.ChkId,
            );
            const type = typeRes.data.data
              .find((t) => t.TypeId === cp?.TypeId)
              ?.Type.toLowerCase();

            if (!cp || !type) continue;

            let finalValue = value;

            if (type === "checkbox") {
              finalValue = value ? value.split(",") : [];
            }

            existingData[chkId] = finalValue;

            console.log(
              `Loaded value for CheckpointId ${chkId} (${cp.Description}) [type: ${type}]:`,
              finalValue,
            );
          }

          setFormData(existingData);
        }
      } catch (err) {
        console.error("Error loading data:", err);
      }
    };

    fetchData();
  }, [ActivityId]);

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

      const submitData = async () => {
        const textData = {};
        const imageData = {};

        for (const cp of checkpoints) {
          const id = cp.CheckpointId.toString();
          const type = getType(cp.TypeId).toLowerCase();
          const value = formData[id];

          if (type === "pic/camera") {
            if (value && typeof value === "object") {
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
          // ✅ Use update_transaction.php instead of add_transaction.php
          await axios.post(
            "https://namami-infotech.com/NIKHILOFFSET/src/menu/update_transaction.php",
            {
              menuId,
              ActivityId,
              LatLong: latLong,
              // DateTime: dateTime,
              Draft: isDraft ? 1 : 0,
              data: textData,
            },
          );

          if (Object.keys(imageData).length > 0) {
            await axios.post(
              "https://namami-infotech.com/NIKHILOFFSET/src/menu/add_image.php",
              {
                menuId,
                ActivityId,
                LatLong: latLong,
                // DateTime: dateTime,
                data: imageData,
              },
            );
          }

          Swal.fire(
            "Success",
            isDraft
              ? "Draft updated successfully!"
              : "Form updated successfully!",
            "success",
          );
          navigate("/loa");
        } catch (err) {
          console.error("Update error:", err);
          Swal.fire("Error", "Update failed", "error");
        }
      };

      submitData();
    });
  };

  const renderField = (cp) => {
    const type = getType(cp.TypeId).toLowerCase();
    const id = cp.CheckpointId.toString();
    const value = formData[id] || (type === "checkbox" ? [] : "");
    const options = cp.Options ? cp.Options.split(",") : [];
    const error = errors[id];
    const editable = cp.Editable === 1;

    if (type.includes("header")) {
      return (
        <Typography variant="h6" align="center">
          {cp.Description}
        </Typography>
      );
    }

    if (type.includes("description")) {
      return <Typography>{cp.Description}</Typography>;
    }

    return (
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={4}>
          <Typography>{cp.Description}</Typography>
        </Grid>
        <Grid item xs={8}>
          {(() => {
            switch (type) {
              case "text":
                return (
                  <TextField
                    fullWidth
                    type="text"
                    value={value}
                    onChange={(e) => handleChange(id, e.target.value)}
                    error={error}
                    helperText={error ? "Required" : ""}
                    disabled={!editable}
                  />
                );
              case "email":
                return (
                  <TextField
                    fullWidth
                    type="email"
                    value={value}
                    onChange={(e) => handleChange(id, e.target.value)}
                    error={error}
                    helperText={error ? "Required" : ""}
                    disabled={!editable}
                  />
                );
              case "digit":
                return (
                  <TextField
                    fullWidth
                    type="number"
                    value={value}
                    onChange={(e) => handleChange(id, e.target.value)}
                    error={error}
                    helperText={error ? "Required" : ""}
                    disabled={!editable}
                  />
                );
              case "number":
                return (
                  <TextField
                    fullWidth
                    type="number"
                    value={value}
                    onChange={(e) => handleChange(id, e.target.value)}
                    error={error}
                    helperText={error ? "Required" : ""}
                    disabled={!editable}
                  />
                );
              case "long text":
                return (
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={value}
                    onChange={(e) => handleChange(id, e.target.value)}
                    error={error}
                    helperText={error ? "Required" : ""}
                    disabled={!editable}
                  />
                );
              case "date":
                return (
                  <TextField
                    fullWidth
                    type="date"
                    value={value}
                    onChange={(e) => handleChange(id, e.target.value)}
                    error={error}
                    helperText={error ? "Required" : ""}
                    disabled={!editable}
                  />
                );
              case "dropdown":
  const isMulti = cp.Correct === "1";

  return (
    <Autocomplete
      fullWidth
      multiple={isMulti}
      options={options}
      value={
        isMulti
          ? (value ? value.split(",") : [])
          : value || null
      }
      onChange={(event, newValue) => {
        const finalValue = isMulti ? newValue.join(",") : newValue;
        handleChange(id, finalValue);
      }}
      disabled={!editable}
      renderInput={(params) => (
        <TextField
          {...params}
          error={error}
          helperText={error ? "Required" : ""}
        />
      )}
    />
  );

              case "radio":
                return (
                  <>
                    <RadioGroup
                      row
                      value={value}
                      onChange={(e) => handleChange(id, e.target.value)}
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
                    {error && <Typography color="error">Required</Typography>}
                  </>
                );
              case "checkbox":
                return (
                  <FormGroup row>
                    {options.map((opt) => (
                      <FormControlLabel
                        key={opt}
                        control={
                          <Checkbox
                            checked={value.includes(opt)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              const newValue = checked
                                ? [...value, opt]
                                : value.filter((v) => v !== opt);
                              handleChange(id, newValue);
                            }}
                            disabled={!editable}
                          />
                        }
                        label={opt}
                      />
                    ))}
                  </FormGroup>
                );
              case "pic/camera":
                return (
                  <>
                    {typeof value === "string" && value.startsWith("http") && (
                      <Box sx={{ mb: 1 }}>
                        <img
                          src={value}
                          alt="Uploaded"
                          style={{ width: 200, borderRadius: 4 }}
                        />
                      </Box>
                    )}
                    <TextField
                      fullWidth
                      type="file"
                      inputProps={{ accept: "image/*" }}
                      onChange={(e) => handleChange(id, e.target.files[0])}
                      disabled={!editable}
                    />
                  </>
                );

              default:
                return <TextField disabled size="small" />;
            }
          })()}
        </Grid>
      </Grid>
    );
  };

  const pageData = pages[currentPage];

  const handleNext = () => setCurrentPage((prev) => prev + 1);
  const handlePrevious = () => setCurrentPage((prev) => prev - 1);

  return (
    <Box sx={{ mt: 2, px: 1 }}>
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
        <Typography variant="h5">Tender Application Form</Typography>
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

        const bgColor = index % 2 === 0 ? "#f0f0f0" : "#dcdcdc";
        return (
          <Box key={id} sx={{ mb: 1 }}>
            <Paper
              elevation={1}
              sx={{
                p: 1,
                mx: "auto",
                maxWidth: "70%",
                backgroundColor: bgColor,
              }}
            >
              {renderField(cp)}
            </Paper>
          </Box>
        );
      })}
<Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 2 }}>
      {currentPage < pages.length - 1 ? (
        <>
          {currentPage > 0 && (
            <Button
              variant="outlined"
              onClick={handlePrevious}
              sx={{ color: "#344C7D", borderColor: "#344C7D",mr:1 }}
            >
              Previous
            </Button>
          )}
          <Button
            variant="contained"
            onClick={handleNext}
            sx={{ backgroundColor: "#344C7D" }}
          >
            Next
          </Button>
        </>
      ) : (
        <>
          {currentPage > 0 && (
            <Button
              variant="outlined"
              onClick={handlePrevious}
              sx={{ color: "#344C7D", borderColor: "#344C7D", mr: 1 }}
            >
              Previous
            </Button>
          )}
          <Button
            variant="contained"
            onClick={() => handleSubmit(true)}
            sx={{ backgroundColor: "#999", mr: 1 }}
          >
            Save Draft
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              const newErrors = {};
              checkpoints.forEach((cp) => {
                const id = cp.CheckpointId.toString();
                const value = formData[id];
                const type = getType(cp.TypeId).toLowerCase();

                if (
                  cp?.Mandatory === 1 &&
                  !["header", "description"].includes(type) &&
                  (value === undefined ||
                    value === "" ||
                    (Array.isArray(value) && value.length === 0))
                ) {
                  newErrors[id] = true;
                }
              });

              if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                Swal.fire(
                  "Missing Fields",
                  "Please fill all required fields",
                  "error",
                );
              } else {
                setErrors({});
                handleSubmit(false);
              }
            }}
            sx={{ backgroundColor: "#344C7D" }}
          >
            Submit
          </Button>
        </>
        )}
        </Box>
    </Box>
  );
}

export default EditDraftLOA;
