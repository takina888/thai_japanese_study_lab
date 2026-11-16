(function (root) {
  'use strict';
  const ROWS = ['あいうえお','かきくけこ','さしすせそ','たちつてと','なにぬねの','はひふへほ','まみむめも','やゆよ','らりるれろ','わをん'];
  const REPEATS = [1,3,5,10];
  const KEY = 'tn_kana_practice_v1';
  const katakana = text => Array.from(text, c => String.fromCharCode(c.charCodeAt(0) + 0x60)).join('');
  const rowChars = (script, row) => Array.from(script === 'katakana' ? katakana(ROWS[row]) : ROWS[row]);
  const allChars = [...ROWS.join(''), ...katakana(ROWS.join(''))];
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const integer = (value, fallback, max) => Number.isInteger(value) && value >= 0 && value <= max ? value : fallback;
  const point = p => Array.isArray(p) && p.length === 2 && p.every(n => typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= 1);
  function cleanInk(value) {
    if (!Array.isArray(value)) return [];
    return value.slice(0,100).filter(Array.isArray).map(stroke => stroke.filter(point).slice(0,1200).map(p => p.slice())).filter(stroke => stroke.length);
  }
  function normalize(value = {}) {
    if (!value || typeof value !== 'object' || value.version !== 1) value = {};
    const script = value.script === 'katakana' ? 'katakana' : 'hiragana';
    const row = integer(value.row,0,9);
    const repeat = REPEATS.includes(value.repeat) ? value.repeat : 3;
    const counts = {};
    for (const char of allChars) if (Number.isInteger(value.counts?.[char]) && value.counts[char] > 0) counts[char] = Math.min(value.counts[char],99999);
    return {version:1,script,row,index:integer(value.index,0,rowChars(script,row).length-1),round:Math.max(1,integer(value.round,1,repeat)),repeat,guide:value.guide !== false,counts,pending:Array.isArray(value.pending)?[...new Set(value.pending.filter(c=>allChars.includes(c)))]:[],ink:cleanInk(value.ink)};
  }
  function current(state) { return rowChars(state.script,state.row)[state.index]; }
  function hasInk(ink) {
    let distance = 0;
    for (const stroke of ink) for (let i=1;i<stroke.length;i++) distance += Math.hypot(stroke[i][0]-stroke[i-1][0],stroke[i][1]-stroke[i-1][1]);
    return distance >= .025;
  }
  function advance(value, completed) {
    const state=normalize(value),char=current(state);
    if (completed && !hasInk(state.ink)) return {state,advanced:false,rowChanged:false,wrapped:false};
    if (completed) { state.counts[char]=Math.min((state.counts[char]||0)+1,99999); state.pending=state.pending.filter(c=>c!==char); }
    else if (!state.pending.includes(char)) state.pending.push(char);
    state.ink=[];state.index++;
    let rowChanged=false,wrapped=false;
    if (state.index>=rowChars(state.script,state.row).length) {
      state.index=0;state.round++;
      if (state.round>state.repeat) {state.round=1;state.row++;rowChanged=true;if(state.row>=ROWS.length){state.row=0;wrapped=true;}}
    }
    return {state,advanced:true,rowChanged,wrapped};
  }
  function select(value, changes) {
    const state=normalize(value);
    if ('script' in changes && changes.script !== state.script) {state.script=changes.script==='katakana'?'katakana':'hiragana';state.row=0;state.index=0;state.round=1;state.ink=[];}
    if ('row' in changes && changes.row !== state.row) {state.row=integer(changes.row,0,9);state.index=0;state.round=1;state.ink=[];}
    if ('index' in changes && changes.index !== state.index) {state.index=integer(changes.index,0,rowChars(state.script,state.row).length-1);state.ink=[];}
    if ('repeat' in changes && REPEATS.includes(changes.repeat)) {state.repeat=changes.repeat;state.round=Math.min(state.round,state.repeat);}
    return state;
  }
  function mount({preferences,reading,play,stopSpeech,onStorage,thaiCourse,wordsCourse,thaiWordsCourse}={}) {
    const doc=root.document;
    if (!doc) return null;
    const dialog=doc.getElementById('kanaDialog');
    const japaneseCourse={
      KEY,locale:'ja-JP',normalize,current,advance,select,rowChars,
      getEntry(id){const result=reading.transcribe(id);return {id,glyph:id,reading:`${result.text} · ${result.roman}`,speechText:id};},
      rowLabels(state){return ROWS.map(row=>state.script==='katakana'?katakana(row):row);},
      scripts:[{value:'hiragana',ja:'あ ひらがな',th:'あ ฮิรางานะ'},{value:'katakana',ja:'ア カタカナ',th:'ア คาตากานะ'}],
      total(){return 46;},
      loadURLs:{hiragana:'kana/stroke-order-hiragana.json',katakana:'kana/stroke-order-katakana.json'},
      validate(data){return ['hiragana','katakana'].every(script=>data[script]?.script===script&&data[script]?.count===46&&rowChars(script,0).every(c=>data[script].strokes?.['u'+c.codePointAt(0).toString(16)]));},
      getAsset(data,entry,state){return data?.[state.script]?.strokes?.['u'+entry.glyph.codePointAt(0).toString(16)]||'';},
      licenseURL:'kana/stroke-order-license.txt',rowLabel:['行','เลือกแถว']
    };
    const courses={japanese:japaneseCourse};
    if(thaiCourse)courses.thai=thaiCourse;
    if(wordsCourse)courses.words=wordsCourse;
    if(thaiWordsCourse)courses.thaiWords=thaiWordsCourse;
    const modeKey='tn_japanese_practice_mode_v1',thaiModeKey='tn_thai_practice_mode_v1';
    let japaneseMode=wordsCourse&&preferences.get(modeKey)!=='kana'?'words':'japanese';
    let thaiMode=thaiWordsCourse&&preferences.get(thaiModeKey)!=='letters'?'thaiWords':'thai';
    let courseName=japaneseMode,course=courses[courseName],state=course.normalize(preferences.json(course.KEY,null)),language='th';
    const cached=new Map();
    function resources(name=courseName){if(!cached.has(name))cached.set(name,{data:null,loading:null,error:false});return cached.get(name);}
    function entryFor(id=course.current(state)){const entry=course.getEntry(id,state)||{};return {...entry,id,glyph:String(entry.glyph??id),reading:String(entry.reading??''),speechText:String(entry.speechText??'')};}
    function wholeWord(){return course.wholeWord===true&&typeof course.getWord==='function';}
    function wordInfo(){return wholeWord()?course.getWord(state):null;}
    function wordDone(){return wholeWord()&&course.isWordDone(state);}
    function family(){return courseName==='thai'||courseName==='thaiWords'?'thai':'japanese';}
    function familyWords(){return family()==='thai'?'thaiWords':'words';}
    function scriptChoices(){return courses[family()]?.scripts||[];}
    function columns(){return wholeWord()?Math.max(1,course.rowChars(state.script,state.row).length):1;}
    let activePointer=null,activeStroke=null,activeGeometry=null,frame=0,animationToken=0,voiceToken=0,opener=null,noticeTimer=0;
    const $=id=>doc.getElementById(id);
    const t=(ja,th)=>language==='ja'?ja:th;
    const ui={
      kanaTitle:['文字を書く','ฝึกเขียนอักษร'],kanaClose:['← 教材へ戻る','← กลับไปบทเรียน'],
      kanaRepeatLabel:['くり返す','ฝึกซ้ำ'],
      kanaListen:['🔊 聞く','🔊 ฟังเสียง'],kanaOrder:['▶ 書き順','▶ ดูวิธีเขียน'],
      kanaUndo:['1画戻す','ลบเส้นล่าสุด'],kanaClear:['消す','ล้างกระดาน'],
      kanaSkip:['とばす','ข้าม'],kanaDone:['書けた · 次へ →','เขียนแล้ว · ถัดไป →'],
      kanaRetry:['再読み込み','ลองอีกครั้ง'],kanaHelpTitle:['練習について','เกี่ยวกับการฝึก'],
      kanaHelp:['書いた回数を記録します。字の正しさを自動で採点する機能ではありません。タイ文字で示した日本語の読み方は目安です。日本語の音声も聞いて練習してください。','บันทึกจำนวนครั้งที่ฝึก ไม่ได้ตรวจความถูกต้องของลายมืออัตโนมัติ คำอ่านไทยเป็นเสียงใกล้เคียง ควรฟังเสียงญี่ปุ่นประกอบ'],
      kanaLicense:['書き順の出典・ライセンス','ที่มาและสัญญาอนุญาตของลำดับขีด']
    };
    function reportStorage(persisted){if(onStorage)onStorage(persisted);$('kanaStorage').hidden=persisted;$('kanaStorage').textContent=t('このブラウザでは保存できません。今開いている間だけ記録します。','เบราว์เซอร์นี้บันทึกไม่ได้ ความคืบหน้าจะอยู่เฉพาะระหว่างที่เปิดหน้านี้');}
    function save() {if(!isReading())reportStorage(preferences.set(course.KEY,JSON.stringify(state)));}
    const readingModel=root.ThaiNaviKanaReading?.create&&root.ThaiNaviKanaReadingPanel?.mount&&$('kanaReadingPanel')?root.ThaiNaviKanaReading.create({preferences,reading,onStorage:reportStorage}):null;
    const thaiReadingModel=readingModel&&thaiCourse&&root.ThaiNaviThaiReading?.create?root.ThaiNaviThaiReading.create({preferences,onStorage:reportStorage}):null;
    let studyMode='reading';
    const studyModes={japanese:'reading',thai:'reading'};
    const readingPanel=readingModel?root.ThaiNaviKanaReadingPanel.mount({model:readingModel,thaiModel:thaiReadingModel,reading,play,stopSpeech,onProgress:decorateReadingRows,onSelectRow(row){resetForSelection({row});dialog.scrollTop=0;}}):null;
    function currentReadingModel(){return courseName==='japanese'?readingModel:courseName==='thai'?thaiReadingModel:null;}
    function isReading(){return !!readingPanel&&!!currentReadingModel()&&studyMode==='reading';}
    function readingCursorKey(){return courseName==='thai'?'tn_thai_reading_cursor_v1':'tn_kana_reading_cursor_v1';}
    function rememberReadingSelection(){
      if(!isReading())return;
      reportStorage(preferences.set(readingCursorKey(),JSON.stringify({version:1,script:state.script,row:state.row})));
    }
    function restoreReadingSelection(){
      if(!isReading())return;
      const cursor=preferences.json(readingCursorKey(),null);
      if(cursor?.version!==1||!course.scripts.some(script=>script.value===cursor.script)||!Number.isInteger(cursor.row)||cursor.row<0||cursor.row>=course.rowLabels({...state,script:cursor.script}).length)return;
      // Reading resumes independently; the stored handwriting draft stays untouched.
      state=course.select(state,{script:cursor.script,row:cursor.row,index:0});
    }
    function decorateReadingRows(){
      const model=currentReadingModel();if(!model)return;
      const options=Array.from($('kanaRow').options||$('kanaRow').children||[]),labels=course.rowLabels(state);
      options.forEach((option,index)=>{if(labels[index])option.textContent=(model.status(state.script,index)?.passed?'✓ ':'')+labels[index];});
    }
    function renderLearningMode(){
      const available=!!readingPanel&&!!currentReadingModel(),active=isReading();
      if($('kanaStudyModes')){$('kanaStudyModes').hidden=!available;$('kanaStudyModes').setAttribute('aria-label',t('学び方','วิธีเรียน'));}
      if($('kanaLearnMode')){$('kanaLearnMode').textContent=t('覚える・テスト','เรียนและทดสอบ');$('kanaLearnMode').setAttribute('aria-pressed',String(active));}
      if($('kanaWriteMode')){$('kanaWriteMode').textContent=t('書く練習','ฝึกเขียน');$('kanaWriteMode').setAttribute('aria-pressed',String(available&&!active));}
      if($('kanaWritingPanel')){$('kanaWritingPanel').hidden=active;$('kanaWritingPanel').inert=active;}
      if($('kanaRepeatControl'))$('kanaRepeatControl').hidden=wholeWord()||active;
      dialog.dataset.kanaMode=active?'reading':'writing';
      if(available)$('kanaTitle').textContent=courseName==='thai'?(active?t('タイ文字を学ぶ','เรียนอักษรไทย'):t('タイ文字を書く','ฝึกเขียนอักษรไทย')):(active?t('かなを学ぶ','เรียนอักษรญี่ปุ่น'):t('かなを書く','ฝึกเขียนอักษรญี่ปุ่น'));
      readingPanel?.setContext({course:family(),script:state.script,row:state.row,language,active:active&&dialog.open});
      decorateReadingRows();
    }
    function setStudyMode(value){
      if(!readingPanel||!currentReadingModel())return;
      const nextMode=value==='writing'?'writing':'reading';
      if(nextMode===studyMode)return;
      finishPointer();stopAudio();stopOrder();
      rememberReadingSelection();
      let selectedFreshRow=false;
      if(nextMode==='writing'){
        const selection={script:state.script,row:state.row,index:0},draft=course.normalize(preferences.json(course.KEY,null));
        selectedFreshRow=!draft.ink.length;state=selectedFreshRow?course.select(draft,selection):draft;
      }
      studyMode=nextMode;studyModes[courseName]=nextMode;if(nextMode==='reading')restoreReadingSelection();if(selectedFreshRow)save();render();dialog.scrollTop=0;
    }
    function rememberMode(name){
      if(wordsCourse&&['japanese','words'].includes(name)){japaneseMode=name;reportStorage(preferences.set(modeKey,name==='words'?'words':'kana'));}
      if(thaiWordsCourse&&['thai','thaiWords'].includes(name)){thaiMode=name;reportStorage(preferences.set(thaiModeKey,name==='thaiWords'?'words':'letters'));}
    }
    function toast(text) { root.clearTimeout(noticeTimer);$('kanaNotice').textContent=text;noticeTimer=root.setTimeout(()=>{$('kanaNotice').textContent='';},4000); }
    function stopAudio() {voiceToken++;if(stopSpeech)stopSpeech();readingPanel?.stop();$('kanaAudioStatus').textContent='';}
    function stopOrder(restore=true) {
      animationToken++;root.cancelAnimationFrame(frame);frame=0;
      $('kanaBoard').classList.remove('isPlaying');$('kanaOrder').setAttribute('aria-pressed','false');
      if(restore){const group=$('kanaModel').querySelector('[data-strokesvg="strokes"]');if(group)group.style.opacity='0';$('kanaStrokeStatus').textContent='';}
    }
    function finishPointer(event) {
      if(activePointer===null || event && event.pointerId!==activePointer)return;
      const id=activePointer;activePointer=null;activeStroke=null;activeGeometry=null;
      try{if($('kanaCanvas').hasPointerCapture(id))$('kanaCanvas').releasePointerCapture(id);}catch{}
      save();updateButtons();
    }
    function showWordHeader(){
      if(!wholeWord()||!dialog.open)return;
      const header=$('kanaWordHeader');if(!header||header.hidden)return;
      if(typeof header.getBoundingClientRect==='function'&&typeof dialog.getBoundingClientRect==='function'){
        if(header.getBoundingClientRect().top<dialog.getBoundingClientRect().top)dialog.scrollTop=0;
      }else if(dialog.scrollTop>0)dialog.scrollTop=0;
    }
    function resetForSelection(changes) {
      const oldRow=state.row;
      finishPointer();stopAudio();stopOrder();state=course.select(state,changes);save();rememberReadingSelection();render();
      if(state.row!==oldRow)showWordHeader();
    }
    function updateButtons() {
      const resource=resources(),ready=!!resource.data&&!resource.error&&!isReading(),ink=wholeWord()?course.canComplete(state):hasInk(state.ink),done=wordDone();
      $('kanaDone').disabled=!ready||(!done&&!ink)||activePointer!==null;
      $('kanaUndo').disabled=done||!state.ink.length;$('kanaClear').disabled=!done&&!state.ink.length;
      $('kanaGuide').disabled=!ready;$('kanaSkip').disabled=!ready||done;
      $('kanaListen').disabled=!ready||!entryFor().speechText;
      const ordered=ready&&course.hasStrokeOrder!==false&&strokeGroups().length>0;
      $('kanaOrder').disabled=!ordered;$('kanaOrder').hidden=course.hasStrokeOrder===false||ready&&!ordered;
      renderRound();
    }
    function renderRound(){
      const chars=course.rowChars(state.script,state.row);
      if(wholeWord()){const written=wordDone()?chars.length:course.coveredIndices(state).length,unit=course.progressUnit||['枠','ช่อง'];$('kanaRound').textContent=t(`書いた${unit[0]} ${written} / ${chars.length}`,`เขียนแล้ว ${written} / ${chars.length} ${unit[1]}`);}
      else{const vowel=courseName==='thai'&&state.script==='vowel';$('kanaRound').textContent=t(`${state.round} / ${state.repeat}周 · ${state.index+1} / ${chars.length}${vowel?'種類':'文字'}`,`รอบ ${state.round} / ${state.repeat} · ${vowel?'รูป':'ตัว'}ที่ ${state.index+1} / ${chars.length}`);}
    }
    function paint() {
      const canvas=$('kanaCanvas'),bounds=canvas.getBoundingClientRect();
      if(!bounds.width)return;
      const ratio=Math.min(root.devicePixelRatio||1,3),width=Math.round(bounds.width*ratio),height=Math.round(bounds.height*ratio);
      if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
      const ctx=canvas.getContext('2d');if(!ctx)return;
      ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,width,height);
      ctx.strokeStyle='#285f52';ctx.fillStyle='#285f52';ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=width/columns()*.022;
      for(const stroke of state.ink){if(!stroke.length)continue;ctx.beginPath();ctx.moveTo(stroke[0][0]*width,stroke[0][1]*height);for(const p of stroke.slice(1))ctx.lineTo(p[0]*width,p[1]*height);if(stroke.length===1){ctx.arc(stroke[0][0]*width,stroke[0][1]*height,ctx.lineWidth/2,0,Math.PI*2);ctx.fill();}else ctx.stroke();}
    }
    function strokeGroups() {return [...$('kanaModel').querySelectorAll('[data-strokesvg="strokes"] [style]')].filter(el=>/--i:\s*\d+/u.test(el.getAttribute('style')||''));}
    function renderModel() {
      $('kanaBoard').style.setProperty('--kana-columns',String(columns()));
      const data=resources().data,requestedAspect=typeof course.boardAspect==='function'?course.boardAspect(state,data):null;
      $('kanaBoard').style.setProperty('--kana-aspect',String(typeof requestedAspect==='number'&&Number.isFinite(requestedAspect)&&requestedAspect>0?requestedAspect:columns()));
      const asset=course.getAsset(data,entryFor(),state);
      $('kanaModel').innerHTML=asset||'';
      const svg=$('kanaModel').querySelector('svg');if(svg){svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');const group=svg.querySelector('[data-strokesvg="strokes"]');if(group)group.style.opacity='0';}
      $('kanaBoard').classList.toggle('withoutGuide',!state.guide);
    }
    function renderWordHeader() {
      const word=wordInfo(),glyphLanguage=course.locale.split('-')[0],aidLanguage=course.readingLang||(glyphLanguage==='ja'?'th':'ja');
      if($('kanaWordHeader'))$('kanaWordHeader').hidden=!word;
      for(const [id,key]of [['kanaWordEmoji','emoji'],['kanaWordText','text'],['kanaWordRoman','roman'],['kanaWordReading','reading'],['kanaWordMeaning','meaning']])if($(id))$(id).textContent=String(word?.[key]??'');
      if($('kanaWordText'))$('kanaWordText').lang=glyphLanguage;
      if($('kanaWordRoman')){$('kanaWordRoman').lang=`${glyphLanguage}-Latn`;$('kanaWordRoman').hidden=!word?.roman;}
      for(const id of ['kanaWordReading','kanaWordMeaning'])if($(id))$(id).lang=aidLanguage;
      for(const [id,ja,th]of [['kanaWordReadingLabel','読み方：','คำอ่าน：'],['kanaWordMeaningLabel','意味：','ความหมาย：']])if($(id)){$(id).textContent=t(ja,th);$(id).lang=language;}
      if($('kanaWordComplete')){$('kanaWordComplete').hidden=!wordDone();$('kanaWordComplete').textContent=wordDone()?t('ことばを書き終えました。','เขียนคำนี้ครบแล้ว'):'';}
    }
    function renderLabels() {
      for(const [id,labels] of Object.entries(ui))$(id).textContent=t(...labels);
      if(course.listenLabel)$('kanaListen').textContent=t(...course.listenLabel);
      if(wordDone()){$('kanaDone').textContent=t('次のことばへ →','คำถัดไป →');$('kanaClear').textContent=t('もう一度書く','เขียนอีกครั้ง');}
      else if(wholeWord())$('kanaDone').textContent=t('書けた','เขียนแล้ว');
      if(wholeWord())$('kanaSkip').textContent=t('とばす','ข้ามคำนี้');
      $('kanaScripts').setAttribute('aria-label',t('文字の種類','ประเภทอักษร'));
      $('kanaCharacters').setAttribute('aria-label',t('練習する文字','ตัวอักษรที่ฝึก'));
      const entry=entryFor();
      dialog.lang=language;dialog.dataset.course=courseName;dialog.dataset.wordMode=String(wholeWord());$('kanaCanvas').setAttribute('aria-label',t(`${entry.glyph}を書く場所`, `พื้นที่เขียน ${entry.glyph}`));
      $('kanaReading').setAttribute('aria-label',t('読み方の目安',course.locale==='ja-JP'?'คำอ่านไทยโดยประมาณ':'คำอ่านคาตาคานะโดยประมาณ'));
      $('kanaRowLabel').textContent=t(...(course.rowLabel||['行','เลือกแถว']));
      const optionFor=(value,label)=>{const option=doc.createElement('option');option.value=String(value);option.textContent=String(label);return option;};
      const groups=typeof course.rowGroups==='function'?course.rowGroups(state):null;
      $('kanaRow').replaceChildren(...(Array.isArray(groups)&&groups.length?groups.map(group=>{const element=doc.createElement('optgroup');element.label=String(group.label);element.replaceChildren(...group.options.map(option=>optionFor(option.value,option.label)));return element;}):course.rowLabels(state).map((label,i)=>optionFor(i,label))));$('kanaRow').value=state.row;
      $('kanaRepeat').innerHTML=REPEATS.map(n=>`<option value="${n}">${n}${t('周',' รอบ')}</option>`).join('');$('kanaRepeat').value=state.repeat;
      $('kanaRepeat').disabled=wholeWord();if($('kanaRepeatControl'))$('kanaRepeatControl').hidden=wholeWord();
      const choices=scriptChoices();
      ['kanaHiragana','kanaKatakana'].forEach((id,index)=>{const choice=choices[index];$(id).hidden=!choice;if(choice){$(id).textContent=t(choice.ja,choice.th);$(id).setAttribute('aria-pressed',String(!wholeWord()&&state.script===choice.value));}});
      if($('kanaWords')){$('kanaWords').hidden=!courses[familyWords()];$('kanaWords').textContent=t('ことば','คำศัพท์');$('kanaWords').setAttribute('aria-pressed',String(wholeWord()));}
      $('kanaGuide').textContent=state.guide?t('見本を隠す','ซ่อนตัวอย่าง'):t('見本を表示','แสดงตัวอย่าง');$('kanaGuide').setAttribute('aria-pressed',String(state.guide));
      $('kanaGuide').setAttribute('aria-controls','kanaModel');
      $('kanaSkip').setAttribute('aria-label',wholeWord()?t('このことばをとばす（練習回数に数えません）','ข้ามคำนี้ (ไม่นับจำนวนครั้ง)'):t('とばす（練習回数に数えません）','ข้าม (ไม่นับจำนวนครั้ง)'));
      if(course.help)$('kanaHelp').textContent=t(...course.help);
      $('kanaLicense').hidden=!course.licenseURL;if(course.licenseURL)$('kanaLicense').href=course.licenseURL;
      if(course.licenseLabel)$('kanaLicense').textContent=t(...course.licenseLabel);
      renderWordHeader();renderLearningMode();
    }
    function renderPronunciation(entry,glyphLanguage){
      const sound=entry.sound,reference=entry.reference,vowel=sound?.type==='vowel';
      if(entry.listenLabel)$('kanaListen').textContent=t(...entry.listenLabel);
      $('kanaReading').textContent=sound?`${sound.roman} · ${t(sound.guideJa,sound.guideTh)}`:entry.reading;
      $('kanaReading').hidden=!$('kanaReading').textContent;
      $('kanaReading').lang=sound?language:course.readingLang||(glyphLanguage==='ja'?'th':'ja');
      const label=$('kanaSoundLabel');
      if(label){label.hidden=wholeWord()||!entry.reading;label.textContent=sound?(vowel?t('母音の音 · 発音表記','เสียงสระ · สัญลักษณ์เสียง'):t('音節の初めの子音 · 発音表記','เสียงพยัญชนะต้นพื้นฐาน')):t('読み方の目安 · ローマ字','คำอ่านไทยโดยประมาณ · โรมาจิ');label.lang=language;}
      const note=$('kanaEntryNote');
      if(note){note.textContent=sound?[t(`音の例：${sound.sampleText} · ${sound.sampleJa}（${sound.sampleRoman}）`,`ตัวอย่างเสียง: ${sound.sampleText} · ${sound.sampleRoman}`),t(sound.noteJa,sound.noteTh)].filter(Boolean).join(' '):String(entry.note??'');note.hidden=!note.textContent;note.lang=sound?language:entry.noteLang||language;}
      const details=$('kanaNameReference'),referenceText=$('kanaNameReferenceText'),listen=$('kanaNameReferenceListen');
      if(details){details.hidden=!reference;details.inert=!reference;details.open=false;}
      if(referenceText)referenceText.replaceChildren();
      if(listen){listen.onclick=null;listen.disabled=!reference||typeof play!=='function';}
      if(!reference)return;
      const nameIsVowel=reference.type==='vowel';
      if($('kanaNameReferenceTitle'))$('kanaNameReferenceTitle').textContent=nameIsVowel?t('母音の名前・説明（参考）','ชื่อสระและคำอธิบาย (เพิ่มเติม)'):t('文字名・名前の由来（参考）','ชื่ออักษรและคำประกอบชื่อ (เพิ่มเติม)');
      const lines=[nameIsVowel?t(`母音名：${reference.name}`,`ชื่อสระ: ${reference.name}`):t(`文字名：${reference.name}`,`ชื่ออักษร: ${reference.name}`)];
      if(!nameIsVowel)lines.push(t(`${reference.reading} · ${reference.roman}`,reference.roman));
      if(reference.mnemonic)lines.push(t(`${reference.mnemonic}＝${reference.meaningJa}（文字を区別するための名前）`,`คำประกอบชื่ออักษร: ${reference.mnemonic}`));
      if(referenceText)referenceText.replaceChildren(...lines.map(text=>{const p=doc.createElement('p');p.textContent=text;return p;}));
      if(listen){const presentedCourse=courseName,presentedId=entry.id;listen.textContent=nameIsVowel?t('🔊 母音の名前を聞く','🔊 ฟังชื่อสระ'):t('🔊 文字名を聞く','🔊 ฟังชื่ออักษร');listen.onclick=()=>{if(dialog.open&&!isReading()&&courseName===presentedCourse&&course.current(state)===presentedId)playText(reference.speechText);};}
    }
    function render() {
      renderLabels();
      const entry=entryFor(),chars=course.rowChars(state.script,state.row),glyphLanguage=course.locale.split('-')[0];
      $('kanaCharacter').textContent=entry.glyph;$('kanaCharacter').lang=glyphLanguage;renderPronunciation(entry,glyphLanguage);
      renderRound();
      if(wholeWord()){const progress=course.progress(state);$('kanaWritten').textContent=t(`書いたことば ${progress.written} / ${progress.total}`,`เขียนแล้ว ${progress.written} / ${progress.total} คำ`);}
      else{const total=course.rowLabels(state).flatMap((_,i)=>course.rowChars(state.script,i)).filter(c=>state.counts[c]>0).length,vowel=courseName==='thai'&&state.script==='vowel';$('kanaWritten').textContent=t(`${vowel?'書いた母音':'書いた文字'} ${total} / ${course.total(state)}${vowel?'種類':''}`,`เขียนแล้ว ${total} / ${course.total(state)} ${vowel?'รูป':'ตัว'}`);}
      $('kanaCharacters').hidden=wholeWord();
      $('kanaCharacters').replaceChildren(...(wholeWord()?[]:chars.map((id,i)=>{const item=entryFor(id),b=doc.createElement('button');b.type='button';b.textContent=item.glyph;b.lang=glyphLanguage;b.className='kanaChar';b.setAttribute('aria-pressed',String(i===state.index));b.setAttribute('aria-label',item.glyph+(state.pending.includes(id)?t('・あとで練習',' · ข้ามไว้'):''));b.classList.toggle('hasWritten',!!state.counts[id]);b.classList.toggle('isPending',state.pending.includes(id));b.onclick=()=>{if(state.index!==i)resetForSelection({index:i});};return b;})));
      const resource=resources();
      $('kanaLoading').hidden=!!resource.data&&!resource.error;$('kanaLoadingText').textContent=resource.error?t('見本を読み込めませんでした。','โหลดตัวอย่างไม่สำเร็จ'):t('見本を読み込み中…','กำลังโหลดตัวอย่าง…');$('kanaRetry').hidden=!resource.error;
      renderModel();paint();updateButtons();
    }
    async function fetchData() {
      const name=courseName,definition=course,resource=resources(name);
      if(resource.data)return;if(resource.loading)return resource.loading;
      resource.error=false;
      resource.loading=(async()=>{
        const controller=new root.AbortController(),timer=root.setTimeout(()=>controller.abort(),15000);
        try{
          const loaded=await Promise.all(Object.entries(definition.loadURLs).map(async([key,url])=>{const response=await root.fetch(root.ThaiNaviUpdate?.assetURL(url)||url,{signal:controller.signal,cache:'no-cache'});if(!response.ok)throw Error('data');return [key,await response.json()];}));
          const data=Object.fromEntries(loaded);if(!definition.validate(data))throw Error('data');resource.data=data;
        }catch{resource.error=true;}finally{root.clearTimeout(timer);resource.loading=null;if(dialog.open&&courseName===name)render();}
      })();
      return resource.loading;
    }
    function open(trigger) {
      if(dialog.open)return;opener=trigger||doc.activeElement;stopAudio();restoreReadingSelection();render();dialog.showModal();renderLearningMode();paint();$('kanaClose').focus();showWordHeader();fetchData();
    }
    function close() {finishPointer();stopAudio();stopOrder();readingPanel?.setContext({course:family(),script:state.script,row:state.row,language,active:false});root.clearTimeout(noticeTimer);$('kanaNotice').textContent='';if(dialog.open)dialog.close();}
    function setLanguage(value) {if(language===value)return;language=value==='ja'?'ja':'th';if(dialog.open)render();}
    function switchCourse(value,{keepOpen=false,remember=false}={}) {
      if(!Object.prototype.hasOwnProperty.call(courses,value))return false;
      if(value===courseName){if(remember)rememberMode(value);return false;}
      const wasOpen=dialog.open;
      rememberReadingSelection();
      if(keepOpen&&wasOpen){finishPointer();stopAudio();stopOrder();root.clearTimeout(noticeTimer);$('kanaNotice').textContent='';}else close();
      courseName=value;course=courses[value];state=course.normalize(preferences.json(course.KEY,null));
      if(studyModes[value])studyMode=studyModes[value];
      restoreReadingSelection();
      if(remember)rememberMode(value);
      if(keepOpen&&wasOpen){render();paint();showWordHeader();fetchData();}
      return true;
    }
    function setCourse(value) {return switchCourse(value==='japanese'?japaneseMode:value==='thai'?thaiMode:value,{remember:['words','thaiWords'].includes(value)});}
    function complete(completed) {
      if(isReading())return;
      if(wordDone()&&!completed)return;
      finishPointer();stopAudio();stopOrder();
      const result=course.advance(state,completed);if(!result.advanced)return;
      state=result.state;save();render();
      if(result.wordCompleted||result.rowChanged)showWordHeader();
      if(wholeWord()&&result.wordCompleted){playText(String(wordInfo()?.speechText||entryFor().speechText));return;}
      if(result.wrapped)toast(wholeWord()?t('最初のことばに戻りました。','กลับมาที่คำแรกแล้ว'):t('最初の行に戻りました。','กลับมาที่แถวแรกแล้ว'));
      else if(result.rowChanged&&!wholeWord()){const label=course.rowLabels(state)[state.row];toast(t(`次は「${label}」です。`,`ต่อไป ${label}`));}
    }
    function changedGeometry(rect) {
      return activeGeometry&&['left','top','width','height'].some(key=>Math.abs(rect[key]-activeGeometry[key])>.5);
    }
    function addPointerPoint(event) {
      if(!activeStroke)return;
      const rect=$('kanaCanvas').getBoundingClientRect();if(!rect.width||!rect.height)return;
      // Rotation or a layout shift must not join points from two coordinate systems.
      if(changedGeometry(rect)){finishPointer();return;}
      if(!Number.isFinite(event.clientX)||!Number.isFinite(event.clientY))return;
      const p=[clamp((event.clientX-rect.left)/rect.width,0,1),clamp((event.clientY-rect.top)/rect.height,0,1)],previous=activeStroke.at(-1);
      if(!previous||Math.hypot(p[0]-previous[0],p[1]-previous[1])>.0015){if(activeStroke.length<1200)activeStroke.push(p);}
    }
    const canvas=$('kanaCanvas');
    canvas.addEventListener('pointerdown',event=>{
      const resource=resources();if(!dialog.open||doc.hidden||isReading()||activePointer!==null||event.isPrimary===false||event.button!==undefined&&event.button!==0||!resource.data||resource.error||wordDone()||state.ink.length>=100)return;
      const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height||!Number.isFinite(event.clientX)||!Number.isFinite(event.clientY))return;
      event.preventDefault();stopOrder();activePointer=event.pointerId;activeStroke=[];activeGeometry={left:rect.left,top:rect.top,width:rect.width,height:rect.height};state.ink.push(activeStroke);
      try{canvas.setPointerCapture(event.pointerId);}catch{}
      addPointerPoint(event);paint();updateButtons();
    });
    canvas.addEventListener('pointermove',event=>{if(event.pointerId!==activePointer)return;event.preventDefault();const samples=typeof event.getCoalescedEvents==='function'?event.getCoalescedEvents():[];for(const sample of samples.length?samples:[event])addPointerPoint(sample);paint();});
    canvas.addEventListener('pointerup',event=>{if(event.pointerId!==activePointer)return;addPointerPoint(event);paint();finishPointer(event);});
    canvas.addEventListener('pointercancel',finishPointer);canvas.addEventListener('lostpointercapture',finishPointer);
    canvas.addEventListener('contextmenu',event=>event.preventDefault());
    // A lost/failed capture must not leave the board stuck waiting for that pointer.
    root.addEventListener('pointerup',finishPointer);root.addEventListener('pointercancel',finishPointer);
    root.addEventListener('blur',()=>finishPointer());
    function repaintAfterLayoutChange(){if(!dialog.open)return;if(changedGeometry(canvas.getBoundingClientRect()))finishPointer();paint();}
    if(typeof root.ResizeObserver==='function'){const observer=new root.ResizeObserver(repaintAfterLayoutChange);observer.observe(canvas);}
    root.addEventListener('resize',repaintAfterLayoutChange);
    function playOrder() {
      if(isReading())return;
      finishPointer();stopAudio();stopOrder();if(course.hasStrokeOrder===false)return;const groups=strokeGroups();if(!groups.length)return;
      const token=++animationToken,layer=$('kanaModel').querySelector('[data-strokesvg="strokes"]');layer.style.opacity='1';
      $('kanaBoard').classList.add('isPlaying');$('kanaOrder').setAttribute('aria-pressed','true');
      const paths=groups.map(group=>(group.tagName.toLowerCase()==='path'?[group]:[...group.querySelectorAll('path')]).map(path=>{const length=path.getTotalLength();path.style.strokeDasharray=`${length} ${length}`;path.style.strokeDashoffset=String(length);return {path,length};}));
      const reduce=root.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      let began=null;
      const duration=1100,gap=220;
      function draw(now) {
        if(token!==animationToken||!dialog.open)return;
        if(began===null)began=now;
        const elapsed=reduce?groups.length*(duration+gap):now-began;
        for(let i=0;i<paths.length;i++){const fraction=clamp((elapsed-i*(duration+gap))/duration,0,1);for(const {path,length}of paths[i])path.style.strokeDashoffset=String(length*(1-fraction));}
        const index=Math.min(groups.length,Math.floor(elapsed/(duration+gap))+1);
        $('kanaStrokeStatus').textContent=t(`${index} / ${groups.length}画`, `ขีด ${index} / ${groups.length}`);
        if(reduce?now-began<1600:elapsed<groups.length*(duration+gap))frame=root.requestAnimationFrame(draw);
        else{frame=0;$('kanaBoard').classList.remove('isPlaying');$('kanaOrder').setAttribute('aria-pressed','false');}
      }
      frame=root.requestAnimationFrame(draw);
    }
    $('kanaClose').onclick=close;dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
    dialog.addEventListener('close',()=>{if(dialog.open)return;finishPointer();stopAudio();stopOrder();readingPanel?.setContext({course:family(),script:state.script,row:state.row,language,active:false});if(opener?.isConnected)opener.focus({preventScroll:true});});
    ['kanaHiragana','kanaKatakana'].forEach((id,index)=>{$(id).onclick=()=>{
      const choice=scriptChoices()[index],base=family();if(!choice)return;
      if(wholeWord())switchCourse(base,{keepOpen:true,remember:true});
      else rememberMode(base);
      if(state.script!==choice.value)resetForSelection({script:choice.value});
    };});
    if($('kanaWords'))$('kanaWords').onclick=()=>{const name=familyWords();if(courses[name])switchCourse(name,{keepOpen:true,remember:true});};
    if($('kanaLearnMode'))$('kanaLearnMode').onclick=()=>setStudyMode('reading');
    if($('kanaWriteMode'))$('kanaWriteMode').onclick=()=>setStudyMode('writing');
    $('kanaRow').onchange=()=>resetForSelection({row:Number($('kanaRow').value)});
    $('kanaRepeat').onchange=()=>{if(wholeWord()||isReading())return;finishPointer();state=course.select(state,{repeat:Number($('kanaRepeat').value)});save();renderLabels();renderRound();};
    $('kanaGuide').onclick=()=>{if(isReading())return;finishPointer();stopOrder();state.guide=!state.guide;save();renderLabels();$('kanaBoard').classList.toggle('withoutGuide',!state.guide);};
    $('kanaClear').onclick=()=>{if(isReading())return;if(wordDone()){resetForSelection({restart:true});return;}finishPointer();stopOrder();state.ink=[];save();paint();updateButtons();};
    $('kanaUndo').onclick=()=>{if(wordDone()||isReading())return;finishPointer();stopOrder();state.ink.pop();save();paint();updateButtons();};
    $('kanaDone').onclick=()=>complete(true);$('kanaSkip').onclick=()=>complete(false);$('kanaOrder').onclick=playOrder;
    function playText(text){
      stopAudio();const token=++voiceToken,locale=course.locale;
      play(text,status=>{if(token!==voiceToken||!dialog.open)return;
        $('kanaAudioStatus').textContent=['starting','loading'].includes(status.type)?t('音声を準備中…','กำลังเตรียมเสียง…'):status.type==='playing'?t('再生中…','กำลังเล่นเสียง…'):['unsupported','missing-voice','error'].includes(status.type)?(locale==='th-TH'?t('タイ語音声を利用できません。端末の音声設定を確認してください。','ไม่พบเสียงภาษาไทย กรุณาตรวจสอบการตั้งค่าเสียงของอุปกรณ์'):t('日本語音声を利用できません。端末の音声設定を確認してください。','ไม่พบเสียงภาษาญี่ปุ่น กรุณาตรวจสอบการตั้งค่าเสียงของอุปกรณ์')):'';
      },locale);
    }
    $('kanaListen').onclick=()=>{if(!isReading())playText(entryFor().speechText);};
    $('kanaRetry').onclick=()=>{resources().error=false;render();fetchData();};
    root.addEventListener('pagehide',()=>{if(dialog.open){finishPointer();stopOrder();stopAudio();save();}});
    doc.addEventListener('visibilitychange',()=>{if(doc.hidden&&dialog.open){finishPointer();stopOrder();stopAudio();}});
    return {open,close,setLanguage,setCourse};
  }
  root.ThaiNaviKanaPractice={ROWS,REPEATS,KEY,rowChars,current,normalize,cleanInk,hasInk,advance,select,mount};
})(typeof window!=='undefined'?window:globalThis);
