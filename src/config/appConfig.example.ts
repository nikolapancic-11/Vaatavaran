// Copy this file to appConfig.ts and fill in your values
// appConfig.ts is gitignored — never commit secrets

export const appConfig = {
  // Entra ID (Azure AD)
  entraClientId: 'YOUR_ENTRA_CLIENT_ID',
  entraTenantId: 'YOUR_ENTRA_TENANT_ID',
  entraClientSecret: 'YOUR_ENTRA_CLIENT_SECRET',

  // Business Central
  bcEnvironment: 'YOUR_BC_ENVIRONMENT',
  bcCompanyId: 'YOUR_BC_COMPANY_ID',
  bcApiBase: 'https://api.businesscentral.dynamics.com/v2.0',
  bcSustainabilityApi: 'api/microsoft/sustainability/v1.0/companies({companyId})',
  bcCustomApiPublisher: 'alletec',
  bcCustomApiGroup: 'vaatavaran',
  bcCustomApi: 'api/alletec/vaatavaran/v1.0/companies({companyId})',
  bcStandardApi: 'api/v2.0/companies({companyId})',
  bcOAuthScope: 'https://api.businesscentral.dynamics.com/.default',

  // Azure Document Intelligence
  adiEndpoint: 'YOUR_ADI_ENDPOINT',
  adiApiKey: 'YOUR_ADI_API_KEY',
  adiModelId: 'YOUR_ADI_MODEL_ID',

  // SharePoint
  sharePointSite: 'YOUR_TENANT.sharepoint.com:/sites/YOUR_SITE',
  graphApiScope: 'https://graph.microsoft.com/.default',

  // Firebase
  fcmServerKey: 'YOUR_FCM_SERVER_KEY',

  // App
  demoEmail: 'demo@example.com',
  demoPassword: '123456',
  appDisplayName: 'Vaatavaran',
  primaryColor: '#0078D4',

  // Computed URLs
  get bcBaseUrl(): string {
    return `${this.bcApiBase}/${this.entraTenantId}/${this.bcEnvironment}`;
  },
  get bcSustainabilityUrl(): string {
    return `${this.bcBaseUrl}/${this.bcSustainabilityApi.replace('{companyId}', this.bcCompanyId)}`;
  },
  get bcCustomUrl(): string {
    return `${this.bcBaseUrl}/${this.bcCustomApi.replace('{companyId}', this.bcCompanyId)}`;
  },
  get bcStandardUrl(): string {
    return `${this.bcBaseUrl}/${this.bcStandardApi.replace('{companyId}', this.bcCompanyId)}`;
  },
  get entraTokenUrl(): string {
    return `https://login.microsoftonline.com/${this.entraTenantId}/oauth2/v2.0/token`;
  },
};
