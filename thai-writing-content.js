(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else if (typeof define === 'function' && define.amd) define([], factory);
  else root.ThaiNaviThaiWritingContent = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const consonants = [
    {id:'ก',type:'consonant',group:'consonants-01',order:1,glyph:'ก',thaiName:'ก ไก่',speechText:'กอ ไก่',japaneseReading:'コー・カイ',roman:'kɔɔ kài',meaningJa:'にわとり',obsolete:false,noteJa:''},
    {id:'ข',type:'consonant',group:'consonants-01',order:2,glyph:'ข',thaiName:'ข ไข่',speechText:'ขอ ไข่',japaneseReading:'コー・カイ',roman:'khɔ̌ɔ khài',meaningJa:'卵',obsolete:false,noteJa:''},
    {id:'ฃ',type:'consonant',group:'consonants-01',order:3,glyph:'ฃ',thaiName:'ฃ ขวด',speechText:'ขอ ขวด',japaneseReading:'コー・クアット',roman:'khɔ̌ɔ khùat',meaningJa:'びん',obsolete:true,noteJa:'現在は通常使いません。'},
    {id:'ค',type:'consonant',group:'consonants-01',order:4,glyph:'ค',thaiName:'ค ควาย',speechText:'คอ ควาย',japaneseReading:'コー・クワーイ',roman:'khɔɔ khwaai',meaningJa:'水牛',obsolete:false,noteJa:''},
    {id:'ฅ',type:'consonant',group:'consonants-02',order:5,glyph:'ฅ',thaiName:'ฅ คน',speechText:'คอ คน',japaneseReading:'コー・コン',roman:'khɔɔ khon',meaningJa:'人',obsolete:true,noteJa:'現在は通常使いません。'},
    {id:'ฆ',type:'consonant',group:'consonants-02',order:6,glyph:'ฆ',thaiName:'ฆ ระฆัง',speechText:'คอ ระฆัง',japaneseReading:'コー・ラカン',roman:'khɔɔ rá khaŋ',meaningJa:'鐘',obsolete:false,noteJa:''},
    {id:'ง',type:'consonant',group:'consonants-02',order:7,glyph:'ง',thaiName:'ง งู',speechText:'งอ งู',japaneseReading:'ンゴー・ングー',roman:'ŋɔɔ ŋuu',meaningJa:'へび',obsolete:false,noteJa:''},
    {id:'จ',type:'consonant',group:'consonants-02',order:8,glyph:'จ',thaiName:'จ จาน',speechText:'จอ จาน',japaneseReading:'チョー・チャーン',roman:'cɔɔ caan',meaningJa:'皿',obsolete:false,noteJa:''},
    {id:'ฉ',type:'consonant',group:'consonants-03',order:9,glyph:'ฉ',thaiName:'ฉ ฉิ่ง',speechText:'ฉอ ฉิ่ง',japaneseReading:'チョー・チン',roman:'chɔ̌ɔ chìŋ',meaningJa:'小さなシンバル',obsolete:false,noteJa:''},
    {id:'ช',type:'consonant',group:'consonants-03',order:10,glyph:'ช',thaiName:'ช ช้าง',speechText:'ชอ ช้าง',japaneseReading:'チョー・チャーン',roman:'chɔɔ cháaŋ',meaningJa:'ぞう',obsolete:false,noteJa:''},
    {id:'ซ',type:'consonant',group:'consonants-03',order:11,glyph:'ซ',thaiName:'ซ โซ่',speechText:'ซอ โซ่',japaneseReading:'ソー・ソー',roman:'sɔɔ sôo',meaningJa:'くさり',obsolete:false,noteJa:''},
    {id:'ฌ',type:'consonant',group:'consonants-03',order:12,glyph:'ฌ',thaiName:'ฌ เฌอ',speechText:'ชอ เฌอ',japaneseReading:'チョー・チュー',roman:'chɔɔ chəə',meaningJa:'木',obsolete:false,noteJa:''},
    {id:'ญ',type:'consonant',group:'consonants-04',order:13,glyph:'ญ',thaiName:'ญ หญิง',speechText:'ยอ หญิง',japaneseReading:'ヨー・イン',roman:'yɔɔ yǐŋ',meaningJa:'女の人',obsolete:false,noteJa:''},
    {id:'ฎ',type:'consonant',group:'consonants-04',order:14,glyph:'ฎ',thaiName:'ฎ ชฎา',speechText:'ดอ ชฎา',japaneseReading:'ドー・チャダー',roman:'dɔɔ chá daa',meaningJa:'舞踊の冠',obsolete:false,noteJa:''},
    {id:'ฏ',type:'consonant',group:'consonants-04',order:15,glyph:'ฏ',thaiName:'ฏ ปฏัก',speechText:'ตอ ปฏัก',japaneseReading:'トー・パタック',roman:'tɔɔ pà tàk',meaningJa:'牛を追う棒',obsolete:false,noteJa:''},
    {id:'ฐ',type:'consonant',group:'consonants-04',order:16,glyph:'ฐ',thaiName:'ฐ ฐาน',speechText:'ถอ ฐาน',japaneseReading:'トー・ターン',roman:'thɔ̌ɔ thǎan',meaningJa:'台座',obsolete:false,noteJa:''},
    {id:'ฑ',type:'consonant',group:'consonants-05',order:17,glyph:'ฑ',thaiName:'ฑ มณโฑ',speechText:'ทอ มณโฑ',japaneseReading:'トー・モントー',roman:'thɔɔ mon thoo',meaningJa:'モントー（ラーマキエンの王妃）',obsolete:false,noteJa:''},
    {id:'ฒ',type:'consonant',group:'consonants-05',order:18,glyph:'ฒ',thaiName:'ฒ ผู้เฒ่า',speechText:'ทอ ผู้เฒ่า',japaneseReading:'トー・プータオ',roman:'thɔɔ phûu thâo',meaningJa:'お年寄り',obsolete:false,noteJa:''},
    {id:'ณ',type:'consonant',group:'consonants-05',order:19,glyph:'ณ',thaiName:'ณ เณร',speechText:'นอ เณร',japaneseReading:'ノー・ネーン',roman:'nɔɔ neen',meaningJa:'見習いの僧',obsolete:false,noteJa:''},
    {id:'ด',type:'consonant',group:'consonants-05',order:20,glyph:'ด',thaiName:'ด เด็ก',speechText:'ดอ เด็ก',japaneseReading:'ドー・デック',roman:'dɔɔ dèk',meaningJa:'子ども',obsolete:false,noteJa:''},
    {id:'ต',type:'consonant',group:'consonants-06',order:21,glyph:'ต',thaiName:'ต เต่า',speechText:'ตอ เต่า',japaneseReading:'トー・タオ',roman:'tɔɔ tào',meaningJa:'かめ',obsolete:false,noteJa:''},
    {id:'ถ',type:'consonant',group:'consonants-06',order:22,glyph:'ถ',thaiName:'ถ ถุง',speechText:'ถอ ถุง',japaneseReading:'トー・トゥン',roman:'thɔ̌ɔ thǔŋ',meaningJa:'袋',obsolete:false,noteJa:''},
    {id:'ท',type:'consonant',group:'consonants-06',order:23,glyph:'ท',thaiName:'ท ทหาร',speechText:'ทอ ทหาร',japaneseReading:'トー・タハーン',roman:'thɔɔ thá hǎan',meaningJa:'兵士',obsolete:false,noteJa:''},
    {id:'ธ',type:'consonant',group:'consonants-06',order:24,glyph:'ธ',thaiName:'ธ ธง',speechText:'ทอ ธง',japaneseReading:'トー・トン',roman:'thɔɔ thoŋ',meaningJa:'旗',obsolete:false,noteJa:''},
    {id:'น',type:'consonant',group:'consonants-07',order:25,glyph:'น',thaiName:'น หนู',speechText:'นอ หนู',japaneseReading:'ノー・ヌー',roman:'nɔɔ nǔu',meaningJa:'ねずみ',obsolete:false,noteJa:''},
    {id:'บ',type:'consonant',group:'consonants-07',order:26,glyph:'บ',thaiName:'บ ใบไม้',speechText:'บอ ใบไม้',japaneseReading:'ボー・バイマイ',roman:'bɔɔ bai mái',meaningJa:'葉',obsolete:false,noteJa:''},
    {id:'ป',type:'consonant',group:'consonants-07',order:27,glyph:'ป',thaiName:'ป ปลา',speechText:'ปอ ปลา',japaneseReading:'ポー・プラー',roman:'pɔɔ plaa',meaningJa:'魚',obsolete:false,noteJa:''},
    {id:'ผ',type:'consonant',group:'consonants-07',order:28,glyph:'ผ',thaiName:'ผ ผึ้ง',speechText:'ผอ ผึ้ง',japaneseReading:'ポー・プン',roman:'phɔ̌ɔ phɯ̂ŋ',meaningJa:'はち',obsolete:false,noteJa:''},
    {id:'ฝ',type:'consonant',group:'consonants-08',order:29,glyph:'ฝ',thaiName:'ฝ ฝา',speechText:'ฝอ ฝา',japaneseReading:'フォー・ファー',roman:'fɔ̌ɔ fǎa',meaningJa:'ふた',obsolete:false,noteJa:''},
    {id:'พ',type:'consonant',group:'consonants-08',order:30,glyph:'พ',thaiName:'พ พาน',speechText:'พอ พาน',japaneseReading:'ポー・パーン',roman:'phɔɔ phaan',meaningJa:'脚付きの盆',obsolete:false,noteJa:''},
    {id:'ฟ',type:'consonant',group:'consonants-08',order:31,glyph:'ฟ',thaiName:'ฟ ฟัน',speechText:'ฟอ ฟัน',japaneseReading:'フォー・ファン',roman:'fɔɔ fan',meaningJa:'歯',obsolete:false,noteJa:''},
    {id:'ภ',type:'consonant',group:'consonants-08',order:32,glyph:'ภ',thaiName:'ภ สำเภา',speechText:'พอ สำเภา',japaneseReading:'ポー・サムパオ',roman:'phɔɔ sǎm phao',meaningJa:'ジャンク船',obsolete:false,noteJa:''},
    {id:'ม',type:'consonant',group:'consonants-09',order:33,glyph:'ม',thaiName:'ม ม้า',speechText:'มอ ม้า',japaneseReading:'モー・マー',roman:'mɔɔ máa',meaningJa:'馬',obsolete:false,noteJa:''},
    {id:'ย',type:'consonant',group:'consonants-09',order:34,glyph:'ย',thaiName:'ย ยักษ์',speechText:'ยอ ยักษ์',japaneseReading:'ヨー・ヤック',roman:'yɔɔ yák',meaningJa:'ヤック（鬼・巨人）',obsolete:false,noteJa:''},
    {id:'ร',type:'consonant',group:'consonants-09',order:35,glyph:'ร',thaiName:'ร เรือ',speechText:'รอ เรือ',japaneseReading:'ロー・ルア',roman:'rɔɔ rɯa',meaningJa:'舟',obsolete:false,noteJa:''},
    {id:'ล',type:'consonant',group:'consonants-09',order:36,glyph:'ล',thaiName:'ล ลิง',speechText:'ลอ ลิง',japaneseReading:'ロー・リン',roman:'lɔɔ liŋ',meaningJa:'さる',obsolete:false,noteJa:''},
    {id:'ว',type:'consonant',group:'consonants-10',order:37,glyph:'ว',thaiName:'ว แหวน',speechText:'วอ แหวน',japaneseReading:'ウォー・ウェーン',roman:'wɔɔ wɛ̌ɛn',meaningJa:'指輪',obsolete:false,noteJa:''},
    {id:'ศ',type:'consonant',group:'consonants-10',order:38,glyph:'ศ',thaiName:'ศ ศาลา',speechText:'สอ ศาลา',japaneseReading:'ソー・サーラー',roman:'sɔ̌ɔ sǎa laa',meaningJa:'あずまや',obsolete:false,noteJa:''},
    {id:'ษ',type:'consonant',group:'consonants-10',order:39,glyph:'ษ',thaiName:'ษ ฤๅษี',speechText:'สอ ฤๅษี',japaneseReading:'ソー・ルーシー',roman:'sɔ̌ɔ rɯɯ sǐi',meaningJa:'仙人',obsolete:false,noteJa:''},
    {id:'ส',type:'consonant',group:'consonants-10',order:40,glyph:'ส',thaiName:'ส เสือ',speechText:'สอ เสือ',japaneseReading:'ソー・スア',roman:'sɔ̌ɔ sɯ̌a',meaningJa:'とら',obsolete:false,noteJa:''},
    {id:'ห',type:'consonant',group:'consonants-11',order:41,glyph:'ห',thaiName:'ห หีบ',speechText:'หอ หีบ',japaneseReading:'ホー・ヒープ',roman:'hɔ̌ɔ hìip',meaningJa:'箱',obsolete:false,noteJa:''},
    {id:'ฬ',type:'consonant',group:'consonants-11',order:42,glyph:'ฬ',thaiName:'ฬ จุฬา',speechText:'ลอ จุฬา',japaneseReading:'ロー・チュラー',roman:'lɔɔ cù laa',meaningJa:'チュラー凧',obsolete:false,noteJa:''},
    {id:'อ',type:'consonant',group:'consonants-11',order:43,glyph:'อ',thaiName:'อ อ่าง',speechText:'ออ อ่าง',japaneseReading:'オー・アーン',roman:'ɔɔ àaŋ',meaningJa:'たらい',obsolete:false,noteJa:''},
    {id:'ฮ',type:'consonant',group:'consonants-11',order:44,glyph:'ฮ',thaiName:'ฮ นกฮูก',speechText:'ฮอ นกฮูก',japaneseReading:'ホー・ノックフーク',roman:'hɔɔ nók hûuk',meaningJa:'ふくろう',obsolete:false,noteJa:''}
  ];

  const vowels = [
    {id:'vowel-a',type:'vowel',group:'vowel-a',order:1,glyph:'อะ',thaiName:'สระอะ',speechText:'สระอะ',japaneseReading:'ア',roman:'a',meaningJa:'短いア',obsolete:false,noteJa:''},
    {id:'vowel-aa',type:'vowel',group:'vowel-a',order:2,glyph:'อา',thaiName:'สระอา',speechText:'สระอา',japaneseReading:'アー',roman:'aa',meaningJa:'長いア',obsolete:false,noteJa:''},
    {id:'vowel-i',type:'vowel',group:'vowel-i',order:3,glyph:'อิ',thaiName:'สระอิ',speechText:'สระอิ',japaneseReading:'イ',roman:'i',meaningJa:'短いイ',obsolete:false,noteJa:''},
    {id:'vowel-ii',type:'vowel',group:'vowel-i',order:4,glyph:'อี',thaiName:'สระอี',speechText:'สระอี',japaneseReading:'イー',roman:'ii',meaningJa:'長いイ',obsolete:false,noteJa:''},
    {id:'vowel-ue',type:'vowel',group:'vowel-ue',order:5,glyph:'อึ',thaiName:'สระอึ',speechText:'สระอึ',japaneseReading:'ウ',roman:'ɯ',meaningJa:'短いウ（唇を丸めない）',obsolete:false,noteJa:''},
    {id:'vowel-uue',type:'vowel',group:'vowel-ue',order:6,glyph:'อือ',thaiName:'สระอือ',speechText:'สระอือ',japaneseReading:'ウー',roman:'ɯɯ',meaningJa:'長いウ（唇を丸めない）',obsolete:false,noteJa:''},
    {id:'vowel-u',type:'vowel',group:'vowel-u',order:7,glyph:'อุ',thaiName:'สระอุ',speechText:'สระอุ',japaneseReading:'ウ',roman:'u',meaningJa:'短いウ（唇を丸める）',obsolete:false,noteJa:''},
    {id:'vowel-uu',type:'vowel',group:'vowel-u',order:8,glyph:'อู',thaiName:'สระอู',speechText:'สระอู',japaneseReading:'ウー',roman:'uu',meaningJa:'長いウ（唇を丸める）',obsolete:false,noteJa:''},
    {id:'vowel-e',type:'vowel',group:'vowel-e',order:9,glyph:'เอะ',thaiName:'สระเอะ',speechText:'สระเอะ',japaneseReading:'エ',roman:'e',meaningJa:'短いエ',obsolete:false,noteJa:''},
    {id:'vowel-ee',type:'vowel',group:'vowel-e',order:10,glyph:'เอ',thaiName:'สระเอ',speechText:'สระเอ',japaneseReading:'エー',roman:'ee',meaningJa:'長いエ',obsolete:false,noteJa:''},
    {id:'vowel-ae',type:'vowel',group:'vowel-ae',order:11,glyph:'แอะ',thaiName:'สระแอะ',speechText:'สระแอะ',japaneseReading:'エ',roman:'ɛ',meaningJa:'短いエ（口を広く開く）',obsolete:false,noteJa:''},
    {id:'vowel-aae',type:'vowel',group:'vowel-ae',order:12,glyph:'แอ',thaiName:'สระแอ',speechText:'สระแอ',japaneseReading:'エー',roman:'ɛɛ',meaningJa:'長いエ（口を広く開く）',obsolete:false,noteJa:''},
    {id:'vowel-o',type:'vowel',group:'vowel-o',order:13,glyph:'โอะ',thaiName:'สระโอะ',speechText:'สระโอะ',japaneseReading:'オ',roman:'o',meaningJa:'短いオ（唇を丸める）',obsolete:false,noteJa:''},
    {id:'vowel-oo',type:'vowel',group:'vowel-o',order:14,glyph:'โอ',thaiName:'สระโอ',speechText:'สระโอ',japaneseReading:'オー',roman:'oo',meaningJa:'長いオ（唇を丸める）',obsolete:false,noteJa:''},
    {id:'vowel-aw',type:'vowel',group:'vowel-aw',order:15,glyph:'เอาะ',thaiName:'สระเอาะ',speechText:'สระเอาะ',japaneseReading:'オ',roman:'ɔ',meaningJa:'短いオ（口を広く開く）',obsolete:false,noteJa:''},
    {id:'vowel-aaw',type:'vowel',group:'vowel-aw',order:16,glyph:'ออ',thaiName:'สระออ',speechText:'สระออ',japaneseReading:'オー',roman:'ɔɔ',meaningJa:'長いオ（口を広く開く）',obsolete:false,noteJa:''},
    {id:'vowel-oe',type:'vowel',group:'vowel-oe',order:17,glyph:'เออะ',thaiName:'สระเออะ',speechText:'สระเออะ',japaneseReading:'ウ',roman:'ə',meaningJa:'短いあいまいな母音',obsolete:false,noteJa:'口の力を抜いて発音します。'},
    {id:'vowel-ooe',type:'vowel',group:'vowel-oe',order:18,glyph:'เออ',thaiName:'สระเออ',speechText:'สระเออ',japaneseReading:'ウー',roman:'əə',meaningJa:'長いあいまいな母音',obsolete:false,noteJa:'口の力を抜いて発音します。'}
  ];

  const sources = [
    {title:'DLTV：子音44字の学習',url:'https://dltv.ac.th/teachplan/episode/81181'},
    {title:'DLTV：基本母音の短長9組',url:'https://dltv.ac.th/utils/files/download/65641'},
    {title:'DLTV：書字と母音の位置',url:'https://dltv.ac.th/utils/files/download/155681'},
    {title:'Unicode：タイ文字の名称',url:'https://www.unicode.org/Public/UCD/latest/charts/nameslist/0e00/'},
    {title:'語研：入門タイ語の教科書',url:'https://www.goken-net.co.jp/goken_sample/387.pdf'},
    {title:'Thai Good View：子音44字の名称',url:'https://www.thaigoodview.com/library/teachershow/poonsak/thai_language/sec01p00.html'},
    {title:'タイ青少年百科事典：ฃとฅ',url:'https://saranukromthai.or.th/oldchild/1539'}
  ];

  return {consonants, vowels, sources};
});
