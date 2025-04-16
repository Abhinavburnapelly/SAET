import { useEffect, useRef, useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";

function EngagementDetection() {
  const videoRef = useRef(null);
  const streamRef = useRef(null); // Store stream reference

  useEffect(() => {
    startLiveStream();
    
    // Listen for visibility change (handles browser back button)
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopLiveStream(); // Stop when unmounting
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const startLiveStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const stopLiveStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Stop camera when navigating away using browser controls (Back button)
  const handleVisibilityChange = () => {
    if (document.hidden) {
      stopLiveStream();
    }
  };

  return (
    <Container fluid className="p-3">
      <Row className="vh-100">
        {/* Left Side - Full Camera View */}
        <Col md={8} className="d-flex align-items-center justify-content-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "10px",
              border: "2px solid #ccc",
            }}
          />
        </Col>

        {/* Right Side - Status Box (20% Width) */}
        <Col md={4} className="d-flex align-items-center">
          <Card className="p-4 w-100 shadow" style={{ minHeight: "50%", border: "2px solid #007bff" }}>
            <h3 className="text-center">Engagement Status</h3>
            <p className="text-muted text-center mt-3">In Progress...</p>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default EngagementDetection;
