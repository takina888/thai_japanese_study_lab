(function (root) {
  'use strict';
  const storageKey = 'tn_learning_sets_v1';
  const directions = ['ja', 'th'];
  const unitSize = 10;
  const validId = value => typeof value === 'string' && value.length > 0 && value.length <= 160;
  function idSet(value) {
    return new Set(Array.isArray(value) ? value.filter(validId).slice(0, 20000) : []);
  }
  function normalize(raw) {
    const result = Object.create(null);
    for (const direction of directions) {
      const data = raw?.version === 1 ? raw?.directions?.[direction] : null;
      const seen = idSet(data?.seen);
      const correct = new Set([...idSet(data?.correct)].filter(id => seen.has(id)));
      const passed = new Set([...idSet(data?.passed)].filter(id => correct.has(id)));
      result[direction] = { seen, correct, passed };
    }
    return result;
  }
  function shuffle(input, random) {
    const output = input.slice();
    for (let i = output.length - 1; i > 0; i--) {
      const draw = Number(random());
      const unit = Number.isFinite(draw) ? Math.max(0, Math.min(draw, 0.999999999999)) : 0;
      const j = Math.floor(unit * (i + 1));
      [output[i], output[j]] = [output[j], output[i]];
    }
    return output;
  }
  function rowSignature(row) {
    return JSON.stringify([row.id, row.type, row.ja, row.th]);
  }
  function create(options = {}) {
    const preferences = options.preferences;
    const courses = options.courses || root.ThaiNaviCourses;
    const random = typeof options.random === 'function' ? options.random : Math.random;
    const onStorage = typeof options.onStorage === 'function' ? options.onStorage : () => {};
    let stored = null;
    try { stored = preferences?.json?.(storageKey, null); } catch {}
    const state = normalize(stored);
    const resetCorrect = { ja: new Set(), th: new Set() };
    let rows = [], byId = new Map(), byCourse = new Map(), unitMap = new Map();
    const sessions = new WeakMap();
    function readLatest() {
      try { return preferences?.json?.(storageKey, null, { fresh: true }); } catch { return null; }
    }
    function mergeRecords(latest) {
      for (const direction of directions) {
        const target = state[direction], incoming = latest[direction];
        for (const id of incoming.seen) target.seen.add(id);
        for (const id of incoming.correct) if (!resetCorrect[direction].has(id)) target.correct.add(id);
        for (const id of incoming.passed) {
          target.seen.add(id); target.correct.add(id); target.passed.add(id);
          resetCorrect[direction].delete(id);
        }
      }
    }
    function mergeLatest() { mergeRecords(normalize(readLatest())); }
    const hasProgress = snapshot => directions.some(direction => snapshot[direction].seen.size > 0);
    function persist(incoming = null) {
      const raw = readLatest(), latest = normalize(raw);
      // Do not recreate deleted/empty records from a delayed storage event.
      if (incoming && (raw?.version !== 1 || !hasProgress(latest))) return false;
      if (incoming) mergeRecords(incoming);
      mergeRecords(latest);
      if (incoming && !directions.some(direction => ['seen', 'correct', 'passed'].some(field =>
        [...state[direction][field]].some(id => !latest[direction][field].has(id))))) return true;
      const data = { version: 1, directions: {} };
      for (const direction of directions) {
        const value = state[direction];
        data.directions[direction] = { seen: [...value.seen], correct: [...value.correct], passed: [...value.passed] };
      }
      let saved = false;
      try { saved = preferences?.set?.(storageKey, JSON.stringify(data)) === true; } catch {}
      onStorage(saved);
      return saved;
    }
    root.addEventListener?.('storage', event => {
      if (event.key !== storageKey || typeof event.newValue !== 'string') return;
      let incoming;
      try {
        const raw = JSON.parse(event.newValue);
        if (raw?.version !== 1) return;
        incoming = normalize(raw);
      } catch { return; }
      // An event snapshot can be the only surviving copy after two tab writes
      // collide. Reconcile it with the latest persisted record, without echoing.
      if (hasProgress(incoming)) persist(incoming);
    });
    function setRows(input) {
      rows = []; byId = new Map(); byCourse = new Map(); unitMap = new Map();
      for (const row of Array.isArray(input) ? input : []) {
        if (!row || !validId(row.id) || byId.has(row.id) || typeof row.type !== 'string' ||
            !row.type || typeof row.ja !== 'string' || !row.ja.trim() || typeof row.th !== 'string' || !row.th.trim()) continue;
        rows.push(row); byId.set(row.id, row);
        if (!byCourse.has(row.type)) byCourse.set(row.type, []);
        byCourse.get(row.type).push(row);
      }
      for (const [course, items] of byCourse) {
        for (let offset = 0; offset < items.length; offset += unitSize) {
          const part = items.slice(offset, offset + unitSize);
          const unit = { id: `${course}:${part[0].id}`, course, number: offset / unitSize + 1,
            rows: part, ids: part.map(row => row.id), total: part.length, start: offset + 1, end: offset + part.length };
          unitMap.set(unit.id, unit);
        }
      }
      // Do not prune storage here. Base and service lessons load independently;
      // missing records may merely be waiting for a later successful fetch.
      return rows.length;
    }
    function copyUnit(unit) {
      return unit ? { ...unit, rows: unit.rows.slice(), ids: unit.ids.slice() } : null;
    }
    function units(course) {
      return [...unitMap.values()].filter(unit => unit.course === course).map(copyUnit);
    }
    function resolveUnit(value) {
      return unitMap.get(typeof value === 'string' ? value : value?.id) || null;
    }
    function readStatus(value, direction) {
      const unit = resolveUnit(value), data = state[direction];
      if (!unit || !data) return { total: 0, seen: 0, correct: 0, passed: false, ready: false, seenIds: [], correctIds: [], passedIds: [], stamp: false };
      const seenIds = unit.ids.filter(id => data.seen.has(id));
      const correctIds = unit.ids.filter(id => data.correct.has(id));
      const stampedIds = unit.ids.filter(id => data.passed.has(id));
      const passed = stampedIds.length === unit.total;
      const passedIds = passed ? stampedIds : [];
      return { total: unit.total, seen: seenIds.length, correct: correctIds.length, passed,
        ready: seenIds.length === unit.total, seenIds, correctIds, passedIds, stamp: passed };
    }
    function status(value, direction) {
      mergeLatest();
      return readStatus(value, direction);
    }
    function progress(course, direction) {
      mergeLatest();
      const items = byCourse.get(course) || [], data = state[direction];
      const courseUnits = units(course);
      const seen = data ? items.filter(row => data.seen.has(row.id)).length : 0;
      const correct = data ? items.filter(row => data.correct.has(row.id)).length : 0;
      const completedUnits = courseUnits.filter(unit => readStatus(unit, direction).passed);
      const passed = completedUnits.reduce((count, unit) => count + unit.total, 0);
      return { total: items.length, seen, correct, passed, percent: items.length ? Math.floor(passed / items.length * 100) : 0,
        completedUnits: completedUnits.length, totalUnits: courseUnits.length };
    }
    function markSeen(id, direction) {
      mergeLatest();
      const data = state[direction];
      if (!data || !byId.has(id)) return false;
      if (data.seen.has(id)) return true;
      data.seen.add(id); persist(); return true;
    }
    function validSession(handle) {
      if (!handle || typeof handle !== 'object') return null;
      const session = sessions.get(handle);
      if (!session) return null;
      const unit = resolveUnit(session.unitId);
      if (!unit || unit.ids.join('\u001f') !== session.unitIds.join('\u001f') ||
          unit.rows.some(row => rowSignature(row) !== session.signatures.get(row.id))) return null;
      return session;
    }
    function syncHandle(handle, session) {
      Object.assign(handle, { unitId: session.unitId, course: session.course, direction: session.direction,
        ids: session.ids.slice(), index: session.index, total: session.ids.length, round: session.round,
        answered: session.answers.has(session.ids[session.index]), complete: session.complete,
        score: [...session.answers.values()].filter(Boolean).length });
    }
    function start(value, direction, config = {}) {
      const unit = resolveUnit(value), before = status(unit, direction);
      if (!unit || !state[direction] || !before.ready || typeof courses?.makeQuestionFor !== 'function') return null;
      const retry = config.retry === true;
      const retryMissing = retry && !before.passed && before.correct > 0 && before.correct < unit.total;
      const ids = retryMissing ? unit.ids.filter(id => !state[direction].correct.has(id)) : unit.ids.slice();
      if (!ids.length) return null;
      const questions = new Map();
      const pool = byCourse.get(unit.course) || [];
      for (const id of ids) {
        const question = courses.makeQuestionFor(pool, byId.get(id), direction, random);
        if (!question) return null;
        questions.set(id, question);
      }
      if (!retryMissing && !before.passed) {
        for (const id of unit.ids) if (!state[direction].passed.has(id)) {
          state[direction].correct.delete(id); resetCorrect[direction].add(id);
        }
        persist();
      }
      const session = { unitId: unit.id, unitIds: unit.ids.slice(), course: unit.course, direction,
        ids: shuffle(ids, random), index: 0, round: before.passed ? 'review' : retryMissing ? 'retry' : 'initial',
        answers: new Map(), questions, complete: false, newStamp: false,
        signatures: new Map(unit.rows.map(row => [row.id, rowSignature(row)])) };
      const handle = {};
      sessions.set(handle, session); syncHandle(handle, session);
      return handle;
    }
    function question(handle) {
      const session = validSession(handle);
      if (!session) return null;
      const value = session.questions.get(session.ids[session.index]);
      return value ? { ...value, options: value.options.slice() } : null;
    }
    function finish(handle) {
      const session = validSession(handle);
      if (!session) return null;
      const current = status(session.unitId, session.direction);
      const wrongIds = session.ids.filter(id => session.answers.get(id) === false);
      return { complete: session.complete, passed: current.passed, score: [...session.answers.values()].filter(Boolean).length,
        total: session.ids.length, answered: session.answers.size, wrongIds, wrongRows: wrongIds.map(id => byId.get(id)),
        correctIds: current.correctIds, remaining: current.total - current.correct, newStamp: session.newStamp,
        unit: copyUnit(resolveUnit(session.unitId)), direction: session.direction };
    }
    function answer(handle, optionId) {
      const session = validSession(handle);
      if (!session || session.complete) return { accepted: false };
      const id = session.ids[session.index], current = session.questions.get(id);
      if (session.answers.has(id) || !current.options.some(row => row.id === optionId)) return { accepted: false };
      const yes = optionId === current.correct.id, data = state[session.direction];
      mergeLatest();
      session.answers.set(id, yes);
      if (yes) { data.correct.add(id); resetCorrect[session.direction].delete(id); }
      const unit = resolveUnit(session.unitId), wasPassed = readStatus(unit, session.direction).passed;
      if (unit.ids.every(rowId => data.correct.has(rowId))) {
        for (const rowId of unit.ids) data.passed.add(rowId);
        if (!wasPassed) session.newStamp = true;
      }
      session.complete = session.index === session.ids.length - 1;
      persist(); syncHandle(handle, session);
      return { ...finish(handle), accepted: true, correct: yes, correctId: current.correct.id,
        selectedId: optionId, index: session.index, question: { ...current, options: current.options.slice() } };
    }
    function next(handle) {
      const session = validSession(handle);
      if (!session || session.complete || !session.answers.has(session.ids[session.index])) return null;
      session.index++; syncHandle(handle, session);
      return question(handle);
    }
    if (Array.isArray(options.rows)) setRows(options.rows);
    return { setRows, units, status, progress, markSeen, start, question, answer, next, finish };
  }
  root.ThaiNaviLearningSets = { create, storageKey, unitSize };
})(typeof window !== 'undefined' ? window : globalThis);
