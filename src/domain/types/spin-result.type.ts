import { SLOT } from '../enums/slot.enum';

export type SpinResult = {
  reward: number;
  currentBalance: number;
  result: SLOT[];
};
