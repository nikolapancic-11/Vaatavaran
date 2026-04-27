// ==========================================
// Business Central Entity Types
// ==========================================

export interface SustainabilityCategory {
  id: string;
  code: string;
  description: string;
  emissionScope: EmissionScope;
}

export interface SustainabilitySubCategory {
  id: string;
  code: string;
  description: string;
  categoryCode: string;
  emissionFactor: number;
  renewableEnergy: boolean;
}

export interface SustainabilityAccount {
  id: string;
  no: string;
  name: string;
  categoryCode: string;
  subcategoryCode: string;
  directPosting: boolean;
}

export interface SustainabilityJournalEntry {
  id: string;
  lineNo: number;
  postingDate: string;
  documentNo: string;
  accountNo: string;
  accountName: string;
  description: string;
  manualInput: boolean;
  unitOfMeasure: string;
  quantity: number;
  emissionCO2: number;
  emissionCH4: number;
  emissionN2O: number;
  countryRegionCode: string;
  responsibilityCenter: string;
  categoryCode: string;
  subcategoryCode: string;
  calculationFoundation: string;
  customAmount: number;
  calculationType: CalculationType;
  stagingBatchId: string;
}

export interface ESGLocation {
  id: string;
  code: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postCode: string;
}

export interface Vendor {
  id: string;
  number: string;
  displayName: string;
  addressLine1: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phoneNumber: string;
  email: string;
}

// ==========================================
// Enums
// ==========================================

export enum EmissionScope {
  Scope1 = 'Scope 1',
  Scope2 = 'Scope 2',
  Scope3 = 'Scope 3',
}

export enum CalculationType {
  FuelElectricity = 'Fuel/Electricity',
  Distance = 'Distance',
  Installation = 'Installation',
  Custom = 'Custom',
}

export enum EntryStatus {
  Draft = 'draft',
  Submitted = 'submitted',
  Posted = 'posted',
  Error = 'error',
}

// ==========================================
// App Types
// ==========================================

export interface DraftEntry {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: EntryStatus;
  accountNo: string;
  accountName: string;
  categoryCode: string;
  subcategoryCode: string;
  calculationType: CalculationType;
  postingDate: string;
  description: string;
  quantity: number;
  unitOfMeasure: string;
  emissionCO2: number;
  emissionCH4: number;
  emissionN2O: number;
  customAmount: number;
  attachmentUri?: string;
  attachmentName?: string;
  sharePointUrl?: string;
  vendorName?: string;
  extractedData?: ExtractedBillData;
}

export interface ExtractedBillData {
  billDate?: string;
  vendorName?: string;
  amount?: number;
  unit?: string;
  billNumber?: string;
  totalCost?: number;
  confidence: number;
}

export interface FilterState {
  dateFrom?: string;
  dateTo?: string;
  scope?: EmissionScope;
  categoryCode?: string;
  calculationType?: CalculationType;
  status?: EntryStatus;
  searchQuery: string;
}

export interface UserProfile {
  email: string;
  name: string;
  isLoggedIn: boolean;
  notificationsEnabled: boolean;
}

export interface DashboardStats {
  totalEntries: number;
  thisMonthEntries: number;
  totalEmissionsCO2: number;
  draftCount: number;
  scope1Emissions: number;
  scope2Emissions: number;
  scope3Emissions: number;
}

// ==========================================
// API Response Types
// ==========================================

export interface BCApiResponse<T> {
  '@odata.context'?: string;
  value: T[];
}

export interface BCApiSingleResponse<T> {
  '@odata.context'?: string;
  '@odata.etag'?: string;
  value: T;
}

export interface ADIAnalyzeResponse {
  status: 'running' | 'succeeded' | 'failed';
  analyzeResult?: {
    documents: Array<{
      fields: Record<
        string,
        {
          type: string;
          content: string;
          confidence: number;
        }
      >;
    }>;
  };
}

export interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

// ==========================================
// Navigation Types
// ==========================================

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};

export type RootTabParamList = {
  DashboardTab: undefined;
  Upload: undefined;
  ManualEntry: {draft?: DraftEntry; viewMode?: boolean} | undefined;
  History: undefined;
  Settings: undefined;
};

export type DashboardStackParamList = {
  Dashboard: undefined;
  ScopeDetail: {scope: EmissionScope; title: string};
};

// ==========================================
// Component Props Types
// ==========================================

export interface PickerOption {
  label: string;
  value: string;
}
