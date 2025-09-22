import React, { useState, useEffect } from 'react';
import { TextField, Button, Checkbox, FormControlLabel, Typography, MenuItem, Select, InputLabel, FormControl, Box, RadioGroup, Radio,FormControlLabel as RadioFormControlLabel, ListItemText } from '@mui/material';
import axios from 'axios';
import AddIcon from '@mui/icons-material/Add';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
const AddCheckpointForm = () => {
    const [formData, setFormData] = useState({
        Description: '',
        Value: '',
        Options: [''], // Store options as an array of fields
        TypeId: '',
        Mandatory: true,
        Editable: true,
        Correct: '',
        Size: '',
        Score: '',
        Validation: '',
        Language: 0,
        Active: true,
        Dependent: false,
        Logic: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [types, setTypes] = useState([]);

    useEffect(() => {
        // Fetch type data on component load
        axios
            .get('https://namami-infotech.com/NIKHILOFFSET/src/menu/get_types.php')
            .then((response) => {
                if (response.data.success) {
                    setTypes(response.data.data);
                }
            })
            .catch((error) => {
                console.error('Error fetching types:', error);
            });
    }, []);

    const handleInputChange = (e, index) => {
        const { value } = e.target;
        const newOptions = [...formData.Options];
        newOptions[index] = value; // Update the specific option based on the index
        setFormData({ ...formData, Options: newOptions });
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setFormData({ ...formData, [name]: checked });
    };
        const handleRadioChange = (e) => {
        const { value } = e.target;
        setFormData({ ...formData, Size: value }); // Set the selected Size value
    };


    const addOptionField = () => {
        setFormData({ ...formData, Options: [...formData.Options, ''] }); // Add an empty field to the options array
    };

    const removeOptionField = (index) => {
        const newOptions = formData.Options.filter((_, i) => i !== index); // Remove the option field at the specified index
        setFormData({ ...formData, Options: newOptions });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Convert the options array into a comma-separated string
            const optionsString = formData.Options.join(', ');

            // Submit formData with the options as a string
            const response = await axios.post('https://namami-infotech.com/NIKHILOFFSET/src/menu/add_checkpoints.php', {
                ...formData,
                Options: optionsString, // Submit options as a comma-separated string
            });

            if (response.data.success) {
                alert('Checkpoint added successfully!');
                setFormData({
                    Description: '',
                    Value: '',
                    Options: [''], // Reset options array
                    TypeId: '',
                    Mandatory: true,
                    Editable: true,
                    Correct: '',
                    Size: '',
                    Score: '',
                    Validation: '',
                    Language: 0,
                    Active: true,
                    Dependent: false,
                    Logic: '',
                });
            } else {
                alert(`Failed to add checkpoint: ${response.data.message}`);
            }
        } catch (error) {
            console.error('Error adding checkpoint:', error);
            alert('An error occurred while adding the checkpoint.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ padding: '0px' }}>
            <Typography variant="h4" component="h1" gutterBottom style={{ marginBottom: '20px', textAlign: 'center' }}>
                Add Checkpoint (
    {types.find((type) => type.TypeId === formData.TypeId)?.Type || "Select a Type"})
 
            </Typography>
            <form onSubmit={handleSubmit} style={{ maxWidth: '2000px', margin: '0 auto' }}>
                {/* Type */}
                <div style={{display:"flex", gap:"50px"}}>
                    <Box mb={2}>
                    <Typography variant="subtitle1">Select the type of checkpoint:</Typography>
                    <FormControl variant="outlined" sx={{ width: '200px', mt: 1 }}>
                        <InputLabel>Type</InputLabel>
                        <Select
                            name="TypeId"
                            value={formData.TypeId}
                            onChange={(e) => setFormData({ ...formData, TypeId: e.target.value })}
                            required
                            label="Type"
                            MenuProps={{
                                PaperProps: {
                                    style: {
                                        maxHeight: 200,
                                        marginTop: 8,
                                    },
                                },
                                anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                                transformOrigin: { vertical: 'top', horizontal: 'left' },
                            }}
                        >
                            {types.map((type) => (
                                <MenuItem key={type.TypeId} value={type.TypeId}>
                                    {type.Type}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    </Box>
                    
                </div>
                {formData.TypeId === 1 && (
                    <>
                        <Box mb={2}>
                            <Typography variant="subtitle1">Pls enter the text which need to be displayed as Question</Typography>
                            <TextField
                                label="Description"
                                name="Description"
                                value={formData.Description}
                                onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
                                fullWidth
                                required
                                sx={{mt:1}}
                            />
                        </Box>

                        
                        
                        <Box mb={2}>
                            <Typography variant="subtitle1">Enter the Predefined value you want to show in Text Box:</Typography>
                            <TextField
                                label="Value"
                                name="Value"
                                value={formData.Value}
                                onChange={(e) => setFormData({ ...formData, Value: e.target.value })}
                                fullWidth
                                sx={{mt:1}}
                            />
                        </Box>

                        <Box mb={2}>
  <Typography variant="subtitle1">
    Select the character types you want to include:
  </Typography>
  <FormControl fullWidth sx={{ mt: 1 }}>
    <InputLabel>Character Types</InputLabel>
    <Select
      label="Character Types"
      multiple
      value={formData.Correct || []}
      onChange={(e) =>
        setFormData({ ...formData, Correct: e.target.value })
      }
      renderValue={(selected) => selected.join(', ')}
      MenuProps={{
        PaperProps: {
          style: {
            maxHeight: 200,
          },
        },
      }}
    >
      {['Numeric', 'Alphabets', 'Wild Characters'].map((type) => (
        <MenuItem key={type} value={type}>
          <Checkbox checked={formData.Correct?.includes(type) || false} />
          <ListItemText primary={type} />
        </MenuItem>
      ))}
    </Select>
  </FormControl>
</Box>


                        <Box mb={2}>
                            <Typography variant="subtitle1">Enter the Maximum no. of character entered:</Typography>
                            <TextField
                                label="Size"
                                name="Size"
                                value={formData.Size}
                                onChange={(e) => setFormData({ ...formData, Size: e.target.value })}
                                type="number"
                                fullWidth
                                required
                                sx={{mt:1}}
                            />
                        </Box>

                        <div style={{display:"flex", gap:"50px"}}>
                            <Box mb={2}>
                            <Typography variant="subtitle1">Set as mandatory:</Typography>
                            <FormControlLabel
                                control={<Checkbox checked={formData.Mandatory} onChange={handleCheckboxChange} name="Mandatory" />}
                                label="Mandatory"
                            />
                        </Box>

                        <Box mb={2}>
                            <Typography variant="subtitle1">Set as editable:</Typography>
                            <FormControlLabel
                                control={<Checkbox checked={formData.Editable} onChange={handleCheckboxChange} name="Editable" />}
                                label="Editable"
                            />
                            </Box>
                            <Box mb={2}>
                            <Typography variant="subtitle1">Set as Active:</Typography>
                            <FormControlLabel
                                control={<Checkbox checked={formData.Active} onChange={handleCheckboxChange} name="Active" />}
                                label="Active"
                            />
                        </Box>
                        </div>
                    </>
                )}

                {formData.TypeId === 2 && (
                    <>
                        <Box mb={2}>
                            <Typography variant="subtitle1">Pls enter the text which need to be displayed as Question</Typography>
                            <TextField
                                label="Description"
                                name="Description"
                                value={formData.Description}
                                onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
                                fullWidth
                                required
                                sx={{mt:1}}
                            />
                        </Box>

                        
                        
                        <Box mb={2}>
                            <Typography variant="subtitle1">Enter the Predefined value you want to show in Long Text Box:</Typography>
                            <TextField
                                label="Value"
                                name="Value"
                                value={formData.Value}
                                onChange={(e) => setFormData({ ...formData, Value: e.target.value })}
                                fullWidth
                                sx={{mt:1}}
                            />
                        </Box>

                        <Box mb={2}>
                            <Typography variant="subtitle1">Enter the Characters you want to take as response in regex form:</Typography>
                            <TextField
                                label="Correct (Regex)"
                                name="Correct"
                                value={formData.Correct}
                                onChange={(e) => setFormData({ ...formData, Correct: e.target.value })}
                                fullWidth
                                sx={{mt:1}}
                            />
                        </Box>

                        <Box mb={2}>
                            <Typography variant="subtitle1">Enter the Maximum no. of character entered:</Typography>
                            <TextField
                                label="Size"
                                name="Size"
                                value={formData.Size}
                                onChange={(e) => setFormData({ ...formData, Size: e.target.value })}
                                type="number"
                                fullWidth
                                required
                                sx={{mt:1}}
                            />
                        </Box>

                        <div style={{display:"flex", gap:"50px"}}>
                            <Box mb={2}>
                            <Typography variant="subtitle1">Set as mandatory:</Typography>
                            <FormControlLabel
                                control={<Checkbox checked={formData.Mandatory} onChange={handleCheckboxChange} name="Mandatory" />}
                                label="Mandatory"
                            />
                        </Box>

                        <Box mb={2}>
                            <Typography variant="subtitle1">Set as editable:</Typography>
                            <FormControlLabel
                                control={<Checkbox checked={formData.Editable} onChange={handleCheckboxChange} name="Editable" />}
                                label="Editable"
                            />
                            </Box>
                            <Box mb={2}>
                            <Typography variant="subtitle1">Set as Active:</Typography>
                            <FormControlLabel
                                control={<Checkbox checked={formData.Active} onChange={handleCheckboxChange} name="Active" />}
                                label="Active"
                            />
                        </Box>
                        </div>
                    </>
                )}

                {formData.TypeId === 3 && (
                                        <>
                        <Box mb={2}>
                            <Typography variant="subtitle1">Pls enter the text which need to be displayed as Question</Typography>
                            <TextField
                                label="Description"
                                name="Description"
                               onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
                                fullWidth
                                required
                                sx={{mt:1}}
                            />
                        </Box>

                        
                        
                        <Box mb={2}>
                            <Typography variant="subtitle1">Enter the Predefined value you want to show in Number Box:</Typography>
                            <TextField
                                label="Value"
                                name="Value"
                                value={formData.Value}
                                onChange={(e) => setFormData({ ...formData, Value: e.target.value })}
                                fullWidth
                                sx={{mt:1}}
                            />
                        </Box>

                        <Box mb={2}>
                            <Typography variant="subtitle1">Enter the Characters you want to take as response in regex form:</Typography>
                            <TextField
                                label="Correct (Regex)"
                                name="Correct"
                                onChange={(e) => setFormData({ ...formData, Correct: e.target.value })}
                                
                                fullWidth
                                sx={{mt:1}}
                            />
                        </Box>

                        <Box mb={2}>
                            <Typography variant="subtitle1">Enter the Maximum no. of character entered:</Typography>
                            <TextField
                                label="Size"
                                name="Size"
                                value={formData.Size}
                                onChange={(e) => setFormData({ ...formData, Size: e.target.value })}
                                type="number"
                                fullWidth
                                required
                                sx={{mt:1}}
                            />
                        </Box>

                        <div style={{display:"flex", gap:"50px"}}>
                            <Box mb={2}>
                            <Typography variant="subtitle1">Set as mandatory:</Typography>
                            <FormControlLabel
                                control={<Checkbox checked={formData.Mandatory} onChange={handleCheckboxChange} name="Mandatory" />}
                                label="Mandatory"
                            />
                        </Box>

                        <Box mb={2}>
                            <Typography variant="subtitle1">Set as editable:</Typography>
                            <FormControlLabel
                                control={<Checkbox checked={formData.Editable} onChange={handleCheckboxChange} name="Editable" />}
                                label="Editable"
                            />
                            </Box>
                            <Box mb={2}>
                            <Typography variant="subtitle1">Set as Active:</Typography>
                            <FormControlLabel
                                control={<Checkbox checked={formData.Active} onChange={handleCheckboxChange} name="Active" />}
                                label="Active"
                            />
                        </Box>
                        </div>
                    </>
                )}

                {formData.TypeId === 4 && (
                                        <>
                        <Box mb={2}>
                            <Typography variant="subtitle1">Pls enter the text which need to be displayed as Question</Typography>
                            <TextField
                                label="Description"
                                name="Description"
                                value={formData.Description}
                                onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
                                fullWidth
                                required
                                sx={{mt:1}}
                            />
                        </Box>
                        
                        <Box mb={2}>
                            <Typography variant="subtitle1">Enter the Predefined Date you want to show in Date Box:</Typography>
                                     <TextField
                                label=""
                                name="Value"
                                value={formData.Value}
                                onChange={(e) => setFormData({ ...formData, Value: e.target.value })}
                                type="date" // This will render a date picker in browsers that support it
                                sx={{ mt: 1,width: "200px", }}
                                     />                            

                        </Box>

                        <div style={{display:"flex", gap:"50px"}}>
                            <Box mb={2}>
                            <Typography variant="subtitle1">Set as mandatory:</Typography>
                            <FormControlLabel
                                control={<Checkbox checked={formData.Mandatory} onChange={handleCheckboxChange} name="Mandatory" />}
                                label="Mandatory"
                            />
                        </Box>

                        <Box mb={2}>
                            <Typography variant="subtitle1">Set as editable:</Typography>
                            <FormControlLabel
                                control={<Checkbox checked={formData.Editable} onChange={handleCheckboxChange} name="Editable" />}
                                label="Editable"
                            />
                            </Box>
                            <Box mb={2}>
                            <Typography variant="subtitle1">Set as Active:</Typography>
                            <FormControlLabel
                                control={<Checkbox checked={formData.Active} onChange={handleCheckboxChange} name="Active" />}
                                label="Active"
                            />
                        </Box>
                        </div>
                    </>
                )}
                {/* Conditional fields */}
                {formData.TypeId === 5 && (
                    <>
                        <Box mb={2}>
                            <Typography variant="subtitle1">Please enter the text which needs to be displayed as a Question:</Typography>
                            <TextField
                                label="Description"
                                name="Description"
                                onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
                                fullWidth
                                required
                                sx={{ mt: 1 }}
                            />
                        </Box>

                        <Box mb={2}>
                            <Typography variant="subtitle1">Enter the options for the Radio question:</Typography>
                            {formData.Options.map((option, index) => (
                                <Box key={index} mb={2} display="flex" gap="10px" alignItems="center">
                                    <TextField
                                        label={`Option ${index + 1}`}
                                        name="Options"
                                        value={option}
                                        onChange={(e) => handleInputChange(e, index)}
                                        fullWidth
                                        required
                                        sx={{ mt: 1 }}
                                    />
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        onClick={() => removeOptionField(index)}
                                        style={{ marginLeft: '10px' }}
                                    >
                                        <DeleteForeverIcon/> Remove
                                    </Button>
                                </Box>
                            ))}
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={addOptionField}
                                style={{ backgroundColor: '#344C7D', color: '#fff' }}
                            >
                                <AddIcon/> Add More Option
                            </Button>
                        </Box>

                        <div style={{ display: 'flex', gap: '50px' }}>
                            <Box mb={2}>
                                <Typography variant="subtitle1">Set as mandatory:</Typography>
                                <FormControlLabel
                                    control={<Checkbox checked={formData.Mandatory} onChange={handleCheckboxChange} name="Mandatory" />}
                                    label="Mandatory"
                                />
                            </Box>

                            <Box mb={2}>
                                <Typography variant="subtitle1">Set as editable:</Typography>
                                <FormControlLabel
                                    control={<Checkbox checked={formData.Editable} onChange={handleCheckboxChange} name="Editable" />}
                                    label="Editable"
                                />
                            </Box>

                            <Box mb={2}>
                                <Typography variant="subtitle1">Set as Active:</Typography>
                                <FormControlLabel
                                    control={<Checkbox checked={formData.Active} onChange={handleCheckboxChange} name="Active" />}
                                    label="Active"
                                />
                            </Box>
                        </div>
                    </>
                )}
                {formData.TypeId === 6 && (
                    <>
                        <Box mb={2}>
                            <Typography variant="subtitle1">Please enter the text which needs to be displayed as a Question:</Typography>
                            <TextField
                                label="Description"
                                name="Description"
                                value={formData.Description}
                                onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
                                fullWidth
                                required
                                sx={{ mt: 1 }}
                            />
                        </Box>

                        <Box mb={2}>
                            <Typography variant="subtitle1">Enter the options for the Dropdown question:</Typography>
                            {formData.Options.map((option, index) => (
                                <Box key={index} mb={2} display="flex" gap="10px" alignItems="center">
                                    <TextField
                                        label={`Option ${index + 1}`}
                                        name="Options"
                                        value={option}
                                        onChange={(e) => handleInputChange(e, index)}
                                        fullWidth
                                        required
                                        sx={{ mt: 1 }}
                                    />
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        onClick={() => removeOptionField(index)}
                                        style={{ marginLeft: '10px' }}
                                    >
                                        <DeleteForeverIcon/> Remove
                                    </Button>
                                </Box>
                            ))}
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={addOptionField}
                                style={{ backgroundColor: '#344C7D', color: '#fff' }}
                            >
                                <AddIcon/> Add More Option
                            </Button>
                        </Box>

                        <div style={{ display: 'flex', gap: '50px' }}>
                            <Box mb={2}>
                                <Typography variant="subtitle1">Set as mandatory:</Typography>
                                <FormControlLabel
                                    control={<Checkbox checked={formData.Mandatory} onChange={handleCheckboxChange} name="Mandatory" />}
                                    label="Mandatory"
                                />
                            </Box>

                            <Box mb={2}>
                                <Typography variant="subtitle1">Set as editable:</Typography>
                                <FormControlLabel
                                    control={<Checkbox checked={formData.Editable} onChange={handleCheckboxChange} name="Editable" />}
                                    label="Editable"
                                />
                            </Box>

                            <Box mb={2}>
                                <Typography variant="subtitle1">Set as Active:</Typography>
                                <FormControlLabel
                                    control={<Checkbox checked={formData.Active} onChange={handleCheckboxChange} name="Active" />}
                                    label="Active"
                                />
                            </Box>
                        </div>
                    </>
                )}
                 {formData.TypeId === 7 && (
                    <>
                        <Box mb={2}>
                            <Typography variant="subtitle1">Pls enter the text which need to be displayed as Question</Typography>
                            <TextField
                                label="Description"
                                name="Description"
                                onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
                                fullWidth
                                required
                                sx={{mt:1}}
                            />
                        </Box>
                           <div style={{display:"flex", gap:"50px"}}>
                            <Box mb={2}>
                            <Typography variant="subtitle1">Set as mandatory:</Typography>
                            <FormControlLabel
                                control={<Checkbox checked={formData.Mandatory} onChange={handleCheckboxChange} name="Mandatory" />}
                                label="Mandatory"
                            />
                        </Box>

                        <Box mb={2}>
                            <Typography variant="subtitle1">Set as editable:</Typography>
                            <FormControlLabel
                                control={<Checkbox checked={formData.Editable} onChange={handleCheckboxChange} name="Editable" />}
                                label="Editable"
                            />
                            </Box>
                            <Box mb={2}>
                            <Typography variant="subtitle1">Set as Active:</Typography>
                            <FormControlLabel
                                control={<Checkbox checked={formData.Active} onChange={handleCheckboxChange} name="Active" />}
                                label="Active"
                            />
                        </Box>
                        </div>
                    </>
                )}
                {formData.TypeId === 8 && (
                    <>
                        <Box mb={2}>
                            <Typography variant="subtitle1">Please enter the text which needs to be displayed as a Question:</Typography>
                            <TextField
                                label="Description"
                                name="Description"
                                value={formData.Description}
                                onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
                                fullWidth
                                required
                                sx={{ mt: 1 }}
                            />
                        </Box>
                        <Box mb={2}>
                            <Typography variant="subtitle1">Size (Select one):</Typography>
                            <RadioGroup value={formData.Size} onChange={handleRadioChange}>
                                <Box display="flex" gap="20px">
                                    <RadioFormControlLabel value="1" control={<Radio />} label="Camera" />
                                    <RadioFormControlLabel value="2" control={<Radio />} label="Gallery" />
                                    <RadioFormControlLabel value="3" control={<Radio />} label="Both" />
                                </Box>
                            </RadioGroup>
                        </Box>
                       
                        <div style={{ display: 'flex', gap: '50px' }}>
                            <Box mb={2}>
                                <Typography variant="subtitle1">Set as mandatory:</Typography>
                                <FormControlLabel
                                    control={<Checkbox checked={formData.Mandatory} onChange={handleCheckboxChange} name="Mandatory" />}
                                    label="Mandatory"
                                />
                            </Box>

                            <Box mb={2}>
                                <Typography variant="subtitle1">Set as editable:</Typography>
                                <FormControlLabel
                                    control={<Checkbox checked={formData.Editable} onChange={handleCheckboxChange} name="Editable" />}
                                    label="Editable"
                                />
                            </Box>

                            <Box mb={2}>
                                <Typography variant="subtitle1">Set as Active:</Typography>
                                <FormControlLabel
                                    control={<Checkbox checked={formData.Active} onChange={handleCheckboxChange} name="Active" />}
                                    label="Active"
                                />
                            </Box>
                        </div>
                    </>
                )}
                {formData.TypeId === 9 && (
                    <>
                        <Box mb={2}>
                            <Typography variant="subtitle1">Please enter the text which needs to be displayed as a Question:</Typography>
                            <TextField
                                label="Description"
                                name="Description"
                               onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
                                fullWidth
                                required
                                sx={{ mt: 1 }}
                            />
                        </Box>

                        <Box mb={2}>
                            <Typography variant="subtitle1">Enter the options for the Checkbox question:</Typography>
                            {formData.Options.map((option, index) => (
                                <Box key={index} mb={2} display="flex" gap="10px" alignItems="center">
                                    <TextField
                                        label={`Option ${index + 1}`}
                                        name="Options"
                                        value={option}
                                        onChange={(e) => handleInputChange(e, index)}
                                        fullWidth
                                        required
                                        sx={{ mt: 1 }}
                                    />
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        onClick={() => removeOptionField(index)}
                                        style={{ marginLeft: '10px' }}
                                    >
                                        <DeleteForeverIcon/> Remove
                                    </Button>
                                </Box>
                            ))}
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={addOptionField}
                                style={{ backgroundColor: '#344C7D', color: '#fff' }}
                            >
                                <AddIcon/> Add More Option
                            </Button>
                        </Box>
<Box mb={2}>
                            <Typography variant="subtitle1">Enter the Maximum no. checkbox selected:</Typography>
                            <TextField
                                label="Size"
                                name="Size"
                                value={formData.Size}
                                onChange={handleInputChange}
                                type="number"
                                fullWidth
                                required
                                sx={{mt:1}}
                            />
                        </Box>
                        <div style={{ display: 'flex', gap: '50px' }}>
                            <Box mb={2}>
                                <Typography variant="subtitle1">Set as mandatory:</Typography>
                                <FormControlLabel
                                    control={<Checkbox checked={formData.Mandatory} onChange={handleCheckboxChange} name="Mandatory" />}
                                    label="Mandatory"
                                />
                            </Box>

                            <Box mb={2}>
                                <Typography variant="subtitle1">Set as editable:</Typography>
                                <FormControlLabel
                                    control={<Checkbox checked={formData.Editable} onChange={handleCheckboxChange} name="Editable" />}
                                    label="Editable"
                                />
                            </Box>

                            <Box mb={2}>
                                <Typography variant="subtitle1">Set as Active:</Typography>
                                <FormControlLabel
                                    control={<Checkbox checked={formData.Active} onChange={handleCheckboxChange} name="Active" />}
                                    label="Active"
                                />
                            </Box>
                        </div>
                    </>
                )}
                {formData.TypeId === 10 && (
                    <>
                        <Box mb={2}>
                            <Typography variant="subtitle1">Pls enter the text which need to be displayed as Question</Typography>
                            <TextField
                                label="Description"
                                name="Description"
                                value={formData.Description}
                                onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
                                fullWidth
                                required
                                sx={{mt:1}}
                            />
                        </Box>


                        <div style={{display:"flex", gap:"50px"}}>
                            <Box mb={2}>
                            <Typography variant="subtitle1">Set as mandatory:</Typography>
                            <FormControlLabel
                                control={<Checkbox checked={formData.Mandatory} onChange={handleCheckboxChange} name="Mandatory" />}
                                label="Mandatory"
                            />
                        </Box>

                        <Box mb={2}>
                            <Typography variant="subtitle1">Set as editable:</Typography>
                            <FormControlLabel
                                control={<Checkbox checked={formData.Editable} onChange={handleCheckboxChange} name="Editable" />}
                                label="Editable"
                            />
                            </Box>
                            <Box mb={2}>
                            <Typography variant="subtitle1">Set as Active:</Typography>
                            <FormControlLabel
                                control={<Checkbox checked={formData.Active} onChange={handleCheckboxChange} name="Active" />}
                                label="Active"
                            />
                        </Box>
                        </div>
                    </>
                )}

                 {formData.TypeId === 11 && (
                    <>
                        <Box mb={2}>
                            <Typography variant="subtitle1">Please enter the text which needs to be displayed as a Question:</Typography>
                            <TextField
                                label="Description"
                                name="Description"
                                value={formData.Description}
                                onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
                                fullWidth
                                required
                                sx={{ mt: 1 }}
                            />
                        </Box>
                        <Box mb={2}>
    <Typography variant="subtitle1">Enter the Number you want to Call or Text:</Typography>
    <TextField
        label="Value"
        name="Value"
        value={formData.Value}
        onChange={(e) => {
            const value = e.target.value;
            if (value === "" || value.startsWith("+91")) {
                setFormData({ ...formData, Value: value });
            } else {
                setFormData({ ...formData, Value: "+91" });
            }
        }}
        fullWidth
        sx={{ mt: 1 }}
    />
</Box>

                        <Box mb={2}>
                            <Typography variant="subtitle1">Size (Select one):</Typography>
                            <RadioGroup value={formData.Size} onChange={handleRadioChange}>
                                <Box display="flex" gap="20px">
                                    <RadioFormControlLabel value="1" control={<Radio />} label="WhatsApp" />
                                    <RadioFormControlLabel value="2" control={<Radio />} label="Calling" />
                                    <RadioFormControlLabel value="3" control={<Radio />} label="Both" />
                                </Box>
                            </RadioGroup>
                        </Box>
                       
                        <div style={{ display: 'flex', gap: '50px' }}>
                            <Box mb={2}>
                                <Typography variant="subtitle1">Set as mandatory:</Typography>
                                <FormControlLabel
                                    control={<Checkbox checked={formData.Mandatory} onChange={handleCheckboxChange} name="Mandatory" />}
                                    label="Mandatory"
                                />
                            </Box>

                            <Box mb={2}>
                                <Typography variant="subtitle1">Set as editable:</Typography>
                                <FormControlLabel
                                    control={<Checkbox checked={formData.Editable} onChange={handleCheckboxChange} name="Editable" />}
                                    label="Editable"
                                />
                            </Box>

                            <Box mb={2}>
                                <Typography variant="subtitle1">Set as Active:</Typography>
                                <FormControlLabel
                                    control={<Checkbox checked={formData.Active} onChange={handleCheckboxChange} name="Active" />}
                                    label="Active"
                                />
                            </Box>
                        </div>
                    </>
                )}
                {/* Submit Button */}
                <Box display="flex" justifyContent="flex-end" mt={2}>
  <Button
    type="submit"
    variant="contained"
    disabled={isSubmitting}
    style={{ backgroundColor: '#344C7D', color: '#fff' }}
  >
    {isSubmitting ? 'Adding...' : 'Add Checkpoint'}
  </Button>
</Box>

            </form>
        </div>
    );
};

export default AddCheckpointForm;
