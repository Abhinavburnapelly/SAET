import csv
import io
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



@app.route("/api/generate-report", methods=["POST"])
def generate_report():
    data = request.json
    session_id = data.get("session_id")

    if not session_id:
        return jsonify({"message": "Session ID is required"}), 400

    date = datetime.now().date()

    # Fetch all students from users table
    cursor.execute("SELECT roll_number, name FROM users WHERE role = 'student'")
    all_students = {row[0]: row[1] for row in cursor.fetchall()}  # Store as dict {roll_number: name}

    # Fetch students who have scanned attendance for the session
    cursor.execute("SELECT roll_number, status FROM attendance WHERE date = %s" ,(date,))
    scanned_students = dict(cursor.fetchall())  # {roll_number: status}
    for roll_number, name in all_students.items():
        # Determine the status
        status = scanned_students.get(roll_number, "Absent")  # Default to "Absent" if not scanned

        # Check if report entry exists for this student on this date
        cursor.execute("SELECT id FROM report WHERE roll_number = %s AND last_updated = %s", 
                       (roll_number, date))
        existing_record = cursor.fetchone()
        if existing_record:
            # Update existing record
            update_query = f"UPDATE report SET period_{session_id} = %s, last_updated = NOW() WHERE roll_number = %s AND last_updated = %s"
            cursor.execute(update_query, (status, roll_number, date))
        else:
            # Create a new report entry with default 'Empty' values
            insert_query = """
                INSERT INTO report (roll_number, name, last_updated, 
                    period_1, period_2, period_3, period_4, period_5, period_6)
                VALUES (%s, %s, CURRENT_DATE, 'Empty', 'Empty', 'Empty', 'Empty', 'Empty', 'Empty')
                ON DUPLICATE KEY UPDATE last_updated = CURRENT_DATE
            """

            cursor.execute(insert_query, (roll_number, name))

            # Now update the specific period with attendance status
            update_query = f"UPDATE report SET period_{session_id} = %s WHERE roll_number = %s AND last_updated = %s"
            cursor.execute(update_query, (status, roll_number, date))

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
        return jsonify({"message": "Login Failed"}), 401


# ✅ Fetch session-wise attendance for a given date (or default to today)
@app.route('/api/attendance-report', methods=['GET'])
def get_attendance_report():
    roll_number = request.args.get('roll_number')
    date = request.args.get('date', datetime.today().strftime('%Y-%m-%d'))

    query = """
    SELECT id, roll_number, name, last_updated ,period_1, period_2, period_3, period_4, period_5, period_6
    FROM report 
    WHERE 1=1
    """
    params = []

    if roll_number:
        query += f" AND roll_number = %s"
        params.append(roll_number)

    if date:
        query += " AND (last_updated) = %s"
        params.append(date)
    cursor.execute(query, tuple(params))
    records = cursor.fetchall()

    return jsonify(records)

@app.route('/api/student-attendance', methods=['GET'])
def get_student_attendance():
    roll_number = request.args.get('roll_number')  # Get roll number from request (logged-in student)
    if not roll_number:
        return jsonify({"error": "Roll number is required"}), 400

    query = """
    SELECT roll_number, name, last_updated, 
           period_1, period_2, period_3, period_4, period_5, period_6
    FROM report 
    WHERE roll_number = %s
    """
    cursor.execute(query, (roll_number,))
    records = cursor.fetchall()

    if not records:
        return jsonify({"message": "No attendance records found"}), 404
    return jsonify(records)

@app.route('/api/students', methods=['POST'])
def add_students():
    """
    Endpoint to add single or multiple students via JSON.
    """
    try:
        data = request.json
        students = data.get("students", [])

        if not isinstance(students, list) or len(students) == 0:
            return jsonify({"error": "Invalid data format"}), 400

        # Validate each student
        for student in students:
            if not all(key in student for key in ("roll_number", "name", "password", "email")):
                return jsonify({"error": "Each student must have roll_number, name, password, and email"}), 400

        # Insert students into the database
        for student in students:
            query = "INSERT INTO users (roll_number, name, password, email, role) VALUES (%s, %s, %s, %s, 'student')"
            cursor.execute(query, (student["roll_number"], student["name"], student["password"], student["email"]))
        db.commit()
        return jsonify({"message": "Students added successfully"}), 201

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": f"An error occurred while adding students{e}"}), 400


@app.route('/api/students/upload-csv', methods=['POST'])
def upload_csv():
    """
    Endpoint to handle CSV file uploads and add students in bulk.
    """
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file part in the request"}), 400

        file = request.files['file']

        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400

        # Parse the CSV file
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        csv_reader = csv.DictReader(stream)

        students = []
        for row in csv_reader:
            if all(key in row for key in ("roll_number", "name", "password", "email")):
                students.append({
                    "roll_number": row["roll_number"],
                    "name": row["name"],
                    "password": row["password"],
                    "email": row["email"]
                })

        if not students:
            return jsonify({"error": "No valid student data found in the CSV"}), 400

        # Insert students into the database
        for student in students:
            query = "INSERT INTO users (roll_number, name, password, email, role) VALUES (%s, %s, %s, %s, 'student')"
            cursor.execute(query, (student["roll_number"], student["name"], student["password"], student["email"]))
        db.commit()
        return jsonify({"message": "Students added successfully"}), 201

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "An error occurred while processing the CSV file"}), 500



if __name__ == '__main__':
    app.run(debug=True)
