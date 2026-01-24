import React from 'react';
import { cn } from '../../lib/utils';
import { Github, Twitter, Linkedin, Facebook, Instagram, Youtube, Mail, MapPin, Phone, ExternalLink } from 'lucide-react';

/**
 * Batch 100: Footer Component
 *
 * Footer layout components for page endings.
 *
 * Exports:
 * - Footer: Basic footer
 * - FooterSimple: Simple centered footer
 * - FooterWithNav: Footer with navigation columns
 * - FooterWithNewsletter: Footer with newsletter signup
 * - FooterMinimal: Minimal footer
 * - FooterCompact: Compact single-line footer
 * - FooterWithSocial: Footer with social links
 * - FooterWithContact: Footer with contact info
 * - FooterMultiColumn: Multi-column footer layout
 * - AppFooter: Application footer
 * - LegalFooter: Legal/compliance footer
 */

// ============================================================================
// FOOTER - Basic footer
// ============================================================================
export function Footer({
  logo,
  companyName,
  description,
  navigation = [],
  social = [],
  legal = [],
  copyright,
  children,
  className,
  ...props
}) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn(
        'bg-gray-900 text-gray-300',
        className
      )}
      {...props}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            {logo ? (
              <img src={logo} alt={companyName} className="h-8 mb-4" />
            ) : companyName && (
              <h3 className="text-xl font-bold text-white mb-4">{companyName}</h3>
            )}
            {description && (
              <p className="text-gray-400 text-sm">{description}</p>
            )}
            {social.length > 0 && (
              <div className="flex gap-4 mt-6">
                {social.map((item, index) => (
                  <SocialIcon key={index} {...item} />
                ))}
              </div>
            )}
          </div>

          {/* Navigation */}
          {navigation.map((column, index) => (
            <div key={index}>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {column.title}
              </h4>
              <ul className="space-y-3">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {children}

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            {copyright || `© ${currentYear} ${companyName}. All rights reserved.`}
          </p>
          {legal.length > 0 && (
            <div className="flex gap-6">
              {legal.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

// ============================================================================
// SOCIAL ICON - Helper component
// ============================================================================
const socialIcons = {
  github: Github,
  twitter: Twitter,
  linkedin: Linkedin,
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
};

function SocialIcon({ platform, href, label }) {
  const Icon = socialIcons[platform] || ExternalLink;

  return (
    <a
      href={href}
      aria-label={label || platform}
      className="text-gray-400 hover:text-white transition-colors"
    >
      <Icon className="w-5 h-5" />
    </a>
  );
}

// ============================================================================
// FOOTER SIMPLE - Simple centered footer
// ============================================================================
export function FooterSimple({
  companyName,
  links = [],
  social = [],
  className,
  ...props
}) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn(
        'bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800',
        className
      )}
      {...props}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center gap-6">
          {links.length > 0 && (
            <nav className="flex flex-wrap justify-center gap-6">
              {links.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          )}

          {social.length > 0 && (
            <div className="flex gap-6">
              {social.map((item, index) => (
                <SocialIcon key={index} {...item} />
              ))}
            </div>
          )}

          <p className="text-gray-400 dark:text-gray-500 text-sm">
            © {currentYear} {companyName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ============================================================================
// FOOTER WITH NAV - Footer with navigation columns
// ============================================================================
export function FooterWithNav({
  logo,
  companyName,
  navigation = [],
  copyright,
  className,
  ...props
}) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn(
        'bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800',
        className
      )}
      {...props}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Logo column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            {logo ? (
              <img src={logo} alt={companyName} className="h-8" />
            ) : companyName && (
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {companyName}
              </span>
            )}
          </div>

          {/* Navigation columns */}
          {navigation.map((column, index) => (
            <div key={index}>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                {column.title}
              </h4>
              <ul className="space-y-3">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
            {copyright || `© ${currentYear} ${companyName}. All rights reserved.`}
          </p>
        </div>
      </div>
    </footer>
  );
}

// ============================================================================
// FOOTER WITH NEWSLETTER - Footer with newsletter signup
// ============================================================================
export function FooterWithNewsletter({
  companyName,
  description,
  navigation = [],
  social = [],
  newsletterTitle = 'Subscribe to our newsletter',
  newsletterDescription = 'Get the latest updates delivered to your inbox.',
  onSubscribe,
  className,
  ...props
}) {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = React.useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubscribe?.(email);
    setEmail('');
  };

  return (
    <footer
      className={cn(
        'bg-gray-900 text-gray-300',
        className
      )}
      {...props}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Newsletter section */}
        <div className="grid md:grid-cols-2 gap-8 pb-12 border-b border-gray-800">
          <div>
            <h3 className="text-lg font-semibold text-white">
              {newsletterTitle}
            </h3>
            <p className="mt-2 text-gray-400 text-sm">
              {newsletterDescription}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* Main footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-12">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">{companyName}</h3>
            {description && (
              <p className="text-gray-400 text-sm">{description}</p>
            )}
            {social.length > 0 && (
              <div className="flex gap-4 mt-6">
                {social.map((item, index) => (
                  <SocialIcon key={index} {...item} />
                ))}
              </div>
            )}
          </div>

          {navigation.map((column, index) => (
            <div key={index}>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {column.title}
              </h4>
              <ul className="space-y-3">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-gray-800">
          <p className="text-gray-400 text-sm text-center">
            © {currentYear} {companyName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ============================================================================
// FOOTER MINIMAL - Minimal footer
// ============================================================================
export function FooterMinimal({
  companyName,
  links = [],
  className,
  ...props
}) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn(
        'py-6 px-4 sm:px-6 lg:px-8',
        'border-t border-gray-200 dark:border-gray-800',
        className
      )}
      {...props}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          © {currentYear} {companyName}
        </p>
        {links.length > 0 && (
          <nav className="flex gap-6">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm"
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}
      </div>
    </footer>
  );
}

// ============================================================================
// FOOTER COMPACT - Compact single-line footer
// ============================================================================
export function FooterCompact({
  companyName,
  links = [],
  className,
  ...props
}) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn(
        'py-4 px-4 sm:px-6 lg:px-8 bg-gray-100 dark:bg-gray-800',
        className
      )}
      {...props}
    >
      <div className="max-w-7xl mx-auto flex flex-wrap justify-center items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
        <span>© {currentYear} {companyName}</span>
        {links.map((link, index) => (
          <React.Fragment key={index}>
            <span className="text-gray-300 dark:text-gray-600">·</span>
            <a
              href={link.href}
              className="hover:text-gray-900 dark:hover:text-white"
            >
              {link.label}
            </a>
          </React.Fragment>
        ))}
      </div>
    </footer>
  );
}

// ============================================================================
// FOOTER WITH CONTACT - Footer with contact info
// ============================================================================
export function FooterWithContact({
  companyName,
  description,
  contact = {},
  navigation = [],
  social = [],
  className,
  ...props
}) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn(
        'bg-gray-900 text-gray-300',
        className
      )}
      {...props}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">{companyName}</h3>
            {description && (
              <p className="text-gray-400 text-sm mb-6">{description}</p>
            )}

            {/* Contact Info */}
            <div className="space-y-3">
              {contact.address && (
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  <span>{contact.address}</span>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <a href={`tel:${contact.phone}`} className="hover:text-white">
                    {contact.phone}
                  </a>
                </div>
              )}
              {contact.email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <a href={`mailto:${contact.email}`} className="hover:text-white">
                    {contact.email}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          {navigation.map((column, index) => (
            <div key={index}>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {column.title}
              </h4>
              <ul className="space-y-3">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © {currentYear} {companyName}. All rights reserved.
          </p>
          {social.length > 0 && (
            <div className="flex gap-4">
              {social.map((item, index) => (
                <SocialIcon key={index} {...item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

// ============================================================================
// APP FOOTER - Application footer
// ============================================================================
export function AppFooter({
  appName,
  version,
  links = [],
  status,
  className,
  ...props
}) {
  return (
    <footer
      className={cn(
        'py-4 px-4 sm:px-6 lg:px-8',
        'bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800',
        className
      )}
      {...props}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {appName}
            {version && (
              <span className="ml-2 text-gray-400 dark:text-gray-500">
                v{version}
              </span>
            )}
          </span>
          {status && (
            <span className={cn(
              'inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full',
              status.type === 'success' && 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400',
              status.type === 'warning' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400',
              status.type === 'error' && 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'
            )}>
              <span className={cn(
                'w-1.5 h-1.5 rounded-full',
                status.type === 'success' && 'bg-green-500',
                status.type === 'warning' && 'bg-yellow-500',
                status.type === 'error' && 'bg-red-500'
              )} />
              {status.label}
            </span>
          )}
        </div>

        {links.length > 0 && (
          <nav className="flex gap-6">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}
      </div>
    </footer>
  );
}

// ============================================================================
// LEGAL FOOTER - Legal/compliance footer
// ============================================================================
export function LegalFooter({
  companyName,
  legalEntity,
  registrationNumber,
  address,
  links = [],
  certifications = [],
  className,
  ...props
}) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn(
        'py-8 px-4 sm:px-6 lg:px-8 bg-gray-100 dark:bg-gray-900',
        className
      )}
      {...props}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 space-y-4">
          <p>
            © {currentYear} {companyName}
            {legalEntity && ` - ${legalEntity}`}
            {registrationNumber && ` - Reg. No: ${registrationNumber}`}
          </p>

          {address && <p>{address}</p>}

          {links.length > 0 && (
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {links.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="hover:text-gray-700 dark:hover:text-gray-300 underline"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          )}

          {certifications.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              {certifications.map((cert, index) => (
                <img
                  key={index}
                  src={cert.image}
                  alt={cert.name}
                  title={cert.name}
                  className="h-8 opacity-50 hover:opacity-100 transition-opacity"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
