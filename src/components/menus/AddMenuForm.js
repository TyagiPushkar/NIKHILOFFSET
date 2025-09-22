import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ListItemText,
  CircularProgress,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";

const AddMenuForm = () => {
  const [formData, setFormData] = useState({
    Cat: "",
    Sub: "",
    Caption: "",
    PageCount: 1,
    CheckpointId: [],
    Active: true,
    Icons: "",
    Verifier: "",
    Approver: "",
    Verifier_Role: "",
    Approver_Role: "",
    SameMenuId: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkpoints, setCheckpoints] = useState([]);
  const [loadingCheckpoints, setLoadingCheckpoints] = useState(false);
  const [menus, setMenus] = useState([]);
  const [catType, setCatType] = useState("New"); // Default to "New" for category type
  const [subType, setSubType] = useState("New"); // Default to "New" for sub-category type

  // Fetch checkpoints on component load
  useEffect(() => {
    const fetchCheckpoints = async () => {
      setLoadingCheckpoints(true);
      try {
        const response = await axios.get(
          "https://namami-infotech.com/NIKHILOFFSET/src/menu/get_checkpoints.php"
        );
        if (response.data.success) {
          setCheckpoints(response.data.data);
        } else {
          alert("Failed to fetch checkpoints.");
        }
      } catch (error) {
        console.error("Error fetching checkpoints:", error);
        alert("An error occurred while fetching checkpoints.");
      } finally {
        setLoadingCheckpoints(false);
      }
    };

    fetchCheckpoints();
  }, []);

  // Fetch existing menus for the dropdown
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await axios.get(
          "https://namami-infotech.com/NIKHILOFFSET/src/menu/get_menu.php"
        );
        if (response.data.success) {
          setMenus(response.data.data);
        } else {
          alert("Failed to fetch menus.");
        }
      } catch (error) {
        console.error("Error fetching menus:", error);
        alert("An error occurred while fetching menus.");
      }
    };

    fetchMenus();
  }, []);

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });
  };

  const incrementPageCount = () => {
    setFormData({
      ...formData,
      PageCount: formData.PageCount + 1,
      CheckpointId: [...formData.CheckpointId, []],
    });
  };

  const decrementPageCount = () => {
    if (formData.PageCount > 1) {
      const updatedCheckpointId = formData.CheckpointId.slice(
        0,
        formData.PageCount - 1
      );
      setFormData({
        ...formData,
        PageCount: formData.PageCount - 1,
        CheckpointId: updatedCheckpointId,
      });
    }
  };

  const handleRemoveCheckpoint = (pageIndex, checkpointId) => {
    const updatedCheckpoints = [...formData.CheckpointId];
    updatedCheckpoints[pageIndex] = updatedCheckpoints[pageIndex].filter(
      (id) => id !== checkpointId
    );
    setFormData({ ...formData, CheckpointId: updatedCheckpoints });
  };

  const handleCheckpointChange = (pageIndex, selectedCheckpoints) => {
    const updatedCheckpoints = [...formData.CheckpointId];
    updatedCheckpoints[pageIndex] = selectedCheckpoints;
    setFormData({
      ...formData,
      CheckpointId: updatedCheckpoints,
    });
  };

  const handleInputChange = (e) => {
  const { name, value } = e.target;
  
  if (name === "Cat" && value === "Existing") {
    // If "Existing" category is selected, automatically fetch SameMenuId
    const selectedMenu = menus.find((menu) => menu.Cat === formData.Cat); // Find the selected menu from the API data
    setFormData({
      ...formData,
      [name]: value,
      SameMenuId: selectedMenu ? selectedMenu.SameMenuId : null, // Set SameMenuId or null if not found
    });
  } else {
    setFormData({ ...formData, [name]: value });
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  // Conditionally set SameMenuId based on the selected category type
  let SameMenuId = null;
  if (formData.Cat === "Existing") {
    SameMenuId = formData.Cat; // Use the SameMenuId from the selected menu
  }

  const formattedCheckpoints = formData.CheckpointId
    .map((page) => page.join(","))
    .join(":");

  try {
    const response = await axios.post(
      "https://namami-infotech.com/NIKHILOFFSET/src/menu/add_menus.php",
      {
        ...formData,
        SameMenuId, // Conditionally include SameMenuId
        Checkpoints: formattedCheckpoints,
        CheckpointId: formattedCheckpoints,
      }
    );

    if (response.data.success) {
      alert("Menu added successfully!");
      setFormData({
        Cat: "",
        Sub: "",
        Caption: "",
        PageCount: 1,
        CheckpointId: [],
        Active: true,
        Icons: "",
        Verifier: "",
        Approver: "",
        Verifier_Role: "",
        Approver_Role: "",
        SameMenuId: formData.SameMenuId, // Reset SameMenuId after submission
      });
      setCatType("New");
      setSubType("New");
      console.log("Category: ", formData.Cat);
console.log("Same Menu ID: ", formData.SameMenuId);

    } else {
      alert(`Failed to add menu: ${response.data.message}`);
    }
  } catch (error) {
    console.error("Error adding menu:", error);
    alert("An error occurred while adding the menu.");
  } finally {
    setIsSubmitting(false);
  }
};


  return (
    <div>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Add Menu
      </Typography>
      <form onSubmit={handleSubmit} style={{ maxWidth: "50%", margin: "0" }}>
        {/* Category */}
        <Box mb={2}>
          <Typography variant="subtitle1">Category</Typography>
          <Box display="flex" alignItems="center">
            <FormControl>
              <InputLabel>Type</InputLabel>
              <Select
                value={catType}
                onChange={(e) => setCatType(e.target.value)}
              >
                <MenuItem value="New">New</MenuItem>
                <MenuItem value="Existing">Existing</MenuItem>
              </Select>
            </FormControl>
            {catType === "New" ? (
              <TextField
                label="Category"
                name="Cat"
                value={formData.Cat}
                onChange={handleInputChange}
                fullWidth
                sx={{ ml: 2 }}
              />
            ) : (
              <FormControl sx={{ ml: 2, width: "100%" }}>
                <InputLabel>Select Category</InputLabel>
                <Select
                  name="Cat"
                  value={formData.Cat}
                  onChange={handleInputChange}
                >
                  {menus.map((menu) => (
                    <MenuItem key={menu.MenuId} value={menu.Cat}>
                      {menu.Cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        </Box>

        {/* Sub-Category */}
        <Box mb={2}>
          <Typography variant="subtitle1">Sub-Category</Typography>
          <Box display="flex" alignItems="center">
            <FormControl>
              <InputLabel>Type</InputLabel>
              <Select
                value={subType}
                onChange={(e) => setSubType(e.target.value)}
                disabled={catType === "New"} // Disable for "New" Category
              >
                <MenuItem value="New">New</MenuItem>
                <MenuItem value="Existing">Existing</MenuItem>
              </Select>
            </FormControl>
            {subType === "New" || catType === "New" ? (
              <TextField
                label="Sub-Category"
                name="Sub"
                value={formData.Sub}
                onChange={handleInputChange}
                fullWidth
                sx={{ ml: 2 }}
              />
            ) : (
              <FormControl sx={{ ml: 2, width: "100%" }}>
                <InputLabel>Select Sub-Category</InputLabel>
                <Select
                  name="Sub"
                  value={formData.Sub}
                  onChange={handleInputChange}
                >
                  {menus
                    .filter((menu) => menu.Cat === formData.Cat)
                    .map((menu) => (
                      <MenuItem key={menu.MenuId} value={menu.Sub}>
                        {menu.Sub}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            )}
          </Box>
        </Box>

        <Box mb={2}>
          <Typography variant="subtitle1">Caption</Typography>
          <TextField
            label="Caption"
            name="Caption"
            value={formData.Caption}
            onChange={handleInputChange}
            fullWidth
            
            sx={{ mt: 1 }}
          />
        </Box>

        <Box mb={2}>
          <Typography variant="subtitle1">Number of Pages</Typography>
          <Box display="flex" alignItems="center">
            <Button onClick={decrementPageCount} disabled={formData.PageCount <= 1}>
              -
            </Button>
            <Typography sx={{ mx: 2 }}>{formData.PageCount}</Typography>
            <Button onClick={incrementPageCount}>+</Button>
          </Box>
        </Box>

        {Array.from({ length: formData.PageCount }, (_, pageIndex) => (
          <Box mb={2} key={pageIndex}>
            <Typography variant="subtitle1">Select Checkpoints for Page {pageIndex + 1}</Typography>
            {loadingCheckpoints ? (
              <CircularProgress size={24} />
            ) : (
              <FormControl fullWidth>
                <InputLabel>Select Checkpoints</InputLabel>
                <Select
                  label="Select Checkpoints"
                  multiple
                  value={formData.CheckpointId[pageIndex] || []}
                  onChange={(e) => handleCheckpointChange(pageIndex, e.target.value)}
                  required
                  renderValue={(selected) =>
                    selected
                      .map((id) => {
                        const checkpoint = checkpoints.find((cp) => cp.CheckpointId === id);
                        return checkpoint ? checkpoint.Description : id;
                      })
                      .join(", ")
                  }
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 200,
                      },
                    },
                  }}
                >
                  {checkpoints.map((checkpoint) => (
                    <MenuItem key={checkpoint.CheckpointId} value={checkpoint.CheckpointId}>
                      <Checkbox
                        checked={(formData.CheckpointId[pageIndex] || []).includes(
                          checkpoint.CheckpointId
                        )}
                      />
                      <ListItemText primary={checkpoint.Description} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Display selected checkpoints with delete button */}
            <Box mt={1}>
              {(formData.CheckpointId[pageIndex] || []).map((checkpointId) => {
                const checkpoint = checkpoints.find(
                  (cp) => cp.CheckpointId === checkpointId
                );
                return (
                  <Box key={checkpointId} display="flex" alignItems="center" mb={1}>
                    <Typography>{checkpoint?.Description}</Typography>
                    <IconButton
                      onClick={() => handleRemoveCheckpoint(pageIndex, checkpointId)}
                      color="secondary"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                );
              })}
            </Box>
          </Box>
        ))}

        {/* Active */}
        <Box mb={2}>
          <Typography variant="subtitle1">Set as Active</Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.Active}
                onChange={handleCheckboxChange}
                name="Active"
              />
            }
            label="Active"
          />
        </Box>

        {/* Submit Button */}
        <Box textAlign="center" mt={3}>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            style={{ backgroundColor: "#344C7D", color: "#fff" }}
          >
            {isSubmitting ? "Adding..." : "Add Menu"}
          </Button>
        </Box>
      </form>
    </div>
  );
};

export default AddMenuForm;
