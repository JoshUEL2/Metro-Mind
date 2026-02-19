import React from 'react';

interface HeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({ darkMode, toggleDarkMode }) => {
  return (
    <header className="w-full bg-slate-900 dark:bg-slate-950 text-white py-6 px-4 shadow-lg relative overflow-hidden transition-colors duration-300">
      {/* Abstract decorative lines representing metro maps */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <svg width="100%" height="100%">
          <path d="M-100 100 Q 200 300 500 100 T 1000 300" stroke="#38bdf8" strokeWidth="40" fill="none" />
          <path d="M-100 200 Q 300 0 700 400" stroke="#f43f5e" strokeWidth="40" fill="none" />
          <path d="M400 -100 L 400 600" stroke="#22c55e" strokeWidth="40" fill="none" />
        </svg>
      </div>

      <div className="max-w-4xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between">
        <div className="flex flex-col items-center md:items-start text-center md:text-left mb-4 md:mb-0">
            <div className="flex items-center gap-3">
                <div className="flex items-center justify-center bg-white/10 p-2 rounded-full backdrop-blur-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-metro-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                    Metro<span className="text-metro-400">Mind</span>
                    </h1>
                </div>
            </div>
            <p className="text-slate-300 mt-1 text-sm pl-11 hidden md:block">
            Explore histories, status, and secrets of world rail stations.
            </p>
        </div>

        {/* Dark Mode Toggle */}
        <button 
            onClick={toggleDarkMode}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors border border-white/10 text-sm font-medium backdrop-blur-sm"
            aria-label="Toggle Dark Mode"
        >
            {darkMode ? (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-yellow-300">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                    </svg>
                    <span>Light Mode</span>
                </>
            ) : (
                <>
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-indigo-200">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                    </svg>
                    <span>Dark Mode</span>
                </>
            )}
        </button>
      </div>
    </header>
  );
};
