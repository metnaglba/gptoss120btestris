import Phaser from 'phaser';
import { getTopRankers } from '../../core/storage';

export class MenuScene extends Phaser.Scene {
  private selectedOption = 0;
  private menuOptions = ['START GAME', 'RANKING', 'EXIT'];

  constructor() {
    super('MenuScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#000');

    // 타이틀
    this.add.text(400, 150, 'TETRIS', {
      fontSize: '48px',
      color: '#fff',
      fontFamily: 'monospace'
    }).setOrigin(0.5);

    // 상위 랭커 표시
    this.drawTopRankers();

    // 메뉴 옵션
    this.updateMenuDisplay();

    // 키 입력
    this.input.keyboard!.on('keydown-UP', () => this.moveSelection(-1));
    this.input.keyboard!.on('keydown-DOWN', () => this.moveSelection(1));
    this.input.keyboard!.on('keydown-ENTER', () => this.selectOption());
    this.input.keyboard!.on('keydown-ESC', () => this.selectExit());
  }

  private drawTopRankers(): void {
    const topRankers = getTopRankers(3);
    if (topRankers.length > 0) {
      this.add.text(400, 220, 'TOP RANKERS:', {
        fontSize: '16px',
        color: '#fff',
        fontFamily: 'monospace'
      }).setOrigin(0.5);

      topRankers.forEach((ranker, i) => {
        this.add.text(400, 250 + i * 20, `${i + 1}. ${ranker.name}: ${ranker.score.toLocaleString()} (${ranker.difficulty})`, {
          fontSize: '14px',
          color: '#fff',
          fontFamily: 'monospace'
        }).setOrigin(0.5);
      });
    }
  }

  private updateMenuDisplay(): void {
    // 기존 메뉴 텍스트 제거
    this.children.list.forEach(child => {
      if (child instanceof Phaser.GameObjects.Text && child.y >= 350) {
        child.destroy();
      }
    });

    // 메뉴 옵션 다시 그리기
    this.menuOptions.forEach((option, i) => {
      const color = i === this.selectedOption ? '#ff0' : '#fff';
      this.add.text(400, 350 + i * 50, option, {
        fontSize: '24px',
        color,
        fontFamily: 'monospace'
      }).setOrigin(0.5);
    });
  }

  private moveSelection(direction: number): void {
    this.selectedOption = (this.selectedOption + direction + this.menuOptions.length) % this.menuOptions.length;
    this.updateMenuDisplay();
  }

  private selectOption(): void {
    switch (this.selectedOption) {
      case 0: // START GAME
        this.scene.start('DifficultyScene');
        break;
      case 1: // RANKING
        this.scene.start('RankingScene');
        break;
      case 2: // EXIT
        this.selectExit();
        break;
    }
  }

  private selectExit(): void {
    // 브라우저에서는 창을 직접 닫을 수 없으므로 페이지를 새로고침하거나 다른 처리
    window.location.reload();
  }
}
