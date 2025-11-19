"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import axios from "axios"
import * as XLSX from "xlsx"; // Import the xlsx library
import {
  FileText,
  ImageIcon,
  ExternalLink,
  Eye,
  ArrowLeft,
  Award,
  Briefcase,
  FileCheck,
  Calendar,
  User,
  Building,
  MapPin,
  Phone,
  Mail,
  Edit,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Filter,
  Download,
} from "lucide-react"
import logo from "../../assets/images (1).png"

// Import jsPDF for PDF generation
import jsPDF from "jspdf";
import html2canvas from "html2canvas";


// Custom styled components using template literals
const StyledContainer = ({ children, ...props }) => {
  const style = {
    padding: "10px",
    background: " #ffffff",
    minHeight: "100vh",
    ...props.style,
  }
  return <div style={style}>{children}</div>
}

const StyledHeader = ({ children, ...props }) => {
  const style = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 20px",
    marginTop:"-30px",
    borderRadius: "12px",
    position: "relative",
    overflow: "hidden",
    ...props.style,
  }
  return <div style={style}>{children}</div>
}

const StyledCard = ({ children, highlight, ...props }) => {
  const style = {
    padding: "20px",
    marginBottom: "20px",
    borderRadius: "12px",
    background: highlight ? "linear-gradient(135deg, #fff8e1 0%, #fffde7 100%)" : "#ffffff",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    position: "relative",
    overflow: "hidden",
    ...props.style,
  }
  return <div style={style}>{children}</div>
}

const StyledButton = ({ children, primary, ...props }) => {
  const baseStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 16px",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    border: "none",
    outline: "none",
    ...props.style,
  }

  const primaryStyle = {
    ...baseStyle,
    backgroundColor: "#344C7D",
    color: "white",
    boxShadow: "0 4px 10px rgba(246, 147, 32, 0.2)",
  }

  const secondaryStyle = {
    ...baseStyle,
    backgroundColor: "#f8f9fa",
    color: "#333",
    border: "1px solid #e0e0e0",
  }

  const style = primary ? primaryStyle : secondaryStyle

  return (
    <button {...props} style={style}>
      {children}
    </button>
  )
}

const StyledTitle = ({ children, level = 1, ...props }) => {
  const baseStyle = {
    margin: "0 0 10px 0",
    fontWeight: "600",
    color: "#333",
    ...props.style,
  }

  let fontSize
  switch (level) {
    case 1:
      fontSize = "24px"
      break
    case 2:
      fontSize = "20px"
      break
    case 3:
      fontSize = "18px"
      break
    default:
      fontSize = "16px"
  }

  const style = { ...baseStyle, fontSize }

  return <h3 style={style}>{children}</h3>
}

const StyledSubtitle = ({ children, ...props }) => {
  const style = {
    fontSize: "14px",
    color: "#666",
    margin: "0 0 15px 0",
    ...props.style,
  }
  return <p style={style}>{children}</p>
}

const StyledGrid = ({ children, columns = 1, ...props }) => {
  const style = {
    display: "grid",
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: "15px",
    width: "100%",
    ...props.style,
  }

  // Add a resize event listener to handle responsive layout
  useEffect(() => {
    const handleResize = () => {
      const gridElements = document.querySelectorAll('[data-grid="true"]')
      gridElements.forEach((el) => {
        el.style.gridTemplateColumns = window.innerWidth < 768 ? "1fr" : "1fr 1fr"
      })
    }

    window.addEventListener("resize", handleResize)
    // Initial call
    handleResize()

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div data-grid="true" style={style}>
      {children}
    </div>
  )
}

const StyledFieldBox = ({ children, isEditing, variant = "default", ...props }) => {
  let baseStyle = {
    padding: "12px",
    borderRadius: "8px",
    backgroundColor: isEditing ? "#fff8e1" : "#f9f9f9",
    border: isEditing ? "1px solid #344C7D" : "1px solid #eee",
    height: "100%",
    transition: "all 0.2s ease",
    position: "relative",
    overflow: "hidden",
    ...props.style,
  }

  // Different style variants
  if (variant === "modern") {
    baseStyle = {
      ...baseStyle,
      backgroundColor: isEditing ? "#fff8e1" : "#ffffff",
      boxShadow: "0 3px 10px rgba(0, 0, 0, 0.08)",
      border: "none",
      borderLeft: "3px solid #344C7D",
    }
  } else if (variant === "card") {
    baseStyle = {
      ...baseStyle,
      backgroundColor: "#ffffff",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.05)",
      borderRadius: "10px",
      border: "1px solid #f0f0f0",
      padding: "15px",
    }
  } else if (variant === "flat") {
    baseStyle = {
      ...baseStyle,
      backgroundColor: isEditing ? "#fff8e1" : "#f8f9fa",
      border: "1px solid #eaeaea",
      borderRadius: "6px",
      boxShadow: "none",
    }
  }

  return <div style={baseStyle}>{children}</div>
}

const StyledFieldLabel = ({ children, ...props }) => {
  const style = {
    fontSize: "12px",
    fontWeight: "600",
    color: "#555",
    marginBottom: "8px",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    ...props.style,
  }
  return <div style={style}>{children}</div>
}

const StyledFieldValue = ({ children, ...props }) => {
  const style = {
    fontSize: "14px",
    color: "#333",
    wordBreak: "break-word",
    fontWeight: "500",
    ...props.style,
  }
  return <div style={style}>{children}</div>
}

