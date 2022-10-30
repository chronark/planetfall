export class  ApiError extends Error {
  public readonly status: number;
  constructor(opts: { status: number; message: string }) {
      super(opts.message);
      this.status = opts.status;
    }
  }