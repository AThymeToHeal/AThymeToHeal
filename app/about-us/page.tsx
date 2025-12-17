import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us - A Thyme to Heal LLC',
  description: 'Learn about A Thyme to Heal, our mission, values, and commitment to providing natural herbal remedies and wellness solutions.',
};

export default function AboutPage() {
  const coreValues = [
    {
      icon: '🌱',
      title: 'Natural Healing',
      description: 'We believe in the power of nature to support the body\'s innate healing abilities through carefully selected herbs and natural remedies.',
    },
    {
      icon: '💚',
      title: 'Personalized Care',
      description: 'Every individual is unique, and so are their wellness needs. We provide customized solutions tailored to each person\'s specific health goals.',
    },
    {
      icon: '🎓',
      title: 'Education & Empowerment',
      description: 'We empower our clients with knowledge about herbal medicine, enabling them to make informed decisions about their health.',
    },
    {
      icon: '🌍',
      title: 'Sustainability',
      description: 'We are committed to ethical sourcing, environmental responsibility, and sustainable practices in everything we do.',
    },
    {
      icon: '✨',
      title: 'Quality Excellence',
      description: 'We use only the highest quality, organic herbs from trusted suppliers to ensure the safety and effectiveness of our products.',
    },
    {
      icon: '🤝',
      title: 'Community & Trust',
      description: 'Building lasting relationships based on trust, integrity, and genuine care for our clients\' wellbeing is at the heart of what we do.',
    },
  ];

  const milestones = [
    {
      year: '2018',
      title: 'The Beginning',
      description: 'A Thyme to Heal was founded with a passion for natural wellness and herbal remedies.',
    },
    {
      year: '2019',
      title: 'First Workshop',
      description: 'Launched our first educational workshop series, sharing herbal knowledge with the community.',
    },
    {
      year: '2020',
      title: 'Expanded Services',
      description: 'Added wellness coaching and custom blend formulations to our offerings.',
    },
    {
      year: '2021',
      title: 'Community Growth',
      description: 'Reached 500+ satisfied clients and expanded our educational programs.',
    },
    {
      year: '2022',
      title: 'Virtual Consultations',
      description: 'Introduced virtual consultation services to serve clients nationwide.',
    },
    {
      year: '2023',
      title: 'Continued Excellence',
      description: 'Celebrating 5 years of helping people achieve their wellness goals naturally.',
    },
  ];

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary text-secondary py-16 px-4">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-accent">
            About A Thyme to Heal
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto">
            Dedicated to your wellness journey through the healing power of nature
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-center text-primary">
            Our Story
          </h2>
          <div className="prose prose-lg max-w-none text-brown space-y-4">
            <p className="text-lg leading-relaxed">
              A Thyme to Heal was born from a deep passion for natural wellness and a belief that nature provides
              everything we need to support our bodies&apos; healing processes. Our founder discovered the transformative
              power of herbal remedies through personal experience, and was inspired to share this knowledge with others
              seeking natural alternatives for their health and wellness.
            </p>
            <p className="text-lg leading-relaxed">
              What started as a small consultation practice has blossomed into a comprehensive wellness center offering
              personalized herbal consultations, custom blends, wellness coaching, and educational workshops. We&apos;ve had
              the privilege of guiding hundreds of individuals on their journey to optimal health, and we continue to be
              inspired by their transformations every day.
            </p>
            <p className="text-lg leading-relaxed">
              At A Thyme to Heal, we combine traditional herbal wisdom passed down through generations with modern
              research and understanding. We believe in treating the whole person—body, mind, and spirit—and creating
              sustainable wellness practices that fit into your lifestyle.
            </p>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-16 px-4 bg-secondary">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Founder Image Placeholder */}
            <div className="flex justify-center">
              <div className="w-80 h-80 bg-sage/20 rounded-full flex items-center justify-center border-4 border-primary">
                <div className="text-center">
                  <div className="text-6xl mb-4">👤</div>
                  <p className="text-primary font-semibold text-lg">Founder Photo</p>
                </div>
              </div>
            </div>

            {/* Founder Bio */}
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-primary">
                Meet Our Founder
              </h2>
              <h3 className="text-2xl font-semibold mb-4 text-brown">
                [Founder Name], Certified Herbalist
              </h3>
              <div className="space-y-4 text-brown">
                <p>
                  With over [X] years of experience in herbal medicine and holistic wellness, [Founder Name] brings a
                  wealth of knowledge and genuine passion to A Thyme to Heal. Certified in [relevant certifications],
                  they have dedicated their life to understanding the healing properties of plants and helping others
                  discover natural wellness solutions.
                </p>
                <p>
                  [Founder Name]&apos;s journey into herbal medicine began [brief personal story]. This transformative
                  experience inspired a deep commitment to studying herbalism, earning certifications in [specific areas],
                  and eventually founding A Thyme to Heal to share this healing knowledge with the community.
                </p>
                <p>
                  When not consulting with clients or crafting custom herbal blends, [Founder Name] enjoys [hobbies/interests],
                  continuing education in herbalism, and growing medicinal herbs in their own garden.
                </p>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold text-primary mb-2">Certifications & Qualifications:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-sage mr-2">✓</span>
                    <span className="text-brown">Certified Clinical Herbalist</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-sage mr-2">✓</span>
                    <span className="text-brown">Holistic Nutrition Specialist</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-sage mr-2">✓</span>
                    <span className="text-brown">Wellness Coach Certification</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-sage mr-2">✓</span>
                    <span className="text-brown">Continued education in botanical medicine</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-12 text-center text-primary">
            Our Core Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreValues.map((value, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-md border border-taupe hover:shadow-lg transition-shadow"
              >
                <div className="text-5xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-primary">
                  {value.title}
                </h3>
                <p className="text-brown">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 px-4 bg-sage/10">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-12 text-center text-primary">
            Our Journey
          </h2>
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex gap-6">
                <div className="flex-shrink-0 w-24 text-right">
                  <span className="text-2xl font-bold text-accent">{milestone.year}</span>
                </div>
                <div className="flex-shrink-0 mt-2">
                  <div className="w-4 h-4 bg-primary rounded-full"></div>
                  {index !== milestones.length - 1 && (
                    <div className="w-0.5 h-full bg-primary/30 ml-1.5 mt-1"></div>
                  )}
                </div>
                <div className="flex-grow pb-8">
                  <h3 className="text-xl font-semibold mb-2 text-primary">
                    {milestone.title}
                  </h3>
                  <p className="text-brown">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-primary">
            Why Choose A Thyme to Heal?
          </h2>
          <div className="prose prose-lg max-w-none text-brown space-y-4 mb-8">
            <p className="text-lg leading-relaxed">
              When you choose A Thyme to Heal, you&apos;re choosing a partner in your wellness journey. We take the time to
              understand your unique needs, health goals, and lifestyle to create personalized solutions that work for you.
            </p>
            <p className="text-lg leading-relaxed">
              Our commitment to quality, education, and sustainable practices sets us apart. We don&apos;t just provide
              products—we empower you with knowledge and support to help you achieve lasting wellness naturally.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/how-we-can-help-you"
              className="px-8 py-3 bg-primary text-secondary font-semibold rounded-md hover:bg-primary/90 transition-colors text-lg"
            >
              Explore Our Services
            </Link>
            <Link
              href="/contact"
              className="px-8 py-3 bg-transparent border-2 border-primary text-primary font-semibold rounded-md hover:bg-primary/10 transition-colors text-lg"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
