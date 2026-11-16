(function (root) {
  'use strict';
  const KEY = 'tn_thai_reading_v1';
  const SCRIPTS = ['consonant', 'vowel'];
  const QUESTION_COUNT = 10, PASS_SCORE = 8;
  const content = root.ThaiNaviThaiWritingContent;
  if (!content?.consonants || !content?.vowels) return;
  // These are basic INITIAL sounds, not full letter names or final-consonant values.
  const sounds = [
    ['k','ก','k','息を強く出さない「カ」の子音','โคนลิ้นแตะเพดานอ่อน ไม่พ่นลม'],
    ['kh','ขฃคฅฆ','kh','息を出す「カ」の子音','โคนลิ้นแตะเพดานอ่อน แล้วพ่นลม'],
    ['ng','ง','ng','鼻に抜ける「ング」の子音','เสียงขึ้นจมูก โคนลิ้นแตะเพดานอ่อน'],
    ['c','จ','c','息を強く出さない「チ」の子音','เสียงกักเสียดแทรก ไม่พ่นลม'],
    ['ch','ฉชฌ','ch','息を出す「チ」の子音','เสียงกักเสียดแทรก พ่นลม'],
    ['s','ซศษส','s','「サ」の子音','เสียงเสียดแทรกที่ปุ่มเหงือก'],
    ['y','ญย','y','「ヤ」の子音','ยกกลางลิ้นใกล้เพดานแข็ง'],
    ['d','ฎด','d','「ダ」の子音','ปลายลิ้นแตะปุ่มเหงือก เส้นเสียงสั่น'],
    ['t','ฏต','t','息を強く出さない「タ」の子音','ปลายลิ้นแตะปุ่มเหงือก ไม่พ่นลม'],
    ['th','ฐฑฒถทธ','th','息を出す「タ」の子音','ปลายลิ้นแตะปุ่มเหงือก แล้วพ่นลม'],
    ['n','ณน','n','「ナ」の子音','เสียงขึ้นจมูก ปลายลิ้นแตะปุ่มเหงือก'],
    ['b','บ','b','「バ」の子音','ปิดริมฝีปากแล้วเปิด เส้นเสียงสั่น'],
    ['p','ป','p','息を強く出さない「パ」の子音','ปิดริมฝีปากแล้วเปิด ไม่พ่นลม'],
    ['ph','ผพภ','ph','息を出す「パ」の子音','ปิดริมฝีปากแล้วพ่นลม'],
    ['f','ฝฟ','f','上の歯を下唇に近づけて出す音','ลมเสียดสีกับฟันบนและริมฝีปากล่าง'],
    ['m','ม','m','「マ」の子音','ปิดริมฝีปาก ให้เสียงออกทางจมูก'],
    ['r','ร','r','舌先をはじく・ふるわせる音','กระดกหรือรัวปลายลิ้น'],
    ['l','ลฬ','l','舌先を上の歯ぐきに付ける音','ปลายลิ้นแตะปุ่มเหงือก ลมออกข้างลิ้น'],
    ['w','ว','w','唇を丸めて出す「ワ」の子音','ห่อริมฝีปากแล้วคลาย'],
    ['h','หฮ','h','「ハ」の子音','ปล่อยลมผ่านช่องคอ'],
    ['glottal','อ','ʔ','母音の前で喉を軽く閉じる音','ปิดเส้นเสียงชั่วครู่ก่อนเริ่มสระ']
  ];
  const vowelHints = [
    ['アに近い音','อ้าปากกว้าง ลิ้นอยู่ต่ำ'], ['イに近い音','ยกลิ้นส่วนหน้าสูง ไม่ห่อริมฝีปาก'],
    ['ウに近い音・唇を丸めない','ยกลิ้นส่วนกลางสูง ไม่ห่อริมฝีปาก'],
    ['ウに近い音・唇を丸める','ยกลิ้นส่วนหลังสูง ห่อริมฝีปาก'],
    ['エに近い音・口をやや狭く','ลิ้นส่วนหน้าอยู่ระดับกลาง ไม่ห่อริมฝีปาก'],
    ['エに近い音・口を広く','ลิ้นส่วนหน้าอยู่ต่ำ อ้าปากกว้าง'],
    ['オに近い音・唇を丸め、口をやや狭く','ลิ้นส่วนหลังอยู่ระดับกลาง ห่อริมฝีปาก'],
    ['オに近い音・口を広く','อ้าปากกว้าง ห่อริมฝีปาก'],
    ['力を抜き、唇を丸めず軽く開く音','ลิ้นอยู่กลางปาก เปิดปากเล็กน้อย ไม่ห่อริมฝีปาก']
  ];
  const entries = [...content.consonants, ...content.vowels].map(entry => {
    const vowel = entry.type === 'vowel', index = content.vowels.indexOf(entry);
    const sound = !vowel && sounds.find(item => item[1].includes(entry.id));
    const long = vowel && index % 2 === 1, hint = vowel && vowelHints[Math.floor(index / 2)];
    const noteJa = [entry.obsolete ? '現在の通常のつづりでは使いません。' : '',
      entry.id === 'ฑ' ? 'ここでは基本の th を練習します。単語によって d と読む場合もあります。' : '',
      entry.id === 'อ' ? '母音を置く土台にも使う文字です。ここでは音節の初めの音を覚えます。' : ''].filter(Boolean).join(' ');
    const noteTh = [entry.obsolete ? 'ปัจจุบันไม่ใช้ในการสะกดคำทั่วไป' : '',
      entry.id === 'ฑ' ? 'ชุดนี้ฝึกเสียงต้น th แต่บางคำออกเสียง d' : '',
      entry.id === 'อ' ? 'อ ใช้รองรับสระได้ด้วย ชุดนี้ฝึกเสียงต้นพยางค์' : ''].filter(Boolean).join(' ');
    return Object.freeze({
      id: entry.id, character: entry.glyph, type: entry.type, group: entry.group,
      soundId: vowel ? entry.roman : sound?.[0], roman: vowel ? entry.roman : sound?.[2],
      guideJa: vowel ? `${long ? '長く' : '短く'}：${hint[0]}` : sound?.[3],
      guideTh: vowel ? `${long ? 'เสียงยาว' : 'เสียงสั้น'} · ${hint[1]}` : sound?.[4],
      sampleText: vowel ? entry.glyph : entry.speechText.split(/\s+/u)[0],
      sampleRoman: vowel ? entry.roman : entry.roman.split(/\s+/u)[0],
      sampleJa: vowel ? entry.japaneseReading : entry.japaneseReading.split('・')[0],
      name: entry.thaiName, nameReading: entry.japaneseReading, nameRoman: entry.roman,
      nameSpeech: entry.speechText,
      mnemonic: vowel ? '' : entry.thaiName.slice(entry.glyph.length).trim(),
      meaningJa: vowel ? '' : entry.meaningJa, noteJa, noteTh, obsolete: entry.obsolete
    });
  });
  const byId = new Map(entries.map(entry => [entry.id, entry]));
  const byGlyph = new Map(entries.map(entry => [entry.character, entry]));
  const rows = Object.fromEntries(SCRIPTS.map(script => {
    const grouped = new Map();
    for (const entry of entries.filter(item => item.type === script)) {
      if (!grouped.has(entry.group)) grouped.set(entry.group, []);
      grouped.get(entry.group).push(entry.id);
    }
    return [script, [...grouped.values()]];
  }));
  const valid = (script, row) => SCRIPTS.includes(script) && Number.isInteger(row) && row >= 0 && row < rows[script].length;
  const getEntry = id => { const entry = byId.get(id) || byGlyph.get(id); return entry ? { ...entry } : null; };
  function shuffle(input, random) {
    const result = input.slice();
    for (let index = result.length - 1; index > 0; index--) {
      const draw = Number(random()), fraction = Number.isFinite(draw) ? Math.max(0, Math.min(draw, 0.999999999999)) : 0;
      const other = Math.floor(fraction * (index + 1));
      [result[index], result[other]] = [result[other], result[index]];
    }
    return result;
  }
  function normalize(raw) {
    return Object.fromEntries(SCRIPTS.map(script => {
      const stored = raw?.version === 1 ? raw?.scripts?.[script] : null;
      const allowed = new Set(rows[script].flat());
      const seen = new Set(Array.isArray(stored?.seen) ? stored.seen.filter(id => allowed.has(id)) : []);
      const best = rows[script].map((ids, row) => {
        const score = stored?.best?.[row];
        return Number.isInteger(score) && score >= 0 && score <= QUESTION_COUNT && ids.every(id => seen.has(id)) ? score : 0;
      });
      return [script, { seen, best }];
    }));
  }
  function create({ preferences, random = Math.random, onStorage = () => {} } = {}) {
    if (typeof random !== 'function') random = Math.random;
    let raw = null;
    try { raw = preferences?.json?.(KEY, null); } catch {}
    const records = normalize(raw);
    let active = null;
    function readLatest() {
      try { return preferences?.json?.(KEY, null, { fresh: true }); } catch { return null; }
    }
    function mergeRecords(latest) {
      // Merge monotonic progress before saving so a stale tab cannot erase a
      // previously earned stamp or replace a higher result with its own score.
      for (const script of SCRIPTS) {
        for (const id of latest[script].seen) records[script].seen.add(id);
        records[script].best = records[script].best.map((score, row) => Math.max(score, latest[script].best[row]));
      }
    }
    function mergeLatest() { mergeRecords(normalize(readLatest())); }
    const hasProgress = snapshot => SCRIPTS.some(script => snapshot[script].seen.size > 0);
    function persist(incoming = null) {
      const raw = readLatest(), latest = normalize(raw);
      // Do not resurrect cleared/reset progress from an old queued event.
      if (incoming && (raw?.version !== 1 || !hasProgress(latest))) return false;
      if (incoming) mergeRecords(incoming);
      mergeRecords(latest);
      if (incoming && !SCRIPTS.some(script =>
        [...records[script].seen].some(id => !latest[script].seen.has(id)) ||
        records[script].best.some((score, row) => score > latest[script].best[row]))) return true;
      const value = { version: 1, scripts: {} };
      for (const script of SCRIPTS) value.scripts[script] = { seen: [...records[script].seen], best: records[script].best.slice() };
      let saved = false;
      try { saved = preferences?.set?.(KEY, JSON.stringify(value)) === true; } catch {}
      if (typeof onStorage === 'function') onStorage(saved);
      return saved;
    }
    root.addEventListener?.('storage', event => {
      if (event.key !== KEY || typeof event.newValue !== 'string') return;
      let incoming;
      try {
        const raw = JSON.parse(event.newValue);
        if (raw?.version !== 1) return;
        incoming = normalize(raw);
      } catch { return; }
      // The event itself can contain progress lost in a colliding newer write.
      // Persist only a strict increase, so reconciliation does not bounce forever.
      if (hasProgress(incoming)) persist(incoming);
    });
    function status(script, row) {
      if (!valid(script, row)) return null;
      mergeLatest();
      const record = records[script], passed = record.best[row] >= PASS_SCORE;
      const passedRowIndices = rows[script].map((_, index) => index).filter(index => record.best[index] >= PASS_SCORE);
      const completed = passedRowIndices.reduce((sum, index) => sum + rows[script][index].length, 0);
      const totalChars = rows[script].flat().length;
      const characters = rows[script][row].map(id => ({ ...getEntry(id), seen: record.seen.has(id), passed }));
      const seen = characters.filter(item => item.seen).length;
      const overallCompleted = SCRIPTS.reduce((sum, type) => sum + rows[type].reduce((count, ids, index) => count + (records[type].best[index] >= PASS_SCORE ? ids.length : 0), 0), 0);
      return { script, row, label: characters.map(item => item.character).join(' '), characters,
        total: characters.length, seen, ready: seen === characters.length, best: record.best[row], passed,
        passedRows: passedRowIndices.length, passedRowIndices, totalRows: rows[script].length,
        completed, totalChars, percent: Math.floor(completed / totalChars * 100),
        overallCompleted, overallTotal: entries.length, overallPercent: Math.floor(overallCompleted / entries.length * 100) };
    }
    function view(script, row, index) {
      if (!valid(script, row) || !Number.isInteger(index) || index < 0 || index >= rows[script][row].length) return false;
      mergeLatest();
      const id = rows[script][row][index], record = records[script];
      if (!record.seen.has(id)) { record.seen.add(id); persist(); }
      return true;
    }
    const copyQuestion = question => question ? { id: question.id, character: question.character,
      choices: question.choices.map(choice => ({ ...choice })) } : null;
    const copyResult = result => result ? { ...result, wrongCharacters: result.wrongCharacters.slice(), passedRowIndices: result.passedRowIndices.slice() } : null;
    function session() {
      if (!active) return null;
      const answer = active.answers[active.index];
      return { script: active.script, row: active.row, index: active.index, total: QUESTION_COUNT,
        answered: !!answer, finished: active.finished, question: copyQuestion(active.questions[active.index]),
        answer: answer ? { ...answer } : null, score: active.score, result: copyResult(active.result) };
    }
    function makeQuestion(id, script) {
      const correct = byId.get(id);
      if (!correct?.soundId || !correct.roman) return null;
      const unique = new Map();
      for (const entry of entries.filter(item => item.type === script)) {
        // ฑ has a legitimate d pronunciation in some words; it must never be a wrong choice here.
        if (entry.soundId !== correct.soundId && !(id === 'ฑ' && entry.soundId === 'd') && !unique.has(entry.soundId)) unique.set(entry.soundId, entry);
      }
      if (unique.size < 3) return null;
      const choices = shuffle([correct, ...shuffle([...unique.values()], random).slice(0, 3)], random)
        .map(entry => ({ id: entry.soundId, roman: entry.roman, guideJa: entry.guideJa, guideTh: entry.guideTh }));
      return { id, character: correct.character, choices, correctId: correct.soundId };
    }
    function start(script, row) {
      const state = status(script, row);
      if (!state?.ready) return null;
      const ids = rows[script][row], each = Math.floor(QUESTION_COUNT / ids.length);
      const bonus = new Set(shuffle(ids, random).slice(0, QUESTION_COUNT % ids.length));
      const repeated = ids.flatMap(id => Array(each + (bonus.has(id) ? 1 : 0)).fill(id));
      const questions = shuffle(repeated, random).map(id => makeQuestion(id, script));
      if (questions.some(question => !question)) return null;
      active = { script, row, index: 0, questions, answers: [], score: 0, finished: false,
        alreadyPassed: state.passed, result: null };
      return session();
    }
    function finish() {
      records[active.script].best[active.row] = Math.max(records[active.script].best[active.row], active.score);
      const state = status(active.script, active.row), passed = active.score >= PASS_SCORE;
      const wrong = new Set(active.questions.filter((_, index) => !active.answers[index].correct).map(question => question.id));
      active.finished = true;
      active.result = { script: active.script, row: active.row, score: active.score, total: QUESTION_COUNT,
        passed, rowPassed: state.passed, alreadyPassed: active.alreadyPassed, newPass: passed && !active.alreadyPassed,
        wrongCharacters: rows[active.script][active.row].filter(id => wrong.has(id)).map(id => byId.get(id).character),
        best: state.best, completed: state.completed, totalChars: state.totalChars, percent: state.percent,
        totalRows: state.totalRows, passedRows: state.passedRows, passedRowIndices: state.passedRowIndices.slice() };
      persist();
    }
    function answer(choiceId) {
      if (!active || active.finished || active.answers[active.index] || typeof choiceId !== 'string') return null;
      const question = active.questions[active.index];
      if (!question.choices.some(choice => choice.id === choiceId)) return null;
      const correct = choiceId === question.correctId;
      active.answers[active.index] = { chosenId: choiceId, correctId: question.correctId, correct };
      if (correct) active.score++;
      if (active.index === QUESTION_COUNT - 1) finish();
      return session();
    }
    function next() {
      if (!active || active.finished || !active.answers[active.index]) return null;
      active.index++; return session();
    }
    function cancel() { active = null; }
    return { status, view, start, session, answer, next, cancel, getEntry };
  }
  root.ThaiNaviThaiReading = { create, KEY, getEntry };
})(typeof window !== 'undefined' ? window : globalThis);
