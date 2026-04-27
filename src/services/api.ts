import axios, {AxiosInstance} from 'axios';
import {appConfig} from '../config/appConfig';
import {
  OAuthTokenResponse,
  BCApiResponse,
  SustainabilityCategory,
  SustainabilitySubCategory,
  SustainabilityAccount,
  SustainabilityJournalEntry,
  ESGLocation,
  Vendor,
  ADIAnalyzeResponse,
} from '../types';

// ==========================================
// Token Cache
// ==========================================

interface TokenCache {
  accessToken: string;
  expiresAt: number;
  scope: string;
}

const tokenCache: Record<string, TokenCache> = {};

async function getToken(scope: string): Promise<string> {
  const cached = tokenCache[scope];
  if (cached && Date.now() < cached.expiresAt - 60000) {
    return cached.accessToken;
  }

  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', appConfig.entraClientId);
  params.append('client_secret', appConfig.entraClientSecret);
  params.append('scope', scope);

  const response = await axios.post<OAuthTokenResponse>(
    appConfig.entraTokenUrl,
    params.toString(),
    {headers: {'Content-Type': 'application/x-www-form-urlencoded'}},
  );

  tokenCache[scope] = {
    accessToken: response.data.access_token,
    expiresAt: Date.now() + response.data.expires_in * 1000,
    scope,
  };

  return response.data.access_token;
}

// ==========================================
// Business Central API Client
// ==========================================

async function getBCClient(): Promise<AxiosInstance> {
  const token = await getToken(appConfig.bcOAuthScope);
  return axios.create({
    baseURL: appConfig.bcBaseUrl,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
}

function sustainabilityPath(endpoint: string): string {
  return `/${appConfig.bcSustainabilityApi.replace('{companyId}', appConfig.bcCompanyId)}/${endpoint}`;
}

function customApiPath(endpoint: string): string {
  return `/${appConfig.bcCustomApi.replace('{companyId}', appConfig.bcCompanyId)}/${endpoint}`;
}

function standardApiPath(endpoint: string): string {
  return `/${appConfig.bcStandardApi.replace('{companyId}', appConfig.bcCompanyId)}/${endpoint}`;
}

export const bcApi = {
  // Sustainability Categories
  async getCategories(): Promise<SustainabilityCategory[]> {
    const client = await getBCClient();
    const res = await client.get<BCApiResponse<SustainabilityCategory>>(
      sustainabilityPath('sustainabilityAccountCategories'),
    );
    return res.data.value;
  },

  // Sustainability SubCategories
  async getSubCategories(): Promise<SustainabilitySubCategory[]> {
    const client = await getBCClient();
    const res = await client.get<BCApiResponse<SustainabilitySubCategory>>(
      sustainabilityPath('sustainabilityAccountSubcategories'),
    );
    return res.data.value;
  },

  // Sustainability Accounts
  async getAccounts(): Promise<SustainabilityAccount[]> {
    const client = await getBCClient();
    const res = await client.get<BCApiResponse<SustainabilityAccount>>(
      sustainabilityPath('sustainabilityAccounts'),
    );
    return res.data.value;
  },

  // Journal Entries
  async getJournalEntries(): Promise<SustainabilityJournalEntry[]> {
    const client = await getBCClient();
    const res = await client.get<BCApiResponse<SustainabilityJournalEntry>>(
      customApiPath('sustainabilityJournalEntries'),
    );
    return res.data.value;
  },

  async createJournalEntry(
    entry: Partial<SustainabilityJournalEntry>,
  ): Promise<SustainabilityJournalEntry> {
    const client = await getBCClient();
    const res = await client.post<SustainabilityJournalEntry>(
      customApiPath('sustainabilityJournalEntries'),
      entry,
    );
    return res.data;
  },

  async deleteJournalEntry(id: string): Promise<void> {
    const client = await getBCClient();
    await client.delete(customApiPath(`sustainabilityJournalEntries(${id})`));
  },

  // ESG Locations
  async getESGLocations(): Promise<ESGLocation[]> {
    const client = await getBCClient();
    const res = await client.get<BCApiResponse<ESGLocation>>(
      customApiPath('esgLocations'),
    );
    return res.data.value;
  },

  // Vendors
  async getVendors(): Promise<Vendor[]> {
    const client = await getBCClient();
    const res = await client.get<BCApiResponse<Vendor>>(
      standardApiPath('vendors'),
    );
    return res.data.value;
  },
};

// ==========================================
// SharePoint Graph API Client
// ==========================================

async function getGraphClient(): Promise<AxiosInstance> {
  const token = await getToken(appConfig.graphApiScope);
  return axios.create({
    baseURL: 'https://graph.microsoft.com/v1.0',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export const sharePointApi = {
  async uploadFile(
    folderPath: string,
    fileName: string,
    fileContent: ArrayBuffer | string,
    contentType: string,
  ): Promise<{webUrl: string; id: string}> {
    const client = await getGraphClient();
    const sitePath = appConfig.sharePointSite;
    const uploadUrl = `/sites/${sitePath}/drive/root:/${folderPath}/${fileName}:/content`;

    const res = await client.put(uploadUrl, fileContent, {
      headers: {'Content-Type': contentType},
    });
    return {webUrl: res.data.webUrl, id: res.data.id};
  },

  async createFolder(folderPath: string): Promise<void> {
    const client = await getGraphClient();
    const sitePath = appConfig.sharePointSite;
    const parts = folderPath.split('/');
    let currentPath = '';

    for (const part of parts) {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      try {
        await client.post(
          `/sites/${sitePath}/drive/root:/${currentPath}:/children`,
          {name: part, folder: {}, '@microsoft.graph.conflictBehavior': 'fail'},
        );
      } catch {
        // Folder may already exist, continue
      }
    }
  },
};

// ==========================================
// Azure Document Intelligence Client
// ==========================================

export const adiApi = {
  async analyzeDocument(
    fileContent: string,
    contentType: string,
  ): Promise<ADIAnalyzeResponse> {
    const analyzeUrl = `${appConfig.adiEndpoint}/documentintelligence/documentModels/${appConfig.adiModelId}:analyze?api-version=2024-11-30`;

    // Start analysis
    const startRes = await axios.post(analyzeUrl, fileContent, {
      headers: {
        'Ocp-Apim-Subscription-Key': appConfig.adiApiKey,
        'Content-Type': contentType,
      },
    });

    const operationLocation =
      startRes.headers['operation-location'] ||
      startRes.headers['Operation-Location'];

    if (!operationLocation) {
      throw new Error('No operation-location header in ADI response');
    }

    // Poll for result
    let result: ADIAnalyzeResponse = {status: 'running'};
    const maxAttempts = 30;
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const pollRes = await axios.get<ADIAnalyzeResponse>(operationLocation, {
        headers: {'Ocp-Apim-Subscription-Key': appConfig.adiApiKey},
      });

      result = pollRes.data;
      if (result.status === 'succeeded' || result.status === 'failed') {
        break;
      }
    }

    return result;
  },
};
