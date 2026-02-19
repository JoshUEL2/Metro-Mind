import React from 'react';

interface LineMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  lineName: string;
  colorHex: string;
  mapUrl?: string;
}

export const LineMapModal: React.FC<LineMapModalProps> = ({ isOpen, onClose, lineName, colorHex, mapUrl }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] shadow-2xl flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800" style={{ borderTop: `4px solid ${colorHex}` }}>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            {lineName} Map
          </h3>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-grow overflow-auto bg-slate-50 dark:bg-black flex items-center justify-center p-4">
          {mapUrl ? (
            <img 
              src={mapUrl} 
              alt={`${lineName} map`} 
              className="max-w-full h-auto object-contain rounded shadow-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.innerHTML = `<div class="text-center p-8 text-slate-500">Map image unavailable</div>`;
              }}
            />
          ) : (
             <div className="text-center p-12 text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto mb-4 opacity-50">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                <p>Map unavailable for this line.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
