import React from 'react';
import { BusInfo, CoachInfo, DepartureInfo } from '../types';

interface TransportSidebarProps {
  buses?: BusInfo[];
  coaches?: CoachInfo[];
  departures?: DepartureInfo[];
}

export const TransportSidebar: React.FC<TransportSidebarProps> = ({ buses, coaches, departures }) => {
  // Always render the sidebar components, checking for empty data inside
  
  return (
    <div className="flex flex-col gap-6 animate-fade-in-up delay-100" role="complementary" aria-label="Transport Information">
      
      {/* Next Train Departures */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-slate-800 dark:text-white font-semibold">
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-metro-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 id="departures-heading">Departures</h3>
          </div>
          <div className="flex flex-col gap-3" aria-labelledby="departures-heading">
            {departures && departures.length > 0 ? (
              departures.map((dep, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700 last:border-0 last:pb-0">
                  <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-baseline justify-between mb-1">
                          <span className="font-bold text-lg text-slate-900 dark:text-white">{dep.time}</span>
                          {dep.platform ? (
                              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">Plat {dep.platform}</span>
                          ) : (
                              <span className="text-xs text-slate-400 italic">--</span>
                          )}
                      </div>
                      <div className="truncate font-medium text-slate-700 dark:text-slate-200">{dep.destination}</div>
                      <div className="flex items-center gap-2 mt-1">
                          {dep.status && (
                              <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                                  dep.status.toLowerCase().includes('time') 
                                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                      : dep.status.toLowerCase().includes('cancel')
                                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                              }`}>
                                  {dep.status}
                              </span>
                          )}
                          {dep.operator && (
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{dep.operator}</span>
                          )}
                      </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400 italic py-2">No live departure information available.</p>
            )}
          </div>
      </div>

      {/* Local Buses */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
           <div className="flex items-center gap-2 mb-4 text-slate-800 dark:text-white font-semibold">
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
            <h3 id="buses-heading">Local Buses</h3>
          </div>
          <div className="space-y-4" aria-labelledby="buses-heading">
             {buses && buses.length > 0 ? (
               buses.map((bus, idx) => (
                 <div key={idx} className="flex items-start gap-3 group">
                    <div className="min-w-[2.5rem] px-2 w-auto h-auto py-1 rounded-md bg-red-600 text-white flex items-center justify-center font-bold text-xs shrink-0 text-center shadow-sm">
                      {bus.route}
                    </div>
                    <div className="flex-grow min-w-0 flex flex-col justify-center">
                       <p className="text-sm font-medium text-slate-800 dark:text-slate-200 break-words leading-snug">{bus.destination}</p>
                       {bus.nextArrival && <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-0.5">{bus.nextArrival}</p>}
                    </div>
                 </div>
               ))
             ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400 italic py-2">No local bus info available.</p>
             )}
          </div>
      </div>

      {/* Coaches */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
           <div className="flex items-center gap-2 mb-4 text-slate-800 dark:text-white font-semibold">
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-500">
               <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            <h3 id="coaches-heading">Coach Services</h3>
          </div>
          <div className="space-y-3" aria-labelledby="coaches-heading">
            {coaches && coaches.length > 0 ? (
              coaches.map((coach, idx) => (
                  <a 
                    key={idx}
                    href={coach.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors border border-blue-100 dark:border-blue-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    aria-label={`Coach service by ${coach.provider} going to ${coach.route}`}
                  >
                     <div className="flex justify-between items-start">
                        <div className="pr-2">
                           <p className="text-sm font-bold text-blue-800 dark:text-blue-300 group-hover:underline decoration-2 underline-offset-2">{coach.provider}</p>
                           <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 break-words">{coach.route}</p>
                        </div>
                        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-blue-400 shrink-0 mt-0.5">
                          <path fillRule="evenodd" d="M5 10a.75.75 0 01.75-.75h6.638L10.23 7.29a.75.75 0 111.04-1.08l3.5 3.25a.75.75 0 010 1.08l-3.5 3.25a.75.75 0 11-1.04-1.08l2.158-1.96H5.75A.75.75 0 015 10z" clipRule="evenodd" />
                        </svg>
                     </div>
                  </a>
              ))
            ) : (
               <p className="text-sm text-slate-500 dark:text-slate-400 italic py-2">No specific coach services found.</p>
            )}
          </div>
      </div>

    </div>
  );
};
