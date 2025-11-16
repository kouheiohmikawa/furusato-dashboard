# API設計

## シミュレーションAPI

### POST /api/simulate/simple
控除額簡易シミュレーション（認証不要）

**Request:**
```json
{
  "annualIncome": 5000000,
  "hasSpouse": true,
  "dependentsCount": 1,
  "prefecture": "東京都"
}
```

**Response:**
```json
{
  "estimatedLimit": 61000,
  "safeLimit": 58000,
  "assumptions": ["給与収入のみ", "..."],
  "warnings": ["他の控除がある場合は変動します"]
}
```

## プロフィールAPI

### GET /api/profile
ログインユーザーのProfile取得（認証必須）

**Response:**
```json
{
  "id": "...",
  "userId": "...",
  "annualIncome": 5000000,
  "hasSpouse": true,
  "dependentsCount": 1,
  "prefecture": "東京都"
}
```

### PUT /api/profile
Profile情報の作成/更新（認証必須）

**Request:** Profile情報のJSON

## 寄付API

### GET /api/donations?year=2025
指定年の寄付一覧取得（認証必須）

**Query Parameters:**
- `year`: 対象年度（省略時は全年度）
- `status`: ステータスフィルタ（省略可）
- `search`: 検索キーワード（省略可）

**Response:**
```json
{
  "donations": [
    {
      "id": "...",
      "donatedAt": "2025-01-15",
      "municipality": "北海道札幌市",
      "itemName": "いくら醤油漬け",
      "amount": 10000,
      "portal": "楽天",
      "status": "ONE_STOP_SENT",
      ...
    }
  ],
  "summary": {
    "totalAmount": 50000,
    "count": 5
  }
}
```

### POST /api/donations
寄付レコード新規作成（認証必須）

**Request:**
```json
{
  "donatedAt": "2025-01-15",
  "municipality": "北海道札幌市",
  "itemName": "いくら醤油漬け",
  "amount": 10000,
  "portal": "楽天",
  "status": "PENDING",
  ...
}
```

### PUT /api/donations/:id
寄付レコード更新（認証必須）

### DELETE /api/donations/:id
寄付レコード削除（認証必須）

## スクレイピングAPI（Phase 2）

### POST /api/scrape/donation
URL から寄付情報を抽出（認証必須）

**Request:**
```json
{
  "url": "https://..."
}
```

**Response:**
```json
{
  "municipality": "北海道札幌市",
  "itemName": "いくら醤油漬け",
  "amount": 10000,
  "portal": "楽天",
  "imageUrl": "...",
  "rawTitle": "..."
}
```

**注意:**
- タイムアウト: 3秒程度
- 失敗時は手動入力にフォールバック
- ポータルサイト規約に注意

## 認証API

### /api/auth/[...nextauth]
Auth.jsが自動提供
- Credentials Provider (メール+パスワード)
- セッション管理
- パスワードリセット
