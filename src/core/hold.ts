import type { PieceKind } from './types';
import { Piece } from './piece';

export class Hold {
  kind: PieceKind | null = null;
  rotation = 0;
  canHold = true;

  reset(): void {
    this.canHold = true;
  }

  store(piece: Piece): Piece | null {
    if (!this.canHold) throw new Error('Hold can be used only once per spawn.');
    this.canHold = false;

    if (this.kind === null) {
      this.kind = piece.kind;
      this.rotation = piece.rotation;
      return null;
    }

    const oldKind = this.kind;
    const oldRot = this.rotation;
    this.kind = piece.kind;
    this.rotation = piece.rotation;
    const swapped = new Piece(oldKind);
    swapped.rotation = oldRot;
    return swapped;
  }
}


