'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../utils/api';
import {
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  Paper,
  Chip,
  LinearProgress,
  IconButton,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart } from '@mui/x-charts/LineChart';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Person,
  Groups,
  Send,
  Campaign,
  Mail,
  Drafts,
  Add,
  UploadFile,
  GroupAdd,
  AutoAwesome,
  MoreVert,
} from '@mui/icons-material';
import KpiCard from '../../../components/common/KpiCard';

export default function DashboardPage() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState('Last 30 Days');
  const [stats, setStats] = useState<any>(null);
  const [recentCampaigns, setRecentCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [user, setUser] = useState<any>(null);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/stats');
      const data = res.data;
      setStats(data.stats);
      setRecentCampaigns(data.recentCampaigns);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    
    const saved = localStorage.getItem('user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Columns definition for MUI DataGrid
  const columns: GridColDef[] = [
    {
      field: 'campaignName',
      headerName: 'Campaign Name',
      flex: 1.5,
      renderCell: (params) => {
        const iconColor = '#3525cd';
        let icon = <Mail sx={{ fontSize: '18px' }} />;
        if (params.row.type === 'send') icon = <Send sx={{ fontSize: '18px' }} />;
        if (params.row.type === 'schedule') icon = <Campaign sx={{ fontSize: '18px' }} />;

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, height: '100%' }}>
            <Box
              sx={{
                p: 0.8,
                borderRadius: '6px',
                bgcolor: 'rgba(53, 37, 205, 0.05)',
                color: iconColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {icon}
            </Box>
            <Typography sx={{ fontWeight: 600, color: '#0b1c30', fontSize: '14px' }}>
              {params.value}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'audience',
      headerName: 'Audience',
      flex: 1.2,
      renderCell: (params) => (
        <Typography sx={{ color: '#464555', fontSize: '13.5px' }}>{params.value}</Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => {
        let labelColor = 'success';
        let labelBg = 'rgba(46, 125, 50, 0.1)';
        let textColor = '#2e7d32';

        if (params.value === 'Sending') {
          labelColor = 'primary';
          labelBg = 'rgba(53, 37, 205, 0.1)';
          textColor = '#3525cd';
        } else if (params.value === 'Scheduled') {
          labelColor = 'warning';
          labelBg = 'rgba(237, 108, 2, 0.1)';
          textColor = '#ed6c02';
        }

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Chip
              label={params.value}
              sx={{
                bgcolor: labelBg,
                color: textColor,
                fontWeight: 700,
                fontSize: '11px',
                height: 24,
                borderRadius: '9999px',
                border: 'none',
                px: 0.5,
              }}
            />
          </Box>
        );
      },
    },
    {
      field: 'date',
      headerName: 'Date',
      flex: 1,
      renderCell: (params) => (
        <Typography sx={{ color: '#464555', fontSize: '13.5px' }}>{params.value}</Typography>
      ),
    },
    {
      field: 'recipients',
      headerName: 'Recipients',
      flex: 1,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 700, color: '#0b1c30', fontSize: '13.5px' }}>
          {params.value ? params.value.toLocaleString() : "-"}
        </Typography>
      ),
    },
    {
      field: 'openRate',
      headerName: 'Open Rate',
      flex: 1.2,
      renderCell: (params) => {
        if (params.value === null) {
          return (
            <Typography sx={{ color: '#777587', fontStyle: 'italic', fontSize: '12px' }}>
              Not started
            </Typography>
          );
        }
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', height: '100%' }}>
            <Typography sx={{ fontWeight: 700, color: '#0b1c30', fontSize: '13.5px', minWidth: 40 }}>
              {params.value}%
            </Typography>
            <Box sx={{ flexGrow: 1, maxW: 64 }}>
              <LinearProgress
                variant="determinate"
                value={params.value}
                sx={{
                  height: 4,
                  borderRadius: 2,
                  bgcolor: '#e5eeff',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: '#3525cd',
                    borderRadius: 2,
                  },
                }}
              />
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      flex: 0.3,
      renderCell: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', width: '100%', height: '100%' }}>
          <IconButton size="small">
            <MoreVert sx={{ color: '#777587', fontSize: '18px' }} />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Welcome Header */}
      <Box
        component="header"
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'flex-end' },
          gap: 3,
        }}
      >
        <Box>
          <Typography variant="caption" sx={{ color: '#3525cd', fontWeight: 600, tracking: '0.1em', textTransform: 'uppercase', fontSize: '12px' }}>
            Welcome back, {user?.name || 'User'} 👋
          </Typography>
          <Typography variant="h3" sx={{ color: '#0b1c30', fontWeight: 700, mt: 0.5, fontSize: '28px' }}>
            Analytics
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => router.push('/campaigns/create')}
          sx={{
            px: 3,
            py: 1.2,
            boxShadow: '0 4px 14px rgba(53, 37, 205, 0.2)',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 600,
            textTransform: 'none',
          }}
        >
          New Campaign
        </Button>
      </Box>

      {/* KPI Cards Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 3 }}>
        <KpiCard title="Total Contacts" value={stats?.contacts?.toLocaleString() ?? '0'} trend="+12%" icon={<Person />} color="#3525cd" />
        <KpiCard title="Total Audiences" value={stats?.segments?.toLocaleString() ?? '0'} trend="+2%" icon={<Groups />} color="#5c5f61" />
        <KpiCard title="Total Campaigns" value={stats?.campaigns?.toLocaleString() ?? '0'} trend="+5%" icon={<Campaign />} color="#3525cd" />
        <KpiCard title="Delivered Rate" value={stats ? `${stats.deliveryRate}%` : '0%'} progress={stats?.deliveryRate ?? 0} icon={<Mail />} color="#5c5f61" />
        <KpiCard title="Opened Rate" value={stats ? `${stats.openRate}%` : '0%'} progress={stats?.openRate ?? 0} icon={<Drafts />} color="#3525cd" />
      </Box>

      {/* Main Grid: Chart & Campaign Table */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '8fr 4fr' }, gap: 4, alignItems: 'start' }}>

        {/* Performance Overview (Chart Card) */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: '12px',
            border: '1px solid rgba(199, 196, 216, 0.3)',
            bgcolor: '#ffffff',
            position: 'relative',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 4 }}>
            <Box>
              <Typography variant="h6" sx={{ color: '#0b1c30', fontWeight: 700, fontSize: '16px' }}>
                Performance Overview
              </Typography>
              <Typography variant="caption" sx={{ color: '#464555', fontSize: '12px' }}>
                Email Opens vs Delivered
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', alignSelf: { xs: 'stretch', sm: 'auto' }, justifyContent: 'space-between' }}>
              <ToggleButtonGroup
                value={chartType}
                exclusive
                onChange={(e, next) => next && setChartType(next)}
                size="small"
                sx={{
                  bgcolor: '#f8f9ff',
                  borderRadius: '8px',
                  p: '3px',
                  border: '1px solid rgba(199, 196, 216, 0.2)',
                  '& .MuiToggleButton-root': {
                    border: 'none',
                    borderRadius: '6px',
                    px: 1.5,
                    py: 0.5,
                    textTransform: 'none',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#464555',
                    '&.Mui-selected': {
                      bgcolor: '#ffffff',
                      color: '#3525cd',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                      '&:hover': {
                        bgcolor: '#ffffff',
                      },
                    },
                  },
                }}
              >
                <ToggleButton value="bar">Bar Chart</ToggleButton>
                <ToggleButton value="line">Line Chart</ToggleButton>
              </ToggleButtonGroup>

              <FormControl size="small">
                <Select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  sx={{
                    fontSize: '12px',
                    borderRadius: '8px',
                    bgcolor: '#f8f9ff',
                    border: 'none',
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none',
                    },
                  }}
                >
                  <MenuItem value="Last 30 Days">Last 30 Days</MenuItem>
                  <MenuItem value="Last 90 Days">Last 90 Days</MenuItem>
                  <MenuItem value="Last Year">Last Year</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Box sx={{ height: 320, width: '100%' }}>
            {(() => {
              const sentCampaigns = recentCampaigns.filter(c => c.status === 'Sent');
              const chartCampaigns = sentCampaigns.length > 0
                ? [...sentCampaigns].reverse()
                : [
                  { campaignName: 'Welcome Email', recipients: 120, deliveredCount: 118, openedCount: 84 },
                  { campaignName: 'Jan Newsletter', recipients: 150, deliveredCount: 147, openedCount: 95 },
                  { campaignName: 'Product Promo', recipients: 200, deliveredCount: 195, openedCount: 110 },
                  { campaignName: 'User Feedback', recipients: 180, deliveredCount: 178, openedCount: 130 },
                ];

              // Prepend baseline "Launch" point if there is only 1 campaign to draw a line connection
              const displayCampaigns = chartCampaigns.length === 1
                ? [
                    { campaignName: 'Launch', recipients: 0, deliveredCount: 0, openedCount: 0 },
                    ...chartCampaigns
                  ]
                : chartCampaigns;

              const chartLabels = displayCampaigns.map((c) => c.campaignName);
              const deliveredSeries = displayCampaigns.map((c) => c.deliveredCount ?? c.recipients ?? 0);
              const openedSeries = displayCampaigns.map((c) => c.openedCount ?? 0);

              if (chartType === 'bar') {
                return (
                  <BarChart
                    xAxis={[{ scaleType: 'band', data: chartLabels }]}
                    series={[
                      { data: deliveredSeries, label: 'Delivered', color: '#2e7d32' },
                      { data: openedSeries, label: 'Opened', color: '#3525cd' },
                    ]}
                    height={300}
                    margin={{ top: 20, bottom: 40, left: 40, right: 10 }}
                  />
                );
              } else {
                return (
                  <LineChart
                    xAxis={[{ scaleType: 'point', data: chartLabels }]}
                    series={[
                      { data: deliveredSeries, label: 'Delivered', color: '#2e7d32', showMark: true },
                      { data: openedSeries, label: 'Opened', color: '#3525cd', showMark: true },
                    ]}
                    height={300}
                    margin={{ top: 20, bottom: 40, left: 40, right: 10 }}
                  />
                );
              }
            })()}
          </Box>
        </Paper>

        {/* Quick Actions (Right hand sidebar layout on desktop) */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Button
            onClick={() => router.push('/contacts')}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              height: 120,
              p: 2.5,
              borderRadius: '12px',
              bgcolor: '#3525cd',
              color: '#ffffff',
              textAlign: 'left',
              boxShadow: '0 4px 14px rgba(53, 37, 205, 0.2)',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                bgcolor: '#3323cc',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <UploadFile sx={{ fontSize: '32px', opacity: 0.8 }} />
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '14px' }}>Import Contacts</Typography>
              <Typography sx={{ opacity: 0.8, fontSize: '11px' }}>Bulk upload via CSV or XLSX</Typography>
            </Box>
          </Button>

          <Button
            onClick={() => router.push('/audiences/create')}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              height: 120,
              p: 2.5,
              borderRadius: '12px',
              border: '1px solid rgba(199, 196, 216, 0.3)',
              bgcolor: '#ffffff',
              color: '#0b1c30',
              textAlign: 'left',
              '&:hover': {
                bgcolor: '#f8f9ff',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <GroupAdd sx={{ fontSize: '32px', color: '#3525cd' }} />
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '14px' }}>Create Audience</Typography>
              <Typography sx={{ color: '#464555', fontSize: '11px' }}>Segment your list</Typography>
            </Box>
          </Button>

          <Button
            onClick={() => router.push('/campaigns/create')}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              height: 120,
              p: 2.5,
              borderRadius: '12px',
              border: '1px solid rgba(199, 196, 216, 0.3)',
              bgcolor: '#ffffff',
              color: '#0b1c30',
              textAlign: 'left',
              '&:hover': {
                bgcolor: '#f8f9ff',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <AutoAwesome sx={{ fontSize: '32px', color: '#3525cd' }} />
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '14px' }}>New Campaign</Typography>
              <Typography sx={{ color: '#464555', fontSize: '11px' }}>Use AI to generate copy</Typography>
            </Box>
          </Button>
        </Box>
      </Box>

      {/* Recent Campaigns DataGrid */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '12px',
          border: '1px solid rgba(199, 196, 216, 0.3)',
          bgcolor: '#ffffff',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 3, borderBottom: '1px solid rgba(199, 196, 216, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ color: '#0b1c30', fontWeight: 700, fontSize: '16px' }}>
            Recent Campaigns
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant="outlined"
              size="small"
              sx={{
                fontSize: '12px',
                borderColor: '#c7c4d8',
                color: '#464555',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#0b1c30',
                  bgcolor: '#f8f9ff',
                },
              }}
            >
              Export Report
            </Button>
            <Button
              variant="contained"
              size="small"
              sx={{
                fontSize: '12px',
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              See All
            </Button>
          </Box>
        </Box>

        {/* DataGrid View */}
        <Box sx={{ width: '100%' }}>
          <DataGrid
            rows={recentCampaigns}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 5 },
              },
            }}
            pageSizeOptions={[5, 10]}
            disableRowSelectionOnClick
            autoHeight
            sx={{
              border: 'none',
              '& .MuiDataGrid-columnHeaders': {
                bgcolor: '#f8f9ff',
                borderBottom: '1px solid rgba(199, 196, 216, 0.2)',
                '& .MuiDataGrid-columnHeaderTitle': {
                  fontWeight: 600,
                  color: '#464555',
                  fontSize: '13px',
                },
              },
              '& .MuiDataGrid-row': {
                borderBottom: '1px solid rgba(199, 196, 216, 0.1)',
                '&:hover': {
                  bgcolor: 'rgba(229, 238, 255, 0.25)',
                },
              },
              '& .MuiDataGrid-cell': {
                borderBottom: 'none',
                py: 1,
              },
              '& .MuiDataGrid-footerContainer': {
                borderTop: '1px solid rgba(199, 196, 216, 0.2)',
              },
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
}
