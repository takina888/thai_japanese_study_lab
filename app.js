(()=>{'use strict';
const courses=window.ThaiNaviCourses;
const japanese=window.ThaiNaviJapaneseLearning;
let types=courses.types(window.ThaiNaviProfile.getProfile());
const $=id=>document.getElementById(id);const safe=t=>String(t??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const prefs=window.ThaiNaviPreferences;
const speech=window.ThaiNaviSpeech, speechPlayer=speech.createPlayer();
let speechCardKey='',speechMessage='';
let sourceItems=[],baseItems=[],serviceItems=[],all=[],current='words',language=prefs.language(),favorites=new Set(prefs.ids('tn_favorites')),learned=new Set(prefs.ids('tn_learned')),onlyFav=false,shown=[],at=0,quizAnswer=null,storageWarning=false,serviceScene='all',baseLoading=true,serviceLoading=true,baseError=false,serviceError=false;
let currentUnitId='',flowMode='learn',testSession=null,lastTestResult=null,reviewIds=null,flowNotice='';
const t=(ja,th)=>language==='ja'?ja:th;
const learning=window.ThaiNaviLearningSets.create({preferences:prefs,courses,onStorage:storageFeedback});
function storageFeedback(saved){if(!saved)storageWarning=true;$('storageNotice').hidden=!storageWarning;$('storageNotice').textContent=t('このブラウザでは保存できません。設定と学習記録は、このページを開いている間だけ保持されます。','เบราว์เซอร์นี้ไม่อนุญาตให้บันทึก การตั้งค่าและความคืบหน้าจะอยู่เฉพาะระหว่างที่เปิดหน้านี้');}
const pendingPersonalChanges=new Map();
function savedIds(key,fallback){
 let raw;try{raw=prefs.json(key,[...fallback],{fresh:true});}catch{raw=[...fallback];}
 const result=new Set(Array.isArray(raw)?raw.filter(id=>typeof id==='string'):fallback);
 for(const [id,enabled] of pendingPersonalChanges.get(key)||[])enabled?result.add(id):result.delete(id);
 return result;
}
function toggleSavedId(key,currentIds,id){
 const next=savedIds(key,currentIds),enabled=!currentIds.has(id);
 if(!pendingPersonalChanges.has(key))pendingPersonalChanges.set(key,new Map());
 pendingPersonalChanges.get(key).set(id,enabled);enabled?next.add(id):next.delete(id);
 const saved=prefs.set(key,JSON.stringify([...next]));if(saved)pendingPersonalChanges.delete(key);storageFeedback(saved);return next;
}
const kanaPractice=window.ThaiNaviKanaPractice.mount({preferences:prefs,reading:japanese,thaiCourse:window.ThaiNaviThaiPractice,wordsCourse:window.ThaiNaviJapaneseWordPractice,thaiWordsCourse:window.ThaiNaviThaiWordPractice,stopSpeech,onStorage:storageFeedback,play:(text,onStatus,locale='ja-JP')=>{stopSpeech();speechPlayer.play({text,locale,onStatus});}});
$('kanaOpen').onclick=()=>kanaPractice.open($('kanaOpen'));
function applyProfile(){
 const profile=window.ThaiNaviProfile.getProfile(),previousWork=types[4][0];
 types=courses.types(profile);
 if(previousWork!==types[4][0]&&['work','service'].includes(current)){current=types[4][0];at=0;serviceScene='all';onlyFav=false;$('onlyFav').classList.remove('selected');$('search').value='';}
 all=courses.project(sourceItems,profile);
 learning.setRows(all);
}
function renderSections(){$('sections').innerHTML=types.map(([key,ja,th,emoji,total])=>{const p=learning.progress(key,language);return `<button class="section ${current===key?'active':''}" data-section="${key}" aria-pressed="${current===key}"><span class="emoji">${emoji}</span><b>${language==='ja'?ja:th}</b><small>${total} ${language==='ja'?'項目':'รายการ'}${p.passed?` · ✓ ${p.percent}%`:''}</small></button>`;}).join('');$('sections').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{current=b.dataset.section;resetLearningFlow();clearBrowseFilters();renderSections();refresh();document.querySelector('#listTitle').scrollIntoView({behavior:'smooth',block:'start'});}));}
function inScene(x){return current!=='service'||serviceScene==='all'||x.scene===serviceScene;}
function hasBrowseFilters(){return Boolean($('search').value.trim()||onlyFav||(current==='service'&&serviceScene!=='all'));}
function clearBrowseFilters(){onlyFav=false;serviceScene='all';$('onlyFav').classList.remove('selected');$('search').value='';$('serviceScene').value='all';}
function resetLearningFlow(keepUnit=false){stopSpeech();flowMode='learn';testSession=null;lastTestResult=null;reviewIds=null;flowNotice='';at=0;if(!keepUnit)currentUnitId='';}
function getCurrentUnit(){
 const units=learning.units(current);if(!units.length)return null;
 let unit=units.find(x=>x.id===currentUnitId);
 if(!unit){const selections=prefs.json('tn_unit_selection_v1',{});const saved=selections&&typeof selections==='object'?selections[`${language}:${current}`]:null;unit=units.find(x=>x.id===saved)||units.find(x=>!learning.status(x,language).passed)||units[0];currentUnitId=unit.id;}
 return unit;
}
function selectLearningUnit(id){
 const unit=learning.units(current).find(x=>x.id===id);if(!unit)return;
 resetLearningFlow(true);currentUnitId=unit.id;clearBrowseFilters();
 const raw=prefs.json('tn_unit_selection_v1',{}),selections=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};
 selections[`${language}:${current}`]=unit.id;storageFeedback(prefs.set('tn_unit_selection_v1',JSON.stringify(selections)));refresh();
}
function filtered(){
 const q=$('search').value.trim().toLocaleLowerCase();
 if(!hasBrowseFilters()){const unit=getCurrentUnit();return (unit?.rows||[]).filter(row=>!reviewIds||reviewIds.includes(row.id));}
 return all.filter(x=>x.type===current&&inScene(x)&&(!onlyFav||favorites.has(x.id))&&(!q||[japaneseText(x),x.th,x.thRoman,x.thKana,japanese.forItem(x)?.kana,japanese.forItem(x)?.roman,japanese.forItem(x)?.text,courses.context(x,language,'japanese'),courses.context(x,language,'thai')].join(' ').toLocaleLowerCase().includes(q)));
}
function refresh(){
 shown=filtered();if(at>=shown.length)at=Math.max(0,shown.length-1);
 $('listTitle').textContent=types.find(x=>x[0]===current)?.[language==='ja'?1:2];
 $('resultCount').textContent=hasBrowseFilters()?t(`${shown.length}件の検索結果`,`${shown.length} รายการที่พบ`):t(`全${types.find(x=>x[0]===current)?.[4]}項目`,`${types.find(x=>x[0]===current)?.[4]} รายการ`);
 $('serviceTools').hidden=current!=='service';$('serviceReadingGuide').hidden=current!=='service'||language==='th';$('japaneseReadingGuide').hidden=language!=='th';$('onlyFav').setAttribute('aria-pressed',String(onlyFav));$('random').disabled=shown.length<2;
 if(flowMode==='learn')renderCard();renderLearningHub();renderProgress();
}
function renderLearningHub(){
 const units=learning.units(current),unit=getCurrentUnit(),status=learning.status(unit,language),testing=flowMode!=='learn';
 $('studyWorkspace').hidden=testing;$('studyWorkspace').inert=testing;$('unitListDetails').hidden=testing;$('quizPanel').hidden=!testing;
 $('unitLabel').textContent=current==='words'?t('10語ずつ覚える','เรียนครั้งละ 10 คำ'):t('10項目ずつ覚える','เรียนครั้งละ 10 ประโยค');
 $('unitSelect').innerHTML=units.map(x=>`<option value="${safe(x.id)}">${learning.status(x,language).passed?'✓ ':''}${t('セット','ชุด')} ${x.number} · ${x.start}–${x.end}</option>`).join('');$('unitSelect').value=unit?.id||'';$('unitSelect').disabled=testing||!unit;
 const phase=flowMode==='result'&&lastTestResult?.wrongIds.length===0&&status.passed?2:flowMode==='learn'?0:1;
 $('unitSteps').innerHTML=[t('1 見て覚える','1 ดูและจำ'),t('2 テスト','2 ทดสอบ'),t('3 合格','3 ผ่าน')].map((label,index)=>`<li class="${phase===index?'active':index<phase?'done':''}"${phase===index?' aria-current="step"':''}>${label}</li>`).join('');
 $('unitSummary').textContent=!unit?t('教材を読み込み中です…','กำลังโหลดบทเรียน…'):testing?t(`セット ${unit.number} · ${unit.total}項目`, `ชุด ${unit.number} · ${unit.total} รายการ`):hasBrowseFilters()?t('セット以外の単語も検索できます。','ค้นหาคำจากชุดอื่นได้ด้วย'):status.passed?t(`✓ セット ${unit.number} 合格済み`,`✓ ชุด ${unit.number} ผ่านแล้ว`):reviewIds?t(`復習 ${reviewIds.length}項目 · 正解済み ${status.correct}/${status.total}`,`ทบทวน ${reviewIds.length} รายการ · ตอบถูกแล้ว ${status.correct}/${status.total}`):t(`見た ${status.seen}/${status.total} · 正解 ${status.correct}/${status.total}`,`ดูแล้ว ${status.seen}/${status.total} · ตอบถูก ${status.correct}/${status.total}`);
 $('unitPrimary').hidden=testing;
 $('unitPrimary').disabled=!unit||(!hasBrowseFilters()&&!status.ready);
 $('unitPrimary').textContent=hasBrowseFilters()?t('このセットに戻る','กลับไปชุดนี้'):status.passed?t('もう一度テスト','ทดสอบอีกครั้ง'):status.correct?t('残りの単語をテスト','ทดสอบคำที่เหลือ'):status.ready?t('テストを始める','เริ่มทดสอบ'):t(`${status.total-status.seen}項目を見たらテストへ`,`ดูอีก ${status.total-status.seen} รายการแล้วทดสอบ`);
 $('unitNotice').textContent=flowNotice;$('unitNotice').hidden=!flowNotice;
 $('unitListTitle').textContent=t(`このセットの${unit?.total||0}項目・合格チェック`,`รายการในชุดนี้ ${unit?.total||0} รายการและผลผ่าน`);
 if(!testing){$('unitList').innerHTML=(unit?.rows||[]).map(row=>{const read=japanese.forItem(row),passed=status.passedIds.includes(row.id);return `<li><button type="button" data-study-id="${safe(row.id)}" class="${shown[at]?.id===row.id?'current':''}"><span class="unitCheck" aria-label="${passed?t('合格','ผ่าน'):t('未合格','ยังไม่ผ่าน')}">${passed?'✓':'○'}</span><span class="unitItemWords"><span lang="ja">${safe(japaneseText(row))}</span><small lang="ja">${safe(read?.kana||'')} · ${safe(read?.roman||'')}</small><span lang="th">${safe(row.th)}</span></span></button></li>`;}).join('');
 $('unitList').querySelectorAll('[data-study-id]').forEach(button=>button.onclick=()=>{clearBrowseFilters();reviewIds=null;shown=unit.rows.slice();at=Math.max(0,shown.findIndex(row=>row.id===button.dataset.studyId));refresh();$('card').scrollIntoView({behavior:'smooth',block:'start'});});}
}
function japaneseText(row){return courses.japaneseText(row);}
function lessonContextHtml(row,side='japanese'){
 const context=courses.context(row,language,side);
 return context?`<span class="lessonContext" lang="${language==='ja'?'ja':'th'}">${safe(context)}</span>`:'';
}
function showThaiHints(){return prefs.get('tn_jp_thai_hint')!=='off';}
function updateThaiHintVisibility(){
 const visible=showThaiHints();document.documentElement.classList.toggle('hideJapaneseThaiHints',!visible);
 const button=$('toggleJapaneseThaiHint');if(button){button.textContent=visible?'ซ่อนคำอ่านไทย':'แสดงคำอ่านไทย';button.setAttribute('aria-pressed',String(visible));}
}
function thaiCueMarkup(reading){
 let html='',lastKind='';
 for(const token of reading.tokens){
  if(['space','alternative','punctuation'].includes(token.kind)){html+=safe(token.text);lastKind=token.kind;continue;}
  if(html&&!['space','alternative','punctuation'].includes(lastKind))html+='<span aria-hidden="true">-</span><wbr>';
  html+=token.kind==='hold'?`<span class="thaiCueHold" lang="ja" title="เพิ่มจังหวะของพยัญชนะถัดไป ไม่อ่านเป็นคำ">${safe(token.text)}</span>`:`<span class="thaiCueToken">${safe(token.text)}${token.lengthLabel?`<small class="thaiCueLength">${safe(token.lengthLabel)}</small>`:''}</span>`;
  lastKind=token.kind;
 }
 return html;
}
function japaneseCoreReadingsHtml(row,compact=false){
 const reading=japanese.forItem(row);if(!reading||reading.unsupported.length)return '';
 return `<span class="jpCoreReadings${compact?' jpCoreReadingsCompact':''}" aria-label="読み方 / คำอ่าน"><span class="jpKanaReading" lang="ja">${safe(reading.kana)}</span><span class="jpRomanReading" lang="ja-Latn">${safe(reading.roman)}</span></span>`;
}
function japaneseReadingHtml(row){
 const reading=japanese.forItem(row);if(!reading||reading.unsupported.length)return '';
 return `${japaneseCoreReadingsHtml(row)}<div class="jpReadingHeader"><span class="jpReadingLabel">คำอ่านไทยโดยประมาณ</span><button type="button" class="jpHintToggle" id="toggleJapaneseThaiHint" aria-pressed="${showThaiHints()}">${showThaiHints()?'ซ่อนคำอ่านไทย':'แสดงคำอ่านไทย'}</button></div><div class="japaneseThaiHint jpThaiCardHint" lang="th">${thaiCueMarkup(reading)}</div>${reading.flags.includes('blank')?'<p class="jpTemplateNote">แทน … ด้วยชื่อของคุณ</p>':''}`;
}
function renderCard(){
 const r=shown[at];const nextSpeechKey=r?JSON.stringify([r.id,language,speech.textFor(r,'ja-JP'),r.th]):'';
 if(nextSpeechKey!==speechCardKey){if(!$('kanaDialog').open)stopSpeech();speechCardKey=nextSpeechKey;}
 ['favBtn','learned','prev','next'].forEach(id=>$(id).disabled=!r);
 if(!r){$('favBtn').textContent=t('☆ お気に入りに追加','☆ เพิ่มในรายการโปรด');$('favBtn').classList.remove('on');$('favBtn').setAttribute('aria-pressed','false');$('favBtn').setAttribute('aria-label',t('お気に入りに追加','เพิ่มในรายการโปรด'));$('learned').textContent=t('○ 覚えた','○ จำได้แล้ว');$('learned').setAttribute('aria-pressed','false');}
 if(current==='service'?serviceLoading:baseLoading){$('card').innerHTML=`<div class="empty">${t('教材を読み込み中です…','กำลังโหลดบทเรียน…')}</div>`;return;}
 if(current==='service'?serviceError:baseError){$('card').innerHTML=`<div class="empty">${t('この教材を読み込めませんでした。ページを再読み込みしてください。','โหลดบทเรียนนี้ไม่สำเร็จ กรุณาโหลดหน้านี้ใหม่')}</div>`;return;}
 if(!r){
  const hasQuery=Boolean($('search').value.trim());
  const message=hasQuery?t('一致する表現がありません。','ไม่พบคำหรือประโยคที่ตรงกับคำค้นหา'):onlyFav?t('このテーマのお気に入りはまだありません。','ยังไม่มีรายการโปรดในหัวข้อนี้'):t('表示できる表現がありません。','ไม่มีคำหรือประโยคให้แสดง');
  $('card').innerHTML=`<div class="empty"><p>${message}</p>${hasQuery||onlyFav?`<button type="button" class="toolBtn" id="clearLessonFilter">${hasQuery?t('検索をクリア','ล้างคำค้นหา'):t('すべて表示','แสดงทั้งหมด')}</button>`:''}</div>`;
  if($('clearLessonFilter'))$('clearLessonFilter').onclick=()=>{if(hasQuery)$('search').value='';else{onlyFav=false;$('onlyFav').classList.remove('selected');}at=0;refresh();};
  return;
 }
 if(flowMode==='learn')learning.markSeen(r.id,language);
 const tag=language==='th'&&r.categoryTh?r.categoryTh:language==='ja'&&r.category&&!types.some(x=>x[0]===r.category)?r.category:types.find(x=>x[0]===current)?.[language==='ja'?1:2];
 const rowUnit=learning.units(current).find(unit=>unit.ids.includes(r.id));
 const checked=learning.status(rowUnit,language).passedIds.includes(r.id);
 const top=`<div class="cardTop"><span><span class="tag">${safe(tag)}</span>${checked?`<span class="unitPassedLabel">${t('✓ テスト合格','✓ ผ่านการทดสอบ')}</span>`:''}</span><span class="count">${at+1} / ${shown.length}</span></div>`;
 if(language==='th'){
  $('card').innerHTML=top+`<div class="langLabel">ภาษาญี่ปุ่น</div><div class="phrase" lang="ja">${safe(japaneseText(r))}</div>${japaneseReadingHtml(r)}${lessonContextHtml(r)}<div class="row jpAudioActions"><button class="speak dark" data-speak="ja-JP">🔊 ฟังเสียงญี่ปุ่น</button><button class="toolBtn" id="slowBtn">ฟังแบบช้า</button></div><div class="jpMeaning"><div class="langLabel">ความหมายภาษาไทย</div><div class="phrase thai" lang="th">${safe(r.th)}</div>${lessonContextHtml(r,'thai')}<div class="row" style="margin-top:12px"><button class="speak" data-speak="th-TH">🔊 ฟังความหมายไทย</button></div></div><p class="note" id="voiceStatus" aria-live="polite"></p>`;
 }else{
  $('card').innerHTML=top+`<div class="langLabel">日本語</div><div class="phrase" lang="ja">${safe(japaneseText(r))}</div>${japaneseCoreReadingsHtml(r)}${lessonContextHtml(r)}<div class="row" style="margin-top:15px"><button class="speak" data-speak="ja-JP">🔊 日本語</button></div><div class="separator"></div><div class="langLabel">タイ語</div><div class="phrase thai" lang="th">${safe(r.th)}</div><div class="read"><span lang="th-Latn">${safe(r.thRoman)}</span> / <span lang="ja">${safe(r.thKana)}</span></div>${lessonContextHtml(r,'thai')}<div class="row" style="margin-top:15px"><button class="speak dark" data-speak="th-TH">🔊 タイ語</button><button class="toolBtn" id="slowBtn">ゆっくり再生</button></div><p class="note" id="voiceStatus" aria-live="polite"></p>`;
 }
 if(r.type==='service'){
  const gender=window.ThaiNaviProfile.getProfile()?.gender;
  if(language==='ja'&&!['male','female'].includes(gender)){
   const formNote=document.createElement('p');formNote.className='serviceFormNote';
   formNote.textContent='タイ語の丁寧な語尾は、設定の性別を選ぶと表示されます。';$('voiceStatus').before(formNote);
  }
 }
 const supplement=language==='ja'?r.noteJa:r.noteTh;
 if(supplement){const detail=document.createElement('details');detail.className='lessonSupplement';const summary=document.createElement('summary');summary.textContent=t('言葉の補足','เพิ่มเติมเกี่ยวกับคำนี้');const body=document.createElement('p');body.textContent=supplement;detail.append(summary,body);$('voiceStatus').before(detail);}
 $('voiceStatus').textContent=speechMessage;
 $('card').querySelectorAll('[data-speak]').forEach(b=>{b.dataset.utterance=speech.textFor(r,b.dataset.speak);b.onclick=()=>speak(b.dataset.utterance,b.dataset.speak,false);});
 const learningLocale=language==='th'?'ja-JP':'th-TH';$('slowBtn').dataset.utterance=speech.textFor(r,learningLocale);$('slowBtn').onclick=()=>speak($('slowBtn').dataset.utterance,learningLocale,true);
 if($('toggleJapaneseThaiHint'))$('toggleJapaneseThaiHint').onclick=()=>{storageFeedback(prefs.set('tn_jp_thai_hint',showThaiHints()?'off':'on'));updateThaiHintVisibility();};
 updateThaiHintVisibility();
 $('favBtn').textContent=favorites.has(r.id)?t('★ お気に入り','★ รายการโปรด'):t('☆ お気に入りに追加','☆ เพิ่มในรายการโปรด');$('favBtn').classList.toggle('on',favorites.has(r.id));$('favBtn').setAttribute('aria-pressed',String(favorites.has(r.id)));$('favBtn').setAttribute('aria-label',favorites.has(r.id)?t('お気に入りから外す','นำออกจากรายการโปรด'):t('お気に入りに追加','เพิ่มในรายการโปรด'));$('learned').textContent=learned.has(r.id)?t('✓ 覚えた（自分用）','✓ จำได้แล้ว (บันทึกส่วนตัว)'):t('○ 覚えた（自分用）','○ จำได้แล้ว (บันทึกส่วนตัว)');$('learned').setAttribute('aria-pressed',String(learned.has(r.id)));$('prev').disabled=at===0;
 const last=at===shown.length-1,unit=getCurrentUnit(),status=learning.status(unit,language);
 $('next').disabled=last&&hasBrowseFilters();$('next').textContent=last&&!hasBrowseFilters()?(status.ready?t('テストへ →','ทดสอบ →'):t('残りを覚える →','ดูคำที่เหลือ →')):t('次へ →','ถัดไป →');$('next').setAttribute('aria-label',$('next').textContent);
}
function renderProgress(){const p=learning.progress(current,language);$('progressText').textContent=t(`このテーマの完了率 ${p.percent}% · 合格 ${p.passed}/${p.total}`,`ความคืบหน้าหัวข้อนี้ ${p.percent}% · ผ่าน ${p.passed}/${p.total}`);$('progressBar').style.width=`${p.percent}%`;$('courseProgressBar').setAttribute('aria-valuenow',String(p.percent));$('courseProgressBar').setAttribute('aria-label',t('このテーマの完了率','ความคืบหน้าหัวข้อนี้'));$('stampCount').textContent=t(`スタンプ ${p.completedUnits}/${p.totalUnits}`,`ตราประทับ ${p.completedUnits}/${p.totalUnits}`);}
function stopSpeech(){speechPlayer.stop();speechMessage='';if($('voiceStatus'))$('voiceStatus').textContent='';if($('quizVoiceStatus'))$('quizVoiceStatus').textContent='';}
function speak(text,locale,slow){
 const cardKey=speechCardKey;
 speechPlayer.play({text,locale,slow,onStatus:status=>{
  if(cardKey!==speechCardKey)return;
  if(status.type==='loading'||status.type==='starting')speechMessage=t('音声を準備しています…','กำลังเตรียมเสียง…');
  else if(status.type==='unsupported')speechMessage=t('この端末は音声読み上げに対応していません。','อุปกรณ์นี้ไม่รองรับการอ่านออกเสียง');
  else if(status.type==='missing-voice')speechMessage=locale==='th-TH'?t('タイ語音声を利用できません。端末の言語・音声設定を確認して、もう一度お試しください。','ไม่พบเสียงภาษาไทย กรุณาตรวจสอบการตั้งค่าภาษาและเสียงของอุปกรณ์ แล้วลองอีกครั้ง'):t('日本語音声を利用できません。端末の言語・音声設定を確認して、もう一度お試しください。','ไม่พบเสียงภาษาญี่ปุ่น กรุณาตรวจสอบการตั้งค่าภาษาและเสียงของอุปกรณ์ แล้วลองอีกครั้ง');
  else if(status.type==='error')speechMessage=t('音声を再生できませんでした。もう一度押すか、端末の音声設定をご確認ください。','เล่นเสียงไม่ได้ กรุณากดอีกครั้งหรือตรวจสอบการตั้งค่าเสียงของอุปกรณ์');
  else if(status.type==='empty')speechMessage=t('読み上げる文章がありません。','ไม่มีข้อความสำหรับอ่านออกเสียง');
  else if(status.type==='ended')speechMessage='';
  else speechMessage=slow?t('ゆっくり再生中…','กำลังเล่นแบบช้า…'):t('再生中…','กำลังเล่นเสียง…');
  if($('voiceStatus'))$('voiceStatus').textContent=speechMessage;
  if($('quizVoiceStatus'))$('quizVoiceStatus').textContent=speechMessage;
 }});
}
function nextQuestion(){
 const question=learning.question(testSession);
 if(!question){quizAnswer=null;$('quizQuestion').textContent=t('問題を準備できませんでした。「覚えるに戻る」からやり直してください。','เตรียมคำถามไม่สำเร็จ กรุณากลับไปทบทวนแล้วลองใหม่');$('quizOptions').replaceChildren();$('quizMessage').textContent='';$('quizNext').disabled=true;return;}
 const {correct,options}=question;quizAnswer=correct.id;
 $('quizTitle').textContent=testSession.round==='retry'?t('残りの単語をテスト','ทดสอบคำที่เหลือ'):testSession.round==='review'?t('復習テスト','ทดสอบทบทวน'):t('テスト','ทดสอบ');
 $('quizCounter').textContent=`${testSession.index+1} / ${testSession.total}`;
 $('quizQuestion').innerHTML=`<div class="langLabel">${language==='ja'?'タイ語を選んでください':'เลือกภาษาญี่ปุ่นที่ตรงกัน'}</div><div class="phrase" lang="${language==='ja'?'ja':'th'}" style="font-size:27px">${safe(language==='ja'?japaneseText(correct):correct.th)}</div>${language==='ja'?japaneseCoreReadingsHtml(correct,true)+lessonContextHtml(correct):`<span class="quizThaiRoman" lang="th-Latn">${safe(correct.thRoman)}</span>`}${question.promptContext?`<span class="quizPromptContext">選ぶタイ語：${safe(question.promptContext)}</span>`:''}`;
 $('quizOptions').innerHTML=options.map(x=>`<button type="button" data-answer="${safe(x.id)}">${language==='ja'?`<span class="quizThai" lang="th">${safe(x.th)}</span><span class="quizThaiRoman" lang="th-Latn">${safe(x.thRoman)}</span><span class="quizThaiKana" lang="ja">${safe(x.thKana)}</span>`:`<span class="quizJapanese" lang="ja">${safe(japaneseText(x))}</span>${japaneseCoreReadingsHtml(x,true)}${lessonContextHtml(x)}<span class="japaneseThaiHint quizThaiHint" lang="th">${thaiCueMarkup(japanese.forItem(x))}</span>`}</button>`).join('');
 $('quizMessage').textContent='';$('quizFeedback').hidden=true;$('quizFeedback').replaceChildren();$('quizVoiceStatus').textContent='';$('quizNext').disabled=true;$('quizNext').textContent=testSession.index===testSession.total-1?t('結果を見る','ดูผล'):t('次の問題 →','ข้อต่อไป →');
 $('quizOptions').querySelectorAll('button').forEach(b=>b.onclick=()=>{
  if(flowMode!=='test')return;
  const result=learning.answer(testSession,b.dataset.answer);if(!result.accepted)return;
  b.classList.add(result.correct?'correct':'wrong');$('quizOptions').querySelectorAll('button').forEach(c=>{c.disabled=true;if(c.dataset.answer===quizAnswer)c.classList.add('correct');});
  $('quizMessage').textContent=result.correct?t('正解！','ถูกต้อง!'):t('この単語は、あとでもう一度。','คำนี้กลับมาทบทวนอีกครั้ง');
  $('quizFeedback').hidden=false;
  const read=japanese.forItem(correct),targetLocale=language==='ja'?'th-TH':'ja-JP';
  $('quizFeedback').innerHTML=`<p class="feedbackPair"><span lang="ja">${safe(japaneseText(correct))}</span> — <span lang="th">${safe(correct.th)}</span></p><div class="read">${safe(language==='ja'?`${correct.thRoman} / ${correct.thKana}`:`${read?.kana||''} / ${read?.roman||''}`)}</div><button type="button" class="speak" id="quizListen">${t('🔊 正しい発音を聞く','🔊 ฟังเสียงคำตอบ')}</button>`;
  $('quizListen').onclick=()=>speak(speech.textFor(correct,targetLocale),targetLocale,false);
  $('quizNext').disabled=false;renderProgress();
 });
}
function startLearningTest(){
 const unit=getCurrentUnit();if(!unit)return;
 if(hasBrowseFilters()){clearBrowseFilters();reviewIds=null;at=0;refresh();return;}
 const status=learning.status(unit,language);if(!status.ready){flowNotice=t('まず、このセットの単語をひと通り確認しましょう。','ดูคำในชุดนี้ให้ครบก่อนเริ่มทดสอบ');refresh();return;}
 stopSpeech();testSession=learning.start(unit,language,{retry:status.correct>0&&!status.passed});
 if(!testSession){flowNotice=t('テストを準備できませんでした。教材を確認して、もう一度お試しください。','เตรียมแบบทดสอบไม่สำเร็จ กรุณาตรวจสอบบทเรียนแล้วลองอีกครั้ง');refresh();return;}
 flowMode='test';flowNotice='';lastTestResult=null;$('quizTask').hidden=false;$('quizResult').hidden=true;
 renderLearningHub();nextQuestion();$('quizPanel').scrollIntoView({behavior:'smooth',block:'start'});
}
function returnToStudy(ids=null){
 stopSpeech();flowMode='learn';testSession=null;flowNotice='';clearBrowseFilters();reviewIds=Array.isArray(ids)&&ids.length?ids.slice():null;at=0;refresh();$('card').scrollIntoView({behavior:'smooth',block:'start'});
}
function showLearningResult(){
 const result=learning.finish(testSession);if(!result?.complete)return;
 stopSpeech();lastTestResult=result;flowMode='result';renderLearningHub();renderProgress();renderSections();
 $('quizTask').hidden=true;$('quizResult').hidden=false;$('quizTitle').textContent=t('テスト結果','ผลการทดสอบ');$('quizCounter').textContent=`${result.score} / ${result.total}`;
 const allRight=result.wrongIds.length===0;
 $('resultStamp').hidden=!result.passed;$('resultStampText').textContent=t('合格','ผ่าน');
 $('resultTitle').textContent=allRight&&result.passed?t(`セット ${result.unit.number} 合格！`,`ผ่านชุดที่ ${result.unit.number}!`):result.passed?t('復習、お疲れさまでした','ทบทวนเสร็จแล้ว'):t(`あと${result.remaining}項目で合格`,`อีก ${result.remaining} รายการก็ผ่าน`);
 $('resultSummary').textContent=result.passed?(allRight?t(`${result.unit.total}項目すべて正解。単語リストにチェックが付きました。`, `ตอบถูกครบ ${result.unit.total} รายการแล้ว รายการคำมีเครื่องหมายผ่านแล้ว`):t(`今回は${result.score}/${result.total}正解。獲得済みのスタンプはそのまま残ります。`,`ครั้งนี้ถูก ${result.score}/${result.total} ข้อ ตราประทับที่เคยได้รับยังคงอยู่`)):t(`${result.score}/${result.total}正解。間違えた${result.wrongIds.length}項目を見直して、もう一度テストしましょう。`, `ตอบถูก ${result.score}/${result.total} ข้อ ทบทวน ${result.wrongIds.length} รายการที่ผิด แล้วทดสอบอีกครั้ง`);
 const nextUnit=learning.units(current).find(unit=>unit.number>result.unit.number&&!learning.status(unit,language).passed)||learning.units(current).find(unit=>!learning.status(unit,language).passed);
 if(result.passed&&allRight){$('resultPrimary').textContent=nextUnit?t('次のセットへ →','ชุดต่อไป →'):t('このテーマを復習する','ทบทวนหัวข้อนี้');$('resultPrimary').onclick=()=>{if(nextUnit){selectLearningUnit(nextUnit.id);$('learningHub').scrollIntoView({behavior:'smooth',block:'start'});}else returnToStudy();};}
 else{$('resultPrimary').textContent=t('間違えた単語を覚える','ทบทวนคำที่ผิด');$('resultPrimary').onclick=()=>returnToStudy(result.wrongIds);}
 $('resultSecondary').textContent=result.passed&&allRight?t('このセットを見直す','ทบทวนชุดนี้'):t('もう一度テスト','ทดสอบอีกครั้ง');
 $('resultSecondary').onclick=()=>{if(result.passed&&allRight)returnToStudy();else startLearningTest();};
 $('resultTitle').focus({preventScroll:true});$('quizPanel').scrollIntoView({behavior:'smooth',block:'start'});
}
function updateLanguage(){
 const isJa=language==='ja';document.documentElement.lang=language;updateThaiHintVisibility();
 $('kanaOpen').hidden=false;$('kanaEntryTitle').textContent=t('ことば・文字を学ぶ','เรียนอักษรและฝึกเขียนคำ');$('kanaEntrySubtitle').textContent=t('タイ文字の読みテスト · 100語を書く','ฮิรางานะ · คาตากานะ · ทดสอบการอ่าน · เขียน 100 คำ');$('kanaEntryGlyph').textContent=isJa?'ก':'あ';$('kanaEntryGlyph').lang=isJa?'th':'ja';kanaPractice.setCourse(isJa?'thai':'japanese');kanaPractice.setLanguage(language);
 $('studyLanguages').setAttribute('aria-label',t('学ぶ言語','ภาษาที่อยากเรียน'));
 $('learnThai').setAttribute('aria-pressed',String(isJa));
 $('learnJapanese').setAttribute('aria-pressed',String(!isJa));
 $('heroTitle').innerHTML=t('タイ語を<span>、</span><br>暮らしの中へ。','เรียน<span>ภาษาญี่ปุ่น</span><br>ในทุกวัน');
 $('heroLead').innerHTML=t('ひとこと話せると、<br>旅も、仕事も、少し近くなる。','เริ่มจากประโยคสั้น ๆ<br>ใช้ได้ทั้งในชีวิตและที่ทำงาน');
 $('heroSub').textContent=t('短い言葉から。日本語とタイ語を、行き来しながら。','เรียนรู้ทีละน้อย อ่าน ฟัง และฝึกพูดได้ทุกวัน');
 $('heroJump').textContent=t('学ぶテーマを選ぶ ↓','เลือกหัวข้อที่จะเรียน ↓');
 $('editorialHero').dataset.country=isJa?'thailand':'japan';
 $('editorialHero').setAttribute('aria-label',t('タイ語学習の入口','เริ่มเรียนภาษาญี่ปุ่น'));
 const imagePath=isJa?'assets/bangkok-river.png':'assets/japan-fuji.jpg';
 if($('heroImage').getAttribute('src')!==imagePath)$('heroImage').src=imagePath;
 $('heroImage').alt=t('夕暮れのチャオプラヤ川とワット・アルンをイメージした生成写真','ภูเขาไฟฟูจิ ทะเลสาบคาวากุจิ และใบไม้สีแดงในฤดูใบไม้ร่วง ประเทศญี่ปุ่น');
 $('heroCredit').innerHTML=isJa?'BANGKOK · CHAO PHRAYA RIVER · イメージ画像':'JAPAN · LAKE KAWAGUCHI · Photo: <a href="https://commons.wikimedia.org/wiki/File:Lake_Kawaguchiko_and_Mount_Fuji_at_sunset_during_the_Momijigari_period.jpg" target="_blank" rel="noopener noreferrer">Moyan Brenn</a> / <a href="https://creativecommons.org/licenses/by/2.0/" target="_blank" rel="noopener noreferrer">CC BY 2.0</a> · cropped';
 const labels=[['selectTitle','今日は何を学ぶ？','วันนี้อยากเรียนอะไร?'],['wordStat','基本単語','คำศัพท์พื้นฐาน'],['chatStat','日常チャット','คุยในชีวิตประจำวัน'],['workStat','仕事の表現','ประโยคที่ทำงาน'],['onlyFav','☆ お気に入り','☆ รายการโปรด'],['random','🔀 ランダムに1枚','🔀 สุ่มหนึ่งรายการ'],['prev','← 前へ','← ก่อนหน้า'],['next','次へ →','ถัดไป →'],['browseToolsTitle','単語を探す・お気に入り','ค้นหาคำและรายการโปรด'],['selfCheckTitle','自分用の学習メモ','บันทึกการเรียนส่วนตัว'],['selfCheckNote','このチェックは、テストの合格率には含めません。','เครื่องหมายนี้ไม่นับเป็นผลผ่านการทดสอบ']];
 labels.forEach(([id,ja,th])=>$(id).textContent=t(ja,th));
 const workType=types[4];$('workNumber').textContent=workType[4];$('workStat').textContent=workType[isJa?1:2];
 $('workCourseSummary').textContent=t(`仕事のコース：${workType[1]}（${workType[4]}文）`,`บทเรียนสำหรับงาน: ${workType[2]} (${workType[4]} ประโยค)`);
 $('changeWorkCourse').textContent=t('仕事のコースを変更','เปลี่ยนบทเรียนสำหรับงาน');
 $('serviceSceneLabel').textContent=t('使う場面','สถานการณ์');
 $('serviceScene').innerHTML=courses.scenes.map(([key,ja,th,count])=>`<option value="${key}">${safe(t(ja,th))} · ${count}</option>`).join('');$('serviceScene').value=serviceScene;
 $('readingGuideTitle').textContent=t('発音表記の見方','วิธีอ่านคำถอดเสียง');
 $('readingGuideBody').textContent=t('声調：a 中平 ／ à 低 ／ â 下降 ／ á 高 ／ ǎ 上昇。\n同じ母音を2つ重ねた aa・ii などは長い音です。ŋ は ง、c は息を強く出さない จ、ch は息を出す ช・ฉ。ph・th・kh も息を出す子音です。\nカタカナは読み方の補助です。タイ語の声調や母音の違いを、カタカナだけで再現することはできません。','วรรณยุกต์: a สามัญ / à เอก / â โท / á ตรี / ǎ จัตวา\nสระซ้ำ เช่น aa・ii แสดงเสียงยาว ŋ แทน ง, c แทน จ, ch แทน ช・ฉ ส่วน ph・th・kh เป็นพยัญชนะที่มีลม\nคำอ่านคาตากานะเป็นเพียงตัวช่วย ไม่สามารถแทนเสียงสระและวรรณยุกต์ไทยได้ครบถ้วน');
 $('servicePracticeNote').textContent=t('店員からお客様への表現です。金額・時間・店のルールは、ご自身の店に合わせてください。','ประโยคสำหรับพนักงานพูดกับลูกค้า ปรับราคา เวลา และกฎให้ตรงกับร้านของคุณ');
 $('search').placeholder=t('日本語・タイ語で検索','ค้นหาภาษาไทย / ญี่ปุ่น');$('search').setAttribute('aria-label',$('search').placeholder);
 $('prev').setAttribute('aria-label',t('前へ','ก่อนหน้า'));$('next').setAttribute('aria-label',t('次へ','ถัดไป'));
 $('quizToggle').textContent=t('覚えるに戻る','กลับไปทบทวน');
 $('voiceHelpTitle').textContent=t('音声について','เกี่ยวกับเสียงอ่าน');
 $('voiceHelp').textContent=t('端末の合成音声を使用します。対応する言語の音声が必要です。読み方やアクセントが不自然になる場合があります。','ใช้เสียงสังเคราะห์ของอุปกรณ์ ต้องมีเสียงของภาษาที่เลือก บางคำอาจอ่านหรือออกเสียงสูงต่ำไม่เป็นธรรมชาติ');
 $('siteFooter').textContent='THAI × JAPANESE NAVI · V33';
 window.ThaiNaviProfile.updateLanguage(language);storageFeedback(true);
}
function refreshLanguage(){updateLanguage();renderSections();refresh();}
function refreshExternalLearning(){
 favorites=savedIds('tn_favorites',favorites);learned=savedIds('tn_learned',learned);
 // Update progress without replacing the active question, answer buttons or
 // result. A foreground/background transition must not reset an in-flight test.
 renderProgress();renderSections();
 if(flowMode==='learn'){
  const selected=shown[at]?.id;shown=filtered();at=Math.max(0,shown.findIndex(row=>row.id===selected));
  renderCard();renderLearningHub();
 }
}
function chooseLanguage(value){if(language===value)return;kanaPractice.close();resetLearningFlow();clearBrowseFilters();language=value;storageFeedback(prefs.set('tn_language',language));refreshLanguage();}
$('learnThai').onclick=()=>chooseLanguage('ja');
$('learnJapanese').onclick=()=>chooseLanguage('th');
window.addEventListener('tn:profile-saved',event=>{if(language!==event.detail.language)kanaPractice.close();resetLearningFlow();clearBrowseFilters();language=event.detail.language;applyProfile();storageFeedback(event.detail.persisted);refreshLanguage();});
$('settingsButton').addEventListener('click',stopSpeech);
$('changeWorkCourse').onclick=()=>{stopSpeech();window.ThaiNaviProfile.openCourse();};
window.addEventListener('pagehide',stopSpeech);
window.addEventListener('storage',event=>{if(['tn_learning_sets_v1','tn_favorites','tn_learned'].includes(event.key))refreshExternalLearning();});
window.addEventListener('focus',refreshExternalLearning);
window.addEventListener('pageshow',event=>{if(event.persisted)refreshExternalLearning();});
$('unitSelect').onchange=()=>selectLearningUnit($('unitSelect').value);
$('unitPrimary').onclick=startLearningTest;
$('serviceScene').onchange=()=>{resetLearningFlow(true);serviceScene=$('serviceScene').value;refresh();};
$('search').addEventListener('input',()=>{resetLearningFlow(true);refresh();});
$('onlyFav').onclick=()=>{resetLearningFlow(true);onlyFav=!onlyFav;$('onlyFav').classList.toggle('selected',onlyFav);refresh();};
$('random').onclick=()=>{at=Math.floor(Math.random()*shown.length);refresh();};
$('prev').onclick=()=>{at=Math.max(0,at-1);refresh();};
$('next').onclick=()=>{
 if(flowMode!=='learn'||!shown.length)return;
 if(at<shown.length-1){at++;refresh();return;}
 if(hasBrowseFilters())return;
 const unit=getCurrentUnit(),status=learning.status(unit,language);
 if(status.ready){startLearningTest();return;}
 reviewIds=null;at=Math.max(0,unit.rows.findIndex(row=>!status.seenIds.includes(row.id)));refresh();
};
$('favBtn').onclick=()=>{const r=shown[at];if(!r)return;favorites=toggleSavedId('tn_favorites',favorites,r.id);refresh();};
$('learned').onclick=()=>{const r=shown[at];if(!r)return;learned=toggleSavedId('tn_learned',learned,r.id);refresh();};
$('quizToggle').onclick=()=>returnToStudy();
$('quizNext').onclick=()=>{if(flowMode!=='test'||!testSession?.answered)return;stopSpeech();if(testSession.complete){showLearningResult();return;}if(learning.next(testSession)){nextQuestion();$('quizQuestion').scrollIntoView({behavior:'smooth',block:'start'});}};
updateLanguage();renderSections();refresh();
async function loadLessons(path){
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);
 try{const response=await fetch(window.ThaiNaviUpdate?.assetURL(path)||path,{signal:controller.signal,cache:'no-cache'});if(!response.ok)throw Error('fetch');const data=await response.json();if(!Array.isArray(data.items))throw Error('data');return data.items;}
 finally{clearTimeout(timeout);}
}
async function loadCourse(path,isService){
 try{const items=await loadLessons(path);if(isService)serviceItems=items;else baseItems=items;}
 catch{if(isService)serviceError=true;else baseError=true;}
 finally{
  if(isService)serviceLoading=false;else baseLoading=false;
  sourceItems=[...baseItems,...serviceItems];applyProfile();
  if(flowMode==='learn')refreshLanguage();else{renderSections();renderLearningHub();renderProgress();}
 }
}
loadCourse('lessons.json?v=33',false);loadCourse('service-lessons.json?v=33',true);
})();
