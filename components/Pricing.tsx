import React, { useState } from 'react'
import { Plan } from '../types'
import { useAuth } from '../contexts/AuthContext'
import { Toast } from './Toast'

interface PricingProps {
  onCheckout: (plan: Plan) => void
}

const PLANS: Plan[] = [
  {
    id: 'volunteer',
    name: 'Plano Voluntário',
    price: 29.9,
    billing: 'monthly'
  },
  {
    id: 'ministry',
    name: 'Plano Ministério',
    price: 49.9,
    billing: 'monthly'
  },
  {
    id: 'premium_annual',
    name: 'Plano Kadosh Design Premium',
    price: 299.9,
    billing: 'annual'
  }
]

export const Pricing: React.FC<PricingProps> = ({ onCheckout }) => {
  const { user } = useAuth()

  // ✅ STATE DO TOAST (NO LUGAR CERTO)
  const [toast, setToast] = useState<{
    visible: boolean
    message: string
    type: 'success' | 'error' | 'info'
  }>({
    visible: false,
    message: '',
    type: 'info'
  })

  const hasBlockingSubscription =
    !!user &&
    user.plan !== 'free' &&
    user.autoRenew === true

  
  function handleCheckout(plan: Plan) {
    if (!user) {
      onCheckout(plan)
      return
    }

    if (hasBlockingSubscription) {
      setToast({
        visible: true,
        message:
          'Você já possui uma assinatura ativa. Gerencie sua assinatura no dashboard.',
        type: 'info'
      })
      return
    }

    onCheckout(plan)
  }

  return (
    <>
      <section className="py-12 md:py-20 animate-[fadeIn_0.5s_ease-out]">
        <div className="max-w-7xl mx-auto px-4">

          {/* HERO */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
              Escolha o plano que{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
                impulsionará
              </span>{' '}
              seu ministério.
            </h2>
            <p className="text-text-muted max-w-2xl mx-auto text-lg font-light">
              Tenha acesso a milhares de arquivos editáveis com cotas diárias.
            </p>
          </div>

          {/* GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">

            <PlanCard
              title="Voluntário"
              price="29,90"
              billing="/mês"
              description="Ideal para demandas pontuais e rápidas."
              quota="3 Downloads / dia"
              note="Aprox. 90 downloads/mês"
              features={[
                'Acesso a Arquivos Premium',
                'Licença de Uso Comercial',
                'Suporte via E-mail'
              ]}
              buttonLabel="Começar Agora"
              onClick={() => handleCheckout(PLANS[0])}
            />

            <PlanCard
              highlight
              title="Ministério"
              price="49,90"
              billing="/mês"
              description="Para igrejas que comunicam todos os dias."
              quota="7 Downloads / dia"
              note="Aprox. 210 downloads/mês"
              features={[
                'Acesso Prioritário a Lançamentos',
                'Suporte Rápido via WhatsApp',
                'Acesso a Pedidos de Artes'
              ]}
              buttonLabel="Assinar Mensal"
              onClick={() => handleCheckout(PLANS[1])}
            />

            <PlanCard
              title="Kadosh Design Premium"
              price="299,99"
              billing="/ano"
              description="Todos os benefícios do plano Ministério."
              quota="7 Downloads / dia"
              note="Melhor custo-benefício"
              features={[
                'Todos benefícios do Plano Ministério',
                'Pagamento Único',
                'Parcelamento em até 12x'
              ]}
              buttonLabel="Garantir Oferta Anual"
              onClick={() => handleCheckout(PLANS[2])}
              accent="amber"
            />
          </div>
        </div>
      </section>

      {/* ✅ TOAST RENDERIZADO */}
      <Toast
        message={toast.message}
        isVisible={toast.visible}
        type={toast.type}
        onClose={() =>
          setToast((prev) => ({
            ...prev,
            visible: false
          }))
        }
      />
    </>
  )
}

/* ------------------------------------------------------------------ */
/* CARD REUTILIZÁVEL */
/* ------------------------------------------------------------------ */

interface PlanCardProps {
  title: string
  price: string
  billing: string
  description: string
  quota: string
  note?: string
  features: string[]
  buttonLabel: string
  onClick: () => void
  highlight?: boolean
  accent?: 'amber'
}

function PlanCard({
  title,
  price,
  billing,
  description,
  quota,
  note,
  features,
  buttonLabel,
  onClick,
  highlight,
  accent
}: PlanCardProps) {
  return (
    <div
      className={`rounded-2xl p-8 flex flex-col h-full border ${
        highlight
          ? 'bg-white/5 border-primary/40 scale-105'
          : 'bg-[rgba(255,255,255,0.03)] border-white/5'
      }`}
    >
      <h3 className="text-lg font-bold text-white mb-2 uppercase">
        {title}
      </h3>

      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-sm text-text-muted">R$</span>
        <span className="text-4xl font-extrabold text-white">
          {price}
        </span>
        <span className="text-sm text-text-muted">{billing}</span>
      </div>

      <p className="text-sm text-text-muted mb-4">{description}</p>

      <div className="mb-4 text-white font-bold">{quota}</div>
      {note && <p className="text-xs text-text-muted mb-4">{note}</p>}

      <ul className="space-y-2 mb-8 flex-1">
        {features.map((f) => (
          <li key={f} className="text-sm text-text-muted">
            {f}
          </li>
        ))}
      </ul>

      <button
        onClick={onClick}
        className={`w-full py-3 rounded-lg font-bold transition-all ${
          accent === 'amber'
            ? 'bg-amber-400 text-black'
            : highlight
            ? 'bg-primary text-white'
            : 'border border-white/20 text-white hover:bg-white/5'
        }`}
      >
        {buttonLabel}
      </button>
    </div>
  )
}
