-- Tạo database
CREATE DATABASE IF NOT EXISTS istudy;

USE istudy;

-- Bảng Users
CREATE TABLE User (
    id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    avatar VARCHAR(255),
    role TINYINT NOT NULL, -- 0: User, 1: Teacher, 2: Student, 3: Parent, 4: Admin
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status BOOLEAN DEFAULT TRUE -- 0: Inactive, 1: Active
);

-- Bảng mã OTP quên mật khẩu
CREATE TABLE Password_Reset_Token (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES User (id) ON DELETE CASCADE
);

-- Bảng Teachers
CREATE TABLE Teacher (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    gender TINYINT NOT NULL DEFAULT 2, -- 0: Male, 1: Female, 2: Other
    date_of_birth DATE,
    address TEXT,
    qualification TEXT,
    hire_date DATE,
    status TINYINT DEFAULT 1, -- 0: Inactive, 1: Active,
    zalo_id VARCHAR(255),
    facebook_id VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES User (id) ON DELETE CASCADE
);

-- Bảng Students
CREATE TABLE Student (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    gender TINYINT NOT NULL DEFAULT 2, -- 0: Male, 1: Female, 2: Other
    date_of_birth DATE,
    address TEXT,
    enrollment_date DATE,
    status TINYINT DEFAULT 1, -- 0: Inactive, 1: Active,
    discount_percentage DECIMAL(5, 2) DEFAULT 0,
    discount_reason TEXT,
    FOREIGN KEY (user_id) REFERENCES User (id) ON DELETE CASCADE
);

-- Bảng Parents
CREATE TABLE Parent (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    status TINYINT DEFAULT 1, -- 1: Inactive, 0: Active,
    relationship VARCHAR(100),
    zalo_id VARCHAR(255),
    facebook_id VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES User (id) ON DELETE CASCADE
);

