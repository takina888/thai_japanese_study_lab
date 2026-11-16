(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else if (typeof define === 'function' && define.amd) define([], factory);
  else root.ThaiNaviThaiWordContent = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const categories = [
    {id:'food',ja:'食べ物・飲み物',th:'อาหารและเครื่องดื่ม'},
    {id:'fruit',ja:'果物・木の実',th:'ผลไม้และถั่วเปลือกแข็ง'},
    {id:'vegetables',ja:'野菜',th:'ผัก'},
    {id:'animals-familiar',ja:'身近な動物',th:'สัตว์ใกล้ตัว'},
    {id:'animals-more',ja:'いろいろな動物',th:'สัตว์อื่น ๆ'},
    {id:'body',ja:'からだ',th:'ร่างกาย'},
    {id:'clothing',ja:'服・持ち物',th:'เสื้อผ้าและของใช้'},
    {id:'home',ja:'家の中',th:'บ้านและของใช้'},
    {id:'nature',ja:'自然',th:'ธรรมชาติ'},
    {id:'transport',ja:'乗り物・まち',th:'ยานพาหนะและเมือง'}
  ];

  const words = [
    {id:'thai-word-001',category:'food',th:'ปลา',ja:'魚',japaneseReading:'プラー',roman:'plaa',emoji:'🐟',speechText:'ปลา'},
    {id:'thai-word-002',category:'food',th:'ข้าว',ja:'ご飯',japaneseReading:'カーオ',roman:'khâao',emoji:'🍚',speechText:'ข้าว'},
    {id:'thai-word-003',category:'food',th:'ข้าวปั้น',ja:'おにぎり',japaneseReading:'カーオ・パン',roman:'khâao pân',emoji:'🍙',speechText:'ข้าวปั้น'},
    {id:'thai-word-004',category:'food',th:'ซูชิ',ja:'寿司',japaneseReading:'スー・チ',roman:'suu chí',emoji:'🍣',speechText:'ซูชิ'},
    {id:'thai-word-005',category:'food',th:'ขนมปัง',ja:'パン',japaneseReading:'カ・ノム・パン',roman:'khà nǒm paŋ',emoji:'🍞',speechText:'ขนมปัง'},
    {id:'thai-word-006',category:'food',th:'ข้าวกล่อง',ja:'弁当',japaneseReading:'カーオ・クロン',roman:'khâao klɔ̀ŋ',emoji:'🍱',speechText:'ข้าวกล่อง'},
    {id:'thai-word-007',category:'food',th:'ไข่',ja:'卵',japaneseReading:'カイ',roman:'khài',emoji:'🥚',speechText:'ไข่'},
    {id:'thai-word-008',category:'food',th:'เนื้อ',ja:'肉',japaneseReading:'ヌア',roman:'nɯ́a',emoji:'🥩',speechText:'เนื้อ'},
    {id:'thai-word-009',category:'food',th:'ชา',ja:'お茶',japaneseReading:'チャー',roman:'chaa',emoji:'🍵',speechText:'ชา'},
    {id:'thai-word-010',category:'food',th:'น้ำ',ja:'水',japaneseReading:'ナーム',roman:'náam',emoji:'💧',speechText:'น้ำ'},

    {id:'thai-word-011',category:'fruit',th:'แอปเปิล',ja:'りんご',japaneseReading:'エップ・プン',roman:'ɛ́p pə̂n',emoji:'🍎',speechText:'แอปเปิล'},
    {id:'thai-word-012',category:'fruit',th:'ส้ม',ja:'みかん',japaneseReading:'ソム',roman:'sôm',emoji:'🍊',speechText:'ส้ม'},
    {id:'thai-word-013',category:'fruit',th:'กล้วย',ja:'バナナ',japaneseReading:'クルアイ',roman:'klûai',emoji:'🍌',speechText:'กล้วย'},
    {id:'thai-word-014',category:'fruit',th:'พีช',ja:'桃',japaneseReading:'ピート',roman:'phíit',emoji:'🍑',speechText:'พีช'},
    {id:'thai-word-015',category:'fruit',th:'องุ่น',ja:'ぶどう',japaneseReading:'ア・ングン',roman:'à ŋùn',emoji:'🍇',speechText:'องุ่น'},
    {id:'thai-word-016',category:'fruit',th:'เกาลัด',ja:'栗',japaneseReading:'カオ・ラット',roman:'kao lát',emoji:'🌰',speechText:'เกาลัด'},
    {id:'thai-word-017',category:'fruit',th:'แตงโม',ja:'すいか',japaneseReading:'テーン・モー',roman:'tɛɛŋ moo',emoji:'🍉',speechText:'แตงโม'},
    {id:'thai-word-018',category:'fruit',th:'มะม่วง',ja:'マンゴー',japaneseReading:'マ・ムアン',roman:'má mûaŋ',emoji:'🥭',speechText:'มะม่วง'},

    {id:'thai-word-019',category:'vegetables',th:'แคร์รอต',ja:'にんじん',japaneseReading:'ケー・ロット',roman:'khɛɛ rɔ̀t',emoji:'🥕',speechText:'แคร์รอต'},
    {id:'thai-word-020',category:'vegetables',th:'มันฝรั่ง',ja:'じゃがいも',japaneseReading:'マン・ファ・ラン',roman:'man fà ràŋ',emoji:'🥔',speechText:'มันฝรั่ง'},
    {id:'thai-word-021',category:'vegetables',th:'มันเทศ',ja:'さつまいも',japaneseReading:'マン・テート',roman:'man thêet',emoji:'🍠',speechText:'มันเทศ'},
    {id:'thai-word-022',category:'vegetables',th:'มะเขือ',ja:'なす',japaneseReading:'マ・クア',roman:'má khɯ̌a',emoji:'🍆',speechText:'มะเขือ'},
    {id:'thai-word-023',category:'vegetables',th:'แตงกวา',ja:'きゅうり',japaneseReading:'テーン・クワー',roman:'tɛɛŋ kwaa',emoji:'🥒',speechText:'แตงกวา'},
    {id:'thai-word-024',category:'vegetables',th:'ฟักทอง',ja:'かぼちゃ',japaneseReading:'ファック・トーン',roman:'fák thɔɔŋ',emoji:'🎃',speechText:'ฟักทอง'},
    {id:'thai-word-025',category:'vegetables',th:'หอมใหญ่',ja:'玉ねぎ',japaneseReading:'ホーム・ヤイ',roman:'hɔ̌ɔm yài',emoji:'🧅',speechText:'หอมใหญ่'},
    {id:'thai-word-026',category:'vegetables',th:'กระเทียม',ja:'にんにく',japaneseReading:'クラ・ティアム',roman:'krà thiam',emoji:'🧄',speechText:'กระเทียม'},
    {id:'thai-word-027',category:'vegetables',th:'เห็ด',ja:'きのこ',japaneseReading:'ヘット',roman:'hèt',emoji:'🍄',speechText:'เห็ด'},
    {id:'thai-word-028',category:'vegetables',th:'ถั่ว',ja:'豆',japaneseReading:'トゥア',roman:'thùa',emoji:'🫘',speechText:'ถั่ว'},

    {id:'thai-word-029',category:'animals-familiar',th:'หมา',ja:'犬',japaneseReading:'マー',roman:'mǎa',emoji:'🐕',speechText:'หมา'},
    {id:'thai-word-030',category:'animals-familiar',th:'แมว',ja:'猫',japaneseReading:'メーオ',roman:'mɛɛo',emoji:'🐈',speechText:'แมว'},
    {id:'thai-word-031',category:'animals-familiar',th:'กระต่าย',ja:'うさぎ',japaneseReading:'クラ・ターイ',roman:'krà tàai',emoji:'🐇',speechText:'กระต่าย'},
    {id:'thai-word-032',category:'animals-familiar',th:'หนู',ja:'ねずみ',japaneseReading:'ヌー',roman:'nǔu',emoji:'🐁',speechText:'หนู'},
    {id:'thai-word-033',category:'animals-familiar',th:'วัว',ja:'牛',japaneseReading:'ウア',roman:'wua',emoji:'🐄',speechText:'วัว'},
    {id:'thai-word-034',category:'animals-familiar',th:'หมู',ja:'豚',japaneseReading:'ムー',roman:'mǔu',emoji:'🐖',speechText:'หมู'},
    {id:'thai-word-035',category:'animals-familiar',th:'ม้า',ja:'馬',japaneseReading:'マー',roman:'máa',emoji:'🐎',speechText:'ม้า'},
    {id:'thai-word-036',category:'animals-familiar',th:'แกะ',ja:'羊',japaneseReading:'ケ',roman:'kɛ̀',emoji:'🐑',speechText:'แกะ'},
    {id:'thai-word-037',category:'animals-familiar',th:'นก',ja:'鳥',japaneseReading:'ノック',roman:'nók',emoji:'🐦',speechText:'นก'},
    {id:'thai-word-038',category:'animals-familiar',th:'ลูกไก่',ja:'ひよこ',japaneseReading:'ルーク・カイ',roman:'lûuk kài',emoji:'🐤',speechText:'ลูกไก่'},

    {id:'thai-word-039',category:'animals-more',th:'กุ้ง',ja:'えび',japaneseReading:'クン',roman:'kûŋ',emoji:'🦐',speechText:'กุ้ง'},
    {id:'thai-word-040',category:'animals-more',th:'เต่า',ja:'亀',japaneseReading:'タオ',roman:'tào',emoji:'🐢',speechText:'เต่า'},
    {id:'thai-word-041',category:'animals-more',th:'กบ',ja:'蛙',japaneseReading:'コップ',roman:'kòp',emoji:'🐸',speechText:'กบ'},
    {id:'thai-word-042',category:'animals-more',th:'งู',ja:'蛇',japaneseReading:'ングー',roman:'ŋuu',emoji:'🐍',speechText:'งู'},
    {id:'thai-word-043',category:'animals-more',th:'ช้าง',ja:'象',japaneseReading:'チャーン',roman:'cháaŋ',emoji:'🐘',speechText:'ช้าง'},
    {id:'thai-word-044',category:'animals-more',th:'ลิง',ja:'猿',japaneseReading:'リン',roman:'liŋ',emoji:'🐒',speechText:'ลิง'},
    {id:'thai-word-045',category:'animals-more',th:'เสือ',ja:'虎',japaneseReading:'スア',roman:'sɯ̌a',emoji:'🐅',speechText:'เสือ'},
    {id:'thai-word-046',category:'animals-more',th:'หมี',ja:'熊',japaneseReading:'ミー',roman:'mǐi',emoji:'🐻',speechText:'หมี'},
    {id:'thai-word-047',category:'animals-more',th:'หมึกสาย',ja:'たこ',japaneseReading:'ムック・サーイ',roman:'mɯ̀k sǎai',emoji:'🐙',speechText:'หมึกสาย'},
    {id:'thai-word-048',category:'animals-more',th:'ปู',ja:'蟹',japaneseReading:'プー',roman:'puu',emoji:'🦀',speechText:'ปู'},

    {id:'thai-word-049',category:'body',th:'ตา',ja:'目',japaneseReading:'ター',roman:'taa',emoji:'👁️',speechText:'ตา'},
    {id:'thai-word-050',category:'body',th:'หู',ja:'耳',japaneseReading:'フー',roman:'hǔu',emoji:'👂',speechText:'หู'},
    {id:'thai-word-051',category:'body',th:'จมูก',ja:'鼻',japaneseReading:'チャ・ムーク',roman:'cà mùuk',emoji:'👃',speechText:'จมูก'},
    {id:'thai-word-052',category:'body',th:'ปาก',ja:'口',japaneseReading:'パーク',roman:'pàak',emoji:'👄',speechText:'ปาก'},
    {id:'thai-word-053',category:'body',th:'ลิ้น',ja:'舌',japaneseReading:'リン',roman:'lín',emoji:'👅',speechText:'ลิ้น'},
    {id:'thai-word-054',category:'body',th:'ฟัน',ja:'歯',japaneseReading:'ファン',roman:'fan',emoji:'🦷',speechText:'ฟัน'},
    {id:'thai-word-055',category:'body',th:'มือ',ja:'手',japaneseReading:'ムー',roman:'mɯɯ',emoji:'✋',speechText:'มือ'},
    {id:'thai-word-056',category:'body',th:'เท้า',ja:'足',japaneseReading:'ターオ',roman:'tháao',emoji:'🦶',speechText:'เท้า'},
    {id:'thai-word-057',category:'body',th:'กระดูก',ja:'骨',japaneseReading:'クラ・ドゥーク',roman:'krà dùuk',emoji:'🦴',speechText:'กระดูก'},
    {id:'thai-word-058',category:'body',th:'หัวใจ',ja:'心臓',japaneseReading:'フア・チャイ',roman:'hǔa cai',emoji:'🫀',speechText:'หัวใจ'},

    {id:'thai-word-059',category:'clothing',th:'รองเท้า',ja:'靴',japaneseReading:'ローン・ターオ',roman:'rɔɔŋ tháao',emoji:'👞',speechText:'รองเท้า'},
    {id:'thai-word-060',category:'clothing',th:'ถุงเท้า',ja:'靴下',japaneseReading:'トゥン・ターオ',roman:'thǔŋ tháao',emoji:'🧦',speechText:'ถุงเท้า'},
    {id:'thai-word-061',category:'clothing',th:'หมวก',ja:'帽子',japaneseReading:'ムアック',roman:'mùak',emoji:'👒',speechText:'หมวก'},
    {id:'thai-word-062',category:'clothing',th:'แว่นตา',ja:'眼鏡',japaneseReading:'ウェン・ター',roman:'wɛ̂n taa',emoji:'👓',speechText:'แว่นตา'},
    {id:'thai-word-063',category:'clothing',th:'ถุงมือ',ja:'手袋',japaneseReading:'トゥン・ムー',roman:'thǔŋ mɯɯ',emoji:'🧤',speechText:'ถุงมือ'},
    {id:'thai-word-064',category:'clothing',th:'กระเป๋า',ja:'鞄',japaneseReading:'クラ・パオ',roman:'krà pǎo',emoji:'👜',speechText:'กระเป๋า'},
    {id:'thai-word-065',category:'clothing',th:'แหวน',ja:'指輪',japaneseReading:'ウェーン',roman:'wɛ̌ɛn',emoji:'💍',speechText:'แหวน'},
    {id:'thai-word-066',category:'clothing',th:'กางเกง',ja:'ズボン',japaneseReading:'カーン・ケーン',roman:'kaaŋ keeŋ',emoji:'👖',speechText:'กางเกง'},
    {id:'thai-word-067',category:'clothing',th:'ร่ม',ja:'傘',japaneseReading:'ロム',roman:'rôm',emoji:'☂️',speechText:'ร่ม'},
    {id:'thai-word-068',category:'clothing',th:'เสื้อผ้า',ja:'服',japaneseReading:'スア・パー',roman:'sɯ̂a phâa',emoji:'👕',speechText:'เสื้อผ้า'},

    {id:'thai-word-069',category:'home',th:'บ้าน',ja:'家',japaneseReading:'バーン',roman:'bâan',emoji:'🏠',speechText:'บ้าน'},
    {id:'thai-word-070',category:'home',th:'ประตู',ja:'扉',japaneseReading:'プラ・トゥー',roman:'prà tuu',emoji:'🚪',speechText:'ประตู'},
    {id:'thai-word-071',category:'home',th:'เก้าอี้',ja:'椅子',japaneseReading:'カオ・イー',roman:'kâo îi',emoji:'🪑',speechText:'เก้าอี้'},
    {id:'thai-word-072',category:'home',th:'กุญแจ',ja:'鍵',japaneseReading:'クン・チェー',roman:'kun cɛɛ',emoji:'🔑',speechText:'กุญแจ'},
    {id:'thai-word-073',category:'home',th:'นาฬิกา',ja:'時計',japaneseReading:'ナー・リ・カー',roman:'naa lí kaa',emoji:'🕒',speechText:'นาฬิกา'},
    {id:'thai-word-074',category:'home',th:'หนังสือ',ja:'本',japaneseReading:'ナン・スー',roman:'nǎŋ sɯ̌ɯ',emoji:'📖',speechText:'หนังสือ'},
    {id:'thai-word-075',category:'home',th:'ดินสอ',ja:'鉛筆',japaneseReading:'ディン・ソー',roman:'din sɔ̌ɔ',emoji:'✏️',speechText:'ดินสอ'},
    {id:'thai-word-076',category:'home',th:'กรรไกร',ja:'はさみ',japaneseReading:'カン・クライ',roman:'kan krai',emoji:'✂️',speechText:'กรรไกร'},
    {id:'thai-word-077',category:'home',th:'โทรศัพท์',ja:'電話',japaneseReading:'トー・ラ・サップ',roman:'thoo rá sàp',emoji:'☎️',speechText:'โทรศัพท์'},
    {id:'thai-word-078',category:'home',th:'สบู่',ja:'石けん',japaneseReading:'サ・ブー',roman:'sà bùu',emoji:'🧼',speechText:'สบู่'},
    {id:'thai-word-079',category:'home',th:'ซอง',ja:'封筒',japaneseReading:'ソーン',roman:'sɔɔŋ',emoji:'✉️',speechText:'ซอง'},

    {id:'thai-word-080',category:'nature',th:'ตะวัน',ja:'太陽',japaneseReading:'タ・ワン',roman:'tà wan',emoji:'☀️',speechText:'ตะวัน'},
    {id:'thai-word-081',category:'nature',th:'พระจันทร์',ja:'月',japaneseReading:'プラ・チャン',roman:'phrá can',emoji:'🌙',speechText:'พระจันทร์'},
    {id:'thai-word-082',category:'nature',th:'ดาว',ja:'星',japaneseReading:'ダーオ',roman:'daao',emoji:'⭐',speechText:'ดาว'},
    {id:'thai-word-083',category:'nature',th:'เมฆ',ja:'雲',japaneseReading:'メーク',roman:'mêek',emoji:'☁️',speechText:'เมฆ'},
    {id:'thai-word-084',category:'nature',th:'ฝน',ja:'雨',japaneseReading:'フォン',roman:'fǒn',emoji:'🌧️',speechText:'ฝน'},
    {id:'thai-word-085',category:'nature',th:'หิมะ',ja:'雪',japaneseReading:'ヒ・マ',roman:'hì má',emoji:'❄️',speechText:'หิมะ'},
    {id:'thai-word-086',category:'nature',th:'รุ้ง',ja:'虹',japaneseReading:'ルン',roman:'rúŋ',emoji:'🌈',speechText:'รุ้ง'},
    {id:'thai-word-087',category:'nature',th:'ภูเขา',ja:'山',japaneseReading:'プー・カオ',roman:'phuu khǎo',emoji:'⛰️',speechText:'ภูเขา'},
    {id:'thai-word-088',category:'nature',th:'ต้นไม้',ja:'木',japaneseReading:'トン・マーイ',roman:'tôn máai',emoji:'🌳',speechText:'ต้นไม้'},
    {id:'thai-word-089',category:'nature',th:'ใบไม้',ja:'葉っぱ',japaneseReading:'バイ・マーイ',roman:'bai máai',emoji:'🍃',speechText:'ใบไม้'},
    {id:'thai-word-090',category:'nature',th:'คลื่น',ja:'波',japaneseReading:'クルーン',roman:'khlɯ̂ɯn',emoji:'🌊',speechText:'คลื่น'},

    {id:'thai-word-091',category:'transport',th:'รถ',ja:'車',japaneseReading:'ロット',roman:'rót',emoji:'🚗',speechText:'รถ'},
    {id:'thai-word-092',category:'transport',th:'รถไฟ',ja:'列車',japaneseReading:'ロット・ファイ',roman:'rót fai',emoji:'🚆',speechText:'รถไฟ'},
    {id:'thai-word-093',category:'transport',th:'เครื่องบิน',ja:'飛行機',japaneseReading:'クルアン・ビン',roman:'khrɯ̂aŋ bin',emoji:'✈️',speechText:'เครื่องบิน'},
    {id:'thai-word-094',category:'transport',th:'เรือ',ja:'船',japaneseReading:'ルア',roman:'rɯa',emoji:'🚢',speechText:'เรือ'},
    {id:'thai-word-095',category:'transport',th:'จักรยาน',ja:'自転車',japaneseReading:'チャック・クラ・ヤーン',roman:'càk krà yaan',emoji:'🚲',speechText:'จักรยาน'},
    {id:'thai-word-096',category:'transport',th:'ถนน',ja:'道路',japaneseReading:'タ・ノン',roman:'thà nǒn',emoji:'🛣️',speechText:'ถนน'},
    {id:'thai-word-097',category:'transport',th:'สถานี',ja:'駅',japaneseReading:'サ・ター・ニー',roman:'sà thǎa nii',emoji:'🚉',speechText:'สถานี'},
    {id:'thai-word-098',category:'transport',th:'ร้าน',ja:'店',japaneseReading:'ラーン',roman:'ráan',emoji:'🏪',speechText:'ร้าน'},
    {id:'thai-word-099',category:'transport',th:'สะพาน',ja:'橋',japaneseReading:'サ・パーン',roman:'sà phaan',emoji:'🌉',speechText:'สะพาน'},
    {id:'thai-word-100',category:'transport',th:'โรงเรียน',ja:'学校',japaneseReading:'ローン・リアン',roman:'rooŋ rian',emoji:'🏫',speechText:'โรงเรียน'}
  ];

  const sources = [
    {title:'国際交流基金：まるごと入門・タイ語語彙インデックス',url:'https://marugoto.jpf.go.jp/assets/docs/download/starter_a/MarugotoStarterActivitiesVocabularyIndex2_TH.pdf'},
    {title:'東京外国語大学：日本語・タイ語の基礎語彙',url:'https://www.coelang.tufs.ac.jp/ja/th/vmod/'},
    {title:'小学館 プログレッシブ タイ語辞典：น้ำ',url:'https://kotobank.jp/thjaword/น้ำ'},
    {title:'小学館 プログレッシブ タイ語辞典：ไม้',url:'https://kotobank.jp/thjaword/ไม้'},
    {title:'小学館 プログレッシブ タイ語辞典：กล่อง',url:'https://kotobank.jp/thjaword/กล่อง'},
    {title:'小学館 プログレッシブ タイ語辞典：ซูชิ',url:'https://kotobank.jp/thjaword/ซูชิ'},
    {title:'小学館 プログレッシブ タイ語辞典：กรรไกร',url:'https://kotobank.jp/thjaword/กรรไกร'},
    {title:'小学館 プログレッシブ タイ語辞典：หอม',url:'https://kotobank.jp/thjaword/หอม'},
    {title:'小学館 プログレッシブ タイ語辞典：แว่น',url:'https://kotobank.jp/thjaword/แว่น'},
    {title:'小学館 プログレッシブ タイ語辞典：จันทร์',url:'https://kotobank.jp/thjaword/จันทร์'},
    {title:'チュラーロンコーン大学：タイ語の綴りと転写・借用語の声調',url:'https://www.arts.chula.ac.th/~ling/contents/File/อักขรวิธีไทย.pdf'},
    {title:'ラジャマンガラ工科大学タンヤブリ校：基礎語彙の読み書き教材',url:'https://www.repository.rmutt.ac.th/dspace/bitstream/123456789/4159/1/RMUTT-175286.pdf'},
    {title:'タイ農業局：แคร์รอต の表記',url:'https://www.doa.go.th/th/news_board/122032/'},
    {title:'ThaiPod101：基本語彙・พีช の発音',url:'https://www.thaipod101.com/lesson/the-800-core-words-and-phrases-38-core-words-how-to-say-australia-atlantic-ocean-and-more?lp=153'},
    {title:'タイ食品医薬品局：タコとイカの名称',url:'https://food.fda.moph.go.th/faqs/law-label-9-21/'}
  ];

  return {version:1,categories,words,sources};
});
