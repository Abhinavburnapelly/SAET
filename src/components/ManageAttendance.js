import {  useState } from "react";
import { Container, Table, Button, Alert, Row, Col, Form } from "react-bootstrap";

function ManageAttendance() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [error, setError] = useState("");
  const [date, setDate] = useState("");
  const [sessionId, setSessionId] = useState("");

  const fetchAttendanceData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/attendance-report?session_id=${sessionId}&date=${date}`);
      if (response.ok) {
        const data = await response.json();
        setAttendanceData(data);
        setError("");
      } else {
        setError("Failed to fetch attendance data");
      }
    } catch (err) {
      setError("Error connecting to the server");
    }
  };

  const handleDeleteAttendance = async (rollNumber) => {
    try {
      const response = await fetch("http://localhost:5000/api/delete-attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roll_number: rollNumber }),
      });

      if (response.ok) {
        setAttendanceData(attendanceData.filter((record) => record.roll_number !== rollNumber));
      } else {
        setError("Failed to delete attendance record");
      }
    } catch (err) {
      setError("Error connecting to the server");
    }
  };

  return (
    <Container className="mt-5">
      <h2 className="text-center">Manage Attendance</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Row className="mb-4">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Select Date</Form.Label>
            <Form.Control type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
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
        </Col>
        <Col md={4} className="d-flex align-items-end">
          <Button variant="primary" onClick={fetchAttendanceData}>View Report</Button>
        </Col>
      </Row>
      <Table striped bordered hover className="mt-3">
        <thead>
          <tr>
            <th>Roll Number</th>
            <th>Name</th>
            <th>total_present</th>
            <th>total_absent</th>
            <th>date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {attendanceData.length > 0 ? (
            attendanceData.map((record) => {
                console.log(record, "record",record[0],record.roll_number);
                return (
                  <tr key={record[0]}>
                    <td>{record[1]}</td>
                    <td>{record[2]}</td>
                    <td>{record[3]}</td>
                    <td>{record[4]}</td>
                    <td>{record[5]}</td>
                    <td>
                      <Button variant="danger" onClick={() => handleDeleteAttendance(record[0])}>Delete</Button>
                    </td>
                  </tr>
                );
              })
          ) : (
            <tr>
              <td colSpan="4" className="text-center">No attendance records available</td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
}

export default ManageAttendance;