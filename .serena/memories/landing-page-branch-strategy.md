# ランディングページのブランチ戦略

**最終更新**: 2025-11-24

---

## 背景

トップページに税務申告ステータス機能（手続き管理機能）の記載があったが、その機能は実装されていないことが判明。

この問題に対して、2つのアプローチでブランチが作成された:

---

## 2つのブランチ

### 1. `feature/tax-filing-status` - 機能実装アプローチ

**目的**: 税務申告ステータス管理機能を実装する

**内容**:
- 「手続き管理」カードをランディングページに追加（NEWバッジ付き）
- 3つの機能カード: シミュレーター、寄付管理、**手続き管理**
- 4つの会員特典を表示
- 税務申告のステータス追跡機能を実装

**現状**: **保留中**

**保留理由**:
- DBスキーマの変更が必要
- donations テーブルに新しいカラム追加が必要
  - 例: `filing_status` (VARCHAR) - 未提出/提出済み/確定申告済み など
  - 例: `filing_method` (VARCHAR) - ワンストップ特例/確定申告
  - 例: `filing_date` (DATE) - 申告日
- 大きな変更が必要なため、慎重な設計と実装が求められる

**コミット履歴**:
1. implement feature (機能実装)
2. remove from landing page (ランディングページから削除)
3. restore to landing page (ランディングページに復元)

---

### 2. `fix/landing-page-content` - クイックフィックスアプローチ

**目的**: 未実装機能の記載を削除し、誤解を防ぐ

**内容**:
- 税務申告ステータス機能の記載を削除
- 2つの機能カードのみ表示: シミュレーター、寄付管理
- 3つの会員特典を表示
- テキストの表現を改善（より分かりやすく、親しみやすい表現に変更）
- 2カラムグリッドで最適化されたレイアウト

**現状**: **マージ準備完了**

**メリット**:
- ✅ 本番環境で未実装機能が表示されている状態を早急に修正できる
- ✅ DBスキーマの変更が不要 → リスクが低い
- ✅ ユーザーへの誤解を防げる
- ✅ シンプルで明確なメッセージ

---

## 推奨アクション

### 短期（今すぐ）: `fix/landing-page-content` をマージ

**理由**:
1. **本番環境の問題を解決**: 現在、本番環境で未実装機能が宣伝されている状態
2. **リスクが低い**: DBスキーマ変更なし、既存機能への影響なし
3. **ユーザー体験の向上**: 正確な情報を提供し、信頼性を維持
4. **開発コストが低い**: すでに実装・テスト済み

**マージ後の状態**:
- トップページには実装済みの機能のみが表示される
- ユーザーは正確な情報に基づいて会員登録を判断できる
- 将来的に税務申告ステータス機能を追加する余地を残す

---

### 長期（将来）: `feature/tax-filing-status` を再開発

**必要な作業**:

1. **要件定義**
   - どのようなステータスを管理するか
   - どのような情報を記録するか
   - ユーザーにどのような価値を提供するか

2. **DBスキーマ設計**
   ```sql
   -- 例: donationsテーブルに追加
   ALTER TABLE donations ADD COLUMN filing_status VARCHAR(50);
   ALTER TABLE donations ADD COLUMN filing_method VARCHAR(50);
   ALTER TABLE donations ADD COLUMN filing_date DATE;
   
   -- または、別テーブルを作成
   CREATE TABLE tax_filing_records (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     fiscal_year INTEGER NOT NULL,
     filing_method VARCHAR(50) NOT NULL,
     filing_status VARCHAR(50) NOT NULL,
     filing_date DATE,
     notes TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

3. **UI/UX設計**
   - ダッシュボードに手続き管理セクションを追加
   - ステータス更新フォーム
   - 進捗表示（例: 「5件中3件申告済み」）

4. **実装**
   - Server Actions（createFilingRecord, updateFilingStatus等）
   - コンポーネント（FilingStatusCard, FilingForm等）
   - バリデーションとエラーハンドリング

5. **テスト**
   - 単体テスト
   - 統合テスト
   - ユーザーテスト

6. **ランディングページ更新**
   - 手続き管理機能の説明を再追加
   - スクリーンショット・動画デモを追加
   - 具体的な使用例を提示

---

## 現在の決定事項

**2025-11-24時点**:
- ✅ `fix/landing-page-content` を優先してマージすることで合意
- ✅ 税務申告ステータス機能は将来的な機能として保留
- ✅ DBスキーマ設計から見直す方針

---

## ユーザーフィードバック

> 「基本的な流れとしては、元々のトップページに税務申告ステータス機能に関する記載があったと思いますが、その機能は実装されていないことに気がついたことがきっかけです。feature/tax-filing-statusではステータス管理機能をとりあえず実装してみましたが、DBから修正が必要そうだったため一旦マージせずに保留にし、fix/landing-page-contentでは税務申告ステータス機能に関する記述を消しつつ少し表現を修正した感じです」

**分析**: ユーザーは柔軟にアプローチを変更し、問題に対して実用的な解決策（fix/landing-page-content）を選択している。

---

## 参考情報

**関連メモリー**:
- `implementation_progress.md` - 実装進捗の詳細
- `project-roadmap.md` - プロジェクト全体のロードマップ
- `pending-database-migrations.md` - 今後のDBスキーマ変更

**関連ブランチ**:
- `main` - 本番環境（https://furusato-hub.com）
- `feature/tax-filing-status` - 保留中
- `fix/landing-page-content` - マージ待ち

**GitHubリポジトリ**: kouheiohmikawa/furusato-dashboard (推測)

---

## 次のステップ

1. ✅ `fix/landing-page-content` ブランチをレビュー
2. ⏳ `fix/landing-page-content` を `main` にマージ
3. ⏳ 本番環境へデプロイ
4. ⏳ ランディングページの表示を確認
5. ⏳ `feature/tax-filing-status` ブランチは保留のまま維持

**将来的に**:
- 税務申告ステータス機能の再設計
- ユーザー調査（この機能は本当に必要か？）
- 優先度の再評価
