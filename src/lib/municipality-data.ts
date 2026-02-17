/**
 * 自治体別民泊条例データベース
 * 主要自治体の民泊（住宅宿泊事業法）に関する条例・規制情報
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
}

/**
 * 主要自治体の民泊条例データ
 * ※ 2025年時点の情報。最新情報は各自治体サイトで確認してください。
 */
export const MUNICIPALITY_DATA: MunicipalityInfo[] = [
  // 東京都
  {
    prefecture: '東京都',
    city: '新宿区',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '住居専用地域では月曜正午〜金曜正午まで営業制限（平日制限）',
    submissionTo: '新宿区 健康部衛生課',
    guidelineUrl: 'https://www.city.shinjuku.lg.jp/kenkou/eisei01_002192.html',
    notes: '家主居住型・管理者常駐型で要件が異なる。騒音防止措置が必要。',
    contact: '新宿区 健康部衛生課 TEL: 03-5273-3870',
  },
  {
    prefecture: '東京都',
    city: '渋谷区',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '住居専用地域ではすべての期間で営業制限',
    submissionTo: '渋谷区 生活衛生課',
    guidelineUrl: 'https://www.city.shibuya.tokyo.jp/kurashi/eisei/minpaku/',
    notes: '近隣住民への事前周知が義務付け。管理規約の確認必要。',
    contact: '渋谷区 生活衛生課',
  },
  {
    prefecture: '東京都',
    city: '港区',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '文教地区周辺で制限あり',
    submissionTo: '港区 みなと保健所',
    guidelineUrl: 'https://www.city.minato.tokyo.jp/seikatsueisei/minpaku.html',
    notes: '国際的な観光需要が高く、外国人ゲスト対応が重要。',
    contact: '港区 みなと保健所 生活衛生課',
  },
  {
    prefecture: '東京都',
    city: '大田区',
    maxDays: 180,
    hasAreaRestriction: false,
    areaRestrictionDetail: '国家戦略特区として民泊特区あり（旅館業法の特例）',
    submissionTo: '大田区 生活衛生課',
    guidelineUrl: 'https://www.city.ota.tokyo.jp/seikatsu/hoken/eisei_kankyo/minpaku/',
    notes: '特区民泊は2泊3日以上の滞在が条件。空港（羽田）近接で需要大。',
    contact: '大田区 生活衛生課 TEL: 03-5764-0693',
  },
  // 大阪府
  {
    prefecture: '大阪府',
    city: '大阪市',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '住居専用地域は制限あり。特区民泊制度も併用可能。',
    submissionTo: '大阪市 健康局',
    guidelineUrl: 'https://www.city.osaka.lg.jp/kenko/page/0000410792.html',
    notes: '国家戦略特区で特区民泊も利用可能（2泊3日以上）。インバウンド需要が非常に高い。',
    contact: '大阪市 健康局 生活衛生課',
  },
  // 京都府
  {
    prefecture: '京都府',
    city: '京都市',
    maxDays: 60,
    hasAreaRestriction: true,
    areaRestrictionDetail: '住居専用地域は1月15日〜3月15日のみ営業可能（約60日）。生活環境保全地区指定あり。',
    submissionTo: '京都市 保健福祉局 医療衛生推進室',
    guidelineUrl: 'https://www.city.kyoto.lg.jp/hokenfukushi/page/0000236006.html',
    notes: '全国で最も厳しい規制の一つ。駆けつけ要件（10分以内）あり。町家活用は別途相談推奨。',
    contact: '京都市 保健福祉局 医療衛生推進室 TEL: 075-222-4234',
  },
  // 北海道
  {
    prefecture: '北海道',
    city: '札幌市',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '住居専用地域は期間制限あり',
    submissionTo: '札幌市 保健福祉局',
    guidelineUrl: 'https://www.city.sapporo.jp/hokenjo/shokuhin/minpaku/',
    notes: 'スキーシーズン（冬季）の需要が特に高い。ニセコエリアは倶知安町管轄。',
    contact: '札幌市 保健福祉局 保健所',
  },
  // 福岡県
  {
    prefecture: '福岡県',
    city: '福岡市',
    maxDays: 180,
    hasAreaRestriction: false,
    areaRestrictionDetail: '特段の区域制限なし（比較的緩やか）',
    submissionTo: '福岡市 保健福祉局',
    guidelineUrl: 'https://www.city.fukuoka.lg.jp/hofuku/seikatsueisei/life/minpaku.html',
    notes: 'アジアからのインバウンド需要が高い。天神・博多エリアが人気。比較的規制が緩やか。',
    contact: '福岡市 保健福祉局 生活衛生課',
  },
  // 沖縄県
  {
    prefecture: '沖縄県',
    city: '那覇市',
    maxDays: 180,
    hasAreaRestriction: false,
    areaRestrictionDetail: '特段の区域制限なし',
    submissionTo: '那覇市 健康部',
    guidelineUrl: 'https://www.city.naha.okinawa.jp/',
    notes: 'リゾート需要が高い。繁忙期（夏季・年末年始）は特に需要大。管理体制の整備が重要。',
    contact: '那覇市 健康部 生活衛生課',
  },
  // 神奈川県
  {
    prefecture: '神奈川県',
    city: '横浜市',
    maxDays: 180,
    hasAreaRestriction: true,
    areaRestrictionDetail: '住居専用地域では平日制限あり',
    submissionTo: '横浜市 健康福祉局',
    guidelineUrl: 'https://www.city.yokohama.lg.jp/kurashi/sumai-kurashi/jutaku/minpaku/',
    notes: 'みなとみらい・中華街エリアの需要が高い。',
    contact: '横浜市 健康福祉局 生活衛生課',
  },
];

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
