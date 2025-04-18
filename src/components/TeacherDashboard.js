import { useNavigate } from "react-router-dom";
import { Container, Card, Button } from "react-bootstrap";

function TeacherDashboard() {
  const navigate = useNavigate();

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card className="p-4 shadow-lg text-center" style={{ width: "22rem" }}>
        <h2 className="text-secondary mb-4">Teacher Dashboard</h2>
        <Button variant="success" className="w-100 mb-2" onClick={() => navigate("/scan")}>
          Start Scanning
        </Button>
        <br />
        <Button variant="info" className="w-100 mb-2" onClick={() => navigate("/manage-attendance")}>
          Manage Attendance
        </Button>
        <br />
        <Button variant="success" className="w-100 mb-2" onClick={() => navigate("/engagement-tracking")}>
          Engagement Tracking
        </Button>
        <br />
        <Button variant="primary" className="w-100" onClick={() => navigate("/add-students")}>
          Add Students
        </Button>
      </Card>
    </Container>
  );
}

export default TeacherDashboard;