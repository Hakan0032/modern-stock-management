import React, { useState, useEffect } from 'react';
import { errorLogger } from '../utils/errorHandler';

interface DebugOverlayProps {
  enabled?: boolean;
}

const DebugOverlay: React.FC<DebugOverlayProps> = ({ enabled = process.env.NODE_ENV === 'development' }) => {
  const [errors, setErrors] = useState<any[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);

  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      const currentErrors = errorLogger.getErrors();
      setErrors(currentErrors);
    }, 1000);

    return () => clearInterval(interval);
  }, [enabled]);

  useEffect(() => {
    if (errors.length > 0 && !isVisible) {
      setIsVisible(true);
    }
  }, [errors.length]);

  if (!enabled || !isVisible) {
    return null;
  }

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 999999,
        backgroundColor: '#1a1a1a',
        color: 'white',
        borderRadius: '8px',
        border: '2px solid #ff6b6b',
        fontFamily: 'monospace',
        fontSize: '12px',
        maxWidth: isMinimized ? '300px' : '600px',
        maxHeight: isMinimized ? '100px' : '400px',
        overflow: 'auto',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
      }}
    >
      <div 
        style={{
          padding: '10px',
          backgroundColor: '#ff6b6b',
          color: 'white',
          fontWeight: 'bold',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <span>🚨 React Error #31 Debug ({errors.length})</span>
        <span>{isMinimized ? '▲' : '▼'}</span>
      </div>
      
      {!isMinimized && (
        <div style={{ padding: '10px' }}>
          <div style={{ marginBottom: '10px' }}>
            <button
              onClick={() => {
                errorLogger.clearErrors();
                setErrors([]);
                setIsVisible(false);
              }}
              style={{
                backgroundColor: '#4ecdc4',
                color: 'white',
                border: 'none',
                padding: '5px 10px',
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              Clear
            </button>
            <button
              onClick={() => setIsVisible(false)}
              style={{
                backgroundColor: '#666',
                color: 'white',
                border: 'none',
                padding: '5px 10px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Hide
            </button>
          </div>
          
          {errors.length === 0 ? (
            <div style={{ color: '#888' }}>No object rendering errors detected</div>
          ) : (
            <div style={{ maxHeight: '300px', overflow: 'auto' }}>
              {errors.map((error, index) => (
                <div 
                  key={index} 
                  style={{
                    marginBottom: '15px',
                    padding: '10px',
                    backgroundColor: '#333',
                    borderRadius: '4px',
                    borderLeft: '4px solid #ff6b6b'
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                    {error.component || 'Unknown Component'}
                  </div>
                  <div style={{ marginBottom: '5px', fontSize: '11px', color: '#ccc' }}>
                    {new Date(error.timestamp).toLocaleTimeString()}
                  </div>
                  <div style={{ marginBottom: '5px' }}>
                    <strong>Object:</strong>
                  </div>
                  <pre style={{
                    backgroundColor: '#222',
                    padding: '5px',
                    borderRadius: '2px',
                    overflow: 'auto',
                    maxHeight: '100px',
                    fontSize: '10px'
                  }}>
                    {JSON.stringify(error.object, null, 2)}
                  </pre>
                  {error.stack && (
                    <details style={{ marginTop: '5px' }}>
                      <summary style={{ cursor: 'pointer', color: '#4ecdc4' }}>Stack Trace</summary>
                      <pre style={{
                        backgroundColor: '#222',
                        padding: '5px',
                        borderRadius: '2px',
                        overflow: 'auto',
                        maxHeight: '100px',
                        fontSize: '10px',
                        marginTop: '5px'
                      }}>
                        {error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DebugOverlay;