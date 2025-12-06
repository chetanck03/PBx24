import { Link } from 'react-router-dom';
import { ArrowLeft, UserPlus, Search, Gavel, Shield, CheckCircle, Truck } from 'lucide-react';
import Footer from '../components/common/Footer';

const HowItWorks = () => {
  const steps = [
    {
      icon: UserPlus,
      title: 'Create Account',
      description: 'Sign up with your email and verify your identity. Your real identity stays private - you get an anonymous ID for all transactions.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Search,
      title: 'Browse or List',
      description: 'Browse available phones in the marketplace or list your own device for auction. Set your minimum bid price and auction duration.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Gavel,
      title: 'Place Bids',
      description: 'Place anonymous bids on phones you want. Your identity is protected - sellers only see your anonymous bidder ID.',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Shield,
      title: 'Secure Escrow',
      description: 'When you win, funds are held in secure escrow. This protects both buyers and sellers during the transaction.',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: CheckCircle,
      title: 'Verification Meeting',
      description: 'Meet at a safe location to verify the phone. Admin coordinates the meeting and ensures everything is as described.',
      color: 'from-pink-500 to-pink-600'
    },
    {
      icon: Truck,
      title: 'Complete Transaction',
      description: 'Once verified, funds are released to the seller and you get your phone. Both parties can leave anonymous reviews.',
      color: 'from-cyan-500 to-cyan-600'
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
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">How PhoneBid Works</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Buy and sell phones anonymously in 6 simple steps. Your privacy is our priority.
          </p>
        </div>

        <div className="grid gap-8">
          {steps.map((step, index) => (
            <div key={index} className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-2xl p-6 md:p-8 hover:border-[#c4ff0d]/50 transition">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0`}>
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[#c4ff0d] text-sm font-bold">STEP {index + 1}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-gray-400 text-lg leading-relaxed">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-[#0f0f0f] border border-[#c4ff0d] rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Join thousands of users who trust PhoneBid for anonymous phone trading.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth/signup" className="px-8 py-3 bg-[#c4ff0d] text-black rounded-xl font-semibold hover:bg-[#d4ff3d] transition">
                Create Account
              </Link>
              <Link to="/marketplace" className="px-8 py-3 bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-xl font-semibold hover:border-[#c4ff0d] transition">
                Browse Marketplace
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HowItWorks;
