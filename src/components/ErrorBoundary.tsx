import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { validateForReactRender, safeText } from '../utils/safeRender';
import { errorLogger } from '../utils/errorHandler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Generate unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Check if this is specifically React error #31 (object rendering)
    const isObjectRenderingError = error.message.includes('Objects are not valid as a React child') ||
                                  error.message.includes('object with keys') ||
                                  error.name === 'Invariant Violation';
    
    console.error('🚨 ErrorBoundary: React Error caught:', {
      errorId,
      message: error.message,
      stack: error.stack,
      name: error.name,
      isObjectRenderingError,
      timestamp: new Date().toISOString()
    });
    
    // If it's an object rendering error, provide more specific logging
    if (isObjectRenderingError) {
      console.error('🚨 REACT ERROR #31 DETECTED: Object rendering issue');
      console.error('This error occurs when an object is passed as a React child instead of a primitive value');
      
      // Log to our custom error handler
      errorLogger.logObjectRenderError(
        { error: error.message, name: error.name },
        'ErrorBoundary',
        error.stack
      );
    }
    
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorBoundary: this.constructor.name,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    console.error('🚨 ErrorBoundary: Detailed error info:', errorDetails);
    
    // Call custom error handler if provided
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (handlerError) {
        console.error('Error in custom error handler:', handlerError);
      }
    }
    
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    console.log('🔄 ErrorBoundary: Resetting error state');
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      errorId: undefined 
    });
  };
  
  handleReload = () => {
    console.log('🔄 ErrorBoundary: Reloading page');
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 text-red-500">
              <AlertTriangle className="w-full h-full" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Bir hata oluştu
            </h2>
            <p className="text-gray-600 mb-6">
              {this.state.error?.message?.includes('Objects are not valid as a React child') || 
               this.state.error?.message?.includes('object with keys') ? (
                'Bir veri görüntüleme hatası oluştu. Bu genellikle geçici bir sorundur.'
              ) : (
                'Bu bileşen yüklenirken beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.'
              )}
            </p>
            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Tekrar Dene</span>
              </button>
              <button
                onClick={this.handleReload}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Sayfayı Yenile
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Hata Detayları (Geliştirici Modu)
                </summary>
                <div className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-60">
                  <div className="mb-2">
                    <strong>Error ID:</strong> {safeText(this.state.errorId)}
                  </div>
                  <div className="mb-2">
                    <strong>Error Message:</strong> {safeText(this.state.error?.message)}
                  </div>
                  <div className="mb-2">
                    <strong>Error Name:</strong> {safeText(this.state.error?.name)}
                  </div>
                  {(this.state.error?.message?.includes('Objects are not valid as a React child') || 
                    this.state.error?.message?.includes('object with keys')) && (
                    <div className="mb-2 p-2 bg-red-50 rounded">
                      <strong className="text-red-700">React Error #31 Detected:</strong>
                      <p className="text-red-600 text-xs mt-1">
                        This error occurs when an object is accidentally rendered as a React child. 
                        The application has been updated with safer rendering patterns.
                      </p>
                    </div>
                  )}
                  {this.state.error.stack && (
                    <div className="mb-2">
                      <strong>Stack Trace:</strong>
                      <pre className="mt-1 whitespace-pre-wrap">{this.state.error.stack}</pre>
                    </div>
                  )}
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;