import { Request, Response } from 'express';
import { authService } from '../service/auth.service';

export const authController = {
  register: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
      }
      const user = await authService.registerUser(email, password);
      res.status(201).json({ message: 'User registered successfully', userId: user.id });
    } catch (error) {
      res.status(500).json({ message: 'Registration failed.' });
    }
  },

  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const token = await authService.loginUser(email, password);
      if (!token) {
        return res.status(401).json({ message: 'Invalid credentials.' });
      }
      res.status(200).json({ message: 'Login successful', accessToken: token });
    } catch (error) {
      res.status(500).json({ message: 'Login failed.' });
    }
  },
};