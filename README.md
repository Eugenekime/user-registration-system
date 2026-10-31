## Test Yourself / How to Test

Follow these steps to run the server and test the authentication, user profile, and admin endpoints.

### 0. Start the server

```bash
npm install
npm run dev
```

The server should be available at `http://localhost:3000`.

### 1. Prepare test users

Use the registration endpoint from the previous project or seed users manually.

You need two users:

- **Normal user:** role `user`
- **Admin user:** role `admin`

### 2. Login and get tokens

Log in with the normal user. The refresh token will be stored automatically in an HTTP-only cookie.

```bash
curl -i -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"user@example.com","password":"Password123!"}'
```

**Expected result:**

- `200 OK`
- Response contains an `accessToken`.
- The server sets a refresh token in an HTTP-only cookie.

Save the returned access token. You will need it in the following steps.

### 3. Access the protected route (`GET /api/me`)

Replace `<ACCESS_TOKEN>` with the access token received during login.

```bash
curl -s http://localhost:3000/api/me \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

**Expected result:**

- `200 OK` with the authenticated user's profile.
- `401 Unauthorized` if the token is missing, invalid, or expired.

### 4. Update your own profile (`PATCH /api/me`)

```bash
curl -s -X PATCH http://localhost:3000/api/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -d '{"profile":{"firstName":"New","lastName":"Name","bio":"Hello"}}'
```

**Expected result:**

- `200 OK` with the updated profile.

### 5. Access an admin route as a normal user

```bash
curl -s http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

**Expected result:**

- `403 Forbidden` because the authenticated user does not have the `admin` role.

### 6. Refresh the access token

The refresh token is sent automatically from `cookies.txt`.

```bash
curl -i -b cookies.txt -c cookies.txt -X POST http://localhost:3000/api/auth/refresh
```

**Expected result:**

- `200 OK` with a new `accessToken`.
- The server sets a new refresh token cookie if refresh token rotation is implemented.
- The old refresh token is revoked and cannot be reused.

### 7. Logout

The refresh token is sent automatically from `cookies.txt`.

```bash
curl -i -b cookies.txt -c cookies.txt -X POST http://localhost:3000/api/auth/logout
```

**Expected result:**

- `204 No Content`.
- The refresh token is revoked.
- The refresh token cookie is cleared.
- Trying to refresh again should return `401 Unauthorized`.

**Note:** The `cookies.txt` file is used only for local testing. Do not commit it to your repository. Add it to `.gitignore`.
