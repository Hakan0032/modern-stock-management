// Global error handler for React error #31 debugging

interface ObjectRenderError {
  type: 'object-render';
  object: any;
  component?: string;
  stack?: string;
  timestamp: number;
}

class ErrorLogger {
  private errors: ObjectRenderError[] = [];
  private maxErrors = 50;

  logObjectRenderError(object: any, component?: string, stack?: string) {
    const error: ObjectRenderError = {
      type: 'object-render',
      object: this.serializeObject(object),
      component,
      stack,
      timestamp: Date.now()
    };

    this.errors.unshift(error);
    if (this.errors.length > this.maxErrors) {
      this.errors.pop();
    }

    // Log to console with detailed information
    console.error('🚨 React Error #31 - Object Render Detected:', {
      object,
      component,
      stack,
      serialized: error.object
    });

    // Show development overlay if in development
    if (process.env.NODE_ENV === 'development') {
      this.showErrorOverlay(error);
    }
  }

  private serializeObject(obj: any): any {
    try {
      return JSON.parse(JSON.stringify(obj, (key, value) => {
        if (value instanceof Error) {
          return {
            name: value.name,
            message: value.message,
            stack: value.stack
          };
        }
        if (value instanceof Date) {
          return { __date: value.toISOString() };
        }
        if (typeof value === 'function') {
          return { __function: value.toString() };
        }
        return value;
      }));
    } catch (e) {
      return { __serialization_error: String(obj) };
    }
  }

  private showErrorOverlay(error: ObjectRenderError) {
    // Create overlay element
    const overlay = document.createElement('div');
    overlay.id = 'react-error-31-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      z-index: 999999;
      padding: 20px;
      font-family: monospace;
      font-size: 14px;
      overflow: auto;
      box-sizing: border-box;
    `;

    overlay.innerHTML = `
      <div style="max-width: 800px; margin: 0 auto;">
        <h2 style="color: #ff6b6b; margin-bottom: 20px;">🚨 React Error #31 - Object Render Detected</h2>
        <div style="margin-bottom: 15px;">
          <strong>Component:</strong> ${error.component || 'Unknown'}
        </div>
        <div style="margin-bottom: 15px;">
          <strong>Timestamp:</strong> ${new Date(error.timestamp).toLocaleString()}
        </div>
        <div style="margin-bottom: 15px;">
          <strong>Object being rendered:</strong>
          <pre style="background: #333; padding: 10px; border-radius: 4px; overflow: auto;">${JSON.stringify(error.object, null, 2)}</pre>
        </div>
        ${error.stack ? `
          <div style="margin-bottom: 15px;">
            <strong>Stack trace:</strong>
            <pre style="background: #333; padding: 10px; border-radius: 4px; overflow: auto; font-size: 12px;">${error.stack}</pre>
          </div>
        ` : ''}
        <button onclick="document.getElementById('react-error-31-overlay').remove()" 
                style="background: #ff6b6b; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin-right: 10px;">
          Close
        </button>
        <button onclick="window.location.reload()" 
                style="background: #4ecdc4; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">
          Reload Page
        </button>
      </div>
    `;

    // Remove existing overlay if present
    const existing = document.getElementById('react-error-31-overlay');
    if (existing) {
      existing.remove();
    }

    document.body.appendChild(overlay);
  }

  getErrors(): ObjectRenderError[] {
    return [...this.errors];
  }

  clearErrors() {
    this.errors = [];
  }
}

// Global instance
export const errorLogger = new ErrorLogger();

// Global error handler for unhandled errors
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (event.error && event.error.message && event.error.message.includes('Objects are not valid as a React child')) {
      errorLogger.logObjectRenderError(
        { error: event.error.message },
        'Unknown Component',
        event.error.stack
      );
    }
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && typeof event.reason === 'object') {
      errorLogger.logObjectRenderError(
        event.reason,
        'Promise Rejection',
        event.reason.stack
      );
    }
  });
}

// Helper function to safely render any value
export function safeRender(value: any, fallback: string = ''): string {
  if (value === null || value === undefined) {
    return fallback;
  }
  
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  
  if (value instanceof Date) {
    return value.toLocaleDateString();
  }
  
  if (typeof value === 'object') {
    // Log the object render attempt
    errorLogger.logObjectRenderError(value, 'safeRender function');
    
    // Try to extract meaningful string representation
    if (value.message) return String(value.message);
    if (value.name) return String(value.name);
    if (value.toString && typeof value.toString === 'function') {
      try {
        const str = value.toString();
        if (str !== '[object Object]') return str;
      } catch (e) {
        // Ignore toString errors
      }
    }
    
    return fallback || JSON.stringify(value);
  }
  
  return String(value);
}