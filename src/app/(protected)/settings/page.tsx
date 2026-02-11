'use client';

import React, { useState, useEffect } from 'react';
import { Icons } from '@/components/Icons';
import { useTrelloCredentials, useTrelloConnectionTest } from '@/hooks/useTrelloData';

export const dynamic = 'force-dynamic';

interface APIConnection {
  id: string;
  name: string;
  description: string;
  icon: string;
  connected: boolean;
  lastSync?: string;
  fields: Array<{
    key: string;
    label: string;
    type: 'text' | 'password';
    placeholder: string;
  }>;
}

const apiConnections: APIConnection[] = [
  {
    id: 'trello',
    name: 'Trello',
    description: 'Sync project pipeline and task management from Trello boards',
    icon: '📋',
    connected: false,
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Enter your Trello API key' },
      { key: 'token', label: 'Token', type: 'password', placeholder: 'Enter your Trello token' },
      { key: 'salesBoardId', label: 'Sales/Estimates Board ID', type: 'text', placeholder: 'e.g. WSiRtEMs' },
      { key: 'buildBoardId', label: 'Build/Jobs Board ID', type: 'text', placeholder: 'e.g. 71rgUcQZ' },
    ],
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks Online',
    description: 'Sync invoices, payments, and financial data from QuickBooks',
    icon: '💵',
    connected: false,
    fields: [
      { key: 'clientId', label: 'Client ID', type: 'text', placeholder: 'Enter your QBO Client ID' },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: 'Enter your QBO Client Secret' },
      { key: 'realmId', label: 'Company Realm ID', type: 'text', placeholder: 'Enter your Company Realm ID' },
    ],
  },
  {
    id: 'estimator',
    name: 'Estimator App',
    description: 'Sync estimates and proposals from your estimator application',
    icon: '📝',
    connected: false,
    fields: [
      { key: 'apiUrl', label: 'API URL', type: 'text', placeholder: 'https://your-estimator-app.com/api' },
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Enter your Estimator API key' },
    ],
  },
];

