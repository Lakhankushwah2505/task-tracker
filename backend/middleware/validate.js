const { body, validationResult } = require('express-validator');

// Reusable task validation rules
const taskValidationRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3 }).withMessage('Title must be at least 3 characters')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),

  body('priority')
    .notEmpty().withMessage('Priority is required')
    .isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),

  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'done']).withMessage('Invalid status value'),

  body('category')
    .optional()
    .isIn(['general', 'work', 'personal', 'shopping', 'health']).withMessage('Invalid category'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),

  body('due')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601().withMessage('Due date must be a valid date'),
];

// Middleware to catch validation errors and respond
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

module.exports = { taskValidationRules, validate };
