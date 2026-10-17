export class ServerFunctionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ServerFunctionError";
  }
}
