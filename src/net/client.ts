import type { ClientToServer, ServerToClient } from './messages';

export interface INetworkClient {
  connect(url: string): Promise<void>;
  send(msg: ClientToServer): void;
  onMessage(handler: (msg: ServerToClient) => void): void;
  close(): void;
}

export class DummyClient implements INetworkClient {
  async connect(_url: string): Promise<void> { /* no-op */ }
  send(_msg: ClientToServer): void { /* no-op */ }
  onMessage(_handler: (msg: ServerToClient) => void): void { /* no-op */ }
  close(): void { /* no-op */ }
}


