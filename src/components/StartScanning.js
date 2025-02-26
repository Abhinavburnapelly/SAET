import { useState } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function StartScanning() {
  const [rollNumber, setRollNumber] = useState("");
  const [studentDetails, setStudentDetails] = useState(null);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState(""); // Store session ID
  const navigate = useNavigate();

  // ✅ Handle Scan (Mark Present & Fetch Details)
  const handleScan = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/scan", {
        roll_number: rollNumber,
      });

      if (response.status === 200) {
        // Fetch student details after scanning
        fetchStudentDetails(rollNumber);
        setRollNumber(""); // Clear input field
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
      await axios.post("http://localhost:5000/api/generate-report", {
        session_id: sessionId, // Send session ID
      });
      
      await axios.post("http://localhost:5000/api/clear-attendance"); // Clear attendance table
      
      console.log("Attendance report generated and cleared!");
      navigate("/teacher-dashboard"); // Redirect to teacher dashboard
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
            <h3 className="text-center">Select Session & Enter Roll Number</h3>
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
            <Form onSubmit={handleScan}>
              <Form.Group className="mb-3">
                <Form.Label>Roll Number</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Scan or Enter Roll Number"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  disabled={!sessionId} // Disable input if no session is selected
                />
              </Form.Group>
              <Button variant="primary" type="submit" className="w-100" disabled={!sessionId}>
                Scan & Mark Present
              </Button>
            </Form>
          </Card>
        </Col>

        {/* Right Side: Display Student Details */}
        <Col md={6}>
          <Card className="p-4 shadow">
            <h3 className="text-center">Student Details</h3>
            {studentDetails ? (
              <>
                <p><strong>Roll Number:</strong> {studentDetails.roll_number}</p>
                <p><strong>Name:</strong> {studentDetails.name}</p>
                <p><strong>Status:</strong> {studentDetails.status}</p>
              </>
            ) : (
              <p className="text-muted text-center">No student details available</p>
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
