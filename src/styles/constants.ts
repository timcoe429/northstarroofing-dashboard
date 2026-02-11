// ===========================================
// NORTHSTAR DASHBOARD - DESIGN SYSTEM CONSTANTS
// Universal design tokens for all pages
// ===========================================

// ===========================================
// BRAND COLORS
// ===========================================
export const COLORS = {
  // Primary Brand Colors
  navy: '#00293f',
  navyLight: '#003a5c',
  navyDark: '#001f2e',
  red: '#B1000F',
  redLight: '#d4000f',
  redDark: '#8a000c',
  
  // Status Colors
  success: '#059669',
  successLight: '#d1fae5',
  warning: '#f59e0b',
  warningLight: '#fef3c7',
  orange: '#F97316',
  error: '#dc2626',
  errorLight: '#fee2e2',
  info: '#3b82f6',
  infoLight: '#dbeafe',
  
  // Neutral Colors
  white: '#ffffff',
  gray50: '#f8fafc',
  gray100: '#f1f5f9',
  gray200: '#e2e8f0',
  gray300: '#cbd5e1',
  gray400: '#94a3b8',
  gray500: '#64748b',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1e293b',
  gray900: '#0f172a',
  
  // Alert Colors (specific combinations)
  alertWarning: {
    background: '#FFF3CD',
    text: '#856404',
    border: '#FFEAA7'
  },
  alertCritical: {
    background: '#F8D7DA',
    text: '#721C24',
    border: '#F5C6CB'
  },
  alertHealthy: {
    background: '#D4EDDA',
    text: '#155724',
    border: '#C3E6CB'
  }
} as const;

// ===========================================
// TYPOGRAPHY
// ===========================================
export const TYPOGRAPHY = {
  // Font Family
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif',
  
  // Font Sizes
  fontSize: {
    xs: '10px',
    sm: '11px',
    base: '12px',
    md: '13px',
    lg: '14px',
    xl: '16px',
    '2xl': '18px',
    '3xl': '24px',
    '4xl': '26px',
    '5xl': '28px'
  },
  
  // Font Weights
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6
  },
  
  // Letter Spacing
  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.3px'
  }
} as const;

// ===========================================
// SPACING
// ===========================================
export const SPACING = {
  // Standard spacing scale
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
  
  // Common spacing patterns (duplicated for easier access)
  cardPadding: '18px',
  sectionMargin: '20px', 
  gridGap: '16px',
  modalPadding: '24px'
} as const;

// ===========================================
// SHADOWS
// ===========================================
export const SHADOWS = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  
  // Hover effects
  cardHover: '0 4px 12px rgba(0, 0, 0, 0.1)',
  modalOverlay: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
} as const;

// ===========================================
// BORDER RADIUS
// ===========================================
export const BORDER_RADIUS = {
  none: '0px',
  sm: '4px',
  base: '6px',
  md: '8px',
  lg: '10px',
  xl: '16px',
  full: '9999px'
} as const;

// ===========================================
// COMPONENT STYLES
// ===========================================

// Card Styles
export const CARD_STYLES = {
  base: {
    background: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.cardPadding,
    boxShadow: SHADOWS.base,
    border: `1px solid ${COLORS.gray200}`,
    transition: 'all 0.15s ease'
  },
  hover: {
    transform: 'translateY(-2px)',
    boxShadow: SHADOWS.cardHover
  }
} as const;

// Modal Styles
export const MODAL_STYLES = {
  overlay: {
    background: 'rgba(0, 41, 63, 0.7)',
    backdropFilter: 'blur(4px)'
  },
  container: {
    background: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    boxShadow: SHADOWS.modalOverlay,
    maxWidth: '900px',
    maxHeight: '85vh'
  },
  header: {
    background: COLORS.navy,
    color: COLORS.white,
    padding: `${SPACING[4]} ${SPACING[6]}`,
    borderRadius: `${BORDER_RADIUS.xl} ${BORDER_RADIUS.xl} 0 0`
  },
  body: {
    padding: SPACING[6]
  }
} as const;

