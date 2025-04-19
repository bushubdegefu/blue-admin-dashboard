
import React, { Component, ErrorInfo } from 'react';
import { Button } from '@/components/ui/button';
import { ShieldAlert, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo
    });
    
    // You could log the error to an error reporting service here
    console.error("Uncaught error:", error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 text-center">
          <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <ShieldAlert className="h-8 w-8 text-red-500" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-red-600">Something went wrong</h2>
            <p className="mb-6 text-gray-600">
              An unexpected error has occurred. Our team has been notified.
            </p>
            
            <div className="mb-6 overflow-auto max-h-32 p-2 bg-gray-100 rounded text-left text-xs text-gray-800">
              <p className="font-medium">{this.state.error?.toString()}</p>
              {this.state.errorInfo && (
                <pre className="mt-2 text-gray-600">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>
            
            <div className="flex justify-center space-x-2">
              <Button onClick={this.handleRetry} className="flex items-center space-x-1">
                <RefreshCw className="h-4 w-4" />
                <span>Try again</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/'}
              >
                Go to homepage
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
