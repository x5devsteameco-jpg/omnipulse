import type { Prediction, Metrics } from './types';

export interface PredictionModel {
  predictFollowers(
    historical: Metrics[],
    periods: number
  ): { value: number; confidence: number };
  predictEngagement(
    historical: Metrics[],
    periods: number
  ): { value: number; confidence: number };
  calculateAccuracy(
    predictions: Prediction[],
    actuals: Metrics[]
  ): number;
}

export interface PredictionResult {
  predictedValue: number;
  predictedRangeLow: number;
  predictedRangeHigh: number;
  confidenceScore: number;
  modelVersion: string;
  trend: 'up' | 'down' | 'stable';
  dailyChangePercent: number;
}

export class SimplePredictionModel implements PredictionModel {
  protected modelVersion = '1.0';

  predictFollowers(historical: Metrics[], periods: number): { value: number; confidence: number } {
    if (historical.length < 2) {
      const last = historical[historical.length - 1]?.followersCount || 0;
      return { value: last, confidence: 0.3 };
    }

    const growthRates: number[] = [];
    for (let i = 1; i < historical.length; i++) {
      const prev = historical[i - 1].followersCount;
      const curr = historical[i].followersCount;
      if (prev > 0) {
        growthRates.push((curr - prev) / prev);
      }
    }

    const avgGrowthRate = growthRates.length > 0
      ? growthRates.reduce((a, b) => a + b, 0) / growthRates.length
      : 0;

    const latestFollowers = historical[historical.length - 1].followersCount;
    const predictedValue = latestFollowers * Math.pow(1 + avgGrowthRate, periods);

    const confidence = this.calculateConfidence(growthRates, historical.length);

    return { value: Math.round(predictedValue), confidence };
  }

  predictEngagement(historical: Metrics[], periods: number): { value: number; confidence: number } {
    if (historical.length < 3) {
      const last = historical[historical.length - 1]?.engagementRate || 0;
      return { value: last, confidence: 0.3 };
    }

    const recentRates = historical.slice(-7).map((m) => m.engagementRate);
    const avgEngagement = recentRates.reduce((a, b) => a + b, 0) / recentRates.length;

    const variance = recentRates.reduce((sum, rate) => sum + Math.pow(rate - avgEngagement, 2), 0) / recentRates.length;
    const stdDev = Math.sqrt(variance);

    const trend = this.calculateTrend(recentRates);
    const predictedValue = avgEngagement + (trend * periods * 0.001);

    const confidence = Math.max(0.1, 1 - (stdDev / (avgEngagement || 1)));

    return { value: Math.max(0, predictedValue), confidence: Math.min(confidence, 0.9) };
  }

  predictReach(historical: Metrics[], periods: number): { value: number; confidence: number } {
    if (historical.length < 2) {
      const last = historical[historical.length - 1]?.viewsCount || 0;
      return { value: last, confidence: 0.3 };
    }

    const recentViews = historical.slice(-14).map((m) => m.viewsCount);
    const avgViews = recentViews.reduce((a, b) => a + b, 0) / recentViews.length;

    const trend = this.calculateTrend(recentViews);
    const predictedValue = avgViews + (trend * periods * avgViews * 0.01);

    const confidence = Math.min(0.85, historical.length / 30);

    return { value: Math.round(predictedValue), confidence };
  }

  calculateAccuracy(predictions: Prediction[], actuals: Metrics[]): number {
    if (predictions.length === 0 || actuals.length === 0) return 0;

    let totalError = 0;
    let count = 0;

    for (const pred of predictions) {
      const actual = actuals.find(
        (a) =>
          new Date(a.followersCount.toString()).getTime() >=
          new Date(pred.predictionPeriodStart).getTime()
      );

      if (actual) {
        const error = Math.abs(pred.predictedValue - actual.followersCount) / actual.followersCount;
        totalError += error;
        count++;
      }
    }

    return count > 0 ? Math.max(0, 1 - totalError / count) : 0;
  }

  private calculateConfidence(growthRates: number[], sampleSize: number): number {
    if (growthRates.length < 2) return 0.3;

    const avg = growthRates.reduce((a, b) => a + b, 0) / growthRates.length;
    const variance =
      growthRates.reduce((sum, rate) => sum + Math.pow(rate - avg, 2), 0) / growthRates.length;
    const stdDev = Math.sqrt(variance);

    const coefficientOfVariation = Math.abs(stdDev / (avg || 1));
    const consistencyScore = Math.max(0, 1 - coefficientOfVariation);

    const sampleScore = Math.min(sampleSize / 14, 1);

    return Math.max(0.3, Math.min(0.95, consistencyScore * 0.6 + sampleScore * 0.4));
  }

  protected calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;

    const n = values.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumX2 += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  }
}

export class MLAwarePredictionModel extends SimplePredictionModel {
  protected modelVersion = '2.0';

  predictFollowers(historical: Metrics[], periods: number): { value: number; confidence: number } {
    const base = super.predictFollowers(historical, periods);

    if (historical.length >= 14) {
      const momentum = this.calculateMomentum(historical);
      const acceleration = this.calculateAcceleration(historical);

      const momentumBoost = momentum * acceleration * periods * 0.01;
      const adjustedValue = base.value * (1 + momentumBoost);

      return {
        value: Math.round(adjustedValue),
        confidence: Math.min(base.confidence * 1.1, 0.98),
      };
    }

    return base;
  }

  private calculateMomentum(historical: Metrics[]): number {
    if (historical.length < 7) return 0;

    const recent = historical.slice(-7);
    const earlier = historical.slice(-14, -7);

    const recentAvg = recent.reduce((s, m) => s + m.followerGrowthRate, 0) / recent.length;
    const earlierAvg = earlier.reduce((s, m) => s + m.followerGrowthRate, 0) / earlier.length;

    return recentAvg - earlierAvg;
  }

  private calculateAcceleration(historical: Metrics[]): number {
    if (historical.length < 14) return 0;

    const growthRates = historical.map((m) => m.followerGrowthRate);
    return this.calculateTrend(growthRates.slice(-7));
  }
}

export function getPredictionModel(useML: boolean = false): PredictionModel {
  return useML ? new MLAwarePredictionModel() : new SimplePredictionModel();
}

export function createPrediction(
  accountId: string,
  platform: string,
  predictionType: Prediction['predictionType'],
  result: PredictionResult,
  periodStart: string,
  periodEnd: string
): Prediction {
  return {
    id: `pred_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    accountId,
    platform,
    predictionType,
    predictedValue: result.predictedValue,
    predictedRangeLow: result.predictedRangeLow,
    predictedRangeHigh: result.predictedRangeHigh,
    confidenceScore: result.confidenceScore,
    modelVersion: '1.0',
    predictionPeriodStart: periodStart,
    predictionPeriodEnd: periodEnd,
    predictedAt: new Date().toISOString(),
  };
}

export function calculatePredictionRange(value: number, confidence: number): { low: number; high: number } {
  const margin = value * (1 - confidence) * 0.5;
  return {
    low: Math.round(value - margin),
    high: Math.round(value + margin),
  };
}
