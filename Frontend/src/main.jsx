import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { WalletProvider } from './context/WalletContext.jsx'
import { HistoryProvider } from './context/HistoryContext.jsx'

import { SocketProvider } from './context/SocketContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <SocketProvider>
        <HistoryProvider>
          <WalletProvider>
            <App />
          </WalletProvider>
        </HistoryProvider>
      </SocketProvider>
    </AuthProvider>
  </StrictMode>,
)
