'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { StatCard } from './StatCard';
import { PipelineCard } from './PipelineCard';
import { RevenueChart } from './RevenueChart';
import { JobTypesCard } from './JobTypesCard';
import { CollectionRing } from './CollectionRing';
import { RecentProjects } from './RecentProjects';
import { Modal } from './Modal';
import { RevenueDetailContent } from './modals/RevenueDetail';
import { ProfitDetailContent } from './modals/ProfitDetail';
import { ActiveProjectsContent } from './modals/ActiveProjects';
import { AvgJobSizeContent } from './modals/AvgJobSize';
import { mockData } from '@/lib/mockData';
import { formatCurrency } from '@/lib/utils';

export default function NorthstarDashboard() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('6mo');
  const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const netCash = mockData.cashFlow.moneyIn - mockData.cashFlow.moneyOut;
  const netPositive = netCash >= 0;
  const revenueProgress = Math.min(100, Math.round((mockData.goals.revenueCurrent / mockData.goals.revenueGoal) * 100));
  const jobsProgress = Math.min(100, Math.round((mockData.goals.jobsCurrent / mockData.goals.jobsGoal) * 100));
  const revenueRemaining = Math.max(0, mockData.goals.revenueGoal - mockData.goals.revenueCurrent);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {/* Modals */}
      <Modal isOpen={activeModal === 'revenue'} onClose={() => setActiveModal(null)} title="Revenue Breakdown">
        <RevenueDetailContent data={mockData.revenueDetails} />
      </Modal>
      <Modal isOpen={activeModal === 'profit'} onClose={() => setActiveModal(null)} title="Profit Analysis">
        <ProfitDetailContent data={mockData.profitDetails} />
      </Modal>
      <Modal isOpen={activeModal === 'activeProjects'} onClose={() => setActiveModal(null)} title="Active Projects">
        <ActiveProjectsContent projects={mockData.activeProjects} />
      </Modal>
      <Modal isOpen={activeModal === 'avgJobSize'} onClose={() => setActiveModal(null)} title="Average Job Size Analysis">
        <AvgJobSizeContent data={mockData.avgJobDetails} />
      </Modal>

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main style={{ flex: 1, marginLeft: 220 }}>
        <Header timeRange={timeRange} onTimeRangeChange={setTimeRange} />

        {/* Dashboard Content */}
        <div style={{ padding: 24 }}>
          {/* Today Summary */}
          <div style={{ background: 'white', border: '1px solid #e8ecf0', borderRadius: 12, padding: 16, marginBottom: 20, display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 16 }}>
            <div>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b', fontWeight: 600 }}>Today</p>
              <h2 style={{ margin: '6px 0', color: '#00293f' }}>{todayDate}</h2>
              <p style={{ margin: 0, fontSize: 12, color: '#334155' }}>{mockData.todaySummary.weather}</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b', fontWeight: 600 }}>Today Snapshot</p>
              <p style={{ margin: '8px 0 0', fontSize: 13, color: '#0f172a', fontWeight: 600 }}>
                Today: {mockData.todaySummary.crewsOut} crews out, {mockData.todaySummary.jobsScheduled} jobs scheduled, {formatCurrency(mockData.todaySummary.onBoard)} on the board
              </p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b', fontWeight: 600 }}>Alerts</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                {mockData.todaySummary.alerts.map(alert => (
                  <div key={alert.id} style={{ padding: '6px 10px', borderRadius: 8, background: alert.severity === 'warning' ? 'rgba(177,0,15,0.08)' : 'rgba(0,41,63,0.06)', color: '#0f172a', fontSize: 12 }}>
                    {alert.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
            <StatCard 
              label="Total Revenue" 
              value={formatCurrency(mockData.financials.totalRevenue)} 
              subtext="+18% from last period" 
              trend={18} 
              icon="💰" 
              color="#00293f" 
              onClick={() => setActiveModal('revenue')} 
            />
            <StatCard 
              label="Gross Profit" 
              value={formatCurrency(mockData.financials.profit)} 
              subtext="22% margin" 
              trend={0} 
              icon="📈" 
              color="#059669" 
              onClick={() => setActiveModal('profit')} 
            />
            <StatCard 
              label="Active Projects" 
              value={mockData.pipeline.inProgress + mockData.pipeline.scheduled} 
              subtext={`${mockData.pipeline.inProgress} in progress`} 
              icon="🏗️" 
              color="#B1000F" 
              onClick={() => setActiveModal('activeProjects')} 
            />
            <StatCard 
              label="Avg Job Size" 
              value={formatCurrency(mockData.financials.avgJobSize)} 
              subtext="+12% YoY" 
              trend={12} 
              icon="📊" 
              color="#00293f" 
              onClick={() => setActiveModal('avgJobSize')} 
            />
          </div>

          {/* Quick Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
            {[
              { label: 'Close rate', value: `${mockData.quickStats.closeRate}% of estimates accepted` },
              { label: 'Avg days to close', value: `${mockData.quickStats.avgDaysToClose} days` },
              { label: 'Customer satisfaction', value: `${mockData.quickStats.satisfaction} ★` },
              { label: 'Repeat customer rate', value: `${mockData.quickStats.repeatRate}%` },
            ].map(stat => (
              <div key={stat.label} style={{ background: 'white', borderRadius: 12, border: '1px solid #e8ecf0', padding: 14 }}>
                <p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>{stat.label}</p>
                <p style={{ margin: '6px 0 0', fontSize: 14, fontWeight: 700, color: '#00293f' }}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Crew + Cash Flow + Action Items */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 20 }}>
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e8ecf0', padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#00293f', marginBottom: 12 }}>Crew Tracker</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {mockData.crewTracker.map(crew => (
                  <div key={crew.crew} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 12, alignItems: 'center', paddingBottom: 10, borderBottom: '1px solid #eef2f6' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{crew.crew} • {crew.job}</p>
                      <p style={{ margin: '4px 0 0', fontSize: 11, color: '#64748b' }}>{crew.address}</p>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: crew.status === 'Completed' ? '#059669' : crew.status === 'En Route' ? '#f59e0b' : '#2563eb' }}>{crew.status}</span>
                        <span style={{ fontSize: 11, color: '#64748b' }}>{crew.progress}%</span>
                      </div>
                      <div style={{ height: 6, background: '#e2e8f0', borderRadius: 999 }}>
                        <div style={{ height: '100%', width: `${crew.progress}%`, borderRadius: 999, background: crew.progress === 100 ? '#059669' : '#00293f' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e8ecf0', padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#00293f', marginBottom: 12 }}>Cash Flow Snapshot</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: '#64748b' }}>Money IN (week)</span>
                    <span style={{ fontWeight: 600 }}>{formatCurrency(mockData.cashFlow.moneyIn)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: '#64748b' }}>Money OUT (week)</span>
                    <span style={{ fontWeight: 600 }}>{formatCurrency(mockData.cashFlow.moneyOut)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: '#64748b' }}>Invoices due this week</span>
                    <span style={{ fontWeight: 600 }}>{formatCurrency(mockData.cashFlow.invoicesDue)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, paddingTop: 8, borderTop: '1px solid #eef2f6' }}>
                    <span style={{ color: '#64748b' }}>Net cash flow</span>
                    <span style={{ fontWeight: 700, color: netPositive ? '#059669' : '#B1000F' }}>
                      {netPositive ? '▲' : '▼'} {formatCurrency(Math.abs(netCash))}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e8ecf0', padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#00293f', marginBottom: 12 }}>Action Items</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {mockData.actionItems.map(item => (
                    <Link
                      key={item.id}
                      href={item.href}
                      style={{
                        textDecoration: 'none',
                        color: '#0f172a',
                        padding: '8px 10px',
                        borderRadius: 8,
                        border: '1px solid #eef2f6',
                        borderLeft: item.status === 'overdue' ? '3px solid #B1000F' : item.status === 'warning' ? '3px solid #f59e0b' : '3px solid #00293f',
                        background: item.status === 'overdue' ? 'rgba(177,0,15,0.06)' : item.status === 'warning' ? 'rgba(245,158,11,0.08)' : 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4
                      }}
                    >
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{item.label}</span>
                      <span style={{ fontSize: 11, color: '#64748b' }}>{item.detail}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Pipeline Row */}
          <div style={{ marginBottom: 20 }}>
            <PipelineCard data={mockData.pipeline} />
          </div>

          {/* Middle Row - Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
            <RevenueChart data={mockData.monthlyTrend} />
            <JobTypesCard data={mockData.jobTypes} />
            <CollectionRing collected={mockData.financials.collected} uncollected={mockData.financials.uncollected} />
          </div>

          {/* Goals + Recent Activity */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginBottom: 20 }}>
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e8ecf0', padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#00293f', marginBottom: 12 }}>Goals / Targets</div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                  <span style={{ color: '#64748b' }}>Monthly revenue goal</span>
                  <span style={{ fontWeight: 600 }}>{formatCurrency(mockData.goals.revenueGoal)}</span>
                </div>
                <div style={{ height: 8, background: '#e2e8f0', borderRadius: 999 }}>
                  <div style={{ height: '100%', width: `${revenueProgress}%`, borderRadius: 999, background: revenueProgress >= 80 ? '#059669' : '#00293f' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginTop: 6, color: '#64748b' }}>
                  <span>{formatCurrency(mockData.goals.revenueCurrent)} ({revenueProgress}%)</span>
                  <span>Need {formatCurrency(revenueRemaining)} more to hit target</span>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                  <span style={{ color: '#64748b' }}>Jobs goal</span>
                  <span style={{ fontWeight: 600 }}>{mockData.goals.jobsGoal}</span>
                </div>
                <div style={{ height: 8, background: '#e2e8f0', borderRadius: 999 }}>
                  <div style={{ height: '100%', width: `${jobsProgress}%`, borderRadius: 999, background: jobsProgress >= 80 ? '#059669' : '#00293f' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginTop: 6, color: '#64748b' }}>
                  <span>Current: {mockData.goals.jobsCurrent}</span>
                  <span>Need {mockData.goals.jobsGoal - mockData.goals.jobsCurrent} more jobs</span>
                </div>
              </div>
            </div>
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e8ecf0', padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#00293f', marginBottom: 12 }}>Recent Activity</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {mockData.activityFeed.map(activity => (
                  <div key={activity.id} style={{ borderBottom: '1px solid #eef2f6', paddingBottom: 8 }}>
                    <p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>{activity.time}</p>
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: '#0f172a' }}>{activity.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Projects */}
          <RecentProjects projects={mockData.recentProjects} />

          {/* Footer Note */}
          <div style={{ marginTop: 24, padding: '14px 18px', background: 'rgba(0, 41, 63, 0.04)', borderRadius: 8, borderLeft: '4px solid #00293f' }}>
            <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
              <strong style={{ color: '#00293f' }}>Mockup Note:</strong> This dashboard uses sample data. Full implementation will pull live data from Trello boards and sync with your estimates and invoicing systems.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
