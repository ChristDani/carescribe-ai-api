import e from 'express';

export const errorHandler = (
  err: Error,
  _req: e.Request,
  res: e.Response,
  _next: e.NextFunction
) => {
  console.error(err);

  res.status(500).json({
    message: err.message || 'Internal server error',
  });
};
