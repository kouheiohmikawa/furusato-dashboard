-- ============================================================================
-- Add Return Item Categorization and URL Storage Migration
-- ============================================================================
-- 返礼品のカテゴリ分類とURLストレージ機能を追加します。
--
-- 機能:
-- 1. 返礼品の2段階カテゴリ分類（メインカテゴリ + サブカテゴリ）
-- 2. 1つの寄付に1つのカテゴリを設定（一対一リレーション）
-- 3. 商品ページURLの保存
-- 4. 将来的なランキング・レコメンデーション機能の基盤
-- ============================================================================

-- ============================================================================
-- 1. 返礼品メインカテゴリテーブル
-- ============================================================================
CREATE TABLE IF NOT EXISTS return_item_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  display_order INTEGER NOT NULL,
  icon VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE return_item_categories IS '返礼品のメインカテゴリ（肉類、魚介類など）';
COMMENT ON COLUMN return_item_categories.name IS 'カテゴリ名';
COMMENT ON COLUMN return_item_categories.slug IS 'URL用のスラッグ';
COMMENT ON COLUMN return_item_categories.display_order IS '表示順序';
COMMENT ON COLUMN return_item_categories.icon IS 'lucide-reactアイコン名';

-- ============================================================================
-- 2. 返礼品サブカテゴリテーブル
-- ============================================================================
CREATE TABLE IF NOT EXISTS return_item_subcategories (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES return_item_categories(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category_id, slug)
);

COMMENT ON TABLE return_item_subcategories IS '返礼品のサブカテゴリ（牛肉、サーモンなど）';
COMMENT ON COLUMN return_item_subcategories.category_id IS '親カテゴリID';
COMMENT ON COLUMN return_item_subcategories.name IS 'サブカテゴリ名';
COMMENT ON COLUMN return_item_subcategories.slug IS 'URL用のスラッグ';
COMMENT ON COLUMN return_item_subcategories.display_order IS '表示順序';

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON return_item_subcategories(category_id);

-- ============================================================================
-- 3. 寄付テーブルにカラムを追加
-- ============================================================================
DO $$
BEGIN
  -- 商品URLカラムを追加
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'donations' AND column_name = 'product_url'
  ) THEN
    ALTER TABLE donations ADD COLUMN product_url TEXT;
    COMMENT ON COLUMN donations.product_url IS '商品ページのURL（ふるさとチョイス、楽天など）';
  END IF;

  -- サブカテゴリIDカラムを追加
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'donations' AND column_name = 'subcategory_id'
  ) THEN
    ALTER TABLE donations ADD COLUMN subcategory_id INTEGER REFERENCES return_item_subcategories(id);
    COMMENT ON COLUMN donations.subcategory_id IS '返礼品のサブカテゴリID';
  END IF;
END $$;

-- インデックス作成（クエリパフォーマンス最適化）
CREATE INDEX IF NOT EXISTS idx_donations_subcategory_id ON donations(subcategory_id);

-- ============================================================================
-- 4. メインカテゴリマスターデータ挿入
-- ============================================================================
INSERT INTO return_item_categories (id, name, slug, display_order, icon) VALUES
  (1, '肉類', 'meat', 1, 'beef'),
  (2, '魚介類', 'seafood', 2, 'fish'),
  (3, '米・パン', 'grain', 3, 'wheat'),
  (4, '果物', 'fruit', 4, 'apple'),
  (5, '野菜', 'vegetable', 5, 'carrot'),
  (6, '加工食品', 'processed', 6, 'package'),
  (7, '飲料・酒', 'beverage', 7, 'wine'),
  (8, 'お菓子', 'sweets', 8, 'candy'),
  (9, '調味料', 'seasoning', 9, 'soup'),
  (10, '日用品', 'daily', 10, 'shopping-bag'),
  (11, '家電', 'appliance', 11, 'plug'),
  (12, '工芸品', 'craft', 12, 'palette'),
  (13, '旅行・体験', 'experience', 13, 'plane'),
  (14, 'その他', 'other', 14, 'more-horizontal')
ON CONFLICT (id) DO NOTHING;

-- シーケンスをリセット
SELECT setval('return_item_categories_id_seq', 14, true);

-- ============================================================================
-- 5. サブカテゴリマスターデータ挿入
-- ============================================================================

-- 1. 肉類のサブカテゴリ
INSERT INTO return_item_subcategories (category_id, name, slug, display_order) VALUES
  (1, '牛肉', 'beef', 1),
  (1, '豚肉', 'pork', 2),
  (1, '鶏肉', 'chicken', 3),
  (1, 'ハム・ソーセージ', 'ham-sausage', 4),
  (1, 'ジビエ', 'game', 5),
  (1, '肉加工品', 'processed-meat', 6),
  (1, '焼肉セット', 'yakiniku-set', 7),
  (1, 'すき焼き・しゃぶしゃぶ', 'sukiyaki-shabu', 8)
