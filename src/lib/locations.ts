
import locationData from './locations.json';

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

// Export the raw data for initializing state
export const initialLocationSettings: BarangayConfig[] = locationData.barangays;

// Export just the names and codes for UI dropdowns
export const allBarangays: Barangay[] = locationData.barangays.map(b => ({
  name: b.name,
  barangayCode: b.barangayCode,
}));

    