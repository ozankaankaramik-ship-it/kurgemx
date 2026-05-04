-- projeler.dil sütunu artık kullanıcının Açıklama metninden otomatik algılanan
-- yapay zeka çıktı dilini saklar (TR, EN, AR, RU, JA vb.)
-- Sütun 20260428000001'de oluşturulmuştu; bu migration yalnızca amacını belgeler.
COMMENT ON COLUMN public.projeler.dil IS 'AI çıktı dili: Açıklama metninden karakter analizi ile otomatik algılanır (TR, EN, AR, RU, JA vb.)';
