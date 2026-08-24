import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGreenIndex } from '../../features/green-index/green-index-context'
import { useAuth } from '../../features/auth/auth-context'
import { useTranslation } from '../../features/i18n/i18n-context'
import {
  Award,
  Lock,
  Gift,
  Download,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react'
import clsx from 'clsx'

export function GreenIndexPage() {
  const {
    points,
    targetPoints,
    progressPercentage,
    isChampion,
    activities,
    rewardState,
    claimMilestoneRewards,
    addPoints,
    resetPointsForDemo,
  } = useGreenIndex()

  const { user } = useAuth()
  const { t } = useTranslation()
  const [copiedVoucher, setCopiedVoucher] = useState(false)
  const [showCertificateModal, setShowCertificateModal] = useState(false)

  function copyVoucherCode(code: string) {
    navigator.clipboard.writeText(code)
    setCopiedVoucher(true)
    setTimeout(() => setCopiedVoucher(false), 2500)
  }

  function simulateMilestoneProgress() {
    addPoints(250, 'Botanical Order ORD-DEMO (3 living plants + organic kit)', 'plant', 'DEMO-ORDER')
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* ─────────────────────────────────────────────────────────────
          1. Header & Hero Metric Card
          ───────────────────────────────────────────────────────────── */}
      <div className="rounded-3xl border border-phyto-forest/10 bg-gradient-to-br from-emerald-950 via-phyto-forest to-emerald-900 p-6 md:p-10 text-white shadow-card space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-800/60 px-3 py-1 text-xs font-bold text-emerald-200 border border-emerald-500/30">
              <Award className="size-3.5 text-emerald-400" />
              <span>{t('gi_badge', 'Sustainability & Environmental Gamification')}</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
              {t('gi_title', 'PHYTO GREEN INDEX')}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl">
              Earn Green Points with every plant, heirloom seed, organic fertilizer, and doctor care booking. Reach 1,000 points to become a certified Green Champion.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="rounded-2xl bg-white/10 backdrop-blur-md px-6 py-4 border border-white/15 text-center">
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-200">Current Score</p>
              <p className="font-display text-4xl font-black text-white">{points}</p>
              <p className="text-[11px] text-emerald-300 font-semibold">/ {targetPoints} Points</p>
            </div>
          </div>
        </div>

        {/* Live Progress Bar */}
        <div className="space-y-2 pt-2">
          <div className="flex justify-between text-xs font-bold text-emerald-100">
            <span>Progress: {progressPercentage}% Complete</span>
            <span>{isChampion ? 'Milestone Achieved (Green Champion)' : `${targetPoints - points} points to Green Champion`}</span>
          </div>
          <div className="h-4 w-full rounded-full bg-black/30 p-0.5 border border-white/20">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={clsx(
                'h-full rounded-full transition-all',
                isChampion
                  ? 'bg-gradient-to-r from-teal-300 via-emerald-300 to-green-400 shadow-md'
                  : 'bg-gradient-to-r from-emerald-400 to-teal-400'
              )}
            />
          </div>
        </div>

        {/* Milestone Tier Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-center text-xs font-bold">
          <div className="rounded-xl bg-white/10 p-2.5 border border-white/10">
            <p className="text-emerald-200">Seedling</p>
            <p className="text-[11px] text-stone-300">0 Points</p>
          </div>
          <div className="rounded-xl bg-white/10 p-2.5 border border-white/10">
            <p className="text-emerald-200">Planter</p>
            <p className="text-[11px] text-stone-300">250 Points</p>
          </div>
          <div className="rounded-xl bg-white/10 p-2.5 border border-white/10">
            <p className="text-emerald-200">Botanist</p>
            <p className="text-[11px] text-stone-300">500 Points</p>
          </div>
          <div className={clsx(
            'rounded-xl p-2.5 border transition',
            isChampion
              ? 'bg-emerald-500/30 border-emerald-300 text-white font-black'
              : 'bg-white/10 border-white/10 text-emerald-200'
          )}>
            <p>Green Champion</p>
            <p className="text-[11px] text-stone-300">1000 Points</p>
          </div>
        </div>

        {/* Interactive Simulation & Reset for Demo */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10 text-xs">
          <button
            type="button"
            onClick={simulateMilestoneProgress}
            className="rounded-full bg-white px-4 py-2 font-bold text-phyto-forest hover:bg-emerald-50 shadow-sm transition"
          >
            + Simulate +250 Green Points (Demo Order)
          </button>
          <button
            type="button"
            onClick={resetPointsForDemo}
            className="rounded-full border border-white/30 px-3 py-2 font-bold text-emerald-200 hover:bg-white/10 transition"
          >
            Reset Demo Score
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. Milestone Rewards Claim Section (1000 Points)
          ───────────────────────────────────────────────────────────── */}
      <div className="rounded-3xl border border-phyto-forest/10 bg-white p-6 md:p-8 shadow-card space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-phyto-forest">
              Green Champion Milestone Rewards (1,000 Points)
            </h2>
            <p className="text-xs text-stone-500">
              Unlocks when you reach 1,000 Green Points on the Phyto platform
            </p>
          </div>

          {isChampion && (
            <button
              type="button"
              onClick={claimMilestoneRewards}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-800 transition"
            >
              <Gift className="size-4" />
              <span>{rewardState.claimed ? 'Rewards Claimed' : 'Claim Milestone Bundle'}</span>
            </button>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Reward 1: Digital E-Certificate */}
          <div className="rounded-2xl border border-stone-200 bg-stone-50/80 p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="grid size-9 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
                  <Award className="size-5" />
                </div>
                {isChampion ? (
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                    Unlocked
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-stone-200 px-2.5 py-0.5 text-[10px] font-bold text-stone-600">
                    <Lock className="size-3" /> Locked
                  </span>
                )}
              </div>
              <h3 className="font-display text-base font-bold text-phyto-forest">
                1. Green Champion E-Certificate
              </h3>
              <p className="text-xs text-stone-600">
                Official digital recognition certificate with your name, serial verification ID, and tamper-evident seal.
              </p>
            </div>

            {isChampion ? (
              <button
                type="button"
                onClick={() => {
                  claimMilestoneRewards()
                  setShowCertificateModal(true)
                }}
                className="w-full rounded-xl bg-phyto-forest py-2.5 text-xs font-bold text-white hover:bg-phyto-leaf transition flex items-center justify-center gap-1.5"
              >
                <Award className="size-3.5" />
                <span>View &amp; Print Certificate</span>
              </button>
            ) : (
              <div className="text-[11px] font-semibold text-stone-400 text-center py-2 bg-stone-100 rounded-xl">
                Requires 1000 Points
              </div>
            )}
          </div>

          {/* Reward 2: 25% Off Voucher */}
          <div className="rounded-2xl border border-stone-200 bg-stone-50/80 p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="grid size-9 place-items-center rounded-xl bg-amber-100 text-amber-700">
                  <Gift className="size-5" />
                </div>
                {isChampion ? (
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                    Unlocked
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-stone-200 px-2.5 py-0.5 text-[10px] font-bold text-stone-600">
                    <Lock className="size-3" /> Locked
                  </span>
                )}
              </div>
              <h3 className="font-display text-base font-bold text-phyto-forest">
                2. Milestone 25% Off Voucher
              </h3>
              <p className="text-xs text-stone-600">
                Receive coupon code <strong>GREENCHAMP25</strong> giving 25% discount across all plants and supplies.
              </p>
            </div>

            {isChampion ? (
              <button
                type="button"
                onClick={() => copyVoucherCode(rewardState.voucherCode || 'GREENCHAMP25')}
                className="w-full rounded-xl border border-emerald-600 bg-emerald-50 py-2.5 text-xs font-bold text-emerald-900 hover:bg-emerald-100 transition flex items-center justify-center gap-1.5"
              >
                {copiedVoucher ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                <span>{copiedVoucher ? 'Voucher Code Copied!' : 'Copy Code: GREENCHAMP25'}</span>
              </button>
            ) : (
              <div className="text-[11px] font-semibold text-stone-400 text-center py-2 bg-stone-100 rounded-xl">
                Requires 1000 Points
              </div>
            )}
          </div>

          {/* Reward 3: Free Heirloom Seeds */}
          <div className="rounded-2xl border border-stone-200 bg-stone-50/80 p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="grid size-9 place-items-center rounded-xl bg-teal-100 text-teal-700">
                  <Sparkles className="size-5" />
                </div>
                {isChampion ? (
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                    Unlocked
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-stone-200 px-2.5 py-0.5 text-[10px] font-bold text-stone-600">
                    <Lock className="size-3" /> Locked
                  </span>
                )}
              </div>
              <h3 className="font-display text-base font-bold text-phyto-forest">
                3. Complimentary Heirloom Seeds
              </h3>
              <p className="text-xs text-stone-600">
                Unlock a complimentary packet of <strong>Organic Krishna Tulsi &amp; Saffron Marigold Heirloom Seeds</strong>.
              </p>
            </div>

            {isChampion ? (
              <Link
                to="/shop?cat=Seeds"
                className="w-full rounded-xl bg-phyto-forest py-2.5 text-xs font-bold text-white hover:bg-phyto-leaf transition flex items-center justify-center gap-1.5"
              >
                <span>Add Free Seed Gift</span>
                <ArrowRight className="size-3.5" />
              </Link>
            ) : (
              <div className="text-[11px] font-semibold text-stone-400 text-center py-2 bg-stone-100 rounded-xl">
                Requires 1000 Points
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. Point Earning Rules & Ledger Breakdown
          ───────────────────────────────────────────────────────────── */}
      <div className="grid gap-8 md:grid-cols-12">
        {/* Rules */}
        <div className="md:col-span-5 rounded-3xl border border-phyto-forest/10 bg-white p-6 shadow-card space-y-4">
          <h2 className="font-display text-lg font-bold text-phyto-forest">
            How to Earn Green Points
          </h2>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between rounded-xl bg-stone-50 p-3 border border-stone-100">
              <span className="font-bold text-stone-700">Adopt a Living Plant</span>
              <span className="font-mono font-bold text-emerald-700">+100 Points</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-stone-50 p-3 border border-stone-100">
              <span className="font-bold text-stone-700">Sow Heirloom Seed Pack</span>
              <span className="font-mono font-bold text-emerald-700">+40 Points</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-stone-50 p-3 border border-stone-100">
              <span className="font-bold text-stone-700">Pot / Organic Fertilizer</span>
              <span className="font-mono font-bold text-emerald-700">+60 Points</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-stone-50 p-3 border border-stone-100">
              <span className="font-bold text-stone-700">Book Plant Doctor Consultation</span>
              <span className="font-mono font-bold text-emerald-700">+80 Points</span>
            </div>
          </div>
        </div>

        {/* Activity Ledger History */}
        <div className="md:col-span-7 rounded-3xl border border-phyto-forest/10 bg-white p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h2 className="font-display text-lg font-bold text-phyto-forest">
              Your Green Activity Ledger
            </h2>
            <span className="text-xs text-stone-500">{activities.length} Recorded Actions</span>
          </div>

          <div className="max-h-72 space-y-2.5 overflow-y-auto pr-1">
            {activities.map((act) => (
              <div
                key={act.id}
                className="flex items-center justify-between rounded-xl border border-stone-100 bg-stone-50/60 p-3 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-phyto-forest truncate">{act.title}</p>
                  <p className="text-[11px] text-stone-400 flex items-center gap-1">
                    <Clock className="size-3" />
                    <span>{new Date(act.timestamp).toLocaleDateString()}</span>
                    {act.orderId && <span className="font-mono font-semibold">· #{act.orderId}</span>}
                  </p>
                </div>
                <span className="font-mono font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  +{act.points} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. Certificate Modal (Printable & Downloadable)
          ───────────────────────────────────────────────────────────── */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl border-4 border-emerald-800 text-center space-y-6">
            {/* Certificate Layout */}
            <div className="border-2 border-dashed border-emerald-600/60 p-8 rounded-2xl bg-gradient-to-b from-stone-50 to-emerald-50/40 space-y-4">
              <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-800 text-white shadow-md">
                <Award className="size-8 text-emerald-200" />
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-800">
                  Phyto Digital Plant Ecosystem
                </p>
                <h2 className="font-serif text-3xl font-extrabold text-phyto-forest">
                  Green Champion Certificate
                </h2>
                <p className="text-xs text-stone-500">
                  Certificate ID: <strong className="font-mono text-phyto-forest">{rewardState.certificateId || 'PHYTO-GC-9941'}</strong>
                </p>
              </div>

              <p className="text-xs text-stone-600 max-w-md mx-auto">
                This certifies that
              </p>
              <p className="font-serif text-2xl font-bold text-emerald-950 underline decoration-emerald-500/50 underline-offset-4">
                {user?.name || 'Valued Botanical Patron'}
              </p>
              <p className="text-xs text-stone-600 max-w-md mx-auto">
                has accumulated over <strong>1,000 Green Points</strong> by actively planting living botanicals, sowing heirloom seeds, and supporting sustainable urban biodiversity through verified local nurseries.
              </p>

              <div className="flex justify-between items-center pt-4 border-t border-emerald-200/80 text-[11px] text-stone-500 font-semibold">
                <div className="text-left">
                  <p className="font-mono text-emerald-800 font-bold">Verified Green Status</p>
                  <p>Issue Date: {new Date().toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                  <ShieldCheck className="size-4" />
                  <span>Tamper-Evident Verified</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-full bg-phyto-forest px-6 py-2.5 text-xs font-bold text-white hover:bg-phyto-leaf transition shadow-sm"
              >
                <Download className="size-4" />
                <span>Print / Save as PDF</span>
              </button>
              <button
                type="button"
                onClick={() => setShowCertificateModal(false)}
                className="rounded-full border border-stone-300 px-6 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-100 transition"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
