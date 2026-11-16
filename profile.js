(() => {
  'use strict';
  const prefs = window.ThaiNaviPreferences;
  const $ = id => document.getElementById(id);
  const dialog = $('profileDialog');
  const form = $('profileForm');
  let profile = prefs.readProfile();
  let language = prefs.language();
  let returnFocus = null;

  function draftLanguage() {
    return form.elements.learningLanguage.value || language;
  }

  function updatePreview() {
    const isJa = draftLanguage() === 'ja';
    dialog.lang = isJa ? 'ja' : 'th';
    const gender = form.elements.gender.value;
    $('japaneseReadingSetting').hidden = isJa;
    $('profileTitle').textContent = isJa
      ? (profile ? '学びの設定' : 'あなたの学びを、はじめよう。')
      : (profile ? 'ตั้งค่าการเรียน' : 'เริ่มเรียนในแบบของคุณ');
    $('profileIntro').textContent = '';
    $('profileIntro').hidden = true;
    dialog.removeAttribute('aria-describedby');
    const nicknameLabel = form.querySelector('label[for="profileNickname"]');
    if (nicknameLabel) {
      const secondary = document.createElement('span');
      secondary.lang = isJa ? 'th' : 'ja';
      secondary.textContent = isJa ? 'ชื่อเล่น (ไม่บังคับ)' : 'ニックネーム（任意）';
      nicknameLabel.replaceChildren(document.createTextNode(isJa ? 'ニックネーム（任意） ' : 'ชื่อเล่น (ไม่บังคับ) '), secondary);
    }
    $('nicknameHint').textContent = '';
    $('nicknameHint').hidden = true;
    $('profileNickname').removeAttribute('aria-describedby');
    $('speechPreviewLabel').textContent = isJa ? '丁寧な言い方' : 'คำพูดสุภาพ';
    $('profileSave').textContent = isJa ? (profile ? '保存する' : '保存して始める') : (profile ? 'บันทึก' : 'บันทึกและเริ่มเรียน');
    $('profileCancel').textContent = isJa ? 'キャンセル' : 'ยกเลิก';
    $('profilePrivacy').textContent = isJa
      ? '設定と学習記録は、このブラウザに保存されます。'
      : 'บันทึกการตั้งค่าและความคืบหน้าไว้ในเบราว์เซอร์นี้';
    $('workCourseLegend').textContent = isJa ? '仕事で使う表現' : 'เลือกบทเรียนสำหรับงาน';
    $('workCourseLegendSecondary').textContent = isJa ? 'เลือกบทเรียนสำหรับงาน' : '仕事で使う表現';
    $('workCourseLegendSecondary').lang = isJa ? 'th' : 'ja';
    $('workOptionTitle').textContent = isJa ? '一般・現場の仕事 · 200文' : 'งานทั่วไป・หน้างาน · 200 ประโยค';
    $('workOptionDescription').textContent = isJa ? '指示・確認・現場のやり取り' : 'บอกขั้นตอน ตรวจสอบ และคุยหน้างาน';
    $('serviceOptionTitle').textContent = isJa ? '接客・サービス業 · 100文' : 'งานบริการ · 100 ประโยค';
    $('serviceOptionDescription').textContent = isJa ? 'レストラン・コンビニ・カフェなど' : 'ร้านอาหาร ร้านสะดวกซื้อ คาเฟ่ และงานบริการ';
    $('workCourseHint').textContent = '';
    $('workCourseHint').hidden = true;
    if (!isJa) {
      $('speechPreviewText').textContent = 'こんにちは。 / สวัสดี\nありがとうございます。 / ขอบคุณ';
      $('speechPreviewNote').textContent = '「です・ます」 ใช้ได้ทุกเพศ';
    } else {
      $('speechPreviewText').textContent = gender === 'male' ? 'こんにちは：สวัสดีครับ\nお元気ですか：สบายดีไหมครับ'
        : gender === 'female' ? 'こんにちは：สวัสดีค่ะ\nお元気ですか：สบายดีไหมคะ'
        : '男性：ครับ　／　女性：ค่ะ・คะ';
      $('speechPreviewNote').textContent = gender === 'male' ? '男性の語尾：ครับ'
        : gender === 'female' ? '女性の語尾：ค่ะ ／ 質問は คะ'
        : '接客のタイ語は、丁寧な語尾なしで表示します。';
    }
  }

  function updateWelcome() {
    const isJa = language === 'ja';
    $('settingsLabel').textContent = isJa ? '設定' : 'ตั้งค่า';
    $('settingsButton').setAttribute('aria-label', isJa ? '学習プロフィールの設定' : 'ตั้งค่าโปรไฟล์การเรียน');
    $('learnerGreeting').textContent = profile
      ? (profile.nickname ? (isJa ? `${profile.nickname}さん、今日も少しずつ。` : `คุณ${profile.nickname} มาเรียนกันทีละนิด`) : (isJa ? '今日も、ひとことから。' : 'เริ่มจากคำสั้น ๆ ในวันนี้'))
      : '';
    $('learnerSpeechTip').textContent = '';
    $('learnerSpeechTip').hidden = true;
  }

  function open(options = {}) {
    returnFocus = document.activeElement;
    form.reset();
    form.elements.learningLanguage.value = language;
    $('profileNickname').value = profile?.nickname || '';
    if (profile) form.elements.gender.value = profile.gender;
    form.elements.workCourse.value = profile?.workCourse === 'service' ? 'service' : 'work';
    $('showJapaneseThaiReading').checked = prefs.get('tn_jp_thai_hint') !== 'off';
    $('profileClose').hidden = !profile;
    $('profileCancel').hidden = !profile;
    updatePreview();
    if (!dialog.open) dialog.showModal();
    if (profile) $('profileNickname').focus();
    if (options.course) form.querySelector('input[name="workCourse"]:checked').focus();
  }

  function close() {
    if (!profile) return;
    dialog.close();
  }

  $('settingsButton').addEventListener('click', open);
  $('profileClose').addEventListener('click', close);
  $('profileCancel').addEventListener('click', close);
  form.addEventListener('change', updatePreview);
  dialog.addEventListener('cancel', event => { if (!profile) event.preventDefault(); });
  dialog.addEventListener('close', () => {
    const target = returnFocus?.isConnected && returnFocus !== document.body ? returnFocus : $('settingsButton');
    target.focus({ preventScroll: true });
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const result = prefs.saveProfile({ nickname: $('profileNickname').value, gender: form.elements.gender.value, workCourse: form.elements.workCourse.value });
    profile = result.profile;
    language = draftLanguage();
    const languageSaved = prefs.set('tn_language', language);
    const readingSaved = prefs.set('tn_jp_thai_hint', $('showJapaneseThaiReading').checked ? 'on' : 'off');
    updateWelcome();
    window.dispatchEvent(new CustomEvent('tn:profile-saved', { detail: { language, profile, persisted: result.persisted && languageSaved && readingSaved } }));
    dialog.close();
  });

  window.ThaiNaviProfile = {
    updateLanguage(value) { language = value === 'th' ? 'th' : 'ja'; updateWelcome(); },
    getProfile() { return profile ? { ...profile } : null; },
    openCourse() { open({ course: true }); }
  };
  updateWelcome();
  if (!profile) open();
})();
