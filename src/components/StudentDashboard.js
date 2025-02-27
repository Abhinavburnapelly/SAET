import { useState, useEffect } from "react";
import { Container, Table, Alert,  } from "react-bootstrap";

function StudentDashboard() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [error, setError] = useState("");
  const [totalClasses, setTotalClasses] = useState(0);
  const [classesAttended, setClassesAttended] = useState(0);
  const [percentage, setPercentage] = useState(0);

  const fetchAttendanceData = async () => {
    try {
      const rollNumber = localStorage.getItem("studentRollNumber");
      const response = await fetch(`http://localhost:5000/api/student-attendance?roll_number=${rollNumber}`);
      if (response.ok) {
        const data = await response.json();
        setAttendanceData(data);
        setError("");

        // Calculate attendance percentage
        let attended = 0;
        let total = 0;

        data.forEach((record) => {
          for (let i = 3; i <= 8; i++) {
            if (record[i] !== "Empty") {
              total++;
              if (record[i] === "Present") attended++;
            }
          }
        });

        setTotalClasses(total);
        setClassesAttended(attended);
        setPercentage(total > 0 ? ((attended / total) * 100).toFixed(2) : 0);
      } else {
        setError("Failed to fetch attendance data");
      }
    } catch (err) {
      setError("Error connecting to the server");
    }
  };
  useEffect(() => {
    fetchAttendanceData();
  }, []);
  return (
    <Container className="mt-5">
      <h1 className="text-center">Student Dashboard</h1>
      <h3 className="text-center">Roll Number: {localStorage.getItem("studentRollNumber")}</h3>
      {error && <Alert variant="danger">{error}</Alert>}

      

      <div className="mb-3 text-center">
        <h5>Total Classes: {totalClasses}</h5>
        <h5>Classes Attended: {classesAttended}</h5>
        <h5>Attendance Percentage: {percentage}%</h5>
      </div>

      <Table striped bordered hover className="mt-3">
        <thead>
          <tr>
            <th>Date</th>
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
                  <td>{record[2]}</td>
                  <td>{record[1]}</td>
                  <td style={{ backgroundColor: getStatusColor(record[3]) }}>{record[3]}</td>
                  <td style={{ backgroundColor: getStatusColor(record[4]) }}>{record[4]}</td>
                  <td style={{ backgroundColor: getStatusColor(record[5]) }}>{record[5]}</td>
                  <td style={{ backgroundColor: getStatusColor(record[6]) }}>{record[6]}</td>
                  <td style={{ backgroundColor: getStatusColor(record[7]) }}>{record[7]}</td>
                  <td style={{ backgroundColor: getStatusColor(record[8]) }}>{record[8]}</td>
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

export default StudentDashboard;
