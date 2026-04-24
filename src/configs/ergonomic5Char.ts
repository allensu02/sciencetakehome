import type { SessionConfig } from '../types';
import { COMMON_5_WORDS } from './common5Char';
import { selectErgonomicWords } from './ergonomicScoring';

// Remaining lowercase 5-letter entries from first20hours/google-10000-english
// after the first 1000 already stored in COMMON_5_WORDS.
const GOOGLE_5_EXTRA_WORDS = [
  'drums', 'rover', 'flame', 'tanks', 'spell', 'emily', 'annex', 'sudan', 'hints', 'wired',
  'elvis', 'argue', 'arise', 'jamie', 'chess', 'oscar', 'menus', 'canal', 'amino', 'herbs',
  'lying', 'drill', 'bryan', 'hobby', 'tries', 'trick', 'myers', 'drops', 'wider', 'screw',
  'blame', 'fifty', 'uncle', 'jacob', 'randy', 'brick', 'naval', 'donna', 'cabin', 'eddie',
  'fired', 'perth', 'syria', 'klein', 'tires', 'retro', 'anger', 'suits', 'glenn', 'handy',
  'crops', 'guild', 'tribe', 'batch', 'alter', 'ghana', 'edges', 'twins', 'amend', 'chick',
  'thong', 'medal', 'walks', 'booth', 'indie', 'bones', 'breed', 'polar', 'msgid', 'carey',
  'danny', 'patio', 'lloyd', 'beans', 'ellis', 'snake', 'julia', 'berry', 'ought', 'fixes',
  'sends', 'mazda', 'timer', 'tyler', 'verse', 'highs', 'ellen', 'racks', 'nasty', 'tumor',
  'watts', 'forty', 'tubes', 'floyd', 'queue', 'skins', 'exams', 'welsh', 'belly', 'haiti',
  'elder', 'sonic', 'thumb', 'twist', 'ranks', 'debut', 'volvo', 'penny', 'ivory', 'remix',
  'alias', 'newer', 'spice', 'ascii', 'donor', 'trash', 'manor', 'diane', 'disco', 'endif',
  'minus', 'milan', 'shade', 'digit', 'lions', 'pools', 'lyric', 'grave', 'howto', 'devon',
  'saves', 'lobby', 'punch', 'gotta', 'karma', 'betty', 'lucas', 'mardi', 'shake', 'holly',
  'silly', 'mercy', 'fence', 'diana', 'shame', 'fatal', 'flesh', 'jesse', 'qatar', 'sheer',
  'witch', 'cohen', 'puppy', 'kathy', 'smell', 'satin', 'promo', 'tunes', 'lucia', 'nerve',
  'renew', 'locks', 'euros', 'rebel', 'hired', 'hindu', 'kills', 'slope', 'nails', 'whats',
  'rides', 'rehab', 'merit', 'disks', 'condo', 'fairy', 'shaft', 'casio', 'kitty', 'drain',
  'monte', 'fires', 'panic', 'leone', 'onion', 'beats', 'merry', 'scuba', 'verde', 'dried',
  'derby', 'annie', 'derek', 'steal', 'fears', 'tuner', 'alike', 'sagem', 'scout', 'dealt',
  'bucks', 'badge', 'wrist', 'heath', 'lexus', 'realm', 'jenny', 'yemen', 'buses', 'rouge',
  'yeast', 'kenny', 'yukon', 'singh', 'brook', 'wives', 'xerox', 'sorts', 'vsnet', 'papua',
  'armor', 'viral', 'pipes', 'laden', 'aruba', 'merge', 'edgar', 'dubai', 'allan', 'sperm',
  'filme', 'craps', 'frost', 'sally', 'yacht', 'tracy', 'whale', 'shark', 'grows', 'cliff',
  'tract', 'shine', 'wendy', 'diffs', 'ozone', 'pasta', 'serum', 'swift', 'inbox', 'focal',
  'samba', 'wound', 'belle', 'cindy', 'lined', 'boxed', 'cubic', 'spies', 'elect', 'bunny',
  'chevy', 'tions', 'flyer', 'baths', 'emacs', 'climb', 'sparc', 'dover', 'token', 'kinda',
  'dylan', 'belts', 'burke', 'clara', 'flush', 'hayes', 'moses', 'johns', 'jewel', 'teddy',
  'dryer', 'ruled', 'funky', 'joins', 'scary', 'mpegs', 'cakes', 'mixer', 'sbjct', 'tooth',
  'stays', 'drove', 'upset', 'mines', 'logan', 'lance', 'colon', 'lanes', 'purse', 'align',
  'bless', 'crest', 'alloy', 'plots', 'tulsa', 'casey', 'draws', 'bloom', 'loops', 'surge',
  'tahoe', 'souls', 'spank', 'vault', 'wires', 'mails', 'blake', 'orbit', 'niger', 'bacon',
  'paxil', 'spine', 'trout', 'apnic', 'fatty', 'joyce', 'marco', 'isaac', 'oxide', 'badly',
  'scoop', 'sanyo', 'blink', 'carlo', 'tiles', 'tamil', 'fuzzy', 'grams', 'forge', 'dense',
  'brave', 'awful', 'meyer', 'wagon', 'knock', 'peers', 'quilt', 'notre', 'mambo', 'flour',
  'choir', 'blond', 'burst', 'wiley', 'fibre', 'daisy', 'crude', 'bored', 'allah', 'fares',
  'hoped', 'safer', 'marsh', 'ricky', 'theta', 'stake', 'arbor'
] as const;

export const ERGONOMIC_5_WORDS = selectErgonomicWords(
  [...COMMON_5_WORDS, ...GOOGLE_5_EXTRA_WORDS],
  1000
);

export const ergonomic5CharConfig: SessionConfig = {
  condition_id: 'five_char_ergonomic_words_n1000',
  alphabet: [...ERGONOMIC_5_WORDS],
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
