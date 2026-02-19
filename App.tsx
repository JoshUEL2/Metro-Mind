import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { TransportSidebar } from './components/TransportSidebar';
import { getStationFact } from './services/geminiService';
import { FactResponse } from './types';

const LOADING_MESSAGES = [
  "Hunting for facts...",
  "Consulting the timetables...",
  "Measuring the platforms...",
  "Asking the station master...",
  "Checking the signals...",
  "Tracing the tracks...",
  "Finding the toilets..."
];

export default function App() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<FactResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | undefined>(undefined);
  const [darkMode, setDarkMode] = useState(false);
  const [stepFreeExpanded, setStepFreeExpanded] = useState(false);
  const loadingIntervalRef = useRef<number | null>(null);

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Attempt to get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err) => {
          console.log("Geolocation permission denied or error:", err);
        }
      );
    }
    
    // Check system preference for dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setDarkMode(true);
        document.documentElement.classList.add('dark');
    }
  }, []);

  // Handle loading message cycling
  useEffect(() => {
    if (loading) {
      let idx = 0;
      setLoadingMsg(LOADING_MESSAGES[0]);
      loadingIntervalRef.current = window.setInterval(() => {
        idx = (idx + 1) % LOADING_MESSAGES.length;
        setLoadingMsg(LOADING_MESSAGES[idx]);
      }, 2000);
    } else {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
      }
    }
    return () => {
      if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
    };
  }, [loading]);

  const fetchFact = async (searchQuery: string) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setStepFreeExpanded(false); // Reset expansion on new search

    try {
      const data = await getStationFact(searchQuery, location);
      setResult(data);
    } catch (err: any) {
      setError("We couldn't retrieve information right now. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    await fetchFact(query);
  }, [query, location]);

  const handleCandidateClick = (candidate: string) => {
    setQuery(candidate);
    fetchFact(candidate);
  };

  const getStatusColorClass = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('good') || s.includes('operational') || s.includes('normal') || s.includes('on time')) {
      return { dot: 'bg-green-400', bg: 'bg-green-500' };
    }
    if (s.includes('closure') || s.includes('suspended') || s.includes('closed')) {
      return { dot: 'bg-red-400', bg: 'bg-red-500' };
    }
    return { dot: 'bg-amber-400', bg: 'bg-amber-500' };
  };

  // Logic to determine color for accessibility
  const getStepFreeColorClass = (status: string, isExpanded: boolean) => {
    const s = status.toLowerCase();
    
    // Check for negative first
    if (s.includes('no step-free') || s.includes('not accessible') || s.includes('no access')) {
        return isExpanded 
            ? 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700' 
            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30';
    }
    
    // Check for partial
    if (s.includes('partial') || s.includes('some') || s.includes('limited')) {
        return isExpanded 
            ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700' 
            : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30';
    }

    // Default to green (Full/Yes)
    return isExpanded 
        ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700' 
        : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30';
  };

  const renderContent = () => {
    if (!result?.structuredData) return null;

    const { isAmbiguous, candidates, data } = result.structuredData;
    const mapUrl = result.groundingMetadata?.groundingChunks?.find(c => c.maps)?.maps?.uri;

    // AMBIGUOUS STATE
    if (isAmbiguous && candidates && candidates.length > 0) {
      return (
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-4 text-amber-600 dark:text-amber-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75h.007v.008H12v-.008z" />
              </svg>
              <h2 className="text-lg font-semibold">Which station did you mean?</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Multiple stations match your search. Please select one:
            </p>
            <div className="grid gap-3">
              {candidates.map((candidate, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCandidateClick(candidate)}
                  className="text-left px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-metro-50 dark:hover:bg-metro-900 border border-slate-200 dark:border-slate-600 hover:border-metro-200 dark:hover:border-metro-700 transition-all font-medium text-slate-700 dark:text-slate-200"
                >
                  {candidate}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // DETAIL STATE (GRID LAYOUT)
    if (data) {
      const statusColors = getStatusColorClass(data.operationalStatus);
      const stepFreeClass = getStepFreeColorClass(data.stepFreeAccess.status, stepFreeExpanded);

      return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
          
          {/* Main Info Column (Left, 2 cols) */}
          <div className="lg:col-span-2 space-y-8 animate-fade-in-up">
             <div className="bg-white dark:bg-slate-800 rounded-xl p-6 md:p-8 border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
                
                {/* Header Section */}
                <div className="mb-6 pb-6 border-b border-slate-100 dark:border-slate-700">
                  <div className="flex flex-col">
                      <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white leading-tight mb-2">
                        {data.officialName} 
                      </h1>
                      
                      {/* Simple Route Description */}
                      {data.routeDescription && (
                        <div className="text-xl font-medium text-slate-500 dark:text-slate-400 mb-4">
                           {data.routeDescription}
                        </div>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-slate-500 dark:text-slate-400 text-sm">
                          <div className="flex items-center gap-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0 text-metro-500">
                                <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">{data.location}</span>
                          </div>
                          
                          {data.openingInfo && (
                              <div className="flex items-center gap-1.5">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0 text-slate-400">
                                    <path d="M12.75 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM7.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM8.25 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9.75 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM10.5 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM12.75 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM14.25 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 13.5a.75.75 0 100-1.5.75.75 0 000 1.5z" />
                                    <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd" />
                                </svg>
                                <span className="font-semibold text-slate-700 dark:text-slate-300">{data.openingInfo}</span>
                              </div>
                          )}
                      </div>
                  </div>

                  {/* Facilities (Toilets / Step Free) */}
                  <div className="flex flex-wrap gap-4 mt-6">
                     
                     {/* Expandable Step Free Bubble */}
                     <div className="relative">
                       <button 
                          onClick={() => setStepFreeExpanded(!stepFreeExpanded)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${stepFreeClass}`}
                          aria-expanded={stepFreeExpanded}
                          aria-controls="step-free-details"
                       >
                          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
                          </svg>
                          <span>{data.stepFreeAccess.status}</span>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 transition-transform ${stepFreeExpanded ? 'rotate-180' : ''}`}>
                            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                          </svg>
                       </button>
                       
                       {/* Dropdown for step free details */}
                       {stepFreeExpanded && (
                         <div id="step-free-details" className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-4 z-10 animate-fade-in">
                            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Accessibility Details</h4>
                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                               {data.stepFreeAccess.details}
                            </p>
                         </div>
                       )}
                     </div>

                     <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border border-transparent ${data.hasToilets ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800' : 'bg-slate-100 dark:bg-slate-700/50 text-slate-500'}`}>
                        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                             <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                        <span>{data.hasToilets ? 'Toilets Available' : 'No Public Toilets'}</span>
                     </div>
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  
                  {/* Fun Fact - Only render if content exists */}
                  {data.funFact && data.funFact.length > 0 && (
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-5 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
                      <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold uppercase tracking-wider text-xs mb-2">
                        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5zM9 15a.75.75 0 01.75.75v1.5h1.5a.75.75 0 010 1.5h-1.5v1.5a.75.75 0 01-1.5 0v-1.5h-1.5a.75.75 0 010-1.5h1.5v-1.5A.75.75 0 019 15z" clipRule="evenodd" />
                        </svg>
                        Did You Know?
                      </div>
                      <p className="text-slate-800 dark:text-slate-200 text-lg font-medium leading-relaxed">
                        {data.funFact}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Historical Context */}
                      <div>
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs mb-2">
                          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                          </svg>
                          History
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                          {data.historicalContext}
                        </p>
                      </div>

                      {/* Operational Status */}
                      <div>
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs mb-2">
                              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                              </svg>
                              Operational Status
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-100 dark:border-slate-700">
                              <div className="flex items-start gap-3">
                                  <div className="relative flex h-3 w-3 mt-1.5">
                                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusColors.dot}`}></span>
                                      <span className={`relative inline-flex rounded-full h-3 w-3 ${statusColors.bg}`}></span>
                                  </div>
                                  <p className="text-slate-700 dark:text-slate-200 text-sm font-medium">
                                      {data.operationalStatus}
                                  </p>
                              </div>
                        </div>
                      </div>
                  </div>

                  {/* Lines / Services */}
                  {data.lines && data.lines.length > 0 && (
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wide">Services & Lines</h3>
                          <div className="flex flex-wrap gap-2">
                              {data.lines.map((line, idx) => (
                                  <a
                                      key={idx}
                                      href={line.providerUrl || '#'}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      aria-label={`Visit ${line.name} website`}
                                      className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-bold shadow-sm transition-transform ${line.providerUrl ? 'hover:scale-105 hover:shadow-md cursor-pointer' : 'cursor-default opacity-90'}`}
                                      style={{ 
                                          backgroundColor: line.colorHex || '#0f172a', 
                                          color: line.textColorHex || '#ffffff'
                                      }}
                                  >
                                      {line.name}
                                      {line.providerUrl && (
                                        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 ml-1.5 opacity-75">
                                          <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z" clipRule="evenodd" />
                                        </svg>
                                      )}
                                  </a>
                              ))}
                          </div>
                      </div>
                  )}
                  
                  {/* BIG MAP BUTTON */}
                  {mapUrl && (
                    <div className="pt-6 mt-2">
                       <a 
                          href={mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                          aria-label={`View ${data.officialName} on Google Maps`}
                       >
                          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                            <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                          </svg>
                          View on Google Maps
                       </a>
                    </div>
                  )}
                </div>
             </div>
          </div>

          {/* Sidebar Column (Right, 1 col) */}
          <div className="lg:col-span-1">
             <TransportSidebar 
               buses={data.buses}
               coaches={data.coaches}
               departures={data.nextDepartures}
             />
          </div>

        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
        <div className="relative z-20">
          
          <form onSubmit={handleSubmit} className="mb-8 max-w-3xl mx-auto">
            <div className="relative group">
              <input
                id="station-search"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter a station name (e.g. Paddington)"
                className="w-full pl-12 pr-32 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-lg focus:shadow-xl focus:border-metro-500 dark:focus:border-metro-500 transition-all outline-none text-lg placeholder-slate-400"
                disabled={loading}
                aria-label="Search for a station"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-metro-500 transition-colors pointer-events-none">
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="absolute right-2 top-2 bottom-2 bg-metro-600 hover:bg-metro-700 dark:bg-metro-600 dark:hover:bg-metro-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-semibold px-6 rounded-xl transition-all flex items-center justify-center min-w-[100px] shadow-md"
                aria-label="Search"
              >
                 Search
              </button>
            </div>
          </form>

          {/* LOADING STATE */}
          {loading && (
             <div className="flex flex-col items-center justify-center py-20 animate-fade-in-up">
                <div className="relative w-24 h-24 mb-8">
                   <div className="absolute inset-0 border-4 border-slate-200 dark:border-slate-700 rounded-full"></div>
                   <div className="absolute inset-0 border-4 border-metro-500 rounded-full border-t-transparent animate-spin"></div>
                   <div className="absolute inset-0 flex items-center justify-center">
                      <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-metro-500 animate-pulse">
                         <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                         <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
                      </svg>
                   </div>
                </div>
                <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200 animate-pulse text-center px-4">
                  {loadingMsg}
                </h2>
             </div>
          )}

          {error && !loading && (
            <div className="max-w-3xl mx-auto bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-start gap-3 mb-6 animate-fade-in-up" role="alert">
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mt-0.5 shrink-0">
                <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
              </svg>
              <p>{error}</p>
            </div>
          )}

          {result && !loading && (
            renderContent()
          )}

          {!result && !loading && !error && (
            <div className="text-center py-16 opacity-40">
              <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-slate-500 dark:text-slate-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                </svg>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">Find a station to begin.</p>
            </div>
          )}

        </div>
      </main>

      <footer className="py-8 text-center text-slate-400 dark:text-slate-600 text-sm">
        <p>Powered by Gemini 2.5 Flash • Google Maps • Google Search</p>
      </footer>
    </div>
  );
}
