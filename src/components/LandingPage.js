import { useNavigate } from "react-router-dom";
import { Container, Card, Button } from "react-bootstrap";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card className="p-4 shadow-lg text-center" style={{ width: "22rem" }}>
        <h2 className="text-primary mb-4">Attendance System</h2>
        <Button variant="primary" className="mb-2 w-100" onClick={() => navigate("/student-login")}>
          Student Login
        </Button>
        <Button variant="secondary" className="w-100" onClick={() => navigate("/teacher-login")}>
          Teacher Login
        </Button>
      </Card>
    </Container>
  );
}

export default LandingPage;
