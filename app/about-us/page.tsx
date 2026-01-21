import type { Metadata } from 'next';
import Image from 'next/image';
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
            Who is <span className="font-script">A Thyme To Heal?</span>
          </h1>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-lg md:text-xl leading-relaxed text-brown">
            We&apos;re a mother–daughter team who have both walked long seasons of pain, confusion, and feeling like no one was listening. In those seasons, we discovered something that gave us hope again — a grounded way of healing that blends nature&apos;s rhythms with science‑informed support. Now our passion is helping women who feel unseen, exhausted, or overwhelmed find a steadier path back to themselves.
          </p>
        </div>
      </section>

      {/* Heidi Lynn Section */}
      <section className="py-16 px-4 bg-secondary">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Photo */}
            <div className="flex justify-center">
              <div className="w-80 h-80 rounded-lg overflow-hidden border-4 border-primary shadow-lg">
                <Image
                  src="/images/Heidi-Oval.avif"
                  alt="Heidi Lynn - A Thyme to Heal Wellness Guide"
                  width={320}
                  height={320}
                  className="w-full h-full object-cover object-top"
                  priority
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-primary">
                Why I Do This Work
              </h2>
              <div className="space-y-4 text-brown">
                <p>
                  Hello, my fellow sojourner! I&apos;m Heidi Lynn, and I&apos;m honored to walk this healing path alongside you. My calling in life is to support and empower others as they learn to heal their bodies from the inside out.
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
                <Booking buttonText="Book with Heidi Lynn" defaultConsultant="Heidi Lynn" />
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
                Why I Do This Work
              </h2>
              <div className="space-y-4 text-brown">
                <p>
                  Hi friend! I&apos;m Illiana, and I can&apos;t wait to help you in your thyme to heal. I understand just how lonely this journey can be, as I walked through my own season of chronic illness. For the first year, I was mostly confined to bed—alone, without answers, and searching for relief. After months of silence, I was led toward a path of natural healing, where I learned that sometimes our physical pain is a manifestation of deeper emotional wounds and unresolved trauma.
                </p>
                <p>
                  Over the years that followed, I made healing my priority. I released the version of life I thought I should have and fully surrendered—to the Divine, to rest, and to the process of healing. I spent countless hours pursuing truth and freedom from pain, diving deep into emotional work through practices such as EMDR, emotional release, somatic movement, and rewiring neural pathways. Through this, I healed—and continue to heal—from C-PTSD, anxiety, and depression. I learned what true rest feels like and slowly built a life that is gentle, grounded, and deeply meaningful.
                </p>
                <p>
                  While those years were formative and beautiful, they were also isolating. From that season, a clear calling emerged: that no one I work with would ever feel alone while navigating their health. I am deeply passionate about not only healing the physical body, but tending to the emotional roots that often sit beneath health crises. I believe our bodies hold an innate wisdom and capacity to heal, and I am honored to walk alongside you as you reconnect with that truth.
                </p>
                <p>
                  As my own healing deepened, I also felt called to support women who sensed that their experiences were meant to become something more. Today, I help women in the health and wellness space build soul-led, sustainable businesses—ones that honor rest, integrity, and real life. We build slowly and intentionally, focusing on alignment, nervous system regulation, and creating work that supports your wellbeing rather than depleting it. I believe our healing stories carry purpose, and I am passionate about helping women steward them into businesses that feel rooted, nourishing, and true.
                </p>
                <p className="font-semibold text-primary">
                  I can&apos;t promise this journey will be easy—but I can promise that I will be with you every step of the way.
                </p>
                <p className="mt-6">
                  My work supports women in two sacred spaces: healing and building. I offer one-on-one support for women navigating health challenges and guide those who feel called to create soul-led health businesses rooted in integrity, rest, and sustainability. If either path resonates, you can schedule a call with me below.
                </p>
              </div>

              <div className="mt-8 space-y-4">
                <p className="text-brown">
                  You can contact me at{' '}
                  <a href="mailto:illianasmithco@gmail.com" className="text-primary underline hover:text-primary/80">
                    illianasmithco@gmail.com
                  </a>
                </p>
                <Booking buttonText="Book with Illiana" defaultConsultant="Illiana" />
              </div>
            </div>

            {/* Photo */}
            <div className="flex justify-center order-1 lg:order-2">
              <div className="w-80 h-80 rounded-lg overflow-hidden border-4 border-primary shadow-lg">
                <Image
                  src="/images/Illiana-Oval.avif"
                  alt="Illiana - A Thyme to Heal Wellness Guide"
                  width={320}
                  height={320}
                  className="w-full h-full object-cover object-top"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
