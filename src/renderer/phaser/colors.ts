import type { PieceKind } from '../../core/types';

export const COLORS: Record<PieceKind | 'grid' | 'bg' | 'ghost', number> = {
  I: 0x00f0f0,
  J: 0x0000f0,
  L: 0xf0a000,
  O: 0xf0f000,
  S: 0x00f000,
  T: 0xa000f0,
  Z: 0xf00000,
  grid: 0x282828,
  bg: 0x000000,
  ghost: 0x969696,
};


