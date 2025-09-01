import type { PieceKind } from './types';
import { COLUMNS } from './constants';
import { TETROMINOES } from './tetromino';
import { Board } from './board';
import { SRS_KICKS, SRS_KICKS_I } from './srs';

export class Piece {
  kind: PieceKind;
  rotation = 0;
  shape: number[][];
  x: number;
  y: number;

  constructor(kind: PieceKind) {
    this.kind = kind;
    this.shape = TETROMINOES[kind][this.rotation];
    this.x = Math.floor(COLUMNS / 2 - this.shape[0].length / 2);
    this.y = -this.shape.length;
  }

  private valid(board: Board): boolean {
    for (let dy = 0; dy < this.shape.length; dy++) {
      for (let dx = 0; dx < this.shape[dy].length; dx++) {
        if (!this.shape[dy][dx]) continue;
        const bx = this.x + dx,
          by = this.y + dy;
        if (!board.inside(bx, by) || !board.empty(bx, by)) return false;
      }
    }
    return true;
  }

  // 외부에서 현재 위치의 유효성을 점검하기 위한 공개 메서드
  isValid(board: Board): boolean {
    return this.valid(board);
  }

  move(dx: number, dy: number, board: Board) {
    this.x += dx;
    this.y += dy;
    if (!this.valid(board)) {
      this.x -= dx;
      this.y -= dy;
      return false;
    }
    return true;
  }

  rotate(board: Board, ccw = false) {
    const oldRot = this.rotation,
      oldShape = this.shape,
      oldX = this.x,
      oldY = this.y;
    const states = TETROMINOES[this.kind].length;
    this.rotation = (this.rotation + (ccw ? -1 : 1) + states) % states;
    this.shape = TETROMINOES[this.kind][this.rotation];

    // SRS kick
    const from = oldRot % 4;
    const to = this.rotation % 4;
    const key = `${from}>${to}`;
    const kicks = this.kind === 'I' ? SRS_KICKS_I[key] : SRS_KICKS[key];
    if (kicks) {
      for (const [kx, ky] of kicks) {
        this.x = oldX + kx;
        this.y = oldY + ky;
        if (this.valid(board)) return;
      }
    }
    // 실패 시 롤백
    this.rotation = oldRot;
    this.shape = oldShape;
    this.x = oldX;
    this.y = oldY;
  }
}