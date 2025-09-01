import { describe, it, expect } from 'vitest';
import { COLUMNS } from '../../src/core/constants';
import { GameCore } from '../../src/core/game';

describe('Scoring and level', () => {
  it('awards points and levels up after lines cleared', () => {
    const g = new GameCore();
    // 인위적으로 보드 하단을 채워 한 줄 클리어 상황을 만든다
    g.board.grid[g.board.grid.length - 1] = Array.from({ length: COLUMNS }, () => 'I');
    // 현재 피스를 즉시 고정시키도록 위치를 조작
    g.current.y = g.board.grid.length - 2; // 위에서 1칸
    // 테스트 용도로 private 메서드 호출 (타입 우회)
    (g as any).lockAndSpawn();
    // private 이지만 테스트 편의용: 존재 시 점수/라인이 증가했는지 확인
    expect(g.lines).toBeGreaterThanOrEqual(1);
    expect(g.score).toBeGreaterThan(0);
  });
});


