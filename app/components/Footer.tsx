import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: 'About Us', href: '/about-us' },
      { name: 'How We Can Help You', href: '/how-we-can-help-you' },
      { name: 'FAQ', href: '/faq' },
      { name: 'Contact', href: '/contact' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy-policy' },
      { name: 'Terms & Conditions', href: '/terms' },
      { name: 'Refund Policy', href: '/refund-policy' },
      { name: 'Accessibility', href: '/accessibility' },
    ],
  };

  return (
    <footer className="bg-primary text-secondary">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-serif font-bold mb-4 text-accent">
              A Thyme to Heal LLC
            </h3>
            <p className="text-sm mb-4 text-secondary/90">
              Your trusted source for natural herbal remedies and wellness solutions.
              We are committed to helping you achieve optimal health through the power of nature.
            </p>
            <div className="text-sm">
              <p className="mb-1">
                <span className="font-semibold">Email:</span>{' '}
                <a href="mailto:info@athymetoheal.org" className="hover:text-accent transition-colors">
                  info@athymetoheal.org
                </a>
              </p>
              <p className="mb-1">
                <span className="font-semibold">Phone:</span>{' '}
                <a href="tel:+1234567890" className="hover:text-accent transition-colors">
                  (123) 456-7890
                </a>
              </p>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-accent">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-accent">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="border-t border-secondary/20 pt-8 mb-8">
          <div className="max-w-md">
            <h4 className="text-lg font-semibold mb-2 text-accent">
              Subscribe to Our Newsletter
            </h4>
            <p className="text-sm mb-4 text-secondary/90">
              Get wellness tips, herbal remedies, and exclusive offers delivered to your inbox.
            </p>
            <form className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-md text-brown bg-secondary border border-taupe focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
              <button
                type="submit"
                className="px-6 py-2 bg-accent text-primary font-semibold rounded-md hover:bg-accent/90 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* WLA Badge & Copyright */}
        <div className="border-t border-secondary/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Web Launch Academy Badge */}
            <div className="mb-4 md:mb-0">
              <a
                href="https://www.weblaunchacademy.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-secondary/90 hover:text-accent transition-colors underline"
              >
                Built with Web Launch Academy
              </a>
            </div>

            {/* Copyright */}
            <p className="text-sm text-secondary/80">
              &copy; {currentYear} A Thyme to Heal LLC. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
