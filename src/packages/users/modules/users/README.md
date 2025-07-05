# User Management API Documentation

This API provides comprehensive user management functionality including CRUD operations and avatar upload capabilities.

## Base URL
```
/api/v1/users
```

## Authentication
All endpoints require Bearer token authentication.

## Endpoints

### 1. Create User
**POST** `/api/v1/users`

Creates a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "password123",
  "email": "john@example.com",
  "phone": "+1234567890",
  "avatar": "https://example.com/avatar.jpg",
  "role": 3,
  "status": true
}
```

**Response:**
```json
{
  "id": "user_123456789",
  "username": "johndoe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "avatar": "https://example.com/avatar.jpg",
  "role": 3,
  "status": true,
  "created_at": "2025-07-04T21:48:16.000Z",
  "updated_at": "2025-07-04T21:48:16.000Z"
}
```

### 2. Get All Users (Paginated)
**GET** `/api/v1/users?page=1&limit=10`

Retrieves all users with pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "users": [
    {
      "id": "user_123456789",
      "username": "johndoe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "avatar": "https://example.com/avatar.jpg",
      "role": 3,
      "status": true,
      "created_at": "2025-07-04T21:48:16.000Z",
      "updated_at": "2025-07-04T21:48:16.000Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

### 3. Get User by ID
**GET** `/api/v1/users/:id`

Retrieves a specific user by their ID.

**Parameters:**
- `id`: User ID

**Response:**
```json
{
  "id": "user_123456789",
  "username": "johndoe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "avatar": "https://example.com/avatar.jpg",
  "role": 3,
  "status": true,
  "created_at": "2025-07-04T21:48:16.000Z",
  "updated_at": "2025-07-04T21:48:16.000Z"
}
```

### 4. Update User
**PUT** `/api/v1/users/:id`

Updates user information. This is the main endpoint you requested.

**Parameters:**
- `id`: User ID

**Request Body (all fields optional):**
```json
{
  "username": "johndoe_updated",
  "email": "newemail@example.com",
  "phone": "+9876543210",
  "avatar": "https://example.com/new-avatar.jpg",
  "status": false
}
```

**Response:**
```json
{
  "id": "user_123456789",
  "username": "johndoe_updated",
  "email": "newemail@example.com",
  "phone": "+9876543210",
  "avatar": "https://example.com/new-avatar.jpg",
  "role": 3,
  "status": false,
  "created_at": "2025-07-04T21:48:16.000Z",
  "updated_at": "2025-07-04T21:49:30.000Z"
}
```

### 5. Delete User
**DELETE** `/api/v1/users/:id`

Deletes a user account.

**Parameters:**
- `id`: User ID

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

### 6. Upload/Update Avatar
**POST** `/api/v1/users/:id/avatar`

Uploads and updates user avatar image.

**Parameters:**
- `id`: User ID

**Request:**
- Content-Type: `multipart/form-data`
- Body: `avatar` (image file)

**Response:**
```json
{
  "id": "user_123456789",
  "username": "johndoe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "avatar": "https://ik.imagekit.io/your_imagekit_id/avatars/uuid-filename.jpg",
  "role": 3,
  "status": true,
  "created_at": "2025-07-04T21:48:16.000Z",
  "updated_at": "2025-07-04T21:50:00.000Z"
}
```

### 7. Find User by Username
**GET** `/api/v1/users/username/:username`

Finds a user by their username.

**Parameters:**
- `username`: Username to search for

**Response:**
```json
{
  "id": "user_123456789",
  "username": "johndoe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "avatar": "https://example.com/avatar.jpg",
  "role": 3,
  "status": true,
  "created_at": "2025-07-04T21:48:16.000Z",
  "updated_at": "2025-07-04T21:48:16.000Z"
}
```

## User Roles

| Role | Value | Description |
|------|-------|-------------|
| Admin | 1 | System administrator |
| Teacher | 2 | Teaching staff |
| Student | 3 | Student user |
| Parent | 4 | Parent/Guardian |

## Field Validation

### Username
- Required (for creation)
- Minimum 3 characters
- Must be unique
- String type

### Password
- Required (for creation)
- Minimum 6 characters
- String type
- Automatically hashed

### Email
- Optional
- Must be valid email format
- Must be unique if provided
- String type

### Phone
- Optional
- String type

### Avatar
- Optional
- String type (URL)
- Can be uploaded via avatar endpoint

### Role
- Required (for creation)
- Number type
- Valid values: 1, 2, 3, 4

### Status
- Optional
- Boolean type
- Default: true

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Failed to update user",
  "error": "Bad Request"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "User with ID user_123456789 not found",
  "error": "Not Found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Username already exists",
  "error": "Conflict"
}
```

## Usage Examples

### Frontend Integration (JavaScript/TypeScript)

```typescript
// Update user function matching your requested interface
export async function updateUserApi(id: string, dto: UpdateUserDto): Promise<IUser> {
    const response = await api.put(`api/v1/users/${id}`, dto);
    return response.data;
}

export interface UpdateUserDto {
    username?: string;
    email?: string;
    phone?: string;
    avatar?: string;
    status?: boolean;
}

export interface IUser {
    id: string;
    username: string;
    email?: string;
    phone?: string;
    avatar?: string;
    role: number;
    status: boolean;
    created_at: Date;
    updated_at: Date;
}

// Usage example
const updateUser = async (userId: string) => {
    try {
        const updatedUser = await updateUserApi(userId, {
            email: "newemail@example.com",
            phone: "+1234567890",
            avatar: "https://new-avatar-url.com/avatar.jpg"
        });

        console.log('User updated:', updatedUser);
    } catch (error) {
        console.error('Failed to update user:', error);
    }
};
```

### cURL Examples

```bash
# Update user
curl -X PUT "http://localhost:3000/api/v1/users/user_123456789" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newemail@example.com",
    "phone": "+1234567890",
    "avatar": "https://new-avatar-url.com/avatar.jpg"
  }'

# Upload avatar
curl -X POST "http://localhost:3000/api/v1/users/user_123456789/avatar" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "avatar=@path/to/avatar.jpg"

# Get user
curl -X GET "http://localhost:3000/api/v1/users/user_123456789" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Security Notes

- All endpoints require authentication
- Passwords are automatically hashed
- User passwords are never returned in responses
- Username and email uniqueness is enforced
- File uploads are validated (images only, size limits)

## Integration with Upload Service

The avatar upload endpoint integrates with the ImageKit upload service to:
- Validate image files
- Generate unique filenames
- Store files in organized folders
- Return optimized image URLs