// Table Styles
export const TABLE_STYLES = {
  container: {
    ...CARD_STYLES.base,
    padding: SPACING.cardPadding
  },
  header: {
    borderBottom: `2px solid ${COLORS.gray200}`,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gray500,
    textTransform: 'uppercase' as const,
    letterSpacing: TYPOGRAPHY.letterSpacing.widest,
    padding: `${SPACING[2]} ${SPACING[1]}`
  },
  row: {
    borderBottom: `1px solid ${COLORS.gray100}`,
    fontSize: TYPOGRAPHY.fontSize.md,
    padding: `${SPACING[2]} ${SPACING[1]}`
  },
  rowHover: {
    background: COLORS.gray50
  },
  totalRow: {
    borderTop: `2px solid ${COLORS.gray200}`,
    background: COLORS.gray50,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    fontSize: TYPOGRAPHY.fontSize.md
  }
} as const;

// Button Styles
export const BUTTON_STYLES = {
  primary: {
    background: COLORS.navy,
    color: COLORS.white,
    border: 'none',
    borderRadius: BORDER_RADIUS.base,
    padding: `${SPACING[2]} ${SPACING[4]}`,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  secondary: {
    background: COLORS.white,
    color: COLORS.navy,
    border: `1px solid ${COLORS.gray200}`,
    borderRadius: BORDER_RADIUS.base,
    padding: `${SPACING[2]} ${SPACING[4]}`,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  }
} as const;

// StatCard Styles
export const STATCARD_STYLES = {
  container: {
    ...CARD_STYLES.base,
    cursor: 'pointer',
    position: 'relative' as const
  },
  leftBorder: {
    position: 'absolute' as const,
    left: 0,
    top: 0,
    bottom: 0,
    width: '4px',
    borderRadius: `${BORDER_RADIUS.lg} 0 0 ${BORDER_RADIUS.lg}`
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gray500,
    textTransform: 'uppercase' as const,
    letterSpacing: TYPOGRAPHY.letterSpacing.widest,
    marginBottom: SPACING[1]
  },
  value: {
    fontSize: TYPOGRAPHY.fontSize['4xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.navy,
    lineHeight: TYPOGRAPHY.lineHeight.tight,
    marginBottom: SPACING[1]
  },
  subtext: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray500
  },
  viewDetails: {
    position: 'absolute' as const,
    bottom: SPACING.cardPadding,
    right: SPACING.cardPadding,
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray400,
    opacity: 0,
    transition: 'opacity 0.15s ease'
  }
} as const;

// Alert Styles
export const ALERT_STYLES = {
  warning: {
    background: COLORS.alertWarning.background,
    color: COLORS.alertWarning.text,
    border: `1px solid ${COLORS.alertWarning.border}`,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING[4]
  },
  critical: {
    background: COLORS.alertCritical.background,
    color: COLORS.alertCritical.text,
    border: `1px solid ${COLORS.alertCritical.border}`,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING[4]
  },
  healthy: {
    background: COLORS.alertHealthy.background,
    color: COLORS.alertHealthy.text,
    border: `1px solid ${COLORS.alertHealthy.border}`,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING[4]
  }
} as const;

// Pipeline Bar Styles
export const PIPELINE_BAR_STYLES = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: SPACING[2],
    overflowX: 'auto' as const,
    paddingBottom: SPACING[2]
  },
  segment: {
    padding: `${SPACING[3]} ${SPACING[4]}`,
    borderRadius: BORDER_RADIUS.md,
    color: COLORS.white,
    textAlign: 'center' as const,
    minWidth: '80px',
    position: 'relative' as const
  },
  segmentLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginBottom: SPACING[1],
    textTransform: 'uppercase' as const,
    letterSpacing: TYPOGRAPHY.letterSpacing.widest
  },
  segmentCount: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: '2px'
  },
  segmentValue: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    opacity: 0.9
  },
  arrow: {
    width: 0,
    height: 0,
    borderTop: '12px solid transparent',
    borderBottom: '12px solid transparent',
    borderLeft: `12px solid ${COLORS.gray500}`,
    opacity: 0.3
  }
} as const;