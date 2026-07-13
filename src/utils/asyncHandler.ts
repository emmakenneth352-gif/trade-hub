import express from "express";

export const catchAsync =
  (
    fn: (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => Promise<unknown>
  ) =>
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    fn(req, res, next).catch(next);
  };
