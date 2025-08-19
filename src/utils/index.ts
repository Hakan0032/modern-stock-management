import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility function to merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency
export function formatCurrency(amount: number, currency = 'TRY'): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(amount);
}

// Format number
export function formatNumber(num: number, decimals = 0): string {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
}

// Format date
export function formatDate(date: Date | string, format: 'short' | 'long' | 'datetime' = 'short'): string {
  if (!date) return '-';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return '-';
    }
    
    switch (format) {
      case 'long':
        return dateObj.toLocaleDateString('tr-TR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      case 'datetime':
        return dateObj.toLocaleString('tr-TR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      default:
        return dateObj.toLocaleDateString('tr-TR');
    }
  } catch (error) {
    console.error('Date formatting error:', error);
    return '-';
  }
}

// Format relative time (e.g., "2 hours ago")
export function formatRelativeTime(date: Date | string): string {
  if (!date) {
    return 'Tarih belirtilmemiş';
  }
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Geçersiz tarih';
  }
  
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Az önce';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} dakika önce`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} saat önce`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} gün önce`;
  }

  return formatDate(dateObj);
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Generate random ID
export function generateId(prefix = ''): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${prefix}${timestamp}${randomStr}`;
}

// Validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone number (Turkish format)
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+90|0)?[5][0-9]{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Get stock level color
export function getStockLevelColor(currentStock: number, minStock: number): string {
  if (currentStock === 0) {
    return 'text-red-600 bg-red-50';
  } else if (currentStock <= minStock) {
    return 'text-orange-600 bg-orange-50';
  } else {
    return 'text-green-600 bg-green-50';
  }
}

// Get stock level text
export function getStockLevelText(currentStock: number, minStock: number): string {
  if (currentStock === 0) {
    return 'Stokta Yok';
  } else if (currentStock <= minStock) {
    return 'Kritik Seviye';
  } else {
    return 'Normal';
  }
}

// Get priority color
export function getPriorityColor(priority: string): string {
  switch (priority.toLowerCase()) {
    case 'high':
    case 'yüksek':
      return 'text-red-600 bg-red-50';
    case 'medium':
    case 'orta':
      return 'text-yellow-600 bg-yellow-50';
    case 'low':
    case 'düşük':
      return 'text-green-600 bg-green-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

// Get status color
export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'tamamlandı':
      return 'text-green-600 bg-green-50';
    case 'in progress':
    case 'devam ediyor':
      return 'text-blue-600 bg-blue-50';
    case 'planned':
    case 'planlandı':
      return 'text-yellow-600 bg-yellow-50';
    case 'cancelled':
    case 'iptal edildi':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

// Export data to CSV
export function exportToCSV(data: any[], filename: string): void {
  if (!data.length) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }
}