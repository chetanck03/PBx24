import { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, Upload, Video, X, Loader2, Clock, AlertCircle, Image as ImageIcon, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { reelAPI } from '../../services/reelService';
import toast from 'react-hot-toast';

const UploadReel = ({ onUploadSuccess }) => {
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState(null); // 'upload' | 'record'

  const handleSuccess = (reel) => {
    setShowModal(false);
    setMode(null);
    if (onUploadSuccess) onUploadSuccess(reel);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-[#c4ff0d] hover:bg-[#d4ff3d] rounded-full shadow-lg shadow-[#c4ff0d]/30 flex items-center justify-center transition-transform hover:scale-110"
      >
        <Plus className="w-7 h-7 text-black" />
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-2xl w-full max-w-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a]">
              <h2 className="text-xl font-semibold text-white">
                {mode === 'upload' ? 'Upload Video' : mode === 'record' ? 'Record Video' : 'Create Reel'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setMode(null);
                }}
                className="p-2 hover:bg-[#1a1a1a] rounded-full transition"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {!mode ? (
                <OptionSelector onSelect={setMode} />
              ) : mode === 'upload' ? (
                <UploadFromDevice onSuccess={handleSuccess} onBack={() => setMode(null)} />
              ) : mode === 'images' ? (
                <UploadImages onSuccess={handleSuccess} onBack={() => setMode(null)} />
              ) : (
                <RecordVideo onSuccess={handleSuccess} onBack={() => setMode(null)} />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const OptionSelector = ({ onSelect }) => {
  return (
    <div className="grid grid-cols-3 gap-3">
      <button
        onClick={() => onSelect('upload')}
        className="flex flex-col items-center gap-3 p-4 bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#2a2a2a] rounded-xl transition"
      >
        <div className="w-14 h-14 bg-[#c4ff0d]/20 rounded-full flex items-center justify-center">
          <Upload className="w-7 h-7 text-[#c4ff0d]" />
        </div>
        <span className="text-white font-medium text-sm">Upload Video</span>
        <span className="text-gray-500 text-xs text-center">Max 30s</span>
      </button>

      <button
        onClick={() => onSelect('record')}
        className="flex flex-col items-center gap-3 p-4 bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#2a2a2a] rounded-xl transition"
      >
        <div className="w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center">
          <Video className="w-7 h-7 text-red-500" />
        </div>
        <span className="text-white font-medium text-sm">Record Video</span>
        <span className="text-gray-500 text-xs text-center">Max 30s</span>
      </button>

      <button
        onClick={() => onSelect('images')}
        className="flex flex-col items-center gap-3 p-4 bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#2a2a2a] rounded-xl transition"
      >
        <div className="w-14 h-14 bg-blue-500/20 rounded-full flex items-center justify-center">
          <ImageIcon className="w-7 h-7 text-blue-500" />
        </div>
        <span className="text-white font-medium text-sm">Upload Photos</span>
        <span className="text-gray-500 text-xs text-center">Up to 10</span>
      </button>
    </div>
  );
};

const UploadFromDevice = ({ onSuccess, onBack }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [duration, setDuration] = useState(0);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setError(null);

    // Validate file type
    if (!selectedFile.type.startsWith('video/')) {
      setError('Please select a video file');
      return;
    }

    // Validate file size (50MB max)
    if (selectedFile.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB');
      return;
    }

    // Get video duration
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      if (video.duration > 30) {
        setError('Video duration must be 30 seconds or less');
        return;
      }
      setDuration(video.duration);
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    };
    video.src = URL.createObjectURL(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      setProgress(0);

      const formData = new FormData();
      formData.append('video', file);
      formData.append('duration', duration.toString());
      formData.append('description', description);

      const response = await reelAPI.uploadReel(formData, (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setProgress(percent);
      });

      toast.success('Reel uploaded successfully!');
      onSuccess(response.data.data);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error?.message || 'Failed to upload reel');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[#2a2a2a] hover:border-[#c4ff0d] rounded-xl p-8 text-center cursor-pointer transition"
        >
          <Upload className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-white font-medium mb-1">Click to select video</p>
          <p className="text-gray-500 text-sm">MP4, WebM, MOV (max 30s, 50MB)</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative aspect-[9/16] max-h-64 bg-black rounded-xl overflow-hidden mx-auto">
            <video
              src={preview}
              className="w-full h-full object-contain"
              controls
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Duration: {duration.toFixed(1)}s</span>
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description (optional)"
            maxLength={500}
            className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:border-[#c4ff0d]"
            rows={3}
          />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {uploading && (
        <div className="space-y-2">
          <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#c4ff0d] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-sm text-gray-400">Uploading... {progress}%</p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={uploading}
          className="flex-1 px-4 py-3 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white rounded-xl transition disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="flex-1 px-4 py-3 bg-[#c4ff0d] hover:bg-[#d4ff3d] text-black font-semibold rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Upload
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const UploadImages = ({ onSuccess, onBack }) => {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [currentPreview, setCurrentPreview] = useState(0);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (!selectedFiles.length) return;

    setError(null);

    // Validate file count
    if (selectedFiles.length + files.length > 10) {
      setError('Maximum 10 images allowed');
      return;
    }

    // Validate each file
    const validFiles = [];
    const newPreviews = [];

    for (const file of selectedFiles) {
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('Each image must be less than 10MB');
        return;
      }
      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    setFiles(prev => [...prev, ...validFiles]);
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(previews[index]);
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
    if (currentPreview >= index && currentPreview > 0) {
      setCurrentPreview(prev => prev - 1);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    try {
      setUploading(true);
      setProgress(0);

      const formData = new FormData();
      files.forEach(file => formData.append('images', file));
      formData.append('description', description);

      const response = await reelAPI.uploadImageReel(formData, (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setProgress(percent);
      });

      toast.success('Photos uploaded successfully!');
      onSuccess(response.data.data);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error?.message || 'Failed to upload photos');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {files.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[#2a2a2a] hover:border-blue-500 rounded-xl p-8 text-center cursor-pointer transition"
        >
          <ImageIcon className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-white font-medium mb-1">Click to select photos</p>
          <p className="text-gray-500 text-sm">JPEG, PNG, GIF, WebP (max 10 images, 10MB each)</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Main preview with navigation */}
          <div className="relative aspect-[9/16] max-h-64 bg-black rounded-xl overflow-hidden mx-auto">
            <img
              src={previews[currentPreview]}
              alt={`Preview ${currentPreview + 1}`}
              className="w-full h-full object-contain"
            />
            
            {/* Navigation arrows */}
            {previews.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentPreview(prev => Math.max(0, prev - 1))}
                  disabled={currentPreview === 0}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={() => setCurrentPreview(prev => Math.min(previews.length - 1, prev + 1))}
                  disabled={currentPreview === previews.length - 1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              </>
            )}

            {/* Image counter */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/70 rounded-full text-white text-xs">
              {currentPreview + 1} / {previews.length}
            </div>

            {/* Remove button */}
            <button
              onClick={() => removeImage(currentPreview)}
              className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-500 rounded-full"
            >
              <Trash2 className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Thumbnail strip */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#c4ff0d]">
            {previews.map((preview, index) => (
              <button
                key={index}
                onClick={() => setCurrentPreview(index)}
                className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition ${
                  currentPreview === index ? 'border-[#c4ff0d]' : 'border-transparent'
                }`}
              >
                <img src={preview} alt={`Thumb ${index + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
            {files.length < 10 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-shrink-0 w-14 h-14 rounded-lg border-2 border-dashed border-[#2a2a2a] hover:border-blue-500 flex items-center justify-center transition"
              >
                <Plus className="w-5 h-5 text-gray-500" />
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex items-center gap-2 text-sm text-gray-400">
            <ImageIcon className="w-4 h-4" />
            <span>{files.length} photo{files.length !== 1 ? 's' : ''} selected</span>
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description (optional)"
            maxLength={500}
            className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:border-[#c4ff0d]"
            rows={3}
          />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {uploading && (
        <div className="space-y-2">
          <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-sm text-gray-400">Uploading... {progress}%</p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={uploading}
          className="flex-1 px-4 py-3 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white rounded-xl transition disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={handleUpload}
          disabled={files.length === 0 || uploading}
          className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Upload
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const RecordVideo = ({ onSuccess, onBack }) => {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordedUrl, setRecordedUrl] = useState(null);
  const [timer, setTimer] = useState(0);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 720, height: 1280 },
        audio: true
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraReady(true);
      setError(null);
    } catch (err) {
      console.error('Camera error:', err);
      setError('Could not access camera. Please allow camera permissions.');
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = () => {
    if (!stream) return;

    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9'
    });

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setRecordedBlob(blob);
      setRecordedUrl(URL.createObjectURL(blob));
    };

    mediaRecorder.start(100);
    mediaRecorderRef.current = mediaRecorder;
    setRecording(true);
    setTimer(0);

    // Start timer
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev >= 30) {
          stopRecording();
          return 30;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      // Stop camera
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
  };

  const retake = () => {
    setRecordedBlob(null);
    setRecordedUrl(null);
    setTimer(0);
    startCamera();
  };

  const handleUpload = async () => {
    if (!recordedBlob) return;

    try {
      setUploading(true);
      setProgress(0);

      const formData = new FormData();
      formData.append('video', recordedBlob, 'recorded-reel.webm');
      formData.append('duration', timer.toString());
      formData.append('description', description);

      const response = await reelAPI.uploadReel(formData, (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setProgress(percent);
      });

      toast.success('Reel uploaded successfully!');
      onSuccess(response.data.data);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error?.message || 'Failed to upload reel');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm p-3 bg-red-500/10 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="relative aspect-[9/16] max-h-80 bg-black rounded-xl overflow-hidden mx-auto">
        {!recordedUrl ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover mirror"
              style={{ transform: 'scaleX(-1)' }}
            />
            
            {/* Timer overlay */}
            {recording && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-red-500 rounded-full flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-white font-mono font-bold">
                  {timer}s / 30s
                </span>
              </div>
            )}

            {/* Progress bar */}
            {recording && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
                <div
                  className="h-full bg-red-500 transition-all duration-1000"
                  style={{ width: `${(timer / 30) * 100}%` }}
                />
              </div>
            )}
          </>
        ) : (
          <video
            src={recordedUrl}
            className="w-full h-full object-contain"
            controls
            autoPlay
            loop
          />
        )}
      </div>

      {!recordedUrl ? (
        <div className="flex justify-center">
          {!recording ? (
            <button
              onClick={startRecording}
              disabled={!cameraReady}
              className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition disabled:opacity-50"
            >
              <div className="w-6 h-6 bg-white rounded-full" />
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition"
            >
              <div className="w-6 h-6 bg-white rounded" />
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Duration: {timer}s</span>
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description (optional)"
            maxLength={500}
            className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:border-[#c4ff0d]"
            rows={3}
          />

          {uploading && (
            <div className="space-y-2">
              <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#c4ff0d] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-center text-sm text-gray-400">Uploading... {progress}%</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={retake}
              disabled={uploading}
              className="flex-1 px-4 py-3 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white rounded-xl transition disabled:opacity-50"
            >
              Retake
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex-1 px-4 py-3 bg-[#c4ff0d] hover:bg-[#d4ff3d] text-black font-semibold rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Upload
                </>
              )}
            </button>
          </div>
        </>
      )}

      {!recordedUrl && (
        <button
          onClick={onBack}
          className="w-full px-4 py-3 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white rounded-xl transition"
        >
          Back
        </button>
      )}
    </div>
  );
};

export default UploadReel;
