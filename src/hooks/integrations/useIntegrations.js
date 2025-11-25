import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import IntegrationService from '@/services/integrations/IntegrationService';
import { toast } from 'sonner';

/**
 * React Hook for managing integrations
 */
export function useIntegrations() {
  const queryClient = useQueryClient();

  // Get all integrations
  const { data: integrations = [], isLoading, error } = useQuery({
    queryKey: ['integrations'],
    queryFn: () => IntegrationService.getUserIntegrations(),
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
  });

  // Connect OAuth integration
  const connectOAuthMutation = useMutation({
    mutationFn: ({ provider, type, settings }) =>
      IntegrationService.connectOAuthIntegration(provider, type, settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast.success('Integration connected successfully');
    },
    onError: (error) => {
      toast.error(`Failed to connect: ${error.message}`);
    },
  });

  // Connect API Key integration
  const connectApiKeyMutation = useMutation({
    mutationFn: ({ provider, type, apiKey, settings }) =>
      IntegrationService.connectApiKeyIntegration(provider, type, apiKey, settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast.success('Integration connected successfully');
    },
    onError: (error) => {
      toast.error(`Failed to connect: ${error.message}`);
    },
  });

  // Connect IMAP/SMTP
  const connectIMAPMutation = useMutation({
    mutationFn: ({ email, imapConfig, smtpConfig, settings }) =>
      IntegrationService.connectIMAPIntegration(email, imapConfig, smtpConfig, settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast.success('Email integration connected successfully');
    },
    onError: (error) => {
      toast.error(`Failed to connect: ${error.message}`);
    },
  });

  // Sync integration
  const syncMutation = useMutation({
    mutationFn: (integrationId) => IntegrationService.syncIntegration(integrationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast.success('Sync completed');
    },
    onError: (error) => {
      toast.error(`Sync failed: ${error.message}`);
    },
  });

  // Disconnect integration
  const disconnectMutation = useMutation({
    mutationFn: (integrationId) => IntegrationService.disconnectIntegration(integrationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast.success('Integration disconnected');
    },
    onError: (error) => {
      toast.error(`Failed to disconnect: ${error.message}`);
    },
  });

  // Update integration
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }) => IntegrationService.updateIntegration(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast.success('Integration updated');
    },
    onError: (error) => {
      toast.error(`Update failed: ${error.message}`);
    },
  });

  // Test connection
  const testConnectionMutation = useMutation({
    mutationFn: (integrationId) => IntegrationService.testConnection(integrationId),
    onSuccess: () => {
      toast.success('Connection test successful');
    },
    onError: (error) => {
      toast.error(`Connection test failed: ${error.message}`);
    },
  });

  return {
    integrations,
    isLoading,
    error,
    connectOAuth: connectOAuthMutation.mutate,
    connectApiKey: connectApiKeyMutation.mutate,
    connectIMAP: connectIMAPMutation.mutate,
    sync: syncMutation.mutate,
    disconnect: disconnectMutation.mutate,
    update: updateMutation.mutate,
    testConnection: testConnectionMutation.mutate,
    isConnecting: connectOAuthMutation.isPending || connectApiKeyMutation.isPending || connectIMAPMutation.isPending,
    isSyncing: syncMutation.isPending,
    isTesting: testConnectionMutation.isPending,
  };
}

