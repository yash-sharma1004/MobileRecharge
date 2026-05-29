import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import api from '../utils/api';

const WalletContext = createContext();

export const useWallet = () => useContext(WalletContext);

export const WalletProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletHistory, setWalletHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const socket = useSocket();

  const fetchWallet = useCallback(async () => {
    if (!isAuthenticated) {
      setWalletBalance(0);
      setWalletHistory([]);
      return;
    }
    try {
      setLoading(true);
      const [balanceRes, txnRes] = await Promise.all([
        api.get('/wallet'),
        api.get('/wallet/transactions')
      ]);
      setWalletBalance(balanceRes.data?.balance || 0);
      setWalletHistory(txnRes.data || []);
    } catch (err) {
      console.error('Failed to fetch wallet data:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  useEffect(() => {
    if (!socket) return;

    const onWalletUpdated = (payload) => {
      if (typeof payload.balance === 'number') {
        setWalletBalance(payload.balance);
      }
      fetchWallet();
    };

    const onPaymentStatus = () => {
      fetchWallet();
    };

    socket.on('wallet_updated', onWalletUpdated);
    socket.on('payment_status', onPaymentStatus);
    return () => {
      socket.off('wallet_updated', onWalletUpdated);
      socket.off('payment_status', onPaymentStatus);
    };
  }, [socket, fetchWallet]);

  const addCashback = useCallback((amount) => {
    setWalletBalance((prev) => prev + amount);
  }, []);

  const deductWallet = useCallback((amount) => {
    setWalletBalance((prev) => prev - amount);
  }, []);

  const createTopUpOrder = useCallback(async (amount) => {
    try {
      setLoading(true);
      const res = await api.post('/payment/create-order', { amount: Number(amount) });
      return res;
    } catch (err) {
      console.error('Failed to create top-up order:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyTopUpPayment = useCallback(
    async (verificationPayload) => {
      try {
        setLoading(true);
        const res = await api.post('/payment/verify', verificationPayload);
        await fetchWallet();
        return res;
      } catch (err) {
        console.error('Failed to verify top-up payment:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchWallet]
  );

  return (
    <WalletContext.Provider
      value={{
        walletBalance,
        walletHistory,
        addCashback,
        deductWallet,
        createTopUpOrder,
        verifyTopUpPayment,
        loading,
        refetchWallet: fetchWallet
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
