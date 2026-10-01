import React, { useState } from 'react';
import { X, Check, Copy, Share2 } from 'lucide-react';

export default function SocialShareModal({ isOpen, onClose, article }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !article) return null;

  const shareUrl = window.location.href;
  const shareTitle = article.title;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareLinks = [
    {
      name: 'X (formerly Twitter)',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`,
      color: 'bg-black text-white hover:bg-neutral-800'
    },
    {
      name: 'LinkedIn',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      color: 'bg-[#0077B5] text-white hover:bg-[#006097]'
    },
    {
      name: 'Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: 'bg-[#1877F2] text-white hover:bg-[#1565C0]'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0F1E36] border border-blue-800/60 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-slide-up">
        <div className="flex items-center justify-between pb-3 border-b border-blue-900/60">
          <div className="flex items-center gap-2 text-blue-300 font-semibold text-base">
            <Share2 className="w-5 h-5 text-blue-400" />
            <span>Share This Dispatch</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-blue-900/50 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300 font-medium line-clamp-2">
          {article.title}
        </p>

        {/* Social Buttons */}
        <div className="space-y-2.5">
          {shareLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full flex items-center justify-center py-2.5 px-4 rounded-xl text-xs font-semibold transition-all shadow-md ${link.color}`}
            >
              Share on {link.name}
            </a>
          ))}
        </div>

        {/* Direct Link Copy */}
        <div className="space-y-1.5 pt-2">
          <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Direct Article Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-[#0A1628] border border-blue-900/60 rounded-xl px-3 py-2 text-xs text-slate-300 select-all focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
