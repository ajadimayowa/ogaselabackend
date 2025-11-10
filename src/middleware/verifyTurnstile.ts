import { Request, Response, NextFunction } from 'express';
import axios from 'axios';

export const verifyTurnstile = async (req: Request, res: Response, next: NextFunction):Promise<any> => {
  const token = req.body.token;
  const secret = process.env.CLOUDFLARE_TURNSTILE_SECRET!;

  if (!token) {
    return res.status(400).json({ success: false, message: 'Turnstile token missing.' });
  }

  console.log({seeSecret:secret})

  try {
    const response = await axios.post(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      new URLSearchParams({ secret, response: token })
    );

    const data = response.data;

    if (!data.success) {
      console.warn('Turnstile verification failed:', data['error-codes']);
      return res.status(403).json({
        success: false,
        message: 'Human verification failed. Please retry.',
      });
    }

    next(); // Token valid → move to actual login logic
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return res.status(500).json({ success: false, message: 'Verification service error.' });
  }
};