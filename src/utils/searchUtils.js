const productReadings = [
  [/javascript/gi, "じゃばすくりぷと"],
  [/microsoft/gi, "まいくろそふと"],
  [/comptia/gi, "こんぷてぃあ"],
  [/linuc/gi, "りなっく"],
  [/linux/gi, "りなっくす"],
  [/python/gi, "ぱいそん"],
  [/google/gi, "ぐーぐる"],
  [/oracle/gi, "おらくる"],
  [/azure/gi, "あじゅーる"],
  [/cisco/gi, "しすこ"],
  [/ruby/gi, "るびー"],
  [/java/gi, "じゃば"],
];

const letterReadings = {
  A: "えー",
  B: "びー",
  C: "しー",
  D: "でぃー",
  E: "いー",
  F: "えふ",
  G: "じー",
  H: "えいち",
  I: "あい",
  J: "じぇい",
  K: "けー",
  L: "える",
  M: "えむ",
  N: "えぬ",
  O: "おー",
  P: "ぴー",
  Q: "きゅー",
  R: "あーる",
  S: "えす",
  T: "てぃー",
  U: "ゆー",
  V: "ぶい",
  W: "だぶりゅー",
  X: "えっくす",
  Y: "わい",
  Z: "ぜっと",
};

const kanjiReadings = [
  ["情報処理安全確保支援士", "じょうほうしょりあんぜんかくほしえんし"],
  ["特定非営利活動法人", "とくていひえいりかつどうほうじん"],
  ["情報セキュリティ", "じょうほうせきゅりてぃ"],
  ["独立行政法人", "どくりつぎょうせいほうじん"],
  ["一般財団法人", "いっぱんざいだんほうじん"],
  ["一般社団法人", "いっぱんしゃだんほうじん"],
  ["情報システム", "じょうほうしすてむ"],
  ["情報活用", "じょうほうかつよう"],
  ["情報処理", "じょうほうしょり"],
  ["基本情報", "きほんじょうほう"],
  ["応用情報", "おうようじょうほう"],
  ["データ分析", "でーたぶんせき"],
  ["機械学習", "きかいがくしゅう"],
  ["深層学習", "しんそうがくしゅう"],
  ["生成AI", "せいせいえーあい"],
  ["技術者", "ぎじゅつしゃ"],
  ["準上級", "じゅんじょうきゅう"],
  ["初級", "しょきゅう"],
  ["上級", "じょうきゅう"],
  ["能力", "のうりょく"],
  ["技能", "ぎのう"],
  ["認定", "にんてい"],
  ["実践", "じっせん"],
  ["検定", "けんてい"],
  ["資格", "しかく"],
  ["統計", "とうけい"],
  ["試験", "しけん"],
  ["基礎", "きそ"],
  ["発展", "はってん"],
  ["言語", "げんご"],
  ["活用", "かつよう"],
  ["分析", "ぶんせき"],
  ["情報", "じょうほう"],
  ["処理", "しょり"],
  ["安全", "あんぜん"],
  ["確保", "かくほ"],
  ["支援", "しえん"],
  ["技術", "ぎじゅつ"],
  ["機械", "きかい"],
  ["深層", "しんそう"],
  ["学習", "がくしゅう"],
  ["生成", "せいせい"],
  ["設計", "せっけい"],
  ["無線", "むせん"],
  ["暗号", "あんごう"],
  ["管理", "かんり"],
  ["運用", "うんよう"],
  ["対応", "たいおう"],
  ["開発", "かいはつ"],
  ["組込み", "くみこみ"],
  ["戦略", "せんりゃく"],
  ["監査", "かんさ"],
  ["自動化", "じどうか"],
  ["職業", "しょくぎょう"],
  ["教育", "きょういく"],
  ["育成", "いくせい"],
  ["推進", "すいしん"],
  ["普及", "ふきゅう"],
  ["保証", "ほしょう"],
  ["協会", "きょうかい"],
  ["機構", "きこう"],
  ["委員会", "いいんかい"],
  ["日本", "にほん"],
  ["一般", "いっぱん"],
  ["財団", "ざいだん"],
  ["社団", "しゃだん"],
  ["法人", "ほうじん"],
  ["級", "きゅう"],
];

const digitReadings = {
  0: "ぜろ",
  1: "いち",
  2: "に",
  3: "さん",
  4: "よん",
  5: "ご",
  6: "ろく",
  7: "なな",
  8: "はち",
  9: "きゅう",
};

