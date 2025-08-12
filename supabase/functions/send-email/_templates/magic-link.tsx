import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
  Hr,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface MagicLinkEmailProps {
  supabase_url: string
  email_action_type: string
  redirect_to: string
  token_hash: string
  token: string
  user_email: string
}

export const MagicLinkEmail = ({
  token,
  supabase_url,
  email_action_type,
  redirect_to,
  token_hash,
  user_email,
}: MagicLinkEmailProps) => (
  <Html>
    <Head />
    <Preview>Acesse sua conta no Marketplace Equino</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logo}>
          <Heading style={h1}>🐎 Marketplace Equino</Heading>
        </Section>
        
        <Section style={content}>
          <Heading style={h2}>Acesso à sua conta</Heading>
          
          <Text style={text}>
            Olá! Recebemos uma solicitação para acessar sua conta no Marketplace Equino.
          </Text>
          
          <Text style={text}>
            Clique no botão abaixo para fazer login de forma segura:
          </Text>
          
          <Section style={buttonContainer}>
            <Link
              href={`${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`}
              style={button}
            >
              Acessar Minha Conta
            </Link>
          </Section>
          
          <Text style={text}>
            Ou copie e cole este código de acesso:
          </Text>
          <code style={code}>{token}</code>
          
          <Hr style={hr} />
          
          <Text style={smallText}>
            Se você não solicitou este acesso, pode ignorar este email com segurança.
          </Text>
          
          <Text style={smallText}>
            Este link de acesso expira em 1 hora por motivos de segurança.
          </Text>
        </Section>
        
        <Section style={footer}>
          <Text style={footerText}>
            Marketplace Equino - Conectando o mundo equino
          </Text>
          <Text style={footerText}>
            Este é um email automático, não responda a esta mensagem.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const logo = {
  padding: '32px 20px',
  textAlign: 'center' as const,
}

const content = {
  padding: '0 20px',
}

const h1 = {
  color: '#1f2937',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0',
  textAlign: 'center' as const,
}

const h2 = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 24px',
  textAlign: 'center' as const,
}

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#059669',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 32px',
}

const code = {
  display: 'inline-block',
  padding: '16px 20px',
  width: 'calc(100% - 40px)',
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
  color: '#1f2937',
  fontSize: '14px',
  fontFamily: 'monospace',
  textAlign: 'center' as const,
  margin: '16px 0',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
}

const smallText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 8px',
}

const footer = {
  padding: '32px 20px 0',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#9ca3af',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '0 0 4px',
}