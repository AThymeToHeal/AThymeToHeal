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
            <h3 className="text-3xl font-script mb-4 text-accent">
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

        {/* Social Links, WLA Badge & Copyright */}
        <div className="border-t border-secondary/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
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

            {/* Social Links */}
            <div className="flex gap-4 mb-4 md:mb-0">
              <a
                href="https://www.instagram.com/thethymetoheal/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary hover:text-accent transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://www.doterra.com/US/en/site/athymetohealilliana"
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary hover:text-accent transition-colors"
                aria-label="doTERRA Shop"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                </svg>
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
