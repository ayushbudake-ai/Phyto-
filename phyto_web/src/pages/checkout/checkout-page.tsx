import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../features/cart/cart-context'
import { formatInr } from '../../lib/format'
import { apiFetch } from '../../lib/api'
import { Lock, Truck, CreditCard, ClipboardCheck, CheckCircle2 } from 'lucide-react'
import clsx from 'clsx'

type Payment = 'upi' | 'card' | 'cod'

export function CheckoutPage() {
  const nav = useNavigate()
  const { items, subtotal, clear } = useCart()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [payment, setPayment] = useState<Payment>('upi')
  const [submitting, setSubmitting] = useState(false)
  const [orderError, setOrderError] = useState<string | null>(null)
  const [orderPlaced, setOrderPlaced] = useState<{ id: number; total_amount: number } | null>(null)

  const [form, setForm] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    zip: '',
  })

  const disabled = useMemo(() => items.length === 0, [items.length])
  const shipping = subtotal > 0 ? 8 : 0
  const tax = Math.round(subtotal * 0.08 * 100) / 100
  const total = subtotal + shipping + tax

  async function submit() {
    if (disabled || submitting) return
    setSubmitting(true)
    setOrderError(null)
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
      const res = await apiFetch<{ id: number; total_amount: number }>('/orders', {
        method: 'POST',
        json: {
          shipping_name: form.name || 'Valued Customer',
          shipping_street: form.street || 'Default Street',
          shipping_city: form.city || 'Bangalore',
          shipping_pincode: form.zip || '560001',
          shipping_phone: form.phone || '9999999999',
          payment_method: payment === 'cod' ? 'cod' : 'online',
          items: orderItems,
        },
      })
      await clear()
      setOrderPlaced(res)
    } catch (err: unknown) {
      const e = err as { body?: { detail?: string }; message?: string }
      setOrderError(e.body?.detail || e.message || 'Failed to place order. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (orderPlaced) {
    return (
      <div className="mx-auto max-w-lg py-12 text-center">
        <div className="rounded-3xl border border-phyto-forest/10 bg-white p-10 shadow-card">
          <div className="mx-auto grid size-20 place-items-center rounded-full bg-phyto-sage text-phyto-forest">
            <CheckCircle2 className="size-12 text-phyto-leaf" />
          </div>
          <h1 className="font-display mt-6 text-3xl font-semibold text-phyto-forest">Order Confirmed!</h1>
          <p className="mt-2 text-stone-600">
            Thank you for your botanical order. Your order number is{' '}
            <strong className="text-phyto-forest font-mono">#{orderPlaced.id}</strong>.
          </p>
          <div className="mt-6 rounded-2xl bg-stone-50 p-4 text-sm font-semibold text-phyto-forest">
            Total Charged: {formatInr(orderPlaced.total_amount || total)}
          </div>
          <div className="mt-8 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => nav('/shop')}
              className="w-full rounded-full bg-phyto-forest py-3.5 text-sm font-bold text-white hover:bg-phyto-leaf"
            >
              Continue Shopping
            </button>
            <button
              type="button"
              onClick={() => nav('/')}
              className="w-full rounded-full border border-phyto-forest/20 py-3.5 text-sm font-bold text-phyto-forest hover:bg-phyto-sage/40"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  const steps = [
    { n: 1 as const, label: 'Shipping', icon: Truck },
    { n: 2 as const, label: 'Payment', icon: CreditCard },
    { n: 3 as const, label: 'Review', icon: ClipboardCheck },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-phyto-forest">Checkout</h1>
        <p className="mt-1 text-stone-600">Complete your order in three quick steps.</p>
      </div>

      {/* Stepper */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-4">
        {steps.map((s) => {
          const Icon = s.icon
          const done = step > s.n
          const active = step === s.n
          return (
            <div key={s.n} className="flex flex-1 items-center gap-3 sm:max-w-[200px]">
              <div
                className={clsx(
                  'flex w-full items-center gap-3 rounded-2xl border px-4 py-3 transition',
                  active ? 'border-phyto-leaf bg-phyto-sage/50 shadow-sm' : 'border-phyto-forest/10 bg-white',
                  done ? 'opacity-90' : ''
                )}
              >
                <span
                  className={clsx(
                    'grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold',
                    step >= s.n ? 'bg-phyto-forest text-white' : 'bg-stone-200 text-stone-500'
                  )}
                >
                  {s.n}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm font-bold text-phyto-forest">
                    <Icon className="size-4 text-phyto-leaf" />
                    {s.label}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="rounded-3xl border border-phyto-forest/10 bg-white p-6 shadow-card md:p-8">
          {step === 1 && (
            <div>
              <div className="flex items-center gap-2 text-phyto-forest">
                <Truck className="size-5" />
                <h2 className="font-display text-xl font-semibold">Shipping address</h2>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Field label="Full name">
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-2xl border border-phyto-forest/15 px-4 py-3 text-sm font-medium"
                    placeholder="Enter your full name"
                    required
                  />
                </Field>
                <Field label="Phone">
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full rounded-2xl border border-phyto-forest/15 px-4 py-3 text-sm font-medium"
                    placeholder="+91 98765 43210"
                    required
                  />
                </Field>
                <Field label="Street address" className="md:col-span-2">
                  <input
                    value={form.street}
                    onChange={(e) => setForm({ ...form, street: e.target.value })}
                    className="w-full rounded-2xl border border-phyto-forest/15 px-4 py-3 text-sm font-medium"
                    placeholder="Apartment, suite, street"
                    required
                  />
                </Field>
                <Field label="City">
                  <input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full rounded-2xl border border-phyto-forest/15 px-4 py-3 text-sm font-medium"
                    placeholder="City"
                    required
                  />
                </Field>
                <Field label="PIN code">
                  <input
                    value={form.zip}
                    onChange={(e) => setForm({ ...form, zip: e.target.value })}
                    className="w-full rounded-2xl border border-phyto-forest/15 px-4 py-3 text-sm font-medium"
                    placeholder="560001"
                    required
                  />
                </Field>
              </div>
              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-full bg-phyto-forest px-8 py-3.5 text-sm font-bold text-white hover:bg-phyto-leaf"
                >
                  Continue to payment
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="flex items-center gap-2 text-phyto-forest">
                <CreditCard className="size-5" />
                <h2 className="font-display text-xl font-semibold">Payment method</h2>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <PayCard
                  title="UPI / QR"
                  subtitle="Instant UPI payment"
                  active={payment === 'upi'}
                  onClick={() => setPayment('upi')}
                />
                <PayCard
                  title="Card"
                  subtitle="Credit or debit"
                  active={payment === 'card'}
                  onClick={() => setPayment('card')}
                />
                <PayCard
                  title="Cash on Delivery"
                  subtitle="Pay upon delivery"
                  active={payment === 'cod'}
                  onClick={() => setPayment('cod')}
                />
              </div>
              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-full border border-phyto-forest/20 px-6 py-3 text-sm font-bold text-phyto-forest hover:bg-phyto-sage/40"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="rounded-full bg-phyto-forest px-8 py-3.5 text-sm font-bold text-white hover:bg-phyto-leaf"
                >
                  Review order
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-phyto-forest">
                <ClipboardCheck className="size-5" />
                <h2 className="font-display text-xl font-semibold">Review &amp; confirm</h2>
              </div>
              <div className="rounded-2xl border border-phyto-forest/10 bg-stone-50/80 p-4 text-sm">
                <div className="font-bold text-phyto-forest">Shipping details</div>
                <p className="mt-1 text-stone-600">
                  {form.name || 'Not provided'} · {form.phone || 'No phone'}
                </p>
                <p className="text-stone-600">
                  {form.street || 'No street'}, {form.city || 'No city'} {form.zip}
                </p>
                <div className="mt-3 font-bold text-phyto-forest">Payment</div>
                <p className="text-stone-600 capitalize">{payment === 'cod' ? 'Cash on delivery' : payment}</p>
              </div>

              {orderError && <p className="text-sm font-semibold text-red-600">{orderError}</p>}

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-full border border-phyto-forest/20 px-6 py-3 text-sm font-bold text-phyto-forest hover:bg-phyto-sage/40"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={disabled || submitting}
                  onClick={submit}
                  className="rounded-full bg-phyto-forest px-8 py-3.5 text-sm font-bold text-white hover:bg-phyto-leaf disabled:opacity-50"
                >
                  {submitting ? 'Placing order…' : 'Place Order'}
                </button>
              </div>
            </div>
          )}
        </div>

        <aside className="h-fit space-y-4 rounded-3xl border border-phyto-forest/10 bg-stone-50/90 p-6 shadow-card">
          <h2 className="font-display text-lg font-semibold text-phyto-forest">Order summary</h2>
          <div className="max-h-64 space-y-3 overflow-y-auto">
            {items.map((it) => (
              <div key={it.product.id} className="flex gap-3 border-b border-phyto-forest/10 pb-3">
                {it.product.imageUrl && (
                  <img src={it.product.imageUrl} alt="" className="size-14 shrink-0 rounded-lg object-cover" />
                )}
                <div className="min-w-0 flex-1 text-sm">
                  <div className="font-semibold text-phyto-forest">{it.product.name}</div>
                  <div className="text-stone-500">Qty {it.quantity}</div>
                  <div className="font-bold text-phyto-forest">{formatInr(it.product.price * it.quantity)}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-2 border-t border-phyto-forest/10 pt-4 text-sm">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal</span>
              <span className="font-bold">{formatInr(subtotal)}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Eco-friendly shipping</span>
              <span className="font-bold">{formatInr(shipping)}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Tax</span>
              <span className="font-bold">{formatInr(tax)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-phyto-forest">
              <span>Total</span>
              <span>{formatInr(total)}</span>
            </div>
          </div>
          <p className="flex items-center justify-center gap-2 text-xs text-stone-500">
            <Lock className="size-3.5" />
            Secure 256-bit SSL encryption
          </p>
          {disabled ? (
            <Link to="/shop" className="block text-center text-sm font-bold text-phyto-leaf underline">
              Add items to continue
            </Link>
          ) : null}
        </aside>
      </div>
    </div>
  )
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={className}>
      <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-stone-500">{label}</span>
      {children}
    </label>
  )
}

function PayCard({ title, subtitle, active, onClick }: { title: string; subtitle: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'rounded-2xl border-2 p-4 text-left transition',
        active ? 'border-phyto-leaf bg-phyto-sage/40 ring-2 ring-phyto-mint/50' : 'border-phyto-forest/10 bg-white hover:border-phyto-forest/25'
      )}
    >
      <div className="font-bold text-phyto-forest">{title}</div>
      <div className="mt-1 text-xs text-stone-500">{subtitle}</div>
      {active ? <div className="mt-2 text-xs font-bold text-phyto-leaf">✓ Selected</div> : null}
    </button>
  )
}
