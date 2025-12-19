import type { Metadata } from 'next';
import Booking from '../components/Booking';

export const metadata: Metadata = {
  title: 'About Us - A Thyme To Heal',
  description: 'Meet Heidi Lynn and Illiana, a mom-daughter team dedicated to helping others heal in body, mind, and spirit through natural solutions.',
};

export default function AboutPage() {
  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary text-secondary py-16 px-4">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-accent">
            Who is <span className="font-script">A Thyme To Heal</span>?
          </h1>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-lg md:text-xl leading-relaxed text-brown mb-6">
            We are a mom daughter team who have both experienced severe health issues and in the midst, found a world of healing and hope. Now our passion is helping others heal in body, mind, and spirit.
          </p>
          <p className="text-lg md:text-xl leading-relaxed text-brown">
            Whether dealing with pain born of generational trauma, or deep rooted illness, we are here to offer a variety of natural solutions, health protocols and support. We work individually and as a team depending on the needs of the client. We offer in person and virtual.
          </p>
        </div>
      </section>

      {/* Heidi Lynn Section */}
      <section className="py-16 px-4 bg-secondary">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Photo Placeholder */}
            <div className="flex justify-center">
              <div className="w-80 h-80 bg-sage/20 rounded-lg flex items-center justify-center border-4 border-primary">
                <div className="text-center">
                  <div className="text-6xl mb-4">👤</div>
                  <p className="text-primary font-semibold text-lg">Heidi Lynn</p>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-primary">
                Hello, my fellow sojourner!
              </h2>
              <div className="space-y-4 text-brown">
                <p>
                  I&apos;m Heidi Lynn, and I&apos;m honored to walk this healing path alongside you. My calling in life is to support and empower others as they learn to heal their bodies from the inside out.
                </p>
                <p>
                  Growing up, I was taught that rest was a form of laziness — that if there was time in the day, it should be filled with work. I carried that belief into adulthood, and as a mom and homeschool teacher of five, there was always something to do. To me, rest was perceived as a bad word.
                </p>
                <p>
                  After my fourth child was born, my body began to break down. I started experiencing autoimmune symptoms, but I pressed on — taking the prescribed medications, pushing harder in my workouts, and telling myself this was just part of getting older.
                </p>
                <p>
                  During my fifth pregnancy, I received alarming news: abnormal cells were growing in my cervix. Doctors recommended a hysterectomy after delivery in hopes of removing all the rogue cells. Deep down, this didn&apos;t sit right in my spirit. I knew there had to be another way — I just didn&apos;t yet know what it was.
                </p>
                <p>
                  When I shared my story with my chiropractor, he referred me to a naturopathic doctor. That connection became a turning point in my life. Through several years of exploring natural healing modalities, I began to understand how my body had been overwhelmed — by genetic predispositions, viruses, bacteria, mold, emotional trauma, and unhealed pain. As these layers were addressed and released, my body began to restore balance.
                </p>
                <p>
                  As I witnessed my own healing, one of my sons became very ill. Specialist after specialist offered no answers or solutions, and we felt helpless as his health declined. Returning to what I had learned through my own journey, we applied natural healing principles under the guidance of my naturopathic doctor — and over time, my son experienced a full recovery.
                </p>
                <p>
                  Since then, our family has faced additional healing challenges, and I&apos;ve seen again and again that the body has an incredible God-given ability to heal when given the right support and proper rest. As Hippocrates said,
                </p>
                <blockquote className="border-l-4 border-sage pl-4 italic text-brown/80">
                  &ldquo;If someone wishes for good health, one must first ask oneself if he or she is ready to do away with the reasons for their illness. Only then is it possible to help them.&rdquo;
                </blockquote>
                <p>
                  Through years of personal healing, study, and walking alongside others on similar paths, I&apos;ve developed a deep passion for helping people find freedom — physically, emotionally, and spiritually — from the patterns and burdens that keep them from living out their true calling. That experience transformed my life and deepened my belief that nature holds much of what we need to heal. I believe that the earth provides us with everything necessary for vibrant health and that through holistic approaches, natural remedies, and gentle healing techniques, we can return to balance and wholeness. If you&apos;re ready to explore natural healing and take meaningful steps toward wellness, I would be honored to walk with you on that journey toward healing, restoration, and wholeness.
                </p>
              </div>

              <div className="mt-8 space-y-4">
                <p className="text-brown">
                  You can contact me at{' '}
                  <a href="mailto:athyme4healing@gmail.com" className="text-primary underline hover:text-primary/80">
                    athyme4healing@gmail.com
                  </a>
                </p>
                <Booking buttonText="Book with Heidi Lynn" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Illiana Section */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Bio */}
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-primary">
                Hi friend!
              </h2>
              <div className="space-y-4 text-brown">
                <p>
                  I&apos;m Illiana and I can&apos;t wait to help you in your thyme to heal.
                </p>
                <p>
                  I understand just how lonely this can be as I went through my own journey of chronic illness. For the first year of my journey I was in bed and completely alone, with no answers. After months of silence, I was lead to a path of natural healing. I learned that sometimes, our physical pain is a manifestation of our emotional state and traumas. So, for the next years I prioritized healing. I released my version of what my like should look like and fully surrendered, to the Divine and to healing. I spent countless hours pursuing truth and freedom from my pain. I dove deep into my emotional baggage. Using a variety of techniques such as EMDR, emotional release, somatic movement and rewiring neuropathways, I learned true release and healing. I healed, and continue to heal from C-PTSD, anxiety and depression. I learned true rest, and built a beautiful, slow life for myself. While those years were formative and beautiful, they were also very isolated and lonely. From that was born my goal, that my clients never feel alone while navigating health. I am so passionate about not only healing the physical body but healing the deeper emotional roots that often trigger health crisis&apos;s. I deeply believe our bodies hold everything we need inside to heal and I can&apos;t wait to come alongside you in your journey as we do just that.
                </p>
                <p className="font-semibold text-primary">
                  I can&apos;t promise it will be easy but I can promise that I will be with you every step of the way.
                </p>
              </div>

              <div className="mt-8 space-y-4">
                <p className="text-brown">
                  You can contact me at{' '}
                  <a href="mailto:illianasmithco@gmail.com" className="text-primary underline hover:text-primary/80">
                    illianasmithco@gmail.com
                  </a>
                </p>
                <Booking buttonText="Book with Illiana" />
              </div>
            </div>

            {/* Photo Placeholder */}
            <div className="flex justify-center order-1 lg:order-2">
              <div className="w-80 h-80 bg-sage/20 rounded-lg flex items-center justify-center border-4 border-primary">
                <div className="text-center">
                  <div className="text-6xl mb-4">👤</div>
                  <p className="text-primary font-semibold text-lg">Illiana</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
