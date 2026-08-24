import { useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth, type Role } from '../../features/auth/auth-context'
import { useTranslation } from '../../features/i18n/i18n-context'
import {
  Truck,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  Leaf,
  Store,
  Stethoscope,
  Check,
  X,
  ShieldCheck,
  Mail,
  AlertCircle,
  KeyRound,
} from 'lucide-react'
import clsx from 'clsx'

type StakeholderRole = 'customer' | 'nursery' | 'gardener' | 'delivery'
type Mode = 'login' | 'register'

export function LoginPage() {
  const nav = useNavigate()
  const location = useLocation()
  const { login, register, sendPasswordReset } = useAuth()
  const { t } = useTranslation()

  const [selectedRole, setSelectedRole] = useState<StakeholderRole>('customer')
  const [mode, setMode] = useState<Mode>('login')

  // Common fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [city, setCity] = useState('Kolhapur')
  const [address, setAddress] = useState('')

  // Role specific fields
  const [nurseryName, setNurseryName] = useState('')
  const [serviceRadius, setServiceRadius] = useState('15')
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Plants', 'Seeds'])
  const [experienceYears, setExperienceYears] = useState('3')
  const [servicesOffered, setServicesOffered] = useState<string[]>([
    'Plant Doctor Diagnosis',
    'Repotting & Soil Rejuvenation',
  ])
  const [vehicleType, setVehicleType] = useState('Electric Scooter')

  // Status & forgot password states
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)

  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/'

  // Password Strength Evaluation
  const passwordCriteria = useMemo(() => {
    return {
      hasMinLength: password.length >= 6,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      matchesConfirm: password.length > 0 && password === confirmPassword,
    }
  }, [password, confirmPassword])

  const strengthScore = useMemo(() => {
    let score = 0
    if (passwordCriteria.hasMinLength) score++
    if (passwordCriteria.hasUpper) score++
    if (passwordCriteria.hasLower) score++
    if (passwordCriteria.hasNumber) score++
    if (passwordCriteria.hasSpecial) score++
    return score
  }, [passwordCriteria])

  const strengthLabel = useMemo(() => {
    if (password.length === 0) return ''
    if (strengthScore <= 2) return 'Weak'
    if (strengthScore <= 4) return 'Medium'
    return 'Strong'
  }, [password, strengthScore])

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  function toggleService(srv: string) {
    setServicesOffered((prev) =>
      prev.includes(srv) ? prev.filter((s) => s !== srv) : [...prev, srv]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)

    if (mode === 'register') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters.')
        return
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please verify both password entries.')
        return
      }
    }

    setLoading(true)

    try {
      if (mode === 'login') {
        const u = await login(email, password, selectedRole)
        routeUserByRole(u.role)
      } else {
        const u = await register({
          email,
          password,
          name: selectedRole === 'nursery' ? (nurseryName || name) : name,
          phone,
          role: selectedRole,
          address_city: city,
          address_street: address,
          stakeholderDetails: {
            nurseryName: selectedRole === 'nursery' ? nurseryName : undefined,
            ownerName: selectedRole === 'nursery' ? name : undefined,
            serviceArea: city,
            servicesOffered: selectedRole === 'gardener' ? servicesOffered : undefined,
            experienceYears: selectedRole === 'gardener' ? experienceYears : undefined,
            vehicleType: selectedRole === 'delivery' ? vehicleType : undefined,
            city,
          },
        })
        setSuccessMsg(`Account created! A real verification email has been dispatched to ${email}.`)
        setTimeout(() => {
          routeUserByRole(u.role)
        }, 1500)
      }
    } catch (err: unknown) {
      const e = err as { body?: { detail?: string }; message?: string }
      setError(e.body?.detail || e.message || 'Authentication failed. Please verify your credentials.')
    } finally {
      setLoading(false)
    }
  }

  async function handleForgotPasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    const targetEmail = (resetEmail || email).trim()
    if (!targetEmail) {
      setError('Please provide your registered email address.')
      return
    }

    setResetLoading(true)
    setError(null)
    try {
      await sendPasswordReset(targetEmail)
      setSuccessMsg(`Password reset link sent to ${targetEmail}. Please check your inbox and spam folder.`)
      setShowForgotPassword(false)
      setResetEmail('')
    } catch (err: unknown) {
      const e = err as { message?: string }
      setError(e.message || 'Unable to send password reset email. Please try again.')
    } finally {
      setResetLoading(false)
    }
  }

  function routeUserByRole(role: Role) {
    if (role === 'nursery') {
      nav('/nursery')
    } else if (role === 'gardener') {
      nav('/gardener')
    } else if (role === 'delivery') {
      nav('/delivery')
    } else if (role === 'admin') {
      nav('/admin')
    } else {
      nav(from === '/login' ? '/' : from)
    }
  }

  async function quickLogin(role: Role, demoEmail: string) {
    setError(null)
    setSuccessMsg(null)
    setLoading(true)
    try {
      const u = await login(demoEmail, 'Phyto@2026', role)
      routeUserByRole(u.role)
    } catch (err: unknown) {
      const e = err as { message?: string }
      setError(e.message || 'Demo sign-in failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 py-6 pb-20">
      {/* Ecosystem Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100/80 px-4 py-1.5 text-xs font-bold text-phyto-forest border border-emerald-300">
          <Sparkles className="size-4 text-emerald-700" />
          <span>{t('ecosystem_title', 'Join the Plant Ecosystem')}</span>
        </div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-phyto-forest md:text-4xl">
          {mode === 'login' ? 'Welcome Back to Phyto' : 'Register for Phyto Digital Ecosystem'}
        </h1>
        <p className="text-sm text-stone-600 max-w-xl mx-auto">
          {t('ecosystem_subtitle', 'Connecting Customers, Local Nurseries, Gardeners & Delivery Fleets.')}
        </p>
      </div>

      {/* 4-Stakeholder Tabs Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 rounded-2xl bg-stone-100 p-2 shadow-inner border border-stone-200">
        <button
          type="button"
          onClick={() => {
            setSelectedRole('customer')
            setError(null)
          }}
          className={clsx(
            'flex items-center justify-center gap-2.5 rounded-xl py-3 px-3.5 text-xs font-bold transition',
            selectedRole === 'customer'
              ? 'bg-white text-phyto-forest shadow-sm ring-1 ring-stone-200'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
          )}
        >
          <Leaf className="size-4 text-emerald-600" />
          <span>{t('role_customer', 'Customer')}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedRole('nursery')
            setError(null)
          }}
          className={clsx(
            'flex items-center justify-center gap-2.5 rounded-xl py-3 px-3.5 text-xs font-bold transition',
            selectedRole === 'nursery'
              ? 'bg-white text-phyto-forest shadow-sm ring-1 ring-stone-200'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
          )}
        >
          <Store className="size-4 text-amber-600" />
          <span>{t('role_nursery', 'Nursery')}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedRole('gardener')
            setError(null)
          }}
          className={clsx(
            'flex items-center justify-center gap-2.5 rounded-xl py-3 px-3.5 text-xs font-bold transition',
            selectedRole === 'gardener'
              ? 'bg-white text-phyto-forest shadow-sm ring-1 ring-stone-200'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
          )}
        >
          <Stethoscope className="size-4 text-teal-600" />
          <span>{t('role_gardener', 'Gardener / Doctor')}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedRole('delivery')
            setError(null)
          }}
          className={clsx(
            'flex items-center justify-center gap-2.5 rounded-xl py-3 px-3.5 text-xs font-bold transition',
            selectedRole === 'delivery'
              ? 'bg-white text-phyto-forest shadow-sm ring-1 ring-stone-200'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
          )}
        >
          <Truck className="size-4 text-blue-600" />
          <span>{t('role_delivery', 'Delivery Partner')}</span>
        </button>
      </div>

      <div className="grid gap-8 md:grid-cols-12">
        {/* Main Auth Card */}
        <div className="md:col-span-7 rounded-3xl border border-phyto-forest/10 bg-white p-6 sm:p-8 shadow-card space-y-6">
          {/* Mode toggle */}
          <div className="flex border-b border-stone-100 pb-3 justify-between items-center">
            <div className="flex gap-6">
              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  setError(null)
                }}
                className={clsx(
                  'text-sm font-bold pb-2 transition border-b-2',
                  mode === 'login'
                    ? 'border-phyto-forest text-phyto-forest'
                    : 'border-transparent text-stone-400 hover:text-stone-700'
                )}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register')
                  setError(null)
                }}
                className={clsx(
                  'text-sm font-bold pb-2 transition border-b-2',
                  mode === 'register'
                    ? 'border-phyto-forest text-phyto-forest'
                    : 'border-transparent text-stone-400 hover:text-stone-700'
                )}
              >
                Register as {selectedRole === 'customer' ? 'Customer' : selectedRole === 'nursery' ? 'Nursery' : selectedRole === 'gardener' ? 'Gardener' : 'Delivery Partner'}
              </button>
            </div>
          </div>

          {/* Feedback Banners */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800">
              <AlertCircle className="size-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-900">
              <Check className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Forgot Password Panel */}
          {showForgotPassword ? (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 rounded-2xl bg-stone-50 border border-stone-200 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm text-phyto-forest">
                  <KeyRound className="size-4 text-emerald-700" />
                  <span>Reset Password</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="text-xs text-stone-500 hover:text-stone-800 font-semibold"
                >
                  Cancel
                </button>
              </div>
              <p className="text-xs text-stone-600">
                Enter your real registered email address. Firebase Authentication will send an authentic password reset link to your inbox.
              </p>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Registered Email</label>
                <input
                  type="email"
                  required
                  value={resetEmail || email}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full rounded-xl border border-stone-300 p-3 text-sm focus:border-phyto-forest focus:outline-none bg-white"
                />
              </div>
              <button
                type="submit"
                disabled={resetLoading}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-phyto-forest py-3 text-xs font-bold text-white shadow-sm hover:bg-phyto-leaf transition disabled:opacity-50"
              >
                <Mail className="size-4" />
                <span>{resetLoading ? 'Dispatching Reset Link…' : 'Send Password Reset Email'}</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Customer & General Fields */}
              {mode === 'register' && (
                <>
                  {selectedRole === 'nursery' ? (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">Nursery / Business Name</label>
                        <input
                          type="text"
                          required
                          value={nurseryName}
                          onChange={(e) => setNurseryName(e.target.value)}
                          placeholder="e.g. Shinde Botanical Nursery"
                          className="w-full rounded-xl border border-stone-300 p-3 text-sm focus:border-phyto-forest focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">Owner / Manager Name</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Sanjay Shinde"
                          className="w-full rounded-xl border border-stone-300 p-3 text-sm focus:border-phyto-forest focus:outline-none"
                        />
                      </div>
                    </>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Shreeya Sharma"
                        className="w-full rounded-xl border border-stone-300 p-3 text-sm focus:border-phyto-forest focus:outline-none"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98220 00000"
                        className="w-full rounded-xl border border-stone-300 p-3 text-sm focus:border-phyto-forest focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">City / Botanical Hub</label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full rounded-xl border border-stone-300 p-3 text-sm focus:border-phyto-forest focus:outline-none bg-white font-medium text-stone-800"
                      >
                        <option value="Kolhapur">Kolhapur, Maharashtra</option>
                        <option value="Pune">Pune, Maharashtra</option>
                        <option value="Mumbai">Mumbai, Maharashtra</option>
                        <option value="Nashik">Nashik, Maharashtra</option>
                        <option value="Bengaluru">Bengaluru, Karnataka</option>
                        <option value="Delhi NCR">Delhi NCR</option>
                        <option value="Hyderabad">Hyderabad</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Street / Area Address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. Tarabai Park / Nagala Park"
                      className="w-full rounded-xl border border-stone-300 p-3 text-sm focus:border-phyto-forest focus:outline-none"
                    />
                  </div>

                  {/* Role Specific Registration Fields */}
                  {selectedRole === 'nursery' && (
                    <div className="space-y-3 rounded-2xl bg-amber-50/70 border border-amber-200 p-4 text-xs">
                      <p className="font-bold text-amber-900">Nursery Details &amp; Fulfillment</p>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-1">Local Delivery Radius</label>
                        <select
                          value={serviceRadius}
                          onChange={(e) => setServiceRadius(e.target.value)}
                          className="w-full rounded-xl border border-amber-300 p-2.5 bg-white text-xs"
                        >
                          <option value="10">Within 10 km (Hyperlocal)</option>
                          <option value="15">Within 15 km (Kolhapur Hub)</option>
                          <option value="25">Within 25 km (Karveer District)</option>
                          <option value="50">Within 50 km (Regional)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-1">Available Plant Categories</label>
                        <div className="flex flex-wrap gap-1.5">
                          {['Plants', 'Seeds', 'Flowers', 'Fertilizers', 'Pots'].map((cat) => (
                            <button
                              type="button"
                              key={cat}
                              onClick={() => toggleCategory(cat)}
                              className={clsx(
                                'px-3 py-1 rounded-full text-xs font-bold border transition',
                                selectedCategories.includes(cat)
                                  ? 'bg-amber-600 text-white border-amber-600'
                                  : 'bg-white text-stone-600 border-stone-300'
                              )}
                            >
                              {selectedCategories.includes(cat) ? '✓ ' : '+ '}
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedRole === 'gardener' && (
                    <div className="space-y-3 rounded-2xl bg-teal-50/70 border border-teal-200 p-4 text-xs">
                      <p className="font-bold text-teal-900">Gardener &amp; Plant Doctor Specialization</p>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-1">Years of Experience</label>
                        <input
                          type="number"
                          min="1"
                          max="35"
                          value={experienceYears}
                          onChange={(e) => setExperienceYears(e.target.value)}
                          className="w-full rounded-xl border border-teal-300 p-2.5 bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-1">Services Offered</label>
                        <div className="grid grid-cols-2 gap-1.5 text-xs">
                          {[
                            'Plant Doctor Diagnosis',
                            'Repotting & Soil Mix',
                            'Pruning & Styling',
                            'Balcony Garden Setup',
                            'Pest & Fungal Cure',
                            'Monthly Maintenance',
                          ].map((srv) => (
                            <button
                              type="button"
                              key={srv}
                              onClick={() => toggleService(srv)}
                              className={clsx(
                                'p-2 rounded-lg text-left font-medium border transition',
                                servicesOffered.includes(srv)
                                  ? 'bg-teal-700 text-white border-teal-700'
                                  : 'bg-white text-stone-700 border-stone-200'
                              )}
                            >
                              {servicesOffered.includes(srv) ? '✓ ' : '+ '}
                              {srv}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedRole === 'delivery' && (
                    <div className="space-y-3 rounded-2xl bg-blue-50/70 border border-blue-200 p-4 text-xs">
                      <p className="font-bold text-blue-900">Delivery Fleet Information</p>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-1">Vehicle Type</label>
                        <select
                          value={vehicleType}
                          onChange={(e) => setVehicleType(e.target.value)}
                          className="w-full rounded-xl border border-blue-300 p-2.5 bg-white text-xs"
                        >
                          <option value="Electric Scooter">Electric Two-Wheeler (Eco Friendly)</option>
                          <option value="Motorcycle">Standard Two-Wheeler</option>
                          <option value="Delivery Van">Delivery Mini Van (Pots &amp; Trees)</option>
                        </select>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@gmail.com"
                  className="w-full rounded-xl border border-stone-300 p-3 text-sm focus:border-phyto-forest focus:outline-none"
                />
              </div>

              {/* Password Field */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-stone-700">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(true)
                        setError(null)
                      }}
                      className="text-xs font-semibold text-phyto-forest hover:underline"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter secure password (e.g. Phyto@2026)"
                    className="w-full rounded-xl border border-stone-300 p-3 text-sm focus:border-phyto-forest focus:outline-none pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Registration: Password Strength Meter & Checklist */}
              {mode === 'register' && (
                <>
                  {/* Confirm Password Field */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPw ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className={clsx(
                          'w-full rounded-xl border p-3 text-sm focus:outline-none pr-11',
                          confirmPassword && password !== confirmPassword
                            ? 'border-rose-300 bg-rose-50/40 focus:border-rose-500'
                            : 'border-stone-300 focus:border-phyto-forest'
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPw(!showConfirmPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                      >
                        {showConfirmPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Visual Strength Progress Bar */}
                  {password.length > 0 && (
                    <div className="space-y-1.5 rounded-2xl bg-stone-50 border border-stone-200 p-3">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-stone-600">Password Strength:</span>
                        <span
                          className={clsx(
                            strengthLabel === 'Strong'
                              ? 'text-emerald-700'
                              : strengthLabel === 'Medium'
                              ? 'text-amber-600'
                              : 'text-rose-600'
                          )}
                        >
                          {strengthLabel}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 h-2">
                        <div
                          className={clsx(
                            'rounded-full transition-all',
                            strengthScore >= 1 ? (strengthScore <= 2 ? 'bg-rose-500' : strengthScore <= 4 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-stone-200'
                          )}
                        />
                        <div
                          className={clsx(
                            'rounded-full transition-all',
                            strengthScore >= 3 ? (strengthScore <= 4 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-stone-200'
                          )}
                        />
                        <div
                          className={clsx(
                            'rounded-full transition-all',
                            strengthScore >= 5 ? 'bg-emerald-500' : 'bg-stone-200'
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {/* Requirements Checklist */}
                  <div className="space-y-1.5 rounded-2xl bg-stone-50/70 border border-stone-200/80 p-3.5 text-xs text-stone-600">
                    <p className="font-bold text-stone-700 mb-1">Password Requirements:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      <div className="flex items-center gap-1.5">
                        {passwordCriteria.hasMinLength ? (
                          <Check className="size-3.5 text-emerald-600 shrink-0 font-bold" />
                        ) : (
                          <X className="size-3.5 text-stone-400 shrink-0" />
                        )}
                        <span className={clsx(passwordCriteria.hasMinLength && 'font-semibold text-stone-900')}>
                          At least 6 characters
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {passwordCriteria.hasUpper ? (
                          <Check className="size-3.5 text-emerald-600 shrink-0 font-bold" />
                        ) : (
                          <X className="size-3.5 text-stone-400 shrink-0" />
                        )}
                        <span className={clsx(passwordCriteria.hasUpper && 'font-semibold text-stone-900')}>
                          At least 1 uppercase (A-Z)
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {passwordCriteria.hasLower ? (
                          <Check className="size-3.5 text-emerald-600 shrink-0 font-bold" />
                        ) : (
                          <X className="size-3.5 text-stone-400 shrink-0" />
                        )}
                        <span className={clsx(passwordCriteria.hasLower && 'font-semibold text-stone-900')}>
                          At least 1 lowercase (a-z)
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {passwordCriteria.hasNumber ? (
                          <Check className="size-3.5 text-emerald-600 shrink-0 font-bold" />
                        ) : (
                          <X className="size-3.5 text-stone-400 shrink-0" />
                        )}
                        <span className={clsx(passwordCriteria.hasNumber && 'font-semibold text-stone-900')}>
                          At least 1 number (0-9)
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {passwordCriteria.hasSpecial ? (
                          <Check className="size-3.5 text-emerald-600 shrink-0 font-bold" />
                        ) : (
                          <X className="size-3.5 text-stone-400 shrink-0" />
                        )}
                        <span className={clsx(passwordCriteria.hasSpecial && 'font-semibold text-stone-900')}>
                          Special character (!@#$%^&*)
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {passwordCriteria.matchesConfirm ? (
                          <Check className="size-3.5 text-emerald-600 shrink-0 font-bold" />
                        ) : (
                          <X className="size-3.5 text-stone-400 shrink-0" />
                        )}
                        <span className={clsx(passwordCriteria.matchesConfirm && 'font-semibold text-stone-900')}>
                          Passwords match
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || (mode === 'register' && !passwordCriteria.matchesConfirm)}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-phyto-forest py-4 text-sm font-bold text-white shadow-md hover:bg-phyto-leaf disabled:opacity-40 transition cursor-pointer"
              >
                <span>
                  {loading
                    ? 'Authenticating with Firebase…'
                    : mode === 'login'
                    ? `Sign In as ${selectedRole.toUpperCase()}`
                    : `Complete ${selectedRole.toUpperCase()} Registration`}
                </span>
                <ArrowRight className="size-4" />
              </button>
            </form>
          )}
        </div>

        {/* 1-Click Fast Portals */}
        <div className="md:col-span-5 space-y-4">
          <div className="rounded-3xl border border-phyto-forest/10 bg-stone-50 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-700" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-phyto-forest">1-Click Fast Demonstration</h2>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              Test each stakeholder’s custom dashboard immediately with verified credentials:
            </p>

            <div className="space-y-3">
              {/* Customer */}
              <button
                type="button"
                onClick={() => quickLogin('customer', 'customer@phyto.org')}
                disabled={loading}
                className="flex w-full items-center justify-between rounded-2xl border border-stone-200 bg-white p-3.5 text-left shadow-sm hover:border-emerald-500 hover:bg-emerald-50/40 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded-xl bg-emerald-100 text-emerald-800">
                    <Leaf className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-phyto-forest group-hover:text-emerald-800">Customer Demo</p>
                    <p className="text-[11px] text-stone-400">PHYTO GREEN INDEX &amp; Shop</p>
                  </div>
                </div>
                <ArrowRight className="size-4 text-stone-400 group-hover:text-emerald-700" />
              </button>

              {/* Nursery */}
              <button
                type="button"
                onClick={() => quickLogin('nursery', 'nursery@greenleaf.com')}
                disabled={loading}
                className="flex w-full items-center justify-between rounded-2xl border border-stone-200 bg-white p-3.5 text-left shadow-sm hover:border-amber-500 hover:bg-amber-50/40 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded-xl bg-amber-100 text-amber-800">
                    <Store className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-phyto-forest group-hover:text-amber-800">Nursery Partner</p>
                    <p className="text-[11px] text-stone-400">Kolhapur Hub · Stock &amp; Local Orders</p>
                  </div>
                </div>
                <ArrowRight className="size-4 text-stone-400 group-hover:text-amber-700" />
              </button>

              {/* Gardener */}
              <button
                type="button"
                onClick={() => quickLogin('gardener', 'gardener@phyto.org')}
                disabled={loading}
                className="flex w-full items-center justify-between rounded-2xl border border-stone-200 bg-white p-3.5 text-left shadow-sm hover:border-teal-500 hover:bg-teal-50/40 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded-xl bg-teal-100 text-teal-800">
                    <Stethoscope className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-phyto-forest group-hover:text-teal-800">Plant Doctor / Gardener</p>
                    <p className="text-[11px] text-stone-400">Service Bookings &amp; Schedules</p>
                  </div>
                </div>
                <ArrowRight className="size-4 text-stone-400 group-hover:text-teal-700" />
              </button>

              {/* Delivery Partner */}
              <button
                type="button"
                onClick={() => quickLogin('delivery', 'delivery@phyto.org')}
                disabled={loading}
                className="flex w-full items-center justify-between rounded-2xl border border-stone-200 bg-white p-3.5 text-left shadow-sm hover:border-blue-500 hover:bg-blue-50/40 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded-xl bg-blue-100 text-blue-800">
                    <Truck className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-phyto-forest group-hover:text-blue-800">Delivery Partner</p>
                    <p className="text-[11px] text-stone-400">Live Routes &amp; Dispatches</p>
                  </div>
                </div>
                <ArrowRight className="size-4 text-stone-400 group-hover:text-blue-700" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
