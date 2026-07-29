'use client';

import React, { useState } from 'react';
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
} from '@mui/material';
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

// Static Data for Table Rows
const rows = [
  {
    id: 1,
    campaignName: 'Summer Solstice Blast',
    type: 'mail',
    audience: 'All Active Users',
    status: 'Sent',
    date: 'Oct 24, 2023',
    recipients: 12450,
    openRate: 42.5,
  },
  {
    id: 2,
    campaignName: 'Weekly Newsletter #42',
    type: 'send',
    audience: 'Newsletter Subscribers',
    status: 'Sending',
    date: 'Oct 26, 2023',
    recipients: 8200,
    openRate: 12.1,
  },
  {
    id: 3,
    campaignName: 'Black Friday Teaser',
    type: 'schedule',
    audience: 'High-intent Prospects',
    status: 'Scheduled',
    date: 'Nov 01, 2023',
    recipients: 3500,
    openRate: null,
  },
];

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState('Last 30 Days');

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
          {params.value.toLocaleString()}
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
            Overview
          </Typography>
          <Typography variant="h3" sx={{ color: '#0b1c30', fontWeight: 700, mt: 0.5, fontSize: '28px' }}>
            Welcome back, John 👋
          </Typography>
          <Typography variant="body1" sx={{ color: '#464555', mt: 0.5, fontSize: '14px', maxWidth: '600px' }}>
            Here's what's happening with your email marketing today. Your engagement rate is up{' '}
            <Box component="span" sx={{ color: '#3525cd', fontWeight: 700 }}>
              4.2%
            </Box>{' '}
            compared to last week.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
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
        <KpiCard title="Total Contacts" value="2,548" trend="+12%" icon={<Person />} color="#3525cd" />
        <KpiCard title="Total Audiences" value="14" trend="+2%" icon={<Groups />} color="#5c5f61" />
        <KpiCard title="Emails Sent" value="28,450" trend="+18%" icon={<Send />} color="#a44100" />
        <KpiCard title="Active Campaigns" value="42" trend="+5%" icon={<Campaign />} color="#3525cd" />
        <KpiCard title="Delivered" value="27,980" progress={98.3} icon={<Mail />} color="#5c5f61" />
        <KpiCard title="Opened" value="18,420" progress={65.8} icon={<Drafts />} color="#3525cd" />
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
          <Box sx={{ position: 'absolute', top: 20, right: 20 }}>
            <FormControl size="small">
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                sx={{
                  fontSize: '12px',
                  borderRadius: '6px',
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

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ color: '#0b1c30', fontWeight: 700, fontSize: '16px' }}>
              Performance Overview
            </Typography>
            <Typography variant="caption" sx={{ color: '#464555', fontSize: '12px' }}>
              Email Opens vs Delivered
            </Typography>
          </Box>

          {/* Simple Custom Bar Chart */}
          <Box sx={{ height: 260, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', flexGrow: 1, alignItems: 'end', gap: 3, pb: 2 }}>
              {/* Oct 01 */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: '100%', height: 180, bgcolor: 'rgba(53, 37, 205, 0.05)', borderRadius: '3px 3px 0 0', position: 'relative' }}>
                  <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '70%', bgcolor: '#3525cd', borderRadius: '3px 3px 0 0' }} />
                  <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%', bgcolor: 'rgba(53, 37, 205, 0.4)', borderRadius: '3px 3px 0 0' }} />
                </Box>
                <Typography variant="caption" sx={{ color: '#777587', fontSize: '10px' }}>Oct 01</Typography>
              </Box>

              {/* Oct 05 */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: '100%', height: 180, bgcolor: 'rgba(53, 37, 205, 0.05)', borderRadius: '3px 3px 0 0', position: 'relative' }}>
                  <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '85%', bgcolor: '#3525cd', borderRadius: '3px 3px 0 0' }} />
                  <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '75%', bgcolor: 'rgba(53, 37, 205, 0.4)', borderRadius: '3px 3px 0 0' }} />
                </Box>
                <Typography variant="caption" sx={{ color: '#777587', fontSize: '10px' }}>Oct 05</Typography>
              </Box>

              {/* Oct 10 */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: '100%', height: 180, bgcolor: 'rgba(53, 37, 205, 0.05)', borderRadius: '3px 3px 0 0', position: 'relative' }}>
                  <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', bgcolor: '#3525cd', borderRadius: '3px 3px 0 0' }} />
                  <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', bgcolor: 'rgba(53, 37, 205, 0.4)', borderRadius: '3px 3px 0 0' }} />
                </Box>
                <Typography variant="caption" sx={{ color: '#777587', fontSize: '10px' }}>Oct 10</Typography>
              </Box>

              {/* Oct 15 */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: '100%', height: 180, bgcolor: 'rgba(53, 37, 205, 0.05)', borderRadius: '3px 3px 0 0', position: 'relative' }}>
                  <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '90%', bgcolor: '#3525cd', borderRadius: '3px 3px 0 0' }} />
                  <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '80%', bgcolor: 'rgba(53, 37, 205, 0.4)', borderRadius: '3px 3px 0 0' }} />
                </Box>
                <Typography variant="caption" sx={{ color: '#777587', fontSize: '10px' }}>Oct 15</Typography>
              </Box>

              {/* Oct 20 */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: '100%', height: 180, bgcolor: 'rgba(53, 37, 205, 0.05)', borderRadius: '3px 3px 0 0', position: 'relative' }}>
                  <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '75%', bgcolor: '#3525cd', borderRadius: '3px 3px 0 0' }} />
                  <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '65%', bgcolor: 'rgba(53, 37, 205, 0.4)', borderRadius: '3px 3px 0 0' }} />
                </Box>
                <Typography variant="caption" sx={{ color: '#777587', fontSize: '10px' }}>Oct 20</Typography>
              </Box>

              {/* Oct 25 */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: '100%', height: 180, bgcolor: 'rgba(53, 37, 205, 0.05)', borderRadius: '3px 3px 0 0', position: 'relative' }}>
                  <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', bgcolor: '#3525cd', borderRadius: '3px 3px 0 0' }} />
                  <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%', bgcolor: 'rgba(53, 37, 205, 0.4)', borderRadius: '3px 3px 0 0' }} />
                </Box>
                <Typography variant="caption" sx={{ color: '#777587', fontSize: '10px' }}>Oct 25</Typography>
              </Box>

              {/* Today */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: '100%', height: 180, bgcolor: 'rgba(53, 37, 205, 0.05)', borderRadius: '3px 3px 0 0', position: 'relative' }}>
                  <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '95%', bgcolor: '#3525cd', borderRadius: '3px 3px 0 0' }} />
                  <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '85%', bgcolor: 'rgba(53, 37, 205, 0.4)', borderRadius: '3px 3px 0 0' }} />
                </Box>
                <Typography variant="caption" sx={{ color: '#3525cd', fontSize: '10px', fontWeight: 700 }}>Today</Typography>
              </Box>
            </Box>

            {/* Chart Legend */}
            <Box sx={{ display: 'flex', gap: 3, borderTop: '1px solid rgba(199, 196, 216, 0.2)', pt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#3525cd' }} />
                <Typography sx={{ color: '#464555', fontSize: '12px', fontWeight: 500 }}>Delivered</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'rgba(53, 37, 205, 0.4)' }} />
                <Typography sx={{ color: '#464555', fontSize: '12px', fontWeight: 500 }}>Opens</Typography>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Quick Actions (Right hand sidebar layout on desktop) */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Button
            onClick={() => alert('Bulk Import Contacts')}
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
            onClick={() => alert('Create Audience Segment')}
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
            onClick={() => alert('New AI Campaign')}
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
            rows={rows}
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
