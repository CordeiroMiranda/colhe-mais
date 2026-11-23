import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { donationsAPI } from '@/shared/lib/api/donations'
import { foodBanksAPI } from '@/shared/lib/api/foodBanks'
import { ImageWithFallback } from '@/shared/ui/ImageWithFallback'
import { Check } from '@/shared/ui/InlineIcons'
import { scrollToId, useHashScroll } from '@/shared/lib/scroll'
import { getEnglishInputValidationProps } from '@/shared/lib/nativeValidation'
import {
  formatCardNumber,
  formatExpiryDate,
  getCashDonationValidationMessage,
} from '@/shared/lib/validation'
import PublicPageShell from '@/shared/ui/PublicPageShell'
import type { FoodBank } from '@/shared/types/foodBanks'
import { copyByMode, galleryCards, gbp, helpCards, heroChecks, presetAmounts } from './copy'
import { ui } from './ui'
import type { CardForm, FormNotice, GallerySlide, GivingMode, InfoCardCopy } from './model'

const createEmptyFormData = (): CardForm => ({ email: '', donorName: '', cardNumber: '', expiryDate: '', securityCode: '' })
// 旧版 CTA 仍以 `type=onetime` 深链跳转,而 page model 和 API 内部使用规范化的 `one_time` 值。
const getGivingMode = (search: string): GivingMode => new URLSearchParams(search).get('type')?.toLowerCase() === 'monthly' ? 'monthly' : 'one_time'
const scrollToSection = (id: string) => scrollToId(id)
const cardholderValidationProps = getEnglishInputValidationProps('Nome do Titular do Cartão')
const emailValidationProps = getEnglishInputValidationProps('E-mail')
const customAmountValidationProps = getEnglishInputValidationProps('Valor Personalizado')
const cardNumberValidationProps = getEnglishInputValidationProps('Número do Cartão')
const expiryDateValidationProps = getEnglishInputValidationProps('Data de Validade')
const securityCodeValidationProps = getEnglishInputValidationProps('CVV')
const formatNextChargeDate = (value?: string | null) => {
  if (!value) return ''
  const parsed = new Date(`${value}T00:00:00`)
  return Number.isNaN(parsed.getTime()) ? value : new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }).format(parsed)
}

function SectionIntro({ title, description, descriptionExtraLine }: { title: string; description: string; descriptionExtraLine?: string }) {
  return <div className={ui.sectionIntro}><h2 className={ui.sectionTitle}>{title}</h2><p className={ui.sectionDescription}>{description}{descriptionExtraLine ? <span className={ui.sectionDescriptionLine}>{descriptionExtraLine}</span> : null}</p></div>
}
function CheckListItem({ text }: { text: string }) {
  return (
    <div className={ui.checkItem}>
      <Check className={ui.checkIcon} strokeWidth={3} />
      <span className={ui.checkText}>{text}</span>
    </div>
  )
}
function HelpItemCard({ item }: { item: InfoCardCopy }) { return <div className={ui.helpItem}><div className={ui.helpIconBox}><Check className={ui.helpIcon} strokeWidth={3} /></div><div><h3 className={ui.helpItemTitle}>{item.title}</h3><p className={ui.helpItemText}>{item.description}</p></div></div> }
function GalleryCard({ item }: { item: GallerySlide }) { return <div className={ui.galleryCard}><ImageWithFallback src={item.image} alt={item.alt} className={ui.galleryImage} draggable={false} /><div className={ui.galleryOverlay}><p className={ui.galleryTitle}>{item.title}</p></div></div> }
function FormField({ id, label, required = false, children }: { id: string; label: string; required?: boolean; children: ReactNode }) { return <div><label htmlFor={id} className={ui.label}>{label}{required ? <span className={ui.required}>*</span> : null}</label>{children}</div> }
function FeedbackBanner({ feedback }: { feedback: FormNotice }) { return <div className={`${ui.feedback} ${feedback.type === 'success' ? ui.feedbackSuccess : ui.feedbackError}`} role={feedback.type === 'error' ? 'alert' : 'status'} aria-live="polite">{feedback.message}</div> }

