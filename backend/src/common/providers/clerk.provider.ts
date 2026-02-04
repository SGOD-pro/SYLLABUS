import { createClerkClient } from '@clerk/backend';

export const ClerkProvider = {
  provide: 'CLERK_CLIENT',
  useFactory: () =>
    createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY!,
    }),
};