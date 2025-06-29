export {}; // Make this file an external module

declare global {
  namespace Express {
    interface Request {
      user?: { userId: string; email: string };
    }
  }
}