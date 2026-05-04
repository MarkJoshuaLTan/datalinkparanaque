import bfHomes from './locations/001-bf-homes.json';
import baclaran from './locations/002-baclaran.json';
import donBosco from './locations/003-don-bosco.json';
import dongalo from './locations/004-dongalo.json';
import laHuerta from './locations/005-la-huerta.json';
import marceloGreen from './locations/006-marcelo-green.json';
import merville from './locations/007-merville.json';
import moonwalk from './locations/008-moonwalk.json';
import sanAntonio from './locations/009-san-antonio.json';
import sanDionisio from './locations/010-san-dionisio.json';
import sanIsidro from './locations/011-san-isidro.json';
import sanMartin from './locations/012-san-martin.json';
import stoNino from './locations/013-sto-nino.json';
import sunValley from './locations/014-sun-valley.json';
import tambo from './locations/015-tambo.json';
import vitalez from './locations/016-vitalez.json';

// For UI Dropdowns
export interface Barangay {
  name: string;
  barangayCode: string;
}

// This is the structure for a single section's settings
export interface SectionConfig {
  section: string;
  location: string;
  unitValue?: number;
}

// This is the structure for a full barangay's settings, including all its sections
export interface BarangayConfig {
  name: string;
  barangayCode: string;
  sections: SectionConfig[];
}

// Aggregated initial location settings
export const initialLocationSettings: BarangayConfig[] = [
  bfHomes as BarangayConfig,
  baclaran as BarangayConfig,
  donBosco as BarangayConfig,
  dongalo as BarangayConfig,
  laHuerta as BarangayConfig,
  marceloGreen as BarangayConfig,
  merville as BarangayConfig,
  moonwalk as BarangayConfig,
  sanAntonio as BarangayConfig,
  sanDionisio as BarangayConfig,
  sanIsidro as BarangayConfig,
  sanMartin as BarangayConfig,
  stoNino as BarangayConfig,
  sunValley as BarangayConfig,
  tambo as BarangayConfig,
  vitalez as BarangayConfig,
];

// Export just the names and codes for UI dropdowns, ensuring uniqueness
export const allBarangays: Barangay[] = Array.from(
  new Map(initialLocationSettings.map(b => [b.barangayCode, { name: b.name, barangayCode: b.barangayCode }])).values()
);
