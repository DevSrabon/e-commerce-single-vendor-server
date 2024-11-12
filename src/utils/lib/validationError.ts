import { Result, ValidationError } from "express-validator";

interface IError {
  status: number;
  type: string;
  path: string;
}

class ValidationErr extends Error implements IError {
  status: number;
  type: string;
  path: string;

  constructor(error: Result<ValidationError>) {
    const firstError = error.array()[0];

    // Set a default message and path for error flexibility
    super(firstError.msg);
    this.status = 400;
    this.path = "path" in firstError ? firstError.path || "unknown" : "unknown";
    this.type = `Invalid input type for '${firstError.type}' ${this.path}`;
  }
}

export default ValidationErr;
