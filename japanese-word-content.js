(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else if (typeof define === 'function' && define.amd) define([], factory);
  else root.ThaiNaviJapaneseWordContent = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const categories = [
    {id:'food',ja:'食べ物・飲み物',th:'อาหารและเครื่องดื่ม'},
    {id:'fruit',ja:'果物・木の実',th:'ผลไม้และถั่วเปลือกแข็ง'},
    {id:'vegetables',ja:'野菜',th:'ผัก'},
    {id:'animals-familiar',ja:'身近な動物',th:'สัตว์ใกล้ตัว'},
    {id:'animals-more',ja:'いろいろな動物',th:'สัตว์อื่น ๆ'},
    {id:'body',ja:'からだ',th:'ร่างกาย'},
    {id:'clothing',ja:'身につけるもの',th:'เสื้อผ้าและของใช้'},
    {id:'home',ja:'家の中',th:'บ้านและของใช้'},
    {id:'nature',ja:'自然',th:'ธรรมชาติ'},
    {id:'transport',ja:'乗り物・まち',th:'ยานพาหนะและเมือง'}
  ];

  const words = [
    {id:'word-001',category:'food',ja:'さかな',th:'ปลา',emoji:'🐟',speechText:'さかな'},
    {id:'word-002',category:'food',ja:'ごはん',th:'ข้าวสวย',emoji:'🍚',speechText:'ご飯'},
    {id:'word-003',category:'food',ja:'おにぎり',th:'ข้าวปั้น',emoji:'🍙',speechText:'おにぎり'},
    {id:'word-004',category:'food',ja:'すし',th:'ซูชิ',emoji:'🍣',speechText:'寿司'},
    {id:'word-005',category:'food',ja:'だんご',th:'ขนมดังโงะ',emoji:'🍡',speechText:'団子'},
    {id:'word-006',category:'food',ja:'おべんとう',th:'ข้าวกล่อง',emoji:'🍱',speechText:'お弁当'},
    {id:'word-007',category:'food',ja:'たまご',th:'ไข่',emoji:'🥚',speechText:'卵'},
    {id:'word-008',category:'food',ja:'にく',th:'เนื้อสัตว์',emoji:'🥩',speechText:'肉'},
    {id:'word-009',category:'food',ja:'おちゃ',th:'ชา',emoji:'🍵',speechText:'お茶'},
    {id:'word-010',category:'food',ja:'みず',th:'น้ำ',emoji:'💧',speechText:'水'},

    {id:'word-011',category:'fruit',ja:'りんご',th:'แอปเปิล',emoji:'🍎',speechText:'りんご'},
    {id:'word-012',category:'fruit',ja:'みかん',th:'ส้ม',emoji:'🍊',speechText:'みかん'},
    {id:'word-013',category:'fruit',ja:'いちご',th:'สตรอว์เบอร์รี',emoji:'🍓',speechText:'いちご'},
    {id:'word-014',category:'fruit',ja:'もも',th:'ลูกพีช',emoji:'🍑',speechText:'桃'},
    {id:'word-015',category:'fruit',ja:'ぶどう',th:'องุ่น',emoji:'🍇',speechText:'ぶどう'},
    {id:'word-016',category:'fruit',ja:'くり',th:'เกาลัด',emoji:'🌰',speechText:'栗'},
    {id:'word-017',category:'fruit',ja:'すいか',th:'แตงโม',emoji:'🍉',speechText:'すいか'},
    {id:'word-018',category:'fruit',ja:'さくらんぼ',th:'เชอร์รี',emoji:'🍒',speechText:'さくらんぼ'},

    {id:'word-019',category:'vegetables',ja:'にんじん',th:'แครอต',emoji:'🥕',speechText:'にんじん'},
    {id:'word-020',category:'vegetables',ja:'じゃがいも',th:'มันฝรั่ง',emoji:'🥔',speechText:'じゃがいも'},
    {id:'word-021',category:'vegetables',ja:'さつまいも',th:'มันเทศ',emoji:'🍠',speechText:'さつまいも'},
    {id:'word-022',category:'vegetables',ja:'なす',th:'มะเขือม่วง',emoji:'🍆',speechText:'なす'},
    {id:'word-023',category:'vegetables',ja:'きゅうり',th:'แตงกวา',emoji:'🥒',speechText:'きゅうり'},
    {id:'word-024',category:'vegetables',ja:'かぼちゃ',th:'ฟักทอง',emoji:'🎃',speechText:'かぼちゃ'},
    {id:'word-025',category:'vegetables',ja:'たまねぎ',th:'หอมหัวใหญ่',emoji:'🧅',speechText:'玉ねぎ'},
    {id:'word-026',category:'vegetables',ja:'にんにく',th:'กระเทียม',emoji:'🧄',speechText:'にんにく'},
    {id:'word-027',category:'vegetables',ja:'きのこ',th:'เห็ด',emoji:'🍄',speechText:'きのこ'},
    {id:'word-028',category:'vegetables',ja:'まめ',th:'ถั่ว',emoji:'🫘',speechText:'豆'},

    {id:'word-029',category:'animals-familiar',ja:'いぬ',th:'สุนัข',emoji:'🐕',speechText:'犬'},
    {id:'word-030',category:'animals-familiar',ja:'ねこ',th:'แมว',emoji:'🐈',speechText:'猫'},
    {id:'word-031',category:'animals-familiar',ja:'うさぎ',th:'กระต่าย',emoji:'🐇',speechText:'うさぎ'},
    {id:'word-032',category:'animals-familiar',ja:'ねずみ',th:'หนู',emoji:'🐁',speechText:'ねずみ'},
    {id:'word-033',category:'animals-familiar',ja:'うし',th:'วัว',emoji:'🐄',speechText:'牛'},
    {id:'word-034',category:'animals-familiar',ja:'ぶた',th:'หมู',emoji:'🐖',speechText:'豚'},
    {id:'word-035',category:'animals-familiar',ja:'うま',th:'ม้า',emoji:'🐎',speechText:'馬'},
    {id:'word-036',category:'animals-familiar',ja:'ひつじ',th:'แกะ',emoji:'🐑',speechText:'羊'},
    {id:'word-037',category:'animals-familiar',ja:'とり',th:'นก',emoji:'🐦',speechText:'鳥'},
    {id:'word-038',category:'animals-familiar',ja:'ひよこ',th:'ลูกไก่',emoji:'🐤',speechText:'ひよこ'},

    {id:'word-039',category:'animals-more',ja:'えび',th:'กุ้ง',emoji:'🦐',speechText:'えび'},
    {id:'word-040',category:'animals-more',ja:'かめ',th:'เต่า',emoji:'🐢',speechText:'亀'},
    {id:'word-041',category:'animals-more',ja:'かえる',th:'กบ',emoji:'🐸',speechText:'蛙'},
    {id:'word-042',category:'animals-more',ja:'へび',th:'งู',emoji:'🐍',speechText:'へび'},
    {id:'word-043',category:'animals-more',ja:'ぞう',th:'ช้าง',emoji:'🐘',speechText:'象'},
    {id:'word-044',category:'animals-more',ja:'さる',th:'ลิง',emoji:'🐒',speechText:'猿'},
    {id:'word-045',category:'animals-more',ja:'とら',th:'เสือ',emoji:'🐅',speechText:'虎'},
    {id:'word-046',category:'animals-more',ja:'くま',th:'หมี',emoji:'🐻',speechText:'熊'},
    {id:'word-047',category:'animals-more',ja:'たこ',th:'หมึกสาย',emoji:'🐙',speechText:'たこ'},
    {id:'word-048',category:'animals-more',ja:'かに',th:'ปู',emoji:'🦀',speechText:'かに'},

    {id:'word-049',category:'body',ja:'め',th:'ตา',emoji:'👁️',speechText:'目'},
    {id:'word-050',category:'body',ja:'みみ',th:'หู',emoji:'👂',speechText:'耳'},
    {id:'word-051',category:'body',ja:'はな',th:'จมูก',emoji:'👃',speechText:'鼻'},
    {id:'word-052',category:'body',ja:'くち',th:'ปาก',emoji:'👄',speechText:'口'},
    {id:'word-053',category:'body',ja:'した',th:'ลิ้น',emoji:'👅',speechText:'舌'},
    {id:'word-054',category:'body',ja:'は',th:'ฟัน',emoji:'🦷',speechText:'歯'},
    {id:'word-055',category:'body',ja:'て',th:'มือ',emoji:'✋',speechText:'手'},
    {id:'word-056',category:'body',ja:'あし',th:'เท้า',emoji:'🦶',speechText:'足'},
    {id:'word-057',category:'body',ja:'ほね',th:'กระดูก',emoji:'🦴',speechText:'骨'},
    {id:'word-058',category:'body',ja:'しんぞう',th:'หัวใจ',emoji:'🫀',speechText:'心臓'},

    {id:'word-059',category:'clothing',ja:'くつ',th:'รองเท้า',emoji:'👞',speechText:'靴'},
    {id:'word-060',category:'clothing',ja:'くつした',th:'ถุงเท้า',emoji:'🧦',speechText:'靴下'},
    {id:'word-061',category:'clothing',ja:'ぼうし',th:'หมวก',emoji:'👒',speechText:'帽子'},
    {id:'word-062',category:'clothing',ja:'めがね',th:'แว่นตา',emoji:'👓',speechText:'めがね'},
    {id:'word-063',category:'clothing',ja:'てぶくろ',th:'ถุงมือ',emoji:'🧤',speechText:'手袋'},
    {id:'word-064',category:'clothing',ja:'かばん',th:'กระเป๋า',emoji:'👜',speechText:'かばん'},
    {id:'word-065',category:'clothing',ja:'ゆびわ',th:'แหวน',emoji:'💍',speechText:'指輪'},
    {id:'word-066',category:'clothing',ja:'さいふ',th:'กระเป๋าสตางค์',emoji:'👛',speechText:'財布'},
    {id:'word-067',category:'clothing',ja:'きもの',th:'ชุดกิโมโน',emoji:'👘',speechText:'着物'},
    {id:'word-068',category:'clothing',ja:'ふく',th:'เสื้อผ้า',emoji:'👕',speechText:'服'},

    {id:'word-069',category:'home',ja:'いえ',th:'บ้าน',emoji:'🏠',speechText:'いえ'},
    {id:'word-070',category:'home',ja:'とびら',th:'ประตู',emoji:'🚪',speechText:'扉'},
    {id:'word-071',category:'home',ja:'いす',th:'เก้าอี้',emoji:'🪑',speechText:'椅子'},
    {id:'word-072',category:'home',ja:'かぎ',th:'กุญแจ',emoji:'🔑',speechText:'鍵'},
    {id:'word-073',category:'home',ja:'とけい',th:'นาฬิกา',emoji:'🕒',speechText:'時計'},
    {id:'word-074',category:'home',ja:'ほん',th:'หนังสือ',emoji:'📖',speechText:'本'},
    {id:'word-075',category:'home',ja:'えんぴつ',th:'ดินสอ',emoji:'✏️',speechText:'鉛筆'},
    {id:'word-076',category:'home',ja:'はさみ',th:'กรรไกร',emoji:'✂️',speechText:'はさみ'},
    {id:'word-077',category:'home',ja:'でんわ',th:'โทรศัพท์',emoji:'☎️',speechText:'電話'},
    {id:'word-078',category:'home',ja:'せっけん',th:'สบู่',emoji:'🧼',speechText:'石けん'},
    {id:'word-079',category:'home',ja:'ふうとう',th:'ซองจดหมาย',emoji:'✉️',speechText:'封筒'},

    {id:'word-080',category:'nature',ja:'たいよう',th:'ดวงอาทิตย์',emoji:'☀️',speechText:'太陽'},
    {id:'word-081',category:'nature',ja:'つき',th:'ดวงจันทร์',emoji:'🌙',speechText:'月'},
    {id:'word-082',category:'nature',ja:'ほし',th:'ดาว',emoji:'⭐',speechText:'星'},
    {id:'word-083',category:'nature',ja:'くも',th:'เมฆ',emoji:'☁️',speechText:'雲'},
    {id:'word-084',category:'nature',ja:'あめ',th:'ฝน',emoji:'🌧️',speechText:'雨'},
    {id:'word-085',category:'nature',ja:'ゆき',th:'หิมะ',emoji:'❄️',speechText:'雪'},
    {id:'word-086',category:'nature',ja:'にじ',th:'รุ้ง',emoji:'🌈',speechText:'虹'},
    {id:'word-087',category:'nature',ja:'やま',th:'ภูเขา',emoji:'⛰️',speechText:'山'},
    {id:'word-088',category:'nature',ja:'き',th:'ต้นไม้',emoji:'🌳',speechText:'木'},
    {id:'word-089',category:'nature',ja:'はっぱ',th:'ใบไม้',emoji:'🍃',speechText:'葉っぱ'},
    {id:'word-090',category:'nature',ja:'なみ',th:'คลื่น',emoji:'🌊',speechText:'波'},

    {id:'word-091',category:'transport',ja:'くるま',th:'รถยนต์',emoji:'🚗',speechText:'車'},
    {id:'word-092',category:'transport',ja:'でんしゃ',th:'รถไฟฟ้า',emoji:'🚆',speechText:'電車'},
    {id:'word-093',category:'transport',ja:'ひこうき',th:'เครื่องบิน',emoji:'✈️',speechText:'飛行機'},
    {id:'word-094',category:'transport',ja:'ふね',th:'เรือ',emoji:'🚢',speechText:'船'},
    {id:'word-095',category:'transport',ja:'じてんしゃ',th:'จักรยาน',emoji:'🚲',speechText:'自転車'},
    {id:'word-096',category:'transport',ja:'みち',th:'ถนน',emoji:'🛣️',speechText:'みち'},
    {id:'word-097',category:'transport',ja:'えき',th:'สถานีรถไฟ',emoji:'🚉',speechText:'駅'},
    {id:'word-098',category:'transport',ja:'みせ',th:'ร้านค้า',emoji:'🏪',speechText:'みせ'},
    {id:'word-099',category:'transport',ja:'しんごう',th:'สัญญาณไฟจราจร',emoji:'🚦',speechText:'信号'},
    {id:'word-100',category:'transport',ja:'びょういん',th:'โรงพยาบาล',emoji:'🏥',speechText:'病院'}
  ];

  const sources = [
    {title:'国際交流基金：まるごと入門・タイ語語彙インデックス',url:'https://marugoto.jpf.go.jp/assets/docs/download/starter_a/MarugotoStarterActivitiesVocabularyIndex2_TH.pdf'},
    {title:'国際交流基金：まるごと初級2・タイ語語彙インデックス',url:'https://marugoto.jpf.go.jp/assets/docs/download/elementary2_a/MarugotoElementary2ActivitiesVocabularyIndex2_TH.pdf'},
    {title:'東京外国語大学：日本語・タイ語の基礎語彙',url:'https://www.coelang.tufs.ac.jp/ja/th/vmod/'},
    {title:'JNTO：だんごのタイ語表記',url:'https://www.japan.travel/th/destinations/tohoku/iwate/hiraizumi-area/'},
    {title:'GO TOKYO：栗のタイ語表記',url:'https://www.gotokyo.org/th/spot/ev010/index.html'},
    {title:'タイ食品医薬品局：タコとイカの名称',url:'https://food.fda.moph.go.th/faqs/law-label-9-21/'}
  ];

  return {categories,words,sources};
});
