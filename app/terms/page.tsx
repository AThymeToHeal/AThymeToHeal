import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms and Conditions - A Thyme to Heal LLC',
  description: 'Read our terms and conditions for using A Thyme to Heal services and website.',
};

export default function TermsPage() {
  const lastUpdated = 'January 8, 2026';

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary text-secondary py-12 px-4">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-accent">
            Terms and Conditions
          </h1>
          <p className="text-lg">
            Last Updated: {lastUpdated}
          </p>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-12 px-4">
        <div className="mx-auto max-w-4xl prose prose-lg">
          <div className="bg-white p-8 rounded-lg shadow-md border border-taupe">
            <h2 className="text-2xl font-serif font-bold mb-4 text-primary">Agreement to Terms</h2>
            <p className="text-brown mb-6">
              By accessing or using the A Thyme to Heal LLC website (athymetoheal.org) and services, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you may not use our services.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8 text-primary">Services Description</h2>
            <p className="text-brown mb-6">
              A Thyme to Heal LLC provides herbal wellness consultations, custom herbal blends, wellness coaching, educational workshops, and related products and services. Our services are intended to support your wellness journey and are not a substitute for medical advice, diagnosis, or treatment.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8 text-primary">Medical Disclaimer</h2>
            <p className="text-brown mb-4">
              <strong>IMPORTANT:</strong> The information and services provided by A Thyme to Heal are for educational and wellness purposes only. We are not licensed medical practitioners.
            </p>
            <ul className="list-disc pl-6 mb-6 text-brown space-y-2">
              <li>Our services do not diagnose, treat, cure, or prevent any disease</li>
              <li>Always consult with a qualified healthcare provider before starting any herbal regimen</li>
              <li>Never disregard professional medical advice or delay seeking it based on information from our services</li>
              <li>Inform your healthcare provider about all herbs and supplements you are taking</li>
              <li>If you are pregnant, nursing, taking medications, or have a medical condition, consult your doctor before using herbal remedies</li>
            </ul>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8 text-primary">User Responsibilities</h2>
            <p className="text-brown mb-4">
              By using our services, you agree to:
            </p>
            <ul className="list-disc pl-6 mb-6 text-brown space-y-2">
              <li>Provide accurate and complete information during consultations</li>
              <li>Use our products and services responsibly and as directed</li>
              <li>Not use our website for any unlawful purpose</li>
              <li>Not attempt to harm or disrupt our website or services</li>
              <li>Respect the intellectual property rights of A Thyme to Heal</li>
            </ul>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8 text-primary">Booking and Appointments</h2>
            <p className="text-brown mb-4">
              When booking consultations or services:
            </p>
            <ul className="list-disc pl-6 mb-6 text-brown space-y-2">
              <li>You must be 18 years of age or older, or have parental/guardian consent</li>
              <li>Payment is required at the time of booking unless otherwise arranged</li>
              <li>Cancellations must be made at least 24 hours in advance for a full refund</li>
              <li>Late cancellations (less than 24 hours) or no-shows will forfeit the appointment fee</li>
              <li>We reserve the right to reschedule appointments due to unforeseen circumstances</li>
            </ul>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8 text-primary">Right to Refuse Service</h2>
            <p className="text-brown mb-6">
              A Thyme to Heal LLC reserves the right to refuse service, consultations, appointments, or orders to anyone for any reason at our sole discretion. This includes, but is not limited to, situations where we believe a client relationship would not be mutually beneficial, when safety concerns arise, or when our services may not be appropriate for an individual&apos;s needs.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8 text-primary">Product Information and Orders</h2>
            <p className="text-brown mb-4">
              Regarding our products:
            </p>
            <ul className="list-disc pl-6 mb-6 text-brown space-y-2">
              <li>We strive to display accurate product information, but cannot guarantee complete accuracy</li>
              <li>Product availability may change without notice</li>
              <li>Prices are subject to change</li>
              <li>We reserve the right to limit quantities or refuse orders</li>
              <li>All orders are subject to acceptance and availability</li>
            </ul>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8 text-primary">Payment Terms</h2>
            <p className="text-brown mb-4">
              Payment terms include:
            </p>
            <ul className="list-disc pl-6 mb-6 text-brown space-y-2">
              <li>Payment is due at the time of service or purchase</li>
              <li>We accept major credit cards, debit cards, and PayPal</li>
              <li>All prices are in USD unless otherwise stated</li>
              <li>You are responsible for any applicable taxes</li>
              <li>Failed or refused payments may result in service suspension</li>
            </ul>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8 text-primary">Intellectual Property</h2>
            <p className="text-brown mb-6">
              All content on our website, including text, graphics, logos, images, and software, is the property of A Thyme to Heal LLC and is protected by copyright and trademark laws. You may not reproduce, distribute, or create derivative works without our express written permission.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8 text-primary">Limitation of Liability</h2>
            <p className="text-brown mb-6">
              To the maximum extent permitted by law, A Thyme to Heal LLC shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of our services.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8 text-primary">Indemnification</h2>
            <p className="text-brown mb-6">
              You agree to indemnify and hold harmless A Thyme to Heal LLC, its officers, directors, employees, and agents from any claims, damages, obligations, losses, liabilities, costs, or expenses arising from your use of our services or violation of these Terms.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8 text-primary">Dispute Resolution</h2>
            <p className="text-brown mb-6">
              Any disputes arising from these Terms or your use of our services shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association. You waive your right to participate in class action lawsuits.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8 text-primary">Governing Law</h2>
            <p className="text-brown mb-6">
              These Terms shall be governed by and construed in accordance with the laws of the state in which A Thyme to Heal LLC operates, without regard to its conflict of law provisions.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8 text-primary">Changes to Terms</h2>
            <p className="text-brown mb-6">
              We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the new Terms on this page and updating the &quot;Last Updated&quot; date. Your continued use of our services after changes constitutes acceptance of the new Terms.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8 text-primary">Severability</h2>
            <p className="text-brown mb-6">
              If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary, and the remaining provisions will remain in full force and effect.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8 text-primary">Contact Information</h2>
            <p className="text-brown mb-4">
              For questions about these Terms and Conditions, please contact us:
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
