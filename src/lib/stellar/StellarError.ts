export class BadAddressError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'BadAddressError';
    }
}

// tslint:disable-next-line: max-classes-per-file
export class BadSeqError extends Error {
  constructor(message: string) {
    super(message);
      this.name = 'BadSeqError';
  }
}
