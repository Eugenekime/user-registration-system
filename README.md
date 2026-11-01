## Authorization and Protected Routes

### 1. What Is Protected and Why

The API uses authentication and authorization middleware to prevent unauthorized access to private resources and administrative operations.

The following resources are protected:

- **User profile:** Only authenticated users can view or update their own private profile.
- **Todos:** Authenticated users can access and manage their own todos. A user cannot access or modify another user's todos.
- **Email verification:** Certain protected operations require the user's email address to be verified.
- **Admin endpoints:** Only users with the `admin` role can access administrative operations.
- **Account status:** Deactivated accounts cannot access protected endpoints or refresh their authentication tokens.

Public endpoints, such as registration, login, and public profile information, do not require authentication.

### 2. Authorization Guards

#### Authentication Guard (`authenticateToken`)

Checks whether the request contains a valid access token.

Responsibilities:

- Extracts the access token from the `Authorization` header.
- Verifies the JWT signature and expiration.
- Checks that the token is an access token.
- Retrieves the user from the database.
- Checks whether the account is active.
- Attaches the authenticated user's information to `req.user`.

If authentication fails, the API returns `401 Unauthorized`.

A deactivated account receives `403 Forbidden`.

#### Email Verification Guard (`requireEmailVerified`)

Checks whether the authenticated user's email address has been verified.

Responsibilities:

- Requires an authenticated user.
- Checks `req.user.isEmailVerified`.
- Prevents unverified users from accessing endpoints that require email verification.

If the email address is not verified, the API returns `403 Forbidden`.

#### Role Guard (`authorizeRole`)

Restricts access based on the user's role.

Responsibilities:

- Reads the authenticated user's roles from `req.user.roles`.
- Checks whether the user has one of the required roles.
- Allows access only when the required role is present.

For example:

```ts
router.get(
  '/admin/users',
  authenticateToken,
  authorizeRole('admin'),
  getUsersController
);
```

Users without the required role receive `403 Forbidden`.

#### Ownership Guard

Ensures that users can access or modify only resources they own.

For example, when accessing a todo, the server checks that its `userId` matches the authenticated user's ID.

The ownership check must be performed on the server using `req.user.sub`, not a user ID supplied by the client.

Example:

```ts
const todo = await Todo.findOne({
  _id: todoId,
  userId: req.user.sub,
});

if (!todo) {
  throw new AppError('Todo not found', 404, 'TODO_NOT_FOUND');
}
```

This prevents users from accessing another user's private data by changing an ID in the URL.

### 3. Manual Testing

The following examples use `curl.exe` and PowerShell.

Replace the placeholder values with actual IDs and tokens from your application.

Set the API URL:

```powershell
$BASE_URL = "http://localhost:3000"
```

#### Test 1: Access a protected endpoint without authentication

```powershell
curl.exe -i "$BASE_URL/api/profile"
```

Expected result:

- HTTP `401 Unauthorized`
- Authentication error response.

#### Test 2: Access a protected endpoint with an access token

```powershell
$ACCESS_TOKEN = "YOUR_ACCESS_TOKEN"

curl.exe -i "$BASE_URL/api/profile" `
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Expected result:

- HTTP `200 OK`
- The authenticated user's private profile is returned.

#### Test 3: Access an email-protected endpoint with an unverified account

```powershell
curl.exe -i "$BASE_URL/api/protected/todos" `
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Expected result:

- HTTP `403 Forbidden`
- `EMAIL_NOT_VERIFIED` error.

This test requires an account whose email address has not been verified.

#### Test 4: Access an admin endpoint as a regular user

```powershell
curl.exe -i "$BASE_URL/api/admin/statistics" `
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Expected result:

- HTTP `403 Forbidden`
- Access denied because the user does not have the `admin` role.

#### Test 5: Access an admin endpoint as an administrator

```powershell
$ADMIN_TOKEN = "ADMIN_ACCESS_TOKEN"

curl.exe -i "$BASE_URL/api/admin/statistics" `
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Expected result:

- HTTP `200 OK`
- Administrative statistics are returned.

#### Test 6: Try to access another user's todo

```powershell
$OTHER_TODO_ID = "ANOTHER_USERS_TODO_ID"

curl.exe -i "$BASE_URL/api/protected-todos/$OTHER_TODO_ID" `
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Expected result:

- The request must not return another user's todo.
- Depending on the implementation, the API returns `403 Forbidden` or `404 Not Found`.

#### Test 7: Access the API with a deactivated account

```powershell
curl.exe -i "$BASE_URL/api/profile" `
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Expected result:

- HTTP `403 Forbidden`
- `ACCOUNT_DEACTIVATED` error.

This test requires an account that has been deactivated by an administrator.

### 4. Security Notes

- Access tokens have a limited lifetime.
- Refresh tokens are stored as hashes in the database.
- Refresh token rotation is used to issue new authentication tokens.
- Deactivating an account revokes its stored refresh tokens.
- Passwords are stored as bcrypt hashes, never as plaintext.
- Sensitive user fields, such as password hashes and refresh token hashes, are excluded from normal API responses.
- Admin operations require both authentication and the appropriate role.
- Ownership checks are performed on the server side.
- Helmet is used to configure HTTP security headers.
- CORS restricts browser access to the configured frontend origin.
- Rate limiting protects authentication and administrative write endpoints from excessive requests.

**Note:** The endpoint paths in these examples should match the paths configured in the Express routers. The test cases for unverified and deactivated accounts require separate test users with the corresponding account states.
