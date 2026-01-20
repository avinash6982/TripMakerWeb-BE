# Integration Guide

This backend provides simple register and login functionality using
file-based storage (no external database). Update this file whenever
endpoints, payloads, or configuration change.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. (Optional) Configure environment:
   ```bash
   cp .env.example .env
   ```
3. Start the server:
   ```bash
   npm run start
   ```

## Configuration

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `3000` | Port used by the HTTP server. |
| `USER_DB_PATH` | `data/users.json` | Path to the JSON file that stores users. |
| `CORS_ORIGINS` | `*` | Comma-separated list of allowed origins or `*`. |

The users file is created automatically if it does not exist. When running on
Vercel, the filesystem is read-only, so the server defaults to
`/tmp/tripmaker-users.json` (ephemeral). Set `USER_DB_PATH` explicitly if you
want a different writable location.

## CORS

If the frontend runs on another origin, allow it via `CORS_ORIGINS`:

```
CORS_ORIGINS=https://trip-maker-web.vercel.app
```

## Data Storage Format

Users are stored as an array in the JSON file:

```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "passwordHash": "salt:hash",
    "createdAt": "2026-01-20T12:34:56.000Z"
  }
]
```

## API Endpoints

### `POST /register`

Create a new user account.

**Request**
```json
{
  "email": "user@example.com",
  "password": "plain-text-password"
}
```

**Success Response (201)**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "createdAt": "2026-01-20T12:34:56.000Z"
}
```

**Error Responses**
- `400` if email or password is missing.
- `409` if the email is already registered.

### `POST /login`

Validate credentials and return basic user info.

**Request**
```json
{
  "email": "user@example.com",
  "password": "plain-text-password"
}
```

**Success Response (200)**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "message": "Login successful."
}
```

**Error Responses**
- `400` if email or password is missing.
- `401` if credentials are invalid.

### `GET /health`

Returns server status.

**Response (200)**
```json
{ "status": "ok" }
```

## Example Usage

Register:
```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"my-secret"}'
```

Login:
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"my-secret"}'
```
