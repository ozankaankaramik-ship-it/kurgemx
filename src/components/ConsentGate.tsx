import { createClient } from '@/lib/supabase/server'
import OnayModal from './OnayModal'

export default async function ConsentGate({ locale }: { locale: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: kullanici } = await supabase
    .from('kullanicilar')
    .select('kvkk_onay, terms_onay')
    .eq('id', user.id)
    .single()

  if (!kullanici) return null
  if (kullanici.kvkk_onay && kullanici.terms_onay) return null

  return <OnayModal locale={locale} />
}
