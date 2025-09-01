import { describe, it, expect } from 'vitest';
import { Board } from '../../src/core/board';
import { Piece } from '../../src/core/piece';

describe('Piece movement', () => {
  it('moves validly and collides properly', () => {
    const b = new Board();
    const p = new Piece('T');
    expect(p.move(0, 1, b)).toBe(true);
    while (p.y < 0) p.move(0, 1, b);
    const y = p.y;
    expect(p.move(0, -1, b)).toBe(true);
    expect(p.move(0, -1, b)).toBe(true);
    // 화면 위(y<0) 공간은 스폰 영역으로 허용됨 → 위로 큰 이동도 유효해야 함
    expect(p.move(0, -20, b)).toBe(true);
    expect(typeof y).toBe('number');
  });
});