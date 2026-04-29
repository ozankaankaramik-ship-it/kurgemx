-- kaynak-dokumanlar storage bucket (H6 — kaynak doküman yükleme)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'kaynak-dokumanlar',
  'kaynak-dokumanlar',
  false,
  10485760,
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Yalnızca dosya sahibi yükleyebilir/okuyabilir/silebilir
-- Dosya yolu: {kullanici_id}/{proje_id}/{dosya_adi}
CREATE POLICY "kaynak_dokumanlar_insert_own"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'kaynak-dokumanlar'
  AND auth.uid() IS NOT NULL
  AND (string_to_array(name, '/'))[1] = auth.uid()::text
);

CREATE POLICY "kaynak_dokumanlar_select_own"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'kaynak-dokumanlar'
  AND (string_to_array(name, '/'))[1] = auth.uid()::text
);

CREATE POLICY "kaynak_dokumanlar_delete_own"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'kaynak-dokumanlar'
  AND (string_to_array(name, '/'))[1] = auth.uid()::text
);
