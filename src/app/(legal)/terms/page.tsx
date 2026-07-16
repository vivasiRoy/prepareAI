import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — PrepareAI',
  description: 'Terms and conditions for using PrepareAI, governed by the laws of England and Wales.',
}

export default function TermsPage() {
  return (
    <article className="prose prose-invert prose-sm max-w-none">
      <div className="mb-12">
        <p className="text-violet-400 text-xs font-semibold tracking-widest uppercase mb-3">Legal</p>
        <h1 className="text-4xl font-bold text-white mb-3">Terms of Service</h1>
        <p className="text-gray-400">Last updated: 2 July 2025</p>
      </div>

      <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.05] mb-10">
        <p className="text-amber-400 text-sm font-semibold mb-1">Important — Please Read Before Using PrepareAI</p>
        <p className="text-gray-400 text-sm">
          These Terms of Service (&quot;Terms&quot;) form a legally binding contract between you and PrepareAI (operated by Roy Vivasi,
          sole trader, England). By creating an account or using the service, you agree to these Terms in full.
          If you do not agree, do not use PrepareAI.
        </p>
      </div>

      <Section title="1. About Us">
        <p>
          PrepareAI is operated as a sole trader business under the law of England and Wales by Roy Vivasi
          (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;). We are not a limited company. Roy Vivasi trades as PrepareAI and bears unlimited
          personal liability for the business.
        </p>
        <p>
          Contact: <strong className="text-white">royvivasi@gmail.com</strong><br />
          Website: <strong className="text-white">prepareai-777.web.app</strong>
        </p>
        <p>
          We are not currently VAT registered. If our turnover exceeds the VAT threshold (currently £90,000 per year),
          we will register and update these Terms and our pricing accordingly.
        </p>
      </Section>

      <Section title="2. The Service">
        <p>
          PrepareAI is an AI-powered preparation platform that helps users prepare for high-stakes events including
          job interviews, academic examinations, certifications, presentations, and similar scenarios.
          The service provides:
        </p>
        <ul>
          <li>AI-generated personalised learning curricula</li>
          <li>Flashcards, quizzes, mock exams, and micro-lessons</li>
          <li>Progress tracking and performance analytics</li>
          <li>AI-powered mock interview and exam simulations</li>
        </ul>
        <p>
          The service is provided &quot;as is&quot; and is designed as a preparation tool. We do not guarantee specific
          outcomes in any examination, interview, or event for which you prepare.
        </p>
      </Section>

      <Section title="3. Eligibility and Account Registration">
        <p>To use PrepareAI, you must:</p>
        <ul>
          <li>Be at least 13 years old (or 16 in certain EU/EEA jurisdictions if accessing via proxy)</li>
          <li>If aged 13–17, have obtained consent from a parent or guardian</li>
          <li>Provide accurate information when creating your account</li>
          <li>Not impersonate another person or create an account for someone else without authorisation</li>
        </ul>
        <p>
          When you register using an email and password, we create an account automatically on your first sign-in.
          You are responsible for maintaining the confidentiality of your credentials and for all activity under your account.
          Notify us immediately at <strong className="text-white">royvivasi@gmail.com</strong> if you suspect unauthorised access.
        </p>
        <p>
          We reserve the right to suspend or terminate accounts that violate these Terms, without prior notice
          where necessary to protect the service or other users.
        </p>
      </Section>

      <Section title="4. Plans, Pricing and Payment">
        <Subsection title="4.1 Available Plans">
          <p>PrepareAI offers tiered subscription plans. Current pricing is displayed on our website. Plans differ in:</p>
          <ul>
            <li>AI model quality (Haiku on Free, Sonnet on Pro, Sonnet/Opus on Enterprise)</li>
            <li>Monthly AI generation limits (events, curricula, practice sessions)</li>
            <li>Features available (mock exams, advanced analytics, priority support)</li>
          </ul>
        </Subsection>
        <Subsection title="4.2 Billing">
          <ul>
            <li>Paid plans are billed monthly or annually in advance via Stripe.</li>
            <li>All prices are shown in GBP (£) and exclude VAT (as we are not currently VAT registered).</li>
            <li>Payment is due at the start of each billing period. If payment fails, your account will be downgraded to the Free plan.</li>
            <li>We may change pricing with 30 days&apos; notice to existing subscribers via email. Price changes do not apply mid-subscription period.</li>
          </ul>
        </Subsection>
        <Subsection title="4.3 Cancellation">
          <ul>
            <li>You may cancel your subscription at any time from your account settings.</li>
            <li>On cancellation, your paid access continues until the end of the current billing period. We do not offer prorated refunds for partial months unless required by law.</li>
            <li>After cancellation, your account reverts to the Free plan. Your data is retained for 30 days, after which Free plan storage limits apply.</li>
          </ul>
        </Subsection>
      </Section>

      <Section title="5. Right to Cancel (Consumer Contracts Regulations 2013)">
        <p>
          If you are a <strong className="text-white">consumer</strong> (an individual purchasing for personal, non-commercial use) based
          in the United Kingdom, you have the right to cancel any subscription within <strong className="text-white">14 calendar days</strong> of
          first purchase (the &quot;cooling-off period&quot;) under the Consumer Contracts (Information, Cancellation and Additional Charges)
          Regulations 2013.
        </p>
        <p>
          <strong className="text-white">Important — digital content waiver:</strong> By accessing AI-generated content immediately after purchase
          (e.g., generating your first curriculum), you expressly request that we begin providing the digital service before the
          cooling-off period expires. You acknowledge that you thereby lose your right to cancel for that specific content under
          Regulation 36(1).
        </p>
        <p>
          If you have not accessed any AI-generated content, you may cancel within 14 days for a full refund by emailing
          <strong className="text-white"> royvivasi@gmail.com</strong> stating your request to cancel. We will process the refund within 14 days
          to your original payment method.
        </p>
        <p>
          To exercise your right to cancel, you may use this model cancellation form: &quot;I hereby give notice that I cancel my
          subscription to PrepareAI, purchased on [date], Name: [name], Email: [email]&quot; sent to royvivasi@gmail.com.
        </p>
      </Section>

      <Section title="6. Digital Content Quality (Consumer Rights Act 2015)">
        <p>
          If you are a consumer, digital content supplied by PrepareAI must be:
        </p>
        <ul>
          <li><strong className="text-white">Of satisfactory quality</strong> — free from material defects and reasonably fit for purpose</li>
          <li><strong className="text-white">Fit for a particular purpose</strong> — if you told us a specific purpose before purchasing</li>
          <li><strong className="text-white">As described</strong> — matching the description on our website</li>
        </ul>
        <p>
          If digital content does not conform to these requirements, you have the right to a repair or replacement,
          and if that is not possible within a reasonable time without significant inconvenience, you may be entitled
          to a price reduction or, in some cases, a refund. Contact us at <strong className="text-white">royvivasi@gmail.com</strong> to
          exercise these rights.
        </p>
        <p>
          These statutory rights are in addition to any other remedies available under these Terms and cannot be excluded.
        </p>
      </Section>

      <Section title="7. Acceptable Use">
        <p>You agree not to use PrepareAI to:</p>
        <ul>
          <li>Violate any applicable law or regulation</li>
          <li>Attempt to gain unauthorised access to any system, account, or data</li>
          <li>Upload content that is unlawful, defamatory, obscene, or infringes third-party intellectual property rights</li>
          <li>Reverse-engineer, scrape, or attempt to extract the underlying AI models or application source code</li>
          <li>Share your account credentials with others or resell access to the service</li>
          <li>Generate, distribute, or promote harmful, deceptive, or misleading content using the AI tools</li>
          <li>Attempt to circumvent usage limits, rate limits, or plan restrictions by any means</li>
          <li>Use automated tools to access the service at a rate that would degrade its performance for others</li>
        </ul>
        <p>
          We reserve the right to suspend or terminate your account immediately and without refund if you breach
          this section or use the service to facilitate illegal activity.
        </p>
      </Section>

      <Section title="8. AI-Generated Content">
        <Subsection title="8.1 Disclaimer">
          <p>
            Content generated by PrepareAI (curricula, flashcards, quiz questions, mock exam answers, explanations)
            is produced by third-party AI models (Anthropic Claude) based on information you provide. While we strive
            for accuracy, AI-generated content:
          </p>
          <ul>
            <li>May contain factual errors, inaccuracies, or outdated information</li>
            <li>Should not be relied upon as a substitute for qualified professional advice</li>
            <li>Is not reviewed or verified by qualified experts in every domain</li>
          </ul>
          <p>
            Always verify important factual claims through authoritative sources. PrepareAI accepts no liability
            for decisions made in reliance on AI-generated content.
          </p>
        </Subsection>
        <Subsection title="8.2 Ownership of Generated Content">
          <p>
            AI-generated content produced for your account is provided for your personal use. You may not resell,
            sublicense, or commercially exploit AI-generated content produced through your PrepareAI account without
            our prior written consent. You own the data and materials you upload; we do not claim ownership of your
            input content.
          </p>
        </Subsection>
      </Section>

      <Section title="9. Intellectual Property">
        <p>
          The PrepareAI name, logo, application design, source code, and all non-AI-generated content are the
          intellectual property of Roy Vivasi (PrepareAI). Nothing in these Terms grants you any right to use our
          trademarks, trade names, or intellectual property other than as strictly necessary to use the service.
        </p>
        <p>
          You retain all rights to content and materials you upload to PrepareAI. By uploading content, you grant us
          a limited, non-exclusive licence to process and store that content solely to provide the service to you.
          This licence ends when you delete the content or close your account.
        </p>
      </Section>

      <Section title="10. Usage Limits and Fair Use">
        <p>
          Each plan includes a monthly allowance of AI processing (measured in tokens). These limits exist to
          ensure the service remains financially sustainable and fairly accessible to all users. If you reach your
          monthly limit, you will be unable to generate further AI content until the next billing cycle or until
          you upgrade your plan. Limits reset on the first day of each calendar month.
        </p>
        <p>
          We reserve the right to throttle or temporarily suspend accounts that use the service in a way that
          exceeds fair use, even within plan limits, if that use is abusive or adversely impacts other users.
        </p>
      </Section>

      <Section title="11. Limitation of Liability">
        <p>
          <strong className="text-white">Nothing in these Terms limits or excludes liability for:</strong>
        </p>
        <ul>
          <li>Death or personal injury caused by our negligence</li>
          <li>Fraud or fraudulent misrepresentation</li>
          <li>Any liability that cannot be excluded or limited under applicable law (including under the Consumer Rights Act 2015 for consumers)</li>
        </ul>
        <p>
          Subject to the above, and to the fullest extent permitted by law:
        </p>
        <ul>
          <li>We are not liable for any indirect, consequential, special, or punitive losses or damages</li>
          <li>We are not liable for loss of profit, loss of data (beyond what is required by applicable law), loss of opportunity, or reputational damage</li>
          <li>Our total aggregate liability to you in any 12-month period shall not exceed the greater of (a) the total fees paid by you in that period or (b) £100</li>
        </ul>
        <p>
          If you are a <strong className="text-white">consumer</strong>, the Consumer Rights Act 2015 and other consumer protection legislation
          may provide you with additional rights that cannot be excluded. These Terms do not affect those rights.
        </p>
      </Section>

      <Section title="12. Service Availability">
        <p>
          We aim to provide a reliable service but do not guarantee 100% uptime. PrepareAI relies on third-party
          infrastructure (Firebase, Neon, Anthropic) and may be affected by outages beyond our control. We will
          endeavour to notify users of planned maintenance via email or the website.
        </p>
        <p>
          We reserve the right to modify, suspend, or discontinue any part of the service at any time. Where we
          discontinue a paid feature permanently, we will provide reasonable notice and a prorated refund where appropriate.
        </p>
      </Section>

      <Section title="13. Governing Law and Disputes">
        <p>
          These Terms are governed by and construed in accordance with the law of <strong className="text-white">England and Wales</strong>.
          Any dispute arising from or in connection with these Terms shall be subject to the exclusive jurisdiction
          of the courts of England and Wales, except:
        </p>
        <ul>
          <li>If you are a consumer resident in Scotland, you may also bring proceedings in the Scottish courts</li>
          <li>If you are a consumer resident in Northern Ireland, you may also bring proceedings in the Northern Irish courts</li>
        </ul>
        <p>
          Before commencing formal proceedings, we encourage you to contact us at <strong className="text-white">royvivasi@gmail.com</strong> to
          attempt to resolve any dispute informally. We will respond within 10 business days.
        </p>
        <p>
          EU consumers may also use the European Commission&apos;s Online Dispute Resolution platform
          at <strong className="text-white">ec.europa.eu/consumers/odr</strong>, though we prefer direct contact first.
        </p>
      </Section>

      <Section title="14. Changes to These Terms">
        <p>
          We may update these Terms from time to time to reflect changes in our service, pricing, or applicable law.
          We will notify you of material changes by email (if you have an account with us) at least 14 days before
          the changes take effect. For minor changes (e.g., clarifications), we will update the &quot;Last updated&quot; date
          without individual notice.
        </p>
        <p>
          Continued use of PrepareAI after the effective date of updated Terms constitutes your acceptance.
          If you do not accept the updated Terms, you must stop using the service before they take effect and
          may be entitled to a prorated refund for any unused prepaid period.
        </p>
      </Section>

      <Section title="15. General">
        <ul>
          <li><strong className="text-white">Entire agreement:</strong> These Terms, together with our Privacy Policy, constitute the entire agreement between you and PrepareAI regarding use of the service.</li>
          <li><strong className="text-white">Severability:</strong> If any provision of these Terms is held invalid or unenforceable, the remaining provisions continue in full force.</li>
          <li><strong className="text-white">No waiver:</strong> Failure to enforce any provision of these Terms does not constitute a waiver of the right to enforce it in future.</li>
          <li><strong className="text-white">Assignment:</strong> We may assign our rights and obligations under these Terms in connection with a merger, acquisition, or sale of assets. You may not assign your rights without our written consent.</li>
          <li><strong className="text-white">Force majeure:</strong> We are not liable for failures or delays caused by events outside our reasonable control, including natural disasters, internet outages, third-party service failures, or government actions.</li>
        </ul>
      </Section>

      <Section title="16. Contact">
        <div className="p-4 rounded-xl border border-white/[0.07] bg-white/[0.02]">
          <p className="text-white font-semibold">PrepareAI — Roy Vivasi (Sole Trader)</p>
          <p className="text-gray-400">Email: <a href="mailto:royvivasi@gmail.com" className="text-violet-400 hover:text-violet-300">royvivasi@gmail.com</a></p>
          <p className="text-gray-400 text-xs mt-2">
            For billing queries, cancellation requests, or rights under the Consumer Rights Act 2015, please email the above address.
            We aim to respond within 5 business days.
          </p>
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
