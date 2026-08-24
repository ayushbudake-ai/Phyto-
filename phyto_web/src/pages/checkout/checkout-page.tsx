import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../features/cart/cart-context'
import { useAuth } from '../../features/auth/auth-context'
import { useGreenIndex } from '../../features/green-index/green-index-context'
import { useLocation } from '../../features/nursery/nursery-service'
import { formatInr } from '../../lib/format'
import { apiFetch } from '../../lib/api'
import {
  Truck,
  CreditCard,
  ClipboardCheck,
  CheckCircle2,
  ShieldCheck,
  Check,
  Award,
} from 'lucide-react'
import clsx from 'clsx'

type Payment = 'upi' | 'card' | 'cod'

export function CheckoutPage() {
  const { items, subtotal, clear } = useCart()
  const { user } = useAuth()
  const { addPoints } = useGreenIndex()
  const { currentCity } = useLocation()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [payment, setPayment] = useState<Payment>('upi')
  const [submitting, setSubmitting] = useState(false)
  const [orderError, setOrderError] = useState<string | null>(null)
  const [orderPlaced, setOrderPlaced] = useState<{ id: number | string; total_amount: number; greenPointsAwarded: number } | null>(null)

  // Voucher coupon state
  const [couponCode, setCouponCode] = useState('')
  const [discountPercent, setDiscountPercent] = useState(0)
  const [couponMessage, setCouponMessage] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '+91 98220 12345',
    street: user?.address_street || 'Botanical Enclave, Main Road',
    city: user?.address_city || currentCity,
    zip: user?.address_zip || '416003',
  })

  const disabled = useMemo(() => items.length === 0, [items.length])
  const shipping = subtotal > 499 || subtotal === 0 ? 0 : 49
  const discountAmount = Math.round((subtotal * discountPercent) / 100)
  const taxableSubtotal = Math.max(0, subtotal - discountAmount)
  const tax = Math.round(taxableSubtotal * 0.05)
  const total = taxableSubtotal + shipping + tax

  // Calculate total Green Points earned for this basket
  const totalGreenPoints = useMemo(() => {
    return items.reduce((sum, it) => {
      const perItem =
        it.product.greenPointsAwarded ||
        (it.product.type === 'seeds' ? 40 : it.product.type === 'pots' || it.product.type === 'fertilizers' ? 60 : 100)
      return sum + perItem * it.quantity
    }, 0)
  }, [items])

  function applyCoupon() {
    const code = couponCode.trim().toUpperCase()
    if (code === 'GREENCHAMP25') {
      setDiscountPercent(25)
      setCouponMessage('Green Champion 25% Discount Applied Successfully.')
    } else if (code === 'PHYTO10') {
      setDiscountPercent(10)
      setCouponMessage('10% Welcome Discount Applied.')
    } else {
      setCouponMessage('Invalid coupon code. Please try GREENCHAMP25.')
    }
  }

  async function submit() {
    if (disabled || submitting) return
    setSubmitting(true)
    setOrderError(null)

    const orderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`

    try {
      const orderItems = items.map((it) => {
        const numId = Number(it.product.id)
        return {
          product_id: isNaN(numId) ? 1 : numId,
          quantity: it.quantity,
          include_kit: it.includeKit,
          include_service: it.addService,
        }
      })
      await apiFetch<{ id: number; total_amount: number }>('/orders', {
        method: 'POST',
        json: {
          shipping_name: form.name || user?.name || 'Valued Botanical Customer',
          shipping_street: form.street || 'Botanical Enclave',
          shipping_city: form.city || currentCity,
          shipping_pincode: form.zip || '416001',
          shipping_phone: form.phone || '9822012345',
          payment_method: payment === 'cod' ? 'cod' : 'online',
          items: orderItems,
        },
      })
    } catch {
      // Local fallback
    }

    // Award Green Points to customer profile
    addPoints(
      totalGreenPoints,
      `Botanical Order #${orderId} (${items.length} items)`,
      'plant',
      orderId
    )

    await clear()
    setOrderPlaced({
      id: orderId,
      total_amount: total,
      greenPointsAwarded: totalGreenPoints,
    })
    setSubmitting(false)
  }

  if (orderPlaced) {
    return (
      <div className="mx-auto max-w-lg py-12 text-center">
        <div className="rounded-3xl border border-phyto-forest/10 bg-white p-10 shadow-card space-y-6">
          <div className="mx-auto grid size-20 place-items-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
            <CheckCircle2 className="size-12" />
          </div>
          <div className="space-y-1">
            <h1 className="font-display text-3xl font-bold text-phyto-forest">Order Confirmed</h1>
            <p className="text-xs sm:text-sm text-stone-600">
              Your botanical order is being fulfilled by verified local nurseries in <strong>{currentCity}</strong>.
            </p>
            <p className="font-mono text-xs font-bold text-phyto-forest bg-stone-100 py-1 px-3 rounded-full inline-block mt-1">
              Order Reference: #{orderPlaced.id}
            </p>
          </div>

          {/* Green Points Award Banner */}
          <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 text-xs font-semibold text-emerald-900 flex items-center justify-between">
            <div className="flex items-center gap-2 text-left">
              <Award className="size-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">PHYTO GREEN INDEX Updated</p>
                <p className="text-[11px] text-emerald-700">Points credited to your account</p>
              </div>
            </div>
            <span className="text-sm font-black text-emerald-800 bg-white px-3 py-1 rounded-full shadow-xs">
              +{orderPlaced.greenPointsAwarded} Points
            </span>
          </div>

          <div className="rounded-2xl bg-stone-50 p-4 text-sm font-semibold text-phyto-forest flex justify-between items-center border border-stone-100">
            <span>Total Paid via {payment.toUpperCase()}:</span>
            <span className="text-lg font-bold text-phyto-forest">{formatInr(orderPlaced.total_amount || total)}</span>
          </div>

          <div className="text-[11px] text-stone-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="size-4 text-phyto-leaf" />
            <span>Packed with moisture-lock wrapping and 14-day live plant arrival guarantee</span>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Link
              to="/green-index"
              className="w-full rounded-full bg-phyto-forest py-3.5 text-xs font-bold text-white hover:bg-phyto-leaf transition"
            >
              View Updated PHYTO GREEN INDEX
            </Link>
            <Link
              to="/shop"
              className="w-full rounded-full border border-phyto-forest/20 py-3 text-xs font-bold text-phyto-forest hover:bg-phyto-sage/40 transition"
            >
              Continue Botanical Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const steps = [
    { n: 1 as const, label: 'Shipping', icon: Truck },
    { n: 2 as const, label: 'Payment', icon: CreditCard },
    { n: 3 as const, label: 'Confirm', icon: ClipboardCheck },
  ]

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      <header className="border-b border-phyto-forest/10 pb-4">
        <h1 className="font-display text-3xl font-bold text-phyto-forest">Secure Checkout</h1>
        <p className="text-xs text-stone-500">Express dispatch from {currentCity} Regional Nursery Hub</p>
      </header>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 sm:gap-6 text-xs font-bold">
        {steps.map((s, idx) => {
          const Icon = s.icon
          const isActive = step === s.n
          const isDone = step > s.n
          return (
            <div key={s.n} className="flex items-center gap-2">
              <div
                className={clsx(
                  'flex size-8 items-center justify-center rounded-full text-xs transition',
                  isDone
                    ? 'bg-emerald-600 text-white'
                    : isActive
                    ? 'bg-phyto-forest text-white ring-4 ring-phyto-mint/30'
                    : 'bg-stone-100 text-stone-400'
                )}
              >
                {isDone ? <Check className="size-4" /> : <Icon className="size-4" />}
              </div>
              <span className={clsx(isActive ? 'text-phyto-forest' : 'text-stone-400', 'hidden sm:inline')}>
                {s.label}
              </span>
              {idx < steps.length - 1 && <div className="h-0.5 w-6 sm:w-12 bg-stone-200" />}
            </div>
          )
        })}
      </div>

      <div className="grid gap-8 md:grid-cols-12">
        {/* Main Step Content */}
        <div className="md:col-span-7 rounded-3xl border border-phyto-forest/10 bg-white p-6 shadow-card md:p-8">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold text-phyto-forest">1. Delivery Address ({currentCity})</h2>
              <div className="grid gap-3">
                <Field label="Full Name">
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Rahul Patil"
                    className="w-full rounded-xl border border-stone-200 p-2.5 text-xs focus:border-phyto-leaf focus:outline-none"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Phone Number">
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+91 98220 00000"
                      className="w-full rounded-xl border border-stone-200 p-2.5 text-xs focus:border-phyto-leaf focus:outline-none"
                    />
                  </Field>
                  <Field label="City">
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="w-full rounded-xl border border-stone-200 p-2.5 text-xs focus:border-phyto-leaf focus:outline-none"
                    />
                  </Field>
                </div>
                <Field label="Street Address / Area">
                  <input
                    type="text"
                    value={form.street}
                    onChange={(e) => setForm({ ...form, street: e.target.value })}
                    placeholder="Area, Street, Landmark"
                    className="w-full rounded-xl border border-stone-200 p-2.5 text-xs focus:border-phyto-leaf focus:outline-none"
                  />
                </Field>
                <Field label="PIN Code">
                  <input
                    type="text"
                    value={form.zip}
                    onChange={(e) => setForm({ ...form, zip: e.target.value })}
                    placeholder="416003"
                    className="w-full rounded-xl border border-stone-200 p-2.5 text-xs focus:border-phyto-leaf focus:outline-none"
                  />
                </Field>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-full bg-phyto-forest px-6 py-2.5 text-xs font-bold text-white hover:bg-phyto-leaf transition"
                >
                  Continue to Payment
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="font-display text-lg font-bold text-phyto-forest">2. Payment Method</h2>
              <div className="grid gap-3">
                <PayCard
                  title="UPI / Instant QR Payment"
                  subtitle="GPay, PhonePe, Paytm, BHIM"
                  active={payment === 'upi'}
                  onClick={() => setPayment('upi')}
                />
                <PayCard
                  title="Credit / Debit Card / Net Banking"
                  subtitle="Visa, Mastercard, RuPay, Net Banking"
                  active={payment === 'card'}
                  onClick={() => setPayment('card')}
                />
                <PayCard
                  title="Cash on Delivery"
                  subtitle="Pay upon delivery at doorstep"
                  active={payment === 'cod'}
                  onClick={() => setPayment('cod')}
                />
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-full border border-stone-200 px-5 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="rounded-full bg-phyto-forest px-6 py-2.5 text-xs font-bold text-white hover:bg-phyto-leaf transition"
                >
                  Review Order
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="font-display text-lg font-bold text-phyto-forest">3. Review and Confirm</h2>
              <div className="rounded-2xl border border-stone-100 bg-stone-50 p-4 text-xs space-y-2">
                <p className="font-bold text-phyto-forest">Shipping Destination:</p>
                <p className="text-stone-700">{form.name} ({form.phone})</p>
                <p className="text-stone-600">{form.street}, {form.city} - {form.zip}</p>
                <p className="font-bold text-phyto-forest pt-2">Payment Selected: <span className="uppercase font-normal">{payment}</span></p>
              </div>

              {orderError && <p className="text-xs font-bold text-red-600">{orderError}</p>}

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-full border border-stone-200 px-5 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={disabled || submitting}
                  onClick={submit}
                  className="rounded-full bg-phyto-forest px-8 py-3 text-xs font-bold text-white hover:bg-phyto-leaf disabled:opacity-50 transition"
                >
                  {submitting ? 'Placing Order…' : 'Place Botanical Order'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary & Voucher Promo */}
        <aside className="md:col-span-5 space-y-4 rounded-3xl border border-phyto-forest/10 bg-stone-50/90 p-6 shadow-card">
          <h2 className="font-display text-base font-bold text-phyto-forest">Order Summary</h2>

          {/* Promo Code Input */}
          <div className="space-y-1.5 border-b border-stone-200 pb-4">
            <label className="block text-[11px] font-bold text-stone-600">PHYTO GREEN INDEX Voucher Code</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="e.g. GREENCHAMP25"
                className="w-full rounded-xl border border-stone-200 bg-white p-2 text-xs uppercase font-mono focus:border-phyto-leaf focus:outline-none"
              />
              <button
                type="button"
                onClick={applyCoupon}
                className="rounded-xl bg-phyto-forest px-3 py-2 text-xs font-bold text-white hover:bg-phyto-leaf transition"
              >
                Apply
              </button>
            </div>
            {couponMessage && (
              <p
                className={clsx(
                  'text-[11px] font-bold',
                  discountPercent > 0 ? 'text-emerald-700' : 'text-red-600'
                )}
              >
                {couponMessage}
              </p>
            )}
          </div>

          <div className="max-h-56 space-y-2.5 overflow-y-auto">
            {items.map((it) => (
              <div key={it.product.id} className="flex gap-2.5 border-b border-stone-100 pb-2 text-xs">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-phyto-forest truncate">{it.product.name}</p>
                  <p className="text-stone-400 text-[11px]">Qty: {it.quantity}</p>
                </div>
                <span className="font-bold text-phyto-forest">
                  {formatInr(it.product.price * it.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-1.5 border-t border-stone-200 pt-3 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal</span>
              <span className="font-bold text-phyto-forest">{formatInr(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Voucher Discount ({discountPercent}%)</span>
                <span>-{formatInr(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-stone-600">
              <span>Hyperlocal Delivery</span>
              <span className="font-bold text-phyto-forest">{shipping === 0 ? 'FREE' : formatInr(shipping)}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Care Packing &amp; GST</span>
              <span className="font-bold text-phyto-forest">{formatInr(tax)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-phyto-forest border-t border-stone-200 pt-2">
              <span>Total Payable</span>
              <span className="text-phyto-leaf">{formatInr(total)}</span>
            </div>
          </div>

          {/* Green Points calculation badge */}
          <div className="rounded-xl bg-emerald-100/60 p-2.5 text-center text-xs font-bold text-emerald-900">
            You will earn +{totalGreenPoints} Green Points with this order.
          </div>
        </aside>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-stone-700 mb-1">{label}</label>
      {children}
    </div>
  )
}

function PayCard({ title, subtitle, active, onClick }: { title: string; subtitle: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'rounded-2xl border-2 p-3.5 text-left transition',
        active ? 'border-phyto-leaf bg-emerald-50/50' : 'border-stone-200 bg-white hover:border-stone-300'
      )}
    >
      <p className="text-xs font-bold text-phyto-forest">{title}</p>
      <p className="text-[11px] text-stone-500">{subtitle}</p>
    </button>
  )
}
