(function (root) {
  'use strict';

  function mount({ model, thaiModel, reading, play, stopSpeech, onSelectRow, onProgress } = {}) {
    const doc = root.document;
    if (!doc || !model || !['status', 'view', 'start', 'session', 'answer', 'next', 'cancel']
      .every(name => typeof model[name] === 'function')) return null;
    const ids = ['Panel', 'Progress', 'ProgressBar', 'Bar', 'Steps', 'Study', 'Letters', 'Glyph',
      'Roman', 'Thai', 'Listen', 'Next', 'StudyNote', 'Quiz', 'Question', 'Counter', 'Options',
      'Feedback', 'AnswerListen', 'QuizNext', 'Result', 'Stamp', 'ResultTitle', 'ResultText',
      'Mistakes', 'ResultPrimary', 'ResultRetry', 'AudioStatus'];
    const ui = Object.fromEntries(ids.map(id => [id, doc.getElementById('kanaReading' + id)]));
    if (ids.some(id => !ui[id])) return null;
    for (const id of ['Overall', 'SoundLabel', 'Example', 'SoundNote', 'Reference', 'ReferenceTitle', 'ReferenceText', 'ReferenceListen'])
      ui[id] = doc.getElementById('kanaReading' + id);
    const models = { japanese: model, thai: thaiModel };
    let activeModel = model;
    let context = { course: 'japanese', script: 'hiragana', row: 0, language: 'ja', active: false };
    let phase = 'study', studyIndex = 0, review = null, result = null, notice = '';
    let epoch = 0, voiceEpoch = 0, ownsAudio = false, progressSignature = '';
    let rendering = false, renderAgain = false;
    const t = (ja, th) => context.language === 'th' ? th : ja;
    const isThai = () => context.course === 'thai';
    const glyphLang = () => isThai() ? 'th' : 'ja';
    const aidLang = () => isThai() ? context.language : 'th';
    const guide = item => isThai() ? t(item.guideJa, item.guideTh) : item.thai;
    const status = () => activeModel.status(context.script, context.row);
    const validSession = () => {
      const session = activeModel.session();
      return session && session.script === context.script && session.row === context.row ? session : null;
    };
    const element = (tag, className, text) => {
      const node = doc.createElement(tag);
      if (className) node.className = className;
      if (text !== undefined) node.textContent = text;
      return node;
    };
    const button = (className, text) => {
      const node = element('button', className, text);
      node.type = 'button';
      return node;
    };
    function show(node, visible) { node.hidden = !visible; node.inert = !visible; }
    function guarded(token, action, expectedPhase = phase) {
      return () => {
        if (!context.active || token !== epoch || phase !== expectedPhase) return;
        action();
      };
    }
    function notifyProgress(state) {
      if (!state) return;
      const signature = [context.course, state.script, state.row, state.seen, state.best, state.completed].join(':');
      if (signature === progressSignature) return;
      progressSignature = signature;
      if (typeof onProgress === 'function') onProgress();
    }
    // The host also calls stop() while refreshing stroke data. It must not cancel a test.
    function stop() {
      voiceEpoch++;
      ownsAudio = false;
      ui.AudioStatus.textContent = '';
      if (typeof stopSpeech === 'function') stopSpeech();
    }
    function playCharacter(character, letterName = false) {
      if (!context.active || !character) return;
      stop();
      if (typeof play !== 'function') {
        ui.AudioStatus.textContent = t('音声を再生できません。', 'ไม่สามารถเล่นเสียงได้');
        return;
      }
      ownsAudio = true;
      const token = ++voiceEpoch;
      const entry = isThai() ? activeModel.getEntry(character) : null;
      const spoken = isThai() ? (letterName ? entry?.nameSpeech : entry?.sampleText) : character;
      const locale = isThai() ? 'th-TH' : 'ja-JP';
      const update = event => {
        if (token !== voiceEpoch || !context.active) return;
        const type = event?.type;
        ui.AudioStatus.textContent = ['loading', 'starting'].includes(type)
          ? t('音声を準備中…', 'กำลังเตรียมเสียง…')
          : type === 'playing' ? t('再生中…', 'กำลังเล่นเสียง…')
            : ['unsupported', 'missing-voice', 'error', 'empty'].includes(type)
              ? (isThai() ? t('タイ語の音声を再生できません。端末の音声設定を確認してください。', 'เล่นเสียงไทยไม่ได้ กรุณาตรวจสอบการตั้งค่าเสียงของอุปกรณ์')
                : t('日本語の音声を再生できません。端末の音声設定を確認してください。', 'เล่นเสียงญี่ปุ่นไม่ได้ กรุณาตรวจสอบการตั้งค่าเสียงของอุปกรณ์')) : '';
        if (['ended', 'unsupported', 'missing-voice', 'error', 'empty'].includes(type)) ownsAudio = false;
      };
      if (!spoken) { update({ type: 'empty' }); return; }
      try { play(spoken, update, locale); } catch { update({ type: 'error' }); }
    }
    function clearQuiz() {
      ui.Question.textContent = '';
      ui.Counter.textContent = '';
      ui.Options.replaceChildren();
      ui.Feedback.textContent = '';
      show(ui.AnswerListen, false);
      ui.AnswerListen.disabled = true;
      ui.AnswerListen.onclick = null;
      ui.QuizNext.disabled = true;
      ui.QuizNext.onclick = null;
    }
    function setPhase(next) {
      stop();
      epoch++;
      phase = next;
      notice = '';
    }
    function focusFirstChoice() {
      if (context.active && phase === 'quiz' && validSession()?.answered === false)
        ui.Options.children[0]?.focus?.({ preventScroll: true });
    }
    function studyAt(index, indices = null) {
      const state = status();
      if (!state?.characters[index]) return;
      setPhase('study');
      studyIndex = index;
      review = indices && indices.length ? indices.slice() : null;
      result = null;
      activeModel.cancel();
      render();
    }
    function startQuiz() {
      const state = status();
      if (!state) return;
      if (!state.ready) {
        studyAt(state.characters.findIndex(item => !item.seen));
        return;
      }
      stop();
      activeModel.cancel();
      const session = activeModel.start(context.script, context.row);
      if (!session) {
        notice = t('読み方の準備ができませんでした。文字を確認してから、もう一度お試しください。', 'ยังเตรียมคำอ่านไม่ได้ กรุณาทบทวนตัวอักษรแล้วลองอีกครั้ง');
        phase = 'study';
        render();
        return;
      }
      setPhase('quiz');
      review = null;
      result = null;
      render();
      focusFirstChoice();
    }
    function renderProgress(state) {
      ui.Panel.setAttribute('aria-label', isThai() ? t('タイ文字の読み学習', 'เรียนการอ่านอักษรไทย') : t('かなの読み学習', 'เรียนการอ่านอักษรญี่ปุ่น'));
      ui.Panel.dataset.script = context.script;
      const totalRows = state.totalRows || 10;
      ui.Progress.textContent = isThai() ? t(
        `${context.script === 'vowel' ? '基本母音' : '子音'} · 合格 ${state.passedRows}/${totalRows}組 · 完了率 ${state.percent}%（${state.completed}/${state.totalChars}${context.script === 'vowel' ? '種類' : '字'}）`,
        `${context.script === 'vowel' ? 'สระพื้นฐาน' : 'พยัญชนะ'} · ผ่าน ${state.passedRows}/${totalRows} ชุด · สำเร็จ ${state.percent}% (${state.completed}/${state.totalChars} ${context.script === 'vowel' ? 'รูป' : 'ตัว'})`)
        : t(`合格 ${state.passedRows}/${totalRows}行 · 完了率 ${state.percent}%（${state.completed}/${state.totalChars}字）`,
          `ผ่าน ${state.passedRows}/${totalRows} แถว · สำเร็จ ${state.percent}% (${state.completed}/${state.totalChars} ตัว)`);
      if (ui.Overall) {
        show(ui.Overall, isThai());
        ui.Overall.textContent = isThai() ? t(`この教材のタイ文字 ${state.overallCompleted}/${state.overallTotal}項目 · ${state.overallPercent}%`,
          `อักษรไทยในบทเรียนนี้ ${state.overallCompleted}/${state.overallTotal} รายการ · ${state.overallPercent}%`) : '';
      }
      ui.ProgressBar.setAttribute('aria-label', t('読みテスト完了率', 'ความคืบหน้าการทดสอบการอ่าน'));
      ui.ProgressBar.setAttribute('aria-valuemin', '0');
      ui.ProgressBar.setAttribute('aria-valuemax', '100');
      ui.ProgressBar.setAttribute('aria-valuenow', String(state.percent));
      ui.Bar.style.width = state.percent + '%';
      ui.Steps.setAttribute('aria-label', t('学習の流れ', 'ขั้นตอนการเรียน'));
      const current = ['study', 'quiz', 'result'].indexOf(phase);
      ui.Steps.replaceChildren(...[t('1 覚える', '1 เรียนรู้'), t('2 10問テスト', '2 ทดสอบ 10 ข้อ'), t('3 結果', '3 ผลทดสอบ')]
        .map((text, index) => {
          const node = element('li', index === current ? 'active' : index < current ? 'done' : '', text);
          if (index === current) node.setAttribute('aria-current', 'step');
          return node;
        }));
    }
    function renderStudy(state, token) {
      studyIndex = Math.max(0, Math.min(studyIndex, state.characters.length - 1));
      const item = state.characters[studyIndex];
      ui.Glyph.textContent = item.character;
      ui.Roman.textContent = item.roman;
      ui.Thai.textContent = guide(item);
      ui.Glyph.lang = glyphLang(); ui.Roman.lang = isThai() ? 'th-Latn' : 'ja-Latn'; ui.Thai.lang = aidLang();
      renderThaiReference(item, token);
      // Only this displayed character is visited. Rendering the pills never visits their letters.
      if (!item.seen && !doc.hidden) {
        activeModel.view(context.script, context.row, studyIndex);
        if (!context.active || token !== epoch) return;
        state = status();
      }
      ui.Letters.setAttribute('aria-label', t('覚える文字', 'ตัวอักษรที่เรียน'));
      ui.Letters.replaceChildren(...state.characters.map((letter, index) => {
        const node = button('kanaReadingLetter', letter.character);
        node.lang = glyphLang();
        node.classList.toggle('current', index === studyIndex);
        node.classList.toggle('seen', letter.seen);
        // A check denotes the row test, not perfect recognition of each individual character.
        node.classList.toggle('passed', state.passed);
        node.setAttribute('aria-pressed', String(index === studyIndex));
        node.setAttribute('aria-label', letter.character + (state.passed ? (isThai() ? t('・この組は合格済み', ' ชุดนี้ผ่านแล้ว') : t('・この行は合格済み', ' แถวนี้ผ่านแล้ว')) : ''));
        node.onclick = guarded(token, () => studyAt(index, review?.includes(index) ? review : null), 'study');
        return node;
      }));
      ui.Listen.textContent = isThai() ? t('🔊 音の例を聞く', '🔊 ฟังตัวอย่างเสียง') : t('🔊 発音を聞く', '🔊 ฟังเสียง');
      ui.Listen.disabled = typeof play !== 'function';
      ui.Listen.onclick = guarded(token, () => playCharacter(item.character), 'study');
      const reviewPosition = review ? review.indexOf(studyIndex) : -1;
      const last = review ? reviewPosition === review.length - 1 : studyIndex === state.total - 1;
      const canStart = last && state.ready;
      ui.Next.textContent = canStart ? t('10問テストへ →', 'เริ่มทดสอบ 10 ข้อ →') : t('次の文字へ →', 'ตัวถัดไป →');
      ui.Next.disabled = false;
      ui.Next.onclick = guarded(token, () => {
        const fresh = status();
        if (!fresh) return;
        if (review && reviewPosition >= 0 && reviewPosition < review.length - 1) {
          studyAt(review[reviewPosition + 1], review); return;
        }
        if (!review && studyIndex < fresh.total - 1) { studyAt(studyIndex + 1); return; }
        const unseen = fresh.characters.findIndex(letter => !letter.seen);
        if (unseen >= 0) studyAt(unseen); else startQuiz();
      }, 'study');
      ui.StudyNote.textContent = notice || (review
        ? t(`間違えた文字を復習 ${reviewPosition + 1}/${review.length} · 次は10問すべて再テスト。`, `ทบทวนตัวที่ตอบผิด ${reviewPosition + 1}/${review.length} แล้วทดสอบใหม่ครบ 10 ข้อ`)
        : t(`${state.seen}/${state.total}${isThai() && context.script === 'vowel' ? '種類' : '字'}を確認 · テストは10問中8問正解で合格。読み方は目安です。音声も聞いてください。`,
          `ดูแล้ว ${state.seen}/${state.total} ${isThai() && context.script === 'vowel' ? 'รูป' : 'ตัว'} · ตอบถูก 8 ใน 10 ข้อจึงผ่าน คำอ่านเป็นเสียงใกล้เคียง ควรฟังเสียงประกอบ`));
      notifyProgress(state);
    }
    function renderThaiReference(item, token) {
      for (const key of ['SoundLabel', 'Example', 'SoundNote', 'Reference']) if (ui[key]) show(ui[key], isThai());
      if (!isThai()) {
        if (ui.Reference) ui.Reference.open = false;
        if (ui.ReferenceText) ui.ReferenceText.replaceChildren();
        if (ui.ReferenceListen) { ui.ReferenceListen.disabled = true; ui.ReferenceListen.onclick = null; }
        return;
      }
      const vowel = context.script === 'vowel';
      if (ui.SoundLabel) ui.SoundLabel.textContent = vowel ? t('母音の音 · 発音表記', 'เสียงสระ · สัญลักษณ์เสียง') : t('音節の初めの子音 · 発音表記', 'เสียงพยัญชนะต้นพื้นฐาน');
      if (ui.Example) ui.Example.textContent = t(`音の例：${item.sampleText} · ${item.sampleJa}（${item.sampleRoman}）`, `ตัวอย่างเสียง: ${item.sampleText} · ${item.sampleRoman}`);
      if (ui.SoundNote) ui.SoundNote.textContent = [vowel
        ? t('短い音と長い音を区別します。อ は母音を置く土台です。', 'แยกเสียงสั้นกับเสียงยาว ใช้ อ รองรับสระ')
        : t('音声は母音を添えた例です。ここでは音節の初め（母音の前）の子音を練習します。末尾の音・声調は単語によって変わります。',
          'เสียงตัวอย่างมีสระประกอบ ชุดนี้ฝึกเสียงพยัญชนะต้น ไม่ใช่เสียงตัวสะกดหรือกฎวรรณยุกต์'),
        t(item.noteJa, item.noteTh)].filter(Boolean).join(' ');
      if (ui.ReferenceTitle) ui.ReferenceTitle.textContent = vowel ? t('母音の名前・説明（参考）', 'ชื่อสระและคำอธิบาย (เพิ่มเติม)') : t('文字名・名前の由来（参考）', 'ชื่ออักษรและคำประกอบชื่อ (เพิ่มเติม)');
      if (ui.Reference) ui.Reference.open = false;
      if (ui.ReferenceText) {
        const lines = [vowel ? t(`母音名：${item.name}`, `ชื่อสระ: ${item.name}`) : t(`文字名：${item.name}`, `ชื่ออักษร: ${item.name}`)];
        if (!vowel) lines.push(context.language === 'ja' ? `${item.nameReading} · ${item.nameRoman}` : item.nameRoman);
        if (item.mnemonic) lines.push(t(`${item.mnemonic}＝${item.meaningJa}（文字を区別するための名前）`, `คำประกอบชื่ออักษร: ${item.mnemonic}`));
        ui.ReferenceText.replaceChildren(...lines.map(line => element('p', '', line)));
      }
      if (ui.ReferenceListen) {
        ui.ReferenceListen.disabled = typeof play !== 'function';
        ui.ReferenceListen.textContent = vowel ? t('🔊 母音の名前を聞く', '🔊 ฟังชื่อสระ') : t('🔊 文字名を聞く', '🔊 ฟังชื่ออักษร');
        ui.ReferenceListen.onclick = guarded(token, () => playCharacter(item.character, true), 'study');
      }
    }
    function renderQuiz(token) {
      const session = validSession();
      if (!session?.question) {
        phase = 'study'; renderAgain = true; return;
      }
      ui.Question.textContent = session.question.character;
      ui.Question.lang = glyphLang();
      ui.Question.removeAttribute('aria-label');
      ui.Counter.textContent = isThai() ? t(`問題 ${session.index + 1}/${session.total} · ${context.script === 'vowel' ? '母音の音' : '音節の初めの子音'}を選んでください`,
        `ข้อ ${session.index + 1}/${session.total} · เลือก${context.script === 'vowel' ? 'เสียงสระ' : 'เสียงพยัญชนะต้นพื้นฐาน'}`)
        : t(`問題 ${session.index + 1}/${session.total} · 読み方を選んでください`, `ข้อ ${session.index + 1}/${session.total} · เลือกคำอ่าน`);
      ui.Options.replaceChildren(...session.question.choices.map(choice => {
        const node = button('kanaReadingOption');
        const roman = element('span', 'kanaReadingOptionRoman', choice.roman);
        const thai = element('span', 'kanaReadingOptionThai', guide(choice));
        roman.lang = isThai() ? 'th-Latn' : 'ja-Latn'; thai.lang = aidLang();
        node.append(roman, thai);
        node.dataset.choiceId = choice.id;
        node.disabled = session.answered;
        if (session.answer) {
          node.classList.toggle('correct', choice.id === session.answer.correctId);
          node.classList.toggle('chosen', choice.id === session.answer.chosenId);
          node.classList.toggle('wrong', choice.id === session.answer.chosenId && !session.answer.correct);
          const cue = choice.id === session.answer.correctId ? t('正解', 'คำตอบที่ถูก')
            : choice.id === session.answer.chosenId ? t('選んだ答え', 'คำตอบที่เลือก') : '';
          if (cue) node.setAttribute('aria-label', `${choice.roman} · ${guide(choice)} · ${cue}`);
        }
        node.onclick = guarded(token, () => {
          const fresh = validSession();
          if (!fresh || fresh.answered || fresh.index !== session.index || fresh.finished) return;
          const answered = activeModel.answer(choice.id);
          if (!answered) return;
          stop();
          render();
          if (answered.finished) notifyProgress(status());
          if (context.active && phase === 'quiz' && validSession()?.answered)
            ui.QuizNext.focus?.({ preventScroll: true });
        }, 'quiz');
        return node;
      }));
      const correct = session.answer && session.question.choices.find(choice => choice.id === session.answer.correctId);
      ui.Feedback.textContent = correct
        ? (session.answer.correct ? t('正解！ ', 'ถูกต้อง! ') : t('正しい読み方：', 'คำอ่านที่ถูก: ')) + `${correct.roman} · ${guide(correct)}` : '';
      show(ui.AnswerListen, session.answered);
      ui.AnswerListen.disabled = !session.answered || typeof play !== 'function';
      ui.AnswerListen.textContent = isThai() ? t('🔊 正しい音の例を聞く', '🔊 ฟังตัวอย่างเสียงที่ถูกต้อง') : t('🔊 正しい発音を聞く', '🔊 ฟังเสียงที่ถูกต้อง');
      ui.AnswerListen.onclick = session.answered ? guarded(token, () => playCharacter(session.question.character), 'quiz') : null;
      ui.QuizNext.disabled = !session.answered;
      ui.QuizNext.textContent = session.finished ? t('結果を見る →', 'ดูผลทดสอบ →') : t('次の問題へ →', 'ข้อถัดไป →');
      ui.QuizNext.onclick = guarded(token, () => {
        const fresh = validSession();
        if (!fresh?.answered || fresh.index !== session.index) return;
        if (fresh.finished) {
          result = fresh.result;
          setPhase('result');
          render();
          ui.ResultTitle.focus?.({ preventScroll: false });
        } else if (activeModel.next()) {
          stop(); render(); focusFirstChoice();
        }
      }, 'quiz');
    }
    function reviewMistakes(selectedIndex) {
      const state = status();
      const indices = (result?.wrongCharacters || []).map(char => state.characters.findIndex(item => item.character === char)).filter(index => index >= 0);
      const chosen = selectedIndex === undefined ? indices[0] : selectedIndex;
      if (indices.length && chosen !== undefined) studyAt(chosen, indices);
      else studyAt(0);
    }
    function renderResult(state, token) {
      result = result || validSession()?.result;
      if (!result) { phase = 'study'; renderAgain = true; return; }
      show(ui.Stamp, result.passed);
      ui.Stamp.textContent = t('✓ 合格', '✓ ผ่าน');
      ui.ResultTitle.textContent = result.passed ? (isThai() ? t('この組に合格！', 'ผ่านชุดนี้แล้ว!') : t('この行に合格！', 'ผ่านแถวนี้แล้ว!')) : t('今回は不合格', 'ครั้งนี้ยังไม่ผ่าน');
      renderResultText(state);
      const mistakes = result.wrongCharacters || [];
      ui.Mistakes.replaceChildren();
      show(ui.Mistakes, mistakes.length > 0);
      if (mistakes.length) {
        ui.Mistakes.append(element('p', '', t('間違えた文字を確認', 'ทบทวนตัวที่ตอบผิด')));
        for (const character of mistakes) {
          const index = state.characters.findIndex(item => item.character === character);
          const item = state.characters[index];
          if (!item) continue;
          const node = button('kanaReadingMistake');
          const glyph = element('span', 'kanaReadingMistakeGlyph', item.character);
          const roman = element('span', 'kanaReadingMistakeRoman', item.roman);
          const thai = element('span', 'kanaReadingMistakeThai', guide(item));
          glyph.lang = glyphLang(); roman.lang = isThai() ? 'th-Latn' : 'ja-Latn'; thai.lang = aidLang();
          node.append(glyph, roman, thai);
          node.onclick = guarded(token, () => reviewMistakes(index), 'result');
          ui.Mistakes.append(node);
        }
      }
      const lastRow = (state.totalRows || 10) - 1;
      const nextRow = context.row < lastRow ? context.row + 1 : 0;
      ui.ResultPrimary.textContent = result.passed
        ? (typeof onSelectRow === 'function' ? (context.row < lastRow
          ? (isThai() ? t('次の組へ →', 'ชุดถัดไป →') : t('次の行へ →', 'แถวถัดไป →'))
          : (isThai() ? t('最初の組へ →', 'กลับไปชุดแรก →') : t('最初の行へ →', 'กลับไปแถวแรก →')))
          : (isThai() ? t('この組を復習', 'ทบทวนชุดนี้') : t('この行を復習', 'ทบทวนแถวนี้')))
        : t('間違えた文字を復習 →', 'ทบทวนตัวที่ตอบผิด →');
      ui.ResultPrimary.onclick = guarded(token, () => {
        if (!result.passed) { reviewMistakes(); return; }
        if (typeof onSelectRow !== 'function') { studyAt(0); return; }
        setPhase('study');
        activeModel.cancel();
        result = null;
        onSelectRow(nextRow);
      }, 'result');
      ui.ResultRetry.textContent = t('もう一度10問テスト', 'ทดสอบใหม่ 10 ข้อ');
      ui.ResultRetry.onclick = guarded(token, startQuiz, 'result');
    }
    function renderResultText(state) {
      if (!result) return;
      ui.ResultText.textContent = t(`${result.score}/${result.total}問正解。8問以上で合格です。`, `ตอบถูก ${result.score}/${result.total} ข้อ ผ่านเมื่อถูกอย่างน้อย 8 ข้อ`)
        + (!result.passed && state.passed ? t(' 以前の合格チェックは残ります。', ' เครื่องหมายที่เคยผ่านยังคงอยู่') : '');
    }
    function render() {
      if (rendering) { renderAgain = true; return; }
      rendering = true;
      try {
        do {
          renderAgain = false;
          const token = ++epoch;
          show(ui.Panel, context.active);
          if (!context.active) {
            show(ui.Study, false); show(ui.Quiz, false); show(ui.Result, false);
            clearQuiz();
            continue;
          }
          const state = status();
          if (!state) { context.active = false; activeModel.cancel(); stop(); renderAgain = true; continue; }
          renderProgress(state);
          show(ui.Study, phase === 'study'); show(ui.Quiz, phase === 'quiz'); show(ui.Result, phase === 'result');
          if (phase === 'study') { clearQuiz(); renderStudy(state, token); }
          else if (phase === 'quiz') renderQuiz(token);
          else { clearQuiz(); renderResult(state, token); }
          notifyProgress(status());
        } while (renderAgain);
      } finally { rendering = false; }
    }
    function setContext(next = {}) {
      const updated = {
        course: next.course === undefined ? context.course : next.course === 'thai' && thaiModel ? 'thai' : 'japanese',
        script: next.script ?? context.script,
        row: next.row ?? context.row,
        language: next.language === 'th' ? 'th' : next.language === 'ja' ? 'ja' : context.language,
        active: next.active === undefined ? context.active : next.active === true
      };
      const changed = updated.course !== context.course || updated.script !== context.script || updated.row !== context.row || updated.active !== context.active;
      const changedLanguage = updated.language !== context.language;
      if (changed) {
        if (context.active || updated.active || ownsAudio) stop();
        epoch++;
        activeModel.cancel();
        activeModel = models[updated.course];
        phase = 'study'; review = null; result = null; notice = '';
        const state = activeModel.status(updated.script, updated.row);
        const unseen = state?.characters.findIndex(item => !item.seen) ?? -1;
        studyIndex = unseen >= 0 ? unseen : 0;
      } else if (changedLanguage && context.active) stop();
      context = updated;
      render();
    }
    function close() { setContext({ active: false }); }
    doc.addEventListener?.('visibilitychange', () => {
      if (!context.active) return;
      if (doc.hidden) stop(); else render();
    });
    function refreshExternalProgress() {
      if (!context.active || doc.hidden) return;
      const state = status();
      if (!state) return;
      // Do not rebuild an active question or interrupt the current audio/focus.
      renderProgress(state);
      if (phase === 'result') renderResultText(state);
      notifyProgress(state);
    }
    root.addEventListener?.('focus', refreshExternalProgress);
    root.addEventListener?.('storage', event => {
      if (event.key === (isThai() ? 'tn_thai_reading_v1' : 'tn_kana_reading_v1')) refreshExternalProgress();
    });
    render();
    return { setContext, stop, close };
  }

  root.ThaiNaviKanaReadingPanel = { mount };
})(typeof window !== 'undefined' ? window : globalThis);
