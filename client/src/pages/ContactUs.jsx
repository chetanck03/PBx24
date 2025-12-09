import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, MessageCircle, Clock } from 'lucide-react';
import Footer from '../components/common/Footer';

const ContactUs = () => {

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      value: 'cktechhuborg@gmail.com',
      description: 'We respond within 24 hours',
      action: () => window.open('mailto:cktechhuborg@gmail.com', '_blank')
    },
    {
      icon: Phone,
      title: 'Call Us',
      value: ['+91 9464743515', '+91 7973725213'],
      description: 'Mon-Sat, 9AM-6PM IST',
      action: () => window.open('tel:+919464743515', '_blank')
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      value: 'Ludhiana, Punjab, India',
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
            <div 
              key={index} 
              className={`bg-[#0f0f0f] border border-[#2a2a2a] rounded-2xl p-6 text-center hover:border-[#c4ff0d]/50 transition ${info.action ? 'cursor-pointer' : ''}`}
              onClick={info.action}
            >
              <div className="w-14 h-14 bg-[#c4ff0d]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <info.icon className="w-7 h-7 text-[#c4ff0d]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{info.title}</h3>
              {Array.isArray(info.value) ? (
                <div className="flex flex-wrap justify-center gap-2 mb-1">
                  {info.value.map((phone, phoneIndex) => (
                    <button
                      key={phoneIndex}
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`tel:${phone.replace(/\s/g, '')}`, '_blank');
                      }}
                      className="text-[#c4ff0d] font-medium hover:underline text-center"
                    >
                      {phone}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-[#c4ff0d] font-medium mb-1">{info.value}</p>
              )}
              <p className="text-gray-500 text-sm">{info.description}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Support Hours */}
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

          {/* Need Immediate Help */}
          <div className="bg-[#0f0f0f] border border-[#c4ff0d] rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Need Immediate Help?</h3>
            <div className="space-y-4 mb-6">
              <p className="text-gray-300 text-lg">Having urgent issues with your transactions?</p>
              <p className="text-gray-400">Our dedicated complaints system ensures faster resolution for time-sensitive matters. Get priority support when you need it most.</p>
            </div>
            <Link to="/complaints" className="inline-flex items-center gap-2 text-[#c4ff0d] hover:underline text-lg font-medium">
              Go to Complaints
              <ArrowLeft className="w-5 h-5 rotate-180" />
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ContactUs;
