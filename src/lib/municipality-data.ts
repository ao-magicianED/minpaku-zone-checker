/**
 * 自治体別民泊条例データベース
 * 全国の主要自治体の民泊（住宅宿泊事業法）に関する条例・規制情報
 */

export interface MunicipalityInfo {
  /** 都道府県 */
  prefecture: string;
  /** 市区町村 */
  city: string;
  /** 営業日数制限（法定上限: 年間180日） */
  maxDays: number;
  /** 区域制限の有無 */
  hasAreaRestriction: boolean;
  /** 区域制限の詳細 */
  areaRestrictionDetail: string;
  /** 届出先 */
  submissionTo: string;
  /** 条例・ガイドラインURL */
  guidelineUrl: string;
  /** 特記事項 */
  notes: string;
  /** 問い合わせ先 */
  contact: string;
  /** データオーナー */
  owner: string;
  /** 最終確認者 */
  lastCheckedBy: string;
}

/**
 * 主要自治体の民泊条例データ
 * 最新情報は各自治体サイトで確認してください。
 */
export const MUNICIPALITY_DATA_LAST_VERIFIED_AT = '2026-02-24';
const DEFAULT_DATA_OWNER = 'あおサロンAI 運営';
const DEFAULT_LAST_CHECKED_BY = 'codex';

