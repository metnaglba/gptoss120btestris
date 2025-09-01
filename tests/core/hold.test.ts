import { describe, it, expect } from 'vitest';
import { Hold } from '../../src/core/hold';
import { Piece } from '../../src/core/piece';

describe('Hold', () => {
  it('stores once per spawn and swaps afterwards', () => {
    const h = new Hold();
    const p = new Piece('I');

    const first = h.store(p);
    expect(first).toBeNull();

    // same spawn: cannot hold again
    expect(() => h.store(new Piece('J'))).toThrowError();

    // next spawn resets
    h.reset();
    const swapped = h.store(new Piece('T'));
    expect(swapped).not.toBeNull();
    expect(swapped!.kind).toBe('I');
  });
});