const StyledInput = ({ value, onChange, ...props }) => {
  const style = {
    width: "100%",
    padding: "8px 12px",
    fontSize: "14px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    backgroundColor: "white",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    outline: "none",
    ":focus": {
      borderColor: "#344C7D",
      boxShadow: "0 0 0 2px rgba(246, 147, 32, 0.2)",
    },
    ...props.style,
  }
  return <input value={value} onChange={onChange} style={style} {...props} />
}

const StyledAvatar = ({ src, alt, size = 100, ...props }) => {
  const style = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: "8px",
    objectFit: "cover",
    border: "2px solid white",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    ...props.style,
  }
  return <img src={src || "/placeholder.svg"} alt={alt} style={style} />
}

const StyledIconButton = ({ children, onClick, ...props }) => {
  const style = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
    position: "absolute",
    bottom: "5px",
    right: "5px",
    ":hover": {
      backgroundColor: "white",
      transform: "scale(1.1)",
    },
    ...props.style,
  }
  return (
    <button onClick={onClick} style={style}>
      {children}
    </button>
  )
}

const StyledDivider = (props) => {
  const style = {
    height: "1px",
    width: "100%",
    backgroundColor: "#eee",
    margin: "15px 0",
    ...props.style,
  }
  return <div style={style}></div>
}

const StyledBadge = ({ children, color = "#344C7D", ...props }) => {
  const style = {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "600",
    color: "white",
    backgroundColor: color,
    ...props.style,
  }
  return <span style={style}>{children}</span>
}

const StyledLoading = (props) => {
  const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    ...props.style,
  }

  const spinnerStyle = {
    width: "40px",
    height: "40px",
    border: "4px solid rgba(246, 147, 32, 0.1)",
    borderRadius: "50%",
    borderTop: "4px solid #344C7D",
    animation: "spin 1s linear infinite",
  }

  return (
    <div style={containerStyle}>
      <div style={spinnerStyle}></div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

const StyledError = ({ children, ...props }) => {
  const style = {
    textAlign: "center",
    padding: "30px",
    color: "#d32f2f",
    fontSize: "18px",
    ...props.style,
  }
  return <div style={style}>{children}</div>
}

const StyledToast = ({ message, type = "success", onClose }) => {
  const style = {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    padding: "12px 20px",
    borderRadius: "8px",
    backgroundColor: type === "success" ? "#4caf50" : "#f44336",
    color: "white",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    minWidth: "250px",
  }

  return (
    <div style={style}>
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "white",
          cursor: "pointer",
          marginLeft: "10px",
        }}
      >
        <X size={16} />
      </button>
    </div>
  )
}

// New styled section header component
const StyledSectionHeader = ({ title, icon, onToggle, isCollapsed, count, ...props }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "15px 20px",
        borderRadius: "10px",
        background: "linear-gradient(135deg, #344C7D 0%, #ffb74d 100%)",
        color: "white",
        boxShadow: "0 4px 15px rgba(246, 147, 32, 0.2)",
        marginBottom: isCollapsed ? "10px" : "20px",
        cursor: "pointer",
        transition: "all 0.3s ease",
        ...props.style,
      }}
      onClick={onToggle}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {icon}
        <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>{title}</h3>
        {count > 0 && (
          <span
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.3)",
              borderRadius: "20px",
              padding: "2px 10px",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            {count}
          </span>
        )}
      </div>
      <div>{isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}</div>
    </div>
  )
}

const getIconForField = (fieldName) => {
  const fieldNameLower = fieldName.toLowerCase()
  if (fieldNameLower.includes("name")) return <User size={16} />
  if (fieldNameLower.includes("company") || fieldNameLower.includes("organization")) return <Building size={16} />
  if (fieldNameLower.includes("date")) return <Calendar size={16} />
  if (fieldNameLower.includes("address") || fieldNameLower.includes("location")) return <MapPin size={16} />
  if (fieldNameLower.includes("phone") || fieldNameLower.includes("contact")) return <Phone size={16} />
  if (fieldNameLower.includes("email")) return <Mail size={16} />
  if (fieldNameLower.includes("document") || fieldNameLower.includes("certificate")) return <FileCheck size={16} />
  return <Briefcase size={16} />
}
// ... (keep all your existing styled components exactly as they are)

