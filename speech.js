(function (root) {
  'use strict';

  const languageTag = value => String(value || '').replace(/_/g, '-').toLowerCase();

  function textFor(item, locale, readings = root.ThaiNaviJapaneseReadings || {}) {
    if (!item) return '';
    if (languageTag(locale).split('-')[0] !== 'ja') return String(item.th || '').trim();
    const override = readings[item.id];
    return typeof override === 'string' && override.trim()
      ? override.trim()
      : String(item.ja || '').trim();
  }

  function chooseVoice(voices, locale) {
    const target = languageTag(locale);
    const language = target.split('-')[0];
    const candidates = (Array.isArray(voices) ? voices : []).filter(voice =>
      languageTag(voice.lang).split('-')[0] === language);
    const exact = candidates.filter(voice => languageTag(voice.lang) === target);
    if (language === 'ja') {
      return exact.find(voice => voice.default) || exact[0]
        || candidates.find(voice => voice.default) || candidates[0] || null;
    }
    return exact[0] || candidates[0] || null;
  }

  function createPlayer(options = {}) {
    const synth = options.synth === undefined ? root.speechSynthesis : options.synth;
    const Utterance = options.Utterance === undefined ? root.SpeechSynthesisUtterance : options.Utterance;
    const later = options.setTimeout || root.setTimeout.bind(root);
    const clear = options.clearTimeout || root.clearTimeout.bind(root);
    const waitMs = options.waitMs === undefined ? 1500 : options.waitMs;
    let request = 0;
    let cleanPending = null;
    let activeUtterance = null;

    function voices() {
      try { return synth && typeof synth.getVoices === 'function' ? synth.getVoices() : []; }
      catch { return []; }
    }

    function clearPending() {
      if (!cleanPending) return;
      const cleanup = cleanPending;
      cleanPending = null;
      cleanup();
    }

    function stop() {
      request += 1;
      clearPending();
      activeUtterance = null;
      try { if (synth && typeof synth.cancel === 'function') synth.cancel(); }
      catch { /* A stopped or unavailable speech engine must not break navigation. */ }
    }

    function play({ text, locale, slow = false, onStatus = () => {} }) {
      stop();
      const token = request;
      const notify = status => { if (token === request) onStatus({ ...status, locale, slow }); };
      const spokenText = typeof text === 'string' ? text.trim() : '';
      if (!synth || typeof synth.speak !== 'function' || typeof Utterance !== 'function') {
        notify({ type: 'unsupported' }); return;
      }
      if (!spokenText) { notify({ type: 'empty' }); return; }
      let started = false;

      function begin(voice) {
        if (started || token !== request) return;
        started = true;
        clearPending();
        const utterance = new Utterance(spokenText);
        activeUtterance = utterance;
        utterance.lang = locale;
        utterance.voice = voice;
        utterance.rate = slow ? 0.75 : 0.95;
        utterance.pitch = 1;
        const isCurrent = () => token === request && activeUtterance === utterance;
        utterance.onstart = () => {
          if (isCurrent()) notify({ type: 'playing', voice: voice.name });
        };
        utterance.onend = () => {
          if (!isCurrent()) return;
          activeUtterance = null;
          notify({ type: 'ended', voice: voice.name });
        };
        utterance.onerror = event => {
          if (!isCurrent()) return;
          activeUtterance = null;
          if (['canceled', 'interrupted'].includes(event?.error)) {
            // App-initiated stops already invalidate this request. An interruption
            // of the current utterance still needs a terminal UI notification.
            notify({ type: 'ended', voice: voice.name });
            return;
          }
          notify({ type: 'error', error: event?.error || 'unknown' });
        };
        notify({ type: 'starting', voice: voice.name });
        try { synth.speak(utterance); }
        catch {
          if (isCurrent()) {
            activeUtterance = null;
            notify({ type: 'error', error: 'synthesis-failed' });
          }
        }
      }

      const available = chooseVoice(voices(), locale);
      if (available) { begin(available); return; }
      notify({ type: 'loading' });
      const onVoicesChanged = () => {
        if (token !== request || started) return;
        const voice = chooseVoice(voices(), locale);
        if (voice) begin(voice);
      };
      const timer = later(() => {
        if (token !== request || started) return;
        const voice = chooseVoice(voices(), locale);
        if (voice) begin(voice);
        else { clearPending(); notify({ type: 'missing-voice' }); }
      }, waitMs);
      cleanPending = () => {
        clear(timer);
        if (typeof synth.removeEventListener === 'function') synth.removeEventListener('voiceschanged', onVoicesChanged);
      };
      if (typeof synth.addEventListener === 'function') synth.addEventListener('voiceschanged', onVoicesChanged);
      onVoicesChanged();
    }

    voices();
    return { play, stop };
  }

  root.ThaiNaviSpeech = { textFor, chooseVoice, createPlayer };
})(typeof window !== 'undefined' ? window : globalThis);
