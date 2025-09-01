import Phaser from 'phaser';
import { CELL_SIZE, COLUMNS, ROWS, PANEL_W } from '../../core/constants';
import { MenuScene } from './MenuScene';
import { DifficultyScene } from './DifficultyScene';
import { RankingScene } from './RankingScene';
import { GameScene } from './GameScene';
import { GameOverScene } from './GameOverScene';

const width = COLUMNS * CELL_SIZE + PANEL_W;
const height = ROWS * CELL_SIZE;

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'app',
  width,
  height,
  backgroundColor: '#000',
  scene: [MenuScene, DifficultyScene, RankingScene, GameScene, GameOverScene],
});