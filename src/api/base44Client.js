import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "68fd5f7f602b32c454a6ab92", 
  requiresAuth: true // Ensure authentication is required for all operations
});
