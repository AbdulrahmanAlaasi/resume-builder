import type { Metadata } from 'next';
import Image from 'next/image';
import styles from './proposal.module.css';

export const metadata: Metadata = {
  title: 'Resu | University Partnership Proposal',
  description: 'A commercial and implementation proposal for universities considering Resu as their institutional student CV platform.',
};

const currentCapabilities = [
  'University-aligned, section-by-section CV editor',
  'Live A4 and US Letter preview with one-page guidance',
  'Editable examples for multiple student majors',
  'Structured PDF and justified Word export',
  'PDF import with automatic field detection and OCR fallback',
  'Responsive desktop, tablet, and mobile experience',
  'Browser-local resume storage in the current release',
  'Embedding bridge for integration with a university portal',
];

const commercialOptions = [
  {
    label: 'Low-risk entry',
    name: 'Paid Pilot',
    price: 'SAR 12,000',
    cadence: 'one time',
    description: 'An eight-week institutional pilot for up to 500 students, focused on adoption, CV completion, and Career Center workflow fit.',
    items: ['University branding and configuration', 'Pilot onboarding session', 'Usage and feedback report', 'Full pilot fee credited toward a first-year campus license'],
  },
  {
    label: 'Recommended',
    name: 'Annual Campus License',
    price: 'SAR 48,000',
    cadence: 'per year',
    description: 'A managed service for one university, suitable for institution-wide student access and continuous product improvement.',
    items: ['Up to 5,000 active students', 'Hosting, monitoring, and routine maintenance', 'Product updates and security patches', 'Standard support and two training sessions annually'],
    featured: true,
  },
  {
    label: 'Flexible adoption',
    name: 'Per-Student Access',
    price: 'SAR 12',
    cadence: 'per active student / year',
    description: 'A usage-based model for smaller institutions, individual colleges, or a phased rollout across selected programs.',
    items: ['SAR 24,000 annual minimum', 'SAR 8,000 initial onboarding', 'Maintenance included while subscribed', 'Volume pricing available for multi-campus use'],
  },
  {
    label: 'Long-term control',
    name: 'Institutional Acquisition',
    price: 'From SAR 225,000',
    cadence: 'one time',
    description: 'A perpetual institutional source-code license with deployment rights, technical handover, and university-controlled hosting.',
    items: ['Source code and deployment documentation', 'Two technical knowledge-transfer sessions', 'Creator retains underlying product IP', 'Optional annual maintenance at 18% of the acquisition price'],
  },
];

const aiFeatures = [
  {
    title: 'AI CV Coach',
    text: 'Section-specific suggestions for clarity, impact, grammar, and measurable achievements, with every change approved by the student.',
  },
  {
    title: 'ATS Readiness Review',
    text: 'Checks structure, missing information, weak phrases, keyword coverage, and role alignment before a student submits an application.',
  },
  {
    title: 'Role-Aware Tailoring',
    text: "Creates a targeted copy of the CV for a selected internship or graduate role without replacing the student's master version.",
  },
  {
    title: 'Arabic and English Assistance',
    text: 'Supports bilingual writing, translation review, and institution-approved terminology for local and international applications.',
  },
  {
    title: 'Interview Preparation',
    text: "Builds likely interview questions from the student's CV and target role, then provides structured practice and feedback.",
  },
  {
    title: 'Career Advisor Copilot',
    text: 'Summarizes common issues and suggests review priorities so advisors can focus their time where human guidance matters most.',
  },
];

