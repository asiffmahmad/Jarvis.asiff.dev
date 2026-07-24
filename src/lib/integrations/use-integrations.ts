import { useState, useMemo, useCallback } from "react";
import { IntegrationRegistry } from "./integration-registry";
import { IntegrationService } from "./integration-service";
import type { IntegrationProvider, ConnectedIntegration, IntegrationId, IntegrationLog } from "./types";

export type IntegrationsState = ReturnType<typeof useIntegrations>;

export function useIntegrations() {
  const registry = useMemo(() => IntegrationRegistry.getInstance(), []);
  const service = useMemo(() => IntegrationService.getInstance(), []);

  const [providers] = useState<IntegrationProvider[]>(() => registry.getProviders());
  const [connections, setConnections] = useState<ConnectedIntegration[]>(() => service.getConnections());
  const [activeConnectionId, setActiveConnectionId] = useState<string | null>(() => {
    const conns = service.getConnections();
    return conns.length > 0 ? conns[0].id : null;
  });
  
  // View states
  const [selectedProviderId, setSelectedProviderId] = useState<IntegrationId | null>(null);
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [logs, setLogs] = useState<IntegrationLog[]>([]);

  const activeConnection = useMemo(() => connections.find(c => c.id === activeConnectionId) || null, [connections, activeConnectionId]);
  
  const activeProvider = useMemo(() => {
    if (selectedProviderId) return registry.getProvider(selectedProviderId) || null;
    if (activeConnection) return registry.getProvider(activeConnection.providerId) || null;
    return null;
  }, [registry, activeConnection, selectedProviderId]);

  const addLog = useCallback((log: IntegrationLog) => {
    setLogs(prev => [...prev, log]);
  }, []);

  const connectIntegration = async (providerId: IntegrationId, secret?: string) => {
    if (isConnecting) return;
    setIsConnecting(true);
    setLogs([]);
    
    try {
      const newConn = await service.connectProvider(providerId, secret, addLog);
      setConnections(service.getConnections());
      setActiveConnectionId(newConn.id);
      setSelectedProviderId(null);
    } catch (e: unknown) {
      addLog({ id: Date.now().toString(), timestamp: new Date(), level: 'error', message: (e as Error).message || 'Connection failed' });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectIntegration = async (connectionId: string) => {
    if (isTesting) return;
    setIsTesting(true);
    
    try {
      await service.disconnectProvider(connectionId, addLog);
      const remaining = service.getConnections();
      setConnections(remaining);
      if (activeConnectionId === connectionId) {
        setActiveConnectionId(remaining.length > 0 ? remaining[0].id : null);
      }
    } finally {
      setIsTesting(false);
    }
  };

  const testIntegration = async (connectionId: string) => {
    if (isTesting) return;
    setIsTesting(true);
    
    try {
      await service.testConnection(connectionId, addLog);
      setConnections(service.getConnections());
    } finally {
      setIsTesting(false);
    }
  };

  return {
    providers,
    connections,
    activeConnection,
    activeProvider,
    activeConnectionId,
    setActiveConnectionId,
    selectedProviderId,
    setSelectedProviderId,
    connectIntegration,
    disconnectIntegration,
    testIntegration,
    isConnecting,
    isTesting,
    logs,
    setLogs
  };
}
