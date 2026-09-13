import React, { useState } from 'react';
import { PersonaResult } from '../types';
import {
  CheckCircle,
  Share2,
  Facebook,
  Twitter,
  Instagram,
  Copy,
  Check,
  ArrowLeft,
  RotateCcw,
  ExternalLink,
  User,
  Users,
  Download
} from 'lucide-react';
import { triggerFeedback } from '../utils/feedback';

const curbsideSocialImg = '/Curbside_Compass_fb.png';

interface ThankYouViewProps {
  persona: PersonaResult;
  onViewResults: () => void;
  onRetake?: () => void;
}

export const ThankYouView: React.FC<ThankYouViewProps> = ({
  persona,
  onViewResults,
  onRetake
}) => {
  const [shareMode, setShareMode] = useState<'with_persona' | 'general'>('with_persona');
  const [copied, setCopied] = useState<boolean>(false);
  const [instagramNotice, setInstagramNotice] = useState<boolean>(false);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://curbside-compass.edmonton.ca';

  const shareText = shareMode === 'with_persona'
    ? `I took Edmonton's Curbside Compass public engagement tool and got "${persona.title}"! Where do you stand on neighbourhood parking? Find your persona:`
    : `Where do you stand on Edmonton's neighbourhood parking and curbside policies? Have your say and try the Curbside Compass public engagement tool:`;

  const shareTextWithUrl = `${shareText} ${shareUrl}`;

  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}&hashtags=YEGcurbside,Edmonton,YEGtraffic`;
  const instagramUrl = 'https://www.instagram.com/';

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareTextWithUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleInstagramClick = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareTextWithUrl);
      }
    } catch {
      // ignore
    }
    setInstagramNotice(true);
    setTimeout(() => setInstagramNotice(false), 5000);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between p-3 sm:p-5 bg-white text-gray-800 overflow-y-auto">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
            <CheckCircle className="w-4 h-4 text-[#009A44]" />
          </div>
          <span className="text-xs font-bold text-gray-700">Feedback Completed</span>
        </div>

        {onRetake && (
          <button
            type="button"
            onClick={() => {
              triggerFeedback('button');
              onRetake();
            }}
            className="text-[11px] font-bold flex items-center gap-1 text-gray-600 hover:text-[#004B8D] bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded transition-all cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Start Over</span>
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="my-auto py-2 sm:py-3 flex flex-col items-center max-w-xl mx-auto w-full">
        {/* Combined Thank You & Share Container */}
        <div className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl p-3.5 sm:p-4 shadow-sm text-left">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1.5">
            <Share2 className="w-4.5 h-4.5 text-[#0081BC]" />
            <h1 className="text-sm sm:text-base font-black text-[#004B8D] tracking-tight">
              Thank You for Your Feedback! Share the Curbside Compass
            </h1>
          </div>

          <p className="text-xs text-gray-600 leading-snug mb-3">
            Your perspectives on neighbourhood parking provide valuable insight for the City of Edmonton. Encourage your neighbours, friends, and community members to discover their parking persona and have their say on curbside policies:
          </p>

          {/* Option Selection: Share Persona Result vs General Encouraging Invite */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-2 sm:p-2.5 mb-2.5">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
              Choose What to Share
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-2">
              {/* Option A: With Persona Result */}
              <button
                type="button"
                id="share-option-persona"
                onClick={() => {
                  triggerFeedback('choice');
                  setShareMode('with_persona');
                }}
                className={`text-left p-1.5 sm:p-2 rounded-lg border transition-all cursor-pointer flex flex-col justify-between active:scale-[0.98] ${
                  shareMode === 'with_persona'
                    ? 'bg-blue-50/90 border-[#004B8D] text-gray-900 ring-1 ring-[#004B8D] shadow-2xs'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <User className={`w-3.5 h-3.5 ${shareMode === 'with_persona' ? 'text-[#004B8D]' : 'text-gray-500'}`} />
                  <span className="text-[11px] font-bold">Include My Persona</span>
                </div>
                <div className="text-[9.5px] text-gray-600 leading-tight line-clamp-1">
                  Includes: <strong className="text-[#004B8D]">{persona.title}</strong>
                </div>
              </button>

              {/* Option B: General Invite without Persona */}
              <button
                type="button"
                id="share-option-general"
                onClick={() => {
                  triggerFeedback('choice');
                  setShareMode('general');
                }}
                className={`text-left p-1.5 sm:p-2 rounded-lg border transition-all cursor-pointer flex flex-col justify-between active:scale-[0.98] ${
                  shareMode === 'general'
                    ? 'bg-blue-50/90 border-[#004B8D] text-gray-900 ring-1 ring-[#004B8D] shadow-2xs'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Users className={`w-3.5 h-3.5 ${shareMode === 'general' ? 'text-[#004B8D]' : 'text-gray-500'}`} />
                  <span className="text-[11px] font-bold">General Invite Only</span>
                </div>
                <div className="text-[9.5px] text-gray-600 leading-tight">
                  Encouraging post without persona results
                </div>
              </button>
            </div>

            {/* Social Post Preview Card with Image */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
              <div className="p-2 border-b border-gray-100 flex items-start gap-2.5">
                {/* Thumbnail of Curbside Compass Image */}
                <div className="relative flex-shrink-0 w-20 sm:w-24 h-20 sm:h-24 rounded-md overflow-hidden bg-slate-100 border border-gray-200 shadow-2xs group">
                  <img
                    src={curbsideSocialImg}
                    alt="Curbside Compass Social Share Card"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <a
                      href={curbsideSocialImg}
                      download="Curbside_Compass_fb.png"
                      onClick={() => triggerFeedback('button')}
                      className="p-1 bg-white/90 rounded text-gray-800 text-[9px] font-bold flex items-center gap-0.5 no-underline active:scale-95"
                      title="Download image"
                    >
                      <Download className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>

                {/* Post Text & Meta */}
                <div className="flex-1 min-w-0 flex flex-col justify-between h-20 sm:h-24 py-0.5">
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[9.5px] font-bold text-[#004B8D] uppercase tracking-wide">
                        Social Post Preview
                      </span>
                      <a
                        href={curbsideSocialImg}
                        download="Curbside_Compass_fb.png"
                        onClick={() => triggerFeedback('button')}
                        className="text-[9px] text-gray-500 hover:text-[#004B8D] flex items-center gap-1 font-semibold active:scale-95"
                        title="Download image to save or attach"
                      >
                        <Download className="w-2.5 h-2.5" />
                        <span>Save image</span>
                      </a>
                    </div>
                    <p className="text-[10px] sm:text-[10.5px] text-gray-700 leading-snug line-clamp-3 italic">
                      "{shareText}"
                    </p>
                  </div>

                  <div className="text-[9px] text-[#0081BC] font-medium truncate">
                    🔗 {shareUrl}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Social Platform Buttons */}
          <div className="grid grid-cols-3 gap-2 mb-2">
            {/* Facebook */}
            <a
              href={facebookShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => triggerFeedback('button')}
              id="share-facebook-button"
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-[#1877F2] hover:bg-[#1565cf] text-white text-[11px] font-bold shadow-xs transition-transform active:scale-95 cursor-pointer no-underline"
              title="Share on Facebook"
            >
              <Facebook className="w-3.5 h-3.5 fill-current" />
              <span>Facebook</span>
            </a>

            {/* X (formerly Twitter) */}
            <a
              href={twitterShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => triggerFeedback('button')}
              id="share-x-button"
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-black hover:bg-neutral-800 text-white text-[11px] font-bold shadow-xs transition-transform active:scale-95 cursor-pointer no-underline"
              title="Share on X"
            >
              <Twitter className="w-3.5 h-3.5 fill-current" />
              <span>X (Twitter)</span>
            </a>

            {/* Instagram */}
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                triggerFeedback('button');
                handleInstagramClick();
              }}
              id="share-instagram-button"
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045] hover:opacity-95 text-white text-[11px] font-bold shadow-xs transition-transform active:scale-95 cursor-pointer no-underline"
              title="Share on Instagram"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>Instagram</span>
            </a>
          </div>

          {/* Instagram Toast Notice */}
          {instagramNotice && (
            <div className="mb-2 p-1.5 bg-purple-50 border border-purple-200 rounded-lg text-[10px] text-purple-900 leading-snug flex items-start gap-1.5">
              <Check className="w-3.5 h-3.5 text-purple-700 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Share caption copied!</strong> Opening Instagram so you can post your Curbside Compass graphic and caption.
              </span>
            </div>
          )}

          {/* Direct Copy Link Button */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
            <span className="text-[10px] text-gray-500 font-medium truncate max-w-[200px] sm:max-w-[280px]">
              {shareUrl}
            </span>
            <button
              type="button"
              id="copy-share-link-button"
              onClick={() => {
                triggerFeedback('button');
                handleCopyLink();
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer flex-shrink-0 active:scale-95 ${
                copied
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-gray-600" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="pt-2 border-t border-gray-100 flex items-center justify-between flex-shrink-0">
        <button
          type="button"
          onClick={() => {
            triggerFeedback('button');
            onViewResults();
          }}
          className="text-xs font-bold text-[#004B8D] hover:text-[#003366] flex items-center gap-1.5 py-1 px-2 rounded-md hover:bg-blue-50 transition-colors cursor-pointer active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>View Parking Persona</span>
        </button>

        {onRetake && (
          <button
            type="button"
            onClick={() => {
              triggerFeedback('button');
              onRetake();
            }}
            className="text-xs font-bold text-gray-600 hover:text-gray-900 flex items-center gap-1 py-1 px-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer active:scale-95"
          >
            <span>Retake Assessment</span>
            <ExternalLink className="w-3 h-3 text-gray-400" />
          </button>
        )}
      </div>
    </div>
  );
};
