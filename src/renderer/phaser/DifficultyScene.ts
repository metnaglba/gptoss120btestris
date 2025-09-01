import Phaser from 'phaser';
import { DIFFICULTY_MAP } from '../../core/game';

export class DifficultyScene extends Phaser.Scene {
  private selectedOption = 1; // Normal이 기본값
  private difficulties = Object.keys(DIFFICULTY_MAP);

  constructor() {
    super('DifficultyScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#000');

    // 타이틀
    this.add.text(400, 150, 'SELECT DIFFICULTY', {
      fontSize: '36px',
      color: '#fff',
      fontFamily: 'monospace'
    }).setOrigin(0.5);

    // 난이도 옵션과 설명 표시
    this.updateDisplay();

    // 키 입력
    this.input.keyboard!.on('keydown-UP', () => this.moveSelection(-1));
    this.input.keyboard!.on('keydown-DOWN', () => this.moveSelection(1));
    this.input.keyboard!.on('keydown-ENTER', () => this.selectDifficulty());
    this.input.keyboard!.on('keydown-ESC', () => this.goBack());
  }

  private updateDisplay(): void {
    // 기존 텍스트 제거
    this.children.list.forEach(child => {
      if (child instanceof Phaser.GameObjects.Text && child.y >= 250) {
        child.destroy();
      }
    });

    // 난이도 옵션
    this.difficulties.forEach((difficulty, i) => {
      const color = i === this.selectedOption ? '#ff0' : '#fff';
      this.add.text(400, 250 + i * 60, difficulty, {
        fontSize: '24px',
        color,
        fontFamily: 'monospace'
      }).setOrigin(0.5);
    });

    // 선택된 난이도 설명
    if (this.selectedOption < this.difficulties.length) {
      const difficulty = this.difficulties[this.selectedOption];
      const settings = DIFFICULTY_MAP[difficulty as keyof typeof DIFFICULTY_MAP];
      this.add.text(400, 450, `Speed: ${settings.fallSpeedMs}ms, Level Time: ${settings.levelTimeSec}s`, {
        fontSize: '16px',
        color: '#fff',
        fontFamily: 'monospace'
      }).setOrigin(0.5);
    }

    // 안내 메시지
    this.add.text(400, 500, 'ENTER to start, ESC to go back', {
      fontSize: '14px',
      color: '#999',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
  }

  private moveSelection(direction: number): void {
    this.selectedOption = (this.selectedOption + direction + this.difficulties.length) % this.difficulties.length;
    this.updateDisplay();
  }

  private selectDifficulty(): void {
    const selectedDifficulty = this.difficulties[this.selectedOption];
    // 게임 씬으로 전환하면서 난이도 정보 전달
    this.scene.start('GameScene', { difficulty: selectedDifficulty });
  }

  private goBack(): void {
    this.scene.start('MenuScene');
  }
}
