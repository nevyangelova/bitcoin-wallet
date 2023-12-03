const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dbQuery = require('../utils/dbQuery');
const handleError = require('../utils/errorHandler');

exports.signup = async (req, res) => {
    try {
        const {email, password, name} = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        await dbQuery(
            `INSERT INTO users (email, password, name) VALUES (?, ?, ?)`,
            [email, hashedPassword, name]
        );
        res.status(201).json({message: 'User created successfully'});
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT') {
            res.status(400).json({message: 'Email already exists'});
        } else {
            handleError(res, error, 'Error creating user');
        }
    }
};

exports.login = async (req, res) => {
    try {
        const {email, password} = req.body;

        const user = await dbQuery(`SELECT * FROM users WHERE email = ?`, [
            email,
        ]);
        if (!user) {
            res.status(400).send({message: 'User not found'});
        } else {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                res.status(400).send({message: 'Invalid password'});
            } else {
                const token = jwt.sign(
                    {userId: user.id, email: user.email},
                    process.env.JWT_SECRET,
                    {expiresIn: '1h'}
                );
                res.status(200).json({
                    message: 'Login successful',
                    token,
                    user: {id: user.id, name: user.name, email: user.email},
                });
            }
        }
    } catch (error) {
        handleError(res, error, 'Server error');
    }
};
