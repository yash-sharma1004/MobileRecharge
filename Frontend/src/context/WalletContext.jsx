import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../utils/api';

const WalletContext = createContext();

export const useWallet = () => useContext(WalletContext);

export const WalletProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletHistory, setWalletHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch wallet data from backend
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

  // Optimistic update for cashback (actual credit happens server-side during recharge)
  const addCashback = useCallback((amount) => {
    setWalletBalance(prev => prev + amount);
    setWalletHistory(prev => [{
      _id: Date.now().toString(),
      type: 'CASHBACK',
      amount,
      createdAt: new Date().toISOString()
    }, ...prev]);
  }, []);

  // Optimistic update for wallet deduction (actual deduction happens server-side)
  const deductWallet = useCallback((amount) => {
    setWalletBalance(prev => prev - amount);
    setWalletHistory(prev => [{
      _id: Date.now().toString(),
      type: 'RECHARGE',
      amount,
      createdAt: new Date().toISOString()
    }, ...prev]);
  }, []);

  // Create a payment order on the backend
  const createTopUpOrder = useCallback(async (amount) => {
    try {
      setLoading(true);
      const res = await api.post('/wallet/create-order', { amount: Number(amount) });
      return res;
    } catch (err) {
      console.error('Failed to create top-up order:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Verify a payment order on the backend
  const verifyTopUpPayment = useCallback(async (orderId, paymentMethod) => {
    try {
      setLoading(true);
      const res = await api.post('/wallet/verify-payment', { orderId, paymentMethod });
      await fetchWallet();
      return res;
    } catch (err) {
      console.error('Failed to verify top-up payment:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchWallet]);

  return (
    <WalletContext.Provider value={{ 
      walletBalance, walletHistory, addCashback, deductWallet, 
      createTopUpOrder, verifyTopUpPayment,
      loading, refetchWallet: fetchWallet 
    }}>
      {children}
    </WalletContext.Provider>
  );
};
