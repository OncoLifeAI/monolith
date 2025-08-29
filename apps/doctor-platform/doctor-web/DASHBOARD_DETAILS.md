# Dashboard Details - Symptom Tracking & Analysis

## Overview

The Dashboard Details page provides comprehensive symptom tracking and analysis functionality for healthcare professionals. It allows doctors to visualize patient symptom data over time, analyze medication effectiveness, and generate detailed reports.

## Features

### 🗓️ Date Range Selection
- **From/To Date Pickers**: Filter data by specific date ranges
- **Default Range**: Last 30 days
- Uses Material-UI DatePicker with dayjs for date handling

### 📊 Symptom Analysis
- **Multi-Select Symptom Filter**: Choose from available symptoms (Fever, Pain)
- **Severity Range Slider**: Filter by symptom severity levels:
  - Symptom Relieved (0)
  - Mild (1)
  - Moderate (2)
  - Severe (3)
  - Very Severe (4)

### 📈 Interactive Line Chart
- **Custom SVG Chart**: Built with React and styled-components
- **Multi-line Visualization**: Track multiple symptoms simultaneously
- **Hover Tooltips**: Show detailed information for each data point
- **Responsive Design**: Adapts to different screen sizes
- **Color-coded Lines**: Different colors for each symptom type

### 📋 Data Table
- **Comprehensive Details**: Date, Symptom, Severity, Medication, Frequency, Effectiveness
- **Sortable Columns**: Data sorted by date (most recent first)
- **Color-coded Severity**: Visual chips with severity-specific colors
- **Medication Effectiveness**: Clear visual indicators (✓/✗)
- **Responsive Layout**: Works on mobile and desktop

### 📊 Statistics Dashboard
- **Total Records**: Number of symptom entries in selected range
- **Days Tracked**: Unique days with symptom data
- **Medication Success Rate**: Percentage of medications that helped
- **Average Severity**: Mean severity level across all entries

### 📥 Report Download
- **CSV Export**: Download filtered data as CSV file
- **Automatic Filename**: Includes current date in filename
- **Complete Data**: All visible columns included in export

## Technical Implementation

### Components Structure
```
src/
├── components/
│   ├── SymptomLineChart.tsx     # Custom SVG line chart
│   └── SymptomDataTable.tsx     # Material-UI data table
├── data/
│   └── mockSymptomData.ts       # Mock data and utilities
└── pages/Dashboard/
    ├── DashboardDetailsPage.tsx # Main page component
    └── DashboardDetailsIndex.tsx # Export index
```

### Dependencies Used
- **@mui/material**: UI components (Table, DatePicker, Slider, etc.)
- **@mui/x-date-pickers**: Date picker components
- **dayjs**: Date manipulation and formatting
- **lucide-react**: Icons
- **styled-components**: Custom styling
- **react-router-dom**: Navigation

### Data Structure
```typescript
interface SymptomEntry {
  id: string;
  date: string;
  symptomName: 'fever' | 'pain';
  severity: 'symptom_relieved' | 'mild' | 'moderate' | 'severe' | 'very_severe';
  medicationName: string;
  medicationFrequency: string;
  medicationHelped: boolean;
}
```

## Navigation

- **Access**: Navigate to `/dashboard/details` or click "Symptom Analysis" button from main dashboard
- **Integration**: Fully integrated with existing routing and layout structure

## Mock Data

The page uses realistic mock data with 20 sample entries covering:
- Various symptom types (fever, pain)
- Different severity levels
- Multiple medications and frequencies
- Effectiveness tracking
- Date range spanning recent weeks

## Responsive Design

- **Mobile-First**: Optimized for mobile devices
- **Flexible Layout**: Grid system adapts to screen size
- **Touch-Friendly**: Large touch targets for mobile interaction
- **Readable Text**: Appropriate font sizes for all devices

## Future Enhancements

- **Real API Integration**: Replace mock data with actual patient data
- **More Chart Types**: Add bar charts, pie charts for different visualizations
- **Advanced Filtering**: Filter by patient, medication type, etc.
- **Export Options**: PDF reports, email sharing
- **Patient-Specific Views**: Filter data by individual patients
- **Trend Analysis**: Statistical analysis and trend predictions

## Usage

1. **Select Date Range**: Use the date pickers to filter data by time period
2. **Choose Symptoms**: Select which symptoms to analyze from the dropdown
3. **Adjust Severity**: Use the slider to filter by severity levels
4. **View Chart**: Analyze trends in the interactive line chart
5. **Review Table**: Examine detailed records in the data table
6. **Download Report**: Click "Download Report" to export data as CSV

The page automatically updates all visualizations and statistics when filters are changed, providing real-time analysis of symptom data.
