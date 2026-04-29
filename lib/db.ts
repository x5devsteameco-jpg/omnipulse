import fs from 'fs';
import path from 'path';

const DATA_DIR = '/tmp/aeg-data';
const CLIENTS_FILE = path.join(DATA_DIR, 'clients.json');
const ACCOUNTS_FILE = path.join(DATA_DIR, 'accounts.json');
const METRICS_FILE = path.join(DATA_DIR, 'metrics.json');
const TRENDS_FILE = path.join(DATA_DIR, 'trends.json');
const GAPS_FILE = path.join(DATA_DIR, 'gaps.json');
const PREDICTIONS_FILE = path.join(DATA_DIR, 'predictions.json');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJson<T>(file: string, defaultValue: T): T {
  ensureDir();
  if (!fs.existsSync(file)) return defaultValue;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch { return defaultValue; }
}

function writeJson(file: string, data: unknown) {
  ensureDir();
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export const db = {
  getClients: () => readJson<any[]>(CLIENTS_FILE, []),
  getClient: (id: string) => db.getClients().find(c => c.id === id),
  createClient: (client: any) => {
    const clients = db.getClients();
    const newClient = { ...client, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    clients.push(newClient);
    writeJson(CLIENTS_FILE, clients);
    return newClient;
  },

  getAccounts: (clientId?: string) => {
    const accounts = readJson<any[]>(ACCOUNTS_FILE, []);
    return clientId ? accounts.filter(a => a.clientId === clientId) : accounts;
  },
  getAccount: (id: string) => db.getAccounts().find(a => a.id === id),
  createAccount: (account: any) => {
    const accounts = db.getAccounts();
    const newAccount = { ...account, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    accounts.push(newAccount);
    writeJson(ACCOUNTS_FILE, accounts);
    return newAccount;
  },
  updateAccount: (id: string, updates: any) => {
    const accounts = readJson<any[]>(ACCOUNTS_FILE, []);
    const idx = accounts.findIndex(a => a.id === id);
    if (idx >= 0) {
      accounts[idx] = { ...accounts[idx], ...updates, updatedAt: new Date().toISOString() };
      writeJson(ACCOUNTS_FILE, accounts);
      return accounts[idx];
    }
    return null;
  },
  deleteAccount: (id: string) => {
    const accounts = db.getAccounts().filter(a => a.id !== id);
    writeJson(ACCOUNTS_FILE, accounts);
    return true;
  },

  getMetrics: (accountId: string) => {
    const all = readJson<any[]>(METRICS_FILE, []);
    return all.filter(m => m.accountId === accountId).sort((a, b) =>
      new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime()
    );
  },
  createMetric: (metric: any) => {
    const metrics = readJson<any[]>(METRICS_FILE, []);
    const newMetric = { ...metric, id: generateId(), capturedAt: new Date().toISOString() };
    metrics.push(newMetric);
    writeJson(METRICS_FILE, metrics);
    return newMetric;
  },

  getTrends: (accountId: string) => {
    const all = readJson<any[]>(TRENDS_FILE, []);
    return all.filter(t => t.accountId === accountId).sort((a, b) =>
      new Date(b.periodStart).getTime() - new Date(a.periodStart).getTime()
    );
  },
  createTrend: (trend: any) => {
    const trends = readJson<any[]>(TRENDS_FILE, []);
    const newTrend = { ...trend, id: generateId(), createdAt: new Date().toISOString() };
    trends.push(newTrend);
    writeJson(TRENDS_FILE, trends);
    return newTrend;
  },

  getGaps: (clientId: string) => {
    const all = readJson<any[]>(GAPS_FILE, []);
    return all.filter(g => g.clientId === clientId).sort((a, b) =>
      new Date(b.identifiedAt).getTime() - new Date(a.identifiedAt).getTime()
    );
  },
  createGap: (gap: any) => {
    const gaps = readJson<any[]>(GAPS_FILE, []);
    const newGap = { ...gap, id: generateId(), identifiedAt: new Date().toISOString(), status: gap.status || 'open' };
    gaps.push(newGap);
    writeJson(GAPS_FILE, gaps);
    return newGap;
  },
  updateGap: (id: string, updates: any) => {
    const gaps = readJson<any[]>(GAPS_FILE, []);
    const idx = gaps.findIndex(g => g.id === id);
    if (idx >= 0) {
      gaps[idx] = { ...gaps[idx], ...updates, updatedAt: new Date().toISOString() };
      if (updates.status === 'resolved') gaps[idx].resolvedAt = new Date().toISOString();
      writeJson(GAPS_FILE, gaps);
      return gaps[idx];
    }
    return null;
  },

  getPredictions: (accountId: string) => {
    const all = readJson<any[]>(PREDICTIONS_FILE, []);
    return all.filter(p => p.accountId === accountId).sort((a, b) =>
      new Date(b.predictedAt).getTime() - new Date(a.predictedAt).getTime()
    );
  },
  createPrediction: (pred: any) => {
    const preds = readJson<any[]>(PREDICTIONS_FILE, []);
    const newPred = { ...pred, id: generateId(), predictedAt: new Date().toISOString() };
    preds.push(newPred);
    writeJson(PREDICTIONS_FILE, preds);
    return newPred;
  },
};