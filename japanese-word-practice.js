(function (root) {
  'use strict';
  const content = root.ThaiNaviJapaneseWordContent;
  const shared = root.ThaiNaviKanaPractice;
  const reading = root.ThaiNaviJapaneseLearning;
  const sourceWords = content.words;
  const starterIds = [
    'word-010', 'word-002', 'word-001', 'word-069', 'word-055',
    'word-049', 'word-050', 'word-052', 'word-030', 'word-029',
    'word-007', 'word-008', 'word-009', 'word-068', 'word-091',
    'word-098', 'word-059', 'word-064', 'word-077', 'word-074'
  ];
  const byId = new Map(sourceWords.map(word => [word.id, word]));
  const words = Object.freeze([...starterIds.map(id => byId.get(id)), ...sourceWords.filter(word => !starterIds.includes(word.id))]);
  const rowById = new Map(words.map((word, row) => [word.id, row]));
  const KEY = 'tn_japanese_words_v1';
  const ids = new Set(words.map(word => word.id));
  const integer = (value, fallback, max) => Number.isInteger(value) && value >= 0 && value <= max ? value : fallback;
  const wordAt = row => words[integer(row, 0, words.length - 1)];
  const rowChars = (script, row) => Array.from(wordAt(row).ja);
  const current = state => wordAt(state.row).ja;

  function coveredIndices(state) {
    const length = rowChars('words', state.row).length, distances = Array(length).fill(0);
    for (const stroke of shared.cleanInk(state.ink)) {
      for (let point = 1; point < stroke.length; point++) {
        const [x, y] = stroke[point - 1], [endX, endY] = stroke[point];
        const dx = endX - x, dy = endY - y;
        if (dx === 0) {
          distances[Math.min(length - 1, Math.floor(x * length))] += Math.abs(dy);
          continue;
        }
        for (let column = 0; column < length; column++) {
          const a = (column / length - x) / dx, b = ((column + 1) / length - x) / dx;
          const start = Math.max(0, Math.min(a, b)), end = Math.min(1, Math.max(a, b));
          if (end > start) distances[column] += Math.hypot(dx * length, dy) * (end - start);
        }
      }
    }
    return distances.flatMap((distance, index) => distance >= .04 ? [index] : []);
  }
  const canComplete = state => coveredIndices(state).length === rowChars('words', state.row).length;

  function normalize(value = {}) {
    if (!value || typeof value !== 'object' || ![1, 2, 3].includes(value.version)) value = {};
    // Older rows refer to the original content order. New saves use the word's identity.
    const wordId = value.version === 3 ? value.wordId : sourceWords[integer(value.row, -1, sourceWords.length - 1)]?.id;
    const hasSelection = rowById.has(wordId), row = rowById.get(wordId) ?? 0;
    const counts = {};
    for (const word of words) {
      if (Number.isInteger(value.counts?.[word.id]) && value.counts[word.id] > 0) counts[word.id] = Math.min(value.counts[word.id], 99999);
    }
    const state = {
      version: 3, script: 'words', row, wordId: wordAt(row).id, index: 0,
      round: 1, repeat: 1, guide: value.guide !== false, counts, wordDone: false,
      pending: Array.isArray(value.pending) ? [...new Set(value.pending.filter(id => ids.has(id)))] : [],
      ink: hasSelection && value.version >= 2 ? shared.cleanInk(value.ink) : []
    };
    state.wordDone = hasSelection && value.version >= 2 && value.wordDone === true && !!counts[wordAt(row).id] && canComplete(state);
    return state;
  }

  function nextWord(state) {
    const wrapped = state.row === words.length - 1;
    state.row = (state.row + 1) % words.length;
    state.wordId = wordAt(state.row).id;
    state.index = 0; state.ink = []; state.wordDone = false;
    return { state, advanced: true, rowChanged: true, wrapped, wordCompleted: false };
  }

  function advance(value, completed) {
    const state = normalize(value), word = wordAt(state.row);
    if (state.wordDone) return nextWord(state);
    if (!completed) {
      if (!state.pending.includes(word.id)) state.pending.push(word.id);
      return nextWord(state);
    }
    if (!canComplete(state)) return { state, advanced: false, rowChanged: false, wrapped: false, wordCompleted: false };
    state.counts[word.id] = Math.min((state.counts[word.id] || 0) + 1, 99999);
    state.pending = state.pending.filter(id => id !== word.id);
    state.wordDone = true;
    return { state, advanced: true, rowChanged: false, wrapped: false, wordCompleted: true };
  }

  function select(value, changes = {}) {
    const state = normalize(value);
    if (changes.restart === true) { state.ink = []; state.wordDone = false; }
    if ('row' in changes) {
      const row = integer(changes.row, state.row, words.length - 1);
      if (row !== state.row) {
        state.row = row; state.wordId = wordAt(row).id; state.index = 0; state.ink = []; state.wordDone = false;
      }
    }
    return state;
  }

  function glyphAsset(data, character) {
    const key = 'u' + character.codePointAt(0).toString(16);
    return data?.hiragana?.strokes?.[key] || data?.extra?.strokes?.[key] || '';
  }

  const assetCache = new WeakMap();
  function wordAsset(data, state) {
    if (!data) return '';
    const word = wordAt(state.row);
    if (!assetCache.has(data)) assetCache.set(data, new Map());
    const cache = assetCache.get(data);
    if (cache.has(word.id)) return cache.get(word.id);
    const definitions = [], shadows = [], strokes = [];
    let strokeIndex = 0;
    for (const [index, character] of Array.from(word.ja).entries()) {
      const prefix = `${word.id}-${index}-`;
      const svg = glyphAsset(data, character)
        .replace(/\bid="([^"]+)"/gu, (_, id) => `id="${prefix}${id}"`)
        .replace(/\bhref="#([^"]+)"/gu, (_, id) => `href="#${prefix}${id}"`)
        .replace(/url\(#([^)]+)\)/gu, (_, id) => `url(#${prefix}${id})`);
      const parts = svg.match(/<defs>([\s\S]*?)<\/defs>\s*<g([^>]*data-strokesvg="shadows"[^>]*)>([\s\S]*?)<\/g>\s*<g([^>]*data-strokesvg="strokes"[^>]*)>([\s\S]*)<\/g>\s*<\/svg>\s*$/u);
      if (!parts) return '';
      const cleanAttributes = attributes => attributes.replace(/\s*data-strokesvg="[^"]*"/u, '');
      definitions.push(parts[1]);
      shadows.push(`<g transform="translate(${index * 1024} 0)"${cleanAttributes(parts[2])}>${parts[3]}</g>`);
      const ordered = parts[5].replace(/--i:\s*\d+/gu, () => `--i:${strokeIndex++}`);
      strokes.push(`<g transform="translate(${index * 1024} 0)"${cleanAttributes(parts[4])}>${ordered}</g>`);
    }
    const result = `<svg data-strokesvg="word" viewBox="0 0 ${word.ja.length * 1024} 1024" xmlns="http://www.w3.org/2000/svg"><defs>${definitions.join('')}</defs><g data-strokesvg="shadows">${shadows.join('')}</g><g data-strokesvg="strokes">${strokes.join('')}</g></svg>`;
    cache.set(word.id, result);
    return result;
  }

  const label = (word, index) => `${index + 1}. ${word.ja} · ${word.th}`;
  root.ThaiNaviJapaneseWordPractice = {
    KEY, words, locale: 'ja-JP', readingLang: 'th', wholeWord: true,
    normalize, current, advance, select, rowChars, coveredIndices, canComplete,
    getEntry(id, state) {
      return { id, glyph: id, reading: '', speechText: wordAt(state.row).speechText };
    },
    getWord(state) {
      const word = wordAt(state.row), pronunciation = reading.transcribe(word.ja);
      return { id: word.id, text: word.ja, emoji: word.emoji, meaning: word.th, reading: pronunciation.text, roman: pronunciation.roman, speechText: word.speechText };
    },
    isWordDone(state) { return state.wordDone === true; },
    progress(state) { return { written: words.filter(word => state.counts[word.id] > 0).length, total: words.length }; },
    rowLabels() { return words.map(label); },
    rowGroups() {
      return [{
        label: 'まず覚える20語 / เริ่มต้น 20 คำ',
        options: words.slice(0, starterIds.length).map((word, index) => ({ value: index, label: label(word, index) }))
      }, ...content.categories.map(category => ({
        label: `${category.ja} · ${category.th}`,
        options: words.map((word, index) => ({ word, index })).filter(item => item.index >= starterIds.length && item.word.category === category.id).map(item => ({ value: item.index, label: label(item.word, item.index) }))
      })).filter(group => group.options.length)];
    },
    scripts: [{ value: 'words', ja: 'ことば', th: 'คำศัพท์' }],
    total() { return words.length; },
    rowLabel: ['ことば', 'เลือกคำ'],
    listenLabel: ['🔊 ことばを聞く', '🔊 ฟังคำศัพท์'],
    loadURLs: { hiragana: 'kana/stroke-order-hiragana.json', extra: 'kana/word-extra-strokes.json?v=25' },
    validate(data) {
      if (data?.hiragana?.script !== 'hiragana' || data?.hiragana?.count !== 46 || data?.extra?.script !== 'hiragana-extra') return false;
      return words.every((word, row) => Array.from(word.ja).every(char => {
        const asset = glyphAsset(data, char);
        return typeof asset === 'string' && asset.startsWith('<svg') && asset.includes('data-strokesvg="strokes"');
      }) && !!wordAsset(data, { row }));
    },
    getAsset(data, entry, state) { return wordAsset(data, state); },
    licenseURL: 'kana/word-stroke-credits.txt',
    help: [
      '横に並んだ各枠への筆記を確認し、「書けた」で単語を記録します。文字の正しさを自動採点する機能ではありません。タイ文字で示した日本語の読み方は目安です。日本語の音声も聞いて練習してください。',
      'นับช่องที่มีรอยเขียน แล้วบันทึกคำเมื่อกดเขียนแล้ว ไม่ได้ตรวจความถูกต้องของลายมืออัตโนมัติ คำอ่านไทยเป็นเสียงใกล้เคียง ควรฟังเสียงญี่ปุ่นประกอบ'
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);