const platformFeatures = [
  {
    title: 'University SSO and Student Accounts',
    text: 'Secure sign-in, saved versions, device-to-device access, and ownership rules aligned with the university identity system.',
  },
  {
    title: 'Career Center Review Workflow',
    text: 'Students request review, advisors comment, revisions are tracked, and approved CVs receive a clear completion status.',
  },
  {
    title: 'Institutional Dashboard',
    text: 'Aggregated adoption, completion, review, and export indicators with privacy-conscious reporting for Career Center leadership.',
  },
  {
    title: 'Program-Specific Templates',
    text: 'Approved templates and examples for engineering, business, finance, MIS, and other colleges without fragmenting the experience.',
  },
  {
    title: 'Jobs and Internship Connections',
    text: 'Optional links to opportunities, career fairs, employer requirements, and application-ready CV versions.',
  },
  {
    title: 'White-Label and Portal Embedding',
    text: 'University branding, custom domain support, and direct embedding into an existing student or Career Center portal.',
  },
  {
    title: 'Version History and Portfolio',
    text: 'Named CV versions, restore points, controlled sharing links, and a record of applications made with each version.',
  },
  {
    title: 'Accessibility and Localization',
    text: 'Expanded keyboard support, screen-reader review, Arabic interface support, and right-to-left layouts where required.',
  },
];

const deliverySteps = [
  ['01', 'Discovery and approval', 'Confirm stakeholders, branding, data handling, identity integration, pilot audience, and success measures.'],
  ['02', 'Institutional configuration', 'Prepare the approved template, university identity, support process, analytics boundaries, and pilot environment.'],
  ['03', 'Eight-week pilot', 'Launch to a controlled student group with onboarding, feedback collection, support, and weekly monitoring.'],
  ['04', 'Review and rollout decision', 'Present outcomes, resolve gaps, agree the commercial model, and plan the wider university launch.'],
];

const successMeasures = [
  'Student activation and CV completion rate',
  'Percentage of completed CVs meeting the one-page guideline',
  'Successful PDF and Word exports',
  'Average advisor review effort per CV',
  'Student and advisor satisfaction',
  'Recurring content issues that can inform workshops',
];

