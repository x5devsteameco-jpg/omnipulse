import { AbstractStrategy, StrategyContext, StrategyResult } from './base';

export interface StrategyFactory {
  createAnalyticsStrategy(tier: string): AbstractStrategy;
}

import { SentimentAnalysisStrategy } from './analytics';
import { CompetitorBenchmarkingStrategy } from './analytics';
import { PredictiveMLStrategy } from './analytics';
import { CrisisAlertingStrategy } from './analytics';
import { AutomatedReportsStrategy } from './analytics';

export class DefaultStrategyFactory implements StrategyFactory {
  createAnalyticsStrategy(tier: string): AbstractStrategy {
    switch (tier) {
      case 'enterprise':
        return new SentimentAnalysisStrategy();
      case 'professional':
        return new CompetitorBenchmarkingStrategy();
      case 'starter':
      default:
        return new SentimentAnalysisStrategy();
    }
  }
}

export const strategyFactory = new DefaultStrategyFactory();

export async function executeStrategy(
  strategy: AbstractStrategy,
  context: StrategyContext
): Promise<StrategyResult> {
  return strategy.execute(context);
}
