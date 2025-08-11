import { EmailAuth } from '@/components/auth/email-auth'

interface EmailAuthPageProps {
  params: {
    type: 'signin' | 'signup'
  }
}

export default function EmailAuthPage({ params }: EmailAuthPageProps) {
  return <EmailAuth type={params.type} />
}