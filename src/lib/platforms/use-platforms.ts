import { useState, useMemo, useCallback } from "react";
import { ProviderRegistry } from "./provider-registry";
import { OAuthService } from "./oauth-service";
import type { PlatformProvider, ConnectedAccount, PlatformId, SyncLog } from "./types";

export type PlatformsState = ReturnType<typeof usePlatforms>;

export function usePlatforms() {
  const registry = useMemo(() => ProviderRegistry.getInstance(), []);
  const oauthService = useMemo(() => OAuthService.getInstance(), []);

  const [providers] = useState<PlatformProvider[]>(() => registry.getProviders());
  const [accounts, setAccounts] = useState<ConnectedAccount[]>(() => oauthService.getAccounts());
  const [activeAccountId, setActiveAccountId] = useState<string | null>(() => {
    const accs = oauthService.getAccounts();
    return accs.length > 0 ? accs[0].id : null;
  });
  
  // View states
  const [selectedProviderId, setSelectedProviderId] = useState<PlatformId | null>(null);
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [logs, setLogs] = useState<SyncLog[]>([]);

  const activeAccount = useMemo(() => accounts.find(a => a.id === activeAccountId) || null, [accounts, activeAccountId]);
  
  const activeProvider = useMemo(() => {
    if (selectedProviderId) return registry.getProvider(selectedProviderId) || null;
    if (activeAccount) return registry.getProvider(activeAccount.platformId) || null;
    return null;
  }, [registry, activeAccount, selectedProviderId]);

  const addLog = useCallback((log: SyncLog) => {
    setLogs(prev => [...prev, log]);
  }, []);

  const connectPlatform = async (platformId: PlatformId) => {
    if (isConnecting) return;
    setIsConnecting(true);
    setLogs([]);
    
    try {
      const newAcc = await oauthService.connectAccount(platformId, addLog);
      setAccounts(oauthService.getAccounts());
      setActiveAccountId(newAcc.id);
      setSelectedProviderId(null);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectAccount = async (accountId: string) => {
    if (isSyncing) return;
    setIsSyncing(true);
    
    try {
      await oauthService.disconnectAccount(accountId, addLog);
      const remaining = oauthService.getAccounts();
      setAccounts(remaining);
      if (activeAccountId === accountId) {
        setActiveAccountId(remaining.length > 0 ? remaining[0].id : null);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const syncAccount = async (accountId: string) => {
    if (isSyncing) return;
    setIsSyncing(true);
    
    try {
      await oauthService.syncAccount(accountId, addLog);
      setAccounts(oauthService.getAccounts());
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    providers,
    accounts,
    activeAccount,
    activeProvider,
    activeAccountId,
    setActiveAccountId,
    selectedProviderId,
    setSelectedProviderId,
    connectPlatform,
    disconnectAccount,
    syncAccount,
    isConnecting,
    isSyncing,
    logs,
    setLogs
  };
}
