import { useState } from "react";
import { Container, Table, Button, Alert, Row, Col, Form } from "react-bootstrap";

function ManageAttendance() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [error, setError] = useState("");
  const [date, setDate] = useState("");
  const [rollNumber, setRollNumber] = useState("");

  const fetchAttendanceData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/attendance-report?roll_number=${rollNumber}&date=${date}`);
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

  const downloadCSV = () => {
    if (attendanceData.length === 0) {
      setError("No data to download");
      return;
    }

    const headers = ["Date", "Roll Number", "Name", "Period 1", "Period 2", "Period 3", "Period 4", "Period 5", "Period 6"];
    const csvRows = [headers.join(",")];

    attendanceData.forEach((record) => {
      csvRows.push([record[3], record[1], record[2], record[4], record[5], record[6], record[7], record[8], record[9]].join(","));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "attendance_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            <Form.Label>Enter Roll Number</Form.Label>
            <Form.Control type="text" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} placeholder="Enter roll number" />
          </Form.Group>
        </Col>
        <Col md={4} className="d-flex align-items-end">
          <Button variant="primary" onClick={fetchAttendanceData} className="me-2">View Report</Button>
          <Button variant="success" onClick={downloadCSV}>Download CSV</Button>
        </Col>
      </Row>
      <Table striped bordered hover className="mt-3">
        <thead>
          <tr>
            <th>Date</th>
            <th>Roll Number</th>
            <th>Name</th>
            <th>Period 1</th>
            <th>Period 2</th>
            <th>Period 3</th>
            <th>Period 4</th>
            <th>Period 5</th>
            <th>Period 6</th>
          </tr>
        </thead>
        <tbody>
          {attendanceData.length > 0 ? (
            attendanceData.map((record) => {
              const getStatusColor = (status) => {
                if (status === "Present") return "blue";
                if (status === "Absent") return "red";
                return "white";
              };
              return (
                <tr key={record[0]}>
                  <td>{record[3]}</td>
                  <td>{record[1]}</td>
                  <td>{record[2]}</td>
                  <td style={{ backgroundColor: getStatusColor(record[4]) }}>{record[4]}</td>
                  <td style={{ backgroundColor: getStatusColor(record[5]) }}>{record[5]}</td>
                  <td style={{ backgroundColor: getStatusColor(record[6]) }}>{record[6]}</td>
                  <td style={{ backgroundColor: getStatusColor(record[7]) }}>{record[7]}</td>
                  <td style={{ backgroundColor: getStatusColor(record[8]) }}>{record[8]}</td>
                  <td style={{ backgroundColor: getStatusColor(record[9]) }}>{record[9]}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="9" className="text-center">No attendance records available</td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
}

export default ManageAttendance;
