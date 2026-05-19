import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import api from '../utils/api';

const HistoryContext = createContext();

export const useHistory = () => useContext(HistoryContext);

export const HistoryProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [rechargeHistory, setRechargeHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch history from backend when authenticated
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
    if (socket) {
      const handleStatusUpdate = (update) => {
        setRechargeHistory(prev => prev.map(record => 
          (record._id === update.rechargeId || record.id === update.rechargeId)
            ? { ...record, status: update.status, failureReason: update.reason || record.failureReason }
            : record
        ));
      };

      socket.on('recharge_status', handleStatusUpdate);
      return () => socket.off('recharge_status', handleStatusUpdate);
    }
  }, [socket]);

  // Add a recharge record via API (called after successful recharge)
  const addRechargeRecord = useCallback((record) => {
    // Optimistically update local state (the recharge was already created server-side)
    setRechargeHistory(prev => [record, ...prev]);
  }, []);

  return (
    <HistoryContext.Provider value={{ rechargeHistory, addRechargeRecord, loading, refetchHistory: fetchHistory }}>
      {children}
    </HistoryContext.Provider>
  );
};
