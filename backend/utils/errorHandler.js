function handleError(res, error, userMessage = 'An error occurred') {
    console.error(error);
    const statusCode = error.statusCode || 500;
    const message = error.userMessage || userMessage;
    res.status(statusCode).json({message});
}

module.exports = handleError;
