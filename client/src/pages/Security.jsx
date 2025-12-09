import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Server, Key, AlertTriangle } from 'lucide-react';


const Security = () => {
  const features = [
    {
      icon: Lock,
      title: 'End-to-End Encryption',
      description: 'All sensitive data including IMEI numbers, personal information, and transaction details are encrypted using AES-256 encryption.'
    },
    {
      icon: Eye,
      title: 'Anonymous Identity',
      description: 'Your real identity is never exposed. Every user gets a unique anonymous ID that is used for all marketplace interactions.'
    },
    {
      icon: Server,
      title: 'Secure Infrastructure',
      description: 'Our servers are hosted on enterprise-grade cloud infrastructure with 24/7 monitoring, DDoS protection, and regular security audits.'
    },
    {
      icon: Key,
      title: 'Two-Factor Authentication',
      description: 'Protect your account with email OTP verification. Every login and sensitive action requires verification.'
    },
    {
      icon: Shield,
      title: 'Escrow Protection',
      description: 'All transactions go through our secure escrow system. Funds are only released after successful verification.'
    },
    {
      icon: AlertTriangle,
      title: 'Fraud Detection',
      description: 'Advanced AI-powered fraud detection systems monitor all activities to prevent scams and protect users.'
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
            <Shield className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Security at PhoneBid</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Your security is our top priority. Learn how we protect your data and transactions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-2xl p-6 hover:border-[#c4ff0d]/50 transition">
              <div className="w-12 h-12 bg-[#c4ff0d]/10 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-[#c4ff0d]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Security Best Practices</h2>
          <ul className="space-y-4 text-gray-400">
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-[#c4ff0d] rounded-full mt-2"></div>
              <span>Never share your password or OTP with anyone, including PhoneBid support</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-[#c4ff0d] rounded-full mt-2"></div>
              <span>Always verify phone details during the verification meeting before completing transaction</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-[#c4ff0d] rounded-full mt-2"></div>
              <span>Report suspicious activities immediately through our complaints system</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-[#c4ff0d] rounded-full mt-2"></div>
              <span>Use strong, unique passwords and enable all security features</span>
            </li>
          </ul>
        </div>
      </div>

    </div>
  );
};

export default Security;
