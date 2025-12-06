import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Send, MessageCircle, Clock } from 'lucide-react';
import Footer from '../components/common/Footer';
import toast from 'react-hot-toast';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    }, 1000);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      value: 'support@phonebid.com',
      description: 'We respond within 24 hours'
    },
    {
      icon: Phone,
      title: 'Call Us',
      value: '+91 1800-XXX-XXXX',
      description: 'Mon-Sat, 9AM-6PM IST'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      value: 'Bangalore, India',
      description: 'By appointment only'
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
            <MessageCircle className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Contact Us</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {contactInfo.map((info, index) => (
            <div key={index} className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-2xl p-6 text-center hover:border-[#c4ff0d]/50 transition">
              <div className="w-14 h-14 bg-[#c4ff0d]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <info.icon className="w-7 h-7 text-[#c4ff0d]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{info.title}</h3>
              <p className="text-[#c4ff0d] font-medium mb-1">{info.value}</p>
              <p className="text-gray-500 text-sm">{info.description}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Your Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#c4ff0d]"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#c4ff0d]"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#c4ff0d]"
                  placeholder="How can we help?"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#c4ff0d] resize-none"
                  placeholder="Tell us more about your inquiry..."
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#c4ff0d] text-black rounded-xl font-semibold hover:bg-[#d4ff3d] transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Sending...' : <><Send className="w-5 h-5" /> Send Message</>}
              </button>
            </form>
          </div>

          {/* Support Hours */}
          <div className="space-y-6">
            <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-6 h-6 text-[#c4ff0d]" />
                <h2 className="text-2xl font-bold text-white">Support Hours</h2>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Monday - Friday</span>
                  <span className="text-white">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Saturday</span>
                  <span className="text-white">10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Sunday</span>
                  <span className="text-red-400">Closed</span>
                </div>
              </div>
              <p className="text-gray-500 text-sm mt-4">All times are in IST (Indian Standard Time)</p>
            </div>

            <div className="bg-[#0f0f0f] border border-[#c4ff0d] rounded-2xl p-8">
              <h3 className="text-xl font-bold text-white mb-4">Need Immediate Help?</h3>
              <p className="text-gray-400 mb-4">For urgent issues related to ongoing transactions, please use our complaints system for faster resolution.</p>
              <Link to="/complaints" className="inline-flex items-center gap-2 text-[#c4ff0d] hover:underline">
                Go to Complaints
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ContactUs;
