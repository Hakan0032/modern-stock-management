import { Router } from 'express';
import { Request, Response } from 'express';

const router = Router();

interface SettingsData {
  notifications: {
    email: boolean;
    push: boolean;
    stockAlerts: boolean;
    workOrderUpdates: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    language: 'tr' | 'en';
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
  };
}

// In-memory storage for demo purposes
// In a real app, this would be stored in a database
let userSettings: { [userId: string]: SettingsData } = {};

// Get user settings
router.get('/', (req: Request, res: Response) => {
  try {
    const userId = req.headers['user-id'] as string || 'default';
    
    // Return default settings if user settings don't exist
    const defaultSettings: SettingsData = {
      notifications: {
        email: true,
        push: true,
        stockAlerts: true,
        workOrderUpdates: true
      },
      appearance: {
        theme: 'light',
        language: 'tr'
      },
      security: {
        twoFactorAuth: false,
        sessionTimeout: 30
      }
    };

    const settings = userSettings[userId] || defaultSettings;
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({
      success: false,
      message: 'Ayarlar yüklenirken hata oluştu'
    });
  }
});

// Update user settings
router.put('/', (req: Request, res: Response) => {
  try {
    const userId = req.headers['user-id'] as string || 'default';
    const settings: SettingsData = req.body;

    // Validate settings structure
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz ayar verisi'
      });
    }

    // Validate required fields
    if (!settings.notifications || !settings.appearance || !settings.security) {
      return res.status(400).json({
        success: false,
        message: 'Eksik ayar alanları'
      });
    }

    // Validate theme value
    if (!['light', 'dark', 'system'].includes(settings.appearance.theme)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz tema değeri'
      });
    }

    // Validate language value
    if (!['tr', 'en'].includes(settings.appearance.language)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz dil değeri'
      });
    }

    // Validate session timeout
    if (![15, 30, 60, 120, 480].includes(settings.security.sessionTimeout)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz oturum zaman aşımı değeri'
      });
    }

    // Save settings
    userSettings[userId] = settings;

    // Simulate some processing time
    setTimeout(() => {
      res.json({
        success: true,
        message: 'Ayarlar başarıyla kaydedildi',
        data: settings
      });
    }, 500);

  } catch (error) {
    console.error('Error saving settings:', error);
    res.status(500).json({
      success: false,
      message: 'Ayarlar kaydedilirken hata oluştu'
    });
  }
});

// Reset settings to default
router.delete('/', (req: Request, res: Response) => {
  try {
    const userId = req.headers['user-id'] as string || 'default';
    
    // Remove user settings (will fall back to defaults)
    delete userSettings[userId];
    
    res.json({
      success: true,
      message: 'Ayarlar varsayılan değerlere sıfırlandı'
    });
  } catch (error) {
    console.error('Error resetting settings:', error);
    res.status(500).json({
      success: false,
      message: 'Ayarlar sıfırlanırken hata oluştu'
    });
  }
});

export default router;