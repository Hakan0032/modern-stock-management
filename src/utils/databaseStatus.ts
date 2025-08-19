import React from 'react';
import { supabase } from '../lib/supabase';

export interface DatabaseStatus {
  isConnected: boolean;
  message: string;
  lastChecked: Date;
  responseTime?: number;
}

export const checkDatabaseConnection = async (): Promise<DatabaseStatus> => {
  const startTime = Date.now();
  
  try {
    // Basit bir sorgu ile bağlantıyı test et
    const { data, error } = await supabase
      .from('materials')
      .select('id')
      .limit(1);
    
    const responseTime = Date.now() - startTime;
    
    if (error) {
      console.error('Database connection error:', error);
      return {
        isConnected: false,
        message: `Bağlantı hatası: ${error.message}`,
        lastChecked: new Date(),
        responseTime
      };
    }
    
    return {
      isConnected: true,
      message: 'Veritabanına başarıyla bağlandı',
      lastChecked: new Date(),
      responseTime
    };
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    console.error('Database connection failed:', error);
    
    return {
      isConnected: false,
      message: `Bağlantı başarısız: ${error.message || 'Bilinmeyen hata'}`,
      lastChecked: new Date(),
      responseTime
    };
  }
};

// Gerçek zamanlı bağlantı durumu için hook
export const useDatabaseStatus = () => {
  const [status, setStatus] = React.useState<DatabaseStatus>({
    isConnected: false,
    message: 'Kontrol ediliyor...',
    lastChecked: new Date()
  });
  const [isChecking, setIsChecking] = React.useState(false);
  
  const checkStatus = async () => {
    setIsChecking(true);
    try {
      const newStatus = await checkDatabaseConnection();
      setStatus(newStatus);
    } catch (error) {
      setStatus({
        isConnected: false,
        message: 'Bağlantı kontrolü başarısız',
        lastChecked: new Date()
      });
    } finally {
      setIsChecking(false);
    }
  };
  
  React.useEffect(() => {
    checkStatus();
    
    // Her 30 saniyede bir otomatik kontrol
    const interval = setInterval(checkStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  return { status, isChecking, checkStatus };
};