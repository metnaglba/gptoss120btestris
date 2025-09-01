import Phaser from 'phaser';
import { CELL_SIZE, COLUMNS, ROWS, PANEL_W, PANEL_PADDING } from '../../core/constants';
import { GameCore, DIFFICULTY_MAP, type Difficulty } from '../../core/game';
import { COLORS } from './colors';
import { ghostY } from '../../core/ghost';
import { TETROMINOES } from '../../core/tetromino';
import { saveHighscore, type GameStats } from '../../core/storage';

export class GameScene extends Phaser.Scene {
  private core!: GameCore;
  private difficulty: Difficulty = 'Normal';
  private gameStartTime = 0;
  private accumulatorMs = 0;
  private keyRepeat: { left: { delay: number; interval: number; next: number; held: boolean }; right: { delay: number; interval: number; next: number; held: boolean } } = {
    left: { delay: 150, interval: 50, next: 0, held: false },
    right: { delay: 150, interval: 50, next: 0, held: false },
  };
  private scoreText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private linesText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private gfx!: Phaser.GameObjects.Graphics;
  private uiGfx!: Phaser.GameObjects.Graphics;

  constructor() {
    super('GameScene');
  }

  init(data: { difficulty?: string } = {}): void {
    this.difficulty = (data.difficulty as Difficulty) || 'Normal';
  }

  create(): void {
    const settings = DIFFICULTY_MAP[this.difficulty];
    this.core = new GameCore(settings);
    this.gameStartTime = this.time.now;

    // 키 입력 간단 연결 (좌/우/하/스페이스/쉬프트)
    const cursors = this.input.keyboard!.createCursorKeys();
    const space = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const z = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    const up = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.UP);

    cursors.left.on('down', () => { this.core.moveLeft(); this.keyRepeat.left.held = true; this.keyRepeat.left.next = this.time.now + this.keyRepeat.left.delay; });
    cursors.right.on('down', () => { this.core.moveRight(); this.keyRepeat.right.held = true; this.keyRepeat.right.next = this.time.now + this.keyRepeat.right.delay; });
    cursors.down.on('down', () => this.core.softDrop());
    cursors.left.on('up', () => { this.keyRepeat.left.held = false; });
    cursors.right.on('up', () => { this.keyRepeat.right.held = false; });
    up.on('down', () => this.core.rotate());
    space.on('down', () => this.core.hardDrop());
    z.on('down', () => { this.core.holdOrRetrieve(); });

    // 격자
    this.add.grid(
      0,
      0,
      COLUMNS * CELL_SIZE,
      ROWS * CELL_SIZE,
      CELL_SIZE,
      CELL_SIZE,
      COLORS.bg,
      1,
      COLORS.grid,
      1
    ).setOrigin(0, 0);

    // 렌더용 그래픽스(단일 인스턴스)
    this.gfx = this.add.graphics();
    this.gfx.setDepth(10);
    this.uiGfx = this.add.graphics();
    this.uiGfx.setDepth(11);

    // 패널 배경
    this.add.rectangle(
      COLUMNS * CELL_SIZE,
      0,
      PANEL_W,
      ROWS * CELL_SIZE,
      COLORS.bg
    ).setOrigin(0, 0).setStrokeStyle(1, COLORS.grid).setDepth(1);

    // 텍스트 스타일
    const panelX = COLUMNS * CELL_SIZE + PANEL_PADDING;
    const nextY = PANEL_PADDING;
    const holdY = PANEL_PADDING + 120;
    const infoY = PANEL_PADDING + 240;
    this.add.text(panelX, nextY, 'NEXT', { color: '#fff' }).setDepth(12);
    this.add.text(panelX, holdY, 'HOLD', { color: '#fff' }).setDepth(12);
    this.scoreText = this.add.text(panelX, infoY, 'Score: 0', { color: '#fff' }).setDepth(12);
    this.levelText = this.add.text(panelX, infoY + 20, 'Level: 1', { color: '#fff' }).setDepth(12);
    this.linesText = this.add.text(panelX, infoY + 40, 'Lines: 0', { color: '#fff' }).setDepth(12);
    this.timerText = this.add.text(panelX, infoY + 60, 'Next Lv In: 0s', { color: '#ff0' }).setDepth(12);
    this.comboText = this.add.text(panelX, infoY + 80, '', { color: '#fff' }).setDepth(12);

