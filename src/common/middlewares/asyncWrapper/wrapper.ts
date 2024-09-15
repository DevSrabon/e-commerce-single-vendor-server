import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import CustomError from "../../../utils/lib/customError";
import ValidationErr from "../../../utils/lib/validationError";

type Func = (req: Request, res: Response, next: NextFunction) => Promise<void>;

class Wrapper {
  // CONTROLLER ASYNCWRAPPER
  public wrap(cb: Func) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const errors = validationResult(req);

        // throw error if there are any invalid inputs

        console.log(errors.array());
        if (!errors.isEmpty()) {
          throw new ValidationErr(errors);
        }

        await cb(req, res, next);
      } catch (err: any) {
        console.log({ err });

        next(new CustomError(err.message, err.status, err.type));
      }
    };
  }
}

export default Wrapper;
