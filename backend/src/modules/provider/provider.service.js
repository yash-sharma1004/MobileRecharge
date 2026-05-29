import crypto from 'crypto';
import { Recharge } from '../recharge/recharge.model.js';
import { emitToUser } from '../../config/socket.js';
import {
  PROVIDER_PROFILES,
  FAILURE_MESSAGES,
  resolveProviderKey
} from './provider.config.js';
import * as rechargeLifecycle from '../recharge/recharge.lifecycle.js';

const hashSeed = (input) => {
  const hash = crypto.createHash('sha256').update(String(input)).digest('hex');
  return parseInt(hash.substring(0, 8), 16) / 0xffffffff;
};

const pickMessage = (type, seed) => {
  const list = FAILURE_MESSAGES[type] || FAILURE_MESSAGES.FAILED;
  return list[Math.floor(seed * list.length) % list.length];
};

const computeDelay = (profile, seed) => {
  const [min, max] = profile.delayMs;
  const clamped = Math.max(3000, Math.min(15000, min + Math.floor(seed * (max - min + 1))));
  return clamped;
};

/**
 * Deterministic provider outcome from recharge id + operator profile weights.
 */
export const resolveProviderOutcome = (recharge) => {
  const providerKey = resolveProviderKey(recharge.operator);
  const profile = PROVIDER_PROFILES[providerKey] || PROVIDER_PROFILES.default;
  const seed = hashSeed(`${recharge._id}:${recharge.operator}:${recharge.number}`);

  const total =
    profile.successWeight +
    profile.failWeight +
    profile.timeoutWeight +
    profile.pendingWeight;
  const bucket = seed * total;

  let outcome = 'SUCCESS';
  let cursor = profile.successWeight;
  if (bucket > cursor) {
    outcome = 'FAILED';
    cursor += profile.failWeight;
    if (bucket > cursor) {
      outcome = 'TIMEOUT';
      cursor += profile.timeoutWeight;
      if (bucket > cursor) {
        outcome = 'PENDING';
      }
    }
  }

  const messageSeed = hashSeed(`${recharge._id}:msg`);
  const message =
    outcome === 'SUCCESS'
      ? `${profile.displayName} recharge completed successfully`
      : pickMessage(outcome === 'PENDING' ? 'PENDING' : outcome === 'TIMEOUT' ? 'TIMEOUT' : 'FAILED', messageSeed);

  return {
    outcome,
    message,
    providerKey,
    profile,
    delayMs: computeDelay(profile, hashSeed(`${recharge._id}:delay`)),
    providerRef:
      outcome === 'SUCCESS'
        ? `${profile.displayName.toUpperCase().replace(/\s/g, '')}-${Date.now().toString(36).toUpperCase()}${hashSeed(recharge._id).toString(36).slice(2, 7).toUpperCase()}`
        : null
  };
};

const emitProviderProgress = (userId, recharge, extra = {}) => {
  emitToUser(userId, 'recharge_status', {
    rechargeId: recharge._id,
    status: recharge.status,
    message: extra.message,
    providerResponse: recharge.providerResponse,
    failureReason: recharge.failureReason,
    ...extra
  });
};

/**
 * Async provider processing — 3–15s delay, then lifecycle completion.
 */
export const processRechargeWithProvider = async (rechargeId, userId, hasCoupon = false) => {
  const recharge = await Recharge.findById(rechargeId);
  if (!recharge || recharge.status !== 'RECHARGE_PROCESSING') {
    return;
  }

  const resolved = resolveProviderOutcome(recharge);
  const providerKey = resolved.providerKey;

  recharge.providerResponse = {
    provider: PROVIDER_PROFILES[providerKey]?.displayName || 'Provider',
    status: 'PROCESSING',
    message: 'Contacting operator gateway…',
    startedAt: new Date()
  };
  await recharge.save();

  emitProviderProgress(userId, recharge, {
    message: 'Contacting telecom provider…'
  });

  await new Promise((r) => setTimeout(r, resolved.delayMs));

  const fresh = await Recharge.findById(rechargeId);
  if (!fresh || fresh.status !== 'RECHARGE_PROCESSING') {
    return;
  }

  fresh.providerResponse = {
    ...fresh.providerResponse,
    provider: resolved.profile.displayName,
    status: resolved.outcome,
    message: resolved.message,
    processedAt: new Date(),
    latencyMs: resolved.delayMs
  };

  if (resolved.outcome === 'PENDING') {
    fresh.providerResponse.message = resolved.message;
    await fresh.save();
    emitProviderProgress(userId, fresh, { message: resolved.message });

    await new Promise((r) => setTimeout(r, Math.min(8000, 15000 - resolved.delayMs)));
    const retryFresh = await Recharge.findById(rechargeId);
    if (!retryFresh || retryFresh.status !== 'RECHARGE_PROCESSING') return;

    const retryOutcome = resolveProviderOutcome({
      ...retryFresh.toObject(),
      _id: `${retryFresh._id}:retry`
    });
    resolved.outcome = retryOutcome.outcome === 'PENDING' ? 'SUCCESS' : retryOutcome.outcome;
    resolved.message = retryOutcome.message;
    resolved.providerRef = retryOutcome.providerRef;
    retryFresh.providerResponse = {
      ...retryFresh.providerResponse,
      status: resolved.outcome,
      message: resolved.message,
      retriedAt: new Date()
    };
    await retryFresh.save();
    return rechargeLifecycle.finalizeProviderResult(rechargeId, userId, resolved, hasCoupon);
  }

  await fresh.save();
  return rechargeLifecycle.finalizeProviderResult(rechargeId, userId, resolved, hasCoupon);
};

export const getProviderStatus = () => {
  return Object.entries(PROVIDER_PROFILES)
    .filter(([k]) => k !== 'default')
    .map(([key, p]) => ({
      key,
      name: p.displayName,
      category: p.category,
      availability: p.successWeight >= 90 ? 'HIGH' : p.successWeight >= 85 ? 'MEDIUM' : 'LOW'
    }));
};
