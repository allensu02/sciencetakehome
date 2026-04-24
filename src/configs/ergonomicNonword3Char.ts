import type { SessionConfig } from '../types';

// Ergonomic 3-character pronounceable nonwords. Generated from the validated
// NONWORD_3_STRINGS pool, ranked by the same QWERTY effort model used for
// ergonomic word conditions.
export const ERGONOMIC_NONWORD_3_STRINGS = [
  'gug', 'guf', 'tuf', 'fas', 'ruf', 'yef', 'hef', 'sef', 'dut', 'wef',
  'tud', 'jas', 'guk', 'rer', 'jad', 'lig', 'duf', 'jer', 'fer', 'tuk',
  'yeg', 'heg', 'fef', 'saf', 'gir', 'tif', 'weg', 'dur', 'haf', 'luf',
  'gok', 'daf', 'faf', 'jit', 'sug', 'ter', 'hig', 'tir', 'fif', 'tef',
  'gef', 'ruk', 'jeg', 'feg', 'kas', 'jif', 'sut', 'tok', 'yig', 'rif',
  'kad', 'wug', 'lir', 'kok', 'jaf', 'gub', 'tul', 'hes', 'gaf', 'suf',
  'jir', 'fok', 'jok', 'yit', 'pok', 'hif', 'ses', 'tet', 'duk', 'rir',
  'lud', 'geg', 'yif', 'guv', 'dif', 'yek', 'hek', 'wuf', 'kog', 'hir',
  'sek', 'luk', 'wek', 'gof', 'jid', 'fil', 'hok', 'rul', 'jes', 'fes',
  'pog', 'yir', 'jil', 'tas', 'fak', 'rek', 'pif', 'dok', 'ril', 'dus'
] as const;

export const ergonomicNonword3CharConfig: SessionConfig = {
  condition_id: 'three_char_ergonomic_nonwords_n100',
  alphabet: [...ERGONOMIC_NONWORD_3_STRINGS],
  input_modality: 'keyboard',
  scoring: {
    mode: 'exact_match',
    advance_on_error: true
  },
  display: {
    show_current_target: true,
    show_next_target: false,
    show_keyboard_overlay: false,
    require_space: true
  },
  duration_seconds: 60,
  familiarization_seconds: 20
};
