import { SLOT } from '../enums/slot.enum';
import { Game } from './game.type';

export type GamePage = {
  initialSpin: SLOT[];
  game: Game;
};