const BASE_MUNICIPALITY_DATA: Array<Omit<MunicipalityInfo, 'owner' | 'lastCheckedBy'>> = [
  // ============================================================
  // 東京都23区
  // ============================================================
  {
    prefecture: '東京都',
    city: '千代田区',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '住居専用地域では全期間営業制限',
    submissionTo: '千代田保健所',
    guidelineUrl: 'https://www.city.chiyoda.lg.jp/koho/kurashi/sumai/minpaku.html',
    notes: 'オフィス街中心のため住宅エリアは限定的。番町・麹町エリアは住居専用地域に注意。',
    contact: '千代田保健所生活衛生課（TEL: 03-5211-8168）',
  },
  {
    prefecture: '東京都',
    city: '中央区',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '住居専用地域では月曜正午〜土曜正午まで営業制限',
    submissionTo: '中央区保健所',
    guidelineUrl: 'https://www.city.chuo.lg.jp/a0036/kenkouiryou/seikatsueisei/minpaku/minpakutodokede.html',
    notes: '銀座・日本橋エリアは商業地域で比較的営業しやすい。月島・勝どきは住居系に注意。',
    contact: '中央区保健所生活衛生課（TEL: 03-3541-5936）',
  },
  {
    prefecture: '東京都',
    city: '港区',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '文教地区周辺で制限あり',
    submissionTo: '港区 みなと保健所',
    guidelineUrl: 'https://www.city.minato.tokyo.jp/kankyoueiseishidou/minpaku2.html',
    notes: '国際的な観光需要が高く、外国人ゲスト対応が重要。六本木・赤坂エリアは商業地域。',
    contact: '港区 みなと保健所生活衛生課住宅宿泊事業担当（TEL: 03-6400-0088）',
  },
  {
    prefecture: '東京都',
    city: '新宿区',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '住居専用地域では月曜正午〜金曜正午まで営業制限（平日制限）',
    submissionTo: '新宿区 健康部衛生課',
    guidelineUrl: 'https://www.city.shinjuku.lg.jp/kenkou/eisei03_002094.html',
    notes: '家主居住型・管理者常駐型で要件が異なる。騒音防止措置が必要。歌舞伎町は商業地域。',
    contact: '新宿区 健康部衛生課（TEL: 03-5273-3870）',
  },
  {
    prefecture: '東京都',
    city: '文京区',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '住居専用地域では全期間営業制限',
    submissionTo: '文京保健所',
    guidelineUrl: 'https://www.city.bunkyo.lg.jp/tetsuzuki/hoken/eisei/minpaku.html',
    notes: '文教地区が多く、学校周辺は特に厳しい制限。本郷・小石川エリアに注意。',
    contact: '文京保健所生活衛生課（TEL: 03-5803-1227）',
  },
  {
    prefecture: '東京都',
    city: '台東区',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '住居専用地域では全期間営業制限',
    submissionTo: '台東保健所',
    guidelineUrl: 'https://www.city.taito.lg.jp/kenkotoiryo/eiseikankyou/minpaku/index.html',
    notes: '浅草・上野エリアはインバウンド需要が非常に高い。下町文化を活かした民泊が人気。',
    contact: '台東保健所生活衛生課（TEL: 03-3847-9455）',
  },
  {
    prefecture: '東京都',
    city: '墨田区',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '住居専用地域では全期間営業制限',
    submissionTo: '墨田区保健所',
    guidelineUrl: 'https://www.city.sumida.lg.jp/kenko_fukushi/eisei/kankyoueisei/minpaku.html',
    notes: 'スカイツリー周辺の観光需要あり。両国・錦糸町エリアも人気。',
    contact: '墨田区保健所生活衛生課（TEL: 03-5765-2078）',
  },
  {
    prefecture: '東京都',
    city: '江東区',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '住居専用地域では全期間営業制限',
    submissionTo: '江東区保健所',
    guidelineUrl: 'https://www.city.koto.lg.jp/260501/kurashi/eisei/kankyo/minpaku.html',
    notes: '豊洲・有明エリアはイベント需要あり。湾岸エリアのタワマン民泊は管理規約に注意。',
    contact: '江東区保健所生活衛生課（TEL: 03-3647-5862）',
  },
  {
    prefecture: '東京都',
    city: '品川区',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '住居専用地域では全期間営業制限',
    submissionTo: '品川区保健所',
    guidelineUrl: 'https://www.city.shinagawa.tokyo.jp/PC/kenko/kenko-eisei/kenko-eisei-minpaku/index.html',
    notes: '品川駅・大崎エリアはビジネス需要もあり。五反田・大井町は商業地域。',
    contact: '品川区保健所生活衛生課（TEL: 03-5742-9138）',
  },
  {
    prefecture: '東京都',
    city: '目黒区',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '住居専用地域では全期間営業制限',
    submissionTo: '目黒区保健所',
    guidelineUrl: 'https://www.city.meguro.tokyo.jp/kurashi/hoken_eisei/seikatsueisei/minpaku.html',
    notes: '住宅街が中心のため住居専用地域が広い。中目黒・自由が丘エリアに注意。',
    contact: '目黒区保健所生活衛生課（TEL: 03-5722-9502）',
  },
  {
    prefecture: '東京都',
    city: '大田区',
    maxDays: 180,
    hasAreaRestriction: false,
    areaRestrictionDetail: '国家戦略特区として民泊特区あり（旅館業法の特例）',
    submissionTo: '大田区 生活衛生課',
    guidelineUrl: 'https://www.city.ota.tokyo.jp/seikatsu/hoken/eisei/riyoubiyou/minpaku_shinpou.html',
    notes: '特区民泊は2泊3日以上の滞在が条件。空港（羽田）近接で需要大。蒲田・大森エリアが人気。',
    contact: '大田区 生活衛生課（TEL: 03-5764-0693）',
  },
  {
    prefecture: '東京都',
    city: '世田谷区',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '住居専用地域では全期間営業制限',
    submissionTo: '世田谷保健所',
    guidelineUrl: 'https://www.city.setagaya.lg.jp/mokuji/kurashi/005/003/005/d00153382.html',
    notes: '住居専用地域が非常に広い区。三軒茶屋・下北沢の商業エリア以外は制限される可能性が高い。',
    contact: '世田谷保健所生活保健課（TEL: 03-5432-2904）',
  },
  {
    prefecture: '東京都',
    city: '渋谷区',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '住居専用地域ではすべての期間で営業制限',
    submissionTo: '渋谷区 生活衛生課',
    guidelineUrl: 'https://www.city.shibuya.tokyo.jp/kenko/eisei/kankyo/minpaku.html',
    notes: '近隣住民への事前周知が義務付け。管理規約の確認必要。渋谷・原宿は商業地域。',
    contact: '渋谷区 生活衛生課環境衛生係（TEL: 03-3463-2287）',
  },
  {
    prefecture: '東京都',
    city: '中野区',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '住居専用地域では全期間営業制限',
    submissionTo: '中野区保健所',
    guidelineUrl: 'https://www.city.tokyo-nakano.lg.jp/kurashi/sumai/minpaku/index.html',
    notes: '中野ブロードウェイ周辺はサブカル観光需要あり。住宅街が多いため注意。',
    contact: '中野区保健所生活衛生課（TEL: 03-3382-6662）',
  },
  {
    prefecture: '東京都',
    city: '杉並区',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '住居専用地域では全期間営業制限',
    submissionTo: '杉並保健所',
    guidelineUrl: 'https://www.city.suginami.tokyo.jp/kurashi/sumai/minpaku/index.html',
    notes: '住居専用地域が広い閑静な住宅街。荻窪・阿佐ヶ谷の商業エリアは比較的営業しやすい。',
    contact: '杉並保健所生活衛生課（TEL: 03-3391-1991）',
  },
  {
    prefecture: '東京都',
    city: '豊島区',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '住居専用地域では全期間営業制限',
    submissionTo: '豊島区保健所',
    guidelineUrl: 'https://www.city.toshima.lg.jp/212/kenko/eisei/kankyo/2003121507.html',
    notes: '池袋エリアは商業地域で営業しやすい。目白・巣鴨は住居系に注意。',
    contact: '豊島区保健所生活衛生課（TEL: 03-3987-4175）',
  },
  {
    prefecture: '東京都',
    city: '北区',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '住居専用地域では全期間営業制限',
    submissionTo: '北区保健所',
    guidelineUrl: 'https://www.city.kita.tokyo.jp/seikatsueisei/kenko/eisei/minpaku/index.html',
    notes: '赤羽・王子エリアは比較的営業しやすい。十条・東十条は住居系が多い。',
    contact: '北区保健所生活衛生課（TEL: 03-3919-0726）',
  },
  {
    prefecture: '東京都',
    city: '荒川区',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '住居専用地域では全期間営業制限',
    submissionTo: '荒川区保健所',
    guidelineUrl: 'https://www.city.arakawa.tokyo.jp/a034/kenkouiryou/seikatsueisei/minpaku.html',
    notes: '日暮里はインバウンド需要あり（成田空港アクセス良好）。下町エリア。',
    contact: '荒川区保健所生活衛生課（TEL: 03-3802-3111）',
  },
  {
    prefecture: '東京都',
    city: '板橋区',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '住居専用地域では全期間営業制限',
    submissionTo: '板橋区保健所',
    guidelineUrl: 'https://www.city.itabashi.tokyo.jp/kenko/eisei/kankyo/1002217.html',
    notes: '住宅街が中心。大山・成増エリアの商業地域は比較的営業しやすい。',
    contact: '板橋区保健所生活衛生課（TEL: 03-3579-2332）',
  },
  {
    prefecture: '東京都',
    city: '練馬区',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '住居専用地域では全期間営業制限',
    submissionTo: '練馬区保健所',
    guidelineUrl: 'https://www.city.nerima.tokyo.jp/kurashi/sumai/minpaku/index.html',
    notes: '住居専用地域が区内の大部分を占める。練馬駅・光が丘の商業エリアに限定される傾向。',
    contact: '練馬区保健所生活衛生課（TEL: 03-5984-2485）',
  },
  {
    prefecture: '東京都',
    city: '足立区',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '住居専用地域では全期間営業制限',
    submissionTo: '足立保健所',
    guidelineUrl: 'https://www.city.adachi.tokyo.jp/kenko/eisei/seikatsueisei/minpaku.html',
    notes: '北千住エリアは交通利便性が高く需要あり。家賃が安く投資利回りが高い傾向。',
    contact: '足立保健所生活衛生課（TEL: 03-3880-5374）',
  },
  {
    prefecture: '東京都',
    city: '葛飾区',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '住居専用地域では全期間営業制限',
    submissionTo: '葛飾区保健所',
    guidelineUrl: 'https://www.city.katsushika.lg.jp/kurashi/1000057/1002499/1028627.html',
    notes: '柴又・亀有エリアは観光需要あり。住宅街が多いため用途地域に注意。',
    contact: '葛飾区保健所生活衛生課（TEL: 03-3602-1242）',
  },
  {
    prefecture: '東京都',
    city: '江戸川区',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '住居専用地域では全期間営業制限',
    submissionTo: '江戸川保健所',
    guidelineUrl: 'https://www.city.edogawa.tokyo.jp/e032/kenko/eisei/kankyo/minpaku.html',
    notes: '葛西エリアはディズニーリゾートアクセスで需要あり。家賃が安く投資向き。',
    contact: '江戸川保健所生活衛生課（TEL: 03-3658-3177）',
  },

  // ============================================================
  // 政令指定都市（東京以外）
  // ============================================================

  // 北海道
  {
    prefecture: '北海道',
    city: '札幌市',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '住居専用地域は期間制限あり',
    submissionTo: '札幌市 保健福祉局',
    guidelineUrl: 'https://www.city.sapporo.jp/keizai/kanko/minpaku/minpakujigyousha.html',
    notes: 'スキーシーズン（冬季）の需要が特に高い。ニセコエリアは倶知安町管轄。すすきの周辺は商業地域。',
    contact: '札幌市 保健福祉局保健所生活環境課（TEL: 011-622-5165）',
  },

  // 宮城県
  {
    prefecture: '宮城県',
    city: '仙台市',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '住居専用地域では期間制限あり',
    submissionTo: '仙台市 健康福祉局',
    guidelineUrl: 'https://www.city.sendai.jp/kankyoeisei/kurashi/kenko/ese/kankyoese/minpaku.html',
    notes: '牛タン・七夕祭りなど観光需要あり。東北の玄関口としてビジネス需要も高い。',
    contact: '仙台市 健康福祉局保健所環境衛生課（TEL: 022-214-8209）',
  },

  // 埼玉県
  {
    prefecture: '埼玉県',
    city: 'さいたま市',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '住居専用地域では期間制限あり',
    submissionTo: 'さいたま市 保健福祉局',
    guidelineUrl: 'https://www.city.saitama.jp/004/002/009/p061944.html',
    notes: '大宮エリアは交通アクセスが良好。さいたまスーパーアリーナ周辺はイベント需要あり。',
    contact: 'さいたま市 保健所環境薬事課（TEL: 048-840-2227）',
  },

  // 千葉県
  {
    prefecture: '千葉県',
    city: '千葉市',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '住居専用地域では期間制限あり',
    submissionTo: '千葉市 保健福祉局',
    guidelineUrl: 'https://www.city.chiba.jp/hokenfukushi/kenkou/seikatsueisei/minpaku.html',
    notes: '幕張メッセ周辺はイベント・ビジネス需要あり。TDR近接エリアとして期待。',
    contact: '千葉市 保健所環境衛生課（TEL: 043-238-9939）',
  },

  // 神奈川県
  {
    prefecture: '神奈川県',
    city: '横浜市',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '住居専用地域では平日制限あり',
    submissionTo: '横浜市 健康福祉局',
    guidelineUrl: 'https://www.city.yokohama.lg.jp/kurashi/sumai-kurashi/seikatsu/kaiteki/20180222105955.html',
    notes: 'みなとみらい・中華街エリアの需要が高い。横浜駅周辺は商業地域。',
    contact: '横浜市 医療局健康安全部生活衛生課（TEL: 045-671-2447）',
  },
  {
    prefecture: '神奈川県',
    city: '川崎市',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '住居専用地域では期間制限あり',
    submissionTo: '川崎市 健康福祉局',
    guidelineUrl: 'https://www.city.kawasaki.jp/350/page/0000097313.html',
    notes: '武蔵小杉エリアのタワマン民泊は管理規約に注意。川崎駅周辺はビジネス需要あり。',
    contact: '川崎市 健康安全研究所生活科学課（TEL: 044-200-2448）',
  },
  {
    prefecture: '神奈川県',
    city: '相模原市',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '住居専用地域では期間制限あり',
    submissionTo: '相模原市 保健所',
    guidelineUrl: 'https://www.city.sagamihara.kanagawa.jp/kurashi/kenko/1026612/index.html',
    notes: '相模湖・津久井湖エリアの自然体験型民泊の可能性あり。',
    contact: '相模原市 保健所生活衛生課（TEL: 042-769-8347）',
  },

  // 新潟県
  {
    prefecture: '新潟県',
    city: '新潟市',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '住居専用地域では期間制限あり',
    submissionTo: '新潟市 保健衛生部',
    guidelineUrl: 'https://www.city.niigata.lg.jp/iryo/kenko/eisei/minpaku.html',
    notes: '古町・万代エリアは商業地域。日本酒・食文化を活かした民泊需要あり。',
    contact: '新潟市 保健衛生部環境衛生課（TEL: 025-212-8263）',
  },

  // 静岡県
  {
    prefecture: '静岡県',
    city: '静岡市',
    maxDays: 180,
    hasAreaRestriction: false,
    areaRestrictionDetail: '特段の上乗せ区域制限なし',
    submissionTo: '静岡市 保健福祉長寿局',
    guidelineUrl: 'https://www.city.shizuoka.lg.jp/s3683/s004370.html',
    notes: '比較的規制が緩やか。駿府城・三保の松原などの観光資源あり。',
    contact: '静岡市 保健所生活衛生課（TEL: 054-249-3155）',
  },
  {
    prefecture: '静岡県',
    city: '浜松市',
    maxDays: 180,
    hasAreaRestriction: false,
    areaRestrictionDetail: '特段の上乗せ区域制限なし',
    submissionTo: '浜松市 健康福祉部',
    guidelineUrl: 'https://www.city.hamamatsu.shizuoka.jp/kenkozoshin/health/hokenjo/minpaku.html',
    notes: '浜名湖・舘山寺温泉エリアのリゾート需要。浜松まつり期間は高需要。',
    contact: '浜松市 保健所生活衛生課（TEL: 053-453-6118）',
  },

  // 愛知県
  {
    prefecture: '愛知県',
    city: '名古屋市',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '住居専用地域では期間制限あり（家主不在型は平日制限）',
    submissionTo: '名古屋市 健康福祉局',
    guidelineUrl: 'https://www.city.nagoya.jp/kenkofukushi/page/0000104019.html',
    notes: '栄・名駅エリアはビジネス・観光需要が高い。トヨタ関連のビジネス出張需要も。',
    contact: '名古屋市 健康福祉局環境薬務課（TEL: 052-972-2644）',
  },

  // 京都府
  {
    prefecture: '京都府',
    city: '京都市',
    maxDays: 60,
    hasAreaRestriction: true,
    areaRestrictionDetail: '住居専用地域は1月15日〜3月15日のみ営業可能（60日）。生活環境保全地区指定あり。',
    submissionTo: '京都市 保健福祉局 医療衛生推進室',
    guidelineUrl: 'https://minpakuportal.city.kyoto.lg.jp/indexminpaku',
    notes: '全国で最も厳しい規制の一つ。駆けつけ要件（10分以内）あり。町家活用は別途相談推奨。',
    contact: '京都市 医療衛生センター住宅宿泊事業法届出受付窓口（TEL: 075-748-1313）',
  },

  // 大阪府
  {
    prefecture: '大阪府',
    city: '大阪市',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '住居専用地域は制限あり。特区民泊制度も併用可能。',
    submissionTo: '大阪市 健康局',
    guidelineUrl: 'https://www.city.osaka.lg.jp/kenko/page/0000382418.html',
    notes: '国家戦略特区で特区民泊も利用可能（2泊3日以上）。インバウンド需要が非常に高い。なんば・梅田・新世界エリアが人気。',
    contact: '大阪市 健康局生活衛生課（TEL: 06-6208-9981）',
  },
  {
    prefecture: '大阪府',
    city: '堺市',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '住居専用地域では期間制限あり',
    submissionTo: '堺市 健康福祉局',
    guidelineUrl: 'https://www.city.sakai.lg.jp/kenko/kenko/eisei/minpaku/index.html',
    notes: '百舌鳥・古市古墳群（世界遺産）周辺の観光需要。大阪市へのアクセスも良好。',
    contact: '堺市 保健所環境薬務課（TEL: 072-228-7982）',
  },

  // 兵庫県
  {
    prefecture: '兵庫県',
    city: '神戸市',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '住居専用地域では期間制限あり。北野・三宮エリアは条件付き営業可。',
    submissionTo: '神戸市 保健福祉局',
    guidelineUrl: 'https://www.city.kobe.lg.jp/a97620/kenko/health/hygiene/minpaku/index.html',
    notes: '北野異人館・三宮・元町エリアの観光需要が高い。有馬温泉エリアは別途確認推奨。',
    contact: '神戸市 保健所衛生監視事務所（TEL: 078-371-4685）',
  },

  // 岡山県
  {
    prefecture: '岡山県',
    city: '岡山市',
    maxDays: 180,
    hasAreaRestriction: false,
    areaRestrictionDetail: '特段の上乗せ区域制限なし',
    submissionTo: '岡山市 保健福祉局',
    guidelineUrl: 'https://www.city.okayama.jp/hofuku/0000012736.html',
    notes: '比較的規制が緩やか。後楽園・岡山城周辺の観光需要。瀬戸内海エリアの拠点としても可能性あり。',
    contact: '岡山市 保健所衛生課（TEL: 086-803-1257）',
  },

  // 広島県
  {
    prefecture: '広島県',
    city: '広島市',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '住居専用地域では期間制限あり',
    submissionTo: '広島市 健康福祉局',
    guidelineUrl: 'https://www.city.hiroshima.lg.jp/site/minpaku/',
    notes: '原爆ドーム・宮島（厳島神社）への拠点として外国人観光客の需要が高い。',
    contact: '広島市 保健所環境衛生課（TEL: 082-241-7408）',
  },

  // 福岡県
  {
    prefecture: '福岡県',
    city: '福岡市',
    maxDays: 180,
    hasAreaRestriction: false,
    areaRestrictionDetail: '特段の区域制限なし（比較的緩やか）',
    submissionTo: '福岡市 保健医療局 生活衛生課',
    guidelineUrl: 'https://www.city.fukuoka.lg.jp/hofuku/hokensho/kurashinoeisei/jigyosya/ryokan/minpakusa-bisuwookangaenokatahe.html',
    notes: 'アジアからのインバウンド需要が高い。天神・博多エリアが人気。比較的規制が緩やか。',
    contact: '福岡市 保健医療局生活衛生課（TEL: 092-711-4273）',
  },
  {
    prefecture: '福岡県',
    city: '北九州市',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '住居専用地域では期間制限あり',
    submissionTo: '北九州市 保健福祉局',
    guidelineUrl: 'https://www.city.kitakyushu.lg.jp/ho-huku/18601024.html',
    notes: '小倉・門司港レトロエリアの観光需要。製造業のビジネス出張需要もあり。',
    contact: '北九州市 保健所生活衛生課（TEL: 093-522-8728）',
  },

  // 熊本県
  {
    prefecture: '熊本県',
    city: '熊本市',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '住居専用地域では期間制限あり',
    submissionTo: '熊本市 健康福祉局',
    guidelineUrl: 'https://www.city.kumamoto.jp/hpKiji/pub/detail.aspx?c_id=5&id=18499',
    notes: '熊本城周辺の観光需要。阿蘇山アクセスの拠点としても利用可能。',
    contact: '熊本市 保健所生活衛生課（TEL: 096-364-3187）',
  },

  // ============================================================
  // 主要中核市・観光都市
  // ============================================================

  // 沖縄県
  {
    prefecture: '沖縄県',
    city: '那覇市',
    maxDays: 180,
    hasAreaRestriction: false,
    areaRestrictionDetail: '特段の区域制限なし',
    submissionTo: '那覇市 健康部',
    guidelineUrl: 'https://www.city.naha.okinawa.jp/nahahokenjyo/0003/juutakusyukuhaku/minpakusoudan.html',
    notes: 'リゾート需要が高い。繁忙期（夏季・年末年始）は特に需要大。管理体制の整備が重要。',
    contact: '那覇市 健康部生活衛生課（TEL: 098-853-7963）',
  },

  // 長野県
  {
    prefecture: '長野県',
    city: '長野市',
    maxDays: 180,
    hasAreaRestriction: false,
    areaRestrictionDetail: '特段の上乗せ区域制限なし',
    submissionTo: '長野市 保健福祉部',
    guidelineUrl: 'https://www.city.nagano.nagano.jp/soshiki/h-seikatu/428651.html',
    notes: '善光寺周辺の観光需要。スキーシーズン（白馬・志賀高原方面の拠点）は高需要。',
    contact: '長野市 保健所食品生活衛生課（TEL: 026-226-9970）',
  },

  // 石川県
  {
    prefecture: '石川県',
    city: '金沢市',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '住居専用地域では期間制限あり。兼六園・ひがし茶屋街周辺は景観条例にも注意。',
    submissionTo: '金沢市 保健局',
    guidelineUrl: 'https://www4.city.kanazawa.lg.jp/soshikikarasagasu/eiseishidouka/minpaku.html',
    notes: '北陸新幹線開業で観光需要急増。兼六園・21世紀美術館・近江町市場エリアが人気。町家民泊は景観と調和が重要。',
    contact: '金沢市 保健局衛生指導課（TEL: 076-234-5112）',
  },

  // 奈良県
  {
    prefecture: '奈良県',
    city: '奈良市',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '住居専用地域では期間制限あり。世界遺産バッファゾーンは注意。',
    submissionTo: '奈良市 保健所',
    guidelineUrl: 'https://www.city.nara.lg.jp/soshiki/58/88430.html',
    notes: '東大寺・春日大社エリアの外国人観光需要が高い。京都からの日帰り客の宿泊需要も。',
    contact: '奈良市 保健所生活衛生課（TEL: 0742-93-8395）',
  },

  // 長崎県
  {
    prefecture: '長崎県',
    city: '長崎市',
    maxDays: 180,
    hasAreaRestriction: false,
    areaRestrictionDetail: '特段の上乗せ区域制限なし',
    submissionTo: '長崎市 市民健康部',
    guidelineUrl: 'https://www.city.nagasaki.lg.jp/jigyo/370000/374000/p031775.html',
    notes: 'グラバー園・稲佐山・軍艦島などの観光資源。クルーズ船寄港地としての需要もあり。',
    contact: '長崎市 生活衛生課（TEL: 095-829-1155）',
  },

  // 鹿児島県
  {
    prefecture: '鹿児島県',
    city: '鹿児島市',
    maxDays: 180,
    hasAreaRestriction: false,
    areaRestrictionDetail: '特段の上乗せ区域制限なし',
    submissionTo: '鹿児島市 保健福祉局',
    guidelineUrl: 'https://www.city.kagoshima.lg.jp/kenkofukushi/hokenjo/seikatsueisei/minpaku.html',
    notes: '桜島・天文館エリアの観光需要。比較的規制が緩やかで参入しやすい。',
    contact: '鹿児島市 保健所生活衛生課（TEL: 099-803-6885）',
  },

  // 宮崎県
  {
    prefecture: '宮崎県',
    city: '宮崎市',
    maxDays: 180,
    hasAreaRestriction: false,
    areaRestrictionDetail: '特段の上乗せ区域制限なし',
    submissionTo: '宮崎市 保健所',
    guidelineUrl: 'https://www.city.miyazaki.miyazaki.jp/health/hygiene/218961.html',
    notes: 'リゾート需要あり。比較的規制が緩やかで開業しやすい。',
    contact: '宮崎市 保健所衛生課（TEL: 0985-29-5283）',
  },

  // 富山県
  {
    prefecture: '富山県',
    city: '富山市',
    maxDays: 180,
    hasAreaRestriction: false,
    areaRestrictionDetail: '特段の上乗せ区域制限なし',
    submissionTo: '富山市 福祉保健部',
    guidelineUrl: 'https://www.city.toyama.lg.jp/kurashi/kenko/hokenjo/1005047/1004741.html',
    notes: '立山黒部アルペンルートの拠点として外国人観光需要あり。比較的規制が緩やか。',
    contact: '富山市 保健所生活衛生課（TEL: 076-428-1154）',
  },

  // 北海道（ニセコ・倶知安）
  {
    prefecture: '北海道',
    city: '倶知安町',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '倶知安町独自の条例により、届出住宅の基準あり。管理者の設置義務。',
    submissionTo: '倶知安町 住民環境課',
    guidelineUrl: 'https://www.town.kutchan.hokkaido.jp/kurashi/sumai/minpaku/',
    notes: 'ニセコスキーリゾートの中心地。外国人オーナー・ゲストが多い。冬季は非常に高い収益が見込める。',
    contact: '倶知安町 住民環境課（TEL: 0136-56-8008）',
  },

  // 大分県
  {
    prefecture: '大分県',
    city: '別府市',
    maxDays: 180,
    hasAreaRestriction: false,
    areaRestrictionDetail: '特段の上乗せ区域制限なし',
    submissionTo: '別府市 生活環境部',
    guidelineUrl: 'https://www.city.beppu.oita.jp/sisei/seisakukeikaku/minpaku.html',
    notes: '温泉観光地として高い知名度。温泉付き民泊は差別化が可能。外国人観光客も多い。',
    contact: '別府市 環境課（TEL: 0977-21-1134）',
  },

  // 栃木県
  {
    prefecture: '栃木県',
    city: '日光市',
    maxDays: 180,
    hasAreaRestriction: false,
    areaRestrictionDetail: '特段の上乗せ区域制限なし',
    submissionTo: '栃木県 保健福祉部',
    guidelineUrl: 'https://www.pref.tochigi.lg.jp/e06/minpakusinpou.html',
    notes: '日光東照宮・中禅寺湖エリアの外国人観光需要。鬼怒川温泉エリアも有望。',
    contact: '栃木県 生活衛生課（TEL: 028-623-3109）',
  },

  // 箱根
  {
    prefecture: '神奈川県',
    city: '箱根町',
    maxDays: 180,
    hasAreaRestriction: false,
    areaRestrictionDetail: '特段の上乗せ区域制限なし',
    submissionTo: '神奈川県 健康医療局',
    guidelineUrl: 'https://www.pref.kanagawa.jp/docs/n3x/minpaku.html',
    notes: '温泉リゾート地として外国人観光需要が非常に高い。旅館業との競合に注意。',
    contact: '神奈川県 健康医療局生活衛生課（TEL: 045-210-4940）',
  },

  // ============================================================
  // その他の県庁所在地・主要都市
  // ============================================================

  // 東北の県庁所在地
  {
    prefecture: '青森県',
    city: '青森市',
    maxDays: 180,
    hasAreaRestriction: false,
    areaRestrictionDetail: '特段の上乗せ区域制限なし',
    submissionTo: '青森市保健所',
    guidelineUrl: 'https://www.city.aomori.aomori.jp/seikatsu-eisei/kurashi-guide/sumai/minpaku/',
    notes: 'ねぶた祭期間（8月上旬）は宿泊需要が急増する。',
    contact: '青森市保健所 生活衛生課（TEL: 017-736-2815）',
  },
  {
    prefecture: '岩手県',
    city: '盛岡市',
    maxDays: 180,
    hasAreaRestriction: false,
    areaRestrictionDetail: '特段の上乗せ区域制限なし',
    submissionTo: '盛岡市保健所',
    guidelineUrl: 'https://www.city.morioka.iwate.jp/kurashi/kyoju/minpaku/index.html',
    notes: '「行くべき52の場所」選出などで外国人観光需要が増加傾向。',
    contact: '盛岡市保健所 環境衛生課（TEL: 019-603-8311）',
  },
  {
    prefecture: '秋田県',
    city: '秋田市',
    maxDays: 180,
    hasAreaRestriction: false,
    areaRestrictionDetail: '特段の上乗せ区域制限なし',
    submissionTo: '秋田市保健所',
    guidelineUrl: 'https://www.city.akita.lg.jp/hoken-eisei/kankyo-eisei/1005727/index.html',
    notes: '竿燈まつり期間は非常に高い宿泊需要がある。',
    contact: '秋田市保健所 衛生検査課（TEL: 018-883-1181）',
  },
  {
    prefecture: '山形県',
    city: '山形市',
    maxDays: 180,
    hasAreaRestriction: false,
    areaRestrictionDetail: '特段の上乗せ区域制限なし',
    submissionTo: '山形市保健所',
    guidelineUrl: 'https://www.city.yamagata-yamagata.lg.jp/kurashi/seikatsueisei/1006584/index.html',
    notes: '蔵王温泉・スキー場やフルーツ観光の拠点。',
    contact: '山形市保健所 生活衛生課（TEL: 023-616-7280）',
  },
  {
    prefecture: '福島県',
    city: '福島市',
    maxDays: 180,
    hasAreaRestriction: false,
    areaRestrictionDetail: '特段の上乗せ区域制限なし',
    submissionTo: '福島市保健所',
    guidelineUrl: 'https://www.city.fukushima.fukushima.jp/hoken-eisei/kurashi/hoken/eisei/minpaku.html',
    notes: '飯坂温泉などの観光拠点。',
    contact: '福島市保健所 衛生課（TEL: 024-525-2742）',
  },

  // 関東の県庁所在地・主要都市
  {
    prefecture: '茨城県',
    city: '水戸市',
    maxDays: 180,
    hasAreaRestriction: false,
    areaRestrictionDetail: '特段の上乗せ区域制限なし',
    submissionTo: '水戸市保健所',
    guidelineUrl: 'https://www.city.mito.lg.jp/page/3792.html',
    notes: '偕楽園（梅まつり）やひたち海浜公園へのアクセス拠点。',
    contact: '水戸市保健所 保健衛生課（TEL: 029-243-7311）',
  },
  {
    prefecture: '栃木県',
    city: '宇都宮市',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '住居専用地域では期間制限あり',
    submissionTo: '宇都宮市保健所',
    guidelineUrl: 'https://www.city.utsunomiya.tochigi.jp/kurashi/kenko/eisei/1016625.html',
    notes: '餃子観光やLRT沿線の需要。日光方面への経由地としても利用される。',
    contact: '宇都宮市保健所 生活衛生課（TEL: 028-626-1108）',
  },
  {
    prefecture: '群馬県',
    city: '前橋市',
    maxDays: 180,
    hasAreaRestriction: false,
    areaRestrictionDetail: '特段の上乗せ区域制限なし',
    submissionTo: '前橋市保健所',
    guidelineUrl: 'https://www.city.maebashi.gunma.jp/kurashi_tetsuzuki/eisei_seikatsu/3/1/15982.html',
    notes: '赤城山などの自然観光拠点。市内のアート・リノベーション需要も。',
    contact: '前橋市保健所 衛生検査課（TEL: 027-220-5777）',
  },
  {
    prefecture: '群馬県',
    city: '高崎市',
    maxDays: 180,
    hasAreaRestriction: false,
    areaRestrictionDetail: '特段の上乗せ区域制限なし',
    submissionTo: '高崎市保健所',
    guidelineUrl: 'https://www.city.takasaki.gunma.jp/page/6204.html',
    notes: '新幹線停車駅でビジネス・イベント（高崎アリーナ等）の需要あり。',
    contact: '高崎市保健所 生活衛生課（TEL: 027-381-6116）',
  },

  // 中部・近畿の県庁所在地
  {
    prefecture: '山梨県',
    city: '甲府市',
    maxDays: 180,
    hasAreaRestriction: false,
    areaRestrictionDetail: '特段の上乗せ区域制限なし',
    submissionTo: '甲府市保健所',
    guidelineUrl: 'https://www.city.kofu.yamanashi.jp/hoken-eisei/seisakusekatsu/minpaku.html',
    notes: '昇仙峡やワイナリー巡りの観光拠点。',
    contact: '甲府市保健所 生活衛生課（TEL: 055-237-1172）',
  },
  {
    prefecture: '福井県',
    city: '福井市',
    maxDays: 180,
    hasAreaRestriction: false,
    areaRestrictionDetail: '特段の上乗せ区域制限なし',
    submissionTo: '福井市保健所',
    guidelineUrl: 'https://www.city.fukui.fukui.jp/kurasi/seikatu/innsyoku/p020141.html',
    notes: '北陸新幹線延伸による観光需要の増加が見込まれる。',
    contact: '福井市保健所 衛生盛岡課（TEL: 0776-20-5345）',
  },
  {
    prefecture: '岐阜県',
    city: '岐阜市',
    maxDays: 180,
    hasAreaRestriction: false,
    areaRestrictionDetail: '特段の上乗せ区域制限なし',
    submissionTo: '岐阜市保健所',
    guidelineUrl: 'https://www.city.gifu.lg.jp/kurashi/kankyo/1004116/1004118.html',
    notes: '長良川鵜飼などの観光需要。名古屋へのアクセスも良好。',
    contact: '岐阜市保健所 生活衛生課（TEL: 058-252-7195）',
  },
  {
    prefecture: '三重県',
    city: '津市',
    maxDays: 180,
    hasAreaRestriction: false,
    areaRestrictionDetail: '特段の上乗せ区域制限なし',
    submissionTo: '三重県 保健所',
    guidelineUrl: 'https://www.pref.mie.lg.jp/YAKUMUS/HP/m0051100072.htm',
    notes: '伊勢志摩方面へのアクセス拠点。',
    contact: '津保健所 衛生指導課（TEL: 059-223-5112）',
  },
  {
    prefecture: '滋賀県',
    city: '大津市',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '住居専用地域では期間制限あり',
    submissionTo: '大津市保健所',
    guidelineUrl: 'https://www.city.otsu.lg.jp/soshiki/030/1409/g/minpaku/1518742517865.html',
    notes: '琵琶湖周辺の観光需要に加え、京都の宿泊施設の受け皿としての需要も高い。',
    contact: '大津市保健所 衛生課（TEL: 077-522-7364）',
  },
  {
    prefecture: '和歌山県',
    city: '和歌山市',
    maxDays: 180,
    hasAreaRestriction: false,
    areaRestrictionDetail: '特段の上乗せ区域制限なし',
    submissionTo: '和歌山市保健所',
    guidelineUrl: 'https://www.city.wakayama.wakayama.jp/kurashi/hoken_iseika/1019688/1019702/index.html',
    notes: '和歌山城やマリーナシティなどの観光拠点。',
    contact: '和歌山市保健所 生活保健課（TEL: 073-488-5112）',
  },

  // 中国・四国の県庁所在地
  {
    prefecture: '鳥取県',
    city: '鳥取市',
    maxDays: 180,
    hasAreaRestriction: false,
    areaRestrictionDetail: '特段の上乗せ区域制限なし',
    submissionTo: '鳥取市保健所',
    guidelineUrl: 'https://www.city.tottori.lg.jp/www/contents/1520473634057/index.html',
    notes: '鳥取砂丘や浦富海岸周辺の観光拠点。',
    contact: '鳥取市保健所 生活安全課（TEL: 0857-30-8551）',
  },
  {
    prefecture: '島根県',
    city: '松江市',
    maxDays: 180,
    hasAreaRestriction: false,
    areaRestrictionDetail: '特段の上乗せ区域制限なし',
    submissionTo: '松江市保健所',
    guidelineUrl: 'https://www1.city.matsue.shimane.jp/kurashi/iryou/eisei/minpaku/minpaku.html',
    notes: '松江城・宍道湖周辺のインバウンド・国内観光需要。出雲へのアクセス拠点。',
    contact: '松江市保健所 保健衛生課（TEL: 0852-60-8153）',
  },
  {
    prefecture: '山口県',
    city: '山口市',
    maxDays: 180,
    hasAreaRestriction: false,
    areaRestrictionDetail: '特段の上乗せ区域制限なし',
    submissionTo: '山口県 環境生活部',
    guidelineUrl: 'https://www.pref.yamaguchi.lg.jp/soshiki/33/16377.html',
    notes: '湯田温泉などの観光地あり。',
    contact: '山口県 環境生活部生活衛生課（TEL: 083-933-2974）',
  },
  {
    prefecture: '徳島県',
    city: '徳島市',
    maxDays: 180,
    hasAreaRestriction: false,
    areaRestrictionDetail: '特段の上乗せ区域制限なし',
    submissionTo: '徳島県 保健福祉部',
    guidelineUrl: 'https://www.pref.tokushima.lg.jp/ippannokata/haikibutsu/shokuhin/5013098',
    notes: '阿波おどり期間中（8月）は宿泊施設が極端に不足し、民泊需要が最大化する。',
    contact: '徳島県 保健福祉部食品・衛生課（TEL: 088-621-2264）',
  },
  {
    prefecture: '香川県',
    city: '高松市',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '住居専用地域では期間制限あり',
    submissionTo: '高松市保健所',
    guidelineUrl: 'https://www.city.takamatsu.kagawa.jp/kurashi/kurashi/seikatsu/eisei/minpaku/',
    notes: '瀬戸内国際芸術祭の拠点として外国人需要が非常に高い。直島・豊島へのアクセス良。',
    contact: '高松市保健所 生活衛生課（TEL: 087-839-2865）',
  },
  {
    prefecture: '愛媛県',
    city: '松山市',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '住居専用地域では期間制限あり',
    submissionTo: '松山市保健所',
    guidelineUrl: 'https://www.city.matsuyama.ehime.jp/kurashi/tetsuzuki/eiseieigyo/minpaku_sinpou.html',
    notes: '道後温泉・松山城の観光拠点。インバウンド需要も堅調。',
    contact: '松山市保健所 生活衛生課（TEL: 089-911-1808）',
  },
  {
    prefecture: '高知県',
    city: '高知市',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '住居専用地域では期間制限あり',
    submissionTo: '高知市保健所',
    guidelineUrl: 'https://www.city.kochi.kochi.jp/soshiki/157/jutakushukuhaku-gakkou-rodo.html',
    notes: 'よさこい祭り期間（8月）は非常に高い需要がある。ひろめ市場周辺が人気。',
    contact: '高知市保健所 生活食品課（TEL: 088-822-0588）',
  },

  // 九州の県庁所在地
  {
    prefecture: '佐賀県',
    city: '佐賀市',
    maxDays: 180,
    hasAreaRestriction: false,
    areaRestrictionDetail: '特段の上乗せ区域制限なし',
    submissionTo: '佐賀県 健康福祉部',
    guidelineUrl: 'https://www.pref.saga.lg.jp/kiji00360706/index.html',
    notes: 'バルーンフェスタ期間中（11月）は宿泊施設が枯渇し民泊需要が高まる。',
    contact: '佐賀中部保健福祉事務所 衛生対策課（TEL: 0952-30-1906）',
  },
  {
    prefecture: '大分県',
    city: '大分市',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '住居専用地域では期間制限あり',
    submissionTo: '大分市保健所',
    guidelineUrl: 'https://www.city.oita.oita.jp/o068/kenko/iryo/jutakushukuhakujigyohou-seikatsueiseika.html',
    notes: '別府へのアクセスも良く、ビジネス・観光両面の需要がある。',
    contact: '大分市保健所 衛生課（TEL: 097-536-2222）',
  },

  // ============================================================
  // その他の人気リゾート・観光地
  // ============================================================

  // 長野リゾート
  {
    prefecture: '長野県',
    city: '軽井沢町',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '町独自の厳しい「軽井沢町民泊施設等に関する要綱」あり',
    submissionTo: '軽井沢町 生活環境課',
    guidelineUrl: 'https://www.town.karuizawa.lg.jp/www/contents/1517446453982/index.html',
    notes: '別荘地としての環境保全の観点から、民泊・貸別荘に対しては全国屈指の厳しい規制・近隣同意が求められるため注意。',
    contact: '軽井沢町 生活環境課（TEL: 0267-45-8556）',
  },
  {
    prefecture: '長野県',
    city: '白馬村',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '村の独自要綱やガイドラインあり',
    submissionTo: '白馬村 観光課',
    guidelineUrl: 'https://www.vill.hakuba.lg.jp/gyosei/soshikikarasagasu/kankoka/6/5129.html',
    notes: '世界的なスノーリゾート（Japow）として外国人投資家・旅行者の需要が凄まじい。冬季は高稼働高単価。',
    contact: '白馬村 観光課（TEL: 0261-85-0722）',
  },

  // 関東・東海リゾート / 観光地
  {
    prefecture: '静岡県',
    city: '熱海市',
    maxDays: 180,
    hasAreaRestriction: false,
    areaRestrictionDetail: '特段の区域制限なし（ただし温泉付き等の場合、温泉法や旅館業法の確認推奨）',
    submissionTo: '静岡県 加茂保健所または熱海保健所',
    guidelineUrl: 'https://www.city.atami.shizuoka.jp/kurashi/seikatsu/eisei/1004383.html',
    notes: 'V字回復した都心から近い温泉リゾート。貸別荘や一棟貸し民泊の需要が非常に高い。',
    contact: '静岡県 熱海健康福祉センター（TEL: 0557-82-9111）',
  },
  {
    prefecture: '神奈川県',
    city: '鎌倉市',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '住居専用地域では期間制限あり',
    submissionTo: '鎌倉市 健康福祉部',
    guidelineUrl: 'https://www.city.kamakura.kanagawa.jp/shimin-k/minpaku.html',
    notes: '年間を通じた高い観光需要。風致地区などの建築制限や景観条例にも注意。',
    contact: '鎌倉市 市民健康課（TEL: 0467-61-3972）',
  },
  {
    prefecture: '山梨県',
    city: '富士河口湖町',
    maxDays: 180,
    hasAreaRestriction: false,
    areaRestrictionDetail: '特段の上乗せ区域制限なし',
    submissionTo: '山梨県 富士・東部保健所',
    guidelineUrl: 'https://www.pref.yamanashi.jp/eisei-ykm/minpakusinnpou.html',
    notes: '富士山ビューの民泊・貸別荘・グランピング施設が乱立する超人気エリア。',
    contact: '富士・東部保健所 衛生課（TEL: 0555-24-9034）',
  },

  // 沖縄リゾート
  {
    prefecture: '沖縄県',
    city: '石垣市',
    maxDays: 180,
    hasAreaRestriction: false,
    areaRestrictionDetail: '特段の上乗せ区域制限なし',
    submissionTo: '沖縄県 八重山保健所',
    guidelineUrl: 'https://www.pref.okinawa.lg.jp/site/hoken/seikatsueisei/minpaku/',
    notes: 'リゾート民泊や一棟貸しの需要が極めて高い。台風対策と塩害対応の物件管理が不可欠。',
    contact: '沖縄県 八重山保健所（TEL: 0980-82-4891）',
  },
  {
    prefecture: '沖縄県',
    city: '宮古島市',
    maxDays: 180,
    hasAreaRestriction: false,
    areaRestrictionDetail: '特段の上乗せ区域制限なし',
    submissionTo: '沖縄県 宮古保健所',
    guidelineUrl: 'https://www.pref.okinawa.lg.jp/site/hoken/seikatsueisei/minpaku/',
    notes: '石垣島同様、リゾートヴィラタイプの民泊需要が沸騰中。建設ラッシュ。',
    contact: '沖縄県 宮古保健所（TEL: 0980-72-8447）',
  }
];

