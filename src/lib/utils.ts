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
  ],
  estimates: [
    { id: 'EST-2401', customer: 'Morrison Residence', address: '124 Aspen Ridge Rd, Aspen', jobType: 'Replacement', amount: 45200, status: 'Sent', date: '2024-12-03' },
    { id: 'EST-2402', customer: 'Snowmass Condos HOA', address: '88 Cirque Ln, Snowmass', jobType: 'Replacement', amount: 128500, status: 'Viewed', date: '2024-12-05' },
    { id: 'EST-2403', customer: 'Basalt Townhomes', address: '350 Two Rivers Rd, Basalt', jobType: 'Repair', amount: 8650, status: 'Accepted', date: '2024-12-06' },
    { id: 'EST-2404', customer: 'Willits Duplex', address: '219 Willits Way, Basalt', jobType: 'Replacement', amount: 38200, status: 'Sent', date: '2024-12-08' },
    { id: 'EST-2405', customer: 'Carbondale Ranch', address: '77 Crystal River Dr, Carbondale', jobType: 'Gutters', amount: 5400, status: 'Accepted', date: '2024-12-09' },
    { id: 'EST-2406', customer: 'Alpine Lodge', address: '14 Highlands Ln, Aspen', jobType: 'Replacement', amount: 67200, status: 'Viewed', date: '2024-12-10' },
    { id: 'EST-2407', customer: 'Redstone Cabin', address: '9 Coal Creek Rd, Redstone', jobType: 'Repair', amount: 4200, status: 'Declined', date: '2024-12-11' },
    { id: 'EST-2408', customer: 'Sopris View Home', address: '301 Sopris Mesa Rd, Carbondale', jobType: 'Inspection', amount: 650, status: 'Sent', date: '2024-12-12' },
    { id: 'EST-2409', customer: 'El Jebel Plaza', address: '100 Midland Ave, El Jebel', jobType: 'Repair', amount: 9800, status: 'Accepted', date: '2024-12-13' },
    { id: 'EST-2410', customer: 'Maroon Creek Home', address: '18 Maroon Creek Rd, Aspen', jobType: 'Replacement', amount: 54000, status: 'Draft', date: '2024-12-14' },
    { id: 'EST-2411', customer: 'Roaring Fork Retreat', address: '56 River Bend Rd, Basalt', jobType: 'Replacement', amount: 91500, status: 'Sent', date: '2024-12-16' },
    { id: 'EST-2412', customer: 'Downtown Aspen Loft', address: '210 Main St, Aspen', jobType: 'Gutters', amount: 3100, status: 'Viewed', date: '2024-12-18' }
  ],
  customers: [
    { name: 'Morrison Residence', address: '124 Aspen Ridge Rd, Aspen', phone: '(970) 555-0194', email: 'morrison@northstar.com', totalJobs: 2, totalRevenue: 87500, lastJobDate: '2024-12-08' },
    { name: 'Snowmass Condos HOA', address: '88 Cirque Ln, Snowmass', phone: '(970) 555-0178', email: 'hoa@snowmasscondos.com', totalJobs: 1, totalRevenue: 128000, lastJobDate: '2024-12-15' },
    { name: 'Valley View Estate', address: '5 Valley View Dr, Basalt', phone: '(970) 555-0132', email: 'valleyview@gmail.com', totalJobs: 3, totalRevenue: 34200, lastJobDate: '2024-12-01' },
    { name: 'Alpine Lodge', address: '14 Highlands Ln, Aspen', phone: '(970) 555-0144', email: 'alpine@lodges.com', totalJobs: 2, totalRevenue: 134200, lastJobDate: '2024-12-10' },
    { name: 'Riverside Cabin', address: '22 River Rd, Carbondale', phone: '(970) 555-0119', email: 'riverside@cabins.com', totalJobs: 1, totalRevenue: 450, lastJobDate: '2024-11-28' },
    { name: 'Basalt Townhomes', address: '350 Two Rivers Rd, Basalt', phone: '(970) 555-0156', email: 'basalt@townhomes.com', totalJobs: 4, totalRevenue: 45600, lastJobDate: '2024-12-11' },
    { name: 'Willits Duplex', address: '219 Willits Way, Basalt', phone: '(970) 555-0166', email: 'willits@duplex.com', totalJobs: 1, totalRevenue: 38000, lastJobDate: '2024-12-20' },
    { name: 'Carbondale Ranch', address: '77 Crystal River Dr, Carbondale', phone: '(970) 555-0120', email: 'carbondale@ranch.com', totalJobs: 2, totalRevenue: 13900, lastJobDate: '2024-12-16' },
    { name: 'Redstone Cabin', address: '9 Coal Creek Rd, Redstone', phone: '(970) 555-0188', email: 'redstone@cabin.com', totalJobs: 1, totalRevenue: 4200, lastJobDate: '2024-12-09' },
    { name: 'Maroon Creek Home', address: '18 Maroon Creek Rd, Aspen', phone: '(970) 555-0106', email: 'maroon@creekhome.com', totalJobs: 1, totalRevenue: 54000, lastJobDate: '2024-12-18' },
    { name: 'Sopris View Home', address: '301 Sopris Mesa Rd, Carbondale', phone: '(970) 555-0199', email: 'sopris@viewhome.com', totalJobs: 2, totalRevenue: 28650, lastJobDate: '2024-12-12' },
    { name: 'El Jebel Plaza', address: '100 Midland Ave, El Jebel', phone: '(970) 555-0182', email: 'eljebel@plaza.com', totalJobs: 3, totalRevenue: 51200, lastJobDate: '2024-12-13' },
    { name: 'Roaring Fork Retreat', address: '56 River Bend Rd, Basalt', phone: '(970) 555-0175', email: 'retreat@rfvalley.com', totalJobs: 1, totalRevenue: 91500, lastJobDate: '2024-12-16' },
    { name: 'Aspen Highlands Condo', address: '22 Highlands Dr, Aspen', phone: '(970) 555-0138', email: 'highlands@condo.com', totalJobs: 2, totalRevenue: 63300, lastJobDate: '2024-11-20' },
    { name: 'Snowmass Village Shop', address: '10 Village Square, Snowmass', phone: '(970) 555-0126', email: 'snowmass@shop.com', totalJobs: 1, totalRevenue: 9800, lastJobDate: '2024-10-14' },
    { name: 'Basalt Brewery', address: '27 Midland Ave, Basalt', phone: '(970) 555-0161', email: 'brewery@basaltco.com', totalJobs: 2, totalRevenue: 21700, lastJobDate: '2024-09-29' },
    { name: 'Carbondale Library', address: '320 Main St, Carbondale', phone: '(970) 555-0148', email: 'library@carbondale.gov', totalJobs: 1, totalRevenue: 14500, lastJobDate: '2024-08-22' },
    { name: 'Aspen Chalet Rentals', address: '89 Aspen Grove Rd, Aspen', phone: '(970) 555-0152', email: 'rentals@aspenchalet.com', totalJobs: 3, totalRevenue: 104800, lastJobDate: '2024-07-19' }
  ],
  invoices: [
    { id: 'INV-1087', customer: 'Morrison Residence', amount: 21250, status: 'Paid', dueDate: '2024-12-10' },
    { id: 'INV-1088', customer: 'Snowmass Condos HOA', amount: 64000, status: 'Partial', dueDate: '2024-12-20' },
    { id: 'INV-1089', customer: 'Alpine Lodge', amount: 33600, status: 'Unpaid', dueDate: '2024-12-22' },
    { id: 'INV-1090', customer: 'Basalt Townhomes', amount: 8650, status: 'Paid', dueDate: '2024-12-12' },
    { id: 'INV-1091', customer: 'Carbondale Ranch', amount: 5400, status: 'Paid', dueDate: '2024-12-18' },
    { id: 'INV-1092', customer: 'Maroon Creek Home', amount: 27000, status: 'Partial', dueDate: '2024-12-27' },
    { id: 'INV-1093', customer: 'Roaring Fork Retreat', amount: 45750, status: 'Unpaid', dueDate: '2025-01-05' },
    { id: 'INV-1094', customer: 'El Jebel Plaza', amount: 9800, status: 'Paid', dueDate: '2024-12-15' }
  ],
  crewPerformance: [
    { crew: 'Hugo', jobsCompleted: 12, onTimePct: 92, avgJobValue: 38500, revenue: 462000 },
    { crew: 'Alfredo', jobsCompleted: 9, onTimePct: 88, avgJobValue: 41200, revenue: 371000 },
    { crew: 'Sergio', jobsCompleted: 14, onTimePct: 95, avgJobValue: 12800, revenue: 179000 },
    { crew: 'Chris', jobsCompleted: 8, onTimePct: 90, avgJobValue: 22100, revenue: 177000 }
  ],
  topCustomers: [
    { name: 'Snowmass Condos HOA', revenue: 128000, jobs: 1 },
    { name: 'Alpine Lodge', revenue: 134200, jobs: 2 },
    { name: 'Aspen Chalet Rentals', revenue: 104800, jobs: 3 },
    { name: 'Roaring Fork Retreat', revenue: 91500, jobs: 1 },
    { name: 'Morrison Residence', revenue: 87500, jobs: 2 }
  ],
  profitabilityTrend: [
    { month: 'Jul', margin: 20 },
    { month: 'Aug', margin: 22 },
    { month: 'Sep', margin: 21 },
    { month: 'Oct', margin: 23 },
    { month: 'Nov', margin: 24 },
    { month: 'Dec', margin: 22 }
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
