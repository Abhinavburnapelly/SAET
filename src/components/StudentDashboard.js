import { Container, Card, Button } from "react-bootstrap";

function StudentDashboard() {
  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card className="p-4 shadow-lg text-center" style={{ width: "22rem" }}>
        <h2 className="text-primary mb-4">Student Dashboard</h2>
        <p>View your attendance record here.</p>
        <Button variant="primary" className="w-100">
          Check Attendance
        </Button>
      </Card>
    </Container>
  );
}

export default StudentDashboard;
