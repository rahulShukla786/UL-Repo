import React, { createContext, useContext, useState, useCallback } from 'react';
import type { JEStatus, JournalEntry, StageData } from '../types';
import { STD_BUSINESS_RULE_CATEGORIES } from '../data/mockData';

const initialEntries: JournalEntry[] = [];

interface JournalEntriesContextType {
  entries: JournalEntry[];
  updateEntryStatus: (id: string, status: JEStatus) => void;
  addEntryFromSOP: (fileName: string) => void;
}

const JournalEntriesContext = createContext<JournalEntriesContextType>({
  entries: initialEntries,
  updateEntryStatus: () => {},
  addEntryFromSOP: () => {},
});

const STORAGE_KEY = 'ai-journal-entries-v2';

const getSOPName = (fileName: string): string =>
  fileName
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim() || 'Uploaded SOP';

const formatProcessDate = (date: Date): string =>
  date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).replace(/Sept\b/, 'Sep');

const createJournalId = (): string => {
  const suffix = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
  return `J${suffix.padEnd(7, '0')}`;
};

const createPendingStages = (): StageData[] => [
  {
    id: 1,
    title: 'Stage 1: Reading Business Rules',
    purpose: 'Fetch accounting logic (mapping, policies, thresholds, posting rules)',
    status: 'in_progress',
    componentType: 'business_rules',
    businessRuleCategories: STD_BUSINESS_RULE_CATEGORIES.map((category) => ({
      ...category,
      items: [...category.items],
    })),
  },
  {
    id: 2,
    title: 'Stage 2: Data Extraction',
    purpose: 'Pull transactional/aggregated data',
    status: 'pending',
    componentType: 'data_extraction',
  },
  {
    id: 3,
    title: 'Stage 3: Data Validation and Quality Checks',
    purpose: 'Ensure completeness and correctness',
    status: 'pending',
    componentType: 'data_validation',
  },
  {
    id: 4,
    title: 'Stage 4: JE Template Generation',
    purpose: 'Build structured JE draft',
    status: 'pending',
    componentType: 'je_template',
  },
  {
    id: 5,
    title: 'Stage 5: Upload to ERP',
    purpose: 'Upload the JE in ERP (SAP)',
    status: 'pending',
    componentType: 'upload_erp',
  },
];

export const JournalEntriesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [entries, setEntries] = useState<JournalEntry[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return initialEntries;
      return JSON.parse(stored) as JournalEntry[];
    } catch {
      return initialEntries;
    }
  });

  const updateEntryStatus = useCallback((id: string, status: JEStatus) => {
    setEntries((prev) => {
      const next = prev.map((entry) =>
        entry.id === id ? { ...entry, status } : entry,
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const addEntryFromSOP = useCallback((fileName: string) => {
    const now = new Date();
    const newEntry: JournalEntry = {
      id: createJournalId(),
      name: getSOPName(fileName),
      jeCategory: 'Standard',
      country: 'India',
      jeType: 'Accrual',
      lob: 'Logistics',
      processDate: formatProcessDate(now),
      status: 'pending',
      sop: getSOPName(fileName),
      executionStarted: now.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      progress: 0,
      stages: createPendingStages(),
      aiProcessingLog: [],
    };

    setEntries((prev) => {
      const next = [newEntry, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });

  }, []);

  return (
    <JournalEntriesContext.Provider value={{ entries, updateEntryStatus, addEntryFromSOP }}>
      {children}
    </JournalEntriesContext.Provider>
  );
};

export const useJournalEntries = () => useContext(JournalEntriesContext);
