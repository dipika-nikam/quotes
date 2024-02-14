const Joi = require('joi')

const quotesSchema = Joi.object({
    qutoes: Joi.string()
        .min(10)
        .max(155)
        .trim(true)
        .required(),
    like: Joi.number(),
    dislike: Joi.number(),
    comment: Joi.string(),
});

module.exports = quotesSchema;
