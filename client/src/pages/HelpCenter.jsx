import { Link } from 'react-router-dom';
import { ArrowLeft, HelpCircle, MessageCircle, Mail, Phone, FileText, Shield, CreditCard, Users } from 'lucide-react';


const HelpCenter = () => {
  const categories = [
    {
      icon: Users,
      title: 'Account & Profile',
      topics: ['Creating an account', 'Verifying your identity', 'Updating profile information', 'Password reset']
    },
    {
      icon: CreditCard,
      title: 'Buying & Bidding',
      topics: ['How to place a bid', 'Winning an auction', 'Payment methods', 'Escrow process']
    },
    {
      icon: Phone,
      title: 'Selling',
      topics: ['Listing a phone', 'Setting auction price', 'Accepting bids', 'Receiving payment']
    },
    {
      icon: Shield,
      title: 'Safety & Security',
      topics: ['Verification meetings', 'Fraud protection', 'Reporting issues', 'Account security']
    }
  ];

  const faqs = [
    {
      question: 'How do I create an account?',
      answer: 'Click "Get Started" and fill in your details. You\'ll need to verify your email with an OTP and upload a government ID for KYC verification.'
    },
    {
      question: 'Is my identity really anonymous?',
      answer: 'Yes! Your real name and contact details are never shown to other users. You\'re identified only by your anonymous ID (e.g., USER_ABC123).'
    },
    {
      question: 'How does the bidding process work?',
      answer: 'Browse phones, place bids higher than the current bid. If you\'re the highest bidder when the auction ends, you win! The seller can also accept your bid early.'
    },
    {
      question: 'What happens after I win an auction?',
      answer: 'You\'ll receive an email with next steps. Pay a deposit to secure your purchase, then coordinate with admin for a verification meeting.'
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
            <HelpCircle className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Help Center</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Find answers to common questions and get the support you need.
          </p>
        </div>

        {/* Categories */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {categories.map((category, index) => (
            <div key={index} className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-2xl p-6 hover:border-[#c4ff0d]/50 transition">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-[#c4ff0d]/10 rounded-xl flex items-center justify-center">
                  <category.icon className="w-6 h-6 text-[#c4ff0d]" />
                </div>
                <h3 className="text-xl font-bold text-white">{category.title}</h3>
              </div>
              <ul className="space-y-2">
                {category.topics.map((topic, i) => (
                  <li key={i} className="text-gray-400 hover:text-[#c4ff0d] cursor-pointer transition">
                    {topic}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* FAQs */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-3">{faq.question}</h3>
                <p className="text-gray-400">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-[#0f0f0f] border border-[#c4ff0d] rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Still Need Help?</h2>
          <p className="text-gray-400 mb-6">Our support team is here to assist you.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="px-6 py-3 bg-[#c4ff0d] text-black rounded-xl font-semibold hover:bg-[#d4ff3d] transition flex items-center justify-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Contact Support
            </Link>
            <Link to="/complaints" className="px-6 py-3 bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-xl font-semibold hover:border-[#c4ff0d] transition flex items-center justify-center gap-2">
              <FileText className="w-5 h-5" />
              Submit Complaint
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
};

export default HelpCenter;
