const express = require('express');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
require('dotenv').config();

// Routers
const authRouter = require('./routes/authRoutes');
const bitcoinRouter = require('./routes/bitcoinRoutes');
const plaidRouter = require('./routes/plaidRoutes');

// Middleware and Utilities
const handleError = require('./utils/errorHandler');
const authenticateToken = require('./middleware/authenticateToken');

const app = express();

// Middleware setup
app.use(cors());
app.use(bodyParser.json());
app.use('/auth', authRouter);
app.use('/bitcoin', authenticateToken, bitcoinRouter);
app.use('/plaid', authenticateToken, plaidRouter);

// Rate limiting setup
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(limiter);
app.use(handleError);

// Server initialization
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = app;
