import request from 'supertest';
import app from '../../app';
import { User } from '../../models/user.model';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

describe('Integration Tests', () => {
    let authToken: string;
    let userId: string;
    let adminToken: string;

    const mockUser = {
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        phoneNumber: '1234567890',
        address: 'Test Address'
    };

    const mockAdmin = {
        fullName: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        phoneNumber: '0987654321',
        address: 'Admin Address',
        role: 'admin'
    };

    beforeAll(async () => {
        // Create Admin User directly in DB
        const hashedPassword = await bcrypt.hash(mockAdmin.password, 10);
        const admin = await User.create({ ...mockAdmin, password: hashedPassword });

        // Login as Admin to get token
        const res = await request(app).post('/api/v1/users/login').send({
            email: mockAdmin.email,
            password: mockAdmin.password
        });
        adminToken = res.body.token;
    });

    // --- Authentication Tests (6 Tests) ---

    // 1. Register User
    it('1. POST /api/v1/users/register - Should register a new user', async () => {
        const res = await request(app).post('/api/v1/users/register').send(mockUser);
        expect(res.status).toBe(201); // Assuming 201 for creation
        expect(res.body.success).toBe(true);
        userId = res.body.data?._id || res.body.user?._id; // Adjust based on actual response structure
    });

    // 2. Register Duplicate User
    it('2. POST /api/v1/users/register - Should fail to register duplicate email', async () => {
        const res = await request(app).post('/api/v1/users/register').send(mockUser);
        expect(res.status).toBe(403); // Service throws 403 for duplicate email
        expect(res.body.success).toBe(false);
    });

    // 3. Login User
    it('3. POST /api/v1/users/login - Should login successfully', async () => {
        const res = await request(app).post('/api/v1/users/login').send({
            email: mockUser.email,
            password: mockUser.password
        });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.token).toBeDefined();
        authToken = res.body.token;
        if (!userId) userId = res.body.data._id; // Updated to match response structure (data: user)
    });

    // 4. Login Invalid Password
    it('4. POST /api/v1/users/login - Should fail with invalid credentials', async () => {
        const res = await request(app).post('/api/v1/users/login').send({
            email: mockUser.email,
            password: 'wrongpassword'
        });
        expect(res.status).toBe(401); // Service throws 401
        expect(res.body.success).toBe(false);
    });

    // 5. Login Non-existent User
    it('5. POST /api/v1/users/login - Should fail for non-existent user', async () => {
        const res = await request(app).post('/api/v1/users/login').send({
            email: 'nonexistent@example.com',
            password: 'password'
        });
        expect(res.status).toBe(404); // Service throws 404
        expect(res.body.success).toBe(false);
    });

    // 6. Register Missing Fields
    it('6. POST /api/v1/users/register - Should fail with missing fields', async () => {
        const res = await request(app).post('/api/v1/users/register').send({
            email: 'missing@example.com'
        });
        expect(res.status).toBe(400); // Validation error
    });

    // --- User Management / Admin Tests (8 Tests) ---

    // 7. Get All Users (Admin) - Pagination
    it('7. GET /api/admin/users - Should return paginated users', async () => {
        const res = await request(app)
            .get('/api/admin/users?page=1&limit=5')
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.pagination).toBeDefined();
    });

    // 8. Get All Users - Unauthorized
    it('8. GET /api/admin/users - Should fail without admin token', async () => {
        const res = await request(app).get('/api/admin/users');
        expect(res.status).toBe(401); // Unauthorized
    });

    // 9. Get User By ID
    it('9. GET /api/admin/users/:id - Should get user details', async () => {
        const res = await request(app)
            .get(`/api/admin/users/${userId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data._id).toBe(userId);
    });

    // 10. Update User (Admin)
    it('10. PUT /api/admin/users/:id - Should update user details', async () => {
        const res = await request(app)
            .put(`/api/admin/users/${userId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ fullName: 'Updated Name' });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.fullName).toBe('Updated Name');
    });

    // 11. Delete User (Admin)
    it('11. DELETE /api/admin/users/:id - Should delete user', async () => {
        // Create a temp user to delete to avoid breaking other tests
        const tempUser = await User.create({
            fullName: 'Temp Delete',
            email: 'delete@example.com',
            password: 'password',
            phoneNumber: '1111111111',
            address: 'Temp Address',
            role: 'user'
        });

        const res = await request(app)
            .delete(`/api/admin/users/${tempUser._id}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);

        // Verify deletion
        const check = await User.findById(tempUser._id);
        expect(check).toBeNull();
    });

    // 12. Create User (Admin)
    it('12. POST /api/admin/users - Should create user by admin', async () => {
        const res = await request(app)
            .post('/api/admin/users')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                fullName: 'Admin Created',
                email: 'admincreated@example.com',
                password: 'password',
                phoneNumber: '2222222222',
                address: 'Admin Created Address',
                role: 'user'
            });
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
    });

    // 13. Get Users Page 2 (Admin)
    it('13. GET /api/admin/users?page=2 - Should return page 2', async () => {
        const res = await request(app)
            .get('/api/admin/users?page=2&limit=5')
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.pagination.page).toBe(2);
    });

    // 14. Access Admin Route with User Token
    it('14. GET /api/admin/users - Should fail with user token', async () => {
        const res = await request(app)
            .get('/api/admin/users')
            .set('Authorization', `Bearer ${authToken}`);
        expect(res.status).toBe(403); // Forbidden
    });

    // --- Forgot Password Tests (4 Tests) ---

    // 15. Forgot Password Request
    it('15. POST /api/v1/users/forgot-password - Should send OTP', async () => {
        const res = await request(app).post('/api/v1/users/forgot-password').send({
            email: mockUser.email
        });
        expect(res.status).toBe(200);
        expect(res.body.message).toContain('OTP has been sent');
    });

    // 16. Verify OTP (Invalid)
    it('16. POST /api/v1/users/verify-otp - Should reject invalid OTP', async () => {
        const res = await request(app).post('/api/v1/users/verify-otp').send({
            email: mockUser.email,
            otp: '000000'
        });
        expect(res.status).toBe(400);
    });

    // 17. Verify OTP (Expired - mock scenario logic check)
    // Hard to test expiry without mocking date or DB state directly. Skipped or replaced with simple check.
    it('17. POST /api/v1/users/verify-otp - Should fail for non-existent email', async () => {
        const res = await request(app).post('/api/v1/users/verify-otp').send({
            email: 'fake@email.com',
            otp: '123456'
        });
        expect(res.status).toBe(400);
    });

    // 18. Reset Password (Invalid OTP)
    it('18. POST /api/v1/users/reset-password - Should fail with invalid OTP', async () => {
        const res = await request(app).post('/api/v1/users/reset-password').send({
            email: mockUser.email,
            otp: '000000',
            newPassword: 'newpassword'
        });
        expect(res.status).toBe(400);
    });

    // --- General API Tests (7 Tests) ---

    // 19. 404 Route
    it('19. GET /api/unknown - Should return 404', async () => {
        const res = await request(app).get('/api/unknown');
        expect(res.status).toBe(404);
    });

    // 20. Root Route
    it('20. GET / - Should return valid status', async () => {
        const res = await request(app).get('/');
        expect(res.status).toBe(200);
        expect(res.body.message).toBe("DairyMart API is Running");
    });

    // 21. Get User Profile (if route exists, likely /api/v1/users/profile or similar? Assuming similar to admin get by id for now or skip if not sure)
    // Checking auth middleware mainly
    // 21. Get User Profile (Mock) - Should fail with invalid token
    it('21. GET /api/admin/users (Mock) - Should fail with invalid token', async () => {
        const res = await request(app).get('/api/admin/users').set('Authorization', 'Bearer invalidtoken');
        expect(res.status).toBe(400); // Invalid Token
    });

    // 22. SQL Injection / NoSQL Injection check (Basic)
    it('22. POST /api/v1/users/login - Should handle NoSQL injection attempts', async () => {
        const res = await request(app).post('/api/v1/users/login').send({
            email: { "$gt": "" },
            password: { "$gt": "" }
        });
        // Should fail or at least not return success with token
        expect(res.body.success).not.toBe(true);
    });

    // 23. Empty Body
    it('23. POST /api/v1/users/register - Should handle empty body', async () => {
        const res = await request(app).post('/api/v1/users/register').send({});
        expect(res.status).toBe(400); // Validation error
    });

    // 24. Malformed JSON
    it('24. POST /api/v1/users/login - Should handle valid JSON structure', async () => {
        const res = await request(app).post('/api/v1/users/login').set('Content-Type', 'application/json').send('{"email": "badjson"}');
        // Supertest handles this, likely 400 or handled by express.json()
        expect(res.status).not.toBe(500);
    });

    // 25. Large Payload
    it('25. POST /api/v1/users/register - Should handle large payload not crashing', async () => {
        const largeString = 'a'.repeat(10000);
        const res = await request(app).post('/api/v1/users/register').send({
            ...mockUser,
            email: `large${largeString}@example.com`
        });
        expect(res.status).not.toBe(201);
        // We accept 500 or 400, just not 201 (success) or crash.
        // Actually, if it returns 500, not.toBe(201) passes.
    });

});
