import type { PlatformId, ConnectedAccount, SyncLog } from "./types";

export class OAuthService {
  private static instance: OAuthService;
  private accounts: ConnectedAccount[] = [];

  private constructor() {
    // Initial Mock State
    this.accounts = [
      {
        id: "acc_1",
        platformId: "linkedin",
        accountName: "Tony Stark",
        handle: "@ironman",
        status: "connected",
        lastSync: new Date(Date.now() - 3600000), // 1 hour ago
      }
    ];
  }

  public static getInstance(): OAuthService {
    if (!OAuthService.instance) {
      OAuthService.instance = new OAuthService();
    }
    return OAuthService.instance;
  }

  public getAccounts(): ConnectedAccount[] {
    return [...this.accounts];
  }

  public async connectAccount(platformId: PlatformId, onLog: (log: SyncLog) => void): Promise<ConnectedAccount> {
    onLog({ id: Date.now().toString(), timestamp: new Date(), level: 'info', message: `Initiating OAuth handshake for ${platformId}...` });
    
    // Simulate OAuth delay
    await new Promise(r => setTimeout(r, 1500));
    onLog({ id: Date.now().toString(), timestamp: new Date(), level: 'info', message: `Token exchange complete. Encrypting tokens...` });
    
    await new Promise(r => setTimeout(r, 1000));
    
    const newAccount: ConnectedAccount = {
      id: `acc_${Date.now()}`,
      platformId,
      accountName: `User ${Math.floor(Math.random() * 1000)}`,
      handle: `@user_${Math.floor(Math.random() * 1000)}`,
      status: "connected",
      lastSync: new Date(),
    };

    this.accounts.push(newAccount);
    onLog({ id: Date.now().toString(), timestamp: new Date(), level: 'success', message: `Successfully connected ${platformId} account.` });
    return newAccount;
  }

  public async disconnectAccount(accountId: string, onLog: (log: SyncLog) => void) {
    onLog({ id: Date.now().toString(), timestamp: new Date(), level: 'warn', message: `Revoking OAuth tokens for account ${accountId}...` });
    await new Promise(r => setTimeout(r, 1000));
    
    this.accounts = this.accounts.filter(a => a.id !== accountId);
    onLog({ id: Date.now().toString(), timestamp: new Date(), level: 'success', message: `Account disconnected securely.` });
  }

  public async syncAccount(accountId: string, onLog: (log: SyncLog) => void) {
    onLog({ id: Date.now().toString(), timestamp: new Date(), level: 'info', message: `Validating connection health for ${accountId}...` });
    await new Promise(r => setTimeout(r, 1500));
    
    const acc = this.accounts.find(a => a.id === accountId);
    if (acc) {
      acc.lastSync = new Date();
      acc.status = "connected";
    }
    onLog({ id: Date.now().toString(), timestamp: new Date(), level: 'success', message: `Sync complete. Tokens valid.` });
  }
}
