# Profiles API

This API provides CRUD operations for user profiles in the application.

## Endpoints

### List Profiles

```
GET /api/profiles
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Number of items per page (default: 10, max: 100)
- `search` (optional): Search term for username or full name

**Response:**
```json
{
  "data": {
    "profiles": [
      {
        "id": "uuid",
        "username": "johndoe",
        "full_name": "John Doe",
        "avatar_url": "https://example.com/avatar.jpg",
        "website": "https://example.com",
        "email": "john@example.com",
        "created_at": "2023-01-01T00:00:00.000Z",
        "updated_at": "2023-01-01T00:00:00.000Z"
      }
    ],
    "count": 1,
    "page": 1,
    "pageSize": 10
  }
}
```

### Get Profile

```
GET /api/profiles/:id
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "username": "johndoe",
    "full_name": "John Doe",
    "avatar_url": "https://example.com/avatar.jpg",
    "website": "https://example.com",
    "email": "john@example.com",
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z"
  }
}
```

### Create Profile

```
POST /api/profiles
```

**Request Body:**
```json
{
  "username": "johndoe",
  "full_name": "John Doe",
  "avatar_url": "https://example.com/avatar.jpg",
  "website": "https://example.com"
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "username": "johndoe",
    "full_name": "John Doe",
    "avatar_url": "https://example.com/avatar.jpg",
    "website": "https://example.com",
    "email": "john@example.com",
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z"
  }
}
```

### Update Profile

```
PUT /api/profiles/:id
```

**Request Body:**
```json
{
  "username": "johndoe",
  "full_name": "John Doe",
  "avatar_url": "https://example.com/avatar.jpg",
  "website": "https://example.com"
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "username": "johndoe",
    "full_name": "John Doe",
    "avatar_url": "https://example.com/avatar.jpg",
    "website": "https://example.com",
    "email": "john@example.com",
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z"
  }
}
```

### Delete Profile

```
DELETE /api/profiles/:id
```

**Response:**
```json
{
  "data": {
    "message": "Profile deleted successfully"
  }
}
```

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

Common error codes:
- `UNAUTHORIZED`: User is not authenticated
- `FORBIDDEN`: User does not have permission to perform the action
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Request validation failed
- `INTERNAL_SERVER_ERROR`: Server error

## Authentication

All endpoints require authentication. The user can only access and modify their own profile. 