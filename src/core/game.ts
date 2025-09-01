import { Board } from './board';
import { Piece } from './piece';
import type { PieceKind } from './types';
import { Hold } from './hold';

export type Difficulty = 'Easy' | 'Normal' | 'Hard';
export interface GameSettings {
  fallSpeedMs: number;
  levelTimeSec: number;
}

export const DIFFICULTY_MAP: Record<Difficulty, GameSettings> = {
  Easy: { fallSpeedMs: 800, levelTimeSec: 60 },
  Normal: { fallSpeedMs: 500, levelTimeSec: 30 },
  Hard: { fallSpeedMs: 300, levelTimeSec: 15 },
};

export class GameCore {
  board = new Board();
  current!: Piece;
  next!: Piece;
  hold = new Hold();

  level = 1;
  lines = 0;
  score = 0;
  combo = 0;

  fallSpeedMs: number;
  levelTimeMsBase: number;
  remainingLevelMs: number;
  gameOver = false;

  isLockDelayActive = false;
  isLockDelayExpired = false;
  lockDelayDuration = 500;
  lockDelayDeadlineMs = 0;
  moveResetCount = 0;
  maxMoveResets = 15;
  nowMs = 0;

  settings: GameSettings;

  constructor(settings: GameSettings = DIFFICULTY_MAP['Normal']) {
    this.settings = settings;
    this.fallSpeedMs = settings.fallSpeedMs;
    this.levelTimeMsBase = settings.levelTimeSec * 1000;
    this.remainingLevelMs = this.levelTimeMsBase;
    // 필드 초기화 순서 문제 방지: 생성자에서 피스 초기화
    this.current = this.newPiece();
    this.next = this.newPiece();
  }

  private bag: PieceKind[] = [];
  private refillBag() {
    this.bag = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
    for (let i = this.bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
    }
  }
  private popBag(): PieceKind {
    if (this.bag.length === 0) this.refillBag();
    return this.bag.pop()!;
  }
  private newPiece(): Piece {
    return new Piece(this.popBag());
  }

  tick(deltaMs: number) {
    if (this.gameOver) return;
    this.nowMs += deltaMs;
    this.remainingLevelMs = Math.max(0, this.remainingLevelMs - deltaMs);
    if (this.remainingLevelMs === 0) {
      this.level += 1;
      this.applyNewLevel();
    }
    // auto-fall in outer loop responsibility
  }

  moveLeft() {
    if (this.current.move(-1, 0, this.board)) this.tryMoveReset();
  }
  moveRight() {
    if (this.current.move(1, 0, this.board)) this.tryMoveReset();
  }

  softDrop() {
    if (this.current.move(0, 1, this.board)) {
      this.score += 1;
    } else {
      if (this.isLockDelayExpired) {
        this.resetLockDelay();
        this.lockAndSpawn();
      } else {
        this.startLockDelay();
      }
    }
  }

  rotate() {
    if (this.isLockDelayExpired) return;
    const before = `${this.current.x},${this.current.y},${this.current.rotation}`;
    this.current.rotate(this.board, false);
    const after = `${this.current.x},${this.current.y},${this.current.rotation}`;
    if (before !== after) this.tryMoveReset();
  }

  hardDrop() {
    let d = 0;
    while (this.current.move(0, 1, this.board)) d++;
    this.score += d * 2;
    this.resetLockDelay();
    this.lockAndSpawn();
  }

  fallStep() {
    if (!this.current.move(0, 1, this.board)) {
      if (this.isLockDelayExpired) {
        this.resetLockDelay();
        this.lockAndSpawn();
      } else {
        this.startLockDelay();
      }
    } else {
      if (!this.isLockDelayActive) this.resetLockDelay();
    }
  }

  holdAction() {
    if (this.gameOver) return;
    // 기존 호환: 저장만 수행. 통합 로직은 holdOrRetrieve() 사용 권장
    this.holdOrRetrieve();
  }

  retrieveHoldAction() {
    // 스폰당 1회 규칙: retrieve 역시 canHold 가 true 일 때만 허용
    if (this.hold.kind === null || !this.hold.canHold) return;
    this.current = new Piece(this.hold.kind);
    this.current.rotation = this.hold.rotation;
    this.hold.kind = null;
    this.hold.canHold = false;
    if (!this.current.isValid(this.board)) {
      this.gameOver = true;
    }
  }

  // 통합 홀드 토글: Z 하나로 저장/꺼내기 처리
  holdOrRetrieve() {
    if (this.gameOver) return;
    if (!this.hold.canHold) return;
    if (this.hold.kind === null) {
      // 비어있으면 저장
      const stored = this.hold.store(this.current); // null 반환이 정상
      if (stored === null) {
        this.current = this.next;
        this.next = this.newPiece();
      }
    } else {
      // 내용이 있으면 꺼내기
      this.current = new Piece(this.hold.kind);
      this.current.rotation = this.hold.rotation;
      this.hold.kind = null;
      this.hold.canHold = false;
    }
    if (!this.current.isValid(this.board)) {
      this.gameOver = true;
    }
  }

  private startLockDelay() {
    if (!this.isLockDelayActive) {
      this.isLockDelayActive = true;
      this.lockDelayDeadlineMs = this.nowMs + this.lockDelayDuration;
      this.moveResetCount = 0;
    }
  }
  private resetLockDelay() {
    this.isLockDelayActive = false;
    this.isLockDelayExpired = false;
    this.lockDelayDeadlineMs = 0;
    this.moveResetCount = 0;
  }
  private tryMoveReset() {
    if (this.isLockDelayActive && !this.isLockDelayExpired && this.moveResetCount < this.maxMoveResets) {
      this.moveResetCount++;
      this.lockDelayDeadlineMs = this.nowMs + this.lockDelayDuration;
    }
  }
  checkLockTimeout() {
    if (this.isLockDelayActive && !this.isLockDelayExpired && this.nowMs >= this.lockDelayDeadlineMs) {
      this.isLockDelayExpired = true;
    }
  }

  private lockAndSpawn() {
    this.board.lock(this.current.kind, this.current.shape, this.current.x, this.current.y);
    const cleared = this.board.clearLines();
    if (cleared.length > 0) {
      this.processClears(cleared.length);
    } else {
      this.combo = 0;
    }
    this.current = this.next;
    this.next = this.newPiece();
    this.hold.reset();
    this.resetLockDelay();
    if (!this.current.isValid(this.board) || this.board.isGameOver()) {
      this.gameOver = true;
    }
  }

  private processClears(cleared: number) {
    const table: Record<number, number> = { 1: 40, 2: 100, 3: 300, 4: 1200 };
    if (table[cleared]) {
      const base = table[cleared] * this.level;
      this.score += base;
      if (this.combo > 0) {
        this.score += 50 * this.combo * this.level;
      }
      this.combo += 1;
      this.lines += cleared;
      const newLevel = Math.floor(this.lines / 10) + 1;
      if (newLevel > this.level) {
        this.level = newLevel;
        this.applyNewLevel();
      }
    }
  }

  private applyNewLevel() {
    this.fallSpeedMs = Math.max(100, this.fallSpeedMs - 50);
    this.remainingLevelMs = Math.max(5000, this.levelTimeMsBase - (this.level - 1) * 2000);
  }
}