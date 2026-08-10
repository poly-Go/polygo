import { useState } from 'react';

const faqs = [
  {
    q: 'How to buy PLP?',
    a: 'Go to the Marketplace tab, enter the amount of USDT you want to spend, and click "Buy PLP". Make sure you have approved USDT spending first.',
  },
  {
    q: 'How to earn referral rewards?',
    a: 'Share your unique referral link from the Referral page. When someone buys PLP using your link, you earn USDT rewards automatically.',
  },
  {
    q: 'What is the minimum sell amount?',
    a: 'The minimum sell amount is set by the contract admin. Check the current minimum on the Marketplace orders section.',
  },
  {
    q: 'How do I cancel a sell order?',
    a: 'Go to Marketplace → Orders tab. Any active sell orders will have a "Cancel" button — click it to cancel.',
  },
  {
    q: 'What wallets are supported?',
    a: 'PolyGo supports WalletConnect v2, MetaMask, Coinbase Wallet, and any other WalletConnect-compatible wallet.',
  },
];

const contactMethods = [
  {
    icon: '📧',
    label: 'Email',
    value: 'SupportPloyGo@gmail.com',
    href: 'mailto:SupportPloyGo@gmail.com',
  },
  {
    icon: '💬',
    label: 'Telegram',
    value: '@PolyGoSupport',
    href: 'https://t.me/PolyGoSupport',
  },
  {
    icon: '🎮',
    label: 'Discord',
    value: 'discord.gg/polygo',
    href: 'https://discord.gg/polygoprotocol',
  },
  {
    icon: '🌐',
    label: 'Website',
    value: 'polygo.protocol',
    href: 'https://polygo.vercel.app',
  },
];

export default function Support() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Help & Support</h1>
        <p className="text-sm text-slate-500 mt-1">
          Get help with PolyGo — contact us or browse the FAQ below.
        </p>
      </div>

      {/* Contact cards */}
      <div className="grid grid-cols-2 gap-3">
        {contactMethods.map(m => (
          <a
            key={m.label}
            href={m.href}
            target="_blank"
            rel="noopener noreferrer"
            className="card p-4 hover:shadow-lg hover:shadow-indigo-100 transition group"
          >
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-xl">{m.icon}</span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{m.label}</span>
            </div>
            <p className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition truncate">
              {m.value}
            </p>
          </a>
        ))}
      </div>

      {/* FAQ */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm">?</span>
          <h3 className="text-lg font-semibold text-slate-800">Frequently Asked Questions</h3>
        </div>
        <div className="mt-3 space-y-1.5">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-indigo-50 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className={`w-full flex items-center justify-between px-4 py-3 text-left transition ${
                  openFaq === i ? 'bg-indigo-50/80' : 'hover:bg-indigo-50/40'
                }`}
              >
                <span className="text-sm font-medium text-slate-700">{faq.q}</span>
                <svg
                  className={`h-5 w-5 text-slate-400 transition-transform ${
                    openFaq === i ? 'rotate-180 text-indigo-500' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openFaq === i && (
                <div className="px-4 pb-3 text-sm text-slate-500 leading-relaxed bg-indigo-50/30">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Additional help */}
      <div className="card p-5 text-center">
        <p className="text-sm text-slate-500">
          Still need help? Reach out to our support team and we'll get back to you within 24 hours.
        </p>
        <a
          href="mailto:SupportPloyGo@gmail.com"
          className="btn-primary mt-3 inline-flex"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Email Support
        </a>
      </div>
    </div>
  );
}
