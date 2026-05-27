import LegalLayout, { generateLegalMetadata } from '@/components/ui/LegalLayout'

export const generateMetadata = () => generateLegalMetadata('privacy')

export default function PrivacyPage() {
  return <LegalLayout tNamespace="privacy" sectionCount={5} />
}
