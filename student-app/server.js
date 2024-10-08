const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/studentDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Error connecting to MongoDB:', err));

// Define schemas and models
const studentSchema = new mongoose.Schema({
    name: String,
    email: String,
    roll: String,
});

const Student = mongoose.model('Student', studentSchema);

const teacherSchema = new mongoose.Schema({
    name: String,
    email: String,
    subject: String,
    phone: String
});

const Teacher = mongoose.model('Teacher', teacherSchema);

const contactSchema = new mongoose.Schema({
    name: String,
    email: String,
    message: String
});

const Contact = mongoose.model('Contact', contactSchema);

const classroomSchema = new mongoose.Schema({
    name: String,
    subject: String,
    schedule: String,
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }]
});

const attendanceSchema = new mongoose.Schema({
    classroomId: mongoose.Schema.Types.ObjectId,
    date: { type: Date, default: Date.now },
    attendance: { type: Map, of: String }
});

const Classroom = mongoose.model('Classroom', classroomSchema);
const Attendance = mongoose.model('Attendance', attendanceSchema);

// Routes

// API route to add a student
app.post('/add-student', (req, res) => {
    const { name, email, roll } = req.body;
    const newStudent = new Student({ name, email, roll });

    newStudent.save()
        .then(() => res.json({ success: true, message: 'Student added successfully' }))
        .catch(err => res.status(400).json({ success: false, message: 'Error adding student' }));
});

// API route to add a teacher
app.post('/add-teacher', (req, res) => {
    const { name, email, subject, phone } = req.body;
    const newTeacher = new Teacher({ name, email, subject, phone });

    newTeacher.save()
        .then(() => res.json({ success: true, message: 'Teacher added successfully' }))
        .catch(err => res.status(400).json({ success: false, message: 'Error adding teacher' }));
});

// API route to handle student login
app.post('/student-login', (req, res) => {
    const { email, password } = req.body;

    Student.findOne({ email: email })
        .then(student => {
            if (!student) {
                return res.json({ success: false, message: 'Student not found' });
            }
            if (student.roll === password) {
                res.json({ success: true, message: 'Login successful' });
            } else {
                res.json({ success: false, message: 'Invalid password' });
            }
        })
        .catch(err => res.status(500).json({ success: false, message: 'Server error' }));
});

// API route to handle teacher login
app.post('/teacher-login', (req, res) => {
    const { email, password } = req.body; // password is the phone number

    Teacher.findOne({ email: email })
        .then(teacher => {
            if (!teacher) {
                return res.json({ success: false, message: 'Teacher not found' });
            }

            if (teacher.phone === password) { // Check if phone number matches the password
                res.json({ success: true, message: 'Login successful' });
            } else {
                res.json({ success: false, message: 'Invalid password' });
            }
        })
        .catch(err => res.status(500).json({ success: false, message: 'Server error' }));
});


// Route to handle form submission for contact
app.post('/contact', (req, res) => {
    const { name, email, message } = req.body;

    const newContact = new Contact({ name, email, message });

    newContact.save()
        .then(() => res.json({ success: true }))
        .catch(err => res.status(400).json({ success: false, message: err.message }));
});

// Route to create a classroom and add students
app.post('/create-classroom', async (req, res) => {
    const { name, subject, schedule, studentRolls } = req.body;
    const rollNumbers = studentRolls.split(',').map(roll => roll.trim());

    try {
        // Create classroom
        const newClassroom = new Classroom({ name, subject, schedule });
        await newClassroom.save();

        // Find students by roll number and add them to the classroom
        const students = await Student.find({ roll: { $in: rollNumbers } });
        newClassroom.students = students.map(student => student._id);
        await newClassroom.save();

        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// Route to get all classrooms
app.get('/classrooms', async (req, res) => {
    try {
        const classrooms = await Classroom.find().populate('students');
        res.json(classrooms);
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// Route to get students for a specific classroom
app.get('/students/:classroomId', async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.classroomId).populate('students');
        res.json(classroom.students);
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// Route to mark attendance
app.post('/mark-attendance', async (req, res) => {
    const { classroomId, attendance } = req.body;

    try {
        const newAttendance = new Attendance({
            classroomId,
            attendance: attendance.reduce((acc, { studentId, status }) => {
                acc[studentId] = status;
                return acc;
            }, {})
        });
        await newAttendance.save();
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
