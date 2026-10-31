import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError.js';
import { validationResult } from 'express-validator';
import { getAllTodoService } from '../services/todoService.js';

export async function getAllTodosController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      throw new AppError(
        'Invalid or expired access token',
        401,
        'INVALID_ACCESS_TOKEN'
      );
    }
    const page = (req.query.page as number | undefined) ?? 1;
    const limit = (req.query.limit as number | undefined) ?? 10;
    const completed = req.query.completed as boolean | undefined;
    const priority = req.query.priority as
      | 'low'
      | 'medium'
      | 'high'
      | undefined;
    const filters: {
      completed?: boolean;
      priority?: 'low' | 'medium' | 'high';
    } = {};

    if (completed !== undefined) {
      filters.completed = completed;
    }

    if (priority !== undefined) {
      filters.priority = priority;
    }
    const todos = await getAllTodoService(req.user.sub, page, limit, filters);

    return res.status(200).json({
      success: true,
      data: todos,
    });
  } catch (error) {
    return next(error);
  }
}

export async function postTodoController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      throw new AppError(
        'Invalid or expired access token',
        401,
        'INVALID_ACCESS_TOKEN'
      );
    }
  } catch (error) {}
}
