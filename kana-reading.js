(function (root) {
  'use strict';
  const KEY = 'tn_kana_reading_v1';
  const ROWS = Object.freeze(['あいうえお', 'かきくけこ', 'さしすせそ', 'たちつてと', 'なにぬねの',
    'はひふへほ', 'まみむめも', 'やゆよ', 'らりるれろ', 'わをん']);
  const SCRIPTS = ['hiragana', 'katakana'];
  const QUESTION_COUNT = 10;
  const PASS_SCORE = 8;
  const katakana = text => Array.from(text, char => String.fromCharCode(char.charCodeAt(0) + 0x60)).join('');
  const scriptRows = script => script === 'katakana' ? ROWS.map(katakana) : ROWS;
  const isScript = script => SCRIPTS.includes(script);
  const isRow = row => Number.isInteger(row) && row >= 0 && row < ROWS.length;
  const rowChars = (script, row) => Array.from(scriptRows(script)[row]);
  function shuffle(input, random) {
    const output = input.slice();
    for (let index = output.length - 1; index > 0; index--) {
      const draw = Number(random());
      const fraction = Number.isFinite(draw) ? Math.max(0, Math.min(draw, 0.999999999999)) : 0;
      const other = Math.floor(fraction * (index + 1));
      [output[index], output[other]] = [output[other], output[index]];
    }
    return output;
  }
  function normalize(raw) {
    const output = Object.create(null);
    for (const script of SCRIPTS) {
      const stored = raw?.version === 1 ? raw?.scripts?.[script] : null;
      const allowed = new Set(scriptRows(script).flatMap(text => Array.from(text)));
      const seen = new Set(Array.isArray(stored?.seen) ? stored.seen.filter(char => allowed.has(char)) : []);
      const best = ROWS.map((_, row) => {
        const value = stored?.best?.[row];
        return Number.isInteger(value) && value >= 0 && value <= QUESTION_COUNT &&
          rowChars(script, row).every(char => seen.has(char)) ? value : 0;
      });
      output[script] = { seen, best };
    }
    return output;
  }
  function create(options = {}) {
    const preferences = options.preferences;
    const reading = options.reading || root.ThaiNaviJapaneseLearning;
    const random = typeof options.random === 'function' ? options.random : Math.random;
    const onStorage = typeof options.onStorage === 'function' ? options.onStorage : () => {};
    let raw = null;
    try { raw = preferences?.json?.(KEY, null); } catch {}
    const records = normalize(raw);
    const entries = new Map();
    for (const script of SCRIPTS) {
      for (const character of scriptRows(script).flatMap(text => Array.from(text))) {
        let transcription = null;
        try { transcription = reading?.transcribe?.(character); } catch {}
        const rawRoman = ['を', 'ヲ'].includes(character) ? 'o' : transcription?.roman;
        const roman = typeof rawRoman === 'string' ? rawRoman.normalize('NFKC').trim().toLowerCase() : '';
        const thai = typeof transcription?.text === 'string' ? transcription.text.trim() : '';
        const available = /^[a-z]+$/u.test(roman) && !!thai &&
          (!Array.isArray(transcription?.unsupported) || transcription.unsupported.length === 0);
        entries.set(character, { character, roman, thai, available });
      }
    }
    let active = null;
    function readLatest() {
      try { return preferences?.json?.(KEY, null, { fresh: true }); } catch { return null; }
    }
    function mergeRecords(latest) {
      // Seen cards and best scores only increase. Union/max preserve independent
      // work in another tab without counting the same passed row twice.
      for (const script of SCRIPTS) {
        for (const character of latest[script].seen) records[script].seen.add(character);
        records[script].best = records[script].best.map((score, row) => Math.max(score, latest[script].best[row]));
      }
    }
    function mergeLatest() { mergeRecords(normalize(readLatest())); }
    const hasProgress = snapshot => SCRIPTS.some(script => snapshot[script].seen.size > 0);
    function persist(incoming = null) {
      const raw = readLatest(), latest = normalize(raw);
      // Reconcile collision events only while a real progress record remains.
      // Delayed events must not recreate a deleted or explicitly empty record.
      if (incoming && (raw?.version !== 1 || !hasProgress(latest))) return false;
      if (incoming) mergeRecords(incoming);
      mergeRecords(latest);
      if (incoming && !SCRIPTS.some(script =>
        [...records[script].seen].some(character => !latest[script].seen.has(character)) ||
        records[script].best.some((score, row) => score > latest[script].best[row]))) return true;
      const value = { version: 1, scripts: {} };
      for (const script of SCRIPTS) {
        const record = records[script];
        value.scripts[script] = { seen: [...record.seen], best: record.best.slice() };
      }
      let saved = false;
      try { saved = preferences?.set?.(KEY, JSON.stringify(value)) === true; } catch {}
      onStorage(saved);
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
      // Use the event snapshot as well as current storage: a racing newer write
      // may already have replaced the only persisted copy of this progress.
      if (hasProgress(incoming)) persist(incoming);
    });
    function status(script, row) {
      if (!isScript(script) || !isRow(row)) return null;
      mergeLatest();
      const record = records[script];
      const passedRowIndices = ROWS.map((_, index) => index).filter(index => record.best[index] >= PASS_SCORE);
      const completed = passedRowIndices.reduce((total, index) => total + rowChars(script, index).length, 0);
      const passed = record.best[row] >= PASS_SCORE;
      const characters = rowChars(script, row).map(character => {
        const entry = entries.get(character);
        return { id: character, character, roman: entry.roman, thai: entry.thai,
          seen: record.seen.has(character), passed };
      });
      const seen = characters.filter(character => character.seen).length;
      return { script, row, label: characters.map(item => item.character).join(''),
        total: characters.length, seen, ready: seen === characters.length,
        passed, best: record.best[row], characters,
        completed, totalChars: 46, percent: Math.floor(completed / 46 * 100),
        passedRows: passedRowIndices.length, passedRowIndices };
    }
    function view(script, row, index) {
      if (!isScript(script) || !isRow(row) || !Number.isInteger(index)) return false;
      const chars = rowChars(script, row);
      if (index < 0 || index >= chars.length) return false;
      mergeLatest();
      const record = records[script], character = chars[index];
      if (record.seen.has(character)) return true;
      record.seen.add(character); persist(); return true;
    }
    function copyQuestion(question) {
      return question ? { character: question.character,
        choices: question.choices.map(choice => ({ id: choice.id, roman: choice.roman, thai: choice.thai })) } : null;
    }
    function copyResult(result) {
      return result ? { ...result, wrongCharacters: result.wrongCharacters.slice(),
        passedRowIndices: result.passedRowIndices.slice() } : null;
    }
    function session() {
      if (!active) return null;
      const answer = active.answers[active.index] || null;
      return { script: active.script, row: active.row, index: active.index, total: QUESTION_COUNT,
        answered: !!answer, finished: active.finished,
        question: copyQuestion(active.questions[active.index]),
        answer: answer ? { ...answer } : null, score: active.score,
        result: copyResult(active.result) };
    }
    function makeQuestion(character, script) {
      const correct = entries.get(character);
      if (!correct?.available) return null;
      const unique = new Map();
      for (const char of scriptRows(script).flatMap(text => Array.from(text))) {
        const entry = entries.get(char);
        if (entry?.available && entry.roman !== correct.roman && !unique.has(entry.roman)) unique.set(entry.roman, entry);
      }
      if (unique.size < 3) return null;
      const choices = shuffle([correct, ...shuffle([...unique.values()], random).slice(0, 3)], random)
        .map(entry => ({ id: entry.roman, roman: entry.roman, thai: entry.thai }));
      return { character, choices, correctId: correct.roman };
    }
    function start(script, row) {
      const state = status(script, row);
      if (!state?.ready) return null;
      const chars = rowChars(script, row), perCharacter = Math.floor(QUESTION_COUNT / chars.length);
      const remainder = QUESTION_COUNT % chars.length;
      const bonus = new Set(shuffle(chars, random).slice(0, remainder));
      const characters = [];
      for (const character of chars) {
        const times = perCharacter + (bonus.has(character) ? 1 : 0);
        for (let index = 0; index < times; index++) characters.push(character);
      }
      const questions = shuffle(characters, random).map(character => makeQuestion(character, script));
      if (questions.some(question => !question)) return null;
      active = { script, row, index: 0, questions, answers: [], score: 0, finished: false,
        alreadyPassed: state.passed, result: null };
      return session();
    }
    function finish() {
      const record = records[active.script];
      record.best[active.row] = Math.max(record.best[active.row], active.score);
      const state = status(active.script, active.row);
      const mistaken = new Set(active.questions.filter((_, index) => !active.answers[index].correct).map(question => question.character));
      const passed = active.score >= PASS_SCORE;
      active.finished = true;
      active.result = { script: active.script, row: active.row, score: active.score, total: QUESTION_COUNT,
        passed, rowPassed: state.passed, alreadyPassed: active.alreadyPassed, newPass: passed && !active.alreadyPassed,
        wrongCharacters: rowChars(active.script, active.row).filter(character => mistaken.has(character)),
        best: state.best, completed: state.completed, totalChars: state.totalChars, percent: state.percent,
        passedRows: state.passedRows, passedRowIndices: state.passedRowIndices.slice() };
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
      active.index++;
      return session();
    }
    function cancel() { active = null; }
    return { status, view, start, session, answer, next, cancel };
  }
  root.ThaiNaviKanaReading = { create, ROWS, KEY };
})(typeof window !== 'undefined' ? window : globalThis);
