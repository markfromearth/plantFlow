import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-sm border border-slate-200 text-center">
            <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h1>
            <p className="text-slate-600 mb-6">
              {this.state.error?.message || "An unexpected error occurred in this component."}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                Try Again
              </button>
              <Link
                to="/"
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
              >
                <Home className="w-5 h-5" />
                Go Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

