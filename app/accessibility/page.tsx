import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accessibility Statement - A Thyme to Heal',
  description: 'Learn about our commitment to digital accessibility and how we ensure our website is accessible to all users.',
};

export default function AccessibilityPage() {
  const lastUpdated = 'January 8, 2026';

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary text-secondary py-12 px-4">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-accent">
            Accessibility Statement
          </h1>
          <p className="text-lg">
            Last Updated: {lastUpdated}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4">
        <div className="mx-auto max-w-4xl prose prose-lg">
          <div className="bg-white p-8 rounded-lg shadow-md border border-taupe">
            <h2 className="text-2xl font-serif font-bold mb-4 text-primary">Our Commitment to Accessibility</h2>
            <p className="text-brown mb-6">
              A Thyme to Heal is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards to ensure we provide equal access to all of our users.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8 text-primary">Conformance Status</h2>
            <p className="text-brown mb-6">
              We strive to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards. These guidelines explain how to make web content more accessible for people with disabilities and more user-friendly for everyone.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8 text-primary">Accessibility Features</h2>
            <p className="text-brown mb-4">
              Our website includes the following accessibility features:
            </p>

            <h3 className="text-xl font-semibold mb-3 text-primary">Navigation and Structure</h3>
            <ul className="list-disc pl-6 mb-6 text-brown space-y-2">
              <li>Clear and consistent navigation throughout the site</li>
              <li>Logical heading structure for screen readers</li>
              <li>Keyboard navigation support for all interactive elements</li>
              <li>Skip navigation links to help users bypass repetitive content</li>
              <li>Clear focus indicators for keyboard users</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-primary">Visual Design</h3>
            <ul className="list-disc pl-6 mb-6 text-brown space-y-2">
              <li>Sufficient color contrast between text and background</li>
              <li>Text that can be resized up to 200% without loss of functionality</li>
              <li>Responsive design that works on various screen sizes</li>
              <li>Information not conveyed by color alone</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-primary">Content</h3>
            <ul className="list-disc pl-6 mb-6 text-brown space-y-2">
              <li>Alternative text (alt text) for images and graphics</li>
              <li>Descriptive link text that makes sense out of context</li>
              <li>Clear and simple language where possible</li>
              <li>Proper labeling of form fields</li>
              <li>Error identification and suggestions in forms</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-primary">Multimedia</h3>
            <ul className="list-disc pl-6 mb-6 text-brown space-y-2">
              <li>Captions for video content (when applicable)</li>
              <li>Transcripts for audio content (when applicable)</li>
              <li>Controls for media playback</li>
            </ul>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8 text-primary">Assistive Technologies</h2>
            <p className="text-brown mb-4">
              Our website is designed to be compatible with the following assistive technologies:
            </p>
            <ul className="list-disc pl-6 mb-6 text-brown space-y-2">
              <li>Screen readers (such as JAWS, NVDA, and VoiceOver)</li>
              <li>Screen magnification software</li>
              <li>Speech recognition software</li>
              <li>Alternative input devices</li>
            </ul>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8 text-primary">Browser Compatibility</h2>
            <p className="text-brown mb-4">
              Our website is designed to work with the following browsers and their latest versions:
            </p>
            <ul className="list-disc pl-6 mb-6 text-brown space-y-2">
              <li>Google Chrome</li>
              <li>Mozilla Firefox</li>
              <li>Safari</li>
              <li>Microsoft Edge</li>
            </ul>
            <p className="text-brown mb-6">
              For the best experience, we recommend using the latest version of your preferred browser.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8 text-primary">Known Limitations</h2>
            <p className="text-brown mb-4">
              Despite our best efforts, there may be some limitations. Currently known limitations include:
            </p>
            <ul className="list-disc pl-6 mb-6 text-brown space-y-2">
              <li>Some third-party content may not be fully accessible</li>
              <li>Certain PDF documents may not be fully accessible (we are working to update these)</li>
              <li>Some older content may not meet current accessibility standards (we are updating this content)</li>
            </ul>
            <p className="text-brown mb-6">
              We are actively working to address these limitations and improve accessibility across all content.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8 text-primary">Ongoing Efforts</h2>
            <p className="text-brown mb-4">
              We are committed to continuously improving our website&apos;s accessibility. Our ongoing efforts include:
            </p>
            <ul className="list-disc pl-6 mb-6 text-brown space-y-2">
              <li>Regular accessibility audits and testing</li>
              <li>Training our team on accessibility best practices</li>
              <li>Including accessibility in our design and development process</li>
              <li>Testing with actual users who have disabilities</li>
              <li>Staying informed about evolving accessibility standards</li>
            </ul>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8 text-primary">Third-Party Content</h2>
            <p className="text-brown mb-6">
              Some content on our website may be provided by third parties. While we strive to ensure all content is accessible, we may not always have control over the accessibility of third-party content. We are committed to working with our partners to improve accessibility where possible.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8 text-primary">Accessibility Support</h2>
            <p className="text-brown mb-4">
              If you need assistance accessing any content on our website, or if you would like to request information in an alternative format, please contact us:
            </p>
            <div className="bg-secondary p-4 rounded-md border border-taupe text-brown mb-6">
              <p><strong>Accessibility Contact</strong></p>
              <p>Email: <a href="mailto:athyme4healing@gmail.com" className="text-accent hover:underline">athyme4healing@gmail.com</a></p>
              <p>Contact Form: <a href="/contact" className="text-accent hover:underline">Send us a message</a></p>
              <p>We aim to respond to accessibility inquiries within 2 business days.</p>
            </div>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8 text-primary">Feedback</h2>
            <p className="text-brown mb-6">
              We welcome your feedback on the accessibility of our website. Please let us know if you encounter any accessibility barriers or have suggestions for improvement. Your feedback helps us identify areas where we can enhance accessibility for all users.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8 text-primary">Reporting Accessibility Issues</h2>
            <p className="text-brown mb-4">
              If you encounter an accessibility issue, please report it to us with the following information:
            </p>
            <ul className="list-disc pl-6 mb-6 text-brown space-y-2">
              <li>The page or feature where you encountered the issue</li>
              <li>A description of the problem</li>
              <li>The assistive technology you were using (if applicable)</li>
              <li>Your browser and operating system</li>
              <li>Any other relevant details</li>
            </ul>
            <p className="text-brown mb-6">
              We will investigate the issue and work to resolve it as quickly as possible.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8 text-primary">Alternative Contact Methods</h2>
            <p className="text-brown mb-4">
              In addition to our website, you can reach us through the following methods:
            </p>
            <ul className="list-disc pl-6 mb-6 text-brown space-y-2">
              <li><strong>Email:</strong> <a href="mailto:athyme4healing@gmail.com" className="text-accent hover:underline">athyme4healing@gmail.com</a></li>
              <li><strong>Contact Form:</strong> <a href="/contact" className="text-accent hover:underline">Send us a message</a></li>
            </ul>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8 text-primary">Formal Complaints</h2>
            <p className="text-brown mb-6">
              If you are not satisfied with our response to your accessibility concern, you may file a complaint with the appropriate regulatory authority in your jurisdiction.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8 text-primary">Updates to This Statement</h2>
            <p className="text-brown mb-6">
              We regularly review and update this accessibility statement. This statement was last reviewed and updated on {lastUpdated}.
            </p>

            <div className="mt-8 p-4 bg-sage/10 rounded-md border border-sage">
              <p className="text-brown">
                <strong>Note:</strong> This accessibility statement applies to the website athymetoheal.org. It does not cover any third-party websites that may be linked from our site.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
