import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund Policy - A Thyme to Heal LLC',
  description: 'Learn about our refund and return policy for products and services.',
};

export default function RefundPolicyPage() {
  const lastUpdated = 'December 16, 2025';

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary text-secondary py-12 px-4">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-accent">
            Refund Policy
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
            <h2 className="text-2xl font-serif font-bold mb-4 text-primary">Our Commitment</h2>
            <p className="text-brown mb-6">
              At A Thyme to Heal LLC, we are committed to your satisfaction. We want you to be completely happy with your purchase and experience with us. This Refund Policy outlines our procedures for returns, refunds, and cancellations.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8 text-primary">Product Returns and Refunds</h2>

            <h3 className="text-xl font-semibold mb-3 text-primary">Eligibility</h3>
            <p className="text-brown mb-4">
              To be eligible for a product return and refund:
            </p>
            <ul className="list-disc pl-6 mb-6 text-brown space-y-2">
              <li>Request must be made within 30 days of receiving your product</li>
              <li>Product must be unused and in its original packaging</li>
              <li>Product must be in the same condition as when you received it</li>
              <li>Original receipt or proof of purchase must be provided</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-primary">Non-Refundable Products</h3>
            <p className="text-brown mb-4">
              The following products cannot be returned or refunded:
            </p>
            <ul className="list-disc pl-6 mb-6 text-brown space-y-2">
              <li>Custom herbal blends made specifically for you</li>
              <li>Opened or used products (for health and safety reasons)</li>
              <li>Gift cards or certificates</li>
              <li>Workshop materials after the workshop has been attended</li>
              <li>Digital products or downloadable content</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-primary">Return Process</h3>
            <p className="text-brown mb-4">
              To initiate a return:
            </p>
            <ol className="list-decimal pl-6 mb-6 text-brown space-y-2">
              <li>Contact us at <a href="mailto:returns@athymetoheal.org" className="text-accent hover:underline">returns@athymetoheal.org</a> or call <a href="tel:+1234567890" className="text-accent hover:underline">(123) 456-7890</a></li>
              <li>Provide your order number and reason for return</li>
              <li>Wait for our return authorization and instructions</li>
              <li>Package the product securely in its original packaging</li>
              <li>Ship the product to the address we provide</li>
              <li>Keep your shipping receipt and tracking number</li>
            </ol>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8 text-primary">Consultation and Service Cancellations</h2>

            <h3 className="text-xl font-semibold mb-3 text-primary">24-Hour Cancellation Policy</h3>
            <p className="text-brown mb-4">
              For consultations and services:
            </p>
            <ul className="list-disc pl-6 mb-6 text-brown space-y-2">
              <li><strong>More than 24 hours before:</strong> Full refund or free rescheduling</li>
              <li><strong>Less than 24 hours before:</strong> 50% refund or one-time reschedule</li>
              <li><strong>No-show:</strong> No refund, but may reschedule for a $25 fee</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-primary">Emergency Situations</h3>
            <p className="text-brown mb-6">
              We understand that emergencies happen. If you need to cancel due to a medical emergency or other urgent situation, please contact us as soon as possible. We will work with you to find a fair solution.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8 text-primary">Refund Processing</h2>

            <h3 className="text-xl font-semibold mb-3 text-primary">Timeframe</h3>
            <p className="text-brown mb-4">
              Once we receive and inspect your return:
            </p>
            <ul className="list-disc pl-6 mb-6 text-brown space-y-2">
              <li>We will notify you of the approval or rejection of your refund</li>
              <li>If approved, your refund will be processed within 5-7 business days</li>
              <li>Refunds will be issued to the original payment method</li>
              <li>Credit card refunds may take 5-10 additional business days to appear depending on your card issuer</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-primary">Partial Refunds</h3>
            <p className="text-brown mb-4">
              Partial refunds may be granted in the following situations:
            </p>
            <ul className="list-disc pl-6 mb-6 text-brown space-y-2">
              <li>Product shows obvious signs of use</li>
              <li>Product is not in its original condition</li>
              <li>Product packaging is damaged or missing</li>
              <li>Late cancellation of services (50% refund)</li>
            </ul>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8 text-primary">Damaged or Defective Products</h2>
            <p className="text-brown mb-4">
              If you receive a damaged or defective product:
            </p>
            <ul className="list-disc pl-6 mb-6 text-brown space-y-2">
              <li>Contact us immediately with photos of the damage</li>
              <li>Do not use the product</li>
              <li>We will send a replacement at no cost, or</li>
              <li>We will issue a full refund including original shipping costs</li>
            </ul>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8 text-primary">Shipping Costs</h2>
            <p className="text-brown mb-4">
              Regarding shipping costs for returns:
            </p>
            <ul className="list-disc pl-6 mb-6 text-brown space-y-2">
              <li>Return shipping costs are the responsibility of the customer unless the product was damaged or defective</li>
              <li>Original shipping costs are non-refundable unless the return is due to our error</li>
              <li>We recommend using a trackable shipping service for returns</li>
              <li>We are not responsible for items lost or damaged in return shipping</li>
            </ul>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8 text-primary">Exchanges</h2>
            <p className="text-brown mb-6">
              We do not offer direct exchanges. If you need a different product, please return the original item for a refund and place a new order. This ensures you receive the correct product as quickly as possible.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8 text-primary">Workshop Refunds</h2>
            <p className="text-brown mb-4">
              For workshop registrations:
            </p>
            <ul className="list-disc pl-6 mb-6 text-brown space-y-2">
              <li><strong>7+ days before workshop:</strong> Full refund minus $10 processing fee</li>
              <li><strong>3-7 days before workshop:</strong> 50% refund</li>
              <li><strong>Less than 3 days:</strong> No refund, but may transfer to another workshop</li>
              <li>Workshop materials cannot be refunded once provided</li>
            </ul>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8 text-primary">Wellness Package Refunds</h2>
            <p className="text-brown mb-6">
              For multi-session packages or wellness programs, refunds are prorated based on unused sessions. A $25 administrative fee applies to package cancellations.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8 text-primary">How to Request a Refund</h2>
            <p className="text-brown mb-4">
              To request a refund:
            </p>
            <ol className="list-decimal pl-6 mb-6 text-brown space-y-2">
              <li>Contact our customer service team</li>
              <li>Provide your order or booking number</li>
              <li>Explain the reason for your refund request</li>
              <li>Include any supporting documentation (photos for damaged products, etc.)</li>
              <li>Follow any additional instructions provided by our team</li>
            </ol>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8 text-primary">Contact Us</h2>
            <p className="text-brown mb-4">
              For refund requests or questions about this policy:
            </p>
            <div className="bg-secondary p-4 rounded-md border border-taupe text-brown">
              <p><strong>A Thyme to Heal LLC</strong></p>
              <p>Email: <a href="mailto:returns@athymetoheal.org" className="text-accent hover:underline">returns@athymetoheal.org</a></p>
              <p>Phone: <a href="tel:+1234567890" className="text-accent hover:underline">(123) 456-7890</a></p>
              <p>Business Hours: Monday-Friday, 9:00 AM - 6:00 PM</p>
              <p>Address: 123 Wellness Way, Suite 100, Herbal City, HC 12345</p>
            </div>

            <div className="mt-8 p-4 bg-sage/10 rounded-md border border-sage">
              <p className="text-brown">
                <strong>Note:</strong> We reserve the right to update this Refund Policy at any time. Changes will be effective immediately upon posting on this page.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
