-- Test data for attendance functionality
USE istudy;

-- Insert test academic year
INSERT INTO Academic_Year (id, school_year, start_date, end_date, status)
VALUES ('ay-2024', '2024-2025', '2024-09-01', '2025-06-30', 1);

-- Insert test grade level
INSERT INTO Grade_Level (id, name, academic_year_id, status)
VALUES ('grade-10', '10th Grade', 'ay-2024', 1);

-- Insert test class
INSERT INTO Class (id, name, code, grade_level_id, academic_year_id, max_students, room, status)
VALUES ('class-math-10a', 'Math 10A', 'M10A', 'grade-10', 'ay-2024', 30, 'Room 101', 1);

-- Insert test users (teacher and students)
INSERT INTO User (id, username, password, email, phone, role, status) VALUES
('user-teacher-1', 'teacher1', '$2b$10$abcdefghijklmnopqrstuvwxyz', 'teacher1@school.com', '1234567890', 1, 1),
('user-student-1', 'student1', '$2b$10$abcdefghijklmnopqrstuvwxyz', 'student1@school.com', '1111111111', 2, 1),
('user-student-2', 'student2', '$2b$10$abcdefghijklmnopqrstuvwxyz', 'student2@school.com', '2222222222', 2, 1),
('user-student-3', 'student3', '$2b$10$abcdefghijklmnopqrstuvwxyz', 'student3@school.com', '3333333333', 2, 1);

-- Insert test teacher
INSERT INTO Teacher (id, user_id, full_name, gender, date_of_birth, address, qualification, hire_date, status)
VALUES ('teacher-1', 'user-teacher-1', 'John Smith', 0, '1985-05-15', '123 Teacher St', 'Master in Mathematics', '2020-08-01', 1);

-- Insert test students
INSERT INTO Student (id, user_id, full_name, gender, date_of_birth, address, enrollment_date, status) VALUES
('student-1', 'user-student-1', 'Alice Johnson', 1, '2007-03-10', '456 Student Ave', '2023-09-01', 1),
('student-2', 'user-student-2', 'Bob Williams', 0, '2007-07-22', '789 Student Blvd', '2023-09-01', 1),
('student-3', 'user-student-3', 'Carol Davis', 1, '2007-11-08', '321 Student Rd', '2023-09-01', 1);

-- Insert class teacher assignment
INSERT INTO Class_Teacher (id, class_id, teacher_id, start_date, status)
VALUES ('ct-1', 'class-math-10a', 'teacher-1', '2024-09-01', 1);

-- Insert class enrollments
INSERT INTO Class_Enrollment (id, class_id, student_id, enrollment_date, status) VALUES
('ce-1', 'class-math-10a', 'student-1', '2024-09-01', 1),
('ce-2', 'class-math-10a', 'student-2', '2024-09-01', 1),
('ce-3', 'class-math-10a', 'student-3', '2024-09-01', 1);
