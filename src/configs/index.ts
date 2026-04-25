import type { SessionConfig } from '../types';
import { singleCharConfig } from './singleChar';
import { common3CharConfig } from './common3Char';
import { all3CharWordsConfig, all5CharWordsConfig } from './allWords';
// import { ergonomic3CharConfig } from './ergonomic3Char';
import {
  ergonomicNonword3CharAllConfig,
  ergonomicNonword3CharN100Config,
  ergonomicNonword3CharN1000Config
} from './ergonomicNonword3Char';
// import { nonword3CharConfig } from './nonword3Char';
import { common5CharConfig } from './common5Char';
// import { ergonomic5CharConfig } from './ergonomic5Char';
import {
  ergonomicNonword5CharAllConfig,
  ergonomicNonword5CharConfig,
  ergonomicNonword5CharN100kConfig
} from './ergonomicNonword5Char';

export type ConditionOption = {
  label: string;
  config: SessionConfig;
};

export const conditionOptions: ConditionOption[] = [
  { label: 'Single characters (N=26)', config: singleCharConfig },
  { label: '3-char common words (N=100)', config: common3CharConfig },
  { label: '3-char all words (N=1567)', config: all3CharWordsConfig },
  // { label: '3-char ergonomic words (N=100)', config: ergonomic3CharConfig },
  { label: '3-char ergonomic non-words (N=100)', config: ergonomicNonword3CharN100Config },
  { label: '3-char ergonomic non-words (N=1000)', config: ergonomicNonword3CharN1000Config },
  { label: '3-char ergonomic non-words (N=16009)', config: ergonomicNonword3CharAllConfig },
  // { label: '3-char pronounceable non-words (N=500)', config: nonword3CharConfig },
  { label: '5-char common words (N=1000)', config: common5CharConfig },
  { label: '5-char all words (N=10365)', config: all5CharWordsConfig },
  // { label: '5-char ergonomic words (N=1000)', config: ergonomic5CharConfig },
  { label: '5-char ergonomic non-words (N=1000)', config: ergonomicNonword5CharConfig },
  { label: '5-char ergonomic non-words (N=100000)', config: ergonomicNonword5CharN100kConfig },
  { label: '5-char ergonomic non-words (N=11871011)', config: ergonomicNonword5CharAllConfig }
];
