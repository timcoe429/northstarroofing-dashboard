// ===========================================
// UTILITIES AND MOCK DATA
// ===========================================

export const mockData = {
  pipeline: { leads: 12, estimates: 8, scheduled: 5, inProgress: 3, completed: 47 },
  financials: { totalRevenue: 847500, collected: 692000, uncollected: 155500, profit: 186450, avgJobSize: 18032 },
  jobTypes: { replacements: 32, repairs: 18, inspections: 15, gutters: 9 },
  recentProjects: [
    { id: 1, name: 'Morrison Residence', type: 'Replacement', value: 42500, status: 'In Progress', location: 'Aspen', date: '2024-12-08' },
    { id: 2, name: 'Snowmass Condos', type: 'Replacement', value: 128000, status: 'Scheduled', location: 'Snowmass', date: '2024-12-15' },
    { id: 3, name: 'Valley View Estate', type: 'Repair', value: 8500, status: 'Completed', location: 'Basalt', date: '2024-12-01' },
    { id: 4, name: 'Alpine Lodge', type: 'Replacement', value: 67000, status: 'In Progress', location: 'Aspen', date: '2024-12-10' },
    { id: 5, name: 'Riverside Cabin', type: 'Inspection', value: 450, status: 'Completed', location: 'Carbondale', date: '2024-11-28' },
  ],
  revenueDetails: [
    { month: 'Jul', revenue: 95000, jobs: 6, replacements: 72000, repairs: 15000, inspections: 3000, gutters: 5000 },
    { month: 'Aug', revenue: 142000, jobs: 9, replacements: 108000, repairs: 22000, inspections: 4500, gutters: 7500 },
    { month: 'Sep', revenue: 118000, jobs: 7, replacements: 89000, repairs: 18000, inspections: 3500, gutters: 7500 },
    { month: 'Oct', revenue: 156000, jobs: 8, replacements: 125000, repairs: 19000, inspections: 4000, gutters: 8000 },
    { month: 'Nov', revenue: 189000, jobs: 11, replacements: 148000, repairs: 26000, inspections: 5000, gutters: 10000 },
    { month: 'Dec', revenue: 147500, jobs: 8, replacements: 112000, repairs: 21500, inspections: 4500, gutters: 9500 },
  ],
  profitDetails: {
    byType: [
      { type: 'Replacements', revenue: 654000, cost: 510120, profit: 143880, margin: 22 },
      { type: 'Repairs', revenue: 121500, cost: 85050, profit: 36450, margin: 30 },
      { type: 'Inspections', revenue: 24500, cost: 8575, profit: 15925, margin: 65 },
      { type: 'Gutters', revenue: 47500, cost: 33250, profit: 14250, margin: 30 },
    ],
    byMonth: [
      { month: 'Jul', revenue: 95000, cost: 74100, profit: 20900 },
      { month: 'Aug', revenue: 142000, cost: 110760, profit: 31240 },
      { month: 'Sep', revenue: 118000, cost: 92040, profit: 25960 },
      { month: 'Oct', revenue: 156000, cost: 121680, profit: 34320 },
      { month: 'Nov', revenue: 189000, cost: 147420, profit: 41580 },
      { month: 'Dec', revenue: 147500, cost: 115050, profit: 32450 },
    ]
  },
  activeProjects: [
    { id: 1, name: 'Morrison Residence', type: 'Replacement', value: 42500, status: 'In Progress', location: 'Aspen', startDate: '2024-12-08', crew: 'Hugo', completion: 65 },
    { id: 2, name: 'Snowmass Condos', type: 'Replacement', value: 128000, status: 'Scheduled', location: 'Snowmass', startDate: '2024-12-15', crew: 'Alfredo', completion: 0 },
    { id: 3, name: 'Alpine Lodge', type: 'Replacement', value: 67000, status: 'In Progress', location: 'Aspen', startDate: '2024-12-10', crew: 'Hugo', completion: 40 },
    { id: 4, name: 'Maroon Creek Home', type: 'Replacement', value: 54000, status: 'Scheduled', location: 'Aspen', startDate: '2024-12-18', crew: 'Chris', completion: 0 },
    { id: 5, name: 'Basalt Townhomes', type: 'Repair', value: 12500, status: 'In Progress', location: 'Basalt', startDate: '2024-12-11', crew: 'Sergio', completion: 80 },
    { id: 6, name: 'Willits Duplex', type: 'Replacement', value: 38000, status: 'Scheduled', location: 'Basalt', startDate: '2024-12-20', crew: 'Alfredo', completion: 0 },
    { id: 7, name: 'Carbondale Ranch', type: 'Gutters', value: 8500, status: 'Scheduled', location: 'Carbondale', startDate: '2024-12-16', crew: 'Sergio', completion: 0 },
    { id: 8, name: 'Redstone Cabin', type: 'Repair', value: 4200, status: 'In Progress', location: 'Redstone', startDate: '2024-12-09', crew: 'Chris', completion: 90 },
  ],
  avgJobDetails: {
    byType: [
      { type: 'Replacements', avgSize: 28500, count: 32, total: 912000 },
      { type: 'Repairs', avgSize: 4750, count: 18, total: 85500 },
      { type: 'Inspections', avgSize: 425, count: 15, total: 6375 },
      { type: 'Gutters', avgSize: 5200, count: 9, total: 46800 },
    ],
    trend: [
      { period: 'Q1 2024', avgSize: 15200 },
      { period: 'Q2 2024', avgSize: 16800 },
      { period: 'Q3 2024', avgSize: 17500 },
      { period: 'Q4 2024', avgSize: 18032 },
    ]
  },
  monthlyTrend: [
    { month: 'Jul', revenue: 95000, jobs: 6 },
    { month: 'Aug', revenue: 142000, jobs: 9 },
    { month: 'Sep', revenue: 118000, jobs: 7 },
    { month: 'Oct', revenue: 156000, jobs: 8 },
    { month: 'Nov', revenue: 189000, jobs: 11 },
    { month: 'Dec', revenue: 147500, jobs: 8 },
  ]
};

export const formatCurrency = (num: number): string => {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD', 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 0 
  }).format(num);
};
