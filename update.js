(function (root) {
  'use strict';

  const VERSION = '33';
  const APP = 'thai-japanese-navi';
  const CHECK_INTERVAL = 60000;
  const CHECK_TIMEOUT = 8000;

  function assetURL(path) {
    const base = root.document?.baseURI || root.location?.href || 'https://thai-navi.invalid/';
    try {
      const url = new URL(path, base);
      if (url.origin !== new URL(base).origin) return path;
      url.searchParams.set('v', VERSION);
      return url.pathname + url.search + url.hash;
    } catch { return path; }
  }

  function validVersion(value) {
    return Number.isSafeInteger(value) && value > 0 && value < 1000000;
  }

  function reloadBlocker(doc) {
    // A refresh must never silently abandon a test, a drawing or unsaved settings.
    if (['storageNotice', 'kanaStorage'].some(id => doc.getElementById(id)?.hidden === false)) return 'storage';
    if (doc.querySelector('dialog[open]')) return 'lesson';
    const panel = doc.getElementById('quizPanel'), task = doc.getElementById('quizTask');
    if (panel && task && !panel.hidden && !task.hidden) return 'lesson';
    return '';
  }

  function create({
    version = Number(VERSION), fetch: fetcher = root.fetch?.bind(root),
    now = () => Date.now(), setTimeout: later = root.setTimeout?.bind(root),
    clearTimeout: cancel = root.clearTimeout?.bind(root), AbortController: Abort = root.AbortController,
    online = () => root.navigator?.onLine !== false,
    currentURL = () => root.location.href, navigate = url => root.location.replace(url),
    canReload = () => '', onState = () => {}
  } = {}) {
    let state = { phase: 'idle', version, latest: null, reason: '' };
    let inFlight = null, lastAttempt = -Infinity, serial = 0, disposed = false, activeAbort = null;
    const snapshot = () => ({ ...state });
    function publish(change) {
      if (disposed) return snapshot();
      state = { ...state, ...change };
      onState(snapshot());
      return snapshot();
    }
    function check({ manual = false, force = false } = {}) {
      if (disposed || state.phase === 'reloading') return Promise.resolve(snapshot());
      if (inFlight) return inFlight;
      if (!manual && !force && now() - lastAttempt < CHECK_INTERVAL) return Promise.resolve(snapshot());
      lastAttempt = now();
      if (!online()) return Promise.resolve(publish({ phase: 'offline', reason: '' }));
      if (typeof fetcher !== 'function') return Promise.resolve(publish({ phase: 'error', reason: '' }));
      publish({ phase: 'checking', reason: '' });
      inFlight = Promise.resolve().then(async () => {
        let timer;
        const controller = typeof Abort === 'function' ? new Abort() : null;
        activeAbort = controller;
        try {
          const url = new URL('version.json', currentURL());
          if (!['https:', 'http:'].includes(url.protocol)) throw Error('unsupported URL');
          // Unique URL also protects the small manifest from intermediary caches.
          // no-store bypasses the browser HTTP cache without deleting user data.
          url.searchParams.set('check', `${now().toString(36)}-${++serial}`);
          const read = (async () => {
            const response = await fetcher(url.href, { cache: 'no-store', credentials: 'same-origin', ...(controller ? { signal: controller.signal } : {}) });
            if (!response?.ok) throw Error('version unavailable');
            const manifest = await response.json();
            if (manifest?.app !== APP || !validVersion(manifest.version)) throw Error('invalid version');
            return manifest.version;
          })();
          const timeout = new Promise((_, reject) => {
            timer = later(() => { controller?.abort(); reject(Error('version timeout')); }, CHECK_TIMEOUT);
          });
          const latest = await Promise.race([read, timeout]);
          return publish({ phase: latest > version ? 'available' : 'current', latest, reason: '' });
        } catch {
          return publish({ phase: online() ? 'error' : 'offline', reason: '' });
        } finally {
          if (timer !== undefined) cancel(timer);
          activeAbort = null;
          inFlight = null;
        }
      });
      return inFlight;
    }
    function reload() {
      if (disposed || !['current', 'available', 'blocked'].includes(state.phase) || !validVersion(state.latest)) return false;
      if (!online()) { publish({ phase: 'offline', reason: '' }); return false; }
      const reason = canReload();
      if (reason) { publish({ phase: 'blocked', reason }); return false; }
      try {
        const url = new URL(currentURL());
        if (!['https:', 'http:'].includes(url.protocol)) throw Error('unsupported URL');
        url.searchParams.set('tn-update', String(Math.max(version, state.latest)));
        url.searchParams.set('_tn', `${now().toString(36)}-${++serial}`);
        publish({ phase: 'reloading', reason: '' });
        // Explicit navigation only. replace avoids adding an obsolete page to Back.
        // No localStorage/sessionStorage/cache deletion or forced background reload.
        navigate(url.href);
        return true;
      } catch { publish({ phase: 'error', reason: '' }); return false; }
    }
    function dispose() { disposed = true; activeAbort?.abort(); }
    return { check, reload, snapshot, dispose };
  }

  function mount(doc = root.document) {
    if (!doc?.body || doc.getElementById('appUpdate')) return null;
    const make = (tag, id, className) => {
      const node = doc.createElement(tag);
      if (id) node.id = id;
      if (className) node.className = className;
      return node;
    };
    const section = make('section', 'appUpdate', 'appUpdate');
    const title = make('h2', 'appUpdateTitle'), copy = make('p', 'appUpdateCopy');
    const status = make('p', 'appUpdateStatus', 'appUpdateStatus');
    status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
    const controls = make('div', '', 'appUpdateActions');
    const checkButton = make('button', 'appUpdateCheck'), reloadButton = make('button', 'appUpdateReload');
    checkButton.type = reloadButton.type = 'button';
    controls.append(checkButton, reloadButton); section.append(title, copy, controls, status);
    section.setAttribute('aria-labelledby', 'appUpdateTitle');
    const footer = doc.getElementById('siteFooter');
    if (footer) footer.before(section); else doc.body.append(section);
    const banner = make('div', 'appUpdateBanner', 'appUpdateBanner');
    const bannerText = make('span'), bannerLink = make('a');
    bannerLink.href = '#appUpdate'; banner.append(bannerText, bannerLink); banner.hidden = true;
    const header = doc.querySelector('header');
    if (header) header.after(banner); else section.before(banner);

    let view = { phase: 'idle', version: Number(VERSION), latest: null, reason: '' };
    function render(state = view) {
      view = state;
      const thai = doc.documentElement.lang === 'th', t = (ja, th) => thai ? th : ja;
      title.textContent = t('教材の更新', 'อัปเดตบทเรียน');
      copy.textContent = t(`使用中：V${VERSION} · 更新で学習記録は削除しません。`, `รุ่นที่ใช้: V${VERSION} · การอัปเดตไม่ลบประวัติการเรียน`);
      checkButton.textContent = state.phase === 'checking' ? t('確認中…', 'กำลังตรวจสอบ…') : t('更新を確認', 'ตรวจสอบอัปเดต');
      reloadButton.textContent = t('画面を読み直す', 'โหลดหน้าใหม่');
      const messages = {
        idle: t('古い画面が残るときは、更新を確認してください。', 'หากยังเห็นหน้าเก่า ให้ตรวจสอบอัปเดต'),
        checking: t('最新版を確認しています。', 'กำลังตรวจสอบรุ่นล่าสุด'),
        current: t(`V${VERSION} を使用中です。表示がおかしいときは、画面を読み直せます。`, `กำลังใช้ V${VERSION} หากหน้าจอแสดงไม่ถูกต้อง สามารถโหลดหน้าใหม่ได้`),
        available: t(`新しい教材 V${state.latest} があります。学習の区切りで画面を読み直してください。`, `มีบทเรียนรุ่นใหม่ V${state.latest} เมื่อจบบทเรียนช่วงนี้แล้ว ให้โหลดหน้าใหม่`),
        offline: t('オフラインです。インターネットに接続してから、もう一度確認してください。', 'ขณะนี้ออฟไลน์ โปรดเชื่อมต่ออินเทอร์เน็ตแล้วตรวจสอบอีกครั้ง'),
        error: t('更新を確認できませんでした。学習は続けられます。接続を確認して、もう一度お試しください。', 'ตรวจสอบอัปเดตไม่ได้ ยังเรียนต่อได้ โปรดตรวจสอบการเชื่อมต่อแล้วลองอีกครั้ง'),
        blocked: state.reason === 'storage' ? t('このブラウザでは記録を保存できないため、再読み込みを止めました。保存に関するメッセージを確認してください。', 'หยุดการโหลดใหม่ เพราะเบราว์เซอร์นี้บันทึกประวัติไม่ได้ โปรดตรวจสอบข้อความเกี่ยวกับการบันทึก') : t('テストや文字練習・設定の画面を閉じてから、もう一度押してください。', 'โปรดจบแบบทดสอบหรือปิดหน้าฝึกเขียนและการตั้งค่า แล้วกดอีกครั้ง'),
        reloading: t('記録を残したまま、画面を読み直しています…', 'กำลังโหลดหน้าใหม่โดยเก็บประวัติการเรียนไว้…')
      };
      status.textContent = messages[state.phase] || messages.idle;
      checkButton.disabled = state.phase === 'checking' || state.phase === 'reloading';
      reloadButton.hidden = !validVersion(state.latest);
      reloadButton.disabled = !['current', 'available', 'blocked'].includes(state.phase);
      // Do not shift the page while someone is answering or drawing. The update
      // notice becomes visible after the active activity/settings dialog closes.
      banner.hidden = !(state.latest > state.version) || Boolean(reloadBlocker(doc));
      bannerText.textContent = t(`新しい教材 V${state.latest} があります。学習後に更新できます。`, `มีบทเรียนรุ่นใหม่ V${state.latest} อัปเดตได้หลังเรียนเสร็จ`);
      bannerLink.textContent = t('更新の確認へ', 'ดูการอัปเดต');
    }
    const controller = create({ canReload: () => reloadBlocker(doc), onState: render });
    checkButton.onclick = () => controller.check({ manual: true });
    reloadButton.onclick = () => controller.reload();
    const onResume = () => { if (!doc.hidden) controller.check(); };
    root.addEventListener('focus', onResume);
    root.addEventListener('pageshow', event => { if (!doc.hidden) controller.check({ force: event.persisted === true }); });
    root.addEventListener('online', () => { if (!doc.hidden) controller.check({ force: true }); });
    doc.addEventListener('visibilitychange', onResume);
    if (typeof root.MutationObserver === 'function') {
      new root.MutationObserver(() => render()).observe(doc.documentElement, { attributes: true, attributeFilter: ['lang'] });
      new root.MutationObserver(records => {
        if (records.some(record => ['quizPanel', 'quizTask', 'storageNotice', 'kanaStorage'].includes(record.target.id) || record.target.tagName === 'DIALOG')) render();
      }).observe(doc.body, { subtree: true, attributes: true, attributeFilter: ['open', 'hidden'] });
    }
    render(); controller.check();
    return controller;
  }

  root.ThaiNaviUpdate = { VERSION, CHECK_INTERVAL, CHECK_TIMEOUT, assetURL, reloadBlocker, create, mount };
  if (root.document?.addEventListener) {
    if (root.document.readyState === 'complete') mount();
    else root.document.addEventListener('DOMContentLoaded', () => mount(), { once: true });
  }
})(typeof window !== 'undefined' ? window : globalThis);