export const MUNICIPALITY_DATA: MunicipalityInfo[] = BASE_MUNICIPALITY_DATA.map((item) => ({
  ...item,
  owner: DEFAULT_DATA_OWNER,
  lastCheckedBy: DEFAULT_LAST_CHECKED_BY,
}));

/**
 * 都道府県・市区町村から自治体情報を検索
 */
export function findMunicipality(prefecture: string, city: string): MunicipalityInfo | null {
  // 完全一致を優先
  const exact = MUNICIPALITY_DATA.find(
    (m) => m.prefecture === prefecture && m.city === city
  );
  if (exact) return exact;

  // 部分一致
  const partial = MUNICIPALITY_DATA.find(
    (m) =>
      (prefecture.includes(m.prefecture) || m.prefecture.includes(prefecture)) &&
      (city.includes(m.city) || m.city.includes(city))
  );
  if (partial) return partial;

  return null;
}

/**
 * 都道府県から該当する自治体一覧を取得
 */
export function findMunicipalitiesByPrefecture(prefecture: string): MunicipalityInfo[] {
  return MUNICIPALITY_DATA.filter(
    (m) => m.prefecture === prefecture || prefecture.includes(m.prefecture)
  );
}

/**
 * 全自治体データを取得（一覧ページ等で使用）
 */
export function getAllMunicipalities(): MunicipalityInfo[] {
  return MUNICIPALITY_DATA;
}

/**
 * データベースに登録されている都道府県の一覧を取得
 */
export function getRegisteredPrefectures(): string[] {
  const prefectures = new Set(MUNICIPALITY_DATA.map((m) => m.prefecture));
  return Array.from(prefectures).sort();
}
