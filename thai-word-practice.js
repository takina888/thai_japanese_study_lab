(function (root) {
  'use strict';
  const content = root.ThaiNaviThaiWordContent;
  const shared = root.ThaiNaviKanaPractice;
  const sourceWords = content.words;
  const starterIds = [
    'thai-word-010', 'thai-word-002', 'thai-word-001', 'thai-word-069', 'thai-word-055',
    'thai-word-049', 'thai-word-050', 'thai-word-052', 'thai-word-030', 'thai-word-029',
    'thai-word-007', 'thai-word-008', 'thai-word-009', 'thai-word-005', 'thai-word-091',
    'thai-word-098', 'thai-word-067', 'thai-word-064', 'thai-word-077', 'thai-word-074'
  ];
  const byId = new Map(sourceWords.map(word => [word.id, word]));
  const words = Object.freeze([...starterIds.map(id => byId.get(id)), ...sourceWords.filter(word => !starterIds.includes(word.id))]);
  const rowById = new Map(words.map((word, row) => [word.id, row]));
  const KEY = 'tn_thai_words_v1';
  const ids = new Set(words.map(word => word.id));
  const integer = (value, fallback, max) => Number.isInteger(value) && value >= 0 && value <= max ? value : fallback;
  const wordAt = row => words[integer(row, 0, words.length - 1)];
  let validatedAssets = null;
  const layoutFor = state => validatedAssets?.layouts?.[wordAt(state.row).id] || null;
  const current = state => wordAt(state.row).th;
  const rowChars = (script, row) => {
    const word = wordAt(row), count = layoutFor({ row })?.segments.length || 1;
    return Array.from({ length: count }, (_, index) => `${word.id}-part-${index + 1}`);
  };

  function coveredIndices(value) {
    const layout = layoutFor(value);
    if (!layout) return [];
    const distances = layout.segments.map(() => 0);
    for (const stroke of shared.cleanInk(value.ink)) {
      for (let point = 1; point < stroke.length; point++) {
        const [x, y] = stroke[point - 1], [endX, endY] = stroke[point];
        const dx = endX - x, dy = endY - y;
        for (const [index, segment] of layout.segments.entries()) {
          if (dx === 0) {
            if (x >= segment.start && (x < segment.end || index === layout.segments.length - 1 && x === segment.end)) distances[index] += Math.abs(dy);
            continue;
          }
          const a = (segment.start - x) / dx, b = (segment.end - x) / dx;
          const start = Math.max(0, Math.min(a, b)), end = Math.min(1, Math.max(a, b));
          if (end > start) distances[index] += Math.hypot(dx / (segment.end - segment.start), dy) * (end - start);
        }
      }
    }
    return distances.flatMap((distance, index) => distance >= .04 ? [index] : []);
  }
  const canComplete = state => {
    const layout = layoutFor(state);
    return !!layout && shared.hasInk(shared.cleanInk(state.ink)) && coveredIndices(state).length === layout.segments.length;
  };

  function normalize(value = {}) {
    if (!value || typeof value !== 'object' || ![1, 2].includes(value.version)) value = {};
    // Version 1 stored rows in content order; a stable ID now keeps drafts on the same word.
    const wordId = value.version === 2 ? value.wordId : sourceWords[integer(value.row, -1, sourceWords.length - 1)]?.id;
    const hasSelection = rowById.has(wordId), row = rowById.get(wordId) ?? 0, counts = {};
    for (const word of words) {
      if (Number.isInteger(value.counts?.[word.id]) && value.counts[word.id] > 0) counts[word.id] = Math.min(value.counts[word.id], 99999);
    }
    const state = {
      version: 2, script: 'thaiWords', row, wordId: wordAt(row).id, index: 0, round: 1, repeat: 1,
      guide: value.guide !== false, counts,
      pending: Array.isArray(value.pending) ? [...new Set(value.pending.filter(id => ids.has(id)))] : [],
      ink: hasSelection ? shared.cleanInk(value.ink) : [], wordDone: false
    };
    state.wordDone = hasSelection && value.wordDone === true && !!counts[wordAt(row).id] && shared.hasInk(state.ink) && (!validatedAssets || canComplete(state));
    return state;
  }
  const isWordDone = state => state.wordDone === true && canComplete(state);

  function nextWord(state) {
    const wrapped = state.row === words.length - 1;
    state.row = (state.row + 1) % words.length;
    state.wordId = wordAt(state.row).id;
    state.index = 0; state.ink = []; state.wordDone = false;
    return { state, advanced: true, rowChanged: true, wrapped, wordCompleted: false };
  }
  function advance(value, completed) {
    const state = normalize(value), word = wordAt(state.row);
    if (isWordDone(state)) return nextWord(state);
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
      if (row !== state.row) { state.row = row; state.wordId = wordAt(row).id; state.index = 0; state.ink = []; state.wordDone = false; }
    }
    return state;
  }

  function validLayout(layout, word) {
    if (!layout || layout.text !== word.th || !Number.isFinite(layout.width) || layout.width < 400 || layout.width > 2400 || layout.height !== 400) return false;
    if (!Array.isArray(layout.segments) || !layout.segments.length || layout.segments.length > 24) return false;
    let end = 0;
    for (const segment of layout.segments) {
      if (!segment || !Number.isFinite(segment.start) || !Number.isFinite(segment.end) || segment.start < end || segment.start < 0 || segment.end > 1 || segment.end <= segment.start) return false;
      end = segment.end;
    }
    return true;
  }
  function safeStaticSVG(svg, layout) {
    return typeof svg === 'string' && svg.startsWith('<svg ') &&
      svg.includes(`viewBox="0 0 ${layout.width} ${layout.height}"`) &&
      !/<(?:script|foreignObject|image|style|use|iframe|text)\b|\bon[a-z]+\s*=|(?:href|src)\s*=|url\(|javascript:|data-strokesvg\s*=/iu.test(svg) &&
      /<path\s/u.test(svg) && /<\/svg>$/u.test(svg);
  }
  const label = (word, index) => `${index + 1}. ${word.th} · ${word.ja}`;
  root.ThaiNaviThaiWordPractice = {
    KEY, words, locale: 'th-TH', readingLang: 'ja', wholeWord: true, hasStrokeOrder: false,
    normalize, current, advance, select, rowChars, coveredIndices, canComplete, isWordDone,
    progressUnit: ['部分', 'ส่วน'],
    getEntry(id, state) { return { id, glyph: wordAt(state.row).th, reading: '', speechText: wordAt(state.row).speechText }; },
    getWord(state) {
      const word = wordAt(state.row);
      return { id: word.id, text: word.th, emoji: word.emoji, meaning: word.ja, reading: word.japaneseReading, roman: word.roman, speechText: word.speechText };
    },
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
    scripts: [{ value: 'thaiWords', ja: 'ことば', th: 'คำศัพท์' }],
    total() { return words.length; },
    rowLabel: ['ことば', 'เลือกคำ'],
    listenLabel: ['🔊 ことばを聞く', '🔊 ฟังคำศัพท์'],
    loadURLs: { thaiWords: 'thai/word-tracing-forms.json?v=26' },
    validate(data) {
      const assets = data?.thaiWords;
      if (assets?.version !== 1 || assets.count !== words.length) return false;
      if (!words.every(word => validLayout(assets.layouts?.[word.id], word) && safeStaticSVG(assets.forms?.[word.id], assets.layouts[word.id]))) return false;
      validatedAssets = assets;
      return true;
    },
    getAsset(data, entry, state) { return data?.thaiWords?.forms?.[wordAt(state.row).id] || ''; },
    boardAspect(state, data) {
      const layout = data?.thaiWords?.layouts?.[wordAt(state.row).id] || layoutFor(state);
      return layout ? layout.width / layout.height : 2;
    },
    licenseURL: 'thai/word-credits.txt',
    licenseLabel: ['字形・教材の出典', 'ที่มาของแบบอักษรและเนื้อหา'],
    help: [
      '単語全体を見本になぞります。「書けた」で練習を記録します。文字の正しさや書き順を自動採点する機能ではありません。カタカナは目安です。音声も聞いて練習してください。',
      'ฝึกลากตามตัวอย่างทั้งคำ แล้วกดเขียนแล้วเพื่อบันทึกการฝึก ไม่ได้ตรวจความถูกต้องของลายมือหรือลำดับการเขียนอัตโนมัติ คำอ่านคาตาคานะเป็นเสียงใกล้เคียง ควรฟังเสียงไทยประกอบ'
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);
