(function (root) {
  'use strict';
  const common = [
    ['words', '基本単語', 'คำศัพท์', '📖', 500],
    ['basics', '基本会話', 'บทสนทนา', '💬', 40],
    ['chat', '日常チャット', 'แชตประจำวัน', '☀️', 300],
    ['directions', '方向・位置', 'ทิศทาง', '🧭', 24]
  ];
  const work = ['work', '一般・現場の仕事', 'งานทั่วไป・หน้างาน', '🛠️', 200];
  const service = ['service', '接客・サービス', 'งานบริการ', '☕', 100];
  const scenes = [
    ['all', 'すべての場面', 'ทุกสถานการณ์', 100],
    ['restaurant', 'レストラン', 'ร้านอาหาร', 35],
    ['convenience', 'コンビニ', 'ร้านสะดวกซื้อ', 30],
    ['cafe', 'カフェ', 'คาเฟ่', 15],
    ['common', '共通の接客', 'งานบริการทั่วไป', 20]
  ];
  // Only reviewed source text receives a display override. A reused ID with
  // different content must not silently inherit a lesson's gloss or reading.
  const display = {
    'words-1': { source:'私（男性）', text:'私', japanese:['男女共通', 'ใช้ได้ทั้งผู้ชายและผู้หญิง'], thai:['男性が使う「私」', 'ใช้โดยผู้ชาย'] },
    'words-2': { source:'私（女性）', text:'私', japanese:['男女共通', 'ใช้ได้ทั้งผู้ชายและผู้หญิง'], thai:['主に女性が使う「私」', 'ใช้โดยผู้หญิงเป็นหลัก'] },
    'words-4': { source:'これ・この', japanese:['これ：単独で使う ／ この：名詞の前', 'これ ใช้เดี่ยว ๆ ／ この ใช้หน้าคำนาม'] },
    'words-5': { source:'あれ・あの', japanese:['あれ：単独で使う ／ あの：名詞の前', 'あれ ใช้เดี่ยว ๆ ／ あの ใช้หน้าคำนาม'] },
    'words-14': { source:'欲しい・〜したい', japanese:['物が欲しい ／ 何かをしたい', 'อยากได้สิ่งของ ／ อยากทำบางอย่าง'] },
    'words-36': { source:'暑い・熱い', japanese:['暑い：気候 ／ 熱い：物の温度', '暑い ใช้กับอากาศ ／ 熱い ใช้กับสิ่งของ'] },
    'words-39': { source:'高い（値段）', text:'高い', japanese:['値段', 'ราคา'] },
    'words-73': { source:'高い（高さ）', text:'高い', japanese:['高さ', 'ความสูง'] },
    'words-74': { source:'低い（高さ）', text:'低い', japanese:['高さ', 'ความสูง'] },
    'words-79': { source:'止まる・止める', japanese:['止まる：動きが止まる ／ 止める：動きを止める', '止まる หยุดเคลื่อนไหว ／ 止める ทำให้หยุด'] },
    'words-101': { source:'持つ（手に持つ）', text:'持つ', japanese:['手に持つ', 'ถือไว้ในมือ'] },
    'words-105': { source:'開ける・つける', japanese:['ドアを開ける ／ 電気をつける', 'เปิดประตู ／ เปิดไฟ'] },
    'words-106': { source:'閉める・消す', japanese:['ドアを閉める ／ 電気を消す', 'ปิดประตู ／ ปิดไฟ'] },
    'words-107': { source:'押す（物を動かす）', text:'押す', japanese:['物を押して動かす', 'ผลักสิ่งของให้เคลื่อนที่'] },
    'words-109': { source:'押す（ボタンなど）', text:'押す', japanese:['ボタンを押す', 'กดปุ่ม'] },
    'words-116': { source:'個・点（部品など）', text:'個 ／ 点', japanese:['物・部品を数える', 'นับสิ่งของหรือชิ้นส่วน'] },
    'words-143': { source:'測る（長さなど）', text:'測る', japanese:['長さなどを測る', 'วัดความยาว เป็นต้น'] },
    'words-144': { source:'量る（重さ）', text:'量る', japanese:['重さを量る', 'ชั่งน้ำหนัก'] },
    'words-169': { source:'音・声', japanese:['音：一般の音 ／ 声：人などの声', '音 เสียงทั่วไป ／ 声 เสียงพูดหรือเสียงร้อง'] },
    'words-174': { source:'時間', japanese:['時間全般', 'เวลาโดยทั่วไป'] },
    'words-187': { source:'心配する（人を気遣う）', text:'心配する', japanese:['人を気遣う', 'ห่วงใยผู้อื่น'] },
    'words-191': { source:'ドライバー（工具）', text:'ドライバー', japanese:['ねじを回す工具', 'เครื่องมือขันสกรู'] },
    'words-193': { source:'ペンチ・挟む工具', text:'ペンチ', japanese:['挟む工具', 'เครื่องมือคีบจับ'] },
    'words-269': { source:'月（1か月の月）', text:'月', japanese:['月という期間', 'เดือนที่เป็นช่วงเวลา'] },
    'words-277': { source:'時間（長さの単位）', text:'時間', japanese:['1時間・2時間の単位', 'หน่วยชั่วโมง'] },
    'words-301': { source:'速い・早い', japanese:['速い：速度 ／ 早い：時刻', '速い ความเร็ว ／ 早い เวลาที่เร็วกว่าปกติ'] },
    'words-305': { source:'数', text:'数', japanese:['個数・人数など', 'จำนวนสิ่งของหรือคน'] },
    'words-307': { source:'回（回数）', text:'回', japanese:['回数を数える', 'นับจำนวนครั้ง'] },
    'words-308': { source:'周・回（繰り返す一巡）', text:'周 ／ 回', japanese:['一巡した回数', 'นับจำนวนรอบ'] },
    'words-333': { source:'日・1日という期間', text:'日 ／ 1日', japanese:['期間を表す日', 'วันในความหมายของช่วงเวลา'] },
    'words-334': { source:'日付・〜日（日にち）', text:'日付 ／ 〜日', japanese:['日付。1日＝ついたち、2日＝ふつかなど特別な読みあり', 'วันที่ เช่น 1日 อ่าน ついたち、2日 อ่าน ふつか'] },
    'words-367': { source:'どんぶり・深い器', text:'どんぶり', japanese:['深い器', 'ภาชนะก้นลึก'] },
    'words-383': { source:'座る・乗る（乗客として）', text:'座る ／ 乗る', japanese:['椅子に座る ／ 乗り物に乗る', 'นั่งเก้าอี้ ／ โดยสารยานพาหนะ'] },
    'words-396': { source:'交差点（四つ角）', text:'交差点', japanese:['四つ角', 'ทางแยกสี่ทาง'] },
    'basics-509': { source:'私の名前は…です（男性）', text:'私の名前は…です', japanese:['男女共通', 'ใช้ได้ทั้งผู้ชายและผู้หญิง'], thai:['男性が使う言い方', 'ใช้โดยผู้ชาย'] },
    'basics-510': { source:'私の名前は…です（女性）', text:'私の名前は…です', japanese:['男女共通', 'ใช้ได้ทั้งผู้ชายและผู้หญิง'], thai:['主に女性が使う言い方', 'ใช้โดยผู้หญิงเป็นหลัก'] }
  };
  // These are actual alternatives, not explanatory text after a middle dot.
  const alternatives = {
    'words-4':'これ・この', 'words-5':'あれ・あの', 'words-14':'欲しい・〜したい',
    'words-20':'働く・仕事する', 'words-36':'暑い・熱い', 'words-57':'いくら・どれくらい',
    'words-67':'中・内側', 'words-68':'外・外側', 'words-69':'上へ・上がる',
    'words-70':'下へ・下がる', 'words-72':'そこ・あそこ', 'words-75':'動かす・ずらす',
    'words-79':'止まる・止める', 'words-81':'終わる・完了する', 'words-83':'確認する・点検する',
    'words-87':'交換する・変える', 'words-89':'返信する・答える', 'words-104':'出る・外へ',
    'words-105':'開ける・つける', 'words-106':'閉める・消す', 'words-115':'工具・道具',
    'words-116':'個・点（部品など）', 'words-117':'足りる・十分', 'words-121':'予定・計画',
    'words-124':'知らせる・言う', 'words-125':'話す・おしゃべりする', 'words-128':'約・およそ',
    'words-129':'遅い・ゆっくり', 'words-137':'きつい・固く締まった', 'words-141':'きれい・清潔',
    'words-145':'足す・補充する', 'words-149':'壊れた・故障した', 'words-152':'数値・値',
    'words-156':'目を覚ます・起きる', 'words-161':'先に・〜の前に', 'words-164':'同時に・一緒に',
    'words-166':'する・作る', 'words-169':'音・声', 'words-170':'奇妙な・いつもと違う',
    'words-171':'揺れる・振動する', 'words-175':'いくつ・何〜', 'words-176':'言葉・単語',
    'words-177':'入力する・タイプする', 'words-179':'見える・目に入る', 'words-183':'なくなる・尽きる',
    'words-188':'必要とする・求める', 'words-192':'スパナ・レンチ', 'words-200':'取り付ける・設置する',
    'words-206':'片付ける・保管する', 'words-212':'側・面', 'words-213':'印・マーク',
    'words-216':'勧める・紹介する', 'words-219':'初めて・1回目', 'words-220':'位置情報・場所',
    'words-229':'机・テーブル', 'words-230':'戸棚・キャビネット', 'words-233':'離れた・間隔がある',
    'words-234':'空ける・間を置く', 'words-235':'〜の物・物', 'words-236':'歌・曲',
    'words-241':'よく・頻繁に', 'words-257':'正午・昼の12時', 'words-260':'午前0時・真夜中',
    'words-279':'30分・半時間', 'words-284':'早い時刻・朝早い', 'words-285':'遅刻する・定刻より遅い',
    'words-286':'上側・上の方', 'words-287':'下側・下の方', 'words-293':'隣・横',
    'words-294':'向かい側・反対側', 'words-300':'角・隅', 'words-301':'速い・早い',
    'words-304':'半分・半〜', 'words-308':'周・回（繰り返す一巡）', 'words-309':'毎〜・すべての〜',
    'words-310':'いっぱい・満杯', 'words-312':'内側・奥の方', 'words-314':'そちら・あちらの方向',
    'words-333':'日・1日という期間', 'words-334':'日付・〜日（日にち）', 'words-343':'床・地面',
    'words-346':'階段・はしご', 'words-350':'電話・電話機', 'words-354':'ノート・帳面',
    'words-357':'車・車両', 'words-364':'飲食店・レストラン', 'words-368':'コップ・グラス',
    'words-372':'瓶・ボトル', 'words-373':'牛乳・ミルク', 'words-377':'塩辛い・しょっぱい',
    'words-380':'注文する・指示する', 'words-383':'座る・乗る（乗客として）', 'words-387':'列車・鉄道',
    'words-392':'切符・チケット', 'words-394':'駐車場・駐車スペース', 'words-399':'渡る・横切る',
    'words-400':'帰る・戻る', 'basics-503':'すみません・ごめんなさい', 'basics-504':'大丈夫です・気にしないで',
    'chat-563':'そうだね・そうです', 'chat-564':'いいよ・大丈夫', 'chat-570':'会いたい・恋しい',
    'directions-847':'中・内側', 'directions-848':'外・外側', 'directions-850':'そこ・あそこ'
  };
  function sourceJapanese(item) {
    const text = String(item?.ja || '');
    const lines = text.split('\n');
    return item?.type === 'basics' && lines.length > 1 ? lines.slice(1).join('\n') : text;
  }
  function displayFor(item) {
    const value = display[item?.id];
    return value && value.source === sourceJapanese(item) ? value : null;
  }
  function japaneseText(item) {
    const text = sourceJapanese(item);
    const reviewed = displayFor(item);
    if (reviewed?.text) return reviewed.text;
    return alternatives[item?.id] === text ? text.replace(/・/gu, ' ／ ') : text;
  }
  function context(item, language = 'ja', side = 'japanese') {
    if (side !== 'japanese' && side !== 'thai') return '';
    return displayFor(item)?.[side]?.[language === 'th' ? 1 : 0] || '';
  }
  function selectedWork(profile) {
    return (profile?.workCourse === 'service' ? service : work).slice();
  }
  function types(profile) {
    return [...common.map(row => row.slice()), selectedWork(profile)];
  }
  function project(items, profile) {
    const gender = profile?.gender;
    return items.map(item => {
      if (item.type !== 'service' || !['male', 'female'].includes(gender)) return item;
      const variant = item.variants?.[gender];
      if (!variant || !['th', 'thRoman', 'thKana'].every(key => typeof variant[key] === 'string')) return item;
      return { ...item, th: variant.th, thRoman: variant.thRoman, thKana: variant.thKana };
    });
  }
  function normalizedKey(value) {
    return String(value || '').normalize('NFKC').replace(/[\s。、．.!！?？]/gu, '');
  }
  function japaneseKey(item, language) {
    const text = normalizedKey(japaneseText(item));
    return text ? text + '\u001f' + normalizedKey(context(item, language, 'japanese')) : '';
  }
  function answerKey(item, language) {
    return language === 'th' ? japaneseKey(item, language) : normalizedKey(item.th);
  }
  function makeQuestion(pool, language, random = Math.random) {
    const seen = new Set(), prompts = new Set();
    const unique = pool.filter(item => {
      const key = answerKey(item, language);
      if (!key || seen.has(key)) return false;
      // In the Japanese UI a single Japanese prompt must not offer two valid
      // Thai answers, e.g. 私 -> ผม / ฉัน. Keep one representative in the pool.
      const prompt = language === 'ja' ? japaneseKey(item, language) : '';
      if (language === 'ja' && (!prompt || prompts.has(prompt))) return false;
      if (prompt) prompts.add(prompt);
      seen.add(key); return true;
    });
    if (unique.length < 4) return null;
    for (let i = unique.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [unique[i], unique[j]] = [unique[j], unique[i]];
    }
    const options = unique.slice(0, 4);
    return { correct: options[Math.floor(random() * options.length)], options };
  }
  function shuffled(input, random) {
    const result = input.slice();
    for (let i = result.length - 1; i > 0; i--) {
      const draw = Number(random());
      const unit = Number.isFinite(draw) ? Math.max(0, Math.min(draw, 0.999999999999)) : 0;
      const j = Math.floor(unit * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  function questionTerms(item, side) {
    const value = side === 'japanese' ? japaneseText(item) : item.th;
    return String(value || '').split(/[／/]/u).map(normalizedKey).filter(Boolean);
  }
  function questionConflict(first, second, language) {
    if (first.id === second.id || answerKey(first, language) === answerKey(second, language)) return true;
    const thaiFirst = questionTerms(first, 'thai'), thaiSecond = questionTerms(second, 'thai');
    if (thaiFirst.some(value => thaiSecond.includes(value))) return true;
    const jpFirst = questionTerms(first, 'japanese'), jpSecond = questionTerms(second, 'japanese');
    if (!jpFirst.some(value => jpSecond.includes(value))) return false;
    // Reviewed sense labels distinguish e.g. 高い (price/height). Alternatives
    // remain equivalent to their constituent terms even when a note explains
    // the distinction between the alternatives.
    const a = normalizedKey(context(first, language, 'japanese'));
    const b = normalizedKey(context(second, language, 'japanese'));
    return jpFirst.length > 1 || jpSecond.length > 1 || !a || !b || a === b;
  }
  function makeQuestionFor(pool, correctItem, language, random = Math.random) {
    if (!Array.isArray(pool) || !['ja', 'th'].includes(language)) return null;
    const id = typeof correctItem === 'string' ? correctItem : correctItem?.id;
    const correct = pool.find(item => item?.id === id);
    if (!correct || !normalizedKey(japaneseText(correct)) || !normalizedKey(correct.th)) return null;
    const candidates = pool.filter(item => item && typeof item.id === 'string' &&
      normalizedKey(japaneseText(item)) && normalizedKey(item.th) && !questionConflict(correct, item, language));
    if (candidates.length < 3) return null;
    const selected = [correct];
    for (const candidate of shuffled(candidates, random)) {
      if (selected.every(item => !questionConflict(item, candidate, language))) selected.push(candidate);
      if (selected.length === 4) break;
    }
    if (selected.length !== 4) return null;
    return {
      correct,
      options: shuffled(selected, random),
      // A Japanese word such as 私 is gender-neutral. The qualifier describes
      // the Thai answer being requested, never the Japanese word itself.
      promptContext: language === 'ja' ? context(correct, 'ja', 'thai') : ''
    };
  }
  root.ThaiNaviCourses = { selectedWork, types, scenes, project, japaneseText, context, makeQuestion, makeQuestionFor };
})(typeof window !== 'undefined' ? window : globalThis);
