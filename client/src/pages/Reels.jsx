import { useAuth } from '../context/AuthContext';
import ReelsFeed from '../components/reels/ReelsFeed';
import UploadReel from '../components/reels/UploadReel';

const Reels = () => {
  const { isAuthenticated } = useAuth();

  const handleUploadSuccess = () => {
    // Refresh the page to show new reel
    window.location.reload();
  };

  return (
    <div className="relative">
      <ReelsFeed />
      {isAuthenticated && <UploadReel onUploadSuccess={handleUploadSuccess} />}
    </div>
  );
};

export default Reels;
