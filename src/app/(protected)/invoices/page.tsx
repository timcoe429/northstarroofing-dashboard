'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { COLORS, SPACING } from '@/styles/constants';

export const dynamic = 'force-dynamic';
import {
  InvoiceData,
  CompanyInfo,
  InvoiceSearchResult,
  createNewInvoice,
  saveInvoice,
  loadInvoice,
  deleteInvoice,
  searchInvoices,
  saveCompanyInfo,
  loadCompanyInfo,
  formatCurrency,
  calculateLineAmount,
  calculateInvoiceTotals
} from '@/utils/invoice-helpers';
import { generateInvoicePDF } from '@/utils/pdf-generator';

export default function InvoicesPage() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>(createNewInvoice());
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(loadCompanyInfo());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<InvoiceSearchResult[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [companyCollapsed, setCompanyCollapsed] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Load company info on mount
  useEffect(() => {
    setCompanyInfo(loadCompanyInfo());
  }, []);

  // Auto-search when query changes
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      const results = searchInvoices(searchQuery);
      setSearchResults(results);
      setShowSearchDropdown(true);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Show message with auto-hide for success
  const showMessage = (text: string, type: 'success' | 'error' | 'info') => {
    setMessage({ text, type });
    if (type === 'success') {
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Handle logo upload
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoData = e.target?.result as string;
        setCompanyInfo(prev => ({ ...prev, logo: logoData }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove logo
  const removeLogo = () => {
    setCompanyInfo(prev => ({ ...prev, logo: undefined }));
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };

  // Save company info
  const handleSaveCompany = () => {
    saveCompanyInfo(companyInfo);
    showMessage('Company info saved!', 'success');
  };

  // Load invoice
  const loadInvoiceData = (invoiceNumber: string) => {
    const loaded = loadInvoice(invoiceNumber);
    if (loaded) {
      setInvoiceData(loaded);
      setShowDeleteButton(true);
      setSearchQuery('');
      setShowSearchDropdown(false);
      showMessage(`Loaded invoice ${invoiceNumber}`, 'info');
    } else {
      showMessage('Invoice not found', 'error');
    }
  };

  // Save invoice
  const handleSaveInvoice = () => {
    if (!invoiceData.invoiceNumber.trim()) {
      showMessage('Enter an invoice number first', 'error');
      return;
    }
    
    // Recalculate totals before saving
    const totals = calculateInvoiceTotals(invoiceData.lineItems, invoiceData.taxRate);
    const updatedInvoice = {
      ...invoiceData,
      ...totals
    };
    
    saveInvoice(updatedInvoice);
    setInvoiceData(updatedInvoice);
    setShowDeleteButton(true);
    showMessage(`Invoice ${invoiceData.invoiceNumber} saved!`, 'success');
  };

  // Delete invoice
  const handleDeleteInvoice = () => {
    if (!invoiceData.invoiceNumber) return;
    
    if (confirm(`Delete invoice ${invoiceData.invoiceNumber}?`)) {
      deleteInvoice(invoiceData.invoiceNumber);
      showMessage('Deleted', 'success');
      handleNewInvoice();
    }
  };

  // New invoice
  const handleNewInvoice = () => {
    setInvoiceData(createNewInvoice());
    setShowDeleteButton(false);
    setSearchQuery('');
    showMessage('New invoice started', 'info');
  };

  // Update line item
  const updateLineItem = (index: number, field: keyof InvoiceData['lineItems'][0], value: string | number) => {
    const newLineItems = [...invoiceData.lineItems];
    newLineItems[index] = { ...newLineItems[index], [field]: value };
    
    // Recalculate amount for this line item
    if (field === 'quantity' || field === 'rate') {
      newLineItems[index].amount = calculateLineAmount(
        newLineItems[index].quantity,
        newLineItems[index].rate
      );
    }
    
    // Recalculate totals
    const totals = calculateInvoiceTotals(newLineItems, invoiceData.taxRate);
    
    setInvoiceData(prev => ({
      ...prev,
      lineItems: newLineItems,
      ...totals
    }));
  };

  // Add line item
  const addLineItem = () => {
    const newLineItems = [...invoiceData.lineItems, {
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0
    }];
    
    setInvoiceData(prev => ({
      ...prev,
      lineItems: newLineItems
    }));
  };

  // Remove line item
  const removeLineItem = (index: number) => {
    if (invoiceData.lineItems.length <= 1) return;
    
    const newLineItems = invoiceData.lineItems.filter((_, i) => i !== index);
    const totals = calculateInvoiceTotals(newLineItems, invoiceData.taxRate);
    
    setInvoiceData(prev => ({
      ...prev,
      lineItems: newLineItems,
      ...totals
    }));
  };

  // Update tax rate
  const updateTaxRate = (taxRate: number) => {
    const totals = calculateInvoiceTotals(invoiceData.lineItems, taxRate);
    setInvoiceData(prev => ({
      ...prev,
      taxRate,
      ...totals
    }));
  };

  // Generate PDF
  const handleGeneratePDF = () => {
    generateInvoicePDF(invoiceData, companyInfo);
  };

  return (
    <div style={{ minHeight: '100vh', background: COLORS.gray100, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <Header title="Invoices" subtitle="Create and manage invoices" showTimeRange={false} />
        
        <div style={{ padding: SPACING[6], maxWidth: 900, margin: '0 auto' }}>
          {/* Search/Load Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 20,
            padding: '16px 20px',
            background: COLORS.navy,
            borderRadius: 12,
            flexWrap: 'wrap'
          }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSearchDropdown(true)}
                placeholder="Search invoice # or client name..."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  background: 'rgba(255,255,255,0.15)',
                  color: COLORS.white,
                  outline: 'none'
                }}
              />
              
              {/* Search Dropdown */}
              {showSearchDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: COLORS.white,
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  maxHeight: 300,
                  overflowY: 'auto',
                  zIndex: 100,
                  marginTop: 6
                }}>
                  {searchResults.length > 0 ? (
                    searchResults.map((result) => (
                      <div
                        key={result.invoiceNumber}
                        onClick={() => loadInvoiceData(result.invoiceNumber)}
                        style={{
                          padding: '12px 16px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #f1f5f9',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#e6edf2'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <div>
                          <strong style={{ color: COLORS.navy, fontSize: 14 }}>
                            {result.invoiceNumber}
                          </strong>
                          {result.clientName && (
                            <span style={{ color: '#94a3b8', marginLeft: 8 }}>
                              — {result.clientName}
                            </span>
                          )}
                        </div>
                        <span style={{ color: '#94a3b8', fontSize: 12 }}>
                          {new Date(result.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: 16, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                      No invoices found
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <button
              onClick={() => searchQuery.trim() && loadInvoiceData(searchQuery.trim())}
              style={{
                padding: '10px 18px',
                border: 'none',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                background: 'rgba(255,255,255,0.9)',
                color: COLORS.navy
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = COLORS.white}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.9)'}
            >
              Load
            </button>
            
            <button
              onClick={handleNewInvoice}
              style={{
                padding: '10px 18px',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                background: 'rgba(255,255,255,0.2)',
                color: COLORS.white
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            >
              + New Invoice
            </button>
          </div>

          {/* Status Message */}
          {message && (
            <div style={{
              padding: '10px 16px',
              borderRadius: 8,
              fontSize: 13,
              marginBottom: 16,
              background: message.type === 'success' ? '#f0fdf4' : 
                         message.type === 'error' ? '#fef2f2' : '#e6edf2',
              color: message.type === 'success' ? '#166534' : 
                     message.type === 'error' ? '#991b1b' : COLORS.navy,
              border: `1px solid ${message.type === 'success' ? '#bbf7d0' : 
                                  message.type === 'error' ? '#fecaca' : '#b0c4d4'}`
            }}>
              {message.text}
            </div>
          )}

          {/* Company Settings */}
          <div style={{
            background: COLORS.white,
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: 32,
            marginBottom: 20,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
          }}>
            <div 
              onClick={() => setCompanyCollapsed(!companyCollapsed)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: COLORS.navy, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Company Settings
                </h3>
                <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                  {companyInfo.name ? (
                    <>
                      <strong style={{ color: COLORS.navy }}>{companyInfo.name}</strong> — 
                      {companyInfo.logo ? ' Logo set ✓' : ' No logo'} · 
                      <span style={{ color: '#94a3b8' }}> Click to edit</span>
                    </>
                  ) : (
                    <span style={{ color: '#dc2626' }}>Not configured — click to set up</span>
                  )}
                </div>
              </div>
              <span style={{
                fontSize: 12,
                color: '#94a3b8',
                transform: companyCollapsed ? 'rotate(0deg)' : 'rotate(180deg)',
                transition: 'transform 0.2s'
              }}>
                ▼
              </span>
            </div>
            
            <div style={{
              overflow: 'hidden',
              maxHeight: companyCollapsed ? 0 : 'none',
              transition: 'max-height 0.3s ease'
            }}>
              <div style={{ paddingTop: 20 }}>
                {/* Logo and Company Name Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                  <div 
                    onClick={() => logoInputRef.current?.click()}
                    style={{
                      width: 140,
                      height: 70,
                      border: '2px dashed #d1d5db',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      background: '#f8fafc',
                      flexShrink: 0
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = COLORS.navy}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                  >
                    {companyInfo.logo ? (
                      <img 
                        src={companyInfo.logo} 
                        alt="Company Logo"
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>+ Logo</span>
                    )}
                  </div>
                  
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    style={{ display: 'none' }}
                  />
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <button
                      onClick={() => logoInputRef.current?.click()}
                      style={{
                        fontSize: 12,
                        padding: '4px 10px',
                        border: '1px solid #d1d5db',
                        borderRadius: 6,
                        background: COLORS.white,
                        cursor: 'pointer',
                        color: '#64748b'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = COLORS.navy;
                        e.currentTarget.style.color = COLORS.navy;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#d1d5db';
                        e.currentTarget.style.color = '#64748b';
                      }}
                    >
                      Change Logo
                    </button>
                    <button
                      onClick={removeLogo}
                      style={{
                        fontSize: 12,
                        padding: '4px 10px',
                        border: '1px solid #d1d5db',
                        borderRadius: 6,
                        background: COLORS.white,
                        cursor: 'pointer',
                        color: '#64748b'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = COLORS.navy;
                        e.currentTarget.style.color = COLORS.navy;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#d1d5db';
                        e.currentTarget.style.color = '#64748b';
                      }}
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#64748b', marginBottom: 4 }}>
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={companyInfo.name}
                      onChange={(e) => setCompanyInfo(prev => ({ ...prev, name: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: 8,
                        fontSize: 14,
                        color: '#1a1a1a',
                        background: '#f8fafc',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = COLORS.navy;
                        e.target.style.background = COLORS.white;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.background = '#f8fafc';
                      }}
                    />
                  </div>
                </div>
                
                {/* Address and Phone Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#64748b', marginBottom: 4 }}>
                      Address
                    </label>
                    <input
                      type="text"
                      value={companyInfo.address}
                      onChange={(e) => setCompanyInfo(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="123 Main St, City, State ZIP"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: 8,
                        fontSize: 14,
                        color: '#1a1a1a',
                        background: '#f8fafc',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = COLORS.navy;
                        e.target.style.background = COLORS.white;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.background = '#f8fafc';
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#64748b', marginBottom: 4 }}>
                      Phone
                    </label>
                    <input
                      type="text"
                      value={companyInfo.phone}
                      onChange={(e) => setCompanyInfo(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(555) 555-5555"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: 8,
                        fontSize: 14,
                        color: '#1a1a1a',
                        background: '#f8fafc',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = COLORS.navy;
                        e.target.style.background = COLORS.white;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.background = '#f8fafc';
                      }}
                    />
                  </div>
                </div>
                
                {/* Email and Website Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#64748b', marginBottom: 4 }}>
                      Email
                    </label>
                    <input
                      type="text"
                      value={companyInfo.email}
                      onChange={(e) => setCompanyInfo(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="info@company.com"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: 8,
                        fontSize: 14,
                        color: '#1a1a1a',
                        background: '#f8fafc',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = COLORS.navy;
                        e.target.style.background = COLORS.white;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.background = '#f8fafc';
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#64748b', marginBottom: 4 }}>
                      Website
                    </label>
                    <input
                      type="text"
                      value={companyInfo.website}
                      onChange={(e) => setCompanyInfo(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="www.company.com"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: 8,
                        fontSize: 14,
                        color: '#1a1a1a',
                        background: '#f8fafc',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = COLORS.navy;
                        e.target.style.background = COLORS.white;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.background = '#f8fafc';
                      }}
                    />
                  </div>
                </div>
                
                <button
                  onClick={handleSaveCompany}
                  style={{
                    padding: '10px 20px',
                    border: 'none',
                    background: COLORS.navy,
                    color: COLORS.white,
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginTop: 8
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#003a59'}
                  onMouseLeave={(e) => e.currentTarget.style.background = COLORS.navy}
                >
                  Save Company Info
                </button>
              </div>
            </div>
          </div>

          {/* Bill To */}
          <div style={{
            background: COLORS.white,
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: 32,
            marginBottom: 20,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
          }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 600, color: COLORS.navy, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Bill To
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#64748b', marginBottom: 4 }}>
                  Client Name
                </label>
                <input
                  type="text"
                  value={invoiceData.client.name}
                  onChange={(e) => setInvoiceData(prev => ({ 
                    ...prev, 
                    client: { ...prev.client, name: e.target.value } 
                  }))}
                  placeholder="Client or company name"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 14,
                    color: '#1a1a1a',
                    background: '#f8fafc',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = COLORS.navy;
                    e.target.style.background = COLORS.white;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.background = '#f8fafc';
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#64748b', marginBottom: 4 }}>
                  Client Email
                </label>
                <input
                  type="text"
                  value={invoiceData.client.email}
                  onChange={(e) => setInvoiceData(prev => ({ 
                    ...prev, 
                    client: { ...prev.client, email: e.target.value } 
                  }))}
                  placeholder="client@email.com"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 14,
                    color: '#1a1a1a',
                    background: '#f8fafc',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = COLORS.navy;
                    e.target.style.background = COLORS.white;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.background = '#f8fafc';
                  }}
                />
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#64748b', marginBottom: 4 }}>
                  Client Address
                </label>
                <input
                  type="text"
                  value={invoiceData.client.address}
                  onChange={(e) => setInvoiceData(prev => ({ 
                    ...prev, 
                    client: { ...prev.client, address: e.target.value } 
                  }))}
                  placeholder="Client address"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 14,
                    color: '#1a1a1a',
                    background: '#f8fafc',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = COLORS.navy;
                    e.target.style.background = COLORS.white;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.background = '#f8fafc';
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#64748b', marginBottom: 4 }}>
                  Client Phone
                </label>
                <input
                  type="text"
                  value={invoiceData.client.phone}
                  onChange={(e) => setInvoiceData(prev => ({ 
                    ...prev, 
                    client: { ...prev.client, phone: e.target.value } 
                  }))}
                  placeholder="(555) 555-5555"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 14,
                    color: '#1a1a1a',
                    background: '#f8fafc',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = COLORS.navy;
                    e.target.style.background = COLORS.white;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.background = '#f8fafc';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div style={{
            background: COLORS.white,
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: 32,
            marginBottom: 20,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
          }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 600, color: COLORS.navy, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Invoice Details
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#64748b', marginBottom: 4 }}>
                  Invoice #
                </label>
                <input
                  type="text"
                  value={invoiceData.invoiceNumber}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 14,
                    color: '#1a1a1a',
                    background: '#f8fafc',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = COLORS.navy;
                    e.target.style.background = COLORS.white;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.background = '#f8fafc';
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#64748b', marginBottom: 4 }}>
                  Invoice Date
                </label>
                <input
                  type="date"
                  value={invoiceData.invoiceDate}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, invoiceDate: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 14,
                    color: '#1a1a1a',
                    background: '#f8fafc',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = COLORS.navy;
                    e.target.style.background = COLORS.white;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.background = '#f8fafc';
                  }}
                />
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#64748b', marginBottom: 4 }}>
                  Due Date
                </label>
                <input
                  type="date"
                  value={invoiceData.dueDate}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, dueDate: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 14,
                    color: '#1a1a1a',
                    background: '#f8fafc',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = COLORS.navy;
                    e.target.style.background = COLORS.white;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.background = '#f8fafc';
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#64748b', marginBottom: 4 }}>
                  PO Number (optional)
                </label>
                <input
                  type="text"
                  value={invoiceData.poNumber}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, poNumber: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 14,
                    color: '#1a1a1a',
                    background: '#f8fafc',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = COLORS.navy;
                    e.target.style.background = COLORS.white;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.background = '#f8fafc';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div style={{
            background: COLORS.white,
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: 32,
            marginBottom: 20,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
          }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 600, color: COLORS.navy, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Line Items
            </h3>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
              <thead>
                <tr>
                  <th style={{ 
                    background: '#f1f5f9', 
                    padding: '10px 12px', 
                    textAlign: 'left', 
                    fontSize: 13, 
                    fontWeight: 600, 
                    color: '#475569', 
                    borderBottom: '2px solid #e2e8f0',
                    width: '40%'
                  }}>
                    Description
                  </th>
                  <th style={{ 
                    background: '#f1f5f9', 
                    padding: '10px 12px', 
                    textAlign: 'left', 
                    fontSize: 13, 
                    fontWeight: 600, 
                    color: '#475569', 
                    borderBottom: '2px solid #e2e8f0',
                    width: '12%'
                  }}>
                    Qty
                  </th>
                  <th style={{ 
                    background: '#f1f5f9', 
                    padding: '10px 12px', 
                    textAlign: 'left', 
                    fontSize: 13, 
                    fontWeight: 600, 
                    color: '#475569', 
                    borderBottom: '2px solid #e2e8f0',
                    width: '18%'
                  }}>
                    Rate ($)
                  </th>
                  <th style={{ 
                    background: '#f1f5f9', 
                    padding: '10px 12px', 
                    textAlign: 'left', 
                    fontSize: 13, 
                    fontWeight: 600, 
                    color: '#475569', 
                    borderBottom: '2px solid #e2e8f0',
                    width: '18%'
                  }}>
                    Amount
                  </th>
                  <th style={{ 
                    background: '#f1f5f9', 
                    padding: '10px 12px', 
                    textAlign: 'left', 
                    fontSize: 13, 
                    fontWeight: 600, 
                    color: '#475569', 
                    borderBottom: '2px solid #e2e8f0',
                    width: '12%'
                  }}>
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.lineItems.map((item, index) => (
                  <tr key={index}>
                    <td style={{ padding: '8px 6px', verticalAlign: 'middle' }}>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                        placeholder="Description..."
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          border: '1px solid #d1d5db',
                          borderRadius: 6,
                          fontSize: 14,
                          background: '#f8fafc',
                          outline: 'none'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = COLORS.navy;
                          e.target.style.background = COLORS.white;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.background = '#f8fafc';
                        }}
                      />
                    </td>
                    <td style={{ padding: '8px 6px', verticalAlign: 'middle' }}>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="1"
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          border: '1px solid #d1d5db',
                          borderRadius: 6,
                          fontSize: 14,
                          background: '#f8fafc',
                          outline: 'none'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = COLORS.navy;
                          e.target.style.background = COLORS.white;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.background = '#f8fafc';
                        }}
                      />
                    </td>
                    <td style={{ padding: '8px 6px', verticalAlign: 'middle' }}>
                      <input
                        type="number"
                        value={item.rate}
                        onChange={(e) => updateLineItem(index, 'rate', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          border: '1px solid #d1d5db',
                          borderRadius: 6,
                          fontSize: 14,
                          background: '#f8fafc',
                          outline: 'none'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = COLORS.navy;
                          e.target.style.background = COLORS.white;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.background = '#f8fafc';
                        }}
                      />
                    </td>
                    <td style={{ 
                      padding: '8px 6px', 
                      verticalAlign: 'middle',
                      background: '#f1f5f9',
                      fontWeight: 600,
                      textAlign: 'right',
                      paddingRight: 12,
                      color: COLORS.navy
                    }}>
                      {formatCurrency(item.amount)}
                    </td>
                    <td style={{ padding: '8px 6px', verticalAlign: 'middle', textAlign: 'center' }}>
                      <button
                        onClick={() => removeLineItem(index)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#94a3b8',
                          fontSize: 20,
                          cursor: 'pointer',
                          padding: '4px 8px',
                          borderRadius: 4
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#fef2f2';
                          e.currentTarget.style.color = '#dc2626';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'none';
                          e.currentTarget.style.color = '#94a3b8';
                        }}
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <button
              onClick={addLineItem}
              style={{
                width: '100%',
                padding: 12,
                background: '#f1f5f9',
                color: '#334155',
                border: '1px dashed #94a3b8',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                marginBottom: 16
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e2e8f0';
                e.currentTarget.style.borderColor = '#64748b';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f1f5f9';
                e.currentTarget.style.borderColor = '#94a3b8';
              }}
            >
              + Add Line Item
            </button>
            
            {/* Totals */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <div style={{ minWidth: 280 }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  fontSize: 14,
                  color: '#475569',
                  borderBottom: '1px solid #f1f5f9'
                }}>
                  <span>Subtotal</span>
                  <span>{formatCurrency(invoiceData.subtotal)}</span>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                  fontSize: 14,
                  color: '#475569',
                  borderBottom: '1px solid #f1f5f9'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>Tax</span>
                    <input
                      type="number"
                      value={invoiceData.taxRate}
                      onChange={(e) => updateTaxRate(parseFloat(e.target.value) || 0)}
                      min="0"
                      max="100"
                      step="0.1"
                      style={{
                        width: 60,
                        padding: '4px 8px',
                        border: '1px solid #d1d5db',
                        borderRadius: 4,
                        fontSize: 13,
                        outline: 'none'
                      }}
                      onFocus={(e) => e.target.style.borderColor = COLORS.navy}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                    <span style={{ color: '#64748b', fontSize: 14 }}>%</span>
                  </div>
                  <span>{formatCurrency(invoiceData.taxAmount)}</span>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 18,
                  fontWeight: 700,
                  color: COLORS.navy,
                  borderTop: `2px solid ${COLORS.navy}`,
                  borderBottom: 'none',
                  paddingTop: 12,
                  marginTop: 4
                }}>
                  <span>Total Due</span>
                  <span>{formatCurrency(invoiceData.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div style={{
            background: COLORS.white,
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: 32,
            marginBottom: 20,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
          }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 600, color: COLORS.navy, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Notes / Payment Terms
            </h3>
            <div>
              <textarea
                value={invoiceData.notes}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Payment terms, bank details, etc."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 14,
                  color: '#1a1a1a',
                  background: '#f8fafc',
                  resize: 'vertical',
                  minHeight: 60,
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = COLORS.navy;
                  e.target.style.background = COLORS.white;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.background = '#f8fafc';
                }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'flex-end',
            flexWrap: 'wrap',
            marginTop: 24
          }}>
            {showDeleteButton && (
              <button
                onClick={handleDeleteInvoice}
                style={{
                  padding: '14px 20px',
                  border: '1px solid #fecaca',
                  background: COLORS.white,
                  color: '#dc2626',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                onMouseLeave={(e) => e.currentTarget.style.background = COLORS.white}
              >
                Delete Invoice
              </button>
            )}
            
            <button
              onClick={handleSaveInvoice}
              style={{
                padding: '14px 28px',
                border: `2px solid ${COLORS.navy}`,
                background: COLORS.white,
                color: COLORS.navy,
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#e6edf2'}
              onMouseLeave={(e) => e.currentTarget.style.background = COLORS.white}
            >
              💾 Save Invoice
            </button>
            
            <button
              onClick={handleGeneratePDF}
              style={{
                padding: '14px 32px',
                border: 'none',
                background: COLORS.navy,
                color: COLORS.white,
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#003a59';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,41,63,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = COLORS.navy;
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              ⬇ Download PDF
            </button>
          </div>
        </div>
      
      {/* Click outside handler for search dropdown */}
      <div 
        onClick={() => setShowSearchDropdown(false)}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: showSearchDropdown ? 50 : -1,
          pointerEvents: showSearchDropdown ? 'auto' : 'none'
        }}
      />
    </div>
  );
}