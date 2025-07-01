# Statistical Package

This package provides CRUD operations for statistical data in the iStudy application.

## Modules

### Student Statistics (`StudentStatistic`)
Tracks student-related statistics by month and year.

**Fields:**
- `year`: Year of the statistic (2000-2100)
- `month`: Month of the statistic (1-12)
- `total_students`: Total number of students
- `new_students`: Number of new students
- `inactive_students`: Number of inactive students
- `generated_at`: Timestamp when the statistic was generated

**Endpoints:**
- `POST /student-statistics` - Create a new student statistic
- `GET /student-statistics` - Get all student statistics (with optional filtering)
- `GET /student-statistics/:id` - Get a specific student statistic
- `PUT /student-statistics/:id` - Update a student statistic
- `DELETE /student-statistics/:id` - Delete a student statistic
- `GET /student-statistics/range` - Get statistics by date range

### Financial Statistics (`FinancialStatistic`)
Tracks financial data by month and year.

**Fields:**
- `year`: Year of the statistic (2000-2100)
- `month`: Month of the statistic (1-12)
- `total_income`: Total income for the period
- `total_expenses`: Total expenses for the period
- `teacher_salaries`: Teacher salaries for the period
- `other_expenses`: Other expenses for the period
- `profit`: Profit for the period (can be negative)
- `total_discounts`: Total discounts given
- `unpaid_invoices`: Total unpaid invoices
- `generated_at`: Timestamp when the statistic was generated

**Endpoints:**
- `POST /financial-statistics` - Create a new financial statistic
- `GET /financial-statistics` - Get all financial statistics (with optional filtering)
- `GET /financial-statistics/:id` - Get a specific financial statistic
- `PUT /financial-statistics/:id` - Update a financial statistic
- `DELETE /financial-statistics/:id` - Delete a financial statistic
- `GET /financial-statistics/range` - Get statistics by date range
- `GET /financial-statistics/summary` - Get financial summary data

## Query Parameters

Both modules support the following query parameters for filtering:
- `year`: Filter by specific year
- `month`: Filter by specific month
- `startYear`: Start year for range filtering
- `endYear`: End year for range filtering
- `startMonth`: Start month for range filtering (used with date ranges)
- `endMonth`: End month for range filtering (used with date ranges)

## Business Logic

### Unique Constraints
- Each statistic is unique per year/month combination
- Attempting to create duplicates will result in a 409 Conflict error

### Validation
- Years must be between 2000 and 2100
- Months must be between 1 and 12
- Numeric fields must be non-negative (except profit which can be negative)

### Authentication
All endpoints require authentication via Bearer token.

## Usage Examples

### Create Student Statistic
```json
POST /student-statistics
{
  "year": 2024,
  "month": 6,
  "total_students": 150,
  "new_students": 25,
  "inactive_students": 5
}
```

### Get Financial Statistics for a Year
```
GET /financial-statistics?year=2024
```

### Get Statistics by Date Range
```
GET /student-statistics/range?startYear=2023&endYear=2024&startMonth=1&endMonth=6
```
