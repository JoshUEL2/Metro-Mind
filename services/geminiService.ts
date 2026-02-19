import { GoogleGenAI } from "@google/genai";
import { FactResponse, StationResponseSchema } from "../types";

const MODEL_NAME = "gemini-2.5-flash";

// Helper to remove [1], [7, 10] citation tags
const stripCitations = (text: string): string => {
  if (!text) return "";
  // Regex matches [1], [1, 2], [7, 10] etc.
  return text.replace(/\[[\d,\s]+\]/g, "").trim();
};

export const getStationFact = async (
  stationName: string,
  userLocation?: { latitude: number; longitude: number }
): Promise<FactResponse> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  const prompt = `
    User Query: "${stationName}"
    Current Local Time: ${currentTime}

    Task: Provide verified, accurate information about the RAIL/METRO/BUS STATION matching this name.
    
    **CRITICAL AMBIGUITY RULE**: 
    - The user is asking about a STATION. If the query is "Cyprus", "Bank", "Jordan", or "Waterloo", ASSUME they mean the STATION.
    - ONLY set 'isAmbiguous': true if there are MULTIPLE STATIONS with similar names in different cities.

    2. **Station Details** (If not ambiguous):
       - **officialName**: Full station name.
       - **routeDescription**: The name of the MAIN LINE or PHYSICAL ROUTE (e.g. "West Coast Main Line", "Piccadilly Line"). If unknown, blank string.
       - **openingInfo**: STRICT FORMAT: "Opened: YYYY". If reopened, use "Opened: YYYY  Reopened: YYYY". DO NOT include text like "opened by" or "established in". Just the years.
       - **location**: City/Address string.
       - **funFact**: A short, interesting unique fact about the station. MUST BE INCLUDED. Remove citation numbers [1].
       - **historicalContext**: Brief history. Remove citation numbers [1].
       
       - **lines**: Identify ALL specific lines, routes, or services calling here.
          - **Metro/Subway**: Line Code/Name (e.g. "U5", "Piccadilly Line").
          - **Regional/Commuter**: Route Number (e.g. "RB12").
          - **Train Operators**: Operator Brand (e.g. "Avanti West Coast", "LNER", "GWR").
          - **Colors**: ESSENTIAL. Provide the OFFICIAL branding color in HEX.
             - Avanti West Coast: #00455D (Teal)
             - West Midlands Trains: #F05A22 (Orange) or #522398 (Purple)
             - London Northwestern: #00BFA5 (Green)
             - LNER: #CE0E2D (Red)
             - Elizabeth Line: #6950a1 (Purple)
             - Overground: #ef7b10 (Orange)
             - If color is unknown, use #0f172a (Dark Slate). DO NOT leave blank.
          - **Provider URL**: Official website.

       - **Facilities**: 
          - **Step Free Access**: Short summary. Use specific terms: "Full step-free access", "Partial step-free access", or "No step-free access".
          - **Toilets**: Boolean.
       
       - **Operational Status**: "Operational" or "Good Service".
       
       - **Local Buses**: Return a SEPARATE object for EACH route number.
       
       - **Coaches**: List SPECIFIC operator names only (e.g. "National Express"). If "various" or unknown, return EMPTY ARRAY []. Do not list generic "Bus Services".
       
       - **Next Departures**: 
          - **Time**: HH:MM.
          - **Destination**: Final station.
          - **Status**: "On time", "Delayed", or "Scheduled".
          - **Operator**: Specific operator.
          - If real-time unavailable, use SCHEDULED times. Return empty array only if station is closed/defunct.

    **Format**: STRICT JSON. Remove ALL citation tags like [1], [7, 10].

    JSON Schema:
    {
      "isAmbiguous": boolean,
      "candidates": string[],
      "data": {
        "officialName": string,
        "routeDescription": string,
        "location": string,
        "openingInfo": string,
        "funFact": string,
        "historicalContext": string,
        "operationalStatus": string,
        "stepFreeAccess": {
           "status": string,
           "details": string
        },
        "hasToilets": boolean,
        "lines": [
          { "name": string, "colorHex": string, "textColorHex": string, "providerUrl": string }
        ],
        "buses": [
           { "route": "string", "destination": "string", "nextArrival": "string" }
        ],
        "coaches": [
           { "provider": "string", "route": "string", "link": "string" }
        ],
        "nextDepartures": [
           { "destination": "string", "time": "string", "platform": "string", "status": "string", "operator": "string" }
        ]
      }
    }
  `;

  try {
    const config: any = {
      tools: [
        { googleMaps: {} },
        { googleSearch: {} }
      ],
    };

    if (userLocation) {
      config.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          },
        },
      };
    }

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: config,
    });

    const candidate = response.candidates?.[0];
    let text = candidate?.content?.parts?.map(p => p.text).join('') || "{}";
    const groundingMetadata = candidate?.groundingMetadata;

    // Clean markdown
    text = text.trim();
    if (text.startsWith("```json")) {
      text = text.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (text.startsWith("```")) {
      text = text.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    let structuredData: StationResponseSchema | null = null;
    try {
        structuredData = JSON.parse(text);
        
        // Clean fields
        if (structuredData?.data) {
           structuredData.data.funFact = stripCitations(structuredData.data.funFact);
           structuredData.data.historicalContext = stripCitations(structuredData.data.historicalContext);
           structuredData.data.operationalStatus = stripCitations(structuredData.data.operationalStatus);
           structuredData.data.openingInfo = stripCitations(structuredData.data.openingInfo);
           structuredData.data.routeDescription = stripCitations(structuredData.data.routeDescription);
           if (structuredData.data.stepFreeAccess) {
              structuredData.data.stepFreeAccess.status = stripCitations(structuredData.data.stepFreeAccess.status);
              structuredData.data.stepFreeAccess.details = stripCitations(structuredData.data.stepFreeAccess.details);
           }
        }
    } catch (e) {
        console.error("Failed to parse JSON response", e);
        console.log("Raw response text:", text);
    }

    return {
      structuredData,
      rawText: text,
      groundingMetadata,
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
