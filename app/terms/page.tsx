import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Terms of Service | APSquared",
  description: "Terms governing your use of APSquared’s website and online tools.",
}

export default function TermsPage() {
  return (
    <article className="prose dark:prose-invert max-w-none mt-10">
      <p className="text-sm text-slate-600 dark:text-slate-400 not-prose">
        <Link href="/">Home</Link>
        {" · "}
        <Link href="/privacy">Privacy Policy</Link>
      </p>
      <h1>Terms of Service</h1>
      <p className="text-slate-600 dark:text-slate-400 not-prose text-sm">
        Last updated: March 20, 2026
      </p>

      <p>
        These Terms of Service (&quot;Terms&quot;) govern your access to and use of the website,
        applications, and online tools operated by APSquared (&quot;APSquared,&quot; &quot;we,&quot;
        &quot;us,&quot; or &quot;our&quot;) at <a href="https://www.apsquared.co">apsquared.co</a> and
        related properties (collectively, the &quot;Services&quot;). By using the Services, you agree
        to these Terms. If you do not agree, do not use the Services.
      </p>

      <h2>Eligibility and accounts</h2>
      <p>
        You must be able to form a binding contract in your jurisdiction to use the Services. If you
        use the Services on behalf of an organization, you represent that you have authority to bind
        that organization. Some features may require an account; you agree to provide accurate
        information and keep your credentials confidential.
      </p>

      <h2>License to use the Services</h2>
      <p>
        Subject to these Terms, we grant you a limited, non-exclusive, non-transferable, revocable
        license to access and use the Services for your personal or internal business purposes. We
        reserve all rights not expressly granted.
      </p>

      <h2>Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Violate any applicable law or third-party rights</li>
        <li>
          Attempt to probe, scan, or test the vulnerability of the Services, or breach security or
          authentication measures
        </li>
        <li>
          Interfere with or disrupt the Services, servers, or networks (including denial-of-service
          attacks)
        </li>
        <li>
          Use the Services to generate or distribute malware, spam, or unlawful, harmful, or deceptive
          content
        </li>
        <li>
          Reverse engineer, decompile, or disassemble any part of the Services except where prohibited
          by law
        </li>
        <li>
          Use automated means (including bots or scrapers) in a way that overloads the Services or
          violates our robots.txt or rate limits, except with our prior written consent
        </li>
        <li>Misrepresent your identity or affiliation</li>
      </ul>

      <h2>User content and AI outputs</h2>
      <p>
        You may submit content to certain tools (&quot;User Content&quot;). You retain ownership of
        User Content to the extent you hold rights in it. You grant us a worldwide, non-exclusive
        license to use, host, store, reproduce, and process User Content as needed to provide and
        improve the Services.
      </p>
      <p>
        Outputs from AI or automated features may be inaccurate or incomplete. You are responsible for
        how you use outputs, including verifying them before relying on them for important decisions.
        Do not use the Services for professional advice (legal, medical, financial, or otherwise)
        without consulting a qualified professional.
      </p>

      <h2>Intellectual property</h2>
      <p>
        The Services, including software, design, text, graphics, and branding, are owned by APSquared
        or its licensors and are protected by intellectual property laws. Except for the limited
        license above, nothing in these Terms transfers ownership of any intellectual property rights
        to you.
      </p>

      <h2>Third-party services</h2>
      <p>
        The Services may link to or integrate with third-party websites or services. We are not
        responsible for third-party content or practices. Your use of third-party services is subject
        to their terms and policies.
      </p>

      <h2>Disclaimers</h2>
      <p>
        THE SERVICES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE,&quot; WITHOUT WARRANTIES OF
        ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS
        FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICES WILL BE
        UNINTERRUPTED, ERROR-FREE, OR SECURE.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, APSquared AND ITS AFFILIATES, OFFICERS, DIRECTORS,
        EMPLOYEES, AND AGENTS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL,
        OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, OR GOODWILL, ARISING OUT OF OR RELATED TO
        YOUR USE OF THE SERVICES, WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), OR
        ANY OTHER LEGAL THEORY, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
      </p>
      <p>
        OUR TOTAL LIABILITY FOR ANY CLAIM ARISING OUT OF OR RELATING TO THE SERVICES OR THESE TERMS
        WILL NOT EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID US FOR THE SERVICES GIVING RISE TO THE
        CLAIM IN THE TWELVE (12) MONTHS BEFORE THE CLAIM OR (B) ONE HUNDRED U.S. DOLLARS (US$100), IF
        YOU HAVE NOT PAID US ANYTHING.
      </p>
      <p>
        Some jurisdictions do not allow certain limitations; in those cases, our liability is limited
        to the fullest extent permitted by law.
      </p>

      <h2>Indemnity</h2>
      <p>
        You will defend, indemnify, and hold harmless APSquared and its affiliates from any claims,
        damages, losses, liabilities, and expenses (including reasonable attorneys&apos; fees) arising
        out of your User Content, your use of the Services, or your violation of these Terms or
        applicable law.
      </p>

      <h2>Suspension and termination</h2>
      <p>
        We may suspend or terminate your access to the Services at any time, with or without notice,
        for conduct that we believe violates these Terms or harms the Services or other users. You may
        stop using the Services at any time. Provisions that by their nature should survive will
        survive termination (including disclaimers, limitations of liability, and indemnity).
      </p>

      <h2>Changes</h2>
      <p>
        We may modify these Terms by posting an updated version on this page and updating the
        &quot;Last updated&quot; date. Material changes may be communicated through the Services or
        other reasonable means. Your continued use after the effective date of changes constitutes
        acceptance. If you do not agree, stop using the Services.
      </p>

      <h2>Governing law</h2>
      <p>
        These Terms are governed by the laws of the United States and the State of Delaware, without
        regard to conflict-of-law principles, except where mandatory local law requires otherwise. You
        agree that courts in Delaware have exclusive jurisdiction for disputes, subject to any
        mandatory rights you may have in your home jurisdiction.
      </p>

      <h2>General</h2>
      <p>
        These Terms constitute the entire agreement between you and APSquared regarding the Services and
        supersede prior agreements on the same subject. If any provision is unenforceable, the remaining
        provisions remain in effect. Our failure to enforce a provision is not a waiver. You may not
        assign these Terms without our consent; we may assign them in connection with a merger,
        acquisition, or sale of assets.
      </p>

      <h2>Contact</h2>
      <p>
        For questions about these Terms, contact us through the social links in the site footer (for
        example on <a href="https://twitter.com/APSquaredDev">X</a> or{" "}
        <a href="https://bsky.app/profile/apsquared.bsky.social">Bluesky</a>).
      </p>
    </article>
  )
}