    // 키 안내
    const helpY = infoY + 120;
    this.add.text(panelX, helpY, 'Controls:', { color: '#999', fontSize: '14px' }).setDepth(12);
    this.add.text(panelX, helpY + 20, '← →: Move', { color: '#aaa', fontSize: '12px' }).setDepth(12);
    this.add.text(panelX, helpY + 35, '↓: Soft Drop', { color: '#aaa', fontSize: '12px' }).setDepth(12);
    this.add.text(panelX, helpY + 50, '↑: Rotate', { color: '#aaa', fontSize: '12px' }).setDepth(12);
    this.add.text(panelX, helpY + 65, 'Space: Hard Drop', { color: '#aaa', fontSize: '12px' }).setDepth(12);
    this.add.text(panelX, helpY + 80, 'Z: Hold/Retrieve', { color: '#aaa', fontSize: '12px' }).setDepth(12);
  }

  update(_: number, delta: number): void {
    if (!this.core) return;
    
    if (this.core.gameOver) {
      // 게임 오버 처리
      this.handleGameOver();
      return;
    }

    this.accumulatorMs += delta;
    // 고정 낙하 간격에 맞춰 step
    while (this.accumulatorMs >= this.core.fallSpeedMs) {
      this.core.fallStep();
      this.core.checkLockTimeout();
      this.accumulatorMs -= this.core.fallSpeedMs;
    }

    // 코어 시간 진행
    this.core.tick(delta);

    // DAS/ARR 처리
    const now = this.time.now;
    if (this.keyRepeat.left.held && now >= this.keyRepeat.left.next) { this.core.moveLeft(); this.keyRepeat.left.next = now + this.keyRepeat.left.interval; }
    if (this.keyRepeat.right.held && now >= this.keyRepeat.right.next) { this.core.moveRight(); this.keyRepeat.right.next = now + this.keyRepeat.right.interval; }

    // 렌더링
    this.gfx.clear();
    this.uiGfx.clear();

    // 고정 블록
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLUMNS; x++) {
        const cell = this.core.board.grid[y][x];
        if (cell !== 0) {
          this.gfx.fillStyle(COLORS[cell], 1);
          this.gfx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      }
    }

    // 고스트
    const gy = ghostY(this.core.current, this.core.board);
    this.gfx.fillStyle(COLORS.ghost, 0.4);
    for (let dy = 0; dy < this.core.current.shape.length; dy++) {
      for (let dx = 0; dx < this.core.current.shape[dy].length; dx++) {
        if (this.core.current.shape[dy][dx]) {
          const px = (this.core.current.x + dx) * CELL_SIZE;
          const py = (gy + dy) * CELL_SIZE;
          this.gfx.fillRect(px, py, CELL_SIZE, CELL_SIZE);
        }
      }
    }

    // 현재 피스
    this.gfx.fillStyle(COLORS[this.core.current.kind], 1);
    for (let dy = 0; dy < this.core.current.shape.length; dy++) {
      for (let dx = 0; dx < this.core.current.shape[dy].length; dx++) {
        if (this.core.current.shape[dy][dx]) {
          const px = (this.core.current.x + dx) * CELL_SIZE;
          const py = (this.core.current.y + dy) * CELL_SIZE;
          this.gfx.fillRect(px, py, CELL_SIZE, CELL_SIZE);
        }
      }
    }

    // 패널 텍스트 업데이트
    this.scoreText.setText(`Score: ${this.core.score}`);
    this.levelText.setText(`Level: ${this.core.level}`);
    this.linesText.setText(`Lines: ${this.core.lines}`);
    this.timerText.setText(`Next Lv In: ${Math.floor(this.core.remainingLevelMs/1000)}s`);
    this.comboText.setText(this.core.combo > 0 ? `Combo: x${this.core.combo}` : '');

    // NEXT 프리뷰
    this.drawPreview(
      this.core.next.kind,
      COLUMNS * CELL_SIZE + PANEL_PADDING,
      PANEL_PADDING + 30,
      this.uiGfx
    );
    // HOLD 프리뷰
    if (this.core.hold.kind) {
      this.drawPreview(
        this.core.hold.kind,
        COLUMNS * CELL_SIZE + PANEL_PADDING,
        PANEL_PADDING + 150,
        this.uiGfx
      );
    }
  }

  private drawPreview(kind: keyof typeof TETROMINOES, x: number, y: number, gfx: Phaser.GameObjects.Graphics) {
    const shape = TETROMINOES[kind][0];
    gfx.fillStyle(COLORS[kind], 1);
    for (let dy = 0; dy < shape.length; dy++) {
      for (let dx = 0; dx < shape[dy].length; dx++) {
        if (shape[dy][dx]) {
          gfx.fillRect(x + dx * CELL_SIZE, y + dy * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      }
    }
  }

  private handleGameOver(): void {
    // 한 번만 처리되도록
    if ((this as any).gameOverHandled) return;
    (this as any).gameOverHandled = true;

    const playTime = this.time.now - this.gameStartTime;
    const gameStats: GameStats = {
      score: this.core.score,
      level: this.core.level,
      lines: this.core.lines,
      combo: this.core.combo,
      playTime,
      difficulty: this.difficulty
    };

    // 하이스코어 저장
    saveHighscore(gameStats.score, gameStats.difficulty);

    // 게임 오버 씬으로 전환
    this.scene.start('GameOverScene', { gameStats });
  }
}


