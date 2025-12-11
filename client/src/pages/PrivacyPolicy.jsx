import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';


const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#c4ff0d] mb-8 transition">
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>

        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-[#c4ff0d] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-gray-400">Last updated: December 2025</p>
        </div>

        <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-2xl p-8 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-white mb-4">1. Information We Collect</h2>
            <div className="text-gray-400 leading-relaxed space-y-3">
              <p><strong className="text-white">Personal Information:</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Name and email address</li>
                <li>Government ID for KYC verification</li>
                <li>Phone number (optional)</li>
                <li>Payment information</li>
              </ul>
              <p className="mt-4"><strong className="text-white">Usage Information:</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Device information and IP address</li>
                <li>Browser type and version</li>
                <li>Pages visited and actions taken</li>
                <li>Transaction history</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">2. How We Use Your Information</h2>
            <div className="text-gray-400 leading-relaxed">
              <ul className="list-disc pl-6 space-y-2">
                <li>To create and manage your account</li>
                <li>To process transactions and payments</li>
                <li>To verify your identity (KYC)</li>
                <li>To communicate with you about your account</li>
                <li>To prevent fraud and ensure platform security</li>
                <li>To improve our services</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">3. Anonymous Identity Protection</h2>
            <p className="text-gray-400 leading-relaxed">
              PhoneBid is designed with privacy at its core. Your real identity is never shared with other users. All marketplace interactions use your Anonymous ID. Sellers cannot see buyer identities and vice versa. Only authorized admin personnel can access identity information for fraud prevention and dispute resolution.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">4. Data Security</h2>
            <div className="text-gray-400 leading-relaxed">
              <p>We implement industry-standard security measures:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>AES-256 encryption for sensitive data</li>
                <li>Secure HTTPS connections</li>
                <li>Regular security audits</li>
                <li>Access controls and authentication</li>
                <li>Encrypted database storage</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">5. Data Sharing</h2>
            <div className="text-gray-400 leading-relaxed">
              <p>We do not sell your personal information. We may share data with:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Payment processors for transaction processing</li>
                <li>Cloud service providers for hosting</li>
                <li>Law enforcement when legally required</li>
                <li>Third parties with your explicit consent</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">6. Your Rights</h2>
            <div className="text-gray-400 leading-relaxed">
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Access your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your data</li>
                <li>Export your data</li>
                <li>Opt-out of marketing communications</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">7. Data Retention</h2>
            <p className="text-gray-400 leading-relaxed">
              We retain your data for as long as your account is active or as needed to provide services. Transaction records are kept for 7 years for legal compliance. You can request deletion of your account and associated data at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">8. Cookies</h2>
            <p className="text-gray-400 leading-relaxed">
              We use essential cookies for authentication and session management. We do not use tracking cookies for advertising. You can manage cookie preferences in your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">9. Children's Privacy</h2>
            <p className="text-gray-400 leading-relaxed">
              PhoneBid is not intended for users under 18 years of age. We do not knowingly collect information from children. If we discover we have collected data from a minor, we will delete it immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">10. Contact Us</h2>
            <p className="text-gray-400 leading-relaxed">
              For privacy-related questions or to exercise your rights, contact us at{' '}
              <a href="mailto:privacy@phonebid.com" className="text-[#c4ff0d] hover:underline">privacy@phonebid.com</a>
            </p>
          </section>
        </div>
      </div>

    </div>
  );
};

export default PrivacyPolicy;
