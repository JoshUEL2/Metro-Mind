export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
    placeAnswerSources?: {
        reviewSnippets?: {
            reviewText: string;
        }[]
    }
  };
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
  groundingSupports?: any[];
  webSearchQueries?: string[];
}

export interface TransitLine {
  name: string; // e.g. "U5", "Piccadilly Line", "RB12", "Avanti West Coast"
  colorHex: string; // Specific line color e.g. #794c14 
  textColorHex: string; 
  providerUrl?: string; 
}

export interface BusInfo {
  route: string;
  destination: string;
  nextArrival?: string; 
}

export interface CoachInfo {
  provider: string; 
  route: string;
  link: string;     
}

export interface DepartureInfo {
  destination: string;
  time: string;     
  platform?: string;
  status?: string; // e.g. "On Time", "Delayed", "Cancelled"
  operator?: string; // e.g. "LNER"
}

export interface StepFreeAccess {
  status: string; // e.g. "Partial Step-Free"
  details: string; // e.g. "Lifts to platforms 1 & 2 only"
}

export interface StationData {
  officialName: string;
  routeDescription: string; // e.g. "West Coast Main Line"
  location: string;
  funFact: string;         
  historicalContext: string; 
  openingInfo: string;     
  operationalStatus: string; 
  stepFreeAccess: StepFreeAccess;
  hasToilets: boolean;
  lines: TransitLine[];
  buses: BusInfo[];
  coaches: CoachInfo[];
  nextDepartures: DepartureInfo[];
}

export interface StationResponseSchema {
  isAmbiguous: boolean;
  candidates: string[];
  data?: StationData;
}

export interface FactResponse {
  structuredData: StationResponseSchema | null;
  rawText: string;
  groundingMetadata?: GroundingMetadata;
}
