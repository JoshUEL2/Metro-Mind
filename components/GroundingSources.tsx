import React from 'react';
import { GroundingMetadata } from '../types';

interface GroundingSourcesProps {
  metadata: GroundingMetadata;
}

export const GroundingSources: React.FC<GroundingSourcesProps> = ({ metadata }) => {
  if (!metadata || !metadata.groundingChunks || metadata.groundingChunks.length === 0) {
    return null;
  }

  // Filter Maps: Take only the first one (most relevant)
  const allMapSources = metadata.groundingChunks.filter(chunk => chunk.maps);
  const mapSource = allMapSources.length > 0 ? allMapSources[0] : null;

  // Filter Web: Keep them, but maybe limit to 3 to avoid clutter if desired, 
  // but usually users want to see sources. We'll show up to 3.
  const webSources = metadata.groundingChunks.filter(chunk => chunk.web).slice(0, 3);

  if (!mapSource && webSources.length === 0) return null;

  return (
    <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
      <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
        Sources & Locations
      </h3>
      
      <div className="flex flex-wrap gap-2">
        {/* Single Best Map Source */}
        {mapSource && (
          <a
            href={mapSource.maps?.uri}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors border border-emerald-200 dark:border-emerald-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            {mapSource.maps?.title || "Google Maps"}
          </a>
        )}

        {/* Web Sources */}
        {webSources.map((chunk, index) => (
          <a
            key={`web-${index}`}
            href={chunk.web?.uri}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors border border-blue-200 dark:border-blue-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12 14a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M3 12c0-4.97 4.03-9 9-9s9 4.03 9 9-4.03 9-9 9-9-4.03-9-9zm9-7a7 7 0 100 14 7 7 0 000-14z" clipRule="evenodd" />
            </svg>
            {chunk.web?.title || "Source"}
          </a>
        ))}
      </div>
    </div>
  );
};
