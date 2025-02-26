from flask import Flask, request, jsonify
import mysql.connector
from datetime import datetime
from flask_cors import CORS


app = Flask(__name__)
CORS(app)

db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="abhichintu",
    database="attendance_system"
)
cursor = db.cursor()
# ✅ Mark Attendance (Scan Entry)
@app.route("/api/scan", methods=["POST"])
def scan_attendance():
    data = request.json
    roll_number = data.get("roll_number")
    print("Roll Number: ", roll_number)

    if not roll_number:
        return jsonify({"message": "Roll number is required"}), 400

    # Check if student exists
    cursor.execute("SELECT name FROM users WHERE roll_number = %s AND role = 'student'", (roll_number,))
    student = cursor.fetchone()

    if not student:
        return jsonify({"message": "Student not found"}), 404

    name = student[0]
    date = datetime.now().date()
    time_in = datetime.now().time()

    # Check if attendance exists for today
    cursor.execute("SELECT id FROM attendance WHERE roll_number = %s AND date = %s", (roll_number, date))
    existing_record = cursor.fetchone()

    if existing_record:
        return jsonify({"message": "Attendance already marked"}), 200

    # Insert attendance
    cursor.execute("INSERT INTO attendance (roll_number, name, date, time_in, status) VALUES (%s, %s, %s, %s, 'present')",
                   (roll_number, name, date, time_in))
    db.commit()

    return jsonify({"message": "Attendance marked successfully"}), 200


# ✅ Mark Student as Leaving (Set to Absent)
@app.route("/api/mark-leave", methods=["POST"])
def mark_leave():
    data = request.json
    roll_number = data.get("roll_number")

    if not roll_number:
        return jsonify({"message": "Roll number is required"}), 400

    date = datetime.now().date()
    time_out = datetime.now().time()

    cursor.execute("SELECT id FROM attendance WHERE roll_number = %s AND date = %s", (roll_number, date))
    existing_record = cursor.fetchone()

    if not existing_record:
        return jsonify({"message": "Student not found or not present today"}), 404

    # Update attendance to mark exit time
    cursor.execute("UPDATE attendance SET time_out = %s, status = 'absent' WHERE roll_number = %s AND date = %s",
                   (time_out, roll_number, date))
    db.commit()

    return jsonify({"message": "Marked as left"}), 200


# ✅ Generate Attendance Report
@app.route("/api/generate-report", methods=["POST"])
def generate_report():
    data = request.json
    session_id = data.get("session_id")
    
    if not session_id:
        return jsonify({"message": "Session ID is required"}), 400

    cursor.execute("""
        INSERT INTO report (roll_number, name, total_present, total_absent, last_updated, session_id)
        SELECT roll_number, name,
               COUNT(CASE WHEN status = 'present' THEN 1 END) AS total_present,
               COUNT(CASE WHEN status = 'absent' THEN 1 END) AS total_absent,
               NOW(), %s
        FROM attendance
        GROUP BY roll_number, name
        ON DUPLICATE KEY UPDATE 
            total_present = VALUES(total_present),
            total_absent = VALUES(total_absent),
            last_updated = NOW(),
            session_id = VALUES(session_id);
    """, (session_id,))
    db.commit()

    return jsonify({"message": "Report generated successfully"}), 200


# ✅ Fetch Student Details by Roll Number
@app.route("/api/student/<roll_number>", methods=["GET"])
def get_student_details(roll_number):
    cursor.execute("SELECT name, status FROM attendance WHERE roll_number = %s ORDER BY date DESC LIMIT 1", (roll_number,))
    student = cursor.fetchone()

    if not student:
        return jsonify({"message": "Student not found"}), 404

    return jsonify({
        "roll_number": roll_number,
        "name": student[0],
        "status": student[1]
    }), 200


@app.route("/api/teacher/login", methods=["POST"])
def teacher_login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    query = "SELECT * FROM users WHERE email = %s AND password = %s AND role = 'teacher'"
    cursor.execute(query, (email, password))
    teacher = cursor.fetchone()
    

    if teacher:
        return jsonify({"message": "Login successful", "token": "dummy_token"}), 200
    else:
        return jsonify({"message": "Invalid credentials"}), 401

@app.route("/api/student/login", methods=["POST"])
def student_login():
    data = request.json
    roll_number = data.get("rollNumber")
    password = data.get("password")

    query = "SELECT * FROM users WHERE roll_number = %s AND password = %s AND role = 'student'"
    cursor.execute(query, (roll_number, password))
    student = cursor.fetchone()

    if student:
        return jsonify({"message": "Login successful", "token": "dummy_token"}), 200
    else:
        return jsonify({"message": query}), 401

if __name__ == '__main__':
    app.run(debug=True)
