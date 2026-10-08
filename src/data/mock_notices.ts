import type { INotice } from '@/types/notice';

export const INITIAL_NOTICES: INotice[] = [
  {
    id: 'notice-1',
    title:
      '🚨 URGENT: Cold Chain Protocol & Temp Logger Calibration Across Branches',
    content:
      'Due to recent ambient temperature spikes recorded across our regional hubs, all store managers and lead pharmacists must verify digital temperature loggers in Walk-In Cold Rooms and Vaccine Fridges (Units 1–4). Any reading outside 2°C–8°C must be logged immediately and reported to QA.',
    category: 'compliance',
    priority: 'urgent',
    author: {
      name: 'Dr. Chioma Nnamdi',
      role: 'Head of Quality Assurance & Regulatory',
      avatar:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    },
    targetAudience: 'store-staff',
    requiresAcknowledgment: true,
    acknowledgedUserIds: ['user-current'],
    pinned: true,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    attachments: [
      { name: 'Cold_Chain_Audit_Checklist_Q4.pdf', size: '1.8 MB', url: '#' },
      { name: 'Calibration_Log_Template.xlsx', size: '45 KB', url: '#' },
    ],
    commentsCount: 6,
    comments: [
      {
        id: 'c1',
        authorName: 'Ibrahim Musa',
        authorAvatar:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        content:
          'Ikeja City Mall branch logs checked. All units stable at 4.2°C.',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
      },
    ],
  },
  {
    id: 'notice-2',
    title:
      '📦 STOCK ALERT: Controlled Substance Inventory & Bi-Weekly Audit Schedule',
    content:
      'All retail branch supervising pharmacists are reminded that the bi-weekly schedule for Schedule 4 (Controlled) Narcotics and Psychotropics physical stock audit begins this Wednesday. Ensure physical ledger cards match the dispensing software counts down to the exact unit.',
    category: 'operations',
    priority: 'high',
    author: {
      name: 'Adebayo Adeleke',
      role: 'Chief Inventory & Supply Chain Officer',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
    targetAudience: 'pharmacists',
    requiresAcknowledgment: true,
    acknowledgedUserIds: [],
    pinned: true,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
    attachments: [
      {
        name: 'Controlled_Drugs_Audit_Guidelines_v3.pdf',
        size: '3.2 MB',
        url: '#',
      },
    ],
    commentsCount: 14,
    comments: [],
  },
  {
    id: 'notice-3',
    title:
      '💊 NEW PRODUCT LAUNCH: Premium Wellness & Immunity Range (In-Store Promo)',
    content:
      'Starting this Friday, we are rolling out the new VitaShield Daily Immunity and Organic Botanicals line across all 18 retail outlets. Check the POS marketing portal for digital shelf-talkers, price tags, and customer discount voucher codes (10% off for loyalty app users).',
    category: 'marketing',
    priority: 'normal',
    author: {
      name: 'Zainab Bello',
      role: 'Head of Retail Marketing & Merchandising',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
    targetAudience: 'sales',
    requiresAcknowledgment: false,
    acknowledgedUserIds: ['user-current'],
    pinned: false,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    commentsCount: 3,
    comments: [],
  },
  {
    id: 'notice-4',
    title:
      '🏥 RETAIL EXPANSION: Lekki Phase 2 Branch Grand Opening & Staff Rosters',
    content:
      'We are thrilled to announce that our flagship multi-floor wellness center in Lekki Phase 2 officially opens next month! Temporary cross-posting rosters and shift schedules for volunteering locum and permanent staff have been uploaded below.',
    category: 'hr',
    priority: 'high',
    author: {
      name: 'Dr. Emeka Ofoegbu',
      role: 'VP of Human Resources & Talent Development',
      avatar:
        'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    },
    targetAudience: 'all',
    requiresAcknowledgment: true,
    acknowledgedUserIds: [],
    pinned: false,
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    attachments: [
      { name: 'Lekki_Phase2_Roster_Draft.pdf', size: '2.1 MB', url: '#' },
    ],
    commentsCount: 9,
    comments: [],
  },
  {
    id: 'notice-5',
    title: '🛡️ IT & POS SYSTEM UPDATE: Scheduled Database Migration on Sunday',
    content:
      'Please be advised that the central Enterprise POS and Electronic Medical Record (EMR) databases will undergo scheduled migration and maintenance this Sunday from 01:00 AM to 04:00 AM WAT. Offline cash-drawer billing protocols will be active during this downtime.',
    category: 'it',
    priority: 'urgent',
    author: {
      name: 'Tunde Bakare',
      role: 'Lead Systems Architect & IT Support',
      avatar:
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    },
    targetAudience: 'all',
    requiresAcknowledgment: true,
    acknowledgedUserIds: [],
    pinned: false,
    createdAt: new Date(Date.now() - 3600000 * 96).toISOString(),
    attachments: [
      { name: 'Offline_POS_Billing_Procedure.pdf', size: '890 KB', url: '#' },
    ],
    commentsCount: 4,
    comments: [],
  },
  {
    id: 'notice-6',
    title:
      '✨ INTERNAL REWARD: Q3 Employee of the Quarter & Branch Excellence Winners',
    content:
      'Congratulations to the Victoria Island Central Branch team for winning the highest customer satisfaction score and lowest stock shrinkage variance for Q3! Special shoutout to Sarah in Logistics for leading our community health outreach program.',
    category: 'bulletin',
    priority: 'normal',
    author: {
      name: 'Grace Umoh',
      role: 'Internal Communications & Culture Lead',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
    targetAudience: 'all',
    requiresAcknowledgment: false,
    acknowledgedUserIds: ['user-current'],
    pinned: false,
    createdAt: new Date(Date.now() - 3600000 * 120).toISOString(),
    commentsCount: 19,
    comments: [],
  },
];
