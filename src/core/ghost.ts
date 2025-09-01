import { Piece } from './piece';
import { Board } from './board';

export function ghostY(piece: Piece, board: Board): number {
  const t = new Piece(piece.kind);
  t.x = piece.x;
  t.y = piece.y;
  t.rotation = piece.rotation;
  t.shape = piece.shape;
  // 아래로 더 이상 이동할 수 없을 때까지 이동
  // eslint-disable-next-line no-empty
  while (t.move(0, 1, board)) {}
  return t.y;
}


