import type { IntegrationId, ConnectedIntegration, IntegrationLog } from "./types";
import { IntegrationRegistry } from "./integration-registry";

export class IntegrationService {
  private static instance: IntegrationService;
  private connections: ConnectedIntegration[] = [];

  private constructor() {
    // Initial Mock State
    this.connections = [
      {
        id: "conn_1",
        providerId: "gmail",
        status: "connected",
        lastSync: new Date(Date.now() - 3600000), // 1 hour ago
        metadata: {
          account: "tony.stark@starkindustries.com",
          labels_synced: 14
        }
      }
    ];
  }

  public static getInstance(): IntegrationService {
    if (!IntegrationService.instance) {
      IntegrationService.instance = new IntegrationService();
    }
    return IntegrationService.instance;
  }

  public getConnections(): ConnectedIntegration[] {
    return [...this.connections];
  }

  public async connectProvider(providerId: IntegrationId, secret: string | undefined, onLog: (log: IntegrationLog) => void): Promise<ConnectedIntegration> {
    const registry = IntegrationRegistry.getInstance();
    const provider = registry.getProvider(providerId);
    
    onLog({ id: Date.now().toString(), timestamp: new Date(), level: 'info', message: `Initiating connection to ${provider?.name}...` });
    
    // Simulate API or OAuth delay
    await new Promise(r => setTimeout(r, 1500));

    if (provider?.authType === 'apikey' && !secret) {
      onLog({ id: Date.now().toString(), timestamp: new Date(), level: 'error', message: `Missing API Key for ${provider.name}.` });
      throw new Error("Missing API Key");
    }

    onLog({ id: Date.now().toString(), timestamp: new Date(), level: 'info', message: `Validating credentials with ${provider?.name}...` });
    await new Promise(r => setTimeout(r, 1000));
    
    const newConnection: ConnectedIntegration = {
      id: `conn_${Date.now()}`,
      providerId,
      status: "connected",
      lastSync: new Date(),
      metadata: providerId === 'groq' ? { models: ['llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768'] } : { account: "test_account@jarvis.ai" }
    };

    this.connections.push(newConnection);
    onLog({ id: Date.now().toString(), timestamp: new Date(), level: 'success', message: `Successfully connected ${provider?.name}.` });
    return newConnection;
  }

  public async disconnectProvider(connectionId: string, onLog: (log: IntegrationLog) => void) {
    onLog({ id: Date.now().toString(), timestamp: new Date(), level: 'warn', message: `Revoking credentials for connection ${connectionId}...` });
    await new Promise(r => setTimeout(r, 1000));
    
    this.connections = this.connections.filter(c => c.id !== connectionId);
    onLog({ id: Date.now().toString(), timestamp: new Date(), level: 'success', message: `Connection revoked successfully.` });
  }

  public async testConnection(connectionId: string, onLog: (log: IntegrationLog) => void) {
    onLog({ id: Date.now().toString(), timestamp: new Date(), level: 'info', message: `Pinging API endpoint for health check...` });
    await new Promise(r => setTimeout(r, 1500));
    
    const conn = this.connections.find(c => c.id === connectionId);
    if (conn) {
      conn.lastSync = new Date();
      conn.status = "connected";
    }
    onLog({ id: Date.now().toString(), timestamp: new Date(), level: 'success', message: `Health check passed. Latency: ${Math.floor(Math.random() * 50 + 20)}ms` });
  }
}
