'use client';

import { useState, useCallback } from 'react';
import { FiUpload, FiMusic, FiDownload, FiLoader, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import Navigator from '../_components/navigator';

const API_BASE_URL = 'https://spleeter-api-hmk1.onrender.com';

interface UploadState {
  file: File | null;
  stems: number;
  isUploading: boolean;
  progress: number;
  error: string | null;
  success: boolean;
}

export default function SpleeterApp() {
  const [state, setState] = useState<UploadState>({
    file: null,
    stems: 2,
    isUploading: false,
    progress: 0,
    error: null,
    success: false
  });

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['mp3', 'wav', 'flac', 'm4a', 'ogg'];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      if (!fileExtension || !allowedTypes.includes(fileExtension)) {
        setState(prev => ({
          ...prev,
          error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}`,
          file: null
        }));
        return;
      }

      // Validate file size (25MB max)
      if (file.size > 25 * 1024 * 1024) {
        setState(prev => ({
          ...prev,
          error: 'File too large. Maximum size is 25MB.',
          file: null
        }));
        return;
      }

      setState(prev => ({
        ...prev,
        file,
        error: null,
        success: false
      }));
    }
  }, []);

  const handleStemsChange = useCallback((stems: number) => {
    setState(prev => ({ ...prev, stems }));
  }, []);

  const downloadFile = useCallback((blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!state.file) return;

    setState(prev => ({
      ...prev,
      isUploading: true,
      progress: 0,
      error: null,
      success: false
    }));

    try {
      const formData = new FormData();
      formData.append('audio', state.file);
      formData.append('stems', state.stems.toString());

      // Create progress simulation since we can't track actual upload progress
      const progressInterval = setInterval(() => {
        setState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + Math.random() * 15, 90)
        }));
      }, 500);

      const response = await fetch(`${API_BASE_URL}/separate`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error occurred' }));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      // Get the zip file
      const blob = await response.blob();
      const filename = state.file.name.replace(/\.[^/.]+$/, '') + '_separated.zip';
      
      // Download the file
      downloadFile(blob, filename);

      setState(prev => ({
        ...prev,
        isUploading: false,
        progress: 100,
        success: true
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        isUploading: false,
        progress: 0,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }));
    }
  }, [state.file, state.stems, downloadFile]);

  const resetForm = useCallback(() => {
    setState({
      file: null,
      stems: 2,
      isUploading: false,
      progress: 0,
      error: null,
      success: false
    });
    // Reset file input
    const fileInput = document.getElementById('audio-file') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }, []);

  return (
    <>
    <Navigator/>
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-3 mb-4">
            <FiMusic className="w-12 h-12 text-purple-300" />
            <h1 className="text-4xl font-bold text-white">Spleeter Audio Separator</h1>
          </div>
          <p className="text-purple-200 text-lg max-w-2xl mx-auto">
            Separate your audio tracks into individual stems using AI-powered source separation.
            Upload your audio file and get vocals, drums, bass, and other instruments as separate tracks.
          </p>
        </div>

        {/* Main Card */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl p-8">
            
            {/* File Upload */}
            <div className="mb-8">
              <label htmlFor="audio-file" className="block text-white font-medium mb-4">
                Select Audio File
              </label>
              <div className="relative">
                <input
                  id="audio-file"
                  type="file"
                  accept=".mp3,.wav,.flac,.m4a,.ogg"
                  onChange={handleFileSelect}
                  disabled={state.isUploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <div className={`
                  border-2 border-dashed rounded-xl p-8 text-center transition-all
                  ${state.file ? 'border-green-400 bg-green-400/10' : 'border-purple-300 hover:border-purple-200'}
                  ${state.isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-white/5'}
                `}>
                  <FiUpload className={`w-12 h-12 mx-auto mb-4 ${state.file ? 'text-green-400' : 'text-purple-300'}`} />
                  {state.file ? (
                    <div>
                      <p className="text-green-400 font-medium">{state.file.name}</p>
                      <p className="text-green-300 text-sm">
                        {(state.file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-white mb-2">Click to upload or drag and drop</p>
                      <p className="text-purple-200 text-sm">
                        Supported: MP3, WAV, FLAC, M4A, OGG (max 25MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stems Selection */}
            <div className="mb-8">
              <label className="block text-white font-medium mb-4">
                Number of Stems
              </label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: 2, label: '2 Stems', desc: 'Vocals + Accompaniment' },
                  { value: 4, label: '4 Stems', desc: 'Vocals, Drums, Bass, Other' },
                  { value: 5, label: '5 Stems', desc: 'Vocals, Drums, Bass, Piano, Other' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleStemsChange(option.value)}
                    disabled={state.isUploading}
                    className={`
                      p-4 rounded-xl border-2 transition-all text-center
                      ${state.stems === option.value 
                        ? 'border-purple-400 bg-purple-400/20 text-white' 
                        : 'border-white/20 text-purple-200 hover:border-purple-300 hover:bg-white/5'
                      }
                      ${state.isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs mt-1 opacity-75">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Progress Bar */}
            {state.isUploading && (
              <div className="mb-6">
                <div className="flex justify-between text-white text-sm mb-2">
                  <span>Processing...</span>
                  <span>{Math.round(state.progress)}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-purple-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${state.progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {state.error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-3">
                <FiAlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-200">{state.error}</p>
              </div>
            )}

            {/* Success Message */}
            {state.success && (
              <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center gap-3">
                <FiCheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <p className="text-green-200">Audio separation completed! Your file should start downloading automatically.</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleSubmit}
                disabled={!state.file || state.isUploading}
                className={`
                  flex-1 py-3 px-6 rounded-xl font-medium transition-all flex items-center justify-center gap-2
                  ${!state.file || state.isUploading
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl'
                  }
                `}
              >
                {state.isUploading ? (
                  <>
                    <FiLoader className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FiDownload className="w-5 h-5" />
                    Separate Audio
                  </>
                )}
              </button>

              {(state.file || state.success || state.error) && (
                <button
                  onClick={resetForm}
                  disabled={state.isUploading}
                  className="px-6 py-3 rounded-xl border border-white/30 text-white hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="mt-8 bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
            <h3 className="text-white font-medium mb-3">How it works:</h3>
            <ul className="text-purple-200 text-sm space-y-2">
              <li>• Upload your audio file (MP3, WAV, FLAC, M4A, or OGG)</li>
              <li>• Choose the number of stems you want (2, 4, or 5)</li>
              <li>• Our AI will separate the tracks and create a zip file</li>
              <li>• Download your separated audio stems automatically</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}