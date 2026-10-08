export type NoticeCategory =
  | 'compliance' // Regulatory, NAFDAC updates, cold chain, drug safety
  | 'operations' // Store operations, audits, inventory, shift guidelines
  | 'marketing' // Promotions, new product launches, seasonal campaigns
  | 'hr' // Staff rosters, payroll, leave policies, hiring
  | 'it' // POS systems, EMR software, security patches
  | 'memo' // Executive memos and corporate announcements
  | 'bulletin' // General company news, awards, community outreach
  | 'urgent'; // High-priority emergency alerts

export type NoticePriority = 'normal' | 'high' | 'urgent';

export interface IComment {
  id: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
}

export interface INotice {
  id: string;
  title: string;
  content: string;
  category: NoticeCategory;
  priority: NoticePriority;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  targetAudience:
    | 'all'
    | 'store-staff' // Cashiers, floor attendants, branch customer service
    | 'pharmacists' // Supervising and locum pharmacists, dispensers
    | 'inventory' // Supply chain, warehouse, stock managers
    | 'sales' // Commercial and marketing teams
    | 'hr' // Human resources and talent teams
    | 'it' // Technical support and systems engineers
    | 'executives'; // Leadership and board members
  requiresAcknowledgment: boolean;
  acknowledgedUserIds: string[]; // Mock user IDs who read/acknowledged
  pinned: boolean;
  createdAt: string;
  expiresAt?: string;
  attachments?: { name: string; size: string; url: string }[];
  commentsCount: number;
  comments: IComment[];
}
