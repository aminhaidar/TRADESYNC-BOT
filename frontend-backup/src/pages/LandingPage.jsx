import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <>
      {/* Header */}
      <header className="bg-gray-900 py-4">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center">
            <i className="fas fa-robot text-[var(--color-primary)] text-2xl"></i>
            <span className="ml-2 text-xl font-semibold text-white">TradeSync Bot</span>
          </div>
          <div>
            <Link
              to="/dashboard"
              className="inline-block px-4 py-2 border border-[var(--color-primary)] text-[var(--color-primary)] rounded hover:bg-[var(--color-primary)] hover:text-white transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-gradient py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            AI-Powered Trading Alerts
          </h1>
          <p className="text-xl text-[var(--color-text-secondary)] mb-10 max-w-3xl mx-auto">
            TradeSync Bot captures, analyzes, and displays real-time market sentiment from trusted Discord trading groups.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/dashboard"
              className="px-8 py-3 bg-[var(--color-primary)] text-white font-medium rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors"
            >
              Get Started
            </Link>
            
              href="#features"
              className="px-8 py-3 border border-[var(--color-border)] text-[var(--color-text-primary)] font-medium rounded-lg hover:bg-[var(--color-card)] transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="feature-card p-6">
              <div className="text-[var(--color-primary)] text-3xl mb-4">
                <i className="fas fa-bolt"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">Real-Time Discord Alerts</h3>
              <p className="text-[var(--color-text-secondary)]">
                Instantly capture trade alerts from trusted Discord channels via webhooks.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="feature-card p-6">
              <div className="text-[var(--color-primary)] text-3xl mb-4">
                <i className="fas fa-brain"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">AI-Powered Analysis</h3>
              <p className="text-[var(--color-text-secondary)]">
                Claude/OpenAI API extracts structured trade data for better decision making.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="feature-card p-6">
              <div className="text-[var(--color-primary)] text-3xl mb-4">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">Market Data Integration</h3>
              <p className="text-[var(--color-text-secondary)]">
                View trade alerts alongside stock data and key market indices.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="feature-card p-6">
              <div className="text-[var(--color-primary)] text-3xl mb-4">
                <i className="fas fa-exchange-alt"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">Paper Trading</h3>
              <p className="text-[var(--color-text-secondary)]">
                Track your portfolio using Alpaca paper trading account integration.
              </p>
            </div>
            
            {/* Feature 5 */}
            <div className="feature-card p-6">
              <div className="text-[var(--color-primary)] text-3xl mb-4">
                <i className="fas fa-bell"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">Real-Time Updates</h3>
              <p className="text-[var(--color-text-secondary)]">
                WebSockets deliver instant updates directly to your dashboard.
              </p>
            </div>
            
            {/* Feature 6 */}
            <div className="feature-card p-6">
              <div className="text-[var(--color-primary)] text-3xl mb-4">
                <i className="fas fa-mobile-alt"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">Responsive Design</h3>
              <p className="text-[var(--color-text-secondary)]">
                Access your trading dashboard from any device, anywhere.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 hero-gradient">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Enhance Your Trading?</h2>
          <p className="text-xl text-[var(--color-text-secondary)] mb-10 max-w-3xl mx-auto">
            Sign up now and get access to real-time trade alerts, AI analysis, and market data.
          </p>
          <Link
            to="/dashboard"
            className="px-8 py-3 bg-[var(--color-primary)] text-white font-medium rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors"
          >
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center">
                <i className="fas fa-robot text-[var(--color-primary)] text-2xl"></i>
                <span className="ml-2 text-xl font-semibold text-white">TradeSync Bot</span>
              </div>
              <p className="text-[var(--color-text-secondary)] mt-2">AI-Powered Trading Alerts</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors">
                <i className="fab fa-twitter text-xl"></i>
              </a>
              <a href="#" className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors">
                <i className="fab fa-github text-xl"></i>
              </a>
              <a href="#" className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors">
                <i className="fab fa-discord text-xl"></i>
              </a>
            </div>
          </div>
          <div className="border-t border-[var(--color-border)] mt-8 pt-8 text-center text-[var(--color-text-secondary)] text-sm">
            <p>© 2025 TradeSync Bot. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default LandingPage;