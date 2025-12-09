import { Link } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, UserX, Database, Trash2 } from 'lucide-react';


const Privacy = () => {
  const privacyFeatures = [
    {
      icon: EyeOff,
      title: 'Anonymous Trading',
      description: 'Your real name and contact details are never shared with other users. All interactions happen through anonymous IDs.'
    },
    {
      icon: UserX,
      title: 'Identity Protection',
      description: 'Sellers cannot see buyer identities and vice versa. Only anonymous bidder IDs are visible during auctions.'
    },
    {
      icon: Database,
      title: 'Minimal Data Collection',
      description: 'We only collect data necessary for platform operation. Your browsing history and preferences are not tracked or sold.'
    },
    {
      icon: Trash2,
      title: 'Data Deletion Rights',
      description: 'You can request complete deletion of your account and all associated data at any time.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#c4ff0d] mb-8 transition">
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>

        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-[#c4ff0d] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Eye className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Privacy First</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            PhoneBid is built with privacy at its core. Your anonymity is guaranteed.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {privacyFeatures.map((feature, index) => (
            <div key={index} className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-2xl p-6 hover:border-[#c4ff0d]/50 transition">
              <div className="w-12 h-12 bg-[#c4ff0d]/10 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-[#c4ff0d]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">How We Protect Your Privacy</h2>
          <div className="space-y-6 text-gray-400">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Anonymous IDs</h3>
              <p>Every user is assigned a unique anonymous ID (e.g., USER_ABC123) that is used for all marketplace interactions. Your real name is never displayed to other users.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Encrypted Communications</h3>
              <p>All communications between users go through our platform. Direct contact information is never shared until both parties agree to complete a transaction.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Secure Verification</h3>
              <p>Government ID verification is required for KYC but this information is encrypted and only accessible to authorized admin personnel for fraud prevention.</p>
            </div>
          </div>
        </div>

        <div className="bg-[#0f0f0f] border border-[#c4ff0d] rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Your Privacy Rights</h2>
          <ul className="space-y-3 text-gray-400">
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[#c4ff0d] rounded-full"></div>
              <span>Access your personal data at any time</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[#c4ff0d] rounded-full"></div>
              <span>Request correction of inaccurate data</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[#c4ff0d] rounded-full"></div>
              <span>Request deletion of your account and data</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[#c4ff0d] rounded-full"></div>
              <span>Opt-out of marketing communications</span>
            </li>
          </ul>
        </div>
      </div>

    </div>
  );
};

export default Privacy;
