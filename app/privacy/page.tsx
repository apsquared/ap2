import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Privacy Policy | APSquared",
  description: "How APSquared collects, uses, and protects information when you use our website and tools.",
}

export default function PrivacyPage() {
  return (
    <article className="prose dark:prose-invert max-w-none mt-10">
      <p className="text-sm text-slate-600 dark:text-slate-400 not-prose">
        <Link href="/">Home</Link>
        {" · "}
        <Link href="/terms">Terms of Service</Link>
      </p>
      <h1>Privacy Policy</h1>
      <p className="text-slate-600 dark:text-slate-400 not-prose text-sm">
        Last updated: March 20, 2026
      </p>

      <p>
        APSquared (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates this website and related
        online tools. This Privacy Policy describes how we handle information when you visit{" "}
        <a href="https://www.apsquared.co">apsquared.co</a> or use our services linked from it.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>
          <strong>Information you provide</strong> — For example, text or files you submit to our tools,
          account or contact details if you choose to share them, or messages you send us.
        </li>
        <li>
          <strong>Usage and technical data</strong> — Such as browser type, device type, general location
          (e.g. region from IP), pages viewed, referring URLs, and timestamps. This may be collected
          automatically when you use the site.
        </li>
        <li>
          <strong>Cookies and similar technologies</strong> — We may use cookies, local storage, or
          pixels to remember preferences, measure traffic, and understand how the site is used.
        </li>
      </ul>

      <h2>How we use information</h2>
      <p>We use the information above to:</p>
      <ul>
        <li>Provide, operate, and improve our website and tools</li>
        <li>Respond to requests and communicate with you when needed</li>
        <li>Analyze usage trends and fix technical issues</li>
        <li>Protect the security and integrity of our services</li>
        <li>Comply with legal obligations</li>
      </ul>

      <h2>Analytics</h2>
      <p>
        We may use third-party analytics (for example Google Analytics) that collect pseudonymous
        usage data. Those providers have their own privacy policies describing how they process data.
        You can control cookies through your browser settings where available.
      </p>

      <h2>Sharing of information</h2>
      <p>We may share information with:</p>
      <ul>
        <li>
          <strong>Service providers</strong> who help us host the site, run analytics, process payments,
          or deliver features (under contractual obligations to use data only as directed)
        </li>
        <li>
          <strong>Legal and safety</strong> when we believe disclosure is required by law, to enforce
          our terms, or to protect rights, safety, or security
        </li>
        <li>
          <strong>Business transfers</strong> in connection with a merger, acquisition, or sale of
          assets, subject to appropriate safeguards
        </li>
      </ul>
      <p>We do not sell your personal information as that term is commonly defined in U.S. state laws.</p>

      <h2>Retention</h2>
      <p>
        We keep information only as long as needed for the purposes above, unless a longer period is
        required or permitted by law. Retention periods depend on the type of data and how we use it.
      </p>

      <h2>Security</h2>
      <p>
        We take reasonable measures designed to protect information against unauthorized access, loss,
        or misuse. No method of transmission over the Internet is completely secure.
      </p>

      <h2>Your choices and rights</h2>
      <p>
        Depending on where you live, you may have rights to access, correct, delete, or restrict
        certain processing of your personal information, or to opt out of certain uses. To exercise
        rights that apply to you, contact us using the information below. We may need to verify your
        request.
      </p>

      <h2>Children</h2>
      <p>
        Our services are not directed to children under 13, and we do not knowingly collect personal
        information from children under 13. If you believe we have collected such information, please
        contact us so we can delete it.
      </p>

      <h2>International users</h2>
      <p>
        If you access the site from outside the United States, your information may be processed in the
        United States or other countries where we or our providers operate, which may have different
        data protection rules than your country.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will post the revised version on this
        page and update the &quot;Last updated&quot; date. Continued use of the site after changes means
        you accept the updated policy.
      </p>

      <h2>Contact</h2>
      <p>
        For privacy-related questions, reach us through the social links in the site footer (for example
        on <a href="https://twitter.com/APSquaredDev">X</a> or{" "}
        <a href="https://bsky.app/profile/apsquared.bsky.social">Bluesky</a>).
      </p>
    </article>
  )
}
