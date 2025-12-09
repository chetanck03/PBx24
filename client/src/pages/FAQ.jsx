import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';


const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      category: 'Getting Started',
      questions: [
        {
          q: 'How do I create an account on PhoneBid?',
          a: 'Click "Get Started" on the homepage, fill in your details (name, email, password), upload a government ID for verification, and verify your email with the OTP sent to you. Your account will be ready once KYC is approved.'
        },
        {
          q: 'Why do I need to upload a government ID?',
          a: 'Government ID verification (KYC) helps us prevent fraud and ensure all users are genuine. Your ID is encrypted and only used for verification purposes - it\'s never shared with other users.'
        },
        {
          q: 'What is an Anonymous ID?',
          a: 'Every user gets a unique Anonymous ID (e.g., USER_ABC123) that is used for all marketplace interactions. This protects your real identity while allowing you to buy and sell phones.'
        }
      ]
    },
    {
      category: 'Buying & Bidding',
      questions: [
        {
          q: 'How do I place a bid?',
          a: 'Browse the marketplace, click on a phone you\'re interested in, and enter your bid amount (must be higher than the current bid). Click "Place Bid" to submit. You\'ll be notified if you\'re outbid.'
        },
        {
          q: 'What happens if I win an auction?',
          a: 'You\'ll receive an email notification with next steps. You need to pay a deposit (usually Rs. 2,000) within 24 hours to secure your purchase. Then, admin will coordinate a verification meeting.'
        },
        {
          q: 'Can I cancel my bid?',
          a: 'Bids cannot be cancelled once placed. Please make sure you\'re ready to purchase before bidding. If you win and don\'t complete the transaction, your account may be penalized.'
        },
        {
          q: 'How does the escrow system work?',
          a: 'When you win an auction, your payment goes into escrow (held by PhoneBid). The money is only released to the seller after you verify and accept the phone at the verification meeting.'
        }
      ]
    },
    {
      category: 'Selling',
      questions: [
        {
          q: 'How do I list a phone for sale?',
          a: 'Go to "Sell Phone" in the navigation, fill in your phone details (brand, model, storage, condition), upload clear photos, set your minimum bid price, and submit. Admin will verify your listing before it goes live.'
        },
        {
          q: 'How long does verification take?',
          a: 'Phone listings are typically verified within 24-48 hours. You\'ll receive an email notification once your listing is approved or if additional information is needed.'
        },
        {
          q: 'Can I accept a bid before the auction ends?',
          a: 'Yes! As a seller, you can accept any bid at any time. This ends the auction immediately and the buyer is notified to proceed with payment.'
        },
        {
          q: 'When do I receive payment?',
          a: 'Payment is released from escrow after the verification meeting is completed and the buyer confirms the phone is as described. Funds are transferred to your wallet within 24 hours.'
        }
      ]
    },
    {
      category: 'Safety & Security',
      questions: [
        {
          q: 'Is my personal information safe?',
          a: 'Yes! All sensitive data is encrypted using AES-256 encryption. Your real identity is never shared with other users - only your Anonymous ID is visible.'
        },
        {
          q: 'What if I receive a phone that doesn\'t match the description?',
          a: 'At the verification meeting, you can inspect the phone before completing the transaction. If it doesn\'t match the description, you can reject it and get a full refund from escrow.'
        },
        {
          q: 'How do I report a problem?',
          a: 'Use the Complaints section to report any issues. Our support team reviews all complaints within 24 hours and takes appropriate action.'
        }
      ]
    },
    {
      category: 'Payments & Wallet',
      questions: [
        {
          q: 'What payment methods are accepted?',
          a: 'We accept UPI, bank transfers, and major credit/debit cards. All payments are processed securely through our payment partners.'
        },
        {
          q: 'How do I add funds to my wallet?',
          a: 'Go to Dashboard > Wallet > Add Funds. Choose your payment method and amount. Funds are credited instantly for most payment methods.'
        },
        {
          q: 'How do I withdraw money from my wallet?',
          a: 'Go to Dashboard > Wallet > Withdraw. Enter your bank details and the amount you want to withdraw. Withdrawals are processed within 2-3 business days.'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#c4ff0d] mb-8 transition">
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>

        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-[#c4ff0d] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-400">Find answers to common questions about PhoneBid</p>
        </div>

        <div className="space-y-8">
          {faqs.map((category, catIndex) => (
            <div key={catIndex}>
              <h2 className="text-xl font-bold text-[#c4ff0d] mb-4">{category.category}</h2>
              <div className="space-y-3">
                {category.questions.map((faq, qIndex) => {
                  const index = `${catIndex}-${qIndex}`;
                  const isOpen = openIndex === index;
                  return (
                    <div key={qIndex} className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl overflow-hidden">
                      <button
                        onClick={() => setOpenIndex(isOpen ? null : index)}
                        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-[#1a1a1a] transition"
                      >
                        <span className="text-white font-medium pr-4">{faq.q}</span>
                        {isOpen ? (
                          <ChevronUp className="w-5 h-5 text-[#c4ff0d] flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-4">
                          <p className="text-gray-400 leading-relaxed">{faq.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-[#0f0f0f] border border-[#c4ff0d] rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Still have questions?</h2>
          <p className="text-gray-400 mb-6">Can't find what you're looking for? Contact our support team.</p>
          <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-[#c4ff0d] text-black rounded-xl font-semibold hover:bg-[#d4ff3d] transition">
            Contact Support
          </Link>
        </div>
      </div>

    </div>
  );
};

export default FAQ;
