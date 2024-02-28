exports.handleValidationError = (error, res) => {
    if (error.message.includes('"password" with value')) {
        return res.status(400).send({
            status: 400,
            message: "Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one digit, and one special character.",
            error: true,
            data: {},
        });
    } else if (error.message.includes('"username" with value')) {
        return res.status(400).send({
            status: 400,
            message: "Number is not allowed in Username",
            error: true,
            data: {},
        });
    } else if (error && error.details && error.details.length > 0) {
        const errorMessage = error.details[0].message.replace(/"/g, '')
        const capitalizedErrorMessage = errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1);
        return res.status(400).send({
            status: 400,
            message: capitalizedErrorMessage,
            error: true,
            data: {},
        });
    } else if (error && error.code === 11000) {
        const duplicatedKey = Object.keys(error.keyPattern)[0];
        return res.status(400).send({
            status: 400,
            message: `${duplicatedKey.charAt(0).toUpperCase() + duplicatedKey.slice(1)} already exists`,
            error: true,
            data: {},
        });
    } else if ((error.message.includes('jwt expired'))) {
        return res.status(422).send({
            status: 422,
            message: "Your session has been expried",
            error: true,
            data: {},
        });
    } else {
        return res.status(500).send({
            status: 500,
            message: "Something went wrong",
            error: true,
            data: {},
        });
    }
};
