import type { SessionConfig } from '../types';
import { singleCharConfig } from './singleChar';
import { common3CharConfig } from './common3Char';
import { ergonomic3CharConfig } from './ergonomic3Char';
import { nonword3CharConfig } from './nonword3Char';
import { common5CharConfig } from './common5Char';
import { ergonomic5CharConfig } from './ergonomic5Char';

export type ConditionOption = {
  label: string;
  config: SessionConfig;
};

export const conditionOptions: ConditionOption[] = [
  { label: 'Single characters (N=26)', config: singleCharConfig },
  { label: '3-char common words (N=100)', config: common3CharConfig },
  { label: '3-char ergonomic words (N=100)', config: ergonomic3CharConfig },
  { label: '3-char pronounceable non-words (N=500)', config: nonword3CharConfig },
  { label: '5-char common words (N=1000)', config: common5CharConfig },
  { label: '5-char ergonomic words (N=1000)', config: ergonomic5CharConfig }
];
