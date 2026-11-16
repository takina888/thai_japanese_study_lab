(function (root) {
  'use strict';

  const syllables = {};
  const vowels = ['a', 'i', 'u', 'e', 'o'];
  function row(kana, roman, thai) {
    Array.from(kana).forEach((key, i) => { syllables[key] = { roman: roman + vowels[i], onset: thai, vowel: vowels[i] }; });
  }
  row('あいうえお', '', 'อ'); row('かきくけこ', 'k', 'ค'); row('がぎぐげご', 'g', 'ก');
  row('さしすせそ', 's', 'ซ'); row('ざじずぜぞ', 'z', 'ซ'); row('たちつてと', 't', 'ต');
  row('だぢづでど', 'd', 'ด'); row('なにぬねの', 'n', 'น'); row('はひふへほ', 'h', 'ฮ');
  row('ばびぶべぼ', 'b', 'บ'); row('ぱぴぷぺぽ', 'p', 'ป'); row('まみむめも', 'm', 'ม');
  row('らりるれろ', 'r', 'ร');
  Object.assign(syllables, {
    'し': { roman: 'shi', onset: 'ช', vowel: 'i' },
    'ち': { roman: 'chi', onset: 'จ', vowel: 'i' },
    'じ': { roman: 'ji', onset: 'จ', vowel: 'i' },
    'ぢ': { roman: 'ji', onset: 'จ', vowel: 'i' },
    'づ': { roman: 'zu', onset: 'ซ', vowel: 'u' },
    'つ': { roman: 'tsu', onset: 'ส', vowel: 'u', thai: 'สึ', thaiLong: 'สือ', special: 'tsu' },
    'ふ': { roman: 'fu', onset: 'ฟ', vowel: 'u' },
    'や': { roman: 'ya', onset: 'ย', vowel: 'a' },
    'ゆ': { roman: 'yu', onset: 'ย', vowel: 'u' },
    'よ': { roman: 'yo', onset: 'ย', vowel: 'o' },
    'わ': { roman: 'wa', onset: 'ว', vowel: 'a' },
    'を': { roman: 'o', onset: 'อ', vowel: 'o' },
    'ゔ': { roman: 'vu', onset: 'ว', vowel: 'u' }
  });
  const contracted = [
    ['き', 'ky', 'ค'], ['ぎ', 'gy', 'ก'], ['に', 'ny', 'น'], ['ひ', 'hy', 'ฮ'],
    ['び', 'by', 'บ'], ['ぴ', 'py', 'ป'], ['み', 'my', 'ม'], ['り', 'ry', 'ร']
  ];
  for (const [base, roman, thai] of contracted) {
    syllables[base + 'ゃ'] = { roman: roman + 'a', onset: thai, vowel: 'a', thai: 'เ' + thai + 'ียะ', thaiLong: 'เ' + thai + 'ีย', contracted: true };
    syllables[base + 'ゅ'] = { roman: roman + 'u', onset: thai, vowel: 'u', thai: thai + 'ิว', thaiLong: thai + 'ิว', contracted: true, lengthLabel: true };
    syllables[base + 'ょ'] = { roman: roman + 'o', onset: thai, vowel: 'o', thai: 'เ' + thai + 'ียว', thaiLong: 'เ' + thai + 'ียว', contracted: true, lengthLabel: true };
  }
  for (const [base, roman, thai] of [['し', 'sh', 'ช'], ['ち', 'ch', 'จ'], ['じ', 'j', 'จ'], ['ぢ', 'j', 'จ']]) {
    for (const [ending, vowel] of [['ゃ', 'a'], ['ゅ', 'u'], ['ょ', 'o']]) {
      syllables[base + ending] = { roman: roman + vowel, onset: thai, vowel, contracted: true };
    }
  }
  for (const [kana, roman, onset, vowel] of [
    ['てぃ', 'ti', 'ต', 'i'], ['でぃ', 'di', 'ด', 'i'], ['とぅ', 'tu', 'ต', 'u'], ['どぅ', 'du', 'ด', 'u'],
    ['ふぁ', 'fa', 'ฟ', 'a'], ['ふぃ', 'fi', 'ฟ', 'i'], ['ふぇ', 'fe', 'ฟ', 'e'], ['ふぉ', 'fo', 'ฟ', 'o'],
    ['うぃ', 'wi', 'ว', 'i'], ['うぇ', 'we', 'ว', 'e'], ['うぉ', 'wo', 'ว', 'o'],
    ['しぇ', 'she', 'ช', 'e'], ['じぇ', 'je', 'จ', 'e'], ['ちぇ', 'che', 'จ', 'e'],
    ['ゔぁ', 'va', 'ว', 'a'], ['ゔぃ', 'vi', 'ว', 'i'], ['ゔぇ', 've', 'ว', 'e'], ['ゔぉ', 'vo', 'ว', 'o']
  ]) syllables[kana] = { roman, onset, vowel };

  const longVowels = { a: 'ā', i: 'ī', u: 'ū', e: 'ē', o: 'ō' };
  const toHiragana = text => String(text || '').normalize('NFKC').replace(/\.{3}/gu, '…').replace(/[ァ-ヶ]/gu, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
  function vowelText(onset, vowel, long, coda = '') {
    if (coda) {
      if (vowel === 'a') return onset + (long ? 'า' : 'ั') + coda;
      if (vowel === 'i') return onset + (long ? 'ี' : 'ิ') + coda;
      if (vowel === 'u') return onset + (long ? 'ู' : 'ุ') + coda;
      if (vowel === 'e') return 'เ' + onset + (long ? '' : '็') + coda;
      return (long ? 'โ' : '') + onset + coda;
    }
    return { a: onset + (long ? 'า' : 'ะ'), i: onset + (long ? 'ี' : 'ิ'), u: onset + (long ? 'ู' : 'ุ'), e: 'เ' + onset + (long ? '' : 'ะ'), o: 'โ' + onset + (long ? '' : 'ะ') }[vowel];
  }
  function romanUnit(unit) {
    return unit.long ? unit.roman.slice(0, -1) + longVowels[unit.vowel] : unit.roman;
  }
  function tokenize(input) {
    const text = toHiragana(input).replace(/・/gu, ' / ');
    const units = [], unsupported = [];
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (/\s/u.test(ch)) { if (units.at(-1)?.kind !== 'space') units.push({ kind: 'space' }); continue; }
      if (ch === '/') { units.push({ kind: 'alternative' }); continue; }
      if ('。、,.!?！？'.includes(ch)) { units.push({ kind: 'punctuation', text: '。.'.includes(ch) ? '.' : '、,'.includes(ch) ? ',' : '!！'.includes(ch) ? '!' : '?' }); continue; }
      if (ch === '…' || ch === '〜' || ch === '~') { units.push({ kind: 'blank', text: '…' }); continue; }
      if (ch === 'っ') { units.push({ kind: 'hold', kana: ch, mora: 1 }); continue; }
      if (ch === 'ん') { units.push({ kind: 'nasal', kana: ch, mora: 1 }); continue; }
      const previous = units.at(-1);
      if (ch === 'ー' && previous?.kind === 'sound') { previous.long = true; previous.mora += 1; previous.kana += ch; continue; }
      if (previous?.kind === 'sound' && !previous.long && (
        { a: 'あ', i: 'い', u: 'う', e: 'えい', o: 'おう' }[previous.vowel].includes(ch)
      )) { previous.long = true; previous.mora += 1; previous.kana += ch; continue; }
      const pair = text.slice(i, i + 2);
      const key = syllables[pair] ? pair : ch;
      const definition = syllables[key];
      if (!definition) { unsupported.push(ch); continue; }
      if (key.length === 2) i++;
      units.push({ ...definition, kind: 'sound', kana: key, mora: 1, long: false });
    }
    return { units, unsupported };
  }
  function nextSound(units, start) {
    for (let i = start; i < units.length; i++) {
      if (units[i].kind === 'space') continue;
      return units[i].kind === 'sound' ? units[i] : null;
    }
    return null;
  }
  function transcribe(input) {
    const { units, unsupported } = tokenize(input);
    const output = [], flags = new Set();
    let roman = '', mora = 0;
    for (let i = 0; i < units.length; i++) {
      const unit = units[i];
      mora += unit.mora || 0;
      if (unit.kind === 'space') { output.push({ kind: 'space', text: ' ' }); roman += ' '; continue; }
      if (unit.kind === 'alternative') { output.push({ kind: 'alternative', text: ' / ' }); roman += ' / '; continue; }
      if (unit.kind === 'punctuation') { output.push({ kind: 'punctuation', text: unit.text }); roman += unit.text; continue; }
      if (unit.kind === 'blank') { output.push({ kind: 'blank', text: '…' }); roman += '…'; flags.add('blank'); continue; }
      const following = nextSound(units, i + 1);
      if (unit.kind === 'nasal' || unit.kind === 'hold') {
        const previous = output.at(-1);
        let coda = '';
        if (unit.kind === 'nasal') {
          flags.add('nasal');
          coda = following && /^[bmp]/u.test(following.roman) ? 'ม' : following && /^[tdnrcj]/u.test(following.roman) ? 'น' : 'ง';
          roman += units[i + 1]?.kind === 'sound' && following && /^[aiueoy]/u.test(following.roman) ? "n'" : 'n';
        } else {
          flags.add('hold');
          const consonant = following?.roman || '';
          coda = /^[kg]/u.test(consonant) ? 'ก' : /^[pb]/u.test(consonant) ? 'ป' : /^(t|d|ch)/u.test(consonant) ? 'ต' : '';
          roman += consonant.startsWith('ch') ? 't' : consonant[0] || '';
        }
        if (coda && previous?.kind === 'sound' && !previous.coda && !previous.definition.thai && !(unit.kind === 'hold' && previous.definition.vowel === 'o')) {
          previous.coda = coda;
          previous.text = vowelText(previous.definition.onset, previous.definition.vowel, previous.definition.long, coda);
          previous.mora += 1;
        } else {
          output.push({ kind: unit.kind, text: unit.kind === 'hold' ? 'っ' : coda || 'ง', mora: 1 });
        }
        continue;
      }
      if (unit.long) flags.add('long');
      if (unit.contracted) flags.add('contracted');
      if (unit.special) flags.add(unit.special);
      output.push({ kind: 'sound', text: unit.thai ? (unit.long ? unit.thaiLong : unit.thai) : vowelText(unit.onset, unit.vowel, unit.long), definition: unit, mora: unit.mora, lengthLabel: unit.lengthLabel ? (unit.long ? 'ยาว' : 'สั้น') : '' });
      roman += romanUnit(unit);
    }
    let text = '';
    for (const token of output) {
      if (['space', 'alternative', 'punctuation'].includes(token.kind)) { text = text.replace(/-$/u, '') + token.text; continue; }
      if (text && !/[\s/,?!.]$/u.test(text)) text += '-';
      text += token.text;
      if (token.lengthLabel) text += '(' + token.lengthLabel + ')';
    }
    return { tokens: output, text: text.replace(/\s+/gu, ' ').trim(), roman: roman.replace(/\s+/gu, ' ').trim(), mora, flags: [...flags], unsupported };
  }

  const cache = new Map();
  function forItem(item) {
    if (!item) return null;
    const override = (root.ThaiNaviJapaneseKana || {})[item.id];
    const kana = override?.kana || String(item.jaHira || '').replace(/・/gu, ' / ').trim();
    const phonetic = (override?.phonetic || kana).replace(/(^|\s|\/)(どういう|そういう|っていう|という|いう)(?=\s|\/|$)/gu, (_, before, word) => before + ({ 'どういう': 'どうゆう', 'そういう': 'そうゆう', 'っていう': 'ってゆう', 'という': 'とゆう', 'いう': 'ゆう' })[word]);
    const key = item.id + '\n' + kana + '\n' + phonetic;
    if (cache.has(key)) return cache.get(key);
    const result = { ...transcribe(phonetic), kana };
    cache.set(key, result);
    return result;
  }
  root.ThaiNaviJapaneseLearning = { forItem, transcribe };
})(typeof window !== 'undefined' ? window : globalThis);
