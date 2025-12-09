import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';


const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#c4ff0d] mb-8 transition">
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>

        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-[#c4ff0d] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Terms of Service</h1>
          <p className="text-gray-400">Last updated: December 2024</p>
        </div>

        <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-2xl p-8 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-400 leading-relaxed">
              By accessing or using PhoneBid ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services. These terms apply to all users, including buyers, sellers, and visitors.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">2. User Accounts</h2>
            <div className="text-gray-400 leading-relaxed space-y-3">
              <p>To use PhoneBid, you must:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Be at least 18 years old</li>
                <li>Provide accurate and complete registration information</li>
                <li>Complete KYC verification with valid government ID</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">3. Buying and Selling</h2>
            <div className="text-gray-400 leading-relaxed space-y-3">
              <p><strong className="text-white">For Buyers:</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li>All bids are binding commitments to purchase</li>
                <li>Payment must be completed within specified timeframes</li>
                <li>Verification of phone condition is your responsibility at the meeting</li>
              </ul>
              <p className="mt-4"><strong className="text-white">For Sellers:</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Listings must accurately describe the phone's condition</li>
                <li>All phones must be legally owned and free of liens</li>
                <li>IMEI numbers must be valid and not blacklisted</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">4. Escrow and Payments</h2>
            <p className="text-gray-400 leading-relaxed">
              All transactions are processed through our secure escrow system. Funds are held until the verification meeting is completed and both parties confirm the transaction. PhoneBid charges a platform fee of 5% on successful transactions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">5. Prohibited Activities</h2>
            <div className="text-gray-400 leading-relaxed">
              <p>Users are prohibited from:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Listing stolen or counterfeit phones</li>
                <li>Providing false information in listings</li>
                <li>Manipulating bids or auction outcomes</li>
                <li>Circumventing the escrow system</li>
                <li>Harassing other users</li>
                <li>Using the platform for money laundering</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">6. Dispute Resolution</h2>
            <p className="text-gray-400 leading-relaxed">
              In case of disputes, users should first attempt resolution through our complaints system. PhoneBid will mediate disputes and make final decisions based on available evidence. Our decision is binding on all parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-400 leading-relaxed">
              PhoneBid is a marketplace platform and does not guarantee the quality, safety, or legality of items listed. We are not responsible for user conduct or the outcome of transactions. Our liability is limited to the fees collected for the specific transaction in question.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">8. Account Termination</h2>
            <p className="text-gray-400 leading-relaxed">
              We reserve the right to suspend or terminate accounts that violate these terms. Users may also delete their accounts at any time, subject to completion of any pending transactions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">9. Changes to Terms</h2>
            <p className="text-gray-400 leading-relaxed">
              We may update these terms from time to time. Continued use of the platform after changes constitutes acceptance of the new terms. We will notify users of significant changes via email.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">10. Contact</h2>
            <p className="text-gray-400 leading-relaxed">
              For questions about these Terms of Service, please contact us at{' '}
              <a href="mailto:legal@phonebid.com" className="text-[#c4ff0d] hover:underline">legal@phonebid.com</a>
            </p>
          </section>
        </div>
      </div>

    </div>
  );
};

export default TermsOfService;
