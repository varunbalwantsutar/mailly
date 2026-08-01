'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '../../../../utils/api';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Avatar,
  Divider,
  Skeleton,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Search,
  FilterList,
  Edit,
  Delete,
  ContentCopy,
  TrendingUp,
  BarChart,
  Sell,
  History,
  ChevronLeft,
  ArrowBack,
} from '@mui/icons-material';
import KpiCard from '../../../../components/common/KpiCard';

interface AudienceDetail {
  name: string;
  type: string;
  idString: string;
  contactsCount: number;
  createdDate: string;
  lastUpdated: string;
  source: string;
  filters: Array<{ label: string; iconType: 'tag' | 'history' }>;
  openRate: string;
  openTrend: string;
  growthRate: string;
  conversionRate: string;
  targetConversion: string;
  contacts: Array<{
    id: number;
    name: string;
    email: string;
    location: string;
    tags: string[];
    activityText: string;
    activityPercent: number;
    avatarUrl?: string;
    initials?: string;
  }>;
}

const AUDIENCE_DETAILS_MOCK: Record<string, AudienceDetail> = {
  '1': {
    name: 'Active Leads',
    type: 'Dynamic Segment',
    idString: '#VIP-2024-001',
    contactsCount: 5240,
    createdDate: 'Jan 12, 2024',
    lastUpdated: '2 mins ago',
    source: 'Shopify Integration',
    filters: [
      { label: 'Status = Lead', iconType: 'tag' },
      { label: 'Last Sent < 30 days', iconType: 'history' },
    ],
    openRate: '68.2%',
    openTrend: '+4.3%',
    growthRate: '12.5%',
    conversionRate: '4.8%',
    targetConversion: '5%',
    contacts: [
      { id: 1, name: 'Sarah Jenkins', email: 's.jenkins@enterprise.com', location: 'San Francisco, CA', tags: ['VIP', 'Tech'], activityText: 'Opened 12m ago', activityPercent: 75, avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDa9MPh65h02Xghb8Zoto6soSYsKPaCPrXC8IHR0EYjcglqnWx6AStbSf8odghLuRGXzQ-P4vQIIAlJy8BKVgfqi_EKLKUV5FskSYydCHlp6BJI_c323V-bpp--rQ6dYsNIObBA0mmjd5eY8f75dD39hVvLqEl1mqL1hDya_QqDtOTOiXEGCb015govwtL17CpyKW8ANxQe7mZknIDyd9QMij2gP7J32S2U66FK22FVwZplCNth2nLZ' },
      { id: 2, name: 'Marcus Thorne', email: 'm.thorne@design.studio', location: 'New York, NY', tags: ['VIP', 'Agency'], activityText: 'Clicked 2h ago', activityPercent: 50, avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCH4PAodaDcFG3U1DoEJbpsLruUQcGEOiWi9gVIRpcIarWjjPKg4oCVpNUJa7XvaGvcMio4LExEo2fgCbanKLRU2lv4eMOXwB6lRdsCqoAzpCctfxtEAGsRsqHV7WD_P02lpVfzg6xq7L-pgZl-mtggVsS8-midmbb8kDefYBoL390iH52TLKr_OMlNyMMQEiY8JM04XsKZ_sEdBPLTCuWHnFc4ZamzOaDX7LZUpaqPFFAcUv1w7Vod' },
      { id: 3, name: 'Elena Drago', email: 'elena.d@fintech.io', location: 'London, UK', tags: ['VIP'], activityText: 'Active now', activityPercent: 100, initials: 'ED' },
    ]
  },
  '2': {
    name: 'Q4 Campaign',
    type: 'Static List',
    idString: '#VIP-2024-002',
    contactsCount: 1820,
    createdDate: 'Oct 02, 2023',
    lastUpdated: '2 days ago',
    source: 'CSV Upload',
    filters: [
      { label: 'Tag = Q4_Promo', iconType: 'tag' },
      { label: 'Source = Import', iconType: 'history' },
    ],
    openRate: '54.6%',
    openTrend: '+1.2%',
    growthRate: '8.4%',
    conversionRate: '3.1%',
    targetConversion: '4%',
    contacts: [
      { id: 1, name: 'Alex Thompson', email: 'alex@designlab.io', location: 'San Francisco, CA', tags: ['Q4', 'Design'], activityText: 'Opened 1d ago', activityPercent: 60, initials: 'AT' },
      { id: 2, name: 'Sarah Miller', email: 'sarah.m@gmail.com', location: 'New York, NY', tags: ['Q4'], activityText: 'Clicked 3d ago', activityPercent: 40, initials: 'SM' },
    ]
  },
  '3': {
    name: 'High Value Customers',
    type: 'Dynamic Segment',
    idString: '#VIP-2024-003',
    contactsCount: 3105,
    createdDate: 'Feb 28, 2024',
    lastUpdated: '1 hr ago',
    source: 'API Sync',
    filters: [
      { label: 'LTV > $500', iconType: 'tag' },
      { label: 'Region = EMEA', iconType: 'history' },
    ],
    openRate: '72.8%',
    openTrend: '+6.1%',
    growthRate: '15.2%',
    conversionRate: '6.4%',
    targetConversion: '6%',
    contacts: [
      { id: 1, name: 'Elena Drago', email: 'elena.d@fintech.io', location: 'London, UK', tags: ['VIP', 'EMEA'], activityText: 'Active now', activityPercent: 100, initials: 'ED' },
    ]
  },
  '4': {
    name: 'Newsletter Subscriptions',
    type: 'Static List',
    idString: '#VIP-2024-004',
    contactsCount: 12400,
    createdDate: 'Nov 15, 2023',
    lastUpdated: '5 days ago',
    source: 'Website Form',
    filters: [
      { label: 'Source = Website', iconType: 'tag' }
    ],
    openRate: '41.2%',
    openTrend: '-0.5%',
    growthRate: '6.2%',
    conversionRate: '2.4%',
    targetConversion: '3%',
    contacts: [
      { id: 1, name: 'Alex Thompson', email: 'alex@designlab.io', location: 'San Francisco, CA', tags: ['Newsletter'], activityText: 'Opened 5d ago', activityPercent: 20, initials: 'AT' },
      { id: 2, name: 'Sarah Miller', email: 'sarah.m@gmail.com', location: 'New York, NY', tags: ['Newsletter'], activityText: 'Clicked 6d ago', activityPercent: 30, initials: 'SM' },
    ]
  }
};

const DEFAULT_DETAILS: AudienceDetail = {
  name: 'VIP Customers',
  type: 'Segment',
  idString: '#VIP-2024-001',
  contactsCount: 1240,
  createdDate: 'Oct 12, 2023',
  lastUpdated: '2 hours ago',
  source: 'Shopify Integration',
  filters: [
    { label: 'Tag = VIP', iconType: 'tag' },
    { label: 'Last Sent < 30 days', iconType: 'history' },
  ],
  openRate: '68.2%',
  openTrend: '+4.3%',
  growthRate: '12.5%',
  conversionRate: '4.8%',
  targetConversion: '5%',
  contacts: [
    { id: 1, name: 'Sarah Jenkins', email: 's.jenkins@enterprise.com', location: 'San Francisco, CA', tags: ['VIP', 'Tech'], activityText: 'Opened 12m ago', activityPercent: 75, avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDa9MPh65h02Xghb8Zoto6soSYsKPaCPrXC8IHR0EYjcglqnWx6AStbSf8odghLuRGXzQ-P4vQIIAlJy8BKVgfqi_EKLKUV5FskSYydCHlp6BJI_c323V-bpp--rQ6dYsNIObBA0mmjd5eY8f75dD39hVvLqEl1mqL1hDya_QqDtOTOiXEGCb015govwtL17CpyKW8ANxQe7mZknIDyd9QMij2gP7J32S2U66FK22FVwZplCNth2nLZ' },
    { id: 2, name: 'Marcus Thorne', email: 'm.thorne@design.studio', location: 'New York, NY', tags: ['VIP', 'Agency'], activityText: 'Clicked 2h ago', activityPercent: 50, avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCH4PAodaDcFG3U1DoEJbpsLruUQcGEOiWi9gVIRpcIarWjjPKg4oCVpNUJa7XvaGvcMio4LExEo2fgCbanKLRU2lv4eMOXwB6lRdsCqoAzpCctfxtEAGsRsqHV7WD_P02lpVfzg6xq7L-pgZl-mtggVsS8-midmbb8kDefYBoL390iH52TLKr_OMlNyMMQEiY8JM04XsKZ_sEdBPLTCuWHnFc4ZamzOaDX7LZUpaqPFFAcUv1w7Vod' },
    { id: 3, name: 'Elena Drago', email: 'elena.d@fintech.io', location: 'London, UK', tags: ['VIP'], activityText: 'Active now', activityPercent: 100, initials: 'ED' },
  ]
};

export default function AudienceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [audience, setAudience] = useState<AudienceDetail>(DEFAULT_DETAILS);
  const [filterQuery, setFilterQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAudienceDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/audiences/${id}`);
        setAudience(res.data.audience);
      } catch (err) {
        console.error(err);
        if (AUDIENCE_DETAILS_MOCK[id]) {
          setAudience(AUDIENCE_DETAILS_MOCK[id]);
        } else {
          setAudience(DEFAULT_DETAILS);
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAudienceDetails();
    }
  }, [id]);

  const filteredContacts = audience.contacts.filter((c) =>
    c.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'CONTACT',
      flex: 1.5,
      renderCell: (params) => {
        const c = params.row;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, height: '100%' }}>
            {c.avatarUrl ? (
              <Avatar src={c.avatarUrl} sx={{ width: 32, height: 32 }} />
            ) : (
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#eff4ff', color: '#3525cd', fontSize: '12px', fontWeight: 700 }}>
                {c.initials}
              </Avatar>
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography sx={{ fontWeight: 600, color: '#0b1c30', fontSize: '13px', lineHeight: 1.2 }}>
                {c.name}
              </Typography>
              <Typography sx={{ color: '#777587', fontSize: '10.5px' }}>
                {c.email}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'location',
      headerName: 'LOCATION',
      flex: 1.2,
      renderCell: (params) => (
        <Typography sx={{ color: '#0b1c30', fontSize: '13px', display: 'flex', alignItems: 'center', height: '100%' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'tags',
      headerName: 'TAGS',
      flex: 1.2,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center', height: '100%' }}>
          {params.value.map((tag: string) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              sx={{
                bgcolor: tag === 'VIP' ? 'rgba(53, 37, 205, 0.08)' : 'rgba(92, 95, 97, 0.08)',
                color: tag === 'VIP' ? '#3525cd' : '#5c5f61',
                fontWeight: 700,
                fontSize: '9px',
                height: 18,
                borderRadius: '4px',
              }}
            />
          ))}
        </Box>
      ),
    },
    {
      field: 'activityText',
      headerName: 'ACTIVITY',
      flex: 1.2,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => {
        const row = params.row;
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end', height: '100%', width: '100%' }}>
            <Typography sx={{ color: '#0b1c30', fontSize: '12.5px', fontWeight: 600 }}>{row.activityText}</Typography>
            <Box sx={{ width: 64, height: 4, bgcolor: 'rgba(199, 196, 216, 0.3)', borderRadius: '99px', overflow: 'hidden', mt: 0.5 }}>
              <Box
                sx={{
                  height: '100%',
                  width: `${row.activityPercent}%`,
                  bgcolor: '#3525cd',
                  borderRadius: '99px',
                  animation: row.activityPercent === 100 ? 'pulse 2s infinite' : 'none',
                  '@keyframes pulse': { '0%': { opacity: 0.6 }, '50%': { opacity: 1 }, '100%': { opacity: 0.6 } }
                }}
              />
            </Box>
          </Box>
        );
      },
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 64px)' }}>
      
      {/* Hero Header Section */}
      <Box sx={{ position: 'relative', px: 4, pt: 4, pb: 6, borderBottom: '1px solid rgba(199, 196, 216, 0.2)', bg: 'linear-gradient(135deg, rgba(53, 37, 205, 0.03) 0%, rgba(248, 249, 255, 1) 100%)' }}>
        
        {/* Back Link */}
        <Button
          startIcon={<ArrowBack sx={{ fontSize: '16px' }} />}
          onClick={() => router.push('/audiences')}
          sx={{ textTransform: 'none', color: '#5c5f61', fontSize: '12.5px', fontWeight: 600, mb: 2, p: 0, minWidth: 0, '&:hover': { bgcolor: 'transparent', color: '#3525cd' } }}
        >
          Back to Audiences
        </Button>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Chip
                label={audience.type.toUpperCase()}
                size="small"
                sx={{ bgcolor: 'rgba(53, 37, 205, 0.08)', color: '#3525cd', fontWeight: 700, fontSize: '10px', height: 20 }}
              />
              <Typography variant="caption" sx={{ color: '#777587', fontWeight: 500 }}>
                ID: {audience.idString}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mt: 0.5 }}>
              <Typography variant="h4" sx={{ color: '#0b1c30', fontWeight: 800, tracking: '-0.02em', fontSize: '26px' }}>
                {audience.name}
              </Typography>
              <Chip
                label={`${audience.contactsCount.toLocaleString()} Contacts`}
                sx={{ bgcolor: '#3525cd', color: '#ffffff', fontWeight: 600, fontSize: '12px', height: 24, boxShadow: '0 2px 6px rgba(53,37,205,0.15)' }}
              />
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant="outlined"
              startIcon={<ContentCopy sx={{ fontSize: '16px' }} />}
              onClick={() => alert('Duplicate flow')}
              sx={{ textTransform: 'none', color: '#464555', borderColor: '#c7c4d8', fontWeight: 600, borderRadius: '10px', fontSize: '13px', py: 1 }}
            >
              Duplicate
            </Button>
            <Button
              variant="outlined"
              startIcon={<Edit sx={{ fontSize: '16px' }} />}
              onClick={() => alert('Edit flow')}
              sx={{ textTransform: 'none', color: '#464555', borderColor: '#c7c4d8', fontWeight: 600, borderRadius: '10px', fontSize: '13px', py: 1 }}
            >
              Edit
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<Delete sx={{ fontSize: '16px' }} />}
              onClick={() => {
                alert('Segment deleted');
                router.push('/audiences');
              }}
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '10px', fontSize: '13px', py: 1, boxShadow: '0 2px 8px rgba(186, 26, 26, 0.15)' }}
            >
              Delete
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Main Workspace Layout */}
      <Box sx={{ px: 4, py: 4, display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 2fr' }, gap: 4 }}>
        
        {/* Left Side: Overview & Filters Card */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '16px',
              border: '1px solid rgba(199, 196, 216, 0.3)',
              bgcolor: '#ffffff',
            }}
          >
            <Typography variant="h6" sx={{ color: '#0b1c30', fontWeight: 700, fontSize: '15px', mb: 3 }}>
              Audience Overview
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1.5, borderBottom: '1px solid rgba(199, 196, 216, 0.15)' }}>
                <Typography sx={{ color: '#777587', fontSize: '13px', fontWeight: 500 }}>Created Date</Typography>
                <Typography sx={{ color: '#0b1c30', fontSize: '13px', fontWeight: 600 }}>{audience.createdDate}</Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1.5, borderBottom: '1px solid rgba(199, 196, 216, 0.15)' }}>
                <Typography sx={{ color: '#777587', fontSize: '13px', fontWeight: 500 }}>Last Updated</Typography>
                <Typography sx={{ color: '#0b1c30', fontSize: '13px', fontWeight: 600 }}>{audience.lastUpdated}</Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1.5, borderBottom: '1px solid rgba(199, 196, 216, 0.15)' }}>
                <Typography sx={{ color: '#777587', fontSize: '13px', fontWeight: 500 }}>Source</Typography>
                <Typography sx={{ color: '#0b1c30', fontSize: '13px', fontWeight: 600 }}>{audience.source}</Typography>
              </Box>

              {/* Applied Filters Block */}
              <Box sx={{ pt: 1 }}>
                <Typography sx={{ color: '#777587', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', mb: 1.5 }}>
                  Applied Filters
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {audience.filters.map((filter) => (
                    <Box
                      key={filter.label}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        px: 2,
                        py: 1.2,
                        bgcolor: 'rgba(53, 37, 205, 0.03)',
                        border: '1px solid rgba(53, 37, 205, 0.1)',
                        borderRadius: '8px',
                      }}
                    >
                      {filter.iconType === 'tag' ? (
                        <Sell sx={{ color: '#3525cd', fontSize: '14px' }} />
                      ) : (
                        <History sx={{ color: '#3525cd', fontSize: '14px' }} />
                      )}
                      <Typography sx={{ color: '#3525cd', fontSize: '12px', fontWeight: 600 }}>
                        {filter.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Right Side: KPI metrics & Table Grid */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          
          {/* KPI metrics */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 3 }}>
            
            {/* Open Rate (highlighted in primary color) */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '12px',
                bgcolor: '#3525cd',
                color: '#ffffff',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 4px 15px rgba(53, 37, 205, 0.2)',
              }}
            >
              <Box sx={{ position: 'absolute', right: -15, bottom: -15, opacity: 0.1, color: '#ffffff' }}>
                <TrendingUp sx={{ fontSize: '100px' }} />
              </Box>
              <Typography sx={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.8 }}>
                Open Rate
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mt: 1.5 }}>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>{audience.openRate}</Typography>
                <Chip
                  label={audience.openTrend}
                  size="small"
                  sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: '#ffffff', fontWeight: 700, fontSize: '10px', height: 18 }}
                />
              </Box>
            </Paper>

            {/* Growth Rate */}
            <KpiCard
              title="Growth Rate"
              value={audience.growthRate}
              trend="Monthly"
              icon={<TrendingUp />}
              color="#3525cd"
            />

            {/* Conversion */}
            <KpiCard
              title="Conversion"
              value={audience.conversionRate}
              trend={`Target: ${audience.targetConversion}`}
              icon={<BarChart />}
              color="#5c5f61"
            />
          </Box>

          {/* Contacts Data Table Card */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: '16px',
              border: '1px solid rgba(199, 196, 216, 0.3)',
              overflow: 'hidden',
              bgcolor: '#ffffff',
            }}
          >
            {/* Table Header toolbar */}
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h6" sx={{ color: '#0b1c30', fontWeight: 700, fontSize: '15px' }}>
                Matching Contacts
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: { xs: 1, sm: 0 }, maxWidth: '280px', width: '100%' }}>
                <TextField
                  placeholder="Filter table..."
                  size="small"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search sx={{ color: '#464555', fontSize: '18px' }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    width: '100%',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      bgcolor: '#f8f9ff',
                    },
                  }}
                />
                <IconButton sx={{ border: '1px solid rgba(199, 196, 216, 0.3)', borderRadius: '8px', p: 1 }}>
                  <FilterList sx={{ fontSize: '18px', color: '#464555' }} />
                </IconButton>
              </Box>
            </Box>

            {/* DataGrid Component */}
            {loading ? (
              <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {Array.from({ length: 3 }).map((_, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                    <Skeleton variant="circular" width={32} height={32} />
                    <Skeleton variant="text" width="30%" height={24} />
                    <Skeleton variant="text" width="25%" height={24} />
                    <Skeleton variant="text" width="15%" height={24} />
                    <Skeleton variant="text" width="15%" height={24} />
                  </Box>
                ))}
              </Box>
            ) : filteredContacts.length === 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6, gap: 1.5 }}>
                <Typography sx={{ color: '#777587', fontSize: '13px', fontWeight: 600 }}>No matching contacts found</Typography>
              </Box>
            ) : (
              <Box sx={{ width: '100%', height: 320 }}>
                <DataGrid
                  rows={filteredContacts}
                  columns={columns}
                  initialState={{
                    pagination: {
                      paginationModel: { page: 0, pageSize: 5 },
                    },
                  }}
                  pageSizeOptions={[5, 10]}
                  disableRowSelectionOnClick
                  rowHeight={58}
                  sx={{
                    border: 'none',
                    '& .MuiDataGrid-columnHeaders': {
                      bgcolor: '#f8f9ff',
                      borderBottom: '1px solid rgba(199, 196, 216, 0.2)',
                      '& .MuiDataGrid-columnHeaderTitle': {
                        fontWeight: 600,
                        color: '#464555',
                        fontSize: '11px',
                        letterSpacing: '0.05em',
                      },
                    },
                    '& .MuiDataGrid-row': {
                      borderBottom: '1px solid rgba(199, 196, 216, 0.15)',
                      transition: 'transform 0.2s ease-out',
                      '&:hover': {
                        bgcolor: 'rgba(229, 238, 255, 0.15)',
                        transform: 'translateX(4px)',
                      },
                    },
                    '& .MuiDataGrid-cell': {
                      borderBottom: 'none',
                    },
                    '& .MuiDataGrid-footerContainer': {
                      borderTop: '1px solid rgba(199, 196, 216, 0.2)',
                      bgcolor: '#f8f9ff',
                    },
                  }}
                />
              </Box>
            )}
          </Paper>
        </Box>

      </Box>

    </Box>
  );
}
