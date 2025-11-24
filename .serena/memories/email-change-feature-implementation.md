# メールアドレス変更機能の実装

**実装日**: 2025-11-24
**ブランチ**: `feature/email-change-functionality`

---

## 概要

プロフィールページにメールアドレス変更機能を実装しました。セキュリティを考慮した設計で、ユーザーが安全にメールアドレスを変更できるようになりました。

---

## 実装内容

### 1. バリデーションスキーマ追加

**ファイル**: `src/lib/validations/auth.ts`

```typescript
export const changeEmailSchema = z.object({
  currentPassword: z.string().min(1, "現在のパスワードを入力してください"),
  newEmail: emailSchema,
});
```

### 2. Server Action実装

**ファイル**: `src/app/actions/auth.ts`

**関数**: `changeEmail(formData: FormData)`

**セキュリティ対策**:
- 現在のパスワードで本人確認
- 新しいメールアドレスが既存のものと同じかチェック
- Supabaseによる自動確認メール送信
- エラーメッセージの日本語化

**フロー**:
1. 入力値のバリデーション
2. ユーザー情報の取得
3. 現在のパスワードで認証
4. メールアドレス更新リクエスト
5. 新しいメールアドレスに確認メール送信

### 3. EmailChangeForm コンポーネント

**ファイル**: `src/components/profile/EmailChangeForm.tsx`

**機能**:
- 折りたたみ可能なUI（デフォルトは折りたたまれている）
- 現在のパスワード入力フィールド
- 新しいメールアドレス入力フィールド
- 成功/エラーメッセージ表示
- 変更フローの説明

**UX**:
- 「変更する」ボタンクリックでフォーム展開
- 成功後は3秒後に自動的にフォームを折りたたむ
- キャンセルボタンでフォームを閉じる

### 4. ProfilePageClient コンポーネント

**ファイル**: `src/components/profile/ProfilePageClient.tsx`

**目的**: ページ全体のアラート管理を一元化

**機能**:
- すべてのフォームのアラートを統合管理
- アラートをページ最上部に表示
- ProfileFormとEmailChangeFormからコールバックで通知を受け取る

### 5. プロフィールページ更新

**ファイル**: `src/app/dashboard/profile/page.tsx`

**変更点**:
- ProfilePageClientを使用してアラート管理を統合
- 古い「メールアドレス変更はサポートしていません」メッセージを削除
- アカウント情報カードを追加

---

## バグ修正

### 1. 重複メールアドレスエラーの日本語化

**問題**: 既に使用されているメールアドレスを指定するとエラーが英語で表示される

**修正**: エラーメッセージマップに追加
```typescript
"A user with this email address has already been registered": "このメールアドレスは既に他のアカウントで使用されています"
```

### 2. フォームリセットエラー

**問題**: メール送信成功後、`event.currentTarget.reset()` がエラーをスローし、成功なのにエラーアラートが表示される

**原因**: フォームリセットの失敗が外側のcatchブロックで捕捉される

**修正**: フォームリセットを独立したtry-catchで囲む
```typescript
try {
  event.currentTarget.reset();
} catch (resetError) {
  console.warn("Form reset failed:", resetError);
}
```

### 3. UIの改善

#### カード間のスペース
**問題**: アカウント情報カードと基本情報カードがくっついて見える

**修正**: 基本情報カードに `mt-8` クラスを追加

#### プロフィール更新後の挙動
**問題**: 成功アラートが一瞬だけ表示され、すぐにダッシュボードにリダイレクトされる

**修正**: 自動リダイレクトを削除し、成功アラート表示後にページに留まる
- ユーザーが継続編集可能
- 「ダッシュボードに戻る」ボタンで自分のタイミングで戻れる

#### 画面スクロール
**問題**: 更新ボタンは画面下部にあるが、アラートは基本情報カード内に表示され、わかりづらい

**修正案1**: 成功/エラー時に画面上部にスクロール
```typescript
window.scrollTo({ top: 0, behavior: 'smooth' });
```

**修正案2（採用）**: アラートをページ最上部に表示
- ProfilePageClientコンポーネントでアラート管理を統合
- すべてのカードの上にアラート表示エリアを配置
- どのフォームからの結果も同じ位置に表示

---

## 変更の流れ（ユーザー視点）

### メールアドレス変更フロー

