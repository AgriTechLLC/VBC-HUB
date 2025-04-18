// Mock for next-intl
import React, { createContext, ReactNode } from 'react';

// Create a mock of the NextIntlClientProvider
export const NextIntlClientProvider = ({ 
  children, 
  locale = 'en',
  messages = {},
}: { 
  children: ReactNode,
  locale?: string,
  messages?: Record<string, any>
}) => {
  return <>{children}</>;
};

// Mock implementation of useTranslations
export const useTranslations = (namespace?: string) => {
  // Create a mock function that returns the key or a nested key
  return (key: string, values?: Record<string, any>) => {
    // Handle nested namespace
    if (namespace) {
      return `${namespace}.${key}`;
    }
    return key;
  };
};

// Other functions from next-intl that might be used
export const useLocale = () => 'en';
export const useTimeZone = () => 'UTC';
export const useNow = () => new Date();