import type { Metadata } from 'next';
import Booking from '../components/Booking';

export const metadata: Metadata = {
  title: 'Business Consultation - A Thyme to Heal',
  description: 'Turn your health journey into a business that changes lives. Join our mentorship program and build a thriving health-based business.',
};

export default function BusinessConsultationPage() {
  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary text-secondary py-20 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 text-accent">
            Turn your health journey into a business that changes lives
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Transform your personal health experiences into passion, purpose, and income
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-4xl">
          {/* Introduction */}
          <div className="bg-white p-8 rounded-lg shadow-md border border-taupe mb-12">
            <p className="text-lg text-brown leading-relaxed">
              This program is for women ages 20–60 who are ready to take their personal health experiences and transform them into passion, purpose, and income. No prior business experience is needed — just a desire to help others, create freedom, and build a beautiful life on your own terms. Whether you&apos;re a young mom, a woman who is ready to achieve financial freedom, or someone ready to leave a full-time job behind, this container is for you.
            </p>
          </div>

          {/* How I Help You */}
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-primary">
              How I Help You
            </h2>
            <div className="bg-sage/10 p-8 rounded-lg border border-sage">
              <p className="text-lg text-brown mb-6 leading-relaxed">
                I provide a step-by-step container to start your health business with minimal hassle, using dōTERRA as a foundation:
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-accent mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-brown text-lg">Launch without filing an LLC or investing thousands upfront</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-accent mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-brown text-lg">Gain instant access to a supportive community</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-accent mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-brown text-lg">Build your business around health, wellness, and purpose</span>
                </li>
              </ul>
              <p className="text-lg text-brown leading-relaxed">
                Through 1:1 coaching, encouragement, goal-setting, and ongoing support, I help you create a clear, simple plan that&apos;s easy to follow and designed for success. Beyond business, I mentor you personally — helping you understand your own strengths, story, and potential so you can show up authentically in your business.
              </p>
            </div>
          </div>

          {/* What Makes Our Team Different */}
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-primary">
              What Makes our Team Different
            </h2>
            <div className="bg-white p-8 rounded-lg shadow-md border border-taupe">
              <p className="text-lg text-brown leading-relaxed">
                We genuinely care about your success — in business and in life. We want to see you thrive in every area, achieve your dreams, and build the life you&apos;ve always imagined. We are committed to supporting you fully, helping you uncover your story, strengths, and potential so you can show up authentically in your business. Your health and mental health is our top priority and will always come before business.
              </p>
            </div>
          </div>

          {/* The Result */}
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-primary">
              The Result
            </h2>
            <div className="bg-sage/10 p-8 rounded-lg border border-sage">
              <p className="text-lg text-brown mb-6">By the end of this program, you&apos;ll have:</p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-accent mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-brown text-lg">A thriving health-based business that fits your lifestyle</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-accent mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-brown text-lg">Confidence and clarity on your path forward</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-accent mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-brown text-lg">The freedom to work fewer hours while creating real impact and income</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-accent mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-brown text-lg">Support, mentorship, and community to guide you every step of the way</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Program Timeline */}
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-primary">
              Program Timeline / Commitment
            </h2>
            <div className="bg-white p-8 rounded-lg shadow-md border border-taupe">
              <p className="text-lg text-brown mb-4 leading-relaxed">
                This is a long-term mentorship, designed to guide you as you build your health business and step into your full potential. Most clients experience the most intense support in the first 6–12 months, with weekly calls, group support, and 1:1 coaching.
              </p>
              <p className="text-lg text-brown leading-relaxed">
                Some clients move through the program faster — as little as six weeks — depending on your goals and pace. You&apos;ll have ongoing access to mentorship and guidance as long as you&apos;re building your business, so you&apos;re never navigating it alone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-secondary">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-primary">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg mb-8 text-brown">
            Book a consultation with Illiana to learn more about building your health-based business and transforming lives.
          </p>
          <Booking
            buttonText="Book a Business Consultation"
            defaultConsultant="Illiana"
            defaultServiceType="Business Consultation"
            availableConsultants={['Illiana']}
          />
        </div>
      </section>
    </div>
  );
}
