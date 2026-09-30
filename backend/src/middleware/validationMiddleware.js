function validate(rules) {
  return async (req, res, next) => {
    const result = await Promise.all(rules.map((rule) => rule.run(req)));
    const errors = result.flatMap((item) => item.array());

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.map(({ path, msg }) => ({ field: path, message: msg })),
      });
    }

    return next();
  };
}

module.exports = validate;
