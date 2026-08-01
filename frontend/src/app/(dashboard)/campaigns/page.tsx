'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../utils/api';
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
  Menu,
  MenuItem,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import {
  Search,
  FilterList,
  Add,
  MoreVert,
  Campaign,
  Event,
  CheckCircle,
  EditNote,
  IosShare,
  Refresh,
  SwapVert,
  BarChart,
  Analytics,
} from '@mui/icons-material';
import KpiCard from '../../../components/common/KpiCard';

interface CampaignData {
  id: number;
  name: string;
  camId: string;
  status: 'Sent' | 'Scheduled' | 'Draft' | 'Sending';
  audience: string;
  date: string;
  time: string;
  openRate?: number;
  targetOpenRate?: number;
  deliveryRate?: number;
}

const INITIAL_CAMPAIGNS: CampaignData[] = [
  {
    id: 1,
    name: 'Summer Sale 2024',
    camId: 'CAM-9921',
    status: 'Sent',
    audience: 'All Users',
    date: 'Oct 12, 2024',
    time: '02:45 PM',
    openRate: 42.5,
    targetOpenRate: 40,
    deliveryRate: 98.2,
  },
  {
    id: 2,
    name: 'Product Update',
    camId: 'CAM-9944',
    status: 'Scheduled',
    audience: 'Premium Segment',
    date: 'Oct 20, 2024',
    time: '10:00 AM',
  },
  {
    id: 3,
    name: 'Onboarding Sequence',
    camId: 'CAM-9950',
    status: 'Draft',
    audience: 'New Signups',
    date: '—',
    time: '—',
  },
  {
    id: 4,
    name: 'Quarterly Review',
    camId: 'CAM-9902',
    status: 'Sending',
    audience: 'Active Subscribers',
    date: 'In Progress',
    time: 'Started 12m ago',
    openRate: 12.1,
    targetOpenRate: 15,
    deliveryRate: 44.0,
  },
];

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Status');
  const [audienceFilter, setAudienceFilter] = useState('Audience');
  const [dateRangeFilter, setDateRangeFilter] = useState('Date Range');
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({
    type: 'include',
    ids: new Set(),
  });

  // Action Menu Anchor State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuCampaignId, setMenuCampaignId] = useState<null | string | number>(null);

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    status: 'Draft' as 'Sent' | 'Scheduled' | 'Draft' | 'Sending',
    audience: 'All Users',
  });

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await api.get('/campaigns');
      const mapped = res.data.campaigns.map((c: any) => {
        let status = 'Draft';
        if (c.status === 'SENT') status = 'Sent';
        else if (c.status === 'SCHEDULED') status = 'Scheduled';
        else if (c.status === 'SENDING') status = 'Sending';
        else if (c.status === 'DRAFT') status = 'Draft';
        else status = c.status; // fallback

        return {
          ...c,
          status,
        };
      });
      setCampaigns(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic metrics
  const totalCampaignsCount = campaigns.length;
  const scheduledCount = campaigns.filter(c => c.status === 'Scheduled').length;
  const sentCount = campaigns.filter(c => c.status === 'Sent').length;
  const draftsCount = campaigns.filter(c => c.status === 'Draft').length;

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchCampaigns();
    setIsRefreshing(false);
  };

  const handleActionMenuOpen = (e: React.MouseEvent<HTMLButtonElement>, id: string | number) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
    setMenuCampaignId(id);
  };

  const handleActionMenuClose = () => {
    setAnchorEl(null);
    setMenuCampaignId(null);
  };

  const handleDeleteCampaign = async (id: string | number) => {
    try {
      await api.delete(`/campaigns/${id}`);
      handleActionMenuClose();
      fetchCampaigns();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to delete campaign');
    }
  };

  const handleDuplicateCampaign = async (id: string | number) => {
    try {
      await api.post(`/campaigns/${id}/duplicate`);
      alert('Campaign duplicated successfully!');
      fetchCampaigns();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to duplicate campaign');
    }
  };

  const handleCreateCampaignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect to creator page passing the campaign name
    router.push(`/campaigns/create?name=${encodeURIComponent(newCampaign.name)}`);
  };

  // Filter logic
  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.camId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'Status' || c.status === statusFilter;
    const matchesAudience = audienceFilter === 'Audience' || c.audience === audienceFilter;
    return matchesSearch && matchesStatus && matchesAudience;
  });

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'CAMPAIGN NAME',
      flex: 1.5,
      renderCell: (params) => {
        const row = params.row;
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
            <Typography sx={{ fontWeight: 600, color: '#0b1c30', fontSize: '13px', lineHeight: 1.2 }}>
              {row.name}
            </Typography>
            <Typography sx={{ color: '#777587', fontSize: '10.5px', fontFamily: 'monospace' }}>
              ID: {row.camId}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'status',
      headerName: 'STATUS',
      flex: 1.0,
      renderCell: (params) => {
        const status = params.value as string;
        let bgcolor = 'rgba(92, 95, 97, 0.08)';
        let color = '#5c5f61';
        let dotColor = '#5c5f61';
        let animate = false;

        if (status === 'Sent') {
          bgcolor = 'rgba(126, 48, 0, 0.08)';
          color = '#7e3000';
          dotColor = '#7e3000';
        } else if (status === 'Scheduled') {
          bgcolor = 'rgba(53, 37, 205, 0.08)';
          color = '#3525cd';
          dotColor = '#3525cd';
          animate = true;
        } else if (status === 'Sending') {
          bgcolor = 'rgba(92, 95, 97, 0.15)';
          color = '#5c5f61';
          dotColor = '#5c5f61';
        }

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Chip
              label={status}
              size="small"
              icon={
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: dotColor,
                    ml: 1.2,
                    animation: animate ? 'pulse 1.5s infinite' : 'none',
                    '@keyframes pulse': { '0%': { transform: 'scale(0.8)', opacity: 0.5 }, '50%': { transform: 'scale(1.2)', opacity: 1 }, '100%': { transform: 'scale(0.8)', opacity: 0.5 } }
                  }}
                />
              }
              sx={{
                bgcolor,
                color,
                fontWeight: 600,
                fontSize: '11px',
                height: 24,
                borderRadius: '99px',
                '& .MuiChip-icon': {
                  color: 'inherit',
                  margin: 0,
                },
              }}
            />
          </Box>
        );
      },
    },
    {
      field: 'audience',
      headerName: 'AUDIENCE',
      flex: 1.2,
      renderCell: (params) => (
        <Typography sx={{ color: '#0b1c30', fontSize: '13px', display: 'flex', alignItems: 'center', height: '100%' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'date',
      headerName: 'TIME',
      flex: 1.2,
      renderCell: (params) => {
        const row = params.row;
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
            <Typography sx={{ color: '#0b1c30', fontSize: '13px', fontWeight: row.date === 'In Progress' ? 600 : 500 }}>
              {row.date}
            </Typography>
            <Typography sx={{ color: '#777587', fontSize: '11px' }}>
              {row.time}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'openRate',
      headerName: 'OPEN RATE',
      flex: 1.4,
      renderCell: (params) => {
        const row = params.row;
        if (row.openRate === undefined) {
          return (
            <Typography sx={{ color: '#777587', opacity: 0.5, fontSize: '13px', display: 'flex', alignItems: 'center', height: '100%' }}>
              —
            </Typography>
          );
        }
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', width: '100%', pr: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography sx={{ fontWeight: 700, color: '#0b1c30', fontSize: '12.5px' }}>{row.openRate}%</Typography>
              {row.targetOpenRate && (
                <Typography sx={{ color: '#777587', fontSize: '10px' }}>Target: {row.targetOpenRate}%</Typography>
              )}
            </Box>
            <Box sx={{ width: '100%', height: 5, bgcolor: 'rgba(199, 196, 216, 0.3)', borderRadius: '99px', overflow: 'hidden' }}>
              <Box sx={{ height: '100%', width: `${row.openRate}%`, bgcolor: '#3525cd', borderRadius: '99px' }} />
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'deliveryRate',
      headerName: 'DELIVERY',
      flex: 1.4,
      renderCell: (params) => {
        const row = params.row;
        if (row.deliveryRate === undefined) {
          return (
            <Typography sx={{ color: '#777587', opacity: 0.5, fontSize: '13px', display: 'flex', alignItems: 'center', height: '100%' }}>
              —
            </Typography>
          );
        }
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', width: '100%', pr: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography sx={{ fontWeight: 700, color: '#0b1c30', fontSize: '12.5px' }}>{row.deliveryRate}%</Typography>
            </Box>
            <Box sx={{ width: '100%', height: 5, bgcolor: 'rgba(199, 196, 216, 0.3)', borderRadius: '99px', overflow: 'hidden' }}>
              <Box sx={{ height: '100%', width: `${row.deliveryRate}%`, bgcolor: '#3525cd', borderRadius: '99px' }} />
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      width: 48,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', width: '100%', height: '100%' }}>
          <IconButton size="small" onClick={(e) => handleActionMenuOpen(e, params.row.id)}>
            <MoreVert sx={{ fontSize: '18px', color: '#777587' }} />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 64px)', px: 4, py: 4 }}>

      {/* Header Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#3525cd', fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', mb: 1 }}>
            Marketing Hub
            <Box sx={{ width: 32, height: 1, bgcolor: 'rgba(199, 196, 216, 0.4)' }} />
          </Box>
          <Typography variant="h3" sx={{ color: '#0b1c30', fontWeight: 700, tracking: '-0.02em', fontSize: '28px' }}>
            Campaigns
          </Typography>
          <Typography variant="body1" sx={{ color: '#464555', mt: 0.5, fontSize: '14px', maxWidth: '600px' }}>
            Create, schedule, manage, and monitor your email marketing campaigns from a single high-performance interface.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="contained"
            startIcon={<Add sx={{ fontSize: '18px' }} />}
            onClick={() => router.push('/campaigns/create')}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '10px', py: 1, bgcolor: '#3525cd', boxShadow: '0 4px 10px rgba(53, 37, 205, 0.2)' }}
          >
            New Campaign
          </Button>
        </Box>
      </Box>

      {/* KPI Cards Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 4 }}>
        <KpiCard
          title="Total Campaigns"
          value={totalCampaignsCount.toLocaleString()}
          trend="+5%"
          icon={<Analytics />}
          color="#3525cd"
        />
        <KpiCard
          title="Scheduled"
          value={scheduledCount.toLocaleString()}
          icon={<Event />}
          color="#5c5f61"
        />
        <KpiCard
          title="Sent Campaigns"
          value={sentCount.toLocaleString()}
          trend="+12%"
          icon={<CheckCircle />}
          color="#3525cd"
        />
        <KpiCard
          title="Drafts"
          value={draftsCount.toLocaleString()}
          icon={<EditNote />}
          color="#5c5f61"
        />
      </Box>

      {/* Controls / Filter Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: '16px',
          border: '1px solid rgba(199, 196, 216, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1, minWidth: '300px' }}>
          <TextField
            placeholder="Search Campaigns..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
              maxWidth: '320px',
              width: '100%',
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                bgcolor: '#f8f9ff',
              },
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <FormControl size="small" variant="outlined" sx={{ minWidth: 110 }}>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ bgcolor: '#f8f9ff', borderRadius: '8px', fontSize: '12.5px', fontWeight: 600 }}
            >
              <MenuItem value="Status" sx={{ fontSize: '12.5px' }}>Status</MenuItem>
              <MenuItem value="Sent" sx={{ fontSize: '12.5px' }}>Sent</MenuItem>
              <MenuItem value="Scheduled" sx={{ fontSize: '12.5px' }}>Scheduled</MenuItem>
              <MenuItem value="Draft" sx={{ fontSize: '12.5px' }}>Draft</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" variant="outlined" sx={{ minWidth: 120 }}>
            <Select
              value={audienceFilter}
              onChange={(e) => setAudienceFilter(e.target.value)}
              sx={{ bgcolor: '#f8f9ff', borderRadius: '8px', fontSize: '12.5px', fontWeight: 600 }}
            >
              <MenuItem value="Audience" sx={{ fontSize: '12.5px' }}>Audience</MenuItem>
              <MenuItem value="All Users" sx={{ fontSize: '12.5px' }}>All Users</MenuItem>
              <MenuItem value="Premium Segment" sx={{ fontSize: '12.5px' }}>Premium</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" variant="outlined" sx={{ minWidth: 130 }}>
            <Select
              value={dateRangeFilter}
              onChange={(e) => setDateRangeFilter(e.target.value)}
              sx={{ bgcolor: '#f8f9ff', borderRadius: '8px', fontSize: '12.5px', fontWeight: 600 }}
            >
              <MenuItem value="Date Range" sx={{ fontSize: '12.5px' }}>Date Range</MenuItem>
              <MenuItem value="Last 7 Days" sx={{ fontSize: '12.5px' }}>Last 7 Days</MenuItem>
              <MenuItem value="Last 30 Days" sx={{ fontSize: '12.5px' }}>Last 30 Days</MenuItem>
            </Select>
          </FormControl>

          <Divider orientation="vertical" flexItem sx={{ height: 24, my: 'auto' }} />

          <IconButton size="small" sx={{ p: 1 }} title="Sort by Last Updated">
            <SwapVert sx={{ color: '#464555', fontSize: '20px' }} />
          </IconButton>

          <IconButton
            size="small"
            id="refreshBtn"
            onClick={handleRefresh}
            sx={{
              p: 1,
              animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
              '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } }
            }}
          >
            <Refresh sx={{ color: '#464555', fontSize: '20px' }} />
          </IconButton>
        </Box>
      </Paper>

      {/* Campaigns Table Grid */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '16px',
          border: '1px solid rgba(199, 196, 216, 0.3)',
          overflow: 'hidden',
          bgcolor: '#ffffff',
        }}
      >
        {loading ? (
          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {Array.from({ length: 4 }).map((_, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                <Skeleton variant="rounded" width={28} height={28} />
                <Skeleton variant="text" width="20%" height={24} />
                <Skeleton variant="text" width="15%" height={24} />
                <Skeleton variant="text" width="15%" height={24} />
                <Skeleton variant="text" width="20%" height={24} />
                <Skeleton variant="text" width="20%" height={24} />
              </Box>
            ))}
          </Box>
        ) : filteredCampaigns.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10, gap: 2 }}>
            <Campaign sx={{ fontSize: '48px', color: '#c7c4d8' }} />
            <Typography variant="subtitle1" sx={{ color: '#0b1c30', fontWeight: 600 }}>
              No campaigns found
            </Typography>
            <Typography variant="body2" sx={{ color: '#777587', maxWidth: '300px', textAlign: 'center' }}>
              Adjust search filters or create a new campaign to populate this list.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ width: '100%', height: 420 }}>
            <DataGrid
              rows={filteredCampaigns}
              columns={columns}
              rowSelectionModel={rowSelectionModel}
              onRowSelectionModelChange={(newModel) => setRowSelectionModel(newModel)}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 5 },
                },
              }}
              pageSizeOptions={[5, 10]}
              disableRowSelectionOnClick
              rowHeight={64}
              sx={{
                border: 'none',
                '& .MuiDataGrid-columnHeaders': {
                  bgcolor: '#f8f9ff',
                  borderBottom: '1px solid rgba(199, 196, 216, 0.2)',
                  '& .MuiDataGrid-columnHeaderTitle': {
                    fontWeight: 600,
                    color: '#464555',
                    fontSize: '12.5px',
                  },
                },
                '& .MuiDataGrid-row': {
                  borderBottom: '1px solid rgba(199, 196, 216, 0.15)',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'rgba(229, 238, 255, 0.15)',
                  },
                  '&.Mui-selected': {
                    bgcolor: 'rgba(53, 37, 205, 0.04) !important',
                    borderLeft: '4px solid #3525cd',
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

      {/* Row Option Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleActionMenuClose}
        elevation={2}
        sx={{
          '& .MuiPaper-root': {
            borderRadius: '8px',
            border: '1px solid rgba(199, 196, 216, 0.2)',
            minWidth: '120px',
          },
        }}
      >
        <MenuItem
          onClick={() => {
            if (menuCampaignId) router.push(`/campaigns/${menuCampaignId}`);
            handleActionMenuClose();
          }}
          sx={{ fontSize: '13px', fontWeight: 500 }}
        >
          View Analytics
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuCampaignId) handleDuplicateCampaign(menuCampaignId);
            handleActionMenuClose();
          }}
          sx={{ fontSize: '13px', fontWeight: 500 }}
        >
          Duplicate Campaign
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuCampaignId) handleDeleteCampaign(menuCampaignId);
            handleActionMenuClose();
          }}
          sx={{ fontSize: '13px', fontWeight: 500, color: '#ba1a1a' }}
        >
          Delete
        </MenuItem>
      </Menu>

      {/* Dialog: Create Campaign */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: '16px', p: 1 },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#0b1c30' }}>
          Create New Campaign
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleCreateCampaignSubmit} sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              fullWidth
              size="small"
              label="Campaign Name"
              required
              placeholder="e.g. Winter Holiday Promo"
              value={newCampaign.name}
              onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
            />

            <FormControl fullWidth size="small">
              <InputLabel id="status-select-label">Initial Status</InputLabel>
              <Select
                labelId="status-select-label"
                label="Initial Status"
                value={newCampaign.status}
                onChange={(e) => setNewCampaign({ ...newCampaign, status: e.target.value as any })}
              >
                <MenuItem value="Draft">Draft</MenuItem>
                <MenuItem value="Scheduled">Scheduled</MenuItem>
                <MenuItem value="Sent">Sent (Archive)</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel id="audience-select-label">Target Audience</InputLabel>
              <Select
                labelId="audience-select-label"
                label="Target Audience"
                value={newCampaign.audience}
                onChange={(e) => setNewCampaign({ ...newCampaign, audience: e.target.value })}
              >
                <MenuItem value="All Users">All Users</MenuItem>
                <MenuItem value="Premium Segment">Premium Segment</MenuItem>
                <MenuItem value="New Signups">New Signups</MenuItem>
                <MenuItem value="Active Subscribers">Active Subscribers</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setCreateDialogOpen(false)} sx={{ textTransform: 'none', color: '#464555', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button onClick={handleCreateCampaignSubmit} variant="contained" sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}>
            Create Campaign
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
