import { useState, useRef, useEffect } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function StartScanning() {
  const [rollNumber, setRollNumber] = useState("");
  const [studentDetails, setStudentDetails] = useState(null);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState(""); // Store session ID
  const [scanMethod, setScanMethod] = useState("scan"); // "scan" or "face_recognition"
  const [isStreaming, setIsStreaming] = useState(false); // To track live video stream
  const videoRef = useRef(null); // Reference to video element
  const navigate = useNavigate();

  // ✅ Start Face Recognition Live Stream
  useEffect(() => {
    if (scanMethod === "face_recognition" && !isStreaming) {
      startLiveStream();
    }
  }, [scanMethod]);

  const startLiveStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      setError("Error accessing camera");
    }
  };

  const stopLiveStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      setIsStreaming(false);
    }
  };

  // ✅ Handle Scan (Mark Present & Fetch Details)
  const handleScan = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/scan", {
        roll_number: rollNumber,
      });

      if (response.status === 200) {
        fetchStudentDetails(rollNumber);
        setRollNumber("");
        setError("");
      }
    } catch (err) {
      setError("Student not found or error marking attendance");
      setStudentDetails(null);
    }
  };

  // ✅ Fetch Student Details (Name & Status)
  const fetchStudentDetails = async (roll_number) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/student/${roll_number}`);
      if (response.status === 200) {
        setStudentDetails(response.data);
      }
    } catch (err) {
      setError("Error fetching student details");
    }
  };

  // ✅ Take Attendance (Generate Report & Clear Table)
  const handleTakeAttendance = async () => {
    if (!sessionId) {
      alert("Please select a session before taking attendance");
      return;
    }
    try {
      await axios.post("http://localhost:5000/api/generate-report", { session_id: sessionId });
      await axios.post("http://localhost:5000/api/clear-attendance");
      stopLiveStream(); // Restart camera
      navigate("/teacher-dashboard");
    } catch (err) {
      setError("Error generating report");
    }
  };

  return (
    <Container className="mt-5">
      <Row>
        {/* Left Side: Session Selection & Roll Number Input */}
        <Col md={6}>
          <Card className="p-4 shadow">
            <h3 className="text-center">Select Session & Scan Method</h3>
            {error && <p className="text-danger">{error}</p>}
            
            <Form.Group className="mb-3">
              <Form.Label>Session</Form.Label>
              <Form.Select value={sessionId} onChange={(e) => setSessionId(e.target.value)}>
                <option value="">Select a session</option>
                <option value="1">Period 1</option>
                <option value="2">Period 2</option>
                <option value="3">Period 3</option>
                <option value="4">Period 4</option>
                <option value="5">Period 5</option>
                <option value="6">Period 6</option>
              </Form.Select>
            </Form.Group>

            {/* NEW DROPDOWN: Select Scan Method */}
            <Form.Group className="mb-3">
              <Form.Label>Scan Method</Form.Label>
              <Form.Select value={scanMethod} onChange={(e) => {
                setScanMethod(e.target.value);
                if (e.target.value === "scan") stopLiveStream(); // Stop camera if switching back
              }}>
                <option value="scan">Scan</option>
                <option value="face_recognition">Live Face Recognition</option>
              </Form.Select>
            </Form.Group>

            {/* Roll Number Input (Only shown for Scan Method) */}
            {scanMethod === "scan"  &&stopLiveStream&& (
              <Form onSubmit={handleScan}>
                <Form.Group className="mb-3">
                  <Form.Label>Roll Number</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Scan or Enter Roll Number"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    disabled={!sessionId}
                  />
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100" disabled={!sessionId}>
                  Scan & Mark Present
                </Button>
              </Form>
            )}
          </Card>
        </Col>

        {/* Right Side: Live Camera or Student Details */}
        <Col md={6}>
          <Card className="p-4 shadow">
            <h3 className="text-center">
              {scanMethod === "scan" ? "Student Details" : "Live Face Recognition"}
            </h3>

            {/* Show Student Details for Scan Method */}
            {scanMethod === "scan" && studentDetails ? (
              <>
                <p><strong>Roll Number:</strong> {studentDetails.roll_number}</p>
                <p><strong>Name:</strong> {studentDetails.name}</p>
                <p><strong>Status:</strong> {studentDetails.status}</p>
              </>
            ) : scanMethod === "scan" ? (
              <p className="text-muted text-center">No student details available</p>
            ) : null}

            {/* Show Live Camera for Face Recognition */}
            {scanMethod === "face_recognition" && (
              <div className="text-center">
                <video ref={videoRef} autoPlay playsInline style={{ width: "100%", maxHeight: "300px", borderRadius: "10px", border: "2px solid #ccc" }}></video>
                <p className="text-muted mt-2">Still in progress</p>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Take Attendance Button */}
      <Row className="mt-4">
        <Col className="text-center">
          <Button variant="success" onClick={handleTakeAttendance}>
            Take Attendance (Generate Report & Clear Table)
          </Button>
        </Col>
      </Row>
    </Container>
  );
}

export default StartScanning;