export default function ProposalPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a className={styles.brand} href="#top" aria-label="Resu proposal home">
          <img src="/logo32.png" width="30" height="30" alt="" />
          <span>Resu Proposal</span>
        </a>
        <nav className={styles.nav} aria-label="Proposal sections">
          <a href="#solution">Solution</a>
          <a href="#commercial">Commercial</a>
          <a href="#features">Features</a>
          <a href="#delivery">Delivery</a>
        </nav>
        <a className={styles.headerAction} href="/">Open Resu</a>
      </header>

      <section className={styles.hero} id="top">
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>Institutional partnership proposal | September 2026</p>
          <h1>Resu</h1>
          <h2>A university-ready CV builder for every student.</h2>
          <p className={styles.heroCopy}>
            Resu turns an approved university CV format into a guided, responsive experience students can complete, review, and export from any device. This proposal outlines a practical path from a controlled pilot to institution-wide adoption.
          </p>
          <div className={styles.heroActions}>
            <a className={styles.primaryAction} href="#commercial">Review commercial options</a>
            <a className={styles.secondaryAction} href="/" target="_blank" rel="noreferrer">View the live product</a>
          </div>
        </div>
        <div className={styles.proposalMeta}>
          <div><span>Prepared by</span><strong>Abdulrahman Alaasi</strong></div>
          <div><span>Prepared for</span><strong>University leadership &amp; Career Center</strong></div>
          <div><span>Product status</span><strong>Live and pilot-ready</strong></div>
        </div>
      </section>

      <section className={styles.visualBand} aria-label="Resu product preview">
        <div className={styles.visualInner}>
          <div className={styles.browserFrame}>
            <div className={styles.browserBar}><span /><span /><span /><b>resu.alaasi.dev</b></div>
            <Image
              src="/proposal-preview.png"
              width={1440}
              height={900}
              sizes="(max-width: 900px) 94vw, 1180px"
              alt="Resu editor showing student fields beside a live university CV preview"
              priority
            />
          </div>
        </div>
      </section>

      <section className={styles.section} id="solution">
        <div className={styles.sectionInner}>
          <div className={styles.sectionIntro}>
            <p className={styles.kicker}>The opportunity</p>
            <h2>Move CV support from a document template to a guided student service.</h2>
            <p>
              Students often start from inconsistent files, spend time fixing layout, and reach advisors with preventable formatting issues. Resu keeps the approved structure visible while students write, making quality guidance part of the workflow rather than a final correction step.
            </p>
          </div>
          <div className={styles.valueGrid}>
            <article>
              <span>01</span>
              <h3>Consistency</h3>
              <p>Students begin from the same approved structure while retaining control of their own content.</p>
            </article>
            <article>
              <span>02</span>
              <h3>Advisor capacity</h3>
              <p>Built-in format and page guidance can reduce repetitive corrections before a human review.</p>
            </article>
            <article>
              <span>03</span>
              <h3>Employability</h3>
              <p>Examples, editable sections, and reliable exports help students produce an application-ready document.</p>
            </article>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.softBand}`}>
        <div className={`${styles.sectionInner} ${styles.twoColumn}`}>
          <div>
            <p className={styles.kicker}>Available now</p>
            <h2>A working product, not a concept deck.</h2>
            <p className={styles.leadText}>
              The current release is already usable on desktop and mobile and can be demonstrated immediately. Institutional work would focus on integration, governance, administration, and the university's chosen roadmap.
            </p>
            <a className={styles.textLink} href="/" target="_blank" rel="noreferrer">Launch the current version</a>
          </div>
          <ul className={styles.checkList}>
            {currentCapabilities.map((capability) => <li key={capability}>{capability}</li>)}
          </ul>
        </div>
      </section>

      <section className={styles.validationBand}>
        <div className={styles.validationInner}>
          <div className={styles.validationMark}>Market signal</div>
          <div>
            <h2>Early external interest</h2>
            <p>
              Resu has also been presented to a company with relationships across several universities. The company expressed interest in the product and its potential for institutional use. This is not represented as a completed sale; it is early validation that the problem and delivery model are relevant beyond one campus.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section} id="commercial">
        <div className={styles.sectionInner}>
          <div className={styles.sectionIntro}>
            <p className={styles.kicker}>Commercial framework</p>
            <h2>Choose the ownership and cost model that fits the university.</h2>
            <p>
              The recommended path is a paid pilot followed by an annual campus license. It gives the university evidence before a wider commitment and keeps hosting, maintenance, support, and product updates under one predictable fee.
            </p>
          </div>
          <div className={styles.pricingGrid}>
            {commercialOptions.map((option) => (
              <article className={`${styles.pricingCard} ${option.featured ? styles.featured : ''}`} key={option.name}>
                <div className={styles.priceLabel}>{option.label}</div>
                <h3>{option.name}</h3>
                <div className={styles.price}>{option.price}</div>
                <div className={styles.cadence}>{option.cadence}</div>
                <p>{option.description}</p>
                <ul>{option.items.map((item) => <li key={item}>{item}</li>)}</ul>
              </article>
            ))}
          </div>
          <div className={styles.commercialNote}>
            <strong>Additional route:</strong> a full, exclusive purchase and assignment of the product IP can be evaluated separately after technical and legal due diligence. All figures above are indicative starting points in Saudi riyals, subject to scope and contract, and exclude VAT where applicable. See <a href="https://www.zatca.gov.sa/en/RulesRegulations/Taxes/Pages/VATLaw.aspx" target="_blank" rel="noreferrer">ZATCA VAT legislation</a>.
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.featureBand}`} id="features">
        <div className={styles.sectionInner}>
          <div className={styles.sectionIntro}>
            <p className={styles.kicker}>Potential features</p>
            <h2>A roadmap that can grow from CV creation into a career-readiness platform.</h2>
            <p>
              These features are proposed options, not claims about the current release. They can be prioritized with the Career Center after the pilot, with AI features introduced only under university-approved privacy, quality, and human-review controls.
            </p>
          </div>

          <div className={styles.featureHeading}>
            <span>AI roadmap</span>
            <h3>Student guidance with human control</h3>
          </div>
          <div className={styles.featureGrid}>
            {aiFeatures.map((feature, index) => (
              <article className={styles.featureCard} key={feature.title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h4>{feature.title}</h4>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>

          <div className={styles.featureHeading}>
            <span>Platform roadmap</span>
            <h3>Institutional workflow and scale</h3>
          </div>
          <div className={styles.featureGrid}>
            {platformFeatures.map((feature, index) => (
              <article className={styles.featureCard} key={feature.title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h4>{feature.title}</h4>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section} id="delivery">
        <div className={styles.sectionInner}>
          <div className={styles.sectionIntro}>
            <p className={styles.kicker}>Delivery plan</p>
            <h2>A measured route to launch.</h2>
            <p>The product is ready for a controlled pilot. The exact calendar depends on university approvals, identity integration, security review, and the selected scope.</p>
          </div>
          <div className={styles.timeline}>
            {deliverySteps.map(([number, title, text]) => (
              <article key={number}>
                <span>{number}</span>
                <div><h3>{title}</h3><p>{text}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.softBand}`}>
        <div className={`${styles.sectionInner} ${styles.governanceGrid}`}>
          <div>
            <p className={styles.kicker}>Maintenance and support</p>
            <h2>Keep the service dependable after launch.</h2>
            <ul className={styles.simpleList}>
              <li>Hosting and availability monitoring under managed plans</li>
              <li>Dependency, browser compatibility, and security updates</li>
              <li>Issue triage with agreed response targets</li>
              <li>Routine fixes and minor usability improvements</li>
              <li>Quarterly product and usage review</li>
              <li>Major new modules scoped and priced separately</li>
            </ul>
          </div>
          <div>
            <p className={styles.kicker}>Privacy and governance</p>
            <h2>Designed for a university review process.</h2>
            <p className={styles.leadText}>
              The current version stores resume data locally in the student's browser. Any institutional accounts, analytics, AI processing, or cloud storage would be designed with data minimization, clear consent, retention controls, role-based access, and university approval before launch.
            </p>
            <p className={styles.policyNote}>
              Final architecture and operating procedures should be reviewed against the Saudi Personal Data Protection Law and university policy. Reference: <a href="https://dgp.sdaia.gov.sa/wps/portal/pdp/knowledgecenter/" target="_blank" rel="noreferrer">SDAIA Personal Data Protection resources</a>.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={`${styles.sectionInner} ${styles.measureGrid}`}>
          <div>
            <p className={styles.kicker}>Pilot evaluation</p>
            <h2>Measure value before scaling.</h2>
            <p className={styles.leadText}>The pilot report would compare agreed baseline information with a small set of practical adoption, quality, and service measures.</p>
          </div>
          <ul className={styles.metricList}>
            {successMeasures.map((measure, index) => <li key={measure}><span>{index + 1}</span>{measure}</li>)}
          </ul>
        </div>
      </section>

      <section className={styles.ctaSection} id="contact">
        <div className={styles.ctaInner}>
          <p className={styles.kicker}>Recommended next step</p>
          <h2>Approve a scoped eight-week pilot.</h2>
          <p>
            Assign one Career Center sponsor and one IT or security contact, confirm a pilot cohort, and agree the success measures. The pilot fee can then be credited toward the first annual license if the university proceeds.
          </p>
          <div className={styles.heroActions}>
            <a className={styles.primaryAction} href="mailto:Abdulrahmanalaasi24@gmail.com?subject=Resu%20University%20Proposal">Discuss the proposal</a>
            <a className={styles.secondaryAction} href="https://abdulrahman.alaasi.dev/" target="_blank" rel="noreferrer">About the developer</a>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div><strong>Resu</strong><span>University CV platform proposal</span></div>
        <div><a href="mailto:Abdulrahmanalaasi24@gmail.com">Abdulrahmanalaasi24@gmail.com</a><span>Copyright 2026 Abdulrahman Alaasi</span></div>
      </footer>
    </main>
  );
}
