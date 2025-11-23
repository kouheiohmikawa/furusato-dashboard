-- Add One-Stop Exception tracking columns to donations table

ALTER TABLE donations 
ADD COLUMN has_one_stop boolean DEFAULT false NOT NULL,
ADD COLUMN one_stop_sent_date date,
ADD COLUMN one_stop_confirmed_date date;

COMMENT ON COLUMN donations.has_one_stop IS 'ワンストップ特例制度を利用するかどうか';
COMMENT ON COLUMN donations.one_stop_sent_date IS 'ワンストップ特例申請書の送付日';
COMMENT ON COLUMN donations.one_stop_confirmed_date IS 'ワンストップ特例申請の受領確認日';
