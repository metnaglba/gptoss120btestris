// 네트워킹 메시지 타입 정의 (스텁)
export type JoinRoom = { type: 'join'; roomId: string; nickname: string };
export type InputMsg = { type: 'input'; frame: number; input: 'L'|'R'|'D'|'ROT'|'HD'|'HOLD' };
export type StateDelta = { type: 'state'; frame: number; stateHash: string };
export type GarbageAttack = { type: 'garbage'; amount: number };
export type Heartbeat = { type: 'hb'; ts: number };

export type ServerToClient = StateDelta | GarbageAttack | Heartbeat;
export type ClientToServer = JoinRoom | InputMsg | Heartbeat;


