export type IntegrationStatus = 'not_connected' | 'demo_connected' | 'connected' | 'error';
export type IntegrationCategory = 'ecommerce' | 'logistics' | 'communication' | 'productivity' | 'marketing' | 'developer';

export interface IntegrationTrigger {
  id: string;
  name: string;
  description: string;
  samplePayload: Record<string, unknown>;
}

export interface IntegrationAction {
  id: string;
  name: string;
  description: string;
  inputSchema: Record<string, string>;
}

export interface ConfigField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'url' | 'select';
  placeholder?: string;
  required?: boolean;
  options?: string[];
  helperText?: string;
}

export interface IntegrationProvider {
  id: string;
  name: string;
  category: IntegrationCategory;
  description: string;
  status: IntegrationStatus;
  iconName: string;
  supportedTriggers: IntegrationTrigger[];
  supportedActions: IntegrationAction[];
  requiredPermissions: string[];
  configFields: ConfigField[];
  setupInstructions: string;
  isDemo: boolean;
  lastTestedAt?: string;
  errorMessage?: string;
}
