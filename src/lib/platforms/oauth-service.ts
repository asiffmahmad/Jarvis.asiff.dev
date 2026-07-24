import type { PlatformId, ConnectedAccount, SyncLog } from "./types";

export class OAuthService {
  private static instance: OAuthService;
  private accounts: ConnectedAccount[] = [];

  private constructor() {
    // Initial Mock State
    this.accounts = [
      {
        id: "acc_li_1",
        platformId: "linkedin",
        accountName: "Tony Stark",
        handle: "@ironman",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=tony",
        status: "connected",
        lastSync: new Date(Date.now() - 3600000),
      },
      {
        id: "acc_ig_1",
        platformId: "instagram",
        accountName: "Stark Industries",
        handle: "@starkindustries",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=stark",
        status: "connected",
        lastSync: new Date(Date.now() - 7200000),
      },
      {
        id: "acc_x_1",
        platformId: "x",
        accountName: "Tony Stark",
        handle: "@tonystark",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=tonyx",
        status: "connected",
        lastSync: new Date(Date.now() - 1800000),
      },
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
      accountName: platformId,
      handle: `@${platformId}`,
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
