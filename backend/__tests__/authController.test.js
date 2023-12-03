const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {signup, login} = require('../controllers/authController');
const dbQuery = require('../utils/dbQuery');
const handleError = require('../utils/errorHandler');

jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../utils/dbQuery');
jest.mock('../utils/errorHandler');

describe('Auth Controller', () => {
    describe('signup', () => {
        it('successfully creates a new user', async () => {
            bcrypt.hash.mockResolvedValue('hashedPassword');
            dbQuery.mockResolvedValue({
                /* response from INSERT operation */
            });

            const req = {
                body: {
                    email: 'test@example.com',
                    password: 'password123',
                    name: 'Test User',
                },
            };
            const res = {status: jest.fn().mockReturnThis(), json: jest.fn()};

            await signup(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'User created successfully',
            });
        });

        it('handles email already exists error', async () => {
            bcrypt.hash.mockResolvedValue('hashedPassword');
            dbQuery.mockRejectedValue({code: 'SQLITE_CONSTRAINT'});

            const req = {
                body: {
                    email: 'test@example.com',
                    password: 'password123',
                    name: 'Test User',
                },
            };
            const res = {status: jest.fn().mockReturnThis(), json: jest.fn()};

            await signup(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Email already exists',
            });
        });

        it('handles unexpected database errors during user creation', async () => {
            bcrypt.hash.mockResolvedValue('hashedPassword');
            dbQuery.mockRejectedValue(new Error('Unexpected database error'));

            const req = {
                body: {
                    email: 'unexpected@example.com',
                    password: 'password123',
                    name: 'Unexpected User',
                },
            };
            const res = {status: jest.fn().mockReturnThis(), json: jest.fn()};

            await signup(req, res);

            expect(handleError).toHaveBeenCalledWith(
                res,
                expect.any(Error),
                'Error creating user'
            );
        });
    });
    describe('login', () => {
        it('successfully logs in a user', async () => {
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue('fakeToken');
            dbQuery.mockResolvedValue({
                id: 1,
                email: 'test@example.com',
                password: 'hashedPassword',
                name: 'Test User',
            });

            const req = {
                body: {email: 'test@example.com', password: 'password123'},
            };
            const res = {status: jest.fn().mockReturnThis(), json: jest.fn()};

            await login(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Login successful',
                    token: 'fakeToken',
                    user: expect.any(Object),
                })
            );
        });

        it('handles incorrect password error', async () => {
            dbQuery.mockResolvedValue({
                id: 1,
                email: 'test@example.com',
                password: 'hashedPassword',
                name: 'Test User',
            });
            bcrypt.compare.mockResolvedValue(false);

            const req = {
                body: {email: 'test@example.com', password: 'wrongPassword'},
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            };

            await login(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({
                message: 'Invalid password',
            });
        });

        it('handles unexpected errors during login', async () => {
            dbQuery.mockRejectedValue(new Error('Unexpected database error'));

            const req = {
                body: {email: 'error@example.com', password: 'password123'},
            };
            const res = {status: jest.fn().mockReturnThis(), json: jest.fn()};

            await login(req, res);

            expect(handleError).toHaveBeenCalledWith(
                res,
                expect.any(Error),
                'Server error'
            );
        });
    });
});