ON CONFLICT (category_id, slug) DO NOTHING;

-- 2. 魚介類のサブカテゴリ
INSERT INTO return_item_subcategories (category_id, name, slug, display_order) VALUES
  (2, 'サーモン・鮭', 'salmon', 1),
  (2, 'マグロ', 'tuna', 2),
  (2, 'いくら・魚卵', 'roe', 3),
  (2, 'カニ', 'crab', 4),
  (2, 'エビ', 'shrimp', 5),
  (2, 'ホタテ', 'scallop', 6),
  (2, 'ウニ', 'sea-urchin', 7),
  (2, '干物', 'dried-fish', 8),
  (2, '貝類', 'shellfish', 9),
  (2, '海鮮セット', 'seafood-set', 10),
  (2, 'その他魚介', 'other-seafood', 11)
ON CONFLICT (category_id, slug) DO NOTHING;

-- 3. 米・パンのサブカテゴリ
INSERT INTO return_item_subcategories (category_id, name, slug, display_order) VALUES
  (3, '白米', 'white-rice', 1),
  (3, '玄米', 'brown-rice', 2),
  (3, '無洗米', 'musenmai', 3),
  (3, 'もち米', 'mochi-rice', 4),
  (3, 'パン', 'bread', 5),
  (3, '餅', 'mochi', 6),
  (3, '米加工品', 'rice-products', 7)
ON CONFLICT (category_id, slug) DO NOTHING;

-- 4. 果物のサブカテゴリ
INSERT INTO return_item_subcategories (category_id, name, slug, display_order) VALUES
  (4, 'りんご', 'apple', 1),
  (4, 'みかん', 'mikan', 2),
  (4, 'ぶどう', 'grape', 3),
  (4, 'いちご', 'strawberry', 4),
  (4, 'もも', 'peach', 5),
  (4, 'メロン', 'melon', 6),
  (4, 'さくらんぼ', 'cherry', 7),
  (4, '梨', 'pear', 8),
  (4, '柑橘類', 'citrus', 9),
  (4, 'マンゴー', 'mango', 10),
  (4, 'その他果物', 'other-fruit', 11)
ON CONFLICT (category_id, slug) DO NOTHING;

-- 5. 野菜のサブカテゴリ
INSERT INTO return_item_subcategories (category_id, name, slug, display_order) VALUES
  (5, 'トマト', 'tomato', 1),
  (5, 'じゃがいも', 'potato', 2),
  (5, '玉ねぎ', 'onion', 3),
  (5, 'きのこ', 'mushroom', 4),
  (5, 'アスパラガス', 'asparagus', 5),
  (5, 'かぼちゃ', 'pumpkin', 6),
  (5, 'とうもろこし', 'corn', 7),
  (5, '野菜セット', 'vegetable-set', 8),
  (5, 'その他野菜', 'other-vegetable', 9)
ON CONFLICT (category_id, slug) DO NOTHING;

-- 6. 加工食品のサブカテゴリ
INSERT INTO return_item_subcategories (category_id, name, slug, display_order) VALUES
  (6, 'レトルト・冷凍食品', 'retort-frozen', 1),
  (6, '缶詰', 'canned', 2),
  (6, '麺類', 'noodles', 3),
  (6, '漬物', 'pickles', 4),
  (6, '佃煮', 'tsukudani', 5),
  (6, '梅干し', 'umeboshi', 6),
  (6, '味噌', 'miso', 7),
  (6, '豆腐', 'tofu', 8),
  (6, 'その他加工品', 'other-processed', 9)
ON CONFLICT (category_id, slug) DO NOTHING;

-- 7. 飲料・酒のサブカテゴリ
INSERT INTO return_item_subcategories (category_id, name, slug, display_order) VALUES
  (7, '日本酒', 'sake', 1),
  (7, 'ビール', 'beer', 2),
  (7, '焼酎', 'shochu', 3),
  (7, 'ワイン', 'wine', 4),
  (7, 'ウイスキー', 'whisky', 5),
  (7, 'ジュース', 'juice', 6),
  (7, 'お茶', 'tea', 7),
  (7, 'コーヒー', 'coffee', 8),
  (7, 'ミネラルウォーター', 'water', 9),
  (7, 'その他飲料', 'other-beverage', 10)
ON CONFLICT (category_id, slug) DO NOTHING;

-- 8. お菓子のサブカテゴリ
INSERT INTO return_item_subcategories (category_id, name, slug, display_order) VALUES
  (8, 'ケーキ', 'cake', 1),
  (8, 'クッキー', 'cookie', 2),
  (8, 'チョコレート', 'chocolate', 3),
  (8, '和菓子', 'wagashi', 4),
  (8, 'アイスクリーム', 'ice-cream', 5),
  (8, 'スナック菓子', 'snack', 6),
  (8, 'その他お菓子', 'other-sweets', 7)
