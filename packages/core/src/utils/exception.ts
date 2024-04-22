export class Exception extends Error {
  details: string;

  constructor(
    message: string,
    public readonly statusCode = 400,
    response?: any,
  ) {
    super(message);
    this.details = response;
  }
}
