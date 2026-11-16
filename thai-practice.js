(function (root) {
  'use strict';
  const content = root.ThaiNaviThaiWritingContent;
  const shared = root.ThaiNaviKanaPractice;
  const KEY = 'tn_thai_practice_v1';
  const entries = [...content.consonants, ...content.vowels];
  const byId = new Map(entries.map(entry => [entry.id, entry]));
  const groups = Object.fromEntries(['consonant', 'vowel'].map(type => {
    const rows = [];
    for (const entry of entries.filter(item => item.type === type)) {
      let row = rows.find(item => item.group === entry.group);
      if (!row) { row = { group: entry.group, ids: [] }; rows.push(row); }
      row.ids.push(entry.id);
    }
    return [type, rows.map(row => row.ids)];
  }));
  const scriptName = value => value === 'vowel' ? 'vowel' : 'consonant';
  const integer = (value, fallback, max) => Number.isInteger(value) && value >= 0 && value <= max ? value : fallback;
  const rowChars = (script, row) => (groups[scriptName(script)][row] || groups[scriptName(script)][0]).slice();
  const current = state => rowChars(state.script, state.row)[state.index];

  function normalize(value = {}) {
    if (!value || typeof value !== 'object' || value.version !== 1) value = {};
    const script = scriptName(value.script);
    const row = integer(value.row, 0, groups[script].length - 1);
    const repeat = shared.REPEATS.includes(value.repeat) ? value.repeat : 3;
    const counts = {};
    for (const entry of entries) {
      if (Number.isInteger(value.counts?.[entry.id]) && value.counts[entry.id] > 0) counts[entry.id] = Math.min(value.counts[entry.id], 99999);
    }
    return {
      version: 1, script, row,
      index: integer(value.index, 0, rowChars(script, row).length - 1),
      round: Math.max(1, integer(value.round, 1, repeat)), repeat,
      guide: value.guide !== false, counts,
      pending: Array.isArray(value.pending) ? [...new Set(value.pending.filter(id => byId.has(id)))] : [],
      ink: shared.cleanInk(value.ink)
    };
  }

  function advance(value, completed) {
    const state = normalize(value), id = current(state);
    if (completed && !shared.hasInk(state.ink)) return { state, advanced: false, rowChanged: false, wrapped: false };
    if (completed) {
      state.counts[id] = Math.min((state.counts[id] || 0) + 1, 99999);
      state.pending = state.pending.filter(item => item !== id);
    } else if (!state.pending.includes(id)) state.pending.push(id);
    state.ink = [];
    state.index++;
    let rowChanged = false, wrapped = false;
    if (state.index >= rowChars(state.script, state.row).length) {
      state.index = 0;
      state.round++;
      if (state.round > state.repeat) {
        state.round = 1;
        state.row++;
        rowChanged = true;
        if (state.row >= groups[state.script].length) { state.row = 0; wrapped = true; }
      }
    }
    return { state, advanced: true, rowChanged, wrapped };
  }

  function select(value, changes = {}) {
    const state = normalize(value);
    if ('script' in changes && scriptName(changes.script) !== state.script) {
      state.script = scriptName(changes.script); state.row = 0; state.index = 0; state.round = 1; state.ink = [];
    }
    if ('row' in changes && changes.row !== state.row) {
      state.row = integer(changes.row, 0, groups[state.script].length - 1); state.index = 0; state.round = 1; state.ink = [];
    }
    if ('index' in changes && changes.index !== state.index) {
      state.index = integer(changes.index, 0, rowChars(state.script, state.row).length - 1); state.ink = [];
    }
    if ('repeat' in changes && shared.REPEATS.includes(changes.repeat)) {
      state.repeat = changes.repeat; state.round = Math.min(state.round, state.repeat);
    }
    return state;
  }

  root.ThaiNaviThaiPractice = {
    KEY, locale: 'th-TH', readingLang: 'ja', hasStrokeOrder: false,
    normalize, current, advance, select, rowChars,
    getEntry(id) {
      const entry = byId.get(id);
      if (!entry) return null;
      const sound = root.ThaiNaviThaiReading?.getEntry(id);
      if (!sound) return { ...entry, reading: `文字名（参考）：${entry.japaneseReading} · ${entry.roman}`, note: entry.noteJa || '', noteLang: 'ja', listenLabel: ['🔊 文字名を聞く', '🔊 ฟังชื่ออักษร'] };
      return { ...entry, sound, reading: `${sound.roman} · ${sound.guideJa}`,
        note: `音の例：${sound.sampleText} · ${sound.sampleJa}（${sound.sampleRoman}）`,
        noteLang: 'ja', speechText: sound.sampleText,
        reference: { type: entry.type, name: sound.name, reading: sound.nameReading, roman: sound.nameRoman,
          speechText: sound.nameSpeech, mnemonic: sound.mnemonic, meaningJa: sound.meaningJa }
      };
    },
    rowLabels(state) { return groups[state.script].map(row => row.map(id => byId.get(id).glyph).join(' ')); },
    scripts: [
      { value: 'consonant', ja: '子音 44', th: 'พยัญชนะ 44' },
      { value: 'vowel', ja: '基本母音 18', th: 'สระพื้นฐาน 18 เสียง' }
    ],
    total(state) { return state.script === 'vowel' ? 18 : 44; },
    rowLabel: ['文字', 'เลือกชุด'],
    listenLabel: ['🔊 音の例を聞く', '🔊 ฟังตัวอย่างเสียง'],
    loadURLs: { thai: 'thai/tracing-forms.json?v=24' },
    validate(data) {
      return data?.thai?.version === 1 && data.thai.count === entries.length && entries.every(entry => typeof data.thai.forms?.[entry.id] === 'string' && data.thai.forms[entry.id].startsWith('<svg'));
    },
    getAsset(data, entry) { return data?.thai?.forms?.[entry.id] || ''; },
    licenseURL: 'thai/credits.txt',
    licenseLabel: ['字形・教材の出典', 'ที่มาของแบบอักษรและเนื้อหา'],
    help: [
      '母音は อ と組み合わせた形で練習します。「音の例を聞く」では母音を添えた音声を再生します。文字・母音の名前は参考欄で確認できます。カタカナは発音の目安です。書いた回数を記録しますが、字形や書き順の自動採点はしません。',
      'ฝึกสระโดยใช้ อ รองรับสระ ปุ่มฟังตัวอย่างเสียงอ่านเสียงที่มีสระประกอบ ชื่ออักษรและชื่อสระอยู่ในส่วนเพิ่มเติม คำอ่านคาตาคานะเป็นเสียงใกล้เคียง บันทึกจำนวนครั้งที่ฝึก แต่ไม่ได้ตรวจรูปอักษรหรือลำดับการเขียนอัตโนมัติ'
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);
