import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — PrepareAI',
  description: 'How PrepareAI collects, uses, and protects your personal data under UK GDPR.',
}

export default function PrivacyPage() {
  return (
    <article className="prose prose-invert prose-sm max-w-none">
      <div className="mb-12">
        <p className="text-violet-400 text-xs font-semibold tracking-widest uppercase mb-3">Legal</p>
        <h1 className="text-4xl font-bold text-white mb-3">Privacy Policy</h1>
        <p className="text-gray-400">Last updated: 2 July 2025</p>
      </div>

      <Section title="1. Who We Are">
        <p>
          PrepareAI is operated as a sole trader business under English law. The data controller responsible for your personal
          data is Roy Vivasi, trading as PrepareAI (<strong className="text-white">royvivasi@gmail.com</strong>).
        </p>
        <p>
          This Privacy Policy explains how we collect, use, store, and protect personal data when you use PrepareAI
          at <strong className="text-white">prepareai-777.web.app</strong>. It complies with the UK General Data
          Protection Regulation (UK GDPR) and the Data Protection Act 2018.
        </p>
        <p>
          We are registered with the Information Commissioner&apos;s Office (ICO) as required under the Data Protection
          (Charges and Information) Regulations 2018. If you have any questions about how we handle your data, please
          contact us at <strong className="text-white">royvivasi@gmail.com</strong>.
        </p>
      </Section>

      <Section title="2. Data We Collect">
        <Subsection title="2.1 Account Data">
          <p>When you create an account, we collect:</p>
          <ul>
            <li>Email address</li>
            <li>Name (optional, derived from your email prefix if not provided)</li>
            <li>Password (stored as a one-way bcrypt hash — we never store your plaintext password)</li>
            <li>Profile image (if provided via OAuth)</li>
          </ul>
        </Subsection>
        <Subsection title="2.2 Event and Learning Data">
          <p>When you use the service, we collect:</p>
          <ul>
            <li>Events you create: title, type, description, target date, goals</li>
            <li>Materials you upload or link (documents, URLs, text)</li>
            <li>Learning progress: lessons completed, quiz answers, time spent, confidence ratings</li>
            <li>Performance metrics: accuracy, retention scores, streaks</li>
          </ul>
        </Subsection>
        <Subsection title="2.3 Usage and Technical Data">
          <ul>
            <li>AI usage logs: token counts, model used, feature triggered, cost estimate — associated with your account to enforce fair-use limits</li>
            <li>Browser type, device type, and IP address (collected automatically by our hosting provider)</li>
            <li>Pages visited and features used within the application</li>
          </ul>
        </Subsection>
        <Subsection title="2.4 Payment Data">
          <p>
            If you subscribe to a paid plan, payment processing is handled entirely by Stripe, Inc. We never see or store
            your full card number, CVV, or bank details. We store only:
          </p>
          <ul>
            <li>Stripe customer ID and subscription ID</li>
            <li>Your current plan (Free, Pro, Enterprise)</li>
            <li>Subscription status and renewal date</li>
          </ul>
          <p>Stripe&apos;s privacy policy is available at <strong className="text-white">stripe.com/gb/privacy</strong>.</p>
        </Subsection>
      </Section>

      <Section title="3. Legal Basis for Processing">
        <p>We process your personal data under the following lawful bases under UK GDPR Article 6:</p>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-2 pr-4 text-white font-semibold">Purpose</th>
              <th className="text-left py-2 text-white font-semibold">Legal Basis</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Providing the service (creating events, generating curricula)', 'Performance of contract (Art. 6(1)(b))'],
              ['Processing payments and managing subscriptions', 'Performance of contract (Art. 6(1)(b))'],
              ['Preventing abuse, enforcing usage limits', 'Legitimate interests (Art. 6(1)(f))'],
              ['Improving our AI models and service quality', 'Legitimate interests (Art. 6(1)(f))'],
              ['Sending transactional emails (password resets, billing)', 'Performance of contract (Art. 6(1)(b))'],
              ['Complying with legal obligations (tax records, ICO)', 'Legal obligation (Art. 6(1)(c))'],
              ['Marketing communications (with opt-in)', 'Consent (Art. 6(1)(a))'],
            ].map(([purpose, basis]) => (
              <tr key={purpose} className="border-b border-white/[0.05]">
                <td className="py-2.5 pr-4 text-gray-300">{purpose}</td>
                <td className="py-2.5 text-gray-400">{basis}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="4. How We Use Your Data">
        <ul>
          <li><strong className="text-white">Service delivery:</strong> To generate your personalised AI curriculum, track progress, and provide learning content.</li>
          <li><strong className="text-white">Account management:</strong> To authenticate you, manage your subscription, and handle billing.</li>
          <li><strong className="text-white">AI processing:</strong> Your event descriptions, goals, and uploaded materials are sent to Anthropic&apos;s Claude API to generate learning content. We do not use your data to train Anthropic&apos;s models (see Section 5).</li>
          <li><strong className="text-white">Usage limits:</strong> We log AI token usage per account to enforce fair-use limits under each plan and prevent runaway API costs.</li>
          <li><strong className="text-white">Security:</strong> To detect and prevent fraudulent or abusive use of the service.</li>
          <li><strong className="text-white">Legal compliance:</strong> To meet our obligations under UK law, including tax and financial record-keeping.</li>
        </ul>
        <p>
          We do <strong className="text-white">not</strong> sell your personal data to third parties. We do not use your data for advertising
          profiling or share it with data brokers.
        </p>
      </Section>

      <Section title="5. Third-Party Services">
        <p>We use the following sub-processors to operate the service. Each has been assessed for compliance with UK data protection law:</p>
        <div className="space-y-4">
          {[
            {
              name: 'Anthropic PBC',
              purpose: 'AI content generation (Claude API)',
              transfer: 'USA — SCCs / adequacy assessment',
              note: 'Your event content and materials are processed to generate curricula. Anthropic\'s API usage policy states they do not train models on API inputs by default.',
            },
            {
              name: 'Neon Inc.',
              purpose: 'PostgreSQL database hosting',
              transfer: 'EU (eu-west-2 region)',
              note: 'All user account data, events, progress, and usage logs are stored here.',
            },
            {
              name: 'Google (Firebase / Cloud Functions)',
              purpose: 'Application hosting and serverless functions',
              transfer: 'USA — SCCs',
              note: 'Hosts the web application. Google Firebase Hosting and Cloud Functions process requests.',
            },
            {
              name: 'Stripe, Inc.',
              purpose: 'Payment processing',
              transfer: 'USA — SCCs / adequacy assessment',
              note: 'Processes all payment card data. We never receive or store full card details.',
            },
            {
              name: 'Upstash, Inc.',
              purpose: 'Redis cache (session / rate limiting)',
              transfer: 'EU region selected',
              note: 'Used for temporary caching. Does not store persistent personal data.',
            },
          ].map(p => (
            <div key={p.name} className="p-4 rounded-xl border border-white/[0.07] bg-white/[0.02]">
              <div className="flex items-start justify-between gap-4 mb-1">
                <strong className="text-white">{p.name}</strong>
                <span className="text-xs text-gray-500 shrink-0">{p.transfer}</span>
              </div>
              <p className="text-violet-400 text-xs mb-1">{p.purpose}</p>
              <p className="text-gray-400 text-xs">{p.note}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="6. International Transfers">
        <p>
          Some of our sub-processors are based outside the UK. Where we transfer personal data to countries not
          deemed adequate by the UK Government, we rely on the International Data Transfer Agreement (IDTA) or the
          International Data Transfer Addendum (UK Addendum to the EU Standard Contractual Clauses) as the legal
          mechanism for transfer.
        </p>
      </Section>

      <Section title="7. Data Retention">
        <p>We retain personal data for as long as necessary to provide the service and comply with legal obligations:</p>
        <ul>
          <li><strong className="text-white">Active accounts:</strong> Data is retained for the lifetime of your account.</li>
          <li><strong className="text-white">Deleted accounts:</strong> We delete or anonymise personal data within 30 days of account deletion, except where we are required to retain it by law.</li>
          <li><strong className="text-white">Billing records:</strong> Financial and transaction records are retained for 7 years as required by HMRC under the Taxes Management Act 1970.</li>
          <li><strong className="text-white">AI usage logs:</strong> Retained for 12 months for abuse prevention and billing verification, then anonymised.</li>
          <li><strong className="text-white">Backups:</strong> Database backups may retain data for up to 30 days after deletion.</li>
        </ul>
      </Section>

      <Section title="8. Your Rights Under UK GDPR">
        <p>You have the following rights regarding your personal data:</p>
        <div className="space-y-3">
          {[
            ['Right of access', 'Request a copy of all personal data we hold about you (Subject Access Request).'],
            ['Right to rectification', 'Ask us to correct inaccurate or incomplete data.'],
            ['Right to erasure ("right to be forgotten")', 'Request deletion of your personal data where we no longer have a lawful basis to hold it.'],
            ['Right to restrict processing', 'Ask us to pause processing your data in certain circumstances.'],
            ['Right to data portability', 'Receive your data in a structured, machine-readable format (where processing is based on consent or contract).'],
            ['Right to object', 'Object to processing based on legitimate interests. We must stop unless we can demonstrate compelling legitimate grounds.'],
            ['Right to withdraw consent', 'Where processing is based on consent, withdraw it at any time without affecting the lawfulness of prior processing.'],
            ['Rights related to automated decision-making', 'We do not make solely automated decisions with legal or similarly significant effects on you.'],
          ].map(([right, desc]) => (
            <div key={right} className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1.5 shrink-0" />
              <div>
                <strong className="text-white text-sm">{right}</strong>
                <p className="text-gray-400 text-sm">{desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4">
          To exercise any of these rights, email <strong className="text-white">royvivasi@gmail.com</strong>. We will respond within
          one calendar month as required by UK GDPR. We may need to verify your identity before processing your request.
        </p>
        <p>
          If you are unhappy with how we handle your data, you have the right to lodge a complaint with the Information
          Commissioner&apos;s Office (ICO) at <strong className="text-white">ico.org.uk</strong> or by calling 0303 123 1113.
        </p>
      </Section>

      <Section title="9. Cookies">
        <p>We use the following cookies:</p>
        <ul>
          <li><strong className="text-white">Authentication cookies (strictly necessary):</strong> Set by NextAuth.js to maintain your signed-in session. These are essential for the service to function and do not require consent.</li>
          <li><strong className="text-white">CSRF protection cookies (strictly necessary):</strong> Set to protect against cross-site request forgery attacks.</li>
        </ul>
        <p>
          We do not currently use tracking, analytics, or advertising cookies. If we introduce analytics in future,
          we will update this policy and obtain appropriate consent.
        </p>
      </Section>

      <Section title="10. Security">
        <p>We implement appropriate technical and organisational measures to protect your personal data, including:</p>
        <ul>
          <li>Passwords are hashed using bcrypt with a work factor of 12 — never stored in plaintext</li>
          <li>All data in transit is encrypted using TLS 1.2 or higher</li>
          <li>Database access is restricted by IP allowlist and requires TLS</li>
          <li>API keys and secrets are stored as environment variables, not in source code</li>
          <li>Access to production systems is restricted to authorised personnel</li>
        </ul>
        <p>
          No method of internet transmission or electronic storage is 100% secure. In the event of a personal data breach
          that poses a risk to your rights and freedoms, we will notify the ICO within 72 hours and affected users
          without undue delay, as required by UK GDPR Article 33-34.
        </p>
      </Section>

      <Section title="11. Children">
        <p>
          PrepareAI is not directed at children under 13. We do not knowingly collect personal data from children
          under 13. If you believe a child has provided us with personal data, please contact us and we will delete it promptly.
          Users aged 13–17 should have parental consent before using the service.
        </p>
      </Section>

      <Section title="12. Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. We will notify you of significant changes by email
          (if you have an account) and by updating the &quot;Last updated&quot; date at the top of this page. Continued use
          of the service after changes constitutes acceptance of the updated policy.
        </p>
      </Section>

      <Section title="13. Contact Us">
        <p>For any privacy-related queries, requests, or complaints:</p>
        <div className="p-4 rounded-xl border border-white/[0.07] bg-white/[0.02]">
          <p className="text-white font-semibold">PrepareAI (Roy Vivasi, Sole Trader)</p>
          <p className="text-gray-400">Email: <a href="mailto:royvivasi@gmail.com" className="text-violet-400 hover:text-violet-300">royvivasi@gmail.com</a></p>
          <p className="text-gray-400">Response time: within 5 business days (legal requests: within 1 calendar month)</p>
        </div>
      </Section>
    </article>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-white/[0.07]">{title}</h2>
      <div className="space-y-3 text-gray-400 text-sm leading-relaxed">{children}</div>
    </section>
  )
}

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="text-base font-semibold text-gray-200 mb-2">{title}</h3>
      <div className="space-y-2 text-gray-400 text-sm">{children}</div>
    </div>
  )
}
