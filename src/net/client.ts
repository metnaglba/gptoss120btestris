import type { ClientToServer, ServerToClient } from './messages';

export interface INetworkClient {
  connect(url: string): Promise<void>;
  send(msg: ClientToServer): void;
  onMessage(handler: (msg: ServerToClient) => void): void;
  close(): void;
}

export class DummyClient implements INetworkClient {
  private handler: ((msg: ServerToClient) => void) | null = null;
  async connect(url: string): Promise<void> { void url; /* no-op */ }
  send(msg: ClientToServer): void { void msg; /* no-op */ }
  onMessage(handler: (msg: ServerToClient) => void): void { this.handler = handler; }
  close(): void { this.handler = null; }
}