function TempTenderView() {
  const { activityId } = useParams()
   const location = useLocation();
  const tempId = location.state?.tempId;
  const [details, setDetails] = useState([])
  const [checkpoints, setCheckpoints] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const [selectedImage, setSelectedImage] = useState("")
  const [windowWidth, setWindowWidth] = useState(1200)

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false)
  const [editedData, setEditedData] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState({ show: false, message: "", type: "success" })

  // Collapsible sections state
  const [collapsedSections, setCollapsedSections] = useState({})

  // Field style variant state
  const [fieldVariant, setFieldVariant] = useState("modern") // Options: default, modern, card, flat

  // User state - check if user is admin
  const [user, setUser] = useState(null)
  const isAdmin = user?.role === "Admin"

  // Checkpoint groups
  const sections = {
    "Job Card": [1,2,3,4,5,6,7,8,9,10],
    "PRE PRESS": [11,12,13,14,15,16,17,18,19,20,52],
    "CUTTING": [21,22,23,24,25,26,27,28,29,30,53],
    "PRINTING": [31, 32, 33, 34, 35, 36, 37, 38, 39, 40,54],
    "POST PRESS":[41, 42, 43, 44, 45, 46, 47, 48, 49, 50,55]
  }

  const candidateDetailsIds = [2, 4, 5, 7, 6, 18]
  const studentPhotoChkId = 3 // Assume 2 is the image URL

  // Ref for PDF generation
  const pdfRef = useRef();

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener("resize", handleResize)
    handleResize()
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Get user from localStorage on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        console.error("Failed to parse user from localStorage", e)
      }
    }
  }, [])

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [detailsRes, checkpointsRes] = await Promise.all([
          axios.get(
            `https://namami-infotech.com/NIKHILOFFSET/src/menu/get_transaction_dtl.php?activityId=${encodeURIComponent(
              activityId,
            )}`,
          ),
          axios.get(`https://namami-infotech.com/NIKHILOFFSET/src/menu/get_checkpoints.php`),
        ])

        if (detailsRes.data.success && checkpointsRes.data.success) {
          const checkpointMap = {}
          checkpointsRes.data.data.forEach((cp) => {
            checkpointMap[cp.CheckpointId] = cp.Description
          })
          setCheckpoints(checkpointMap)
          setDetails(detailsRes.data.data)

          // Initialize editedData with current values
          const initialEditData = {}
          detailsRes.data.data.forEach((item) => {
            initialEditData[item.ChkId] = item.Value
          })
          setEditedData(initialEditData)
        } else {
          setError("No details or checkpoints found.")
        }
      } catch (err) {
        setError("Failed to fetch tender details.")
      } finally {
        setLoading(false)
      }
    }

    fetchDetails()
  }, [activityId])

  const getValueByChkId = (chkId) => {
    const item = details.find((d) => Number.parseInt(d.ChkId) === chkId)
    return item ? item.Value : ""
  }

  // Function to check if a value is an image URL
  const isImageUrl = (url) => {
    if (!url || typeof url !== "string") return false
    return (
      url.startsWith("https://") &&
      (url.endsWith(".jpg") || url.endsWith(".jpeg") || url.endsWith(".png") || url.endsWith(".gif"))
    )
  }

  // Function to check if a value is a PDF URL
  const isPdfUrl = (url) => {
    if (!url || typeof url !== "string") return false
    return url.startsWith("https://") && url.includes(".pdf")
  }

  // Function to open file in new tab
  const openFileInNewTab = (url) => {
    window.open(url, "_blank")
  }

  // Handle input change in edit mode
  const handleInputChange = (chkId, value) => {
    setEditedData((prev) => ({
      ...prev,
      [chkId]: value,
    }))
  }

  // Toggle edit mode
  const toggleEditMode = () => {
    if (isEditing) {
      // If we're exiting edit mode without saving, reset to original values
      const initialEditData = {}
      details.forEach((item) => {
        initialEditData[item.ChkId] = item.Value
      })
      setEditedData(initialEditData)
    }
    setIsEditing(!isEditing)
  }

  // Toggle section collapse
  const toggleSectionCollapse = (sectionTitle) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle],
    }))
  }

  // Cycle through field style variants
  const cycleFieldVariant = () => {
    const variants = ["default", "modern", "card", "flat"]
    const currentIndex = variants.indexOf(fieldVariant)
    const nextIndex = (currentIndex + 1) % variants.length
    setFieldVariant(variants[nextIndex])
  }

  // Function to export data to Excel
  const exportToExcel = () => {
    // Prepare data for export
    const dataToExport = details.map((record) => {
      return {
        "Checkpoint ID": record.ChkId,
        "Field Name": checkpoints[record.ChkId] || `Checkpoint #${record.ChkId}`,
        "Value": record.Value,
      };
    });

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tender Details");
    
    // Generate Excel file and trigger download
    XLSX.writeFile(wb, `tender-details-${activityId}.xlsx`);
  };

  // Function to download PDF
  const downloadPDF = async () => {
    try {
      setToast({
        show: true,
        message: "Generating PDF...",
        type: "success"
      });

      // Create a new PDF instance
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Get the element to capture
      const element = pdfRef.current;
      
      // Use html2canvas to capture the content
      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      
      // Calculate dimensions to fit the page
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;
      
      // Add the image to PDF
      pdf.addImage(imgData, 'JPEG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
      // Save the PDF
      pdf.save(`job-card-${activityId}.pdf`);
      
      setToast({
        show: true,
        message: "PDF downloaded successfully!",
        type: "success"
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      setToast({
        show: true,
        message: "Failed to generate PDF",
        type: "error"
      });
    }
  };
  // Function to download formatted PDF with proper text wrapping and center alignment
const downloadFormattedPDF = async () => {
  try {
    setToast({
      show: true,
      message: "Generating Job Card PDF...",
      type: "success"
    });

    const pdf = new jsPDF('p', 'mm', 'a4');
    const margin = 10;
    const pageWidth = pdf.internal.pageSize.getWidth() - 2 * margin;
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    let currentY = 15;

    // Add header
    pdf.setFillColor(52, 76, 125); // #344C7D
    pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), 12, 'F');
    
    // Company Name
    pdf.setFontSize(14);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont(undefined, 'bold');
    pdf.text(`JOB CARD - ${getValueByChkId(5)} (${tempId})`, margin, 8);
    
    currentY = 18;

    // Function to add a properly aligned section with dynamic row heights
    const addSection = (title, data, startY) => {
      let y = startY;
      
      // Check if we need a new page
      if (y > pageHeight - 30) {
        pdf.addPage();
        y = margin + 5;
      }
      
      // Section header
      pdf.setFillColor(240, 240, 240);
      pdf.rect(margin, y, pageWidth, 6, 'F');
      
      pdf.setFontSize(12);
      pdf.setTextColor(52, 76, 125);
      pdf.setFont(undefined, 'bold');
      pdf.text(title, margin + 3, y + 4);
      
      y += 8;

      // Medium font size for content
      const fontSize = 9;
      const baseRowHeight = 8;
      const labelWidth = pageWidth * 0.35;
      const valueWidth = pageWidth * 0.60;

      data.forEach((item, index) => {
        pdf.setFontSize(fontSize);
        
        // Calculate text height for both label and value
        const labelLines = pdf.splitTextToSize(item.label, labelWidth - 8);
        const value = item.value || "—";
        const valueLines = pdf.splitTextToSize(value, valueWidth - 8);
        
        // Calculate required row height based on the maximum lines
        const maxLines = Math.max(labelLines.length, valueLines.length);
        const rowHeight = Math.max(baseRowHeight, maxLines * 3.5); // 3.5mm per line
        
        // Check if we need a new page
        if (y + rowHeight > pageHeight - 15) {
          pdf.addPage();
          y = margin + 5;
        }

        // Draw row background - alternate colors for better readability
        if (index % 2 === 0) {
          pdf.setFillColor(248, 248, 248);
        } else {
          pdf.setFillColor(255, 255, 255);
        }
        pdf.rect(margin, y, pageWidth, rowHeight, 'F');
        
        // Draw border for the row
        pdf.setDrawColor(220, 220, 220);
        pdf.rect(margin, y, pageWidth, rowHeight);

        // Label - bold and aligned properly
        pdf.setFont(undefined, 'bold');
        pdf.setTextColor(80, 80, 80);
        
        // Calculate vertical position for label (centered in available space)
        const labelY = y + (rowHeight / 2) - ((labelLines.length - 1) * 1.5);
        labelLines.forEach((line, lineIndex) => {
          pdf.text(line, margin + 4, labelY + (lineIndex * 3.5));
        });
        
        // Value - normal and aligned properly
        pdf.setFont(undefined, 'normal');
        pdf.setTextColor(0, 0, 0);
        
        // Calculate vertical position for value (centered in available space)
        const valueY = y + (rowHeight / 2) - ((valueLines.length - 1) * 1.5);
        valueLines.forEach((line, lineIndex) => {
          pdf.text(line, margin + labelWidth + 4, valueY + (lineIndex * 3.5));
        });

        // Draw vertical separator line
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin + labelWidth, y, margin + labelWidth, y + rowHeight);

        y += rowHeight;
      });

      return y + 5; // Add some space after section
    };

    // Prepare data for each section
    const allSections = {
      "JOB CARD": [
        { label: "JOB DATE", value: getValueByChkId(2) },
        { label: "Client Name", value: getValueByChkId(3) },
        { label: "PO No.", value: getValueByChkId(4) },
        { label: "Job Name", value: getValueByChkId(5) },
        { label: "Receiving Date", value: getValueByChkId(6) },
        { label: "Delivery Date", value: getValueByChkId(7) },
        { label: "Dummy Approved", value: getValueByChkId(8) },
        { label: "Quantity", value: getValueByChkId(10) },
        { label: "Finished Size", value: getValueByChkId(11) },
        { label: "No. of Pages", value: getValueByChkId(12) },
        { label: "Orientation", value: getValueByChkId(13) }
      ],
      "PRE PRESS": [
        { label: "Plates", value: getValueByChkId(15) },
        { label: "Total Sets", value: getValueByChkId(16) },
        { label: "Plated by Party", value: getValueByChkId(17) },
        { label: "Plate Size", value: getValueByChkId(18) },
        { label: "Number of Colors", value: getValueByChkId(19) },
        { label: "Digital Dummy with farrows", value: getValueByChkId(20) },
        { label: "Total No. of Plates", value: getValueByChkId(21) },
        { label: "Pre Press Notes", value: getValueByChkId(52) }
      ],
      "CUTTING": [
        { label: "Paper GSM", value: getValueByChkId(23) },
        { label: "Ordered Size", value: getValueByChkId(24) },
        { label: "Actual Print Size", value: getValueByChkId(25) },
        { label: "Total Number of Sheets", value: getValueByChkId(26) },
        { label: "Cover GSM", value: getValueByChkId(27) },
        { label: "Actual GSM", value: getValueByChkId(28) },
        { label: "Cutting Notes", value: getValueByChkId(53) }
      ],
      "PRINTING": [
        { label: "Machine", value: getValueByChkId(30) },
        { label: "Paper Size Cover", value: getValueByChkId(31) },
        { label: "Paper Cover Final Cut Size", value: getValueByChkId(32) },
        { label: "Paper Size Text", value: getValueByChkId(33) },
        { label: "Paper Text Final Cut Size", value: getValueByChkId(34) },
        { label: "Paper Size Other", value: getValueByChkId(35) },
        { label: "Paper Other Final Cut Size", value: getValueByChkId(36) },
        { label: "Job Quantity", value: getValueByChkId(37) },
        { label: "Type", value: getValueByChkId(38) },
        { label: "Used Sheets", value: getValueByChkId(39) },
        { label: "Wastage Sheets", value: getValueByChkId(40) },
        { label: "Total Sheets", value: getValueByChkId(41) },
        { label: "Printing Notes", value: getValueByChkId(54) },
        { label: "Lamination", value: getValueByChkId(47) },
        { label: "UV", value: getValueByChkId(48) },
        { label: "Aqueous Varnish", value: getValueByChkId(49) },
      ],
      "POST PRESS": [
        { label: "Binding", value: getValueByChkId(43) },
        { label: "Total Forms", value: getValueByChkId(44) },
        { label: "Final Quantity", value: getValueByChkId(45) },
        { label: "Finished Size", value: getValueByChkId(46) },
        { label: "Delivery Address & Mobile No", value: getValueByChkId(50) },
        { label: "Extra Fabrication", value: getValueByChkId(51) },
        { label: "Post Press Notes", value: getValueByChkId(55) }
      ]
    };

    // Add each section sequentially
    Object.entries(allSections).forEach(([sectionTitle, sectionData]) => {
      // Filter out empty values and trim whitespace
      const filteredData = sectionData.filter(item => {
        const value = item.value || "";
        return value.toString().trim() !== "" && value.toString().trim() !== "—";
      });
      
      if (filteredData.length > 0) {
        currentY = addSection(sectionTitle, filteredData, currentY);
      }
    });

    
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    
    
    

    // Add page border
    pdf.setDrawColor(180, 180, 180);
    pdf.rect(margin - 2, 14, pageWidth + 4, pageHeight - 26);

    // Save the PDF
    pdf.save(`job-card-${tempId}.pdf`);

    setToast({
      show: true,
      message: "Job Card PDF downloaded successfully!",
      type: "success"
    });
  } catch (error) {
    console.error('Error generating job card PDF:', error);
    setToast({
      show: true,
      message: "Failed to generate Job Card PDF",
      type: "error"
    });
  }
};

  // Save changes
  const saveChanges = async () => {
    if (!isAdmin) {
      setToast({
        show: true,
        message: "Only admin users can save changes",
        type: "error",
      })
      return
    }

    setIsSaving(true)
    try {
      // Convert editedData from object to array format expected by API
      const dataToSend = {}
      Object.keys(editedData).forEach((chkId) => {
        dataToSend[chkId] = editedData[chkId]
      })

      const response = await axios.post("https://namami-infotech.com/NIKHILOFFSET/src/menu/edit_transaction.php", {
        ActivityId: activityId,
        data: dataToSend,
        LatLong: null, // Add LatLong if needed
      })

      if (response.data.success) {
        // Update local details with edited data
        const updatedDetails = details.map((item) => ({
          ...item,
          Value: editedData[item.ChkId] || item.Value,
        }))

        setDetails(updatedDetails)
        setIsEditing(false)
        setToast({
          show: true,
          message: "Changes saved successfully",
          type: "success",
        })
      } else {
        throw new Error(response.data.message || "Failed to save changes")
      }
    } catch (err) {
      console.error("Error saving changes:", err)
      setToast({
        show: true,
        message: err.message || "Failed to save changes",
        type: "error",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const closeToast = () => {
    setToast({ ...toast, show: false })
  }

  const renderStudentDetails = () => {
    const fields = candidateDetailsIds.map((id) => {
      const value = getValueByChkId(id);
      return {
        id,
        label: checkpoints[id] || `Checkpoint #${id}`,
        value,
        isImage: isImageUrl(value),
        isPdf: isPdfUrl(value),
      };
    });
  
    return (
      <StyledCard highlight={true}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "15px" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Award size={20} color="#344C7D" style={{ marginRight: "10px" }} />
            <StyledTitle level={2}>JOB CARD</StyledTitle>
          </div>
  
          {isAdmin && (
            <div>
              {isEditing ? (
                <div style={{ display: "flex", gap: "10px" }}>
                  <StyledButton
                    onClick={saveChanges}
                    primary
                    disabled={isSaving}
                    style={{ backgroundColor: "#4caf50" }}
                  >
                    {isSaving ? (
                      "Saving..."
                    ) : (
                      <>
                        <Save size={16} style={{ marginRight: "5px" }} />
                        Save
                      </>
                    )}
                  </StyledButton>
                  <StyledButton onClick={toggleEditMode}>
                    <X size={16} style={{ marginRight: "5px" }} />
                    Cancel
                  </StyledButton>
                </div>
              ) : (
                <StyledButton onClick={toggleEditMode} primary>
                  <Edit size={16} style={{ marginRight: "5px" }} />
                  Edit Details
                </StyledButton>
              )}
            </div>
          )}
        </div>
        <StyledDivider />
  
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Photo and basic info section */}
          <div
            style={{
              display: "flex",
              flexDirection: window.innerWidth < 768 ? "column" : "row",
              gap: "20px",
              alignItems: window.innerWidth < 768 ? "center" : "flex-start",
            }}
          >
            {/* Photo Column */}
            <div
              style={{
                flex: "0 0 auto",
                textAlign: "center",
                position: "relative",
                padding: "10px",
                background: "linear-gradient(135deg, #fff8e1 0%, #fffde7 100%)",
                borderRadius: "12px",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
              }}
            >
              {isEditing ? (
                <div style={{ marginBottom: '15px' }}>
                  <FileUploadField
                    chkId={studentPhotoChkId}
                    currentValue={editedData[studentPhotoChkId] || getValueByChkId(studentPhotoChkId)}
                    onChange={handleInputChange}
                    isEditing={isEditing}
                  />
                </div>
              ) : isPdfUrl(getValueByChkId(studentPhotoChkId)) ? (
                <div
                  style={{
                    width: "120px",
                    height: "120px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "8px",
                    border: "2px solid white",
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                    margin: "0 auto 10px auto",
                    cursor: "pointer",
                  }}
                  onClick={() => openFileInNewTab(getValueByChkId(studentPhotoChkId))}
                >
                  <FileText size={50} color="#344C7D" />
                </div>
              ) : (
                <div style={{ position: "relative", marginBottom: "10px" }}>
                  <StyledAvatar src={getValueByChkId(studentPhotoChkId)} alt="Tender Image" size={120} />
                  {isImageUrl(getValueByChkId(studentPhotoChkId)) && (
                    <StyledIconButton onClick={() => openFileInNewTab(getValueByChkId(studentPhotoChkId))}>
                      <Eye size={16} />
                    </StyledIconButton>
                  )}
                </div>
              )}
              <div style={{ fontSize: "14px", fontWeight: "600", marginTop: "5px" }}>Tender</div>
            </div>
  
            {/* Key Details */}
            <div
              style={{ flex: "1", padding: "15px", backgroundColor: "rgba(255, 255, 255, 0.7)", borderRadius: "12px" }}
            >
              <StyledTitle level={3} style={{ color: "#344C7D", marginBottom: "15px" }}>
                Key Information
              </StyledTitle>
              <StyledGrid columns={window.innerWidth < 768 ? 1 : 2}>
                {fields
                  .filter((f, idx) => idx < 4 && !f.isImage && !f.isPdf)
                  .map((field, idx) => (
                    <StyledFieldBox
                      key={idx}
                      style={{ backgroundColor: "white" }}
                      isEditing={isEditing}
                      variant={fieldVariant}
                    >
                      <StyledFieldLabel>
                        {getIconForField(field.label)}
                        {field.label}
                      </StyledFieldLabel>
                      {isEditing ? (
                        <StyledInput
                          value={editedData[field.id] || ""}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                        />
                      ) : (
                        <StyledFieldValue>{field.value || "—"}</StyledFieldValue>
                      )}
                    </StyledFieldBox>
                  ))}
              </StyledGrid>
            </div>
          </div>
  
          {/* Additional Details */}
          <div>
            <StyledTitle level={3} style={{ marginBottom: "15px" }}>
              Additional Details
            </StyledTitle>
            <StyledGrid columns={window.innerWidth < 768 ? 1 : 3}>
              {fields
                .filter((f, idx) => idx >= 4 && !f.isImage && !f.isPdf)
                .map((field, idx) => (
                  <StyledFieldBox key={idx} isEditing={isEditing} variant={fieldVariant}>
                    <StyledFieldLabel>
                      {getIconForField(field.label)}
                      {field.label}
                    </StyledFieldLabel>
                    {isEditing ? (
                      <StyledInput
                        value={editedData[field.id] || ""}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                      />
                    ) : (
                      <StyledFieldValue>{field.value || "—"}</StyledFieldValue>
                    )}
                  </StyledFieldBox>
                ))}
  
              {/* Render image and PDF fields separately */}
              {fields
                .filter((f) => f.isImage || f.isPdf)
                .map((field, idx) => (
                  <StyledFieldBox key={`file-${idx}`} isEditing={isEditing} variant={fieldVariant}>
                    <StyledFieldLabel>
                      {field.isPdf ? <FileText size={16} /> : <ImageIcon size={16} />}
                      {field.label}
                    </StyledFieldLabel>
                    {isEditing ? (
                      <>
                        <StyledInput
                          value={editedData[field.id] || ""}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          placeholder={field.isPdf ? "Enter PDF URL" : "Enter image URL"}
                        />
                        <FileUploadField
                          chkId={field.id}
                          currentValue={editedData[field.id] || field.value}
                          onChange={handleInputChange}
                          isEditing={isEditing}
                        />
                      </>
                    ) : field.isImage ? (
                      <StyledButton
                        style={{ marginTop: "5px", padding: "6px 12px", fontSize: "12px" }}
                        onClick={() => openFileInNewTab(field.value)}
                      >
                        <ImageIcon size={14} style={{ marginRight: "5px" }} />
                        View Image
                      </StyledButton>
                    ) : field.isPdf ? (
                      <StyledButton
                        style={{ marginTop: "5px", padding: "6px 12px", fontSize: "12px" }}
                        onClick={() => openFileInNewTab(field.value)}
                      >
                        <FileText size={14} style={{ marginRight: "5px" }} />
                        View PDF
                      </StyledButton>
                    ) : null}
                  </StyledFieldBox>
                ))}
            </StyledGrid>
          </div>
        </div>
      </StyledCard>
    );
  };

  const getGridColumns = () => {
    if (windowWidth < 480) return "1fr"
    if (windowWidth < 768) return "1fr 1fr"
    if (windowWidth < 1200) return "repeat(3, 1fr)"
    return "repeat(4, 1fr)"
  }

  const renderSection = (title, checkpointIds) => {
  const sectionData = details.filter((item) => {
    const baseId = Number.parseInt(item.ChkId.toString().split("_")[0])
    return checkpointIds.includes(baseId) && item.Value !== null && item.Value !== "";
  });

  if (sectionData.length === 0) return null

  const getLabel = (chkId) => {
    if (chkId.includes("_")) {
      const [parentId, childId] = chkId.split("_")
      const parentLabel = checkpoints[parentId] || `Checkpoint #${parentId}`
      const childLabel = checkpoints[childId] || `Checkpoint #${childId}`
      return `${childLabel} (${parentLabel})`
    } else {
      return checkpoints[chkId] || `Checkpoint #${chkId}`
    }
  }

  const isCollapsed = collapsedSections[title]
  const itemCount = sectionData.length

  // Get icon based on section title
  let sectionIcon
  if (title.toLowerCase().includes("published")) {
    sectionIcon = <FileText size={20} color="white" />
  } else if (title.toLowerCase().includes("participated")) {
    sectionIcon = <Briefcase size={20} color="white" />
  } else if (title.toLowerCase().includes("opened")) {
    sectionIcon = <FileCheck size={20} color="white" />
  } else if (title.toLowerCase().includes("awarded")) {
    sectionIcon = <Award size={20} color="white" />
  } else {
    sectionIcon = <FileCheck size={20} color="white" />
  }

  return (
    <div key={title} style={{ marginBottom: "25px" }}>
      <StyledSectionHeader
        title={title}
        icon={sectionIcon}
        onToggle={() => toggleSectionCollapse(title)}
        isCollapsed={isCollapsed}
        count={itemCount}
      />

      {!isCollapsed && (
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "10px",
            padding: "20px",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
            border: "1px solid #f0f0f0",
          }}
        >
          {/* Single grid for all items - no grouping */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: getGridColumns(),
              gap: "15px",
              width: "100%",
            }}
          >
            {sectionData.map((item, index) => {
              const isImage = isImageUrl(item.Value)
              const isPdf = isPdfUrl(item.Value)
              const isPriceField = priceCheckpoints.includes(Number(item.ChkId));
              
              // Skip rendering if value is null or empty
              if (!item.Value || item.Value === "") return null;
              
              
              
              return (
                <StyledFieldBox
                  key={`${item.ChkId}-${index}`}
                  isEditing={isEditing}
                  variant={fieldVariant}
                  style={{
                    backgroundColor: isImage || isPdf ? "rgba(246, 147, 32, 0.05)" : undefined,
                    border: isImage || isPdf ? "1px solid rgba(246, 147, 32, 0.2)" : undefined,
                  }}
                >
                  <StyledFieldLabel>
                    {isImage ? (
                      <ImageIcon size={16} />
                    ) : isPdf ? (
                      <FileText size={16} />
                    ) : (
                      getIconForField(getLabel(item.ChkId))
                    )}
                    {getLabel(item.ChkId)}
                  </StyledFieldLabel>
              
                  {isEditing ? (
                    <>
                      {isImage || isPdf ? (
                        <>
                          <StyledInput
                            value={editedData[item.ChkId] || ""}
                            onChange={(e) => handleInputChange(item.ChkId, e.target.value)}
                            placeholder={isPdf ? "Enter PDF URL" : isImage ? "Enter image URL" : "Enter value"}
                          />
                          <FileUploadField
                            chkId={item.ChkId}
                            currentValue={editedData[item.ChkId] || item.Value}
                            onChange={handleInputChange}
                            isEditing={isEditing}
                          />
                        </>
                      ) : (
                        <StyledInput
                          value={editedData[item.ChkId] || ""}
                          onChange={(e) => handleInputChange(item.ChkId, e.target.value)}
                        />
                      )}
                    </>
                  ) : isImage ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                      <div style={{ position: "relative", marginBottom: "10px" }}>
                        <img
                          src={item.Value || "/placeholder.svg"}
                          alt={getLabel(item.ChkId)}
                          style={{
                            width: "100px",
                            height: "100px",
                            objectFit: "cover",
                            borderRadius: "8px",
                            border: "2px solid white",
                            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                          }}
                        />
                        <StyledIconButton onClick={() => openFileInNewTab(item.Value)}>
                          <Eye size={16} />
                        </StyledIconButton>
                      </div>
                      <StyledButton
                        style={{ padding: "6px 12px", fontSize: "12px" }}
                        onClick={() => openFileInNewTab(item.Value)}
                      >
                        <ExternalLink size={14} style={{ marginRight: "5px" }} />
                        Open Image
                      </StyledButton>
                    </div>
                  ) : isPdf ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#344C7D',
                          backgroundColor: 'rgula(246, 147, 32, 0.1)',
                          marginBottom: '10px'
                        }}
                      >
                        <FileText size={12} style={{ marginRight: '5px' }} />
                        PDF Document
                      </div>
                      <StyledButton
                        style={{ padding: "6px 12px", fontSize: "12px" }}
                        onClick={() => openFileInNewTab(item.Value)}
                      >
                        <ExternalLink size={14} style={{ marginRight: "5px" }} />
                        Open PDF
                      </StyledButton>
                    </div>
                  ) : (
                    <StyledFieldValue>{item.Value || "—"}</StyledFieldValue>
                  )}
                </StyledFieldBox>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

  // Utility function to calculate GST (18%)
const calculateGST = (amount) => {
  if (!amount || isNaN(amount)) return { withGST: 0, withoutGST: 0 };
  
  const numAmount = parseFloat(amount.toString().replace(/,/g, ''));
  if (isNaN(numAmount)) return { withGST: 0, withoutGST: 0 };
  
  return {
    withGST: numAmount,
    withoutGST: numAmount / 1.18, // Assuming 18% GST
    gstAmount: numAmount - (numAmount / 1.18)
  };
  };
  
  const priceCheckpoints = [10, 12, 15, 17, 22, 24,26,28,29,62,64,66,70,72]; // Add more IDs as needed

  const FileUploadField = ({ chkId, currentValue, onChange, isEditing }) => {
    const [previewUrl, setPreviewUrl] = useState(currentValue);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
  
    const handleFileChange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
  
      setIsUploading(true);
  
      try {
        // Create preview for images
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (event) => {
            setPreviewUrl(event.target.result);
          };
          reader.readAsDataURL(file);
        }
  
        // Convert file to base64
        const base64Data = await convertToBase64(file);
        
        // Call your API to upload the file
        const response = await axios.post('https://namami-infotech.com/NIKHILOFFSET/src/menu/edit_image.php', {
          ActivityId: activityId,
          ChkId: chkId,
          ImageData: base64Data
        });
  
        if (response.data.success) {
          onChange(chkId, response.data.data.ImageUrl);
          setToast({
            show: true,
            message: 'File uploaded successfully',
            type: 'success'
          });
        } else {
          throw new Error(response.data.message || 'Upload failed');
        }
      } catch (error) {
        console.error('Upload error:', error);
        setToast({
          show: true,
          message: error.message || 'Failed to upload file',
          type: 'error'
        });
        setPreviewUrl(currentValue); // Revert to previous value
      } finally {
        setIsUploading(false);
      }
    };
  
    const convertToBase64 = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
      });
    };
  
    const triggerFileInput = () => {
      fileInputRef.current.click();
    };
  
    if (!isEditing) {
      return null;
    }
  
    return (
      <div style={{ marginTop: '10px' }}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,.pdf"
          style={{ display: 'none' }}
        />
        
        <StyledButton
          onClick={triggerFileInput}
          style={{ width: '100%' }}
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload New File'}
        </StyledButton>
        
        {previewUrl && isImageUrl(previewUrl) && (
          <img
            src={previewUrl}
            alt="Preview"
            style={{
              maxWidth: '100%',
              maxHeight: '200px',
              marginTop: '10px',
              borderRadius: '8px'
            }}
          />
        )}
        
        {previewUrl && isPdfUrl(previewUrl) && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginTop: '10px',
            padding: '10px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px'
          }}>
            <FileText size={24} style={{ marginRight: '10px' }} />
            <span>PDF Document</span>
          </div>
        )}
      </div>
    );
  };
  if (loading) {
    return <StyledLoading />
  }

  if (error) {
    return (
      <StyledError>
        <div style={{ fontSize: "24px", marginBottom: "15px" }}>{error}</div>
        <StyledButton primary onClick={() => navigate(-1)}>
          <ArrowLeft size={16} style={{ marginRight: "5px" }} />
          Go Back
        </StyledButton>
      </StyledError>
    )
  }

  return (
    <StyledContainer>
      {/* Header with Back button */}
      <StyledHeader>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <div
        style={{
          position: "fixed",
          top: "60px",
          left: "20px",
          zIndex: 100,
        }}
      >
        <StyledButton
            primary
            onClick={() => navigate(-1)}
            style={{ padding: "8px", borderRadius: "50%", minWidth: "40px", minHeight: "40px" }}
          >
            <ArrowLeft size={20} />
          </StyledButton>
      </div>
          

          {/* <div>
            <StyledTitle level={1} style={{ color: "#344C7D", margin: 0 }}>
              JOB CARD
            </StyledTitle>
            
          </div> */}
        </div>

        {/* Logo with decorative elements */}
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          {/* PDF Download Buttons */}
          <div style={{ display: "flex", gap: "10px" }}>
            <StyledButton 
              // onClick={downloadPDF} 
              onClick={downloadFormattedPDF}
              primary
              style={{ backgroundColor: "#d32f2f", display: "flex", alignItems: "center", gap: "5px" }}
              title="Download as PDF (Screenshot)"
            >
              <Download size={16} />
              Download PDF
            </StyledButton>
            
            {/* <StyledButton 
              onClick={downloadFormattedPDF} 
              style={{ display: "flex", alignItems: "center", gap: "5px", border: "1px solid #344C7D", color: "#344C7D" }}
              title="Download as Formatted PDF"
            >
              <FileText size={16} />
              Formatted PDF
            </StyledButton> */}
          </div>
          
          {/* <StyledButton onClick={cycleFieldVariant} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <Filter size={16} />
            Style: {fieldVariant.charAt(0).toUpperCase() + fieldVariant.slice(1)}
          </StyledButton> */}
          
          {/* Add Export to Excel button */}
          {/* <StyledButton 
            onClick={exportToExcel} 
            primary
            style={{ backgroundColor: "#344C7D", display: "flex", alignItems: "center", gap: "5px" }}
            title="Export to Excel"
          >
            <Download size={16} />
            Export to Excel
          </StyledButton> */}
          
          {/* <div style={{ position: "relative" }}>
            <img
              src={logo || "/placeholder.svg"}
              alt="Logo"
              style={{
                maxHeight: "50px",
                position: "relative",
                zIndex: 1,
                filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))",
              }}
            /> 
          </div>*/}
        </div>
      </StyledHeader>

      {/* Main Content with PDF ref */}
      <div ref={pdfRef} style={{ margin: "0 auto" }}>
        {/* Tender Details */}
        {/* {renderStudentDetails()} */}

        {/* Remaining Sections */}
        {Object.entries(sections).map(([sectionTitle, ids]) => renderSection(sectionTitle, ids))}
      </div>

      {/* Add a floating action button for quick navigation back to top */}
      {/* <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 100,
        }}
      >
        <StyledButton
          primary
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            padding: 0,
            boxShadow: "0 4px 15px rgba(246, 147, 32, 0.3)",
          }}
        >
          <ArrowLeft size={24} style={{ transform: "rotate(90deg)" }} />
        </StyledButton>
      </div> */}

      {/* Toast notification */}
      {toast.show && <StyledToast message={toast.message} type={toast.type} onClose={closeToast} />}

      {/* Add global styles */}
      <style>{`
        * {
          box-sizing: border-box;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
          margin: 0;
          padding: 0;
          background-color: #f8f9fa;
        }
        
        @media (max-width: 768px) {
          .grid-container {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </StyledContainer>
  )
}

export default TempTenderView