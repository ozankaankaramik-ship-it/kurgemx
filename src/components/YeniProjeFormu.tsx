'use client'

import { useActionState, useState, useRef, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { projeOlustur } from '@/lib/projects/create'

const IZIN_VERILEN_MIME = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
]

export default function YeniProjeFormu() {
  const t = useTranslations('yeniProje')
  const locale = useLocale()
  const defaultDil = locale === 'en' ? 'EN' : 'TR'

  const [state, formAction, isPending] = useActionState(projeOlustur, null)
  const formRef = useRef<HTMLFormElement>(null)
  const [force, setForce] = useState(false)
  const [adDegisti, setAdDegisti] = useState(false)
  const [aciklamaLen, setAciklamaLen] = useState(0)
  const [dosyaAdi, setDosyaAdi] = useState<string | null>(null)
  const [dosyaHata, setDosyaHata] = useState<string | null>(null)

  // Duplicate uyarısı gösterilince adDegisti sıfırla
  useEffect(() => {
    setAdDegisti(false)
  }, [state])

  // force=true olunca formu programatik gönder
  useEffect(() => {
    if (force) {
      formRef.current?.requestSubmit()
      setForce(false)
    }
  }, [force])

  function handleDosya(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) {
      setDosyaAdi(null)
      setDosyaHata(null)
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setDosyaHata(t('hatalar.dosya_buyuk'))
      setDosyaAdi(null)
      e.target.value = ''
      return
    }
    if (!IZIN_VERILEN_MIME.includes(file.type)) {
      setDosyaHata(t('hatalar.dosya_format'))
      setDosyaAdi(null)
      e.target.value = ''
      return
    }
    setDosyaHata(null)
    setDosyaAdi(file.name)
  }

  const errorKey = state?.error
  const errorMsg = errorKey
    ? t.has(`hatalar.${errorKey}` as Parameters<typeof t>[0])
      ? t(`hatalar.${errorKey}` as Parameters<typeof t>[0])
      : t('hatalar.genel')
    : null

  const showDuplicate = state?.warning === 'duplicate' && !adDegisti

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 shadow-sm">
        <h1 className="text-2xl font-bold mb-6">{t('baslik')}</h1>

        <form ref={formRef} action={formAction} className="space-y-5">
          <input type="hidden" name="force" value={force ? 'true' : 'false'} />

          {/* Proje Adı */}
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="ad">
              {t('ad')} <span className="text-red-500">*</span>
            </label>
            <input
              id="ad"
              name="ad"
              type="text"
              placeholder={t('adPlaceholder')}
              maxLength={100}
              required
              onChange={() => setAdDegisti(true)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition"
            />
          </div>

          {/* Açıklama */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium" htmlFor="aciklama">
                {t('aciklama')}
              </label>
              <span className="text-xs text-gray-400">
                {aciklamaLen}/500 {t('karakter')}
              </span>
            </div>
            <textarea
              id="aciklama"
              name="aciklama"
              rows={4}
              placeholder={t('aciklamaPlaceholder')}
              maxLength={500}
              onChange={(e) => setAciklamaLen(e.target.value.length)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition resize-none"
            />
            <p className="mt-1 text-xs text-gray-400">{t('aciklamaYardim')}</p>
          </div>

          {/* Dil Seçimi */}
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="dil">
              {t('dil')}
            </label>
            <select
              id="dil"
              name="dil"
              defaultValue={defaultDil}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition"
            >
              <option value="TR">Türkçe</option>
              <option value="EN">English</option>
            </select>
          </div>

          {/* Kaynak Doküman */}
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="kaynak_dokuman">
              {t('kaynak')}
            </label>
            <input
              id="kaynak_dokuman"
              name="kaynak_dokuman"
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              onChange={handleDosya}
              className="w-full text-sm text-gray-600 dark:text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-100 dark:file:bg-gray-800 hover:file:bg-gray-200 dark:hover:file:bg-gray-700 transition"
            />
            {dosyaAdi && (
              <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                ✓ {dosyaAdi}
              </p>
            )}
            {dosyaHata && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{dosyaHata}</p>
            )}
            <p className="mt-1 text-xs text-gray-400">{t('kaynakYardim')}</p>
          </div>

          {/* Hata mesajı */}
          {errorMsg && (
            <p className="text-sm text-red-600 dark:text-red-400">{errorMsg}</p>
          )}

          {/* K6-05: Mükerrer ad uyarısı */}
          {showDuplicate && (
            <div className="rounded-lg border border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-3">
                {t('mujkerrer.mesaj')}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setForce(true)}
                  className="text-sm font-medium px-3 py-1.5 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition"
                >
                  {t('mujkerrer.devam')}
                </button>
                <span className="text-sm text-yellow-700 dark:text-yellow-400 self-center">
                  {t('mujkerrer.degistir')}
                </span>
              </div>
            </div>
          )}

          {/* Butonlar */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isPending || !!dosyaHata}
              className="flex-1 bg-black dark:bg-white text-white dark:text-black rounded-lg px-4 py-2.5 text-sm font-medium hover:opacity-80 disabled:opacity-50 transition"
            >
              {isPending ? '...' : t('olusturBtn')}
            </button>
            <Link
              href="/projeler"
              className="px-4 py-2.5 text-sm font-medium border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition text-center"
            >
              {t('iptal')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
