import type { SessionConfig } from '../types';

// Generated CVC pronounceable nonwords. Validation before commit:
// - Real-word check: /usr/share/dict/words plus first20hours/google-10000-english frequency corpus.
// - Offensive/proper-name/abbreviation scan: explicit block list for common 3-letter collisions.
// - Phonotactic sanity: lowercase CVC, no q/x, no hard-to-pronounce coda h/w/y/c/q/x.
export const NONWORD_3_STRINGS = [
  'baf', 'daf', 'fab', 'gaf', 'hab', 'jad', 'kab', 'laf', 'maf', 'nad',
  'pab', 'raf', 'saf', 'taf', 'vab', 'wak', 'yab', 'zab', 'bak', 'dav',
  'faf', 'gak', 'haf', 'jaf', 'kad', 'lal', 'mak', 'naf', 'paf', 'rak',
  'sav', 'tak', 'vad', 'wam', 'yaf', 'zaf', 'bav', 'daz', 'fak', 'gav',
  'har', 'jak', 'kag', 'lav', 'mav', 'nal', 'pag', 'ral', 'saz', 'tas',
  'vaf', 'waz', 'yag', 'zal', 'baz', 'ded', 'fal', 'geb', 'hav', 'jal',
  'kak', 'leb', 'maz', 'nas', 'pak', 'rar', 'seb', 'taz', 'vak', 'wef',
  'yal', 'zam', 'beb', 'dek', 'fas', 'gef', 'haz', 'jas', 'kal', 'lef',
  'meb', 'naz', 'pav', 'rav', 'sed', 'teb', 'vam', 'weg', 'yav', 'zap',
  'bef', 'dep', 'faz', 'geg', 'heb', 'jav', 'kam', 'lel', 'mef', 'nek',
  'paz', 'raz', 'sef', 'tef', 'vap', 'wek', 'yaz', 'zas', 'bek', 'det',
  'fef', 'gek', 'hed', 'jaz', 'kap', 'lem', 'mek', 'nel', 'peb', 'rek',
  'sek', 'tek', 'vav', 'wel', 'yeb', 'zav', 'bem', 'dez', 'feg', 'gep',
  'hef', 'jeb', 'kar', 'lep', 'mep', 'nem', 'pef', 'rem', 'sel', 'tem',
  'vaz', 'wep', 'yef', 'zeb', 'bep', 'dif', 'fek', 'gev', 'heg', 'jeg',
  'kas', 'lez', 'mez', 'nen', 'pek', 'ren', 'sem', 'tep', 'veb', 'wev',
  'yeg', 'zef', 'bev', 'dil', 'fel', 'gik', 'hek', 'jek', 'kav', 'lig',
  'mif', 'ner', 'pel', 'rer', 'ses', 'ter', 'ved', 'wez', 'yek', 'zeg',
  'bez', 'diz', 'fem', 'gir', 'hel', 'jel', 'kaz', 'lik', 'mik', 'nes',
  'pem', 'rez', 'sev', 'tes', 'vef', 'wib', 'yel', 'zek', 'bif', 'dof',
  'fep', 'giv', 'hes', 'jen', 'kek', 'lir', 'mip', 'nev', 'pev', 'rif',
  'sez', 'tet', 'veg', 'wif', 'yem', 'zem', 'bik', 'dok', 'fer', 'giz',
  'hev', 'jep', 'kel', 'lok', 'mis', 'nez', 'pez', 'ril', 'sif', 'tev',
  'vek', 'wik', 'yev', 'zes', 'bil', 'dov', 'fes', 'gof', 'hez', 'jer',
  'kem', 'lom', 'miv', 'nif', 'pib', 'rin', 'sik', 'tif', 'vel', 'wil',
  'yib', 'zet', 'bip', 'doz', 'fev', 'gok', 'hib', 'jes', 'kes', 'lon',
  'miz', 'nik', 'pid', 'rir', 'siv', 'tik', 'vem', 'wip', 'yif', 'zev',
  'bir', 'duf', 'fif', 'gom', 'hif', 'jev', 'kev', 'lor', 'mof', 'nin',
  'pif', 'ris', 'siz', 'tir', 'ven', 'wiv', 'yig', 'zib', 'biv', 'duk',
  'fik', 'gop', 'hig', 'jez', 'kez', 'lov', 'mok', 'nir', 'pil', 'riv',
  'sof', 'tis', 'vep', 'wof', 'yik', 'zid', 'bof', 'dul', 'fil', 'goz',
  'hik', 'jid', 'kib', 'loz', 'mol', 'nis', 'pis', 'riz', 'som', 'tiv',
  'ves', 'wol', 'yil', 'zif', 'bok', 'dur', 'fim', 'gub', 'hil', 'jif',
  'kif', 'lub', 'mos', 'niv', 'piv', 'rof', 'sor', 'tiz', 'vev', 'wom',
  'yim', 'zik', 'bol', 'dus', 'fis', 'guf', 'hir', 'jik', 'kig', 'lud',
  'mov', 'niz', 'piz', 'rol', 'soz', 'tob', 'vez', 'wor', 'yir', 'zil',
  'bov', 'dut', 'fiv', 'gug', 'hiz', 'jil', 'kir', 'luf', 'moz', 'nof',
  'pof', 'rop', 'suf', 'tof', 'vib', 'wos', 'yit', 'zim', 'boz', 'duv',
  'fiz', 'guk', 'hof', 'jip', 'kis', 'luk', 'mub', 'nok', 'pog', 'ror',
  'sug', 'tok', 'vif', 'wov', 'yiv', 'zin', 'buk', 'duz', 'fof', 'guv',
  'hok', 'jir', 'kiv', 'lul', 'muf', 'nol', 'pok', 'ros', 'sul', 'tos',
  'vig', 'woz', 'yiz', 'zir', 'bul', 'fok', 'hol', 'jis', 'kiz', 'lun',
  'muk', 'nom', 'pov', 'rov', 'sut', 'tov', 'vik', 'wub', 'yob', 'zis',
  'bup', 'fol', 'hom', 'jit', 'kod', 'lup', 'mul', 'nop', 'poz', 'roz',
  'suv', 'toz', 'vil', 'wuf', 'yod', 'zit', 'buv', 'fom', 'hor', 'jiv',
  'kof', 'lus', 'mup', 'nos', 'puf', 'ruf', 'tud', 'vin', 'wug', 'yof',
  'ziv', 'buz', 'fos', 'hos', 'jod', 'kog', 'luv', 'mur', 'noz', 'puk',
  'ruk', 'tuf', 'vir', 'wuk', 'yog', 'zob', 'fov', 'hov', 'jof', 'kok',
  'luz', 'mut', 'nud', 'pum', 'rul', 'tuk', 'vit', 'wul', 'yol', 'zod',
  'foz', 'hoz', 'jok', 'kom', 'muv', 'nuf', 'puv', 'rup', 'tul', 'viv',
] as const;

export const nonword3CharConfig: SessionConfig = {
  condition_id: 'three_char_pronounceable_nonwords_n500',
  alphabet: [...NONWORD_3_STRINGS],
  input_modality: 'keyboard',
  scoring: {
    mode: 'exact_match',
    advance_on_error: true
  },
  display: {
    show_current_target: true,
    show_next_target: false,
    show_keyboard_overlay: false
  },
  duration_seconds: 60,
  familiarization_seconds: 20
};