1. プロフィールページにアクセス
2. 「アカウント情報」カードの「変更する」ボタンをクリック
3. 現在のパスワードを入力
4. 新しいメールアドレスを入力
5. 「メールアドレスを変更する」ボタンをクリック
6. 画面が自動的に上部にスクロール
7. **ページトップに成功アラートが表示される**
8. 新しいメールアドレスに確認メールが届く
9. メール内のリンクをクリック
10. メールアドレス変更が完了
11. 確認が完了するまで、現在のメールアドレスが有効（安全！）

---

## ファイル構成

```
src/
├── app/
│   ├── actions/
│   │   └── auth.ts                          # changeEmail Server Action追加
│   └── dashboard/
│       └── profile/
│           └── page.tsx                     # ProfilePageClientに統合
├── components/
│   └── profile/
│       ├── EmailChangeForm.tsx              # 新規作成
│       ├── ProfileForm.tsx                  # コールバック追加
│       └── ProfilePageClient.tsx            # 新規作成（アラート管理）
└── lib/
    └── validations/
        └── auth.ts                          # changeEmailSchema追加
```

---

## セキュリティ対策

### 実装済み

1. ✅ **本人確認** - 現在のパスワードで認証
2. ✅ **メール確認** - 新しいアドレスに確認メール送信（Supabase自動）
3. ✅ **同一アドレスチェック** - 現在と同じアドレスは拒否
4. ✅ **重複チェック** - 既に他のアカウントで使用されているアドレスは拒否
5. ✅ **入力検証** - Zodスキーマで厳格なバリデーション
6. ✅ **レート制限** - Supabaseの制限（60秒に1回）
7. ✅ **確認前は変更されない** - リンククリックまで古いアドレスが有効

### 今後の拡張案

- 古いメールアドレスへの通知メール（アカウント乗っ取り対策）
- 変更履歴の記録（監査ログ）
- 2段階認証の統合

---

## デバッグログ

開発環境でのみ詳細ログを出力:

```
[Change Email] Starting email change process
[Change Email] Verifying password for: xxx@example.com
[Change Email] Updating email to: new@example.com
[Change Email] Email change request successful
```

---

## テスト項目

### 正常系

- ✅ 正しいパスワードと有効な新しいメールアドレスで変更成功
- ✅ 確認メールが新しいアドレスに送信される
- ✅ 成功アラートがページトップに表示される
- ✅ 画面が自動的に上部にスクロール

### 異常系

- ✅ 現在のパスワードが間違っている → エラー表示
- ✅ 新しいメールアドレスが既に使用されている → エラー表示
- ✅ 新しいメールアドレスが現在のものと同じ → エラー表示
- ✅ メールアドレスの形式が正しくない → バリデーションエラー
- ✅ レート制限（60秒以内に再度リクエスト） → エラー表示

---

## UI/UXの改善点

### アラート表示の進化

**Phase 1**: カード内にアラート表示
- 問題: 更新ボタンは画面下部、アラートはカード内で見えづらい

**Phase 2**: スクロールで上部へ移動
- 改善: `window.scrollTo()` で画面上部にスクロール
- 問題: アラートはまだカード内にある

**Phase 3（最終）**: ページトップにアラート表示
- 解決: ProfilePageClientで全体管理
- アラートはすべてのカードの上に表示
- どのフォームの結果も同じ位置で視認性最高

---

## 関連PR

- **ブランチ**: `feature/email-change-functionality`
- **PR URL**: https://github.com/kouheiohmikawa/furusato-dashboard/pull/new/feature/email-change-functionality

---

## コミット履歴

1. `cb235da` - feat: implement email change functionality with security measures
2. `76a249c` - fix: add Japanese translation for duplicate email error
3. `737e117` - fix: prevent form reset error from showing as email change failure
4. `e3cb744` - style: add spacing between account info and profile cards
5. `98b7c07` - improve: remove auto-redirect after profile update, stay on page
6. `e7dbd8f` - improve: scroll to top when showing profile update alerts
7. `37cf42f` - feat: move alerts to page top for better visibility

---

## 今後の課題

### 機能拡張

- [ ] メールアドレス変更履歴の表示
- [ ] 古いメールアドレスへの通知機能
- [ ] メールアドレス変更のクールダウン期間設定

### UI/UX

- [ ] アラートの自動消去（5秒後など）
- [ ] トースト通知の検討
- [ ] モバイル表示の最適化確認

### セキュリティ

- [ ] 変更履歴の監査ログ
- [ ] 2段階認証との統合
- [ ] 疑わしい変更の検知・通知

---

## 参考資料

- Supabase Auth Documentation: https://supabase.com/docs/guides/auth
- Supabase Email Templates: https://supabase.com/dashboard/project/_/auth/templates