-- Bảng Student_Parent_Relations
CREATE TABLE Student_Parent_Relation (
    id VARCHAR(255) PRIMARY KEY,
    student_id VARCHAR(255) NOT NULL,
    parent_id VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (student_id) REFERENCES Student (id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES Parent (id) ON DELETE CASCADE
);

-- Bảng Academic_Years
CREATE TABLE Academic_Year (
    id VARCHAR(255) PRIMARY KEY,
    school_year VARCHAR(20) NOT NULL UNIQUE,
    start_date DATE,
    end_date DATE,
    status TINYINT DEFAULT 0, -- 0: Inactive, 1: Active, 2: Completed,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng Grade_Levels
CREATE TABLE Grade_Level (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    academic_year_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (academic_year_id) REFERENCES Academic_Year (id) ON DELETE CASCADE
);

-- Bảng Schedule
CREATE TABLE Schedule (
    id VARCHAR(255) PRIMARY KEY,
    class_id VARCHAR(255) NOT NULL,
    day DATE,
    start_time TIME,
    end_time TIME,
    FOREIGN KEY (class_id) REFERENCES Class (id) ON DELETE CASCADE
);

-- Bảng Classes
CREATE TABLE Class (
    id VARCHAR(255) PRIMARY KEY,
    academic_year_id VARCHAR(255) NOT NULL,
    grade_level_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL UNIQUE,
    capacity INT DEFAULT 30,
    tuition_fee TEXT,
    start_date DATE,
    end_date DATE,
    status TINYINT DEFAULT 0, -- 0: open, 1: close, 2: completed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (academic_year_id) REFERENCES Academic_Year (id),
    FOREIGN KEY (grade_level_id) REFERENCES Grade_Level (id)
);

-- Bảng Class_Teachers
CREATE TABLE Class_Teacher (
    id VARCHAR(255) PRIMARY KEY,
    class_id VARCHAR(255) NOT NULL,
    teacher_id VARCHAR(255) NOT NULL,
    role TINYINT DEFAULT 0, -- 0: Main Teacher, 1: Assistant Teacher, 2: Substitute Teacher
    start_date DATE,
    end_date DATE,
    status TINYINT DEFAULT 1, -- 0: Inactive, 1: Active
    FOREIGN KEY (class_id) REFERENCES Class (id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES Teacher (id)
);

-- Bảng Class_Enrollments
CREATE TABLE Class_Enrollment (
    id VARCHAR(255) PRIMARY KEY,
    class_id VARCHAR(255) NOT NULL,
    student_id VARCHAR(255) NOT NULL,
    enrollment_date DATE NOT NULL,
    end_date DATE,
    status TINYINT DEFAULT 1, -- 0: Inactive, 1: Active, 2: Completed
    tuition_fee TEXT,
    original_fee TEXT,
    discount_percentage DECIMAL(5, 2) DEFAULT 0,
    FOREIGN KEY (class_id) REFERENCES Class (id),
    FOREIGN KEY (student_id) REFERENCES Student (id)
);

-- Bảng Class_Sessions
CREATE TABLE Class_Session (
    id VARCHAR(255) PRIMARY KEY,
    class_id VARCHAR(255) NOT NULL,
    teacher_id VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    topic TEXT,
    description TEXT,
    status TINYINT DEFAULT 0, -- 0: Scheduled, 1: Completed, 2: Canceled
    cancel_reason TEXT, -- Optionally used when status is 2
    FOREIGN KEY (class_id) REFERENCES Class (id),
    FOREIGN KEY (teacher_id) REFERENCES Teacher (id)
);

-- Bảng Attendance
CREATE TABLE Attendance (
    id VARCHAR(255) PRIMARY KEY,
    class_session_id VARCHAR(255) NOT NULL,
    student_id VARCHAR(255) NOT NULL,
    status TINYINT NOT NULL, -- 0: Present, 1: Absent, 2: Late, 3: Excused
    comment TEXT,
    recorded_by VARCHAR(255) NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_session_id) REFERENCES Class_Session (id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES Student (id),
    FOREIGN KEY (recorded_by) REFERENCES Teacher (id)
);

-- Bảng Invoices
CREATE TABLE Invoice (
    id VARCHAR(255) PRIMARY KEY,
    student_id VARCHAR(255) NOT NULL,
    class_id VARCHAR(255) NOT NULL,
    invoice_number VARCHAR(50) NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    final_amount DECIMAL(10, 2) NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status TINYINT DEFAULT 0, -- 0: Unpaid, 1: Paid, 2: Overdue, 3: Canceled
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES Student (id),
    FOREIGN KEY (class_id) REFERENCES Class (id)
);

-- Bảng Payments
CREATE TABLE Payment (
    id VARCHAR(255) PRIMARY KEY,
    invoice_id VARCHAR(255) NOT NULL,
    payment_date DATE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    reference_number VARCHAR(100),
    received_by VARCHAR(255) NOT NULL,
    notes TEXT,
    status TINYINT DEFAULT 0, -- 0: Unpaid, 1: Paid, 2: Overdue, 3: Canceled
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES Invoice (id),
    FOREIGN KEY (received_by) REFERENCES User (id)
);

-- Bảng Teacher_Salaries
CREATE TABLE Teacher_Salary (
    id VARCHAR(255) PRIMARY KEY,
    teacher_id VARCHAR(255) NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    base_salary DECIMAL(10, 2) DEFAULT 0,
    session_rate DECIMAL(10, 2) DEFAULT 0,
    total_sessions INT DEFAULT 0,
    bonus DECIMAL(10, 2) DEFAULT 0,
    deductions DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_status TINYINT DEFAULT 0, -- 0: Pending, 1: Paid, 2: Canceled
    payment_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES Teacher (id)
);

-- Bảng Announcements
CREATE TABLE Announcement (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type TINYINT DEFAULT 0, -- 0: Popup, 1: Slider, 2: News, 3: Emergency
    start_date DATE,
    end_date DATE,
    target_audience TINYINT DEFAULT 0, -- 0: All, 1: Parents, 2: Teachers, 3: Students
    status TINYINT DEFAULT 0, -- 1: Inactive, 0: Active
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES User (id)
);

-- Bảng Class_Promotions
CREATE TABLE Class_Promotion (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    grade_level_id VARCHAR(255) NOT NULL,
    planned_start_date DATE,
    tuition_fee DECIMAL(10, 2) NOT NULL,
    max_students INT DEFAULT 30,
    promotion_start DATE,
    promotion_end DATE,
    discount_offered DECIMAL(5, 2) DEFAULT 0,
    status TINYINT DEFAULT 0, -- 0: Planned, 1: Active, 2: Completed, 3: Canceled
    converted_class_id VARCHAR(255),
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (grade_level_id) REFERENCES Grade_Level (id),
    FOREIGN KEY (converted_class_id) REFERENCES Class (id),
    FOREIGN KEY (created_by) REFERENCES User (id)
);

-- Bảng Notifications
CREATE TABLE Notification (
    id VARCHAR(255) PRIMARY KEY,
    type TINYINT NOT NULL, -- 0: Absence, 1: Payment Due, 2: Emergency, 3: Announcement, 4: Class Cancel
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    sender_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES User (id)
);

-- Bảng Notification_Recipients
CREATE TABLE Notification_Recipient (
     id VARCHAR(255) PRIMARY KEY,
    notification_id VARCHAR(255) NOT NULL,
    recipient_id VARCHAR(255) NOT NULL,
    recipient_type TINYINT NOT NULL, -- 0: Parent, 1: Teacher, 2: Student
    delivery_method TINYINT NOT NULL, -- 0: App, 1: SMS, 2: Email, 3: Zalo, 4: Facebook
    status TINYINT DEFAULT 0, -- 0: Pending, 1: Sent, 2: Failed, 3: Read
    sent_at TIMESTAMP NULL,
    error_message TEXT,
    FOREIGN KEY (notification_id) REFERENCES Notification (id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES User (id)
);

-- Bảng Activity_Logs
CREATE TABLE Activity_Log (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100),
    details TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User (id)
);

-- Bảng Student_Statistics
CREATE TABLE Student_Statistic (
    id VARCHAR(255) PRIMARY KEY,
    year INT NOT NULL,
    month INT NOT NULL,
    total_students INT DEFAULT 0,
    new_students INT DEFAULT 0,
    inactive_students INT DEFAULT 0,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Financial_Statistics
CREATE TABLE Financial_Statistic (
    id VARCHAR(255) PRIMARY KEY,
    year INT NOT NULL,
    month INT NOT NULL,
    total_income DECIMAL(15, 2) DEFAULT 0,
    total_expenses DECIMAL(15, 2) DEFAULT 0,
    teacher_salaries DECIMAL(15, 2) DEFAULT 0,
    other_expenses DECIMAL(15, 2) DEFAULT 0,
    profit DECIMAL(15, 2) DEFAULT 0,
    total_discounts DECIMAL(15, 2) DEFAULT 0,
    unpaid_invoices DECIMAL(15, 2) DEFAULT 0,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
