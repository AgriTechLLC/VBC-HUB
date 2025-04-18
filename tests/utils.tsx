import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';

// English messages that will be used in tests
const messages = {
  legislation: {
    title: 'Legislation Tracker',
    searchPlaceholder: 'Search bills...',
    allStatuses: 'All Statuses',
    noResults: 'No bills match your search criteria',
    lastUpdated: 'Last updated',
    mockData: 'Mock Data',
    liveApi: 'Live API',
    officialPage: 'View Official Page',
    viewDetails: 'View Details',
    newActivity: 'New Activity'
  },
  billStatus: {
    '1': 'Introduced',
    '2': 'In Committee',
    '3': 'Passed Committee', 
    '4': 'Passed First Chamber',
    '5': 'Passed Second Chamber',
    '6': 'Sent to Executive',
    '7': 'Vetoed',
    '8': 'Enacted',
    '9': 'Dead',
    '10': 'Enrolled',
    '11': 'Withdrawn',
    'unknown': 'Unknown'
  },
  error: {
    title: 'Something went wrong',
    message: 'There was a problem loading the data. Please try again.',
    billsTitle: 'Failed to load bills',
    billsMessage: 'There was a problem loading the legislation data. Please try again.',
    retry: 'Retry'
  }
};

// Custom render function that wraps component with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render method
export { customRender as render };