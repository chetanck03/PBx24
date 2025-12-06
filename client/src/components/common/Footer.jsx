import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#0a0a0a] border-t border-[#1a1a1a] text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12">
          {/* Brand Section */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-[#c4ff0d] rounded-xl flex items-center justify-center">
                <span className="text-black font-bold text-lg">P</span>
              </div>
              <h3 className="text-xl font-bold text-white">PhoneBid</h3>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              The world's first anonymous phone marketplace. Buy and sell phones with complete privacy and security.
            </p>
            {/* Social Icons */}
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg flex items-center justify-center hover:border-[#c4ff0d] hover:bg-[#c4ff0d]/10 transition">
                <svg className="w-5 h-5 text-gray-400 hover:text-[#c4ff0d]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg flex items-center justify-center hover:border-[#c4ff0d] hover:bg-[#c4ff0d]/10 transition">
                <svg className="w-5 h-5 text-gray-400 hover:text-[#c4ff0d]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg flex items-center justify-center hover:border-[#c4ff0d] hover:bg-[#c4ff0d]/10 transition">
                <svg className="w-5 h-5 text-gray-400 hover:text-[#c4ff0d]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Platform</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/how-it-works" className="text-gray-400 text-sm hover:text-[#c4ff0d] transition">
                  How it Works
                </Link>
              </li>
              <li>
                <Link to="/security" className="text-gray-400 text-sm hover:text-[#c4ff0d] transition">
                  Security
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-400 text-sm hover:text-[#c4ff0d] transition">
                  Privacy
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Support</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/help" className="text-gray-400 text-sm hover:text-[#c4ff0d] transition">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 text-sm hover:text-[#c4ff0d] transition">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 text-sm hover:text-[#c4ff0d] transition">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Legal</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/terms" className="text-gray-400 text-sm hover:text-[#c4ff0d] transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-gray-400 text-sm hover:text-[#c4ff0d] transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-400 text-sm hover:text-[#c4ff0d] transition">
                  Blog
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#1a1a1a] pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              &copy; 2024 PhoneBid Marketplace. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-500">
              <Link to="/privacy-policy" className="hover:text-[#c4ff0d] transition">Privacy</Link>
              <Link to="/terms" className="hover:text-[#c4ff0d] transition">Terms</Link>
              <Link to="/blog" className="hover:text-[#c4ff0d] transition">Blog</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
