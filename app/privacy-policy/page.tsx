import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - A Thyme to Heal LLC',
  description: 'Learn how A Thyme to Heal collects, uses, and protects your personal information.',
};

export default function PrivacyPolicyPage() {
  const lastUpdated = 'January 8, 2026';

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary text-secondary py-12 px-4">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-accent">
            Privacy Policy
          </h1>
          <p className="text-lg">
            Last Updated: {lastUpdated}
          </p>
        </div>
      </section>

      {/* Policy Content */}
      <section className="py-12 px-4">
        <div className="mx-auto max-w-4xl prose prose-lg">
          <div className="bg-white p-8 rounded-lg shadow-md border border-taupe">
            <h2 className="text-2xl font-serif font-bold mb-4 text-primary">Introduction</h2>
            <p className="text-brown mb-6">
              At A Thyme to Heal LLC (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website athymetoheal.org or use our services.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8 text-primary">Information We Collect</h2>
            <h3 className="text-xl font-semibold mb-3 text-primary">Personal Information</h3>
            <p className="text-brown mb-4">
              We may collect personal information that you voluntarily provide to us when you:
            </p>
            <ul className="list-disc pl-6 mb-6 text-brown space-y-2">
              <li>Schedule a consultation or book services</li>
              <li>Fill out contact forms or inquiry forms</li>
              <li>Subscribe to our newsletter</li>
              <li>Make a purchase</li>
              <li>Create an account on our website</li>
              <li>Communicate with us via email, phone, or other channels</li>
            </ul>
            <p className="text-brown mb-6">
              This information may include: name, email address, phone number, mailing address, payment information, health information (only as necessary for consultations), and any other information you choose to provide.
            </p>

            <h3 className="text-xl font-semibold mb-3 text-primary">Automatically Collected Information</h3>
            <p className="text-brown mb-4">
              When you visit our website, we may automatically collect certain information about your device, including:
            </p>
            <ul className="list-disc pl-6 mb-6 text-brown space-y-2">
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Pages visited and time spent on pages</li>
              <li>Referring website addresses</li>
              <li>Other diagnostic data</li>
            </ul>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8 text-primary">How We Use Your Information</h2>
            <p className="text-brown mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 mb-6 text-brown space-y-2">
              <li>Provide, operate, and maintain our services</li>
              <li>Process your consultations, orders, and payments</li>
              <li>Communicate with you about your appointments, orders, and inquiries</li>
              <li>Send you newsletters and marketing communications (with your consent)</li>
              <li>Improve our website and services</li>
              <li>Respond to your comments and questions</li>
              <li>Protect against fraud and security risks</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8 text-primary">How We Share Your Information</h2>
            <p className="text-brown mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share your information with:
            </p>
            <ul className="list-disc pl-6 mb-6 text-brown space-y-2">
              <li><strong>Service Providers:</strong> Third-party companies that help us operate our business (e.g., payment processors, email service providers, data storage services like Airtable)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, sale, or transfer of our business</li>
            </ul>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8 text-primary">Third-Party Services</h2>
            <p className="text-brown mb-4">
              Our website may use third-party services including:
            </p>
            <ul className="list-disc pl-6 mb-6 text-brown space-y-2">
              <li><strong>Airtable:</strong> For data storage and management</li>
              <li><strong>Payment Processors:</strong> For processing payments (e.g., Stripe, PayPal)</li>
              <li><strong>Email Services:</strong> For sending communications</li>
              <li><strong>Analytics Services:</strong> For website analytics and improvement</li>
            </ul>
            <p className="text-brown mb-6">
              These third parties have their own privacy policies governing their use of your information.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8 text-primary">Cookies and Tracking Technologies</h2>
            <p className="text-brown mb-6">
              We use cookies and similar tracking technologies to track activity on our website and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our website.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8 text-primary">Data Security</h2>
            <p className="text-brown mb-6">
              We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8 text-primary">Data Retention</h2>
            <p className="text-brown mb-6">
              We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8 text-primary">Your Rights</h2>
            <p className="text-brown mb-4">
              Depending on your location, you may have certain rights regarding your personal information, including:
            </p>
            <ul className="list-disc pl-6 mb-6 text-brown space-y-2">
              <li>The right to access your personal information</li>
              <li>The right to correct inaccurate information</li>
              <li>The right to delete your personal information</li>
              <li>The right to object to processing of your information</li>
              <li>The right to data portability</li>
              <li>The right to withdraw consent</li>
            </ul>
            <p className="text-brown mb-6">
              To exercise these rights, please contact us using the information provided below.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8 text-primary">Children&apos;s Privacy</h2>
            <p className="text-brown mb-6">
              Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8 text-primary">Changes to This Privacy Policy</h2>
            <p className="text-brown mb-6">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8 text-primary">Contact Us</h2>
            <p className="text-brown mb-4">
              If you have questions or concerns about this Privacy Policy, please contact us:
            </p>
            <div className="bg-secondary p-4 rounded-md border border-taupe text-brown">
              <p><strong>A Thyme to Heal LLC</strong></p>
              <p>Email: <a href="mailto:athyme4healing@gmail.com" className="text-accent hover:underline">athyme4healing@gmail.com</a></p>
              <p>Contact Form: <a href="/contact" className="text-accent hover:underline">Send us a message</a></p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
