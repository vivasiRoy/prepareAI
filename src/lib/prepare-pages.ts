// Programmatic SEO landing pages: /prepare/[slug]
// Each entry targets a "how to prepare for X" search intent and funnels into
// the personalized signup flow with the matching event type pre-selected.

export interface PreparePage {
  slug: string
  eventType: string // pre-selects this in the event wizard after signup
  emoji: string
  name: string // short display name
  title: string // <title> / h1 keyword phrase
  headline: string
  sub: string
  pains: string[]
  plan: { day: string; item: string }[]
  faqs: { q: string; a: string }[]
}

export const PREPARE_PAGES: PreparePage[] = [
  {
    slug: 'coding-interview',
    eventType: 'SOFTWARE_INTERVIEW', emoji: '💻', name: 'Coding Interview',
    title: 'How to Prepare for a Coding Interview',
    headline: 'Your coding interview, reverse-engineered.',
    sub: 'AI builds a day-by-day plan across DS&A patterns, system design, and behavioral rounds — calibrated to your target company and how you actually perform.',
    pains: ['Grinding random LeetCode with no structure', 'System design feels like an ocean', 'Freezing up in live interviews'],
    plan: [
      { day: 'Day 1', item: 'Arrays & hashing — pattern drills' },
      { day: 'Day 3', item: 'Two pointers + sliding window quiz' },
      { day: 'Day 5', item: 'System design: rate limiter simulation' },
      { day: 'Day 7', item: 'Full mock interview with AI feedback' },
    ],
    faqs: [
      { q: 'How long do I need to prepare for a coding interview?', a: 'It depends on your baseline — PrepareAI builds plans from 1-week sprints to 3-month roadmaps, front-loading your weakest patterns first and tapering into full mock interviews as the date approaches.' },
      { q: 'Does it cover system design?', a: 'Yes. Plans include system design simulations (rate limiters, feeds, payment systems) with AI feedback, weighted by the seniority of the role you describe.' },
      { q: 'Can it adapt to my target company?', a: 'Yes — paste the job description or company engineering blog and the AI weaves their stack and interview style into your curriculum.' },
    ],
  },
  {
    slug: 'faang-interview',
    eventType: 'SOFTWARE_INTERVIEW', emoji: '🏢', name: 'FAANG Interview',
    title: 'How to Prepare for a FAANG Interview',
    headline: 'FAANG-calibrated preparation, not generic grinding.',
    sub: 'Google, Meta, Amazon, Apple, Netflix — each loop is different. Tell the AI which one and it builds the exact gauntlet you will face.',
    pains: ['Every FAANG loop has different bars and formats', 'Behavioral rounds are secretly decisive', 'No honest signal on whether you are ready'],
    plan: [
      { day: 'Day 1', item: 'Company-specific loop breakdown' },
      { day: 'Day 4', item: 'Hard DS&A at the L5 bar' },
      { day: 'Day 8', item: 'Leadership-principles behavioral drills' },
      { day: 'Day 12', item: 'Full loop simulation, all rounds' },
    ],
    faqs: [
      { q: 'Is Amazon prep different from Google prep?', a: 'Substantially — Amazon weighs Leadership Principles heavily while Google leans on algorithmic depth and "Googleyness". PrepareAI tailors the plan to the specific company you enter.' },
      { q: 'What level does it prepare me for?', a: 'Describe the role (L3–L7 / E3–E7) and the difficulty, mock-interview bar, and system-design depth calibrate accordingly.' },
      { q: 'How do I know if I am ready?', a: 'Your success-probability score updates after every session and mock — an honest readiness signal, not vibes.' },
    ],
  },
  {
    slug: 'product-manager-interview',
    eventType: 'JOB_INTERVIEW', emoji: '📊', name: 'PM Interview',
    title: 'How to Prepare for a Product Manager Interview',
    headline: 'Product sense you can defend in the room.',
    sub: 'Product design, execution, metrics, strategy, and behavioral — drilled with an AI that pushes back like a real interview panel.',
    pains: ['Frameworks memorized but answers feel hollow', 'Metrics questions go sideways fast', 'No one to practice case rounds with'],
    plan: [
      { day: 'Day 1', item: 'Product sense: three questions that matter' },
      { day: 'Day 3', item: 'Metrics & A/B testing drills' },
      { day: 'Day 5', item: 'Favorite-product deep dive rehearsal' },
      { day: 'Day 7', item: 'Full PM case simulation with feedback' },
    ],
    faqs: [
      { q: 'Which companies does this work for?', a: 'Any PM loop — big tech, startups, or transitioning into product. The plan adapts to the company and level you describe.' },
      { q: 'Can it practice case interviews with me?', a: 'Yes — the AI runs product design and execution cases, asks follow-ups, and scores your structure, insight, and communication.' },
      { q: 'I am switching into PM from engineering — does it handle that?', a: 'Tell it your background and the plan bridges your gaps: more product sense and stakeholder drills, less on what you already know.' },
    ],
  },
  {
    slug: 'job-interview',
    eventType: 'JOB_INTERVIEW', emoji: '🧑‍💼', name: 'Job Interview',
    title: 'How to Prepare for a Job Interview',
    headline: 'Every question anticipated. Every answer rehearsed.',
    sub: 'Paste the job description and your CV — the AI builds question banks from both and rehearses you until nothing surprises you.',
    pains: ['"Tell me about yourself" still feels shaky', 'Generic advice that fits no actual job', 'Nerves erase everything you prepared'],
    plan: [
      { day: 'Day 1', item: 'Your story: STAR answers that stick' },
      { day: 'Day 2', item: 'Role-specific question drills' },
      { day: 'Day 4', item: 'Panel simulation with tough follow-ups' },
      { day: 'Day 6', item: 'Salary conversation rehearsal' },
    ],
    faqs: [
      { q: 'How does it personalize to my job?', a: 'Add the job posting URL and your CV as materials — questions, drills, and mock panels are generated from their actual requirements and your actual experience.' },
      { q: 'Can it help with nerves?', a: 'Repetition under realistic pressure is the best-known cure — the AI panel asks hard follow-ups so the real one feels familiar.' },
      { q: 'What if my interview is this week?', a: 'Sprint mode: the plan compresses to highest-impact drills only, prioritized for the days you have.' },
    ],
  },
  {
    slug: 'aws-certification',
    eventType: 'CERTIFICATION_EXAM', emoji: '☁️', name: 'AWS Certification',
    title: 'How to Prepare for AWS Certification Exams',
    headline: 'Pass AWS on the first attempt.',
    sub: 'Solutions Architect, Developer, SysOps — practice aligned to the actual exam blueprint with a readiness score that tells you honestly when you would pass.',
    pains: ['The service catalog is endless', 'Practice exams do not match the real blueprint', 'No idea if you are actually ready to book it'],
    plan: [
      { day: 'Day 1', item: 'Blueprint mapping — what the exam weighs' },
      { day: 'Day 4', item: 'IAM, VPC & networking drills' },
      { day: 'Day 8', item: 'Well-Architected scenario questions' },
      { day: 'Day 12', item: 'Full-length timed practice exam' },
    ],
    faqs: [
      { q: 'Which AWS certifications does it cover?', a: 'All of them — Cloud Practitioner through Professional and Specialty. Name the exam and the plan follows its official domain weighting.' },
      { q: 'When should I book the real exam?', a: 'When your readiness score holds above ~85% across two full timed mocks — the score is built to be an honest booking signal.' },
      { q: 'Does it work alongside a video course?', a: 'Yes — add your course notes as materials and PrepareAI turns passive watching into active recall, drills, and mocks.' },
    ],
  },
  {
    slug: 'pmp-certification',
    eventType: 'CERTIFICATION_EXAM', emoji: '📋', name: 'PMP Exam',
    title: 'How to Prepare for the PMP Exam',
    headline: 'PMP without drowning in the PMBOK.',
    sub: 'People, Process, Business Environment — drilled by domain weight with situational questions that match the real exam style.',
    pains: ['The PMBOK reads like a phone book', 'Situational questions feel ambiguous', 'Agile vs predictive keeps tripping you up'],
    plan: [
      { day: 'Day 1', item: 'Exam content outline mapped to your gaps' },
      { day: 'Day 5', item: 'Situational judgment drills (People domain)' },
      { day: 'Day 10', item: 'Agile & hybrid scenario sets' },
      { day: 'Day 15', item: 'Full 180-question timed simulation' },
    ],
    faqs: [
      { q: 'Is this aligned to the current PMP exam outline?', a: 'The plan is generated against the current ECO domains and their weights, biased toward the situational style the exam actually uses.' },
      { q: 'How many practice questions will I get?', a: 'Effectively unlimited — every quiz and mock is generated fresh, targeted at your weak domains rather than recycled from a fixed bank.' },
      { q: 'Can I prepare in 3 weeks?', a: 'If you have the 35 contact hours done, a 3-week sprint plan is realistic — the AI compresses to the highest-yield domains first.' },
    ],
  },
  {
    slug: 'bar-exam',
    eventType: 'ACADEMIC_EXAM', emoji: '⚖️', name: 'Bar Exam',
    title: 'How to Prepare for the Bar Exam',
    headline: 'The bar, broken into passable pieces.',
    sub: 'MBE drills, essay practice, and spaced repetition across every subject — with the AI tracking exactly which rules you keep forgetting.',
    pains: ['Seven+ subjects fighting for the same hours', 'Rules memorized Monday are gone by Friday', 'Essay feedback is expensive or nonexistent'],
    plan: [
      { day: 'Day 1', item: 'Diagnostic across MBE subjects' },
      { day: 'Day 5', item: 'Contracts & torts rule drills' },
      { day: 'Day 10', item: 'Essay practice with AI grading' },
      { day: 'Day 20', item: 'Full MBE timed simulation' },
    ],
    faqs: [
      { q: 'Does it replace a bar course?', a: 'It complements one — add your course outlines as materials and PrepareAI becomes the active-recall and essay-feedback layer most courses lack.' },
      { q: 'How does spaced repetition work here?', a: 'Rules you miss come back at widening intervals until you stop missing them — the schedule adapts to your actual forgetting curve.' },
      { q: 'Can it grade my essays?', a: 'Yes — write against generated prompts and get rubric-based feedback on rule statements, analysis, and structure in seconds.' },
    ],
  },
  {
    slug: 'mcat',
    eventType: 'ACADEMIC_EXAM', emoji: '🩺', name: 'MCAT',
    title: 'How to Prepare for the MCAT',
    headline: 'An MCAT plan that adapts to your diagnostics.',
    sub: 'Bio/Biochem, Chem/Phys, CARS, Psych/Soc — the AI finds your weakest systems and rebuilds your schedule around them every week.',
    pains: ['Four sections, one calendar, zero slack', 'CARS refuses to improve with passive review', 'Content review eats the practice time that matters'],
    plan: [
      { day: 'Day 1', item: 'Section diagnostic & gap map' },
      { day: 'Day 7', item: 'Amino acids & metabolism drills' },
      { day: 'Day 14', item: 'CARS timed passage sets' },
      { day: 'Day 21', item: 'Full-length section simulation' },
    ],
    faqs: [
      { q: 'How many months should I plan for?', a: 'Typical plans run 2–6 months depending on your diagnostic. Enter your test date and baseline and the plan paces itself with taper weeks built in.' },
      { q: 'Does it help with CARS specifically?', a: 'Yes — daily timed passages with reasoning-focused feedback, the only approach that reliably moves CARS scores.' },
      { q: 'Can I use my Anki decks and class notes?', a: 'Add them as materials — the AI folds your existing content into the plan instead of starting from scratch.' },
    ],
  },
  {
    slug: 'nclex',
    eventType: 'ACADEMIC_EXAM', emoji: '💉', name: 'NCLEX',
    title: 'How to Prepare for the NCLEX',
    headline: 'Think like the NCLEX wants you to think.',
    sub: 'Next Gen NCLEX case studies, prioritization drills, and safety-first reasoning — generated fresh and targeted at your weak systems.',
    pains: ['NGN case studies feel unlike nursing school', 'Prioritization questions all sound right', 'Test anxiety after a first attempt'],
    plan: [
      { day: 'Day 1', item: 'Diagnostic across client-needs categories' },
      { day: 'Day 4', item: 'Prioritization & delegation drills' },
      { day: 'Day 8', item: 'NGN case-study practice' },
      { day: 'Day 12', item: 'Full adaptive-style simulation' },
    ],
    faqs: [
      { q: 'Does it cover Next Gen NCLEX formats?', a: 'Yes — case studies, matrix questions, and clinical-judgment scenarios in the current NGN style.' },
      { q: 'I failed my first attempt — will this help?', a: 'Especially then. The diagnostic finds the categories that sank you and the plan rebuilds those specifically rather than repeating everything.' },
      { q: 'How is this different from a question bank?', a: 'Banks give you questions; PrepareAI gives you a schedule, adapts it to your misses, and tells you honestly when you are ready to test.' },
    ],
  },
  {
    slug: 'ielts',
    eventType: 'ACADEMIC_EXAM', emoji: '🌍', name: 'IELTS',
    title: 'How to Prepare for the IELTS',
    headline: 'Band 7+ is a plan, not a hope.',
    sub: 'Listening, Reading, Writing, Speaking — daily sessions with AI feedback on your writing and speaking answers, in your language if you want.',
    pains: ['Writing Task 2 scores stuck at 6.0', 'Speaking practice partners are hard to find', 'Band descriptors feel like a mystery'],
    plan: [
      { day: 'Day 1', item: 'Band diagnostic across all four skills' },
      { day: 'Day 3', item: 'Writing Task 2 with descriptor-based feedback' },
      { day: 'Day 5', item: 'Speaking Part 2 rehearsal drills' },
      { day: 'Day 10', item: 'Full timed mock with band estimate' },
    ],
    faqs: [
      { q: 'Can it score my writing?', a: 'Yes — essays get feedback mapped to the official band descriptors: task response, coherence, lexical resource, and grammar.' },
      { q: 'How do I practice speaking alone?', a: 'The AI runs Part 1–3 style interviews and gives feedback on structure and vocabulary; pair it with the voice features to answer out loud.' },
      { q: 'Academic or General Training?', a: 'Both — specify which and the reading/writing tasks match that module.' },
    ],
  },
  {
    slug: 'gmat',
    eventType: 'ACADEMIC_EXAM', emoji: '🎓', name: 'GMAT',
    title: 'How to Prepare for the GMAT',
    headline: 'A GMAT plan built around your quant/verbal split.',
    sub: 'Data Insights, Quant, Verbal — the AI finds where your points are hiding and schedules ruthlessly around them.',
    pains: ['Quant rust from years out of school', 'Data Sufficiency logic feels alien', 'Score plateaus after the first month'],
    plan: [
      { day: 'Day 1', item: 'Sectional diagnostic & target-score gap' },
      { day: 'Day 5', item: 'Data sufficiency drills' },
      { day: 'Day 10', item: 'Critical reasoning sets' },
      { day: 'Day 15', item: 'Full adaptive-style mock' },
    ],
    faqs: [
      { q: 'Is this for the GMAT Focus Edition?', a: 'Yes — plans follow the current three-section structure with Data Insights weighted properly.' },
      { q: 'How long to gain 100 points?', a: 'Highly individual, but plateaus usually break with targeted weak-area drilling — exactly what the adaptive plan does — rather than more full mocks.' },
      { q: 'Can it work around a full-time job?', a: 'Tell it your hours per day and the plan fits 30–90 minute sessions to your real calendar.' },
    ],
  },
  {
    slug: 'salary-negotiation',
    eventType: 'NEGOTIATION', emoji: '💰', name: 'Salary Negotiation',
    title: 'How to Prepare for a Salary Negotiation',
    headline: 'Walk in with a number and a spine.',
    sub: 'BATNA analysis, anchoring strategy, and rehearsals against an AI that lowballs, stalls, and pressures — so the real conversation feels easy.',
    pains: ['You have never said a number out loud', '"That is above our range" ends the conversation', 'Leaving five figures on the table, again'],
    plan: [
      { day: 'Day 1', item: 'BATNA & market-rate analysis' },
      { day: 'Day 2', item: 'Anchor and concession planning' },
      { day: 'Day 3', item: 'Hardball counterparty simulation' },
      { day: 'Day 4', item: 'Full negotiation rehearsal' },
    ],
    faqs: [
      { q: 'Does this work for a raise, not just offers?', a: 'Yes — describe your situation and the plan covers timing, evidence gathering, and the actual conversation for internal raises too.' },
      { q: 'What if they say the budget is fixed?', a: 'You will have rehearsed that exact line — and the six other most common deflections — with responses that keep the negotiation alive.' },
      { q: 'How long does preparation take?', a: 'Most people are dramatically better after a focused 3–5 day plan with two rehearsals. It is the highest-ROI preparation that exists.' },
    ],
  },
  {
    slug: 'startup-pitch',
    eventType: 'SALES_PITCH', emoji: '🚀', name: 'Startup Pitch',
    title: 'How to Prepare for a Startup Pitch',
    headline: 'Pitch investors who have heard everything.',
    sub: 'Narrative, numbers, and the Q&A gauntlet — rehearsed against an AI investor that interrupts, doubts your TAM, and asks about churn.',
    pains: ['The deck is fine; the delivery is not', 'Investor questions derail your flow', 'Metrics questions expose soft spots'],
    plan: [
      { day: 'Day 1', item: 'Narrative arc: problem → traction → ask' },
      { day: 'Day 2', item: 'Metrics defense drills (CAC, churn, TAM)' },
      { day: 'Day 3', item: 'Hostile Q&A simulation' },
      { day: 'Day 5', item: 'Full pitch dress rehearsal' },
    ],
    faqs: [
      { q: 'Can it critique my actual deck?', a: 'Paste your deck notes as materials and the rehearsals reference your actual slides, numbers, and claims.' },
      { q: 'What kind of questions does the AI investor ask?', a: 'The real ones — unit economics, competitive moats, why now, why you — with follow-ups when your answer is soft.' },
      { q: 'Demo day is in 3 days. Enough time?', a: 'Sprint mode builds a 3-day plan: narrative tightening, metric defense, and two full rehearsals.' },
    ],
  },
  {
    slug: 'sales-pitch',
    eventType: 'SALES_PITCH', emoji: '🤝', name: 'Sales Pitch',
    title: 'How to Prepare for a Sales Pitch',
    headline: 'Handle every objection before it exists.',
    sub: 'Roleplay against an AI prospect that stonewalls, lowballs, and raises the exact objections your buyer will — until your pitch is bulletproof.',
    pains: ['Price objections still sting', 'Discovery calls drift without control', 'Every "maybe" dies in follow-up'],
    plan: [
      { day: 'Day 1', item: 'Pitch structure: problem → proof → ask' },
      { day: 'Day 2', item: 'Objection drills: price, timing, trust' },
      { day: 'Day 3', item: 'Tough-prospect simulation' },
      { day: 'Day 5', item: 'Full pitch rehearsal + scorecard' },
    ],
    faqs: [
      { q: 'Can it use my actual product and prospect?', a: 'Yes — add your product notes and the prospect company URL; the roleplay uses their actual business context.' },
      { q: 'Does it help with discovery calls too?', a: 'Yes — question frameworks, listening drills, and simulations where the AI plays an evasive stakeholder.' },
      { q: 'Enterprise deal, multiple stakeholders?', a: 'Describe the buying committee and rehearse different personas: the champion, the blocker, the CFO.' },
    ],
  },
  {
    slug: 'conference-talk',
    eventType: 'PRESENTATION', emoji: '🎤', name: 'Conference Talk',
    title: 'How to Prepare for a Conference Talk',
    headline: 'Own the room before you enter it.',
    sub: 'Narrative structure, delivery rehearsal, and a hostile Q&A simulation — so the audience never asks anything you have not already answered.',
    pains: ['Great content, flat delivery', 'Q&A panic overshadows the talk', 'Rehearsing to a mirror teaches nothing'],
    plan: [
      { day: 'Day 1', item: 'Narrative arc: hook, tension, payoff' },
      { day: 'Day 3', item: 'Slide structure & data storytelling' },
      { day: 'Day 5', item: 'Hostile Q&A simulation' },
      { day: 'Day 7', item: 'Full dress rehearsal with feedback' },
    ],
    faqs: [
      { q: 'Can it rehearse my actual talk?', a: 'Paste your outline or script as material — feedback targets your actual content, transitions, and claims.' },
      { q: 'How does Q&A practice work?', a: 'The AI generates the hardest plausible questions for your topic and audience, then drills your answers until they are tight.' },
      { q: 'Does it help with stage anxiety?', a: 'Familiarity is the antidote — after several full rehearsals with pushback, the real stage feels like a repeat.' },
    ],
  },
  {
    slug: 'thesis-defense',
    eventType: 'PRESENTATION', emoji: '🎓', name: 'Thesis Defense',
    title: 'How to Prepare for a Thesis Defense',
    headline: 'Defend like you wrote every citation yesterday.',
    sub: 'The AI reads your abstract, generates the committee\'s hardest questions, and rehearses you until "I don\'t know" becomes "great question — here\'s why…".',
    pains: ['Committee questions are unpredictable', 'Chapter 3 methodology feels attackable', 'Years of work, one nervous hour'],
    plan: [
      { day: 'Day 1', item: 'Weak-point audit of your own thesis' },
      { day: 'Day 3', item: 'Methodology defense drills' },
      { day: 'Day 5', item: 'Committee simulation (hostile mode)' },
      { day: 'Day 7', item: 'Full defense dress rehearsal' },
    ],
    faqs: [
      { q: 'Can it read my actual thesis?', a: 'Add your abstract and chapter summaries as materials — questions and drills are generated from your actual claims and methods.' },
      { q: 'What kinds of questions will it ask?', a: 'The classics — limitations, alternative explanations, generalizability, "why this method" — plus field-specific attacks on your weakest sections.' },
      { q: 'How close to the defense should I start?', a: 'Two weeks is comfortable; even 3 days of committee simulations changes how the real one feels.' },
    ],
  },
  {
    slug: 'visa-interview',
    eventType: 'OTHER', emoji: '🛂', name: 'Visa Interview',
    title: 'How to Prepare for a Visa Interview',
    headline: 'Two minutes that decide everything — rehearsed.',
    sub: 'Consistent answers, calm delivery, and the exact questions officers actually ask for your visa type — practiced until they are automatic.',
    pains: ['Answers must be consistent with your paperwork', 'Officers decide in minutes', 'One nervous stumble raises doubts'],
    plan: [
      { day: 'Day 1', item: 'Your case: story consistency audit' },
      { day: 'Day 2', item: 'Common-question drills for your visa type' },
      { day: 'Day 3', item: 'Officer simulation with follow-ups' },
      { day: 'Day 4', item: 'Final rehearsal + documents checklist' },
    ],
    faqs: [
      { q: 'Which visa types does this cover?', a: 'Student, work, visitor, spousal, and more — describe your visa type and country and the questions match that interview.' },
      { q: 'Can I practice in my own language first?', a: 'Yes — switch languages in the app, build confidence, then rehearse in the interview language.' },
      { q: 'What matters most in the interview?', a: 'Consistency and confidence. Rehearsing your own facts until they flow naturally is exactly what this plan does.' },
    ],
  },
  {
    slug: 'cissp',
    eventType: 'CERTIFICATION_EXAM', emoji: '🔐', name: 'CISSP',
    title: 'How to Prepare for the CISSP Exam',
    headline: 'Think like a manager. Pass like a pro.',
    sub: 'Eight domains, adaptive drilling, and the "think like a risk advisor" mindset the CISSP actually tests — scheduled around your job.',
    pains: ['Eight domains and all of them are huge', 'Technical instincts pick the "wrong" right answer', 'CAT format punishes weak domains hard'],
    plan: [
      { day: 'Day 1', item: 'Domain diagnostic & weighting map' },
      { day: 'Day 7', item: 'Security & risk management drills' },
      { day: 'Day 14', item: '"Think like a manager" scenario sets' },
      { day: 'Day 21', item: 'Adaptive-style full simulation' },
    ],
    faqs: [
      { q: 'Why do experienced engineers fail the CISSP?', a: 'Because it rewards management-level risk thinking over technical fixes. The drills specifically retrain that instinct.' },
      { q: 'How long should I prepare?', a: 'With experience in several domains, 6–10 weeks of structured daily sessions is typical. The diagnostic sets your real timeline.' },
      { q: 'Does it match the current exam outline?', a: 'Plans are generated against the current eight-domain outline and its official weights.' },
    ],
  },
  {
    slug: 'comptia-security-plus',
    eventType: 'CERTIFICATION_EXAM', emoji: '🛡️', name: 'Security+',
    title: 'How to Prepare for CompTIA Security+',
    headline: 'Your first security cert, minus the overwhelm.',
    sub: 'Performance-based questions, acronym floods, and port numbers — turned into a daily plan with drills that stick.',
    pains: ['PBQs are nothing like the study guides', 'Acronyms blur together by chapter three', 'No signal on when you are ready to book'],
    plan: [
      { day: 'Day 1', item: 'Domain diagnostic across the exam objectives' },
      { day: 'Day 4', item: 'Threats & vulnerabilities drills' },
      { day: 'Day 8', item: 'PBQ-style scenario practice' },
      { day: 'Day 12', item: 'Full timed simulation + readiness verdict' },
    ],
    faqs: [
      { q: 'Is Security+ a good first cert?', a: 'It is the standard entry point for security careers and DoD roles — and very passable with 4–8 weeks of structured preparation.' },
      { q: 'How does it handle performance-based questions?', a: 'With scenario drills that mirror the PBQ format: ordering steps, matching controls, and configuring rules.' },
      { q: 'Can I prepare while working full-time?', a: 'Yes — sessions are 20–40 minutes and the plan fits the days you actually have before your exam date.' },
    ],
  },
  {
    slug: 'court-hearing',
    eventType: 'COURT_CASE', emoji: '⚖️', name: 'Court Hearing',
    title: 'How to Prepare for a Court Hearing',
    headline: 'Walk into court knowing your case cold.',
    sub: 'Timeline mastery, testimony rehearsal, and cross-examination simulation — so the worst moment of the hearing is one you have already survived.',
    pains: ['Your own timeline has fuzzy edges', 'Cross-examination is designed to rattle you', 'Legal language obscures what matters'],
    plan: [
      { day: 'Day 1', item: 'Case timeline & facts mastery' },
      { day: 'Day 2', item: 'Testimony structure drills' },
      { day: 'Day 3', item: 'Cross-examination simulation' },
      { day: 'Day 5', item: 'Full hearing rehearsal' },
    ],
    faqs: [
      { q: 'Is this legal advice?', a: 'No — PrepareAI prepares your delivery, consistency, and composure. For legal strategy, work with your attorney; add their guidance as materials and rehearse it.' },
      { q: 'Can it simulate cross-examination?', a: 'Yes — the AI plays opposing counsel, probing inconsistencies and pressuring your weakest points so the real thing feels familiar.' },
      { q: 'What if I am representing myself?', a: 'Preparation matters double — the plan covers procedure familiarity, statement structure, and staying composed under objection.' },
    ],
  },
]

export function getPreparePage(slug: string): PreparePage | undefined {
  return PREPARE_PAGES.find(p => p.slug === slug)
}