ON CONFLICT (category_id, slug) DO NOTHING;

-- 9. 調味料のサブカテゴリ
INSERT INTO return_item_subcategories (category_id, name, slug, display_order) VALUES
  (9, '醤油', 'soy-sauce', 1),
  (9, '塩', 'salt', 2),
  (9, '砂糖', 'sugar', 3),
  (9, '油', 'oil', 4),
  (9, 'ドレッシング', 'dressing', 5),
  (9, 'たれ・ソース', 'sauce', 6),
  (9, 'スパイス', 'spice', 7),
  (9, 'はちみつ', 'honey', 8),
  (9, 'その他調味料', 'other-seasoning', 9)
ON CONFLICT (category_id, slug) DO NOTHING;

-- 10. 日用品のサブカテゴリ
INSERT INTO return_item_subcategories (category_id, name, slug, display_order) VALUES
  (10, 'タオル', 'towel', 1),
  (10, '寝具', 'bedding', 2),
  (10, '食器', 'tableware', 3),
  (10, 'キッチン用品', 'kitchenware', 4),
  (10, 'トイレットペーパー', 'toilet-paper', 5),
  (10, '洗剤', 'detergent', 6),
  (10, 'その他日用品', 'other-daily', 7)
ON CONFLICT (category_id, slug) DO NOTHING;

-- 11. 家電のサブカテゴリ
INSERT INTO return_item_subcategories (category_id, name, slug, display_order) VALUES
  (11, '掃除機', 'vacuum', 1),
  (11, '空気清浄機', 'air-purifier', 2),
  (11, '炊飯器', 'rice-cooker', 3),
  (11, '電子レンジ', 'microwave', 4),
  (11, 'ドライヤー', 'dryer', 5),
  (11, '扇風機', 'fan', 6),
  (11, 'ヒーター', 'heater', 7),
  (11, 'その他家電', 'other-appliance', 8)
ON CONFLICT (category_id, slug) DO NOTHING;

-- 12. 工芸品のサブカテゴリ
INSERT INTO return_item_subcategories (category_id, name, slug, display_order) VALUES
  (12, '陶磁器', 'pottery', 1),
  (12, '漆器', 'lacquerware', 2),
  (12, '木工品', 'woodwork', 3),
  (12, '金属工芸', 'metalwork', 4),
  (12, '織物・染物', 'textile', 5),
  (12, 'ガラス工芸', 'glasswork', 6),
  (12, 'その他工芸品', 'other-craft', 7)
ON CONFLICT (category_id, slug) DO NOTHING;

-- 13. 旅行・体験のサブカテゴリ
INSERT INTO return_item_subcategories (category_id, name, slug, display_order) VALUES
  (13, '宿泊券', 'accommodation', 1),
  (13, '食事券', 'meal-voucher', 2),
  (13, '温泉', 'onsen', 3),
  (13, 'アクティビティ', 'activity', 4),
  (13, 'ゴルフ', 'golf', 5),
  (13, 'その他体験', 'other-experience', 6)
ON CONFLICT (category_id, slug) DO NOTHING;

-- 14. その他のサブカテゴリ
INSERT INTO return_item_subcategories (category_id, name, slug, display_order) VALUES
  (14, 'ギフト券', 'gift-certificate', 1),
  (14, 'ペット用品', 'pet-supplies', 2),
  (14, 'その他', 'miscellaneous', 3)
ON CONFLICT (category_id, slug) DO NOTHING;

-- ============================================================================
-- 6. RLS（Row Level Security）ポリシー設定
-- ============================================================================

-- カテゴリテーブルは全ユーザー読み取り可能（マスターデータ）
ALTER TABLE return_item_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON return_item_categories
  FOR SELECT
  USING (true);

-- サブカテゴリテーブルも全ユーザー読み取り可能
ALTER TABLE return_item_subcategories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view subcategories"
  ON return_item_subcategories
  FOR SELECT
  USING (true);

-- ============================================================================
-- 7. 更新トリガー（updated_atの自動更新）
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_return_item_categories_updated_at
  BEFORE UPDATE ON return_item_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_return_item_subcategories_updated_at
  BEFORE UPDATE ON return_item_subcategories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 完了
-- ============================================================================
-- マイグレーション完了
--
-- 追加されたテーブル:
-- - return_item_categories (14レコード)
-- - return_item_subcategories (~95レコード)
--
-- 追加されたカラム:
-- - donations.product_url
-- - donations.subcategory_id
--
-- 次のステップ:
-- 1. TypeScript型定義の更新
-- 2. フロントエンドUIの実装
-- 3. Server Actionsの更新
-- ============================================================================
