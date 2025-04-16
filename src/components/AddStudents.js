import React, { useState } from "react";
import { Container, Card, Form } from "react-bootstrap";
import axios from "axios";
import "./AddStudents.css"; // Import CSS for animations

function AddStudents() {
    const [view, setView] = useState("single"); // "single" for Add User, "bulk" for Bulk Add
    const [singleStudent, setSingleStudent] = useState({ name: "", email: "", roll_number: "", password: "" });
    const [csvFile, setCsvFile] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: "", type: "" }); // Notification state

    const showNotification = (message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: "", type: "" });
        }, 3000); // Hide notification after 3 seconds
    };

    const handleSingleSubmit = async (event) => {
        event.preventDefault(); // Prevent page reload
        try {
            await axios.post("http://localhost:5000/api/students", { students: [singleStudent] });
            showNotification("Student added successfully!", "success");
            setSingleStudent({ name: "", email: "", roll_number: "", password: "" }); // Clear fields on success
        } catch (error) {
            console.error(error);
            showNotification("Failed to add student.", "error");
        }
    };

    const handleBulkSubmit = async (event) => {
        event.preventDefault(); // Prevent page reload
        if (!csvFile) {
            showNotification("Please upload a CSV file.", "error");
            return;
        }

        const formData = new FormData();
        formData.append("file", csvFile);

        try {
            await axios.post("http://localhost:5000/api/students/upload-csv", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            showNotification("Students added successfully!", "success");
            setCsvFile(null); // Clear file input on success
        } catch (error) {
            console.error(error);
            showNotification("Failed to upload CSV.", "error");
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center vh-100">
            {/* Notification Banner */}
            {notification.show && (
                <div className={`notification-banner ${notification.type}`}>
                    {notification.message}
                </div>
            )}

            <Card className="p-4 shadow-lg" style={{ width: "30rem" }}>
                <h2 className="text-secondary mb-4 text-center">Add Students</h2>
                <div className="toggle-container mb-4">
                    <div
                        className={`toggle-button ${view === "single" ? "active" : ""}`}
                        onClick={() => setView("single")}
                    >
                        Add User
                    </div>
                    <div
                        className={`toggle-button ${view === "bulk" ? "active" : ""}`}
                        onClick={() => setView("bulk")}
                    >
                        Bulk Add
                    </div>
                </div>
                <Form className={`transition-container ${view === "single" ? "show-single" : "show-bulk"}`}>
                    {view === "single" && (
                        <>
                            <h5>Single Student</h5>
                            <Form.Group className="mb-3">
                                <Form.Label>Roll Number</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter roll number"
                                    value={singleStudent.roll_number}
                                    onChange={(e) => setSingleStudent({ ...singleStudent, roll_number: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter name"
                                    value={singleStudent.name}
                                    onChange={(e) => setSingleStudent({ ...singleStudent, name: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="Enter email"
                                    value={singleStudent.email}
                                    onChange={(e) => setSingleStudent({ ...singleStudent, email: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Enter password"
                                    value={singleStudent.password}
                                    onChange={(e) => setSingleStudent({ ...singleStudent, password: e.target.value })}
                                />
                            </Form.Group>
                            <button className="btn btn-success w-100 mb-4" onClick={handleSingleSubmit}>
                                Add Student
                            </button>
                        </>
                    )}
                    {view === "bulk" && (
                        <>
                            <h5>Bulk Upload</h5>
                            <Form.Group className="mb-3">
                                <Form.Label>Upload CSV</Form.Label>
                                <Form.Control
                                    type="file"
                                    accept=".csv"
                                    onChange={(e) => setCsvFile(e.target.files[0])}
                                />
                            </Form.Group>
                            <button className="btn btn-info w-100" onClick={handleBulkSubmit}>
                                Upload CSV
                            </button>
                        </>
                    )}
                </Form>
            </Card>
        </Container>
    );
}

export default AddStudents;