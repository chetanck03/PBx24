import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, User, Calendar, Clock, X, Send, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/common/Footer';
import toast from 'react-hot-toast';

const Blog = () => {
  const { isAuthenticated, user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newBlog, setNewBlog] = useState({ title: '', content: '', category: 'General' });

  // Load blogs from localStorage on mount
  useEffect(() => {
    const savedBlogs = localStorage.getItem('phonebid_blogs');
    if (savedBlogs) {
      setBlogs(JSON.parse(savedBlogs));
    } else {
      // Default blogs
      const defaultBlogs = [
        {
          id: 1,
          title: 'How to Get the Best Price for Your Used Phone',
          content: 'Selling your used phone can be tricky. Here are some tips to maximize your selling price on PhoneBid:\n\n1. Take high-quality photos from multiple angles\n2. Be honest about the condition\n3. Include all accessories\n4. Set a competitive starting bid\n5. Write a detailed description\n\nRemember, buyers appreciate transparency. The more information you provide, the more confident they\'ll be in bidding higher.',
          author: 'PhoneBid Team',
          category: 'Selling Tips',
          createdAt: new Date('2024-12-01').toISOString(),
          readTime: '3 min read'
        },
        {
          id: 2,
          title: 'Understanding Anonymous Bidding: A Complete Guide',
          content: 'PhoneBid\'s anonymous bidding system protects both buyers and sellers. Here\'s how it works:\n\nWhen you create an account, you\'re assigned a unique Anonymous ID. This ID is used for all your marketplace activities. Sellers see bids from anonymous bidders, and buyers see phones from anonymous sellers.\n\nThis system prevents:\n- Price discrimination\n- Personal targeting\n- Privacy breaches\n\nYour real identity is only revealed to admin for verification purposes.',
          author: 'PhoneBid Team',
          category: 'Platform Guide',
          createdAt: new Date('2024-11-28').toISOString(),
          readTime: '4 min read'
        },
        {
          id: 3,
          title: 'Top 5 Phones to Buy in 2024',
          content: 'Looking for the best deals on PhoneBid? Here are the most popular phones this year:\n\n1. iPhone 15 Pro - Excellent camera and performance\n2. Samsung Galaxy S24 - Great display and AI features\n3. OnePlus 12 - Best value flagship\n4. Google Pixel 8 - Pure Android experience\n5. iPhone 14 - Still a solid choice at lower prices\n\nCheck our marketplace for the best deals on these models!',
          author: 'Tech Reviewer',
          category: 'Buying Guide',
          createdAt: new Date('2024-11-25').toISOString(),
          readTime: '2 min read'
        }
      ];
      setBlogs(defaultBlogs);
      localStorage.setItem('phonebid_blogs', JSON.stringify(defaultBlogs));
    }
  }, []);

  const handleCreateBlog = () => {
    if (!newBlog.title.trim() || !newBlog.content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    
    setTimeout(() => {
      const blog = {
        id: Date.now(),
        title: newBlog.title,
        content: newBlog.content,
        author: user?.name || 'Anonymous User',
        category: newBlog.category,
        createdAt: new Date().toISOString(),
        readTime: `${Math.ceil(newBlog.content.split(' ').length / 200)} min read`
      };

      const updatedBlogs = [blog, ...blogs];
      setBlogs(updatedBlogs);
      localStorage.setItem('phonebid_blogs', JSON.stringify(updatedBlogs));
      
      setNewBlog({ title: '', content: '', category: 'General' });
      setShowCreateModal(false);
      setLoading(false);
      toast.success('Blog post published successfully!');
    }, 1000);
  };

  const categories = ['General', 'Selling Tips', 'Buying Guide', 'Platform Guide', 'Tech News', 'Success Stories'];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#c4ff0d] mb-8 transition">
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">PhoneBid Blog</h1>
            <p className="text-gray-400">Tips, guides, and stories from our community</p>
          </div>
          <button
            onClick={() => {
              if (!isAuthenticated) {
                toast.error('Please login to create a blog post');
                return;
              }
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-[#c4ff0d] text-black rounded-xl font-semibold hover:bg-[#d4ff3d] transition"
          >
            <Plus className="w-5 h-5" />
            Write a Post
          </button>
        </div>

        {/* Blog Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <Link 
              key={blog.id} 
              to={`/blog/${blog.id}`}
              className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-2xl overflow-hidden hover:border-[#c4ff0d]/50 transition group block"
            >
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-[#c4ff0d]/10 text-[#c4ff0d] text-xs font-medium rounded-full">
                    {blog.category}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white mb-3 group-hover:text-[#c4ff0d] transition line-clamp-2">
                  {blog.title}
                </h2>
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                  {blog.content.substring(0, 150)}...
                </p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-500">
                    <User className="w-4 h-4" />
                    <span>{blog.author}</span>
                  </div>
                  <div className="flex items-center gap-4 text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(blog.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{blog.readTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {blogs.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-4">No blog posts yet</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-[#c4ff0d] hover:underline"
            >
              Be the first to write one!
            </button>
          </div>
        )}
      </div>

      {/* Create Blog Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#2a2a2a] flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Create Blog Post</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-[#1a1a1a] rounded-full">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Title</label>
                <input
                  type="text"
                  value={newBlog.title}
                  onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
                  placeholder="Enter your blog title..."
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#c4ff0d]"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Category</label>
                <select
                  value={newBlog.category}
                  onChange={(e) => setNewBlog({ ...newBlog, category: e.target.value })}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white focus:outline-none focus:border-[#c4ff0d]"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className="bg-[#1a1a1a]">{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Content</label>
                <textarea
                  value={newBlog.content}
                  onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
                  placeholder="Write your blog content here..."
                  rows={10}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#c4ff0d] resize-none"
                />
              </div>

              <div className="bg-[#1a1a1a] rounded-xl p-4">
                <p className="text-sm text-gray-400">
                  <strong className="text-white">Author:</strong> {user?.name || 'Anonymous User'}
                </p>
              </div>

              <button
                onClick={handleCreateBlog}
                disabled={loading}
                className="w-full py-3 bg-[#c4ff0d] text-black rounded-xl font-semibold hover:bg-[#d4ff3d] transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Publish Post
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Blog;
