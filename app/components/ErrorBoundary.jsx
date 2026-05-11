'use client';
import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#111111] p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Something went wrong
            </h2>
            <p className="text-slate-500 dark:text-[#fbfbfb] mb-6">
              Please refresh the page to continue
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[#5b4cdb] text-white font-bold rounded-xl hover:bg-[#4a3dc4]"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