export default function SettingsPage() {
  const [connections, setConnections] = useState(apiConnections);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, Record<string, string>>>({});
  const [testingId, setTestingId] = useState<string | null>(null);
  
  // Use Trello hooks (server-side env only; no localStorage)
  const { configured: trelloConfigured } = useTrelloCredentials();
  const { testing: trelloTesting, results: trelloTestResults, testConnection } = useTrelloConnectionTest();

  // Sync Trello connection status from server (GET /api/trello/status)
  useEffect(() => {
    if (trelloConfigured === null) return;
    setConnections(prev =>
      prev.map(conn =>
        conn.id === 'trello'
          ? { ...conn, connected: trelloConfigured, lastSync: trelloConfigured ? new Date().toISOString() : undefined }
          : conn
      )
    );
  }, [trelloConfigured]);

  const handleInputChange = (connectionId: string, fieldKey: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [connectionId]: {
        ...prev[connectionId],
        [fieldKey]: value,
      },
    }));
  };

  const handleTestConnection = async (connectionId: string) => {
    setTestingId(connectionId);

    if (connectionId === 'trello') {
      await testConnection();
    } else {
      // Simulate API test for other connections
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert(`Connection test for ${connectionId} - Check console for implementation details`);
    }

    setTestingId(null);
  };

  const handleSaveConnection = (connectionId: string) => {
    if (connectionId === 'trello') {
      alert('Trello is configured via server environment variables (e.g. .env.local or Vercel). Add TRELLO_API_KEY, TRELLO_TOKEN, TRELLO_SALES_BOARD_ID, and TRELLO_BUILD_BOARD_ID there.');
      return;
    }

    setConnections(prev =>
      prev.map(conn =>
        conn.id === connectionId
          ? { ...conn, connected: true, lastSync: new Date().toISOString() }
          : conn
      )
    );
    setExpandedId(null);
  };

  const handleDisconnect = (connectionId: string) => {
    if (connectionId === 'trello') {
      alert('To disconnect Trello, remove TRELLO_API_KEY, TRELLO_TOKEN, and board IDs from your server environment (e.g. Vercel Environment Variables).');
      return;
    }

    setConnections(prev =>
      prev.map(conn =>
        conn.id === connectionId
          ? { ...conn, connected: false, lastSync: undefined }
          : conn
      )
    );
    setFormData(prev => {
      const newData = { ...prev };
      delete newData[connectionId];
      return newData;
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {/* Header */}
      <header style={{ 
        background: 'white', 
        padding: '14px 24px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        borderBottom: '1px solid #e8ecf0', 
        position: 'sticky', 
        top: 0, 
        zIndex: 50 
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#00293f' }}>Settings</h1>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>Manage API connections and integrations</p>
        </div>
      </header>

      {/* Content */}
      <div style={{ padding: 24, maxWidth: 800 }}>
          <div style={{ 
            background: 'white', 
            borderRadius: 12, 
            border: '1px solid #e8ecf0', 
            overflow: 'hidden' 
          }}>
            <div style={{ padding: 20, borderBottom: '1px solid #e8ecf0' }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#00293f' }}>
                API Connections
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
                Connect your external services to sync data with the dashboard
              </p>
            </div>

            {connections.map((connection, index) => (
              <div 
                key={connection.id}
                style={{ 
                  borderBottom: index < connections.length - 1 ? '1px solid #e8ecf0' : 'none'
                }}
              >
                {/* Connection Header */}
                <div 
                  onClick={() => setExpandedId(expandedId === connection.id ? null : connection.id)}
                  style={{ 
                    padding: 20, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    background: expandedId === connection.id ? '#f8fafc' : 'white',
                    transition: 'background 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ 
                      width: 44, 
                      height: 44, 
                      borderRadius: 10, 
                      background: connection.connected ? '#d1fae5' : '#f1f5f9',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: 20
                    }}>
                      {connection.icon}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, color: '#00293f', fontSize: 14 }}>
                        {connection.name}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>
                        {connection.description}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {connection.connected ? (
                      <span style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 6,
                        padding: '4px 10px', 
                        borderRadius: 20, 
                        background: '#d1fae5', 
                        color: '#059669',
                        fontSize: 12,
                        fontWeight: 500
                      }}>
                        <Icons.Check /> Connected
                      </span>
                    ) : (
                      <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: 20, 
                        background: '#f1f5f9', 
                        color: '#64748b',
                        fontSize: 12,
                        fontWeight: 500
                      }}>
                        Not Connected
                      </span>
                    )}
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="#64748b" 
                      strokeWidth="2"
                      style={{ 
                        transform: expandedId === connection.id ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.2s'
                      }}
                    >
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                </div>

                {/* Expanded Form */}
                {expandedId === connection.id && (
                  <div style={{ padding: '0 20px 20px', background: '#f8fafc' }}>
                    {connection.connected ? (
                      <div>
                        <div style={{ 
                          padding: 16, 
                          background: connection.id === 'trello' ? '#d1fae5' : '#d1fae5', 
                          borderRadius: 8, 
                          marginBottom: 16 
                        }}>
                          <p style={{ margin: 0, fontSize: 13, color: '#065f46' }}>
                            {connection.id === 'trello' ? (
                              <> <strong>Connected</strong> - Configured via server environment variables (Vercel or .env.local). </>
                            ) : (
                              <span>
                                <strong>Connected</strong> - Last synced: {' '}
                                {connection.lastSync
                                  ? new Date(connection.lastSync).toLocaleString()
                                  : 'Never'}
                              </span>
                            )}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <button
                            onClick={() => handleTestConnection(connection.id)}
                            disabled={testingId === connection.id}
                            style={{ 
                              padding: '10px 16px', 
                              background: '#00293f', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: 6,
                              fontSize: 13,
                              fontWeight: 500,
                              cursor: testingId === connection.id ? 'wait' : 'pointer',
                              opacity: testingId === connection.id ? 0.7 : 1
                            }}
                          >
                            {testingId === connection.id ? 'Testing...' : 'Test Connection'}
                          </button>
                          <button
                            onClick={() => handleDisconnect(connection.id)}
                            style={{ 
                              padding: '10px 16px', 
                              background: 'white', 
                              color: '#B1000F', 
                              border: '1px solid #B1000F', 
                              borderRadius: 6,
                              fontSize: 13,
                              fontWeight: 500,
                              cursor: 'pointer'
                            }}
                          >
                            Disconnect
                          </button>
                        </div>
                      </div>
                    ) : connection.id === 'trello' ? (
                      <div>
                        <div style={{ 
                          padding: 16, 
                          background: 'white', 
                          borderRadius: 8, 
                          marginBottom: 16,
                          border: '1px solid #e2e8f0'
                        }}>
                          <p style={{ margin: 0, fontSize: 13, color: '#334155', lineHeight: 1.5 }}>
                            Trello is configured via server environment variables. Set <strong>TRELLO_API_KEY</strong>, <strong>TRELLO_TOKEN</strong>, <strong>TRELLO_SALES_BOARD_ID</strong>, and <strong>TRELLO_BUILD_BOARD_ID</strong> in your server environment (e.g. .env.local or Vercel).
                          </p>
                        </div>
                        {trelloTestResults && (
                          <div style={{ marginBottom: 16 }}>
                            <div style={{ marginBottom: 8 }}>
                              <span style={{ fontSize: 12, fontWeight: 500, color: '#334155' }}>Connection Test Results:</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, fontSize: 12 }}>
                              <span style={{ color: '#64748b' }}>Sales/Estimates Board:</span>
                              <span style={{ color: trelloTestResults.sales ? '#059669' : '#dc2626', fontWeight: 500 }}>
                                {trelloTestResults.sales ? '✓ Connected' : '✗ Failed'}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, fontSize: 12 }}>
                              <span style={{ color: '#64748b' }}>Build/Jobs Board:</span>
                              <span style={{ color: trelloTestResults.build ? '#059669' : '#dc2626', fontWeight: 500 }}>
                                {trelloTestResults.build ? '✓ Connected' : '✗ Failed'}
                              </span>
                            </div>
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                          <button
                            onClick={() => handleTestConnection(connection.id)}
                            disabled={testingId === connection.id || trelloTesting}
                            style={{ 
                              padding: '10px 16px', 
                              background: '#00293f', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: 6,
                              fontSize: 13,
                              fontWeight: 500,
                              cursor: (testingId === connection.id || trelloTesting) ? 'wait' : 'pointer',
                              opacity: (testingId === connection.id || trelloTesting) ? 0.7 : 1
                            }}
                          >
                            {(testingId === connection.id || trelloTesting) ? 'Testing...' : 'Test Connection'}
                          </button>
                          <button
                            onClick={() => handleSaveConnection(connection.id)}
                            style={{ 
                              padding: '10px 16px', 
                              background: 'white', 
                              color: '#00293f', 
                              border: '1px solid #00293f', 
                              borderRadius: 6,
                              fontSize: 13,
                              fontWeight: 500,
                              cursor: 'pointer'
                            }}
                          >
                            How to configure
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {connection.fields.map(field => (
                          <div key={field.key} style={{ marginBottom: 14 }}>
                            <label style={{ 
                              display: 'block', 
                              fontSize: 12, 
                              fontWeight: 500, 
                              color: '#334155', 
                              marginBottom: 6 
                            }}>
                              {field.label}
                            </label>
                            <input
                              type={field.type}
                              placeholder={field.placeholder}
                              value={formData[connection.id]?.[field.key] || ''}
                              onChange={e => handleInputChange(connection.id, field.key, e.target.value)}
                              style={{ 
                                width: '100%', 
                                padding: '10px 12px', 
                                border: '1px solid #e2e8f0', 
                                borderRadius: 6,
                                fontSize: 13,
                                background: 'white'
                              }}
                            />
                          </div>
                        ))}
                        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                          <button
                            onClick={() => handleTestConnection(connection.id)}
                            disabled={testingId === connection.id}
                            style={{ 
                              padding: '10px 16px', 
                              background: 'white', 
                              color: '#00293f', 
                              border: '1px solid #00293f', 
                              borderRadius: 6,
                              fontSize: 13,
                              fontWeight: 500,
                              cursor: testingId === connection.id ? 'wait' : 'pointer',
                              opacity: testingId === connection.id ? 0.7 : 1
                            }}
                          >
                            {testingId === connection.id ? 'Testing...' : 'Test Connection'}
                          </button>
                          <button
                            onClick={() => handleSaveConnection(connection.id)}
                            style={{ 
                              padding: '10px 16px', 
                              background: '#00293f', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: 6,
                              fontSize: 13,
                              fontWeight: 500,
                              cursor: 'pointer'
                            }}
                          >
                            Save & Connect
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Help Section */}
          <div style={{ 
            marginTop: 24, 
            padding: 20, 
            background: 'rgba(0, 41, 63, 0.04)', 
            borderRadius: 12,
            borderLeft: '4px solid #00293f'
          }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 600, color: '#00293f' }}>
              Need Help?
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>
              For Trello, get your API key from <a href="https://trello.com/power-ups/admin" target="_blank" rel="noopener noreferrer" style={{ color: '#00293f' }}>trello.com/power-ups/admin</a>. 
              For QuickBooks, visit <a href="https://developer.intuit.com" target="_blank" rel="noopener noreferrer" style={{ color: '#00293f' }}>developer.intuit.com</a> to create an app.
            </p>
          </div>
      </div>
    </div>
  );
}
