export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public errors: any = null
  ) {
    super(message);
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export const handleError = (err: any, res: any) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  }

  return res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

export const successResponse = (
  res: any,
  data: any,
  message: string = "Success",
  statusCode: number = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (
  res: any,
  message: string,
  statusCode: number = 400,
  errors: any = null
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
