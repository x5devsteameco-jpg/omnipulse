export interface BaseStrategy {
  name: string;
  execute(context: StrategyContext): Promise<StrategyResult>;
}

export interface StrategyContext {
  tenantId: string;
  tenantSlug: string;
  tier: 'starter' | 'professional' | 'enterprise';
  features: {
    sentimentAnalysis: boolean;
    competitorBenchmarking: boolean;
    predictiveML: boolean;
    crisisAlerting: boolean;
    automatedReports: boolean;
  };
  metrics?: Record<string, unknown>;
}

export interface StrategyResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export abstract class AbstractStrategy implements BaseStrategy {
  abstract name: string;

  abstract execute(context: StrategyContext): Promise<StrategyResult>;

  protected createSuccess(data: unknown): StrategyResult {
    return { success: true, data };
  }

  protected createFailure(error: string): StrategyResult {
    return { success: false, error };
  }
}
