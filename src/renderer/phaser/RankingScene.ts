import Phaser from 'phaser';
import { loadRankings } from '../../core/storage';

export class RankingScene extends Phaser.Scene {
  constructor() {
    super('RankingScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#000');

    // 타이틀
    this.add.text(400, 80, 'RANKINGS', {
      fontSize: '36px',
      color: '#fff',
      fontFamily: 'monospace'
    }).setOrigin(0.5);

    // 랭킹 표시
    this.displayRankings();

    // 안내 메시지
    this.add.text(400, 550, 'Press ESC to return to menu', {
      fontSize: '14px',
      color: '#999',
      fontFamily: 'monospace'
    }).setOrigin(0.5);

    // 키 입력
    this.input.keyboard!.on('keydown-ESC', () => this.goBack());
  }

  private displayRankings(): void {
    const rankings = loadRankings();
    let yOffset = 120;

    ['Easy', 'Normal', 'Hard'].forEach(difficulty => {
      if (rankings[difficulty] && rankings[difficulty].length > 0) {
        // 난이도 제목
        this.add.text(400, yOffset, `${difficulty}:`, {
          fontSize: '20px',
          color: '#ff0',
          fontFamily: 'monospace'
        }).setOrigin(0.5);
        yOffset += 30;

        // 해당 난이도의 랭킹 (상위 5명)
        rankings[difficulty].slice(0, 5).forEach((entry, i) => {
          this.add.text(400, yOffset, `${i + 1}. ${entry.name}: ${entry.score.toLocaleString()}`, {
            fontSize: '16px',
            color: '#fff',
            fontFamily: 'monospace'
          }).setOrigin(0.5);
          yOffset += 20;
        });

        yOffset += 20; // 난이도 간 간격
      }
    });

    if (yOffset === 120) {
      // 랭킹이 없는 경우
      this.add.text(400, 200, 'No rankings yet', {
        fontSize: '18px',
        color: '#999',
        fontFamily: 'monospace'
      }).setOrigin(0.5);
    }
  }

  private goBack(): void {
    this.scene.start('MenuScene');
  }
}
