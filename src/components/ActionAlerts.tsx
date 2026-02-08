'use client';

import React, { useState } from 'react';
import { Icons } from './Icons';
import { calculateDaysInColumn, getCardsByList, getCardListName } from '@/utils/trello-helpers';
import type { TrelloCard, TrelloList } from '@/types';

interface AlertItem {
  id: string;
  type: 'warning' | 'critical' | 'healthy';
  title: string;
  message: string;
  count: number;
  cards: Array<{
    address: string;
    days: number;
  }>;
}

interface ActionAlertsProps {
  cards: TrelloCard[];
  lists: TrelloList[];
}

export const ActionAlerts: React.FC<ActionAlertsProps> = ({ cards, lists }) => {
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);

  // Generate alerts based on aging rules
  const generateAlerts = (): AlertItem[] => {
    const alerts: AlertItem[] = [];

    // Need Quote alerts
    const needQuoteCards = getCardsByList(cards, lists, 'Need Quote');
    const needQuote3Plus = needQuoteCards.filter(card => calculateDaysInColumn(card) >= 3);
    const needQuote5Plus = needQuoteCards.filter(card => calculateDaysInColumn(card) >= 5);

    if (needQuote5Plus.length > 0) {
      alerts.push({
        id: 'need-quote-critical',
        type: 'critical',
        title: 'Critical: Quotes Overdue',
        message: `${needQuote5Plus.length} leads have been waiting 5+ days for quotes!`,
        count: needQuote5Plus.length,
        cards: needQuote5Plus.map(card => ({
          address: card.name,
          days: calculateDaysInColumn(card)
        }))
      });
    } else if (needQuote3Plus.length > 0) {
      alerts.push({
        id: 'need-quote-warning',
        type: 'warning',
        title: 'Quotes Needed',
        message: `${needQuote3Plus.length} leads waiting for quotes`,
        count: needQuote3Plus.length,
        cards: needQuote3Plus.map(card => ({
          address: card.name,
          days: calculateDaysInColumn(card)
        }))
      });
    }

    // Estimating alerts
    const estimatingCards = getCardsByList(cards, lists, 'Estimating');
    const estimating5Plus = estimatingCards.filter(card => calculateDaysInColumn(card) >= 5);

    if (estimating5Plus.length > 0) {
      alerts.push({
        id: 'estimating-warning',
        type: 'warning',
        title: 'Estimates In Progress',
        message: `${estimating5Plus.length} estimates have been in progress for 5+ days`,
        count: estimating5Plus.length,
        cards: estimating5Plus.map(card => ({
          address: card.name,
          days: calculateDaysInColumn(card)
        }))
      });
    }

    // Estimate Sent alerts
    const estimateSentCards = getCardsByList(cards, lists, 'Estimate Sent');
    const estimateSent5Plus = estimateSentCards.filter(card => calculateDaysInColumn(card) >= 5);
    const estimateSent7Plus = estimateSentCards.filter(card => calculateDaysInColumn(card) >= 7);

    if (estimateSent7Plus.length > 0) {
      alerts.push({
        id: 'estimate-sent-critical',
        type: 'critical',
        title: 'Critical: Follow Up Now',
        message: `${estimateSent7Plus.length} estimates sent over a week ago — follow up NOW`,
        count: estimateSent7Plus.length,
        cards: estimateSent7Plus.map(card => ({
          address: card.name,
          days: calculateDaysInColumn(card)
        }))
      });
    } else if (estimateSent5Plus.length > 0) {
      alerts.push({
        id: 'estimate-sent-warning',
        type: 'warning',
        title: 'Estimates Need Follow-up',
        message: `${estimateSent5Plus.length} estimates need follow-up`,
        count: estimateSent5Plus.length,
        cards: estimateSent5Plus.map(card => ({
          address: card.name,
          days: calculateDaysInColumn(card)
        }))
      });
    }

    // Follow-Up alerts
    const followUpCards = getCardsByList(cards, lists, 'Follow-Up');
    const followUp7Plus = followUpCards.filter(card => calculateDaysInColumn(card) >= 7);

    if (followUp7Plus.length > 0) {
      alerts.push({
        id: 'follow-up-critical',
        type: 'critical',
        title: 'Critical: Leads Going Cold',
        message: `${followUp7Plus.length} leads going cold in follow-up`,
        count: followUp7Plus.length,
        cards: followUp7Plus.map(card => ({
          address: card.name,
          days: calculateDaysInColumn(card)
        }))
      });
    }

    return alerts;
  };

  const alerts = generateAlerts();
  const hasAlerts = alerts.length > 0;

  // Alert styling
  const getAlertStyles = (type: AlertItem['type']) => {
    switch (type) {
      case 'critical':
        return {
          background: '#F8D7DA',
          color: '#721C24',
          border: '1px solid #F5C6CB'
        };
      case 'warning':
        return {
          background: '#FFF3CD',
          color: '#856404',
          border: '1px solid #FFEAA7'
        };
      case 'healthy':
        return {
          background: '#D4EDDA',
          color: '#155724',
          border: '1px solid #C3E6CB'
        };
    }
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: 10,
      padding: 18,
      border: '1px solid #e8ecf0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 14
      }}>
        <Icons.AlertCircle />
        <h3 style={{
          fontSize: 12,
          fontWeight: 600,
          color: '#00293f',
          margin: 0,
          textTransform: 'uppercase',
          letterSpacing: 0.3
        }}>
          Needs Attention
        </h3>
      </div>

      {!hasAlerts ? (
        // Healthy state
        <div style={{
          ...getAlertStyles('healthy'),
          padding: 16,
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <Icons.Check />
          <span style={{ fontSize: 14, fontWeight: 600 }}>
            Pipeline is healthy — nothing overdue 👍
          </span>
        </div>
      ) : (
        // Alert cards
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {alerts.map(alert => (
            <div key={alert.id}>
              {/* Alert Header */}
              <div
                style={{
                  ...getAlertStyles(alert.type),
                  padding: 16,
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
                onClick={() => setExpandedAlert(
                  expandedAlert === alert.id ? null : alert.id
                )}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ 
                      fontSize: 13, 
                      fontWeight: 700, 
                      marginBottom: 4 
                    }}>
                      {alert.title}
                    </div>
                    <div style={{ fontSize: 14 }}>
                      {alert.message}
                    </div>
                  </div>
                  <div style={{
                    transform: expandedAlert === alert.id ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.15s'
                  }}>
                    ▼
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedAlert === alert.id && (
                <div style={{
                  background: '#f8f9fa',
                  border: '1px solid #e8ecf0',
                  borderTop: 'none',
                  borderRadius: '0 0 8px 8px',
                  padding: 16
                }}>
                  <div style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#64748b',
                    marginBottom: 8,
                    textTransform: 'uppercase',
                    letterSpacing: 0.3
                  }}>
                    Affected Leads ({alert.count})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {alert.cards.map((card, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 12px',
                          background: 'white',
                          borderRadius: 6,
                          border: '1px solid #e8ecf0',
                          fontSize: 13
                        }}
                      >
                        <span style={{ fontWeight: 500 }}>
                          {card.address}
                        </span>
                        <span style={{
                          color: card.days >= 7 ? '#B1000F' : card.days >= 5 ? '#856404' : '#64748b',
                          fontWeight: 600
                        }}>
                          {card.days} days
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};