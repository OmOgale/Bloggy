import { NextFunction, Request, Response } from "express";

// Express 4 ignores rejected promises from async handlers, and on Node 20 an unhandled rejection kills the process.
// Wrapping a handler passes any rejection on to `next`, so `errorHandler` responds instead.
const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => unknown) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export default asyncHandler;
