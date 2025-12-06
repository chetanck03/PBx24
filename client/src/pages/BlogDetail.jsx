import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Calendar, Clock, Share2, BookOpen } from 'lucide-react';
import Footer from '../components/common/Footer';
import toast from 'react-hot-toast';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlog();
  }, [id]);

  const loadBlog = () => {
    setLoading(true);
    const savedBlogs = localStorage.getItem('phonebid_blogs');
    
    if (savedBlogs) {
      const blogs = JSON.parse(savedBlogs);
      const foundBlog = blogs.find(b => b.id.toString() === id);
      
      if (foundBlog) {
        setBlog(foundBlog);
        // Get related blogs from same category
        const related = blogs
          .filter(b => b.category === foundBlog.category && b.id !== foundBlog.id)
          .slice(0, 3);
        setRelatedBlogs(related);
      }
    }
    setLoading(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c4ff0d]"></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">Blog Post Not Found</h1>
            <p className="text-gray-400 mb-8">The blog post you're looking for doesn't exist or has been removed.</p>
            <Link to="/blog" className="px-6 py-3 bg-[#c4ff0d] text-black rounded-xl font-semibold hover:bg-[#d4ff3d] transition">
              Back to Blog
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link to="/blog" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#c4ff0d] mb-8 transition">
          <ArrowLeft className="w-5 h-5" />
          Back to Blog
        </Link>

        {/* Article Header */}
        <article className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-2xl overflow-hidden">
          <div className="p-6 sm:p-8 md:p-10">
            {/* Category Badge */}
            <div className="mb-6">
              <span className="px-4 py-2 bg-[#c4ff0d]/10 text-[#c4ff0d] text-sm font-medium rounded-full">
                {blog.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              {blog.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-gray-400 mb-8 pb-8 border-b border-[#2a2a2a]">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-[#c4ff0d] rounded-full flex items-center justify-center">
                  <span className="text-black font-bold">{blog.author?.charAt(0) || 'U'}</span>
                </div>
                <span className="font-medium text-white">{blog.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(blog.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{blog.readTime}</span>
              </div>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 ml-auto text-gray-400 hover:text-[#c4ff0d] transition"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>

            {/* Content */}
            <div className="prose prose-invert max-w-none">
              {blog.content.split('\n').map((paragraph, index) => (
                <p key={index} className="text-gray-300 text-lg leading-relaxed mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </article>

        {/* Author Box */}
        <div className="mt-8 bg-[#0f0f0f] border border-[#2a2a2a] rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#c4ff0d] rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-2xl">{blog.author?.charAt(0) || 'U'}</span>
            </div>
            <div>
              <p className="text-sm text-gray-400">Written by</p>
              <p className="text-xl font-bold text-white">{blog.author}</p>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {relatedBlogs.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">Related Posts</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedBlogs.map((relatedBlog) => (
                <Link
                  key={relatedBlog.id}
                  to={`/blog/${relatedBlog.id}`}
                  className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-5 hover:border-[#c4ff0d]/50 transition group"
                >
                  <span className="text-xs text-[#c4ff0d] font-medium">{relatedBlog.category}</span>
                  <h3 className="text-lg font-bold text-white mt-2 mb-2 group-hover:text-[#c4ff0d] transition line-clamp-2">
                    {relatedBlog.title}
                  </h3>
                  <p className="text-gray-500 text-sm">{relatedBlog.readTime}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 bg-[#0f0f0f] border border-[#c4ff0d] rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Want to share your story?</h2>
          <p className="text-gray-400 mb-6">Write a blog post and share your experience with the PhoneBid community.</p>
          <Link to="/blog" className="inline-flex items-center gap-2 px-6 py-3 bg-[#c4ff0d] text-black rounded-xl font-semibold hover:bg-[#d4ff3d] transition">
            Write a Post
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BlogDetail;
