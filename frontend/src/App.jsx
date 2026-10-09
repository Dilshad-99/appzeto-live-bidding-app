import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { WalletProvider } from './context/WalletContext';
import { SocketProvider } from './context/SocketContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';

import { Marketplace } from './pages/Marketplace';
import { AuctionDetail } from './pages/AuctionDetail';
import { WalletPage } from './pages/WalletPage';
import { CreateAuctionPage } from './pages/CreateAuctionPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { FaqPage } from './pages/FaqPage';
import { AboutPage } from './pages/AboutPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WalletProvider>
          <SocketProvider>
            <div className="flex flex-col min-h-screen bg-[#F5F6F8] text-[#191919]">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Marketplace />} />
                  <Route path="/auctions/:id" element={<AuctionDetail />} />
                  <Route path="/wallet" element={<WalletPage />} />
                  <Route path="/create-auction" element={<CreateAuctionPage />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/faq" element={<FaqPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                </Routes>
              </main>
              <Footer />
              <Toast />
            </div>
          </SocketProvider>
        </WalletProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
