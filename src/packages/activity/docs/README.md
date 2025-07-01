# Activity Package

This package provides CRUD operations for activity logs in the iStudy application.

## Modules

### Activity Log (`ActivityLog`)
Tracks user activities and system events for audit and monitoring purposes.

**Fields:**
- `id`: Unique identifier for the activity log
- `user_id`: ID of the user who performed the action
- `action`: Action performed (e.g., LOGIN, CREATE, UPDATE, DELETE)
- `entity_type`: Type of entity affected (e.g., USER, STUDENT, CLASS)
- `details`: Additional details about the action
- `ip_address`: IP address of the user
- `user_agent`: User agent string from browser/app
- `created_at`: Timestamp when the action occurred

**Endpoints:**
- `POST /activity-logs` - Create a new activity log
- `GET /activity-logs` - Get all activity logs (with optional filtering)
- `GET /activity-logs/:id` - Get a specific activity log
- `PUT /activity-logs/:id` - Update an activity log
- `DELETE /activity-logs/:id` - Delete an activity log
- `GET /activity-logs/user/:userId` - Get activity logs for a specific user
- `GET /activity-logs/range/date` - Get activity logs by date range
- `GET /activity-logs/analytics/summary` - Get activity summary statistics
- `POST /activity-logs/bulk-delete` - Bulk delete activity logs
- `POST /activity-logs/cleanup` - Cleanup old activity logs

## Query Parameters

The activity logs endpoint supports the following query parameters for filtering:
- `user_id`: Filter by specific user ID
- `action`: Filter by action (partial match, case-insensitive)
- `entity_type`: Filter by entity type (partial match, case-insensitive)
- `ip_address`: Filter by exact IP address match
- `startDate`: Start date for filtering (ISO string format)
- `endDate`: End date for filtering (ISO string format)

## Special Features

### Analytics Summary
Get comprehensive analytics about activity logs including:
- Total number of logs
- Number of unique users
- Top 10 most frequent actions
- Top 10 most affected entity types

### Bulk Operations
- **Bulk Delete**: Delete multiple activity logs by providing an array of IDs
- **Cleanup**: Automatically delete old activity logs (default: older than 90 days)

### User Activity Tracking
- Get all activities for a specific user
- Filter activities by date range
- Monitor user behavior patterns

## Business Logic

### Data Retention
- Activity logs are automatically cleaned up based on retention policy
- Default retention: 90 days (configurable)
- Bulk operations for efficient management

### Validation
- User ID is required for all activity logs
- Action field is required and limited to 255 characters
- Entity type is optional but limited to 100 characters
- IP address is optional but limited to 45 characters (supports IPv4 and IPv6)

### Security & Auditing
- All endpoints require authentication via Bearer token
- Activity logs provide complete audit trail
- IP address and user agent tracking for security monitoring

## Usage Examples

### Create Activity Log
```json
POST /activity-logs
{
  "user_id": "user_123456",
  "action": "LOGIN",
  "entity_type": "USER",
  "details": "User logged in successfully from mobile app",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)"
}
```

### Get Activity Logs with Filtering
```
GET /activity-logs?action=LOGIN&startDate=2024-01-01T00:00:00Z&endDate=2024-12-31T23:59:59Z
```

### Get User Activity
```
GET /activity-logs/user/user_123456
```

### Get Analytics Summary
```
GET /activity-logs/analytics/summary?startDate=2024-06-01T00:00:00Z&endDate=2024-06-30T23:59:59Z
```

### Bulk Delete Logs
```json
POST /activity-logs/bulk-delete
{
  "ids": ["log_1", "log_2", "log_3"]
}
```

### Cleanup Old Logs
```
POST /activity-logs/cleanup?daysToKeep=30
```

## Common Activity Actions

The system supports tracking various actions:
- `LOGIN` / `LOGOUT` - User authentication
- `CREATE` / `UPDATE` / `DELETE` - CRUD operations
- `VIEW` - Data access/viewing
- `EXPORT` / `IMPORT` - Data transfer operations
- `PAYMENT` - Financial transactions
- `ENROLLMENT` - Student enrollment activities

## Common Entity Types

Activity logs can track actions on various entities:
- `USER` - User account operations
- `STUDENT` - Student-related operations
- `TEACHER` - Teacher-related operations
- `PARENT` - Parent-related operations
- `CLASS` - Class management operations
- `INVOICE` - Invoice operations
- `PAYMENT` - Payment operations
- `ANNOUNCEMENT` - Announcement operations
- `NOTIFICATION` - Notification operations
