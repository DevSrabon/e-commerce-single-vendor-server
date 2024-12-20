interface IError {
  status: number;
  type: string;
}

class CustomError extends Error implements IError {
  status: number;
  type: string;

  constructor(
    message: string,
    status: number,
    type: string = "Internal Server Error"
  ) {
    super(message);
    this.status = status;
    this.type = type;
  }
}

export default CustomError;
