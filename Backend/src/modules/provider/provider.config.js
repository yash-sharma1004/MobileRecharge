/**
 * Telecom / utility provider profiles — drives processing delay and outcome weights.
 * Outcomes are derived deterministically from recharge id + operator (not frontend RNG).
 */
export const PROVIDER_PROFILES = {
  jio: {
    displayName: 'Jio',
    aliases: ['jio', 'reliance jio'],
    category: 'mobile',
    successWeight: 92,
    failWeight: 5,
    timeoutWeight: 2,
    pendingWeight: 1,
    delayMs: [5000, 14000]
  },
  airtel: {
    displayName: 'Airtel',
    aliases: ['airtel', 'bharti airtel'],
    category: 'mobile',
    successWeight: 90,
    failWeight: 6,
    timeoutWeight: 3,
    pendingWeight: 1,
    delayMs: [4000, 13000]
  },
  vi: {
    displayName: 'Vi',
    aliases: ['vi', 'vodafone', 'idea'],
    category: 'mobile',
    successWeight: 88,
    failWeight: 8,
    timeoutWeight: 3,
    pendingWeight: 1,
    delayMs: [5000, 15000]
  },
  bsnl: {
    displayName: 'BSNL',
    aliases: ['bsnl'],
    category: 'mobile',
    successWeight: 82,
    failWeight: 10,
    timeoutWeight: 6,
    pendingWeight: 2,
    delayMs: [6000, 15000]
  },
  broadband: {
    displayName: 'Broadband',
    aliases: ['broadband', 'act', 'hathway', 'spectra', 'excitel'],
    category: 'broadband',
    successWeight: 85,
    failWeight: 9,
    timeoutWeight: 4,
    pendingWeight: 2,
    delayMs: [7000, 15000]
  },
  electricity: {
    displayName: 'Electricity',
    aliases: ['electricity', 'bescom', 'tata power', 'adani', 'mseb', 'uppcl'],
    category: 'utility',
    successWeight: 87,
    failWeight: 8,
    timeoutWeight: 4,
    pendingWeight: 1,
    delayMs: [8000, 15000]
  },
  default: {
    displayName: 'Generic Provider',
    aliases: [],
    category: 'mobile',
    successWeight: 85,
    failWeight: 10,
    timeoutWeight: 4,
    pendingWeight: 1,
    delayMs: [3000, 12000]
  }
};

export const FAILURE_MESSAGES = {
  FAILED: [
    'Operator gateway rejected the request',
    'Invalid plan for selected operator',
    'Subscriber number not active on network',
    'Provider maintenance window — try again later'
  ],
  TIMEOUT: [
    'Operator network timeout',
    'No response from provider within SLA',
    'Upstream gateway timed out'
  ],
  PENDING: [
    'Recharge queued at operator',
    'Operator processing delay',
    'High traffic — recharge in queue'
  ]
};

export const resolveProviderKey = (operatorName = '') => {
  const normalized = operatorName.toLowerCase().trim();
  for (const [key, profile] of Object.entries(PROVIDER_PROFILES)) {
    if (key === 'default') continue;
    if (profile.aliases.some((a) => normalized.includes(a)) || normalized.includes(key)) {
      return key;
    }
  }
  return 'default';
};
