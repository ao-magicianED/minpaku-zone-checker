/**
 * 用途地域データ定義
 * 日本の都市計画法に基づく13種類の用途地域と、民泊営業の可否ルール
 */

export interface ZoningType {
  /** 用途地域コード */
  code: string;
  /** 用途地域名 */
  name: string;
  /** 説明 */
  description: string;
  /** 民泊（住宅宿泊事業法）の可否 */
  minpakuStatus: "allowed" | "conditional" | "restricted";
  /** 旅館業法（簡易宿所）の可否 */
  ryokanStatus: "allowed" | "conditional" | "restricted";
  /** 民泊ステータスの詳細説明 */
  minpakuDetail: string;
  /** 地図表示用カラーコード */
  color: string;
  /** 主な建物用途 */
  mainUse: string;
}

/** 13種類の用途地域データ */
export const ZONING_TYPES: ZoningType[] = [
  {
    code: "1SR",
    name: "第一種低層住居専用地域",
    description:
      "低層住宅の良好な環境を守るための地域。建物の高さが10mまたは12mに制限。",
    minpakuStatus: "conditional",
    ryokanStatus: "restricted",
    minpakuDetail:
      "住宅宿泊事業法に基づく届出制で営業可能（年間180日以内）。ただし自治体条例で区域制限・日数制限がかかる場合あり。旅館業法による簡易宿所は原則不可。",
    color: "#40B882",
    mainUse: "戸建住宅、小規模店舗兼用住宅",
  },
  {
    code: "2SR",
    name: "第二種低層住居専用地域",
    description:
      "主に低層住宅の環境を守る地域。小規模な店舗（150㎡以下）が可能。",
    minpakuStatus: "conditional",
    ryokanStatus: "restricted",
    minpakuDetail:
      "住宅宿泊事業法に基づく届出制で営業可能（年間180日以内）。自治体条例による制限あり。旅館業法による簡易宿所は原則不可。",
    color: "#60D394",
    mainUse: "戸建住宅、小規模店舗",
  },
  {
    code: "1MR",
    name: "第一種中高層住居専用地域",
    description:
      "中高層住宅の環境を守る地域。大学・病院・500㎡以下の店舗が可能。",
    minpakuStatus: "conditional",
    ryokanStatus: "restricted",
    minpakuDetail:
      "住宅宿泊事業法に基づく届出制で営業可能（年間180日以内）。自治体条例による制限あり。旅館業法は原則不可だが、特例許可の場合あり。",
    color: "#AAF683",
    mainUse: "マンション、アパート、大学、病院",
  },
  {
    code: "2MR",
    name: "第二種中高層住居専用地域",
    description:
      "主に中高層住宅の環境を守る地域。1,500㎡以下の店舗・事務所が可能。",
    minpakuStatus: "conditional",
    ryokanStatus: "conditional",
    minpakuDetail:
      "住宅宿泊事業法に基づく届出制で営業可能。旅館業法も条件付きで可能な場合あり。自治体条例による制限確認要。",
    color: "#CCE49A",
    mainUse: "マンション、中規模店舗、事務所",
  },
  {
    code: "1JR",
    name: "第一種住居地域",
    description:
      "住居の環境を守るための地域。3,000㎡以下のホテル・旅館が可能。",
    minpakuStatus: "allowed",
    ryokanStatus: "conditional",
    minpakuDetail:
      "住宅宿泊事業法・旅館業法ともに営業しやすい地域。ホテル・旅館も条件付きで建築可能。自治体条例は要確認。",
    color: "#F9C846",
    mainUse: "住宅、ホテル（小規模）、店舗",
  },
  {
    code: "2JR",
    name: "第二種住居地域",
    description: "主に住居の環境を守る地域。ホテル・旅館・パチンコ店等も可能。",
    minpakuStatus: "allowed",
    ryokanStatus: "allowed",
    minpakuDetail:
      "住宅宿泊事業法・旅館業法ともに原則営業可能。ホテル・旅館の建築も可能。最も民泊に適した住居系用途地域の一つ。",
    color: "#F5A623",
    mainUse: "住宅、ホテル、カラオケ、パチンコ",
  },
  {
    code: "JNR",
    name: "準住居地域",
    description: "道路の沿道にふさわしい業務と住居の調和を図る地域。",
    minpakuStatus: "allowed",
    ryokanStatus: "allowed",
    minpakuDetail:
      "住宅宿泊事業法・旅館業法ともに原則営業可能。国道沿い等に多く、アクセスの良さを活かした民泊に好適。",
    color: "#E8963A",
    mainUse: "住宅、自動車関連施設、ホテル",
  },
  {
    code: "TSJ",
    name: "田園住居地域",
    description: "農業の利便性と住居環境の調和を図る地域（2018年新設）。",
    minpakuStatus: "conditional",
    ryokanStatus: "restricted",
    minpakuDetail:
      "住宅宿泊事業法による営業は可能だが、農村環境保全のため自治体条例で厳しい制限がかかる可能性あり。農家民泊（農泊）とは異なる法的位置づけ。",
    color: "#86C166",
    mainUse: "住宅、農業用施設、農産物直売所",
  },
  {
    code: "KNC",
    name: "近隣商業地域",
    description:
      "近隣住民のための商業施設が集まる地域。日用品の買い物等に便利。",
    minpakuStatus: "allowed",
    ryokanStatus: "allowed",
    minpakuDetail:
      "住宅宿泊事業法・旅館業法ともに原則営業可能。商業エリアのため、周辺に買い物・飲食施設が充実。集客力のある民泊に好適。",
    color: "#F06292",
    mainUse: "商店街、スーパー、飲食店、ホテル",
  },
  {
    code: "SYG",
    name: "商業地域",
    description: "銀行・映画館・百貨店等が集まる都市の中心部。",
    minpakuStatus: "allowed",
    ryokanStatus: "allowed",
    minpakuDetail:
      "住宅宿泊事業法・旅館業法ともに最も営業しやすい地域。大規模ホテルも建築可能。繁華街・ターミナル駅周辺に多い。",
    color: "#E53935",
    mainUse: "デパート、オフィスビル、ホテル、映画館",
  },
  {
    code: "JKG",
    name: "準工業地域",
    description: "主に軽工業の工場等、環境悪化の恐れのない工場が立地する地域。",
    minpakuStatus: "allowed",
    ryokanStatus: "allowed",
    minpakuDetail:
      "住宅宿泊事業法・旅館業法ともに営業可能。倉庫リノベーション等のユニークな民泊に活用されるケースもあり。",
    color: "#AB47BC",
    mainUse: "軽工場、住宅、店舗、倉庫",
  },
  {
    code: "KGY",
    name: "工業地域",
    description: "どんな工場でも建てられる地域。住宅・店舗も建築可能。",
    minpakuStatus: "conditional",
    ryokanStatus: "restricted",
    minpakuDetail:
      "住宅宿泊事業法による届出は可能だが、ホテル・旅館の建築は制限。周辺環境（騒音・臭気等）に留意が必要。自治体条例で追加制限の場合あり。",
    color: "#7E57C2",
    mainUse: "工場、倉庫、住宅（制限あり）",
  },
  {
    code: "KGS",
    name: "工業専用地域",
    description:
      "工場のためだけの地域。住宅・店舗・学校・病院等は建てられない。",
    minpakuStatus: "restricted",
    ryokanStatus: "restricted",
    minpakuDetail:
      "住宅の建築自体が禁止されているため、住宅宿泊事業法による民泊は不可。旅館業法による営業も不可。民泊営業はできません。",
    color: "#546E7A",
    mainUse: "大規模工場のみ",
  },
];

/** 用途地域コードから検索 */
export function getZoningByCode(code: string): ZoningType | undefined {
  return ZONING_TYPES.find((z) => z.code === code);
}

/** 用途地域名から検索 */
export function getZoningByName(name: string): ZoningType | undefined {
  return ZONING_TYPES.find((z) => z.name.includes(name));
}

/** 民泊ステータスの日本語ラベル */
export function getStatusLabel(
  status: "allowed" | "conditional" | "restricted",
): string {
  switch (status) {
    case "allowed":
      return "✅ 原則OK";
    case "conditional":
      return "⚠️ 条件付き";
    case "restricted":
      return "❌ 不可";
  }
}

/** 民泊ステータスの色 */
export function getStatusColor(
  status: "allowed" | "conditional" | "restricted",
): string {
  switch (status) {
    case "allowed":
      return "#22c55e";
    case "conditional":
      return "#eab308";
    case "restricted":
      return "#ef4444";
  }
}
