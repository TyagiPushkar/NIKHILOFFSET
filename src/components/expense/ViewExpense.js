import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    TableFooter,
    TablePagination,
    Button,
    IconButton
} from '@mui/material';
import axios from 'axios';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';
import { useAuth } from '../auth/AuthContext';

function ViewExpense() {
    const { user } = useAuth();
    const [expenses, setExpenses] = useState([]);
    const [employeeData, setEmployeeData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    useEffect(() => {
    const fetchEmployeeData = async () => {
        try {
            const response = await axios.get('https://namami-infotech.com/NIKHILOFFSET/src/employee/list_employee.php', {
                params: { Tenent_Id: user.tenent_id }
            });

            if (response.data.success) {
                // Filter employees by Tenent_Id
                const filteredEmployees = response.data.data.filter(emp => emp.Tenent_Id === user.tenent_id);
                setEmployeeData(filteredEmployees);
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            setError('Error fetching employee data');
            console.error('Error:', error);
        }
    };

    fetchEmployeeData();
}, [user.tenent_id]);

useEffect(() => {
    const fetchExpenses = async () => {
        if (employeeData.length === 0) return; // Wait until employee data is fetched

        try {
            if (!user || !user.emp_id) {
                setError('User is not authenticated');
                setLoading(false);
                return;
            }

            const response = await axios.get('https://namami-infotech.com/NIKHILOFFSET/src/expense/get_expense.php', {
                params: { EmpId: user.emp_id, role: user.role }
            });

            if (response.data.success) {
                // Filter expenses by matching EmpId with employee data for the given Tenent_Id
                const filteredExpenses = response.data.data.filter(expense => 
                    employeeData.some(emp => emp.EmpId === expense.empId && emp.Tenent_Id === user.tenent_id)
                );

                const expenseData = filteredExpenses.map(expense => {
                    const employee = employeeData.find(emp => emp.EmpId === expense.empId);
                    return {
                        ...expense,
                        employeeName: employee ? employee.Name : 'Unknown'
                    };
                });

                setExpenses(expenseData);
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            setError('Error fetching expense data');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    fetchExpenses();
}, [user, employeeData, user.tenent_id]); // Add user.tenent_id as a dependency


    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleViewImage = (base64Data) => {
        if (!base64Data.startsWith('data:image/')) {
            base64Data = `data:image/png;base64,${base64Data}`;
        }

        const byteString = atob(base64Data.split(',')[1]);
        const mimeString = base64Data.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);

        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        const blob = new Blob([ab], { type: mimeString });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');

        setTimeout(() => {
            URL.revokeObjectURL(blobUrl);
        }, 1000);
    };

    const handleStatusChange = async (detailId, status) => {
        try {
            const response = await axios.post('https://namami-infotech.com/NIKHILOFFSET/src/expense/update_expense.php', {
                detailId,
                status,
                role: user.role
            });

            if (response.data.success) {
                setExpenses(prevExpenses =>
                    prevExpenses.map(expense =>
                        expense.detailId === detailId ? { ...expense, Status: status } : expense
                    )
                );
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            setError('Error updating expense status');
            console.error('Error:', error);
        }
    };

    const exportToCsv = () => {
        const csvRows = [
            ['Employee Name', 'Expense Date', 'Expense Type', 'Expense Amount', 'Status']
        ];

        expenses.forEach(({ employeeName, expenseDate, expenseType, expenseAmount, Status }) => {
            csvRows.push([
                employeeName,
                formatDate(expenseDate),
                expenseType,
                expenseAmount,
                Status
            ]);
        });

        const csvContent = csvRows.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.setAttribute('download', 'expense.csv');
        link.click();
        URL.revokeObjectURL(url);
    };

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Box>
            <br />
            <Button
                variant="contained"
                color="primary"
                onClick={exportToCsv}
                style={{ marginBottom: '16px', backgroundColor: "#344C7D", float: "right" }}
            >
                Export CSV
            </Button>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead style={{ backgroundColor: "#344C7D" }}>
                        <TableRow>
                            <TableCell style={{ color: "white" }}>Employee Name</TableCell>
                            <TableCell style={{ color: "white" }}>Expense Date</TableCell>
                            <TableCell style={{ color: "white" }}>Expense Type</TableCell>
                            <TableCell style={{ color: "white" }}>Expense Amount</TableCell>
                            <TableCell style={{ color: "white" }}>Bill</TableCell>
                            <TableCell style={{ color: "white" }}>Status</TableCell>
                            {user && user.role === 'HR' && <TableCell style={{ color: "white" }}>Actions</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {expenses
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((expense) => (
                                <TableRow key={expense.detailId}>
                                    <TableCell>{expense.employeeName}</TableCell>
                                    <TableCell>{formatDate(expense.expenseDate)}</TableCell>
                                    <TableCell>{expense.expenseType}</TableCell>
                                    <TableCell>{expense.expenseAmount}</TableCell>
                                    <TableCell>
                                        {expense.image ? (
                                            <Button
                                                variant="contained"
                                                style={{ backgroundColor: "#344C7D" }}
                                                onClick={() => handleViewImage(expense.image)}
                                            >
                                                View
                                            </Button>
                                        ) : (
                                            'No Image'
                                        )}
                                    </TableCell>
                                    <TableCell>{expense.Status}</TableCell>
                                    {user && user.role === 'HR' && (
                                        <TableCell>
                                            <IconButton
                                                variant="contained"
                                                color="success"
                                                onClick={() => handleStatusChange(expense.detailId, 'Approved')}
                                                disabled={expense.Status === 'Approved' || expense.Status === 'Rejected'}
                                                sx={{ marginRight: 1 }}
                                            >
                                                <CheckIcon />
                                            </IconButton>
                                            <IconButton
                                                variant="contained"
                                                color="error"
                                                onClick={() => handleStatusChange(expense.detailId, 'Rejected')}
                                                disabled={expense.Status === 'Rejected' || expense.Status === 'Approved'}
                                            >
                                                <CancelIcon />
                                            </IconButton>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25]}
                                count={expenses.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                            />
                        </TableRow>
                    </TableFooter>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default ViewExpense;











// <?php
// require_once '../../config/database.php';

// header('Content-Type: application/json');
// header("Access-Control-Allow-Origin: *");
// header("Access-Control-Allow-Methods: POST, OPTIONS");
// header("Access-Control-Allow-Headers: Content-Type");

// $response = ['success' => false, 'message' => ''];

// if ($_SERVER['REQUEST_METHOD'] == 'POST') {
//     $data = json_decode(file_get_contents('php://input'), true);
//     $expenses = $data['expenses'] ?? [];

//     if (!empty($expenses)) {
//         try {
//             // Generate a unique batch ID for this group of expenses
//             $batchId = uniqid('batch_', true);
            
//             // Begin a transaction
//             $conn->beginTransaction();
            
//             $query = 'INSERT INTO ExpenseDetails (batchId, empId, expenseDate, expenseType, expenseAmount, image, Status) VALUES (:batchId, :empId, :expenseDate, :expenseType, :expenseAmount, :image, :Status)';
//             $stmt = $conn->prepare($query);

//             foreach ($expenses as $expense) {
//                 $empId = $expense['empId'] ?? '';
//                 $expenseDate = $expense['expenseDate'] ?? '';
//                 $expenseType = $expense['expenseType'] ?? '';
//                 $expenseAmount = $expense['expenseAmount'] ?? '';
//                 $Status = $expense['Status'] ?? null;

//                 // Handle the image upload
//                 if (isset($expense['image']) && !empty($expense['image'])) {
//                     $imageData = $expense['image']; // Base64 encoded image data

//                     // Decode the base64 image data
//                     $image = base64_decode($imageData);
//                     $imageName = uniqid('expense_') . '.jpg'; // Generate a unique image name
//                     $uploadDir = __DIR__ . '/uploads/'; // Directory where images will be saved

//                     // Ensure the uploads directory exists
//                     if (!is_dir($uploadDir)) {
//                         mkdir($uploadDir, 0777, true);
//                     }

//                     // Save the image
//                     $imagePath = $uploadDir . $imageName;
//                     file_put_contents($imagePath, $image);

//                     // Generate the image URL
//                     $imageUrl = 'https://namami-infotech.com/NIKHILOFFSET/src/expense/uploads/' . $imageName;
//                 } else {
//                     $imageUrl = null; // If no image is provided, set it to null
//                 }

//                 if (!empty($empId) && !empty($expenseDate) && !empty($expenseType) && !empty($expenseAmount)) {
//                     $stmt->bindParam(':batchId', $batchId);
//                     $stmt->bindParam(':empId', $empId);
//                     $stmt->bindParam(':expenseDate', $expenseDate);
//                     $stmt->bindParam(':expenseType', $expenseType);
//                     $stmt->bindParam(':expenseAmount', $expenseAmount);
//                     $stmt->bindParam(':image', $imageUrl); // Store the image URL
//                     $stmt->bindParam(':Status', $Status);
                    
//                     if (!$stmt->execute()) {
//                         $conn->rollBack(); // Rollback the transaction on failure
//                         $response['message'] = "Failed to apply for one or more expenses.";
//                         echo json_encode($response);
//                         exit;
//                     }
//                 } else {
//                     $conn->rollBack(); // Rollback the transaction if validation fails
//                     $response['message'] = 'Please provide valid expense data.';
//                     echo json_encode($response);
//                     exit;
//                 }
//             }

//             // Commit the transaction
//             $conn->commit();
//             $response['success'] = true;
//             $response['message'] = "Expenses applied successfully with batch ID: $batchId.";
//         } catch (Exception $e) {
//             $conn->rollBack(); // Rollback the transaction on exception
//             $response['message'] = "An error occurred: " . $e->getMessage();
//         }
//     } else {
//         $response['message'] = 'No expenses provided.';
//     }
// } else {
//     $response['message'] = 'Invalid request method.';
// }

// echo json_encode($response);
// ?>
