import { base44 } from '@/api/base44Client';

/**
 * Integration Service Layer
 * Handles all integration operations including OAuth flows, API key connections, and IMAP/SMTP
 */
class IntegrationService {
  /**
   * Get all integrations for current user
   */
  async getUserIntegrations() {
    return await base44.entities.Integration.list();
  }

  /**
   * Get integration by ID
   */
  async getIntegration(id) {
    return await base44.entities.Integration.get(id);
  }

  /**
   * Connect integration via OAuth
   * @param {string} provider - Provider key (e.g., 'GMAIL', 'OUTLOOK')
   * @param {string} integrationType - Integration type (e.g., 'email', 'calendar')
   * @param {object} settings - Additional settings
   * @returns {Promise<object>} Created integration
   */
  async connectOAuthIntegration(provider, integrationType, settings = {}) {
    try {
      // Step 1: Initiate OAuth flow
      const { authUrl, state } = await base44.orchestrator.initiateOAuth(provider, integrationType);
      
      // Step 2: Open OAuth popup
      return new Promise((resolve, reject) => {
      const popup = window.open(
        authUrl,
        `${provider}-oauth`,
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        reject(new Error('Popup blocked. Please allow popups for this site.'));
        return;
      }

      // Listen for OAuth callback
      const messageListener = async (event) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'OAUTH_SUCCESS') {
          window.removeEventListener('message', messageListener);
          popup.close();
          
          try {
            // Step 3: Handle callback on backend
            const integration = await base44.orchestrator.handleOAuthCallback(
              provider,
              event.data.code,
              event.data.state
            );
            
            // Step 4: Create integration record
            const integrationData = {
              integration_type: integrationType,
              provider: provider,
              user_id: integration.userId || integration.user_id,
              status: 'Active',
              settings: settings,
              access_token: integration.accessToken || integration.access_token,
              refresh_token: integration.refreshToken || integration.refresh_token,
              token_expires_at: integration.expiresAt || integration.token_expires_at,
              connected_email: integration.email || integration.connected_email,
            };
            
            const created = await base44.entities.Integration.create(integrationData);
            resolve(created);
          } catch (error) {
            reject(error);
          }
        } else if (event.data.type === 'OAUTH_ERROR') {
          window.removeEventListener('message', messageListener);
          popup.close();
          reject(new Error(event.data.error || 'OAuth authentication failed'));
        }
      };

      window.addEventListener('message', messageListener);

      // Check if popup was closed
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
          reject(new Error('OAuth flow cancelled'));
        }
      }, 1000);
    });
    } catch (error) {
      // If backend endpoint is not available, provide helpful error message
      if (error.message && (error.message.includes('404') || error.message.includes('not found') || error.message.includes('not available'))) {
        throw new Error('OAuth integration endpoint is not available on the backend. Please ensure the backend has the integration OAuth endpoints implemented at /api/integrations/oauth/:provider/authorize');
      }
      throw error;
    }
  }

  /**
   * Connect integration via API Key (e.g., Google Maps, WhatsApp)
   * @param {string} provider - Provider key
   * @param {string} integrationType - Integration type
   * @param {string} apiKey - API key
   * @param {object} settings - Additional settings
   * @returns {Promise<object>} Created integration
   */
  async connectApiKeyIntegration(provider, integrationType, apiKey, settings = {}) {
    const integrationData = {
      integration_type: integrationType,
      provider: provider,
      auth_type: 'api_key',
      status: 'Active',
      settings: {
        ...settings,
        api_key: apiKey, // Will be encrypted on backend
      },
    };

    return await base44.entities.Integration.create(integrationData);
  }

  /**
   * Connect IMAP/SMTP email
   * @param {string} email - Email address
   * @param {object} imapConfig - IMAP configuration
   * @param {object} smtpConfig - SMTP configuration
   * @param {object} settings - Additional settings
   * @returns {Promise<object>} Created integration
   */
  async connectIMAPIntegration(email, imapConfig, smtpConfig, settings = {}) {
    const integrationData = {
      integration_type: 'Email',
      provider: 'IMAP/SMTP',
      auth_type: 'imap_smtp',
      status: 'Active',
      settings: {
        ...settings,
        email: email,
        imap: {
          host: imapConfig.host,
          port: imapConfig.port,
          secure: imapConfig.secure,
          username: imapConfig.username,
          password: imapConfig.password, // Encrypted on backend
        },
        smtp: {
          host: smtpConfig.host,
          port: smtpConfig.port,
          secure: smtpConfig.secure,
          username: smtpConfig.username,
          password: smtpConfig.password, // Encrypted on backend
        },
      },
    };

    return await base44.entities.Integration.create(integrationData);
  }

  /**
   * Sync integration
   * @param {string} integrationId - Integration ID
   * @returns {Promise<object>} Sync result
   */
  async syncIntegration(integrationId) {
    return await base44.orchestrator.syncIntegration(integrationId);
  }

  /**
   * Refresh integration token
   * @param {string} integrationId - Integration ID
   * @returns {Promise<object>} Updated integration
   */
  async refreshToken(integrationId) {
    return await base44.orchestrator.refreshIntegrationToken(integrationId);
  }

  /**
   * Update integration settings
   * @param {string} integrationId - Integration ID
   * @param {object} updates - Updates to apply
   * @returns {Promise<object>} Updated integration
   */
  async updateIntegration(integrationId, updates) {
    return await base44.entities.Integration.update(integrationId, updates);
  }

  /**
   * Disconnect integration
   * @param {string} integrationId - Integration ID
   * @returns {Promise<boolean>} Success status
   */
  async disconnectIntegration(integrationId) {
    return await base44.entities.Integration.delete(integrationId);
  }

  /**
   * Test integration connection
   * @param {string} integrationId - Integration ID
   * @returns {Promise<object>} Test result
   */
  async testConnection(integrationId) {
    return await base44.orchestrator.testIntegration(integrationId);
  }
}

export default new IntegrationService();

