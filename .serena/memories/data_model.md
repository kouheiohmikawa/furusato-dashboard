# データモデル設計（Prisma Schema）

## 主要モデル

### User
認証ユーザー
```prisma
model User {
  id           String    @id @default(cuid())
  email        String    @unique
  passwordHash String?
  name         String?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  
  profile      Profile?
  donations    Donation[]
  accounts     Account[]
  sessions     Session[]
}
```

### Profile
ふるさと納税上限額計算用のユーザー情報（1:1）
```prisma
model Profile {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id])
  
  annualIncome    Int?     // 年収
  hasSpouse       Boolean?
  dependentsCount Int?     // 扶養家族数
  prefecture      String?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### Donation
寄付レコード
```prisma
model Donation {
  id           String          @id @default(cuid())
  userId       String
  user         User            @relation(fields: [userId], references: [id])
  
  donatedAt    DateTime        // 寄付日
  year         Int             // 寄付年
  municipality String?         // 自治体名
  itemName     String?         // 返礼品名
  amount       Int             // 寄付額（円）
  portal       String?         // ポータル名
  category     String?         // カテゴリ
  status       DonationStatus  // 手続きステータス
  received     Boolean?        // 返礼品受取済み
  url          String?         // ポータルURL（参考用）
  memo         String?
  
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt
}

enum DonationStatus {
  PENDING           // 未処理
  ONE_STOP_PLANNED  // ワンストップ予定
  ONE_STOP_SENT     // ワンストップ送付済み
  DECLARED          // 確定申告済み
  OTHER
}
```

### 認証関連（Auth.js標準）
```prisma
model Account {
  // Auth.js標準スキーマ
}

model Session {
  // Auth.js標準スキーマ
}

model VerificationToken {
  // Auth.js標準スキーマ
  // パスワードリセットにも使用
}
```

## Phase 2以降の拡張候補
- `Donation.receiptUrl`: 領収書画像URL
- `Donation.oneStopDeadline`: ワンストップ申請期限
- `DonationTag`: タグ機能（多対多）
