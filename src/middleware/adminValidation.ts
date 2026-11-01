import { body } from 'express-validator';

export const putUserStatusValidation = [
  body('isActive')
    .exists()
    .withMessage('Account status is required')
    .bail()
    .isBoolean()
    .withMessage('isActive must be a boolean')
    .toBoolean(),
];