const qualificationReadings = {
  ipa_ip: "あいてぃーぱすぽーとしけん",
  ipa_sg: "じょうほうせきゅりてぃまねじめんとしけん",
  ipa_fe: "きほんじょうほうぎじゅつしゃしけん",
  ipa_ap: "おうようじょうほうぎじゅつしゃしけん",
  ipa_st: "あいてぃーすとらてじすとしけん",
  ipa_sa: "しすてむあーきてくとしけん",
  ipa_pm: "ぷろじぇくとまねーじゃしけん",
  ipa_nw: "ねっとわーくすぺしゃりすとしけん",
  ipa_db: "でーたべーすすぺしゃりすとしけん",
  ipa_es: "えんべでっどしすてむすぺしゃりすとしけん",
  ipa_sm: "あいてぃーさーびすまねーじゃしけん",
  ipa_au: "しすてむかんさぎじゅつしゃしけん",
  ipa_sc: "じょうほうしょりあんぜんかくほしえんししけん",
  html5_level1:
    "えいちてぃーえむえるふぁいぶぷろふぇっしょなるにんていしけんれべるいち",
  html5_level2:
    "えいちてぃーえむえるふぁいぶぷろふぇっしょなるにんていしけんれべるに",
  python_basic: "ぱいそんすりーえんじにあにんていきそしけん",
  python_practical: "ぱいそんすりーえんじにあにんていじっせんしけん",
  python_data_analysis:
    "ぱいそんすりーえんじにあにんていでーたぶんせきしけん",
  python_data_analysis_practical:
    "ぱいそんすりーえんじにあにんていでーたぶんせきじっせんしけん",
  jdla_g: "じーけんていじぇねらりすとけんてい",
  jdla_e: "いーしかくえんじにあしかく",
  ds_kentei_literacy:
    "でーたさいえんてぃすとけんていりてらしーれべる",
  statistics_grade4: "とうけいけんていよんきゅう",
  statistics_grade3: "とうけいけんていさんきゅう",
  statistics_grade2: "とうけいけんていにきゅう",
  statistics_pre1: "とうけいけんていじゅんいっきゅう",
  statistics_grade1: "とうけいけんていいっきゅう",
  statistics_ds_basic: "とうけいけんていでーたさいえんすきそ",
  statistics_ds_advanced: "とうけいけんていでーたさいえんすはってん",
  statistics_ds_expert:
    "とうけいけんていでーたさいえんすえきすぱーと",
  c_programming_grade3:
    "しーげんごぷろぐらみんぐのうりょくにんていしけんさんきゅう",
  c_programming_grade2:
    "しーげんごぷろぐらみんぐのうりょくにんていしけんにきゅう",
  c_programming_grade1:
    "しーげんごぷろぐらみんぐのうりょくにんていしけんいっきゅう",
  php8_basic: "ぴーえいちぴーえいとぎじゅつしゃにんていしょきゅうしけん",
  php8_advanced:
    "ぴーえいちぴーえいとぎじゅつしゃにんていじょうきゅうじゅんじょうきゅうしけん",
  webdesign_grade3: "うぇぶでざいんぎのうけんていさんきゅう",
  webdesign_grade2: "うぇぶでざいんぎのうけんていにきゅう",
  webdesign_grade1: "うぇぶでざいんぎのうけんていいっきゅう",
  jken_use_grade3:
    "じょうほうけんていじぇいけんじょうほうかつようしけんさんきゅう",
  jken_use_grade2:
    "じょうほうけんていじぇいけんじょうほうかつようしけんにきゅう",
  jken_use_grade1:
    "じょうほうけんていじぇいけんじょうほうかつようしけんいっきゅう",
  jken_system_basic:
    "じょうほうけんていじぇいけんじょうほうしすてむしけんきほんすきる",
  jken_system_programming:
    "じょうほうけんていじぇいけんじょうほうしすてむしけんぷろぐらみんぐすきる",
  jken_system_design:
    "じょうほうけんていじぇいけんじょうほうしすてむしけんしすてむでざいんすきる",
};

const katakanaToHiragana = (value) => {
  return value.replace(/[\u30a1-\u30f6]/g, (character) => {
    return String.fromCharCode(character.charCodeAt(0) - 0x60);
  });
};

export const normalizeLiteralSearchText = (value) => {
  let text = String(value ?? "").normalize("NFKC").toLowerCase();
  text = katakanaToHiragana(text);

  return text.replace(/[\s\p{P}\p{S}ー]+/gu, "");
};

export const normalizeSearchText = (value) => {
  let text = String(value ?? "").normalize("NFKC");

  for (const [pattern, reading] of productReadings) {
    text = text.replace(pattern, reading);
  }

  text = text.replace(/[A-Za-z]{2,}/g, (word) => {
    return [...word]
      .map((letter) => letterReadings[letter.toUpperCase()] ?? letter)
      .join("");
  });
  text = text.replace(
    /(^|[^A-Za-z])([A-Za-z])(?=$|[^A-Za-z])/g,
    (_, prefix, letter) =>
      `${prefix}${letterReadings[letter.toUpperCase()] ?? letter}`
  );
  text = text.toLowerCase();

  for (const [kanji, reading] of kanjiReadings) {
    text = text.replaceAll(kanji, reading);
  }

  text = katakanaToHiragana(text);
  text = text.replace(/[0-9]/g, (digit) => digitReadings[digit] ?? digit);

  return text.replace(/[\s\p{P}\p{S}ー]+/gu, "");
};

export const getQualificationReading = (key) => {
  return qualificationReadings[key] ?? "";
};

export const getNodeSearchText = (node) => {
  if (!node) return "";

  const values = [
    node.name,
    node.category,
    node.type,
    node.vendor,
    getQualificationReading(node.key),
  ];

  return values
    .flatMap((value) => [
      normalizeLiteralSearchText(value),
      normalizeSearchText(value),
    ])
    .filter(Boolean)
    .join(" ");
};

export const matchesSearch = (node, normalizedSearchText, rawSearchText = "") => {
  if (!node || !normalizedSearchText) return false;

  const nodeSearchText = getNodeSearchText(node);
  const searchValues = [
    normalizedSearchText,
    normalizeLiteralSearchText(rawSearchText),
  ].filter(Boolean);

  return searchValues.some((value) => nodeSearchText.includes(value));
};
