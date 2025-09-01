import Phaser from 'phaser';
import { saveRanking, type GameStats } from '../../core/storage';

export class GameOverScene extends Phaser.Scene {
  private gameStats!: GameStats;
  private selectedOption = 1; // MAIN MENU가 기본값
  private menuOptions = ['SAVE SCORE', 'MAIN MENU', 'EXIT GAME'];
  private nameInputMode = false;
  private playerName = '';

  constructor() {
    super('GameOverScene');
  }

  init(data: { gameStats: GameStats }): void {
    this.gameStats = data.gameStats;
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#000');

    if (this.nameInputMode) {
      this.createNameInput();
    } else {
      this.createGameOverMenu();
    }

    this.setupInput();
  }

  private createGameOverMenu(): void {
    // 게임 오버 타이틀
    this.add.text(400, 80, 'GAME OVER', {
      fontSize: '36px',
      color: '#c00',
      fontFamily: 'monospace'
    }).setOrigin(0.5);

    // 통계 표시
    const stats = [
      `Final Score: ${this.gameStats.score.toLocaleString()}`,
      `Level Reached: ${this.gameStats.level}`,
      `Lines Cleared: ${this.gameStats.lines}`,
      `Max Combo: ${this.gameStats.combo}`,
      `Play Time: ${Math.floor(this.gameStats.playTime / 60000)}:${Math.floor((this.gameStats.playTime % 60000) / 1000).toString().padStart(2, '0')}`,
      `Difficulty: ${this.gameStats.difficulty}`
    ];

    stats.forEach((stat, i) => {
      this.add.text(400, 150 + i * 25, stat, {
        fontSize: '16px',
        color: '#fff',
        fontFamily: 'monospace'
      }).setOrigin(0.5);
    });

    // 메뉴 옵션
    this.updateMenuDisplay();
  }

  private createNameInput(): void {
    // 하이스코어 달성 메시지
    this.add.text(400, 120, 'HIGH SCORE!', {
      fontSize: '36px',
      color: '#ff0',
      fontFamily: 'monospace'
    }).setOrigin(0.5);

    this.add.text(400, 180, `Your Score: ${this.gameStats.score.toLocaleString()}`, {
      fontSize: '20px',
      color: '#fff',
      fontFamily: 'monospace'
    }).setOrigin(0.5);

    this.add.text(400, 250, 'Enter your name:', {
      fontSize: '16px',
      color: '#fff',
      fontFamily: 'monospace'
    }).setOrigin(0.5);

    // 입력 박스 표시는 updateNameInput에서 처리
    this.updateNameInput();

    this.add.text(400, 350, 'ENTER to save, ESC to cancel', {
      fontSize: '14px',
      color: '#999',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
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
      this.add.text(400, 350 + i * 40, option, {
        fontSize: '18px',
        color,
        fontFamily: 'monospace'
      }).setOrigin(0.5);
    });
  }

  private updateNameInput(): void {
    // 기존 입력 관련 텍스트 제거
    this.children.list.forEach(child => {
      if (child instanceof Phaser.GameObjects.Text && child.y >= 280 && child.y <= 330) {
        child.destroy();
      }
    });

    // 입력된 이름과 커서 표시
    const cursor = Math.floor(this.time.now / 500) % 2 ? '|' : '';
    const displayText = this.playerName + cursor;
    
    this.add.text(400, 300, displayText, {
      fontSize: '20px',
      color: '#ff0',
      fontFamily: 'monospace'
    }).setOrigin(0.5);

    this.add.text(400, 325, `${this.playerName.length}/15`, {
      fontSize: '12px',
      color: '#999',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
  }

  private setupInput(): void {
    if (this.nameInputMode) {
      // 이름 입력 모드
      this.input.keyboard!.on('keydown', (event: KeyboardEvent) => {
        if (event.code === 'Enter') {
          if (this.playerName.trim()) {
            saveRanking(this.playerName.trim(), this.gameStats.score, this.gameStats.difficulty);
            this.scene.start('MenuScene');
          }
        } else if (event.code === 'Backspace') {
          this.playerName = this.playerName.slice(0, -1);
          this.updateNameInput();
        } else if (event.code === 'Escape') {
          this.scene.start('MenuScene');
        } else if (event.key.length === 1 && this.playerName.length < 15) {
          this.playerName += event.key;
          this.updateNameInput();
        }
      });
    } else {
      // 메뉴 모드
      this.input.keyboard!.on('keydown-UP', () => this.moveSelection(-1));
      this.input.keyboard!.on('keydown-DOWN', () => this.moveSelection(1));
      this.input.keyboard!.on('keydown-ENTER', () => this.selectOption());
      this.input.keyboard!.on('keydown-ESC', () => this.goToMenu());
    }
  }

  private moveSelection(direction: number): void {
    this.selectedOption = (this.selectedOption + direction + this.menuOptions.length) % this.menuOptions.length;
    this.updateMenuDisplay();
  }

  private selectOption(): void {
    switch (this.selectedOption) {
      case 0: // SAVE SCORE
        this.nameInputMode = true;
        this.scene.restart({ gameStats: this.gameStats });
        break;
      case 1: // MAIN MENU
        this.goToMenu();
        break;
      case 2: // EXIT GAME
        window.location.reload();
        break;
    }
  }

  private goToMenu(): void {
    this.scene.start('MenuScene');
  }
}