export default function DonateCash() {
  const navigate = useNavigate()
  const location = useLocation()
  const donationMode = getGivingMode(location.search)
  const isMonthlyDonation = donationMode === 'monthly'
  const formCopy = copyByMode[donationMode]
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [foodBanks, setFoodBanks] = useState<FoodBank[]>([])
  const [selectedFoodBankId, setSelectedFoodBankId] = useState('')
  const [foodBankLoadError, setFoodBankLoadError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitFeedback, setFormNotice] = useState<FormNotice | null>(null)
  const [formData, setFormData] = useState<CardForm>(createEmptyFormData)

  useHashScroll({ enabled: location.hash === '#donate-form' })

  useEffect(() => {
    // 首页和支持页的 CTA 可在落地前通过查询字符串预选金额和通知路由。
    const searchParams = new URLSearchParams(location.search)
    const amountParam = searchParams.get('amount')
    const parsedAmount = amountParam ? Number.parseFloat(amountParam) : Number.NaN
    const foodBankIdParam = searchParams.get('foodBankId')
    const parsedFoodBankId = foodBankIdParam ? Number.parseInt(foodBankIdParam, 10) : Number.NaN

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setSelectedAmount(null)
      setCustomAmount('')
    } else if (presetAmounts.includes(parsedAmount)) {
      setSelectedAmount(parsedAmount)
      setCustomAmount('')
    } else {
      setSelectedAmount(null)
      setCustomAmount(parsedAmount.toString())
    }

    if (Number.isInteger(parsedFoodBankId) && parsedFoodBankId > 0) {
      setSelectedFoodBankId(String(parsedFoodBankId))
    }
  }, [location.search])

  useEffect(() => {
    let isCancelled = false

    const loadFoodBanks = async () => {
      try {
        const response = await foodBanksAPI.getFoodBanks()
        if (isCancelled) return
        setFoodBanks(
          [...(response.items ?? [])].sort((left, right) => left.name.localeCompare(right.name, 'pt-BR', { sensitivity: 'base' })),
        )
        setFoodBankLoadError('')
      } catch {
        if (isCancelled) return
        setFoodBankLoadError('Não foi possível carregar os pontos de coleta no momento. Sua doação será direcionada para a coordenação geral do Colhe+.')
      }
    }

    void loadFoodBanks()

    return () => { isCancelled = true }
  }, [])

  const updateFormField = <K extends keyof CardForm>(field: K, value: CardForm[K]) => setFormData((current) => ({ ...current, [field]: value }))
  const updateGivingMode = (nextMode: GivingMode) => {
    if (nextMode === donationMode) return
    const searchParams = new URLSearchParams(location.search)
    searchParams.set('type', nextMode === 'monthly' ? 'monthly' : 'onetime')
    const query = searchParams.toString()
    navigate({ pathname: location.pathname, search: query ? `?${query}` : '', hash: '#donate-form' }, { replace: false })
  }
  const resetForm = () => { setSelectedAmount(null); setCustomAmount(''); setFormData(createEmptyFormData()) }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormNotice(null)
    const finalAmount = selectedAmount ?? Number.parseFloat(customAmount)
    const validationMessage = getCashDonationValidationMessage(finalAmount, formData)
    if (validationMessage) return void setFormNotice({ type: 'error', message: validationMessage })

    setIsSubmitting(true)
    try {
      const donation = await donationsAPI.donateCash({
        donor_name: formData.donorName.trim(),
        donor_email: formData.email.trim(),
        food_bank_id: selectedFoodBankId ? Number(selectedFoodBankId) : undefined,
        amount_pence: Math.round(finalAmount * 100),
        donation_frequency: donationMode,
        card_last4: formData.cardNumber.replace(/\D/g, '').slice(-4),
      })
      const amountLabel = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(finalAmount)
      const referenceLine = donation.payment_reference ? ` Código da transação: ${donation.payment_reference}.` : ''
      const subscriptionLine = donation.subscription_reference ? ` Identificador da assinatura: ${donation.subscription_reference}.` : ''
      const nextChargeLine = donation.next_charge_date ? ` Próxima cobrança: ${formatNextChargeDate(donation.next_charge_date)}.` : ''
      resetForm()
      setFormNotice({
        type: 'success',
        message: isMonthlyDonation
          ? `Seu apoio mensal de ${amountLabel} foi configurado com sucesso!${subscriptionLine}${referenceLine}${nextChargeLine}`
          : `Muito obrigado por sua doação de ${amountLabel}!${referenceLine}`,
      })
    } catch (error) {
      setFormNotice({ type: 'error', message: error instanceof Error ? error.message : 'Não foi possível concluir a doação. Por favor, tente novamente.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PublicPageShell mainClassName={ui.main}>
      <div className={ui.page}>
        <section className={ui.section}>
          <div className={`${ui.sectionInner} ${ui.heroInner}`}>
            <h1 className={ui.heroTitle}>Apoie os pontos de coleta do Colhe+</h1>
            <p className={ui.heroText}>Escolha uma contribuição avulsa ou mensal. Selecione qual ponto de coleta receberá a ajuda ou direcione para a coordenação geral.</p>
            <div className={ui.checkList}>
              {heroChecks.map((benefit) => <CheckListItem key={benefit} text={benefit} />)}
            </div>
            <div className={ui.heroImageWrap}><ImageWithFallback src="https://images.unsplash.com/photo-1738618141224-815f18b8e469?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwYmFuayUyMHNoZWx2ZXMlMjBvcmdhbml6ZWQlMjBkb25hdGlvbnN8ZW58MXx8fHwxNzc0OTQwMDk4fDA&ixlib=rb-4.1.0&q=80&w=1080" alt="Doação para o Colhe+" className={ui.heroImage} /></div>
            <button type="button" onClick={() => scrollToSection('donate-form')} className={ui.primaryButton}>Apoiar Financeiramente</button>
          </div>
        </section>

        <section className={`${ui.section} ${ui.sectionMuted}`}>
          <div className={ui.sectionInner}>
            <SectionIntro title="Para onde vai sua doação" description="As contribuições financeiras são registradas e destinadas para manter a operação e os pontos de coleta." />
            <div className={ui.helpPanel}><div className={ui.helpGrid}>{helpCards.map((item) => <HelpItemCard key={item.title} item={item} />)}</div></div>
            <div className={ui.galleryGrid}>{galleryCards.map((item) => <GalleryCard key={item.title} item={item} />)}</div>
          </div>
        </section>

        <section id="donate-form" className={ui.section}>
          <div className={ui.formInner}>
            <div className={`${ui.sectionIntro} ${ui.formSectionIntro}`}>
              <h2 className={ui.sectionTitle}>{formCopy.heading}</h2>
              <div className={ui.modeSwitch} role="tablist" aria-label="Tipo de doação">
                {[
                  { mode: 'monthly' as const, label: 'Apoio Mensal', selected: isMonthlyDonation },
                  { mode: 'one_time' as const, label: 'Doação Avulsa', selected: !isMonthlyDonation },
                ].map(({ mode, label, selected }) => (
                  <button key={mode} type="button" role="tab" aria-selected={selected} className={`${ui.modeButton} ${selected ? ui.modeButtonActive : ''}`} onClick={() => updateGivingMode(mode)}>{label}</button>
                ))}
              </div>
              <p className={ui.formSubtext}>{formCopy.subtext}</p>
            </div>
            <div className={ui.formCard}>
              <form onSubmit={handleSubmit} className={ui.formStack}>
                <div className={ui.formBlock}>
                  <FormField id="foodBank" label="Direcionamento da Doação">
                    <>
                      <select id="foodBank" value={selectedFoodBankId} onChange={(event) => setSelectedFoodBankId(event.target.value)} className={ui.input}>
                        <option value="">Coordenação Geral do Colhe+ (padrão)</option>
                        {foodBanks.map((bank) => <option key={bank.id} value={bank.id}>{bank.name}</option>)}
                      </select>
                      <p className={foodBankLoadError ? ui.fieldHintError : ui.fieldHint}>
                        {foodBankLoadError || 'Opcional: selecione um ponto de coleta se desejar que a notificação de doação seja encaminhada à equipe local.'}
                      </p>
                    </>
                  </FormField>
                  <div className={ui.formGrid}>
                    <FormField id="donorName" label="Nome do Titular do Cartão " required><input id="donorName" type="text" value={formData.donorName} onChange={(event) => updateFormField('donorName', event.target.value)} required className={ui.input} {...cardholderValidationProps} /></FormField>
                    <FormField id="email" label="E-mail " required><input id="email" type="email" value={formData.email} onChange={(event) => updateFormField('email', event.target.value)} required className={ui.input} {...emailValidationProps} /></FormField>
                  </div>
                </div>
                <div className={ui.formBlock}>
                  <div>
                    <label className={ui.label}>Valor da Doação <span className={ui.required}>*</span></label>
                    <div className={ui.amountGrid}>
                      {presetAmounts.map((amount) => (
                        <button key={amount} type="button" onClick={() => { setSelectedAmount(amount); setCustomAmount('') }} className={`${ui.amountButton} ${selectedAmount === amount ? ui.amountButtonActive : ''}`}>
                          {gbp} {amount}
                        </button>
                      ))}
                    </div>
                  </div>
                  <FormField id="customAmount" label={`Outro Valor (${gbp})`}><input id="customAmount" type="number" placeholder="Digite o valor" value={customAmount} onChange={(event) => { setCustomAmount(event.target.value); setSelectedAmount(null) }} className={ui.input} {...customAmountValidationProps} /></FormField>
                </div>
                <div className={ui.formBlock}>
                  <FormField id="cardNumber" label="Número do Cartão " required><input id="cardNumber" type="text" placeholder="1234 5678 9012 3456" value={formData.cardNumber} onChange={(event) => updateFormField('cardNumber', formatCardNumber(event.target.value))} required className={ui.input} {...cardNumberValidationProps} /></FormField>
                  <div className={ui.formGrid}>
                    <FormField id="expiryDate" label="Data de Validade " required><input id="expiryDate" type="text" placeholder="MM/AA" value={formData.expiryDate} onChange={(event) => updateFormField('expiryDate', formatExpiryDate(event.target.value))} required className={ui.input} {...expiryDateValidationProps} /></FormField>
                    <FormField id="securityCode" label="CVV " required><input id="securityCode" type="text" placeholder="123" value={formData.securityCode} onChange={(event) => updateFormField('securityCode', event.target.value.replace(/\D/g, '').slice(0, 4))} required className={ui.input} {...securityCodeValidationProps} /></FormField>
                  </div>
                </div>
                {submitFeedback ? <FeedbackBanner feedback={submitFeedback} /> : null}
                <button type="submit" disabled={isSubmitting} className={ui.submitButton}>{isSubmitting ? 'Processando...' : formCopy.submitLabel}</button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </PublicPageShell>
  )
}
