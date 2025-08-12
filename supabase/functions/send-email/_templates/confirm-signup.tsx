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

interface ConfirmSignupEmailProps {
  supabase_url: string
  email_action_type: string
  redirect_to: string
  token_hash: string
  token: string
  user_email: string
}

export const ConfirmSignupEmail = ({
  token,
  supabase_url,
  email_action_type,
  redirect_to,
  token_hash,
  user_email,
}: ConfirmSignupEmailProps) => (
  <Html>
    <Head />
    <Preview>Confirme seu cadastro no Marketplace Equino</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Heading style={brandName}>Marketplace Equino</Heading>
        </Section>
        
        <Section style={content}>
          <Heading style={welcomeTitle}>Bem-vindo ao Marketplace Equino</Heading>
          
          <Text style={introText}>
            Obrigado por se cadastrar em nossa plataforma. Para completar seu cadastro 
            e começar a usar todos os recursos disponíveis, confirme seu endereço de email.
          </Text>
          
          <Section style={benefitsSection}>
            <Text style={benefitsTitle}>O que você terá acesso:</Text>
            <div style={benefitsList}>
              <Text style={benefitItem}>• Catálogo completo de produtos equinos</Text>
              <Text style={benefitItem}>• Conexão direta com fornecedores verificados</Text>
              <Text style={benefitItem}>• Sistema de avaliações e reviews</Text>
              <Text style={benefitItem}>• Ofertas e promoções exclusivas</Text>
            </div>
          </Section>
          
          <Section style={ctaSection}>
            <Text style={ctaText}>
              Clique no botão abaixo para confirmar seu email:
            </Text>
            <Link
              href={`${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`}
              style={primaryButton}
            >
              Confirmar Email
            </Link>
          </Section>
          
          <Section style={alternativeSection}>
            <Text style={alternativeText}>
              Ou use este código de confirmação:
            </Text>
            <div style={codeContainer}>
              <code style={confirmationCode}>{token}</code>
            </div>
          </Section>
          
          <Hr style={divider} />
          
          <Section style={securitySection}>
            <Text style={securityTitle}>Informações de Segurança</Text>
            <Text style={securityText}>
              • Este link expira em 24 horas por motivos de segurança
            </Text>
            <Text style={securityText}>
              • Se você não se cadastrou, pode ignorar este email
            </Text>
            <Text style={securityText}>
              • Nunca compartilhe este código com terceiros
            </Text>
          </Section>
        </Section>
        
        <Section style={footer}>
          <Text style={footerBrand}>
            <strong>Marketplace Equino</strong> - Conectando o mundo equino
          </Text>
          <Text style={footerContact}>
            Dúvidas? Fale conosco: contato@marketplaceequino.com.br
          </Text>
          <Text style={footerDisclaimer}>
            Este é um email automático. Para suporte, use nossos canais oficiais.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default ConfirmSignupEmail

const main = {
  backgroundColor: '#f8fafc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  minHeight: '100vh',
  padding: '20px',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  maxWidth: '600px',
  borderRadius: '16px',
  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
}

const logoSection = {
  background: 'linear-gradient(135deg, #2A3441 0%, #3C4753 100%)',
  padding: '48px 24px',
  textAlign: 'center' as const,
}

const brandName = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: '600',
  margin: '0',
  letterSpacing: '-0.025em',
}

const content = {
  padding: '48px 32px',
}

const welcomeTitle = {
  color: '#2A3441',
  fontSize: '32px',
  fontWeight: '600',
  margin: '0 0 24px',
  textAlign: 'center' as const,
  lineHeight: '1.2',
  letterSpacing: '-0.025em',
}

const introText = {
  color: '#3C4753',
  fontSize: '18px',
  lineHeight: '28px',
  margin: '0 0 40px',
  textAlign: 'center' as const,
}

const benefitsSection = {
  backgroundColor: '#F7F8FA',
  borderRadius: '12px',
  padding: '32px',
  margin: '40px 0',
  border: '1px solid #E1E5E9',
}

const benefitsTitle = {
  color: '#2A3441',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 20px',
  textAlign: 'center' as const,
}

const benefitsList = {
  display: 'block',
}

const benefitItem = {
  color: '#3C4753',
  fontSize: '16px',
  lineHeight: '28px',
  margin: '12px 0',
  paddingLeft: '0',
}

const ctaSection = {
  textAlign: 'center' as const,
  margin: '48px 0',
}

const ctaText = {
  color: '#3C4753',
  fontSize: '18px',
  lineHeight: '28px',
  margin: '0 0 32px',
  textAlign: 'center' as const,
}

const primaryButton = {
  background: '#2A3441',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 32px',
  border: 'none',
  letterSpacing: '-0.025em',
}

const alternativeSection = {
  textAlign: 'center' as const,
  margin: '40px 0',
  padding: '32px',
  backgroundColor: '#F7F8FA',
  borderRadius: '12px',
  border: '1px solid #E1E5E9',
}

const alternativeText = {
  color: '#6B7280',
  fontSize: '14px',
  margin: '0 0 20px',
}

const codeContainer = {
  textAlign: 'center' as const,
}

const confirmationCode = {
  display: 'inline-block',
  padding: '16px 24px',
  backgroundColor: '#2A3441',
  color: '#ffffff',
  borderRadius: '8px',
  fontSize: '16px',
  fontFamily: 'Monaco, Consolas, monospace',
  fontWeight: '600',
  letterSpacing: '2px',
  border: 'none',
}

const divider = {
  borderColor: '#E1E5E9',
  margin: '48px 0',
}

const securitySection = {
  backgroundColor: '#F7F8FA',
  borderRadius: '12px',
  padding: '32px',
  margin: '40px 0',
  border: '1px solid #E1E5E9',
}

const securityTitle = {
  color: '#2A3441',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 16px',
  textAlign: 'center' as const,
}

const securityText = {
  color: '#6B7280',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '8px 0',
}

const footer = {
  backgroundColor: '#F7F8FA',
  padding: '40px 32px',
  textAlign: 'center' as const,
  borderTop: '1px solid #E1E5E9',
}

const footerBrand = {
  color: '#2A3441',
  fontSize: '16px',
  margin: '0 0 12px',
  fontWeight: '600',
}

const footerContact = {
  color: '#3C4753',
  fontSize: '14px',
  margin: '8px 0',
  fontWeight: '500',
}

const footerDisclaimer = {
  color: '#6B7280',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '12px 0 0',
}