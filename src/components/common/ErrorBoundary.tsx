
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom error UI
      return this.props.fallback || (
        <Card className="w-full max-w-md mx-auto mt-8 border-red-200">
          <CardHeader className="bg-red-50 border-b border-red-100">
            <CardTitle className="flex items-center text-red-600">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Something went wrong
            </CardTitle>
            <CardDescription className="text-red-500">
              An error occurred in this component
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 pb-4">
            <div className="text-sm text-gray-600 font-mono bg-gray-50 p-3 rounded border overflow-auto max-h-40">
              {this.state.error?.message || "Unknown error"}
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 border-t">
            <Button onClick={this.handleReset} variant="outline" className="flex items-center">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardFooter>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
