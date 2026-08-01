export interface RuleCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
}

export interface Contact {
  id: string | number;
  name: string;
  email: string;
  phone: string;
  city: string;
  company: string;
  tags: string[];
  dateCreated: string;
  createdAt?: string;
  status: string;
  avatarUrl?: string;
  initials?: string;
  jobTitle?: string;
  industry?: string;
  leadScore?: number;
}

export interface Campaign {
  id: string | number;
  name: string;
  camId: string;
  status: 'Sent' | 'Scheduled' | 'Draft' | 'Sending';
  audience: string;
  date: string;
  time: string;
  openRate?: number;
  deliveryRate?: number;
  sentCount?: number;
  deliveredCount?: number;
  openedCount?: number;
}

export interface Audience {
  id: string | number;
  name: string;
  type: string;
  count: number;
  created: string;
  lastSync: string;
  syncing?: boolean;
  rules?: RuleCondition[];
  filters?: string[];
  createdAt?: string;
}
