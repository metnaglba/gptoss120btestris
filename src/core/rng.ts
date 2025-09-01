import type { PieceKind } from './types';

export class SevenBagRng {
  private bag: PieceKind[] = [];

  constructor(_seed?: number) {
    // seed parameter is reserved for future use
  }

  private shuffle<T>(a: T[]): T[] {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  next(): PieceKind {
    if (this.bag.length === 0) {
      this.bag = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
      this.shuffle(this.bag);
    }
    return this.bag.pop()!;
  }
}