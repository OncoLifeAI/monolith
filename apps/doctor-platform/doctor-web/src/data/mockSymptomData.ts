// Type definitions
export interface SymptomEntry {
  id: string;
  date: string;
  symptomName: 'fever' | 'pain';
  severity: 'symptom_relieved' | 'mild' | 'moderate' | 'severe' | 'very_severe';
  medicationName: string;
  medicationFrequency: string;
  medicationHelped: boolean;
}

export interface SymptomChartData {
  date: string;
  fever?: number;
  pain?: number;
}

// Severity mapping constants
export const severityToNumber: Record<string, number> = {
  'symptom_relieved': 0,
  'mild': 1,
  'moderate': 2,
  'severe': 3,
  'very_severe': 4
};

export const numberToSeverity: Record<number, string> = {
  0: 'Symptom Relieved',
  1: 'Mild',
  2: 'Moderate', 
  3: 'Severe',
  4: 'Very Severe'
};

// Options for dropdowns
export const symptomOptions = [
  { value: 'fever', label: 'Fever' },
  { value: 'pain', label: 'Pain' }
];

export const severityOptions = [
  { value: 'symptom_relieved', label: 'Symptom Relieved' },
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' },
  { value: 'very_severe', label: 'Very Severe' }
];

// Mock data array
export const mockSymptomEntries: SymptomEntry[] = [
  {
    id: '1',
    date: '2024-01-15',
    symptomName: 'fever',
    severity: 'severe',
    medicationName: 'Acetaminophen 500mg',
    medicationFrequency: '3 times daily',
    medicationHelped: true
  },
  {
    id: '2',
    date: '2024-01-15',
    symptomName: 'pain',
    severity: 'moderate',
    medicationName: 'Ibuprofen 400mg',
    medicationFrequency: '2 times daily',
    medicationHelped: true
  },
  {
    id: '3',
    date: '2024-01-16',
    symptomName: 'fever',
    severity: 'moderate',
    medicationName: 'Acetaminophen 500mg',
    medicationFrequency: '3 times daily',
    medicationHelped: true
  },
  {
    id: '4',
    date: '2024-01-16',
    symptomName: 'pain',
    severity: 'mild',
    medicationName: 'Ibuprofen 400mg',
    medicationFrequency: '2 times daily',
    medicationHelped: true
  },
  {
    id: '5',
    date: '2024-01-17',
    symptomName: 'fever',
    severity: 'mild',
    medicationName: 'Acetaminophen 500mg',
    medicationFrequency: '2 times daily',
    medicationHelped: true
  },
  {
    id: '6',
    date: '2024-01-17',
    symptomName: 'pain',
    severity: 'symptom_relieved',
    medicationName: 'Ibuprofen 400mg',
    medicationFrequency: '1 time daily',
    medicationHelped: true
  },
  {
    id: '7',
    date: '2024-01-18',
    symptomName: 'fever',
    severity: 'symptom_relieved',
    medicationName: 'Acetaminophen 500mg',
    medicationFrequency: 'As needed',
    medicationHelped: true
  },
  {
    id: '8',
    date: '2024-01-19',
    symptomName: 'pain',
    severity: 'mild',
    medicationName: 'Ibuprofen 400mg',
    medicationFrequency: '1 time daily',
    medicationHelped: false
  },
  {
    id: '9',
    date: '2024-01-20',
    symptomName: 'fever',
    severity: 'moderate',
    medicationName: 'Acetaminophen 500mg',
    medicationFrequency: '2 times daily',
    medicationHelped: true
  },
  {
    id: '10',
    date: '2024-01-20',
    symptomName: 'pain',
    severity: 'moderate',
    medicationName: 'Naproxen 220mg',
    medicationFrequency: '2 times daily',
    medicationHelped: true
  },
  {
    id: '11',
    date: '2024-01-21',
    symptomName: 'fever',
    severity: 'mild',
    medicationName: 'Acetaminophen 500mg',
    medicationFrequency: '2 times daily',
    medicationHelped: true
  },
  {
    id: '12',
    date: '2024-01-21',
    symptomName: 'pain',
    severity: 'mild',
    medicationName: 'Naproxen 220mg',
    medicationFrequency: '1 time daily',
    medicationHelped: true
  },
  {
    id: '13',
    date: '2024-01-22',
    symptomName: 'fever',
    severity: 'symptom_relieved',
    medicationName: 'Acetaminophen 500mg',
    medicationFrequency: 'As needed',
    medicationHelped: true
  },
  {
    id: '14',
    date: '2024-01-23',
    symptomName: 'pain',
    severity: 'severe',
    medicationName: 'Morphine 10mg',
    medicationFrequency: '4 times daily',
    medicationHelped: true
  },
  {
    id: '15',
    date: '2024-01-24',
    symptomName: 'fever',
    severity: 'moderate',
    medicationName: 'Acetaminophen 500mg',
    medicationFrequency: '3 times daily',
    medicationHelped: false
  },
  {
    id: '16',
    date: '2024-01-24',
    symptomName: 'pain',
    severity: 'moderate',
    medicationName: 'Morphine 10mg',
    medicationFrequency: '3 times daily',
    medicationHelped: true
  },
  {
    id: '17',
    date: '2024-01-25',
    symptomName: 'fever',
    severity: 'very_severe',
    medicationName: 'Acetaminophen 1000mg',
    medicationFrequency: '4 times daily',
    medicationHelped: true
  },
  {
    id: '18',
    date: '2024-01-25',
    symptomName: 'pain',
    severity: 'very_severe',
    medicationName: 'Morphine 15mg',
    medicationFrequency: '4 times daily',
    medicationHelped: true
  },
  {
    id: '19',
    date: '2024-01-26',
    symptomName: 'fever',
    severity: 'severe',
    medicationName: 'Acetaminophen 1000mg',
    medicationFrequency: '4 times daily',
    medicationHelped: true
  },
  {
    id: '20',
    date: '2024-01-26',
    symptomName: 'pain',
    severity: 'severe',
    medicationName: 'Morphine 15mg',
    medicationFrequency: '3 times daily',
    medicationHelped: true
  },
  // Additional data points for better graph visualization
  {
    id: '21',
    date: '2024-01-27',
    symptomName: 'fever',
    severity: 'moderate',
    medicationName: 'Acetaminophen 1000mg',
    medicationFrequency: '3 times daily',
    medicationHelped: true
  },
  {
    id: '22',
    date: '2024-01-27',
    symptomName: 'pain',
    severity: 'moderate',
    medicationName: 'Morphine 10mg',
    medicationFrequency: '2 times daily',
    medicationHelped: true
  },
  {
    id: '23',
    date: '2024-01-28',
    symptomName: 'fever',
    severity: 'mild',
    medicationName: 'Acetaminophen 500mg',
    medicationFrequency: '2 times daily',
    medicationHelped: true
  },
  {
    id: '24',
    date: '2024-01-28',
    symptomName: 'pain',
    severity: 'mild',
    medicationName: 'Ibuprofen 400mg',
    medicationFrequency: '2 times daily',
    medicationHelped: true
  },
  {
    id: '25',
    date: '2024-01-29',
    symptomName: 'fever',
    severity: 'symptom_relieved',
    medicationName: 'Acetaminophen 500mg',
    medicationFrequency: 'As needed',
    medicationHelped: true
  },
  {
    id: '26',
    date: '2024-01-29',
    symptomName: 'pain',
    severity: 'symptom_relieved',
    medicationName: 'Ibuprofen 400mg',
    medicationFrequency: 'As needed',
    medicationHelped: true
  },
  {
    id: '27',
    date: '2024-01-30',
    symptomName: 'fever',
    severity: 'mild',
    medicationName: 'Acetaminophen 500mg',
    medicationFrequency: '1 time daily',
    medicationHelped: false
  },
  {
    id: '28',
    date: '2024-01-30',
    symptomName: 'pain',
    severity: 'moderate',
    medicationName: 'Naproxen 220mg',
    medicationFrequency: '2 times daily',
    medicationHelped: true
  }
];

// Utility function for data transformation
export function transformDataForChart(
  entries: SymptomEntry[], 
  startDate?: string, 
  endDate?: string,
  selectedSymptoms?: string[]
): SymptomChartData[] {
  let filteredEntries = entries;

  // Filter by date range
  if (startDate && endDate) {
    filteredEntries = entries.filter(entry => 
      entry.date >= startDate && entry.date <= endDate
    );
  }

  // Filter by selected symptoms
  if (selectedSymptoms && selectedSymptoms.length > 0) {
    filteredEntries = filteredEntries.filter(entry =>
      selectedSymptoms.includes(entry.symptomName)
    );
  }

  // Group by date
  const groupedByDate: Record<string, SymptomChartData> = {};
  
  filteredEntries.forEach(entry => {
    if (!groupedByDate[entry.date]) {
      groupedByDate[entry.date] = { date: entry.date };
    }
    const severityValue = severityToNumber[entry.severity];
    if (entry.symptomName === 'fever') {
      groupedByDate[entry.date].fever = severityValue;
    } else if (entry.symptomName === 'pain') {
      groupedByDate[entry.date].pain = severityValue;
    }
  });

  return Object.values(groupedByDate).sort((a, b) => a.date.localeCompare(b.date));
}
