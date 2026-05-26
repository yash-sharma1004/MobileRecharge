import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import api from '../utils/api';

const HistoryContext = createContext();

export const useHistory = () => useContext(HistoryContext);

const TERMINAL_STATUSES = [
  'RECHARGE_SUCCESS',
  'RECHARGE_FAILED',
  'REFUNDED',
  'SUCCESS',
  'FAILED'
];

export const HistoryProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [rechargeHistory, setRechargeHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!isAuthenticated) {
      setRechargeHistory([]);
      return;
    }
    try {
      setLoading(true);
      const data = await api.get('/recharges');
      setRechargeHistory(data.data || []);
    } catch (err) {
      console.error('Failed to fetch recharge history:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleStatusUpdate = (update) => {
      setRechargeHistory((prev) =>
        prev.map((record) => {
          const id = record._id || record.id;
          if (id !== update.rechargeId && id?.toString() !== update.rechargeId?.toString()) {
            return record;
          }
          return {
            ...record,
            status: update.status,
            failureReason: update.reason || update.failureReason || record.failureReason,
            providerResponse: update.providerResponse || record.providerResponse,
            cashbackEarned: update.cashback ?? record.cashbackEarned,
            rechargeId: update.rechargeIdRef || record.rechargeId
          };
        })
      );

      if (TERMINAL_STATUSES.includes(update.status)) {
        fetchHistory();
      }
    };

    socket.on('recharge_status', handleStatusUpdate);
    return () => socket.off('recharge_status', handleStatusUpdate);
  }, [socket, fetchHistory]);

  const addRechargeRecord = useCallback((record) => {
    setRechargeHistory((prev) => [record, ...prev]);
  }, []);

  return (
    <HistoryContext.Provider
      value={{ rechargeHistory, addRechargeRecord, loading, refetchHistory: fetchHistory }}
    >
      {children}
    </HistoryContext.Provider>
  );
};
