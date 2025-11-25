import { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

/**
 * OAuth Callback Handler
 * Receives OAuth callback from provider and sends message to parent window
 */
export default function OAuthCallback() {
  const { provider } = useParams();
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  useEffect(() => {
    // Send message to parent window (opener)
    if (window.opener) {
      if (error) {
        window.opener.postMessage(
          { 
            type: 'OAUTH_ERROR', 
            error: errorDescription || error || 'Authentication failed',
            provider 
          },
          window.location.origin
        );
      } else if (code) {
        window.opener.postMessage(
          { 
            type: 'OAUTH_SUCCESS', 
            code, 
            state, 
            provider 
          },
          window.location.origin
        );
      } else {
        window.opener.postMessage(
          { 
            type: 'OAUTH_ERROR', 
            error: 'No authorization code received',
            provider 
          },
          window.location.origin
        );
      }
      // Close popup after a short delay
      setTimeout(() => {
        window.close();
      }, 500);
    } else {
      // If no opener, redirect to integrations page
      console.warn('OAuth callback: No opener window found');
      setTimeout(() => {
        window.location.href = '/settings?tab=integrations';
      }, 2000);
    }
  }, [code, state, error, errorDescription, provider]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-600" />
        <p className="text-lg font-medium text-gray-900">
          {error ? 'Authentication failed' : 'Completing authentication...'}
        </p>
        {error && (
          <p className="text-sm text-red-600">{errorDescription || error}</p>
        )}
        <p className="text-sm text-gray-500">
          {error ? 'Redirecting...' : 'This window will close automatically'}
        </p>
      </div>
    </div>
  );
}

