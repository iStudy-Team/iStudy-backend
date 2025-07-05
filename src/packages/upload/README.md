# Upload API Documentation

This module provides image upload functionality using ImageKit as the storage service.

## Features

- ✅ Single file upload
- ✅ Multiple file upload (max 10 files)
- ✅ File validation (images only, max 10MB per file)
- ✅ Automatic file naming with UUID
- ✅ Optional folder organization
- ✅ File deletion
- ✅ File details retrieval
- ✅ Swagger documentation

## API Endpoints

### 1. Upload Single File

**POST** `/upload/single`

Upload a single image file.

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `file` (required): Image file (JPEG, PNG, GIF, WebP, SVG)
  - `folder` (optional): Folder path for organization

**Response:**
```json
{
  "url": "https://ik.imagekit.io/your_imagekit_id/uploads/uuid-filename.jpg",
  "fileId": "507f1f77bcf86cd799439011",
  "name": "uuid-filename.jpg",
  "size": 1024000,
  "filePath": "/uploads/uuid-filename.jpg"
}
```

### 2. Upload Multiple Files

**POST** `/upload/multiple`

Upload multiple image files (maximum 10 files).

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `files` (required): Array of image files
  - `folder` (optional): Folder path for organization

**Response:**
```json
{
  "files": [
    {
      "url": "https://ik.imagekit.io/your_imagekit_id/uploads/uuid-filename1.jpg",
      "fileId": "507f1f77bcf86cd799439011",
      "name": "uuid-filename1.jpg",
      "size": 1024000,
      "filePath": "/uploads/uuid-filename1.jpg"
    },
    {
      "url": "https://ik.imagekit.io/your_imagekit_id/uploads/uuid-filename2.jpg",
      "fileId": "507f1f77bcf86cd799439012",
      "name": "uuid-filename2.jpg",
      "size": 2048000,
      "filePath": "/uploads/uuid-filename2.jpg"
    }
  ]
}
```

### 3. Delete File

**DELETE** `/upload/:fileId`

Delete a file by its ID.

**Parameters:**
- `fileId`: The ID of the file to delete

**Response:**
```json
{
  "success": true
}
```

### 4. Get File Details

**GET** `/upload/details/:fileId`

Get detailed information about a file.

**Parameters:**
- `fileId`: The ID of the file

**Response:**
```json
{
  "fileId": "507f1f77bcf86cd799439011",
  "name": "uuid-filename.jpg",
  "size": 1024000,
  "url": "https://ik.imagekit.io/your_imagekit_id/uploads/uuid-filename.jpg",
  "filePath": "/uploads/uuid-filename.jpg",
  "tags": ["uploaded-from-api"],
  "AITags": null,
  "versionInfo": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Version 1"
  },
  "createdAt": "2025-07-04T08:50:52.000Z",
  "updatedAt": "2025-07-04T08:50:52.000Z"
}
```

## File Validation

### Supported File Types
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)
- SVG (.svg)

### File Size Limits
- Maximum file size: 10MB per file
- Maximum files per request: 10 files (for multiple upload)

## Usage Examples

### Using cURL

#### Single file upload:
```bash
curl -X POST "http://localhost:3000/upload/single" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/your/image.jpg" \
  -F "folder=avatars"
```

#### Multiple file upload:
```bash
curl -X POST "http://localhost:3000/upload/multiple" \
  -H "Content-Type: multipart/form-data" \
  -F "files=@/path/to/image1.jpg" \
  -F "files=@/path/to/image2.png" \
  -F "folder=gallery"
```

#### Delete file:
```bash
curl -X DELETE "http://localhost:3000/upload/507f1f77bcf86cd799439011"
```

### Using JavaScript/Frontend

#### Single file upload:
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('folder', 'avatars');

const response = await fetch('/upload/single', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log('Uploaded file:', result);
```

#### Multiple file upload:
```javascript
const formData = new FormData();
Array.from(fileInput.files).forEach(file => {
  formData.append('files', file);
});
formData.append('folder', 'gallery');

const response = await fetch('/upload/multiple', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log('Uploaded files:', result.files);
```

## Environment Configuration

Make sure these environment variables are set in your `.env` file:

```env
IMAGEKIT_PUBLIC=your_imagekit_public_key
IMAGEKIT_PRIVATE=your_imagekit_private_key
IMAGEKIT_URL=https://ik.imagekit.io/your_imagekit_id
```

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- `400 Bad Request`: Invalid file type, file too large, no file provided, etc.
- `500 Internal Server Error`: ImageKit service errors, network issues, etc.

Example error response:
```json
{
  "statusCode": 400,
  "message": "Invalid file type. Only images are allowed.",
  "error": "Bad Request"
}
```

## Integration with Other Modules

The `UploadService` is exported from the `UploadModule` and can be imported into other modules for programmatic file uploads:

```typescript
import { UploadService } from 'src/common/services/upload.service';

@Injectable()
export class UserService {
  constructor(private readonly uploadService: UploadService) {}

  async updateUserAvatar(userId: string, file: Express.Multer.File) {
    const uploadResult = await this.uploadService.uploadFile(file, 'avatars');
    // Update user avatar URL in database
    return uploadResult;
  }
}
```
