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
    cursor.execute("SELECT id,status FROM attendance WHERE roll_number = %s AND date = %s", (roll_number, date))
    existing_record = cursor.fetchone()

    if existing_record:
        new_status = 'absent' if existing_record[1] == 'present' else 'present'
        cursor.execute("UPDATE attendance SET status = %s WHERE id = %s", (new_status, existing_record[0]))
        db.commit()
        return jsonify({"message": "Removed From class"}), 200

    # Insert attendance
    cursor.execute("INSERT INTO attendance (roll_number, name, date, time_in, status) VALUES (%s, %s, %s, %s, 'present')",
                   (roll_number, name, date, time_in))
    db.commit()

    return jsonify({"message": "Attendance marked successfully"}), 200



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
# ✅ Clear Attendance Table
@app.route("/api/clear-attendance", methods=["POST"])
def clear_attendance():
    try:
        cursor.execute("TRUNCATE TABLE attendance")
        return jsonify({"message": "Attendance table cleared successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500




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


# ✅ Fetch session-wise attendance for a given date (or default to today)
@app.route('/api/attendance-report', methods=['GET'])
def get_attendance_report():
    session_id = request.args.get('session_id')
    date = request.args.get('date', datetime.today().strftime('%Y-%m-%d'))

    query = """
    SELECT id, roll_number, name, total_present, total_absent, last_updated 
    FROM report 
    WHERE 1=1
    """
    params = []

    if session_id:
        query += " AND session_id = %s"
        params.append(session_id)

    if date:
        query += " AND DATE(last_updated) = %s"
        params.append(date)

    cursor.execute(query, tuple(params))
    records = cursor.fetchall()

    return jsonify(records)

if __name__ == '__main__':
    app.run(debug=True)
