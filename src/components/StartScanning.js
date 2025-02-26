import { useState } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import axios from "axios";

function StartScanning() {
  const [rollNumber, setRollNumber] = useState("");
  const [studentDetails, setStudentDetails] = useState(null);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState(""); // Store session ID


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

  // ✅ Mark as Absent (Leaving)
  const handleMarkLeave = async () => {
    try {
      await axios.post("http://localhost:5000/api/mark-leave", {
        roll_number: rollNumber,
      });

      setStudentDetails({ ...studentDetails, status: "Absent" });
      setError("");
    } catch (err) {
      setError("Error marking as absent");
    }
  };

  // ✅ Take Attendance (Generate Report)
  const handleTakeAttendance = async () => {
    if (!sessionId) {
      alert("Please enter a session ID before taking attendance");
      return;
    }
    
    try {
      await axios.post("http://localhost:5000/api/generate-report", {
        session_id: sessionId, // Send session ID
      });
      alert("Attendance report generated!");
    } catch (err) {
      setError("Error generating report");
    }
  };

  return (
    <Container className="mt-5">
      <Row>
        {/* Left Side: Roll Number Input */}
        <Col md={6}>
          <Card className="p-4 shadow">
            <h3 className="text-center">Enter Roll Number</h3>
            {error && <p className="text-danger">{error}</p>}
            <Form.Group className="mb-3">
                <Form.Label>Session ID</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Enter session ID"
                    value={sessionId}
                    onChange={(e) => setSessionId(e.target.value)}
                />
            </Form.Group>
            <Form onSubmit={handleScan}>
              <Form.Group className="mb-3">
                <Form.Label>Roll Number</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Scan or Enter Roll Number"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                />
              </Form.Group>
              <Button variant="primary" type="submit" className="w-100">
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
                <Button variant="danger" onClick={handleMarkLeave} className="w-100">
                  Mark as Absent
                </Button>
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
            Take Attendance (Generate Report)
          </Button>
        </Col>
      </Row>
    </Container>
  );
}

export default StartScanning;
