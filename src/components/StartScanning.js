import { useState } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import axios from "axios";

function StartScanning() {
  const [rollNumber, setRollNumber] = useState("");
  const [studentDetails, setStudentDetails] = useState(null);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState("");

  const handleScan = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/scan", {
        roll_number: rollNumber,
        session_id: sessionId,
      });

      if (response.status === 200) {
        fetchStudentDetails(rollNumber);
        setError("");
      }
    } catch (err) {
      setError("Student not found or error marking attendance");
      setStudentDetails(null);
    }
  };

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

  const handleMarkLeave = async () => {
    try {
      await axios.post("http://localhost:5000/api/mark-leave", {
        roll_number: rollNumber,
        session_id: sessionId,
      });

      setStudentDetails({ ...studentDetails, status: "Absent" });
      setError("");
    } catch (err) {
      setError("Error marking as absent");
    }
  };

  const handleTakeAttendance = async () => {
    if (!sessionId) {
      alert("Please select a session before taking attendance");
      return;
    }
    try {
      await axios.post("http://localhost:5000/api/generate-report", {
        session_id: sessionId,
      });
      alert("Attendance report generated!");
    } catch (err) {
      setError("Error generating report");
    }
  };

  return (
    <Container className="mt-5">
      <Row>
        <Col md={6}>
          <Card className="p-4 shadow">
            <h3 className="text-center">Select Session</h3>
            {error && <p className="text-danger">{error}</p>}
            <Form.Group className="mb-3">
              <Form.Label>Session</Form.Label>
              <Form.Select value={sessionId} onChange={(e) => setSessionId(e.target.value)}>
                <option value="">Select a session</option>
                {[...Array(6)].map((_, i) => (
                  <option key={i + 1} value={`Period ${i + 1}`}>{`Period ${i + 1}`}</option>
                ))}
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
                  disabled={!sessionId}
                />
              </Form.Group>
              <Button variant="primary" type="submit" className="w-100" disabled={!sessionId}>
                Scan & Mark Present
              </Button>
            </Form>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="p-4 shadow">
            <h3 className="text-center">Student Details</h3>
            {studentDetails ? (
              <>
                <p><strong>Roll Number:</strong> {studentDetails.roll_number}</p>
                <p><strong>Name:</strong> {studentDetails.name}</p>
                <p><strong>Status:</strong> {studentDetails.status}</p>
                <Button variant="danger" onClick={handleMarkLeave} className="w-100" disabled={!sessionId}>
                  Mark as Absent
                </Button>
              </>
            ) : (
              <p className="text-muted text-center">No student details available</p>
            )}
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col className="text-center">
          <Button variant="success" onClick={handleTakeAttendance} disabled={!sessionId}>
            Take Attendance (Generate Report)
          </Button>
        </Col>
      </Row>
    </Container>
  );
}

export default StartScanning;