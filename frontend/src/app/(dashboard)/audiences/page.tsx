'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  ElectricBolt,
  Archive,
  Star,
  History,
  Groups,
  AutoAwesome,
  HelpCenter,
  ArrowForward,
  Sync,
} from '@mui/icons-material';
import KpiCard from '../../../components/common/KpiCard';

interface Audience {
  id: number;
  name: string;
  type: 'Dynamic Segment' | 'Static List';
  filters: string[];
  count: number;
  created: string;
  lastSync: string;
  syncing?: boolean;
}

const INITIAL_AUDIENCES: Audience[] = [
  {
    id: 1,
    name: 'Active Leads',
    type: 'Dynamic Segment',
    filters: ['Status: Leads', 'Activity > 30d'],
    count: 5240,
    created: 'Jan 12, 2024',
    lastSync: '2 mins ago',
    syncing: true,
  },
  {
    id: 2,
    name: 'Q4 Campaign',
    type: 'Static List',
    filters: ['Tag: Q4_Promo', 'Source: Import'],
    count: 1820,
    created: 'Oct 02, 2023',
    lastSync: '2 days ago',
  },
  {
    id: 3,
    name: 'High Value Customers',
    type: 'Dynamic Segment',
    filters: ['LTV > $500', 'Region: EMEA'],
    count: 3105,
    created: 'Feb 28, 2024',
    lastSync: '1 hr ago',
    syncing: true,
  },
  {
    id: 4,
    name: 'Newsletter Subscriptions',
    type: 'Static List',
    filters: ['Source: Website'],
    count: 12400,
    created: 'Nov 15, 2023',
    lastSync: '5 days ago',
  },
];

export default function AudiencesPage() {
  const router = useRouter();
  const [audiences, setAudiences] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeTab, setSelectedTypeTab] = useState<'All' | 'Static' | 'Dynamic'>('All');
  const [sortOption, setSortOption] = useState('Last Updated');
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({
    type: 'include',
    ids: new Set(),
  });

  // Dialog States
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // New Audience Form State
  const [newAudience, setNewAudience] = useState({
    name: '',
    type: 'Dynamic Segment' as 'Dynamic Segment' | 'Static List',
    filters: '',
  });

  // Action Menu Anchor State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuAudienceId, setMenuAudienceId] = useState<null | string | number>(null);

  const fetchAudiences = async () => {
    try {
      setLoading(true);
      const [audRes, contactRes] = await Promise.all([
        api.get('/audiences'),
        api.get('/contacts'),
      ]);

      const mapped = audRes.data.audiences.map((aud: any) => ({
        ...aud,
        filters: aud.rules && aud.rules.length > 0
          ? aud.rules.map((r: any) => `${r.field}: ${r.value}`)
          : ['No Filters'],
      }));
      setAudiences(mapped);
      setContacts(contactRes.data.contacts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic metrics memoized
  const metrics = useMemo(() => {
    const activeAudiencesCount = audiences.length;
    const totalContactsCount = contacts.length;

    const largestAudience = audiences.length > 0
      ? audiences.reduce((max, aud) => (aud.count > max.count ? aud : max), audiences[0])
      : null;
    const largestAudienceLabel = largestAudience
      ? `${largestAudience.name} (${largestAudience.count.toLocaleString()})`
      : 'None';

    const recentlyCreatedAudience = audiences.length > 0
      ? [...audiences].sort((a, b) => new Date(b.createdAt || b.created || 0).getTime() - new Date(a.createdAt || a.created || 0).getTime())[0]
      : null;
    const recentlyCreatedLabel = recentlyCreatedAudience
      ? `${recentlyCreatedAudience.name} (${recentlyCreatedAudience.count.toLocaleString()})`
      : 'None';

    return {
      activeAudiencesCount,
      totalContactsCount,
      largestAudienceLabel,
      recentlyCreatedLabel,
    };
  }, [audiences, contacts]);

  useEffect(() => {
    fetchAudiences();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleActionMenuOpen = (e: React.MouseEvent<HTMLButtonElement>, id: string | number) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
    setMenuAudienceId(id);
  };

  const handleActionMenuClose = () => {
    setAnchorEl(null);
    setMenuAudienceId(null);
  };

  const handleDeleteAudience = async (id: string | number) => {
    try {
      await api.delete(`/audiences/${id}`);
      handleActionMenuClose();
      fetchAudiences();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to delete audience');
    }
  };

  const handleCreateAudienceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAudience.name.trim()) return;

    const filterArray = newAudience.filters
      ? newAudience.filters.split(',').map((f) => {
          const parts = f.split(':');
          if (parts.length >= 2) {
            return {
              field: parts[0].trim(),
              operator: 'equals',
              value: parts[1].trim(),
            };
          }
          return {
            field: 'Tag',
            operator: 'equals',
            value: f.trim(),
          };
        })
      : [];

    try {
      await api.post('/audiences', {
        name: newAudience.name,
        type: newAudience.type,
        logicalOperator: 'AND',
        rules: filterArray,
      });

      setCreateDialogOpen(false);
      setNewAudience({
        name: '',
        type: 'Dynamic Segment',
        filters: '',
      });
      fetchAudiences();
    } catch (err) {
      console.error(err);
      alert('Error creating audience');
    }
  };

  // Filter, search and sort logic memoized
  const sortedAudiences = useMemo(() => {
    const filtered = audiences.filter((a) => {
      const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab =
        selectedTypeTab === 'All' ||
        (selectedTypeTab === 'Static' && a.type === 'Static List') ||
        (selectedTypeTab === 'Dynamic' && a.type === 'Dynamic Segment');

      return matchesSearch && matchesTab;
    });

    return [...filtered].sort((a, b) => {
      if (sortOption === 'Size (High to Low)') {
        return b.count - a.count;
      }
      if (sortOption === 'Alphabetical') {
        return a.name.localeCompare(b.name);
      }
      // Default: Last Updated / Created chronological order
      return new Date(b.created).getTime() - new Date(a.created).getTime();
    });
  }, [audiences, searchQuery, selectedTypeTab, sortOption]);

  // DataGrid Columns definition
  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'AUDIENCE NAME',
      flex: 1.5,
      renderCell: (params) => {
        const row = params.row;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, height: '100%' }}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: row.type === 'Dynamic Segment' ? 'rgba(53, 37, 205, 0.08)' : 'rgba(92, 95, 97, 0.08)',
                color: row.type === 'Dynamic Segment' ? '#3525cd' : '#5c5f61',
                borderRadius: '8px',
              }}
            >
              {row.type === 'Dynamic Segment' ? (
                <ElectricBolt sx={{ fontSize: '18px' }} />
              ) : (
                <Archive sx={{ fontSize: '18px' }} />
              )}
            </Avatar>
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography sx={{ fontWeight: 600, color: '#0b1c30', fontSize: '13px', lineHeight: 1.2 }}>
                {row.name}
              </Typography>
              <Typography sx={{ color: '#777587', fontSize: '10.5px' }}>
                {row.type}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'filters',
      headerName: 'FILTERS APPLIED',
      flex: 1.8,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center', height: '100%' }}>
          {params.value.map((filter: string, idx: number) => {
            const isHighlight = filter.startsWith('Status:') || filter.startsWith('LTV');
            return (
              <Chip
                key={filter}
                label={filter}
                size="small"
                sx={{
                  bgcolor: isHighlight ? 'rgba(53, 37, 205, 0.08)' : 'rgba(199, 196, 216, 0.15)',
                  color: isHighlight ? '#3525cd' : '#464555',
                  fontWeight: 600,
                  fontSize: '9.5px',
                  height: 20,
                  borderRadius: '4px',
                }}
              />
            );
          })}
        </Box>
      ),
    },
    {
      field: 'count',
      headerName: 'COUNT',
      flex: 0.8,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography sx={{ color: '#0b1c30', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', height: '100%', fontVariantNumeric: 'tabular-nums' }}>
          {params.value.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: 'created',
      headerName: 'CREATED',
      flex: 1.0,
      renderCell: (params) => (
        <Typography sx={{ color: '#464555', fontSize: '12.5px', display: 'flex', alignItems: 'center', height: '100%' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'lastSync',
      headerName: 'LAST SYNC',
      flex: 1.0,
      renderCell: (params) => {
        const row = params.row;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
            {row.syncing && (
              <Box sx={{ display: 'flex', alignItems: 'center', animation: 'spin 2s linear infinite', '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }}>
                <Sync sx={{ fontSize: '12px', color: '#3525cd' }} />
              </Box>
            )}
            <Typography sx={{ color: row.syncing ? '#3525cd' : '#464555', fontSize: '12px', fontWeight: row.syncing ? 600 : 500 }}>
              {row.lastSync}
            </Typography>
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
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 64px)' }}>
      
      {/* Header Section with Negative Margin look */}
      <Box sx={{ position: 'relative', px: 4, pt: 5, pb: 12, bg: 'linear-gradient(135deg, rgba(53, 37, 205, 0.05) 0%, rgba(248, 249, 255, 1) 100%)', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: -100, right: -100, width: 380, height: 380, bgcolor: 'rgba(53, 37, 205, 0.03)', borderRadius: '50%', filter: 'blur(80px)' }} />
        <Box sx={{ position: 'absolute', bottom: -50, left: -50, width: 250, height: 250, bgcolor: 'rgba(92, 95, 97, 0.03)', borderRadius: '50%', filter: 'blur(50px)' }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 3, position: 'relative', zIndex: 1 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#3525cd', fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', mb: 1.5 }}>
              <Box sx={{ width: 32, height: 1, bgcolor: '#3525cd' }} />
              Segmentation Engine
            </Box>
            <Typography variant="h3" sx={{ color: '#0b1c30', fontWeight: 700, tracking: '-0.02em', fontSize: '28px' }}>
              Audiences
            </Typography>
            <Typography variant="body1" sx={{ color: '#464555', mt: 0.5, fontSize: '14px', maxWidth: '600px' }}>
              Create reusable audience segments using filters to target the right contacts with surgical precision.
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            startIcon={<Add sx={{ fontSize: '18px' }} />}
            onClick={() => router.push('/audiences/create')}
            sx={{ textTransform: 'none', fontWeight: 600, px: 3, py: 1.2, borderRadius: '10px', boxShadow: '0 4px 10px rgba(53, 37, 205, 0.2)' }}
          >
            Create Audience
          </Button>
        </Box>
      </Box>

      {/* KPI Cards: Overlapping header */}
      <Box sx={{ px: 4, mt: -5, position: 'relative', zIndex: 2 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' }, gap: 3 }}>
          <KpiCard title="Active Audiences" value={metrics.activeAudiencesCount.toLocaleString()} icon={<ElectricBolt />} color="#3525cd" />
          <KpiCard title="Total Managed Contacts" value={metrics.totalContactsCount.toLocaleString()} trend="+12%" icon={<Groups />} color="#3525cd" />
          <KpiCard title="Largest Segment" value={metrics.largestAudienceLabel} trend="Largest" icon={<Star />} color="#5c5f61" />
          <KpiCard title="Recently Created Segment" value={metrics.recentlyCreatedLabel} trend="Recent" icon={<History />} color="#5c5f61" />
        </Box>
      </Box>

      {/* Main Workspace (Search + Table Grid) */}
      <Box sx={{ px: 4, py: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
        
        {/* Search, Sort, Filter Toolbar */}
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
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1, minWidth: '300px' }}>
            <TextField
              placeholder="Search by name..."
              size="small"
              value={searchQuery}
              onChange={handleSearchChange}
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
                },
              }}
            />
            <Button
              variant="outlined"
              startIcon={<FilterList sx={{ fontSize: '18px' }} />}
              sx={{ color: '#464555', borderColor: '#c7c4d8', borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
            >
              Filters
            </Button>
          </Box>

          {/* Tab Toggles & Sort Options */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', gap: 0.5, bgcolor: '#f8f9ff', p: 0.5, borderRadius: '10px', border: '1px solid rgba(199, 196, 216, 0.2)' }}>
              {(['All', 'Static', 'Dynamic'] as const).map((tab) => (
                <Button
                  key={tab}
                  size="small"
                  onClick={() => setSelectedTypeTab(tab)}
                  sx={{
                    textTransform: 'none',
                    fontSize: '12px',
                    fontWeight: 600,
                    px: 2,
                    py: 0.6,
                    borderRadius: '8px',
                    bgcolor: selectedTypeTab === tab ? '#ffffff' : 'transparent',
                    color: selectedTypeTab === tab ? '#3525cd' : '#5c5f61',
                    boxShadow: selectedTypeTab === tab ? '0 1px 4px rgba(0,0,0,0.05)' : 'none',
                    '&:hover': {
                      bgcolor: selectedTypeTab === tab ? '#ffffff' : 'rgba(53,37,205,0.02)',
                    },
                  }}
                >
                  {tab}
                </Button>
              ))}
            </Box>

            <Divider orientation="vertical" flexItem sx={{ height: 24, my: 'auto' }} />

            <FormControl size="small" variant="standard" sx={{ minWidth: 140 }}>
              <Select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                sx={{
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: '#464555',
                  '&:before': { borderBottom: 'none' },
                  '&:after': { borderBottom: 'none' },
                  '&:hover:not(.Mui-disabled):before': { borderBottom: 'none' },
                }}
              >
                <MenuItem value="Last Updated" sx={{ fontSize: '12.5px' }}>Sort: Last Updated</MenuItem>
                <MenuItem value="Size (High to Low)" sx={{ fontSize: '12.5px' }}>Sort: Size (High to Low)</MenuItem>
                <MenuItem value="Alphabetical" sx={{ fontSize: '12.5px' }}>Sort: Alphabetical</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Paper>

        {/* DataGrid Table Container */}
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
                  <Skeleton variant="text" width="30%" height={24} />
                  <Skeleton variant="text" width="10%" height={24} />
                  <Skeleton variant="text" width="15%" height={24} />
                  <Skeleton variant="text" width="10%" height={24} />
                </Box>
              ))}
            </Box>
          ) : sortedAudiences.length === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10, gap: 2 }}>
              <Groups sx={{ fontSize: '48px', color: '#c7c4d8' }} />
              <Typography variant="subtitle1" sx={{ color: '#0b1c30', fontWeight: 600 }}>
                No audiences found
              </Typography>
              <Typography variant="body2" sx={{ color: '#777587', maxWidth: '300px', textAlign: 'center' }}>
                Try adjusting your search criteria to locate matching segments.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ width: '100%', height: 400 }}>
              <DataGrid
                rows={sortedAudiences}
                columns={columns}
                rowSelectionModel={rowSelectionModel}
                onRowSelectionModelChange={(newModel) => setRowSelectionModel(newModel)}
                onRowClick={(params, event) => {
                  const target = event.target as HTMLElement;
                  if (
                    target.closest('.MuiDataGrid-cellCheckbox') ||
                    target.closest('button') ||
                    target.closest('.MuiIconButton-root')
                  ) {
                    return;
                  }
                  router.push(`/audiences/${params.id}`);
                }}
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

        {/* Pro Tip Card */}
        <Box sx={{ mt: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '20px',
              bgcolor: 'rgba(255, 182, 149, 0.06)',
              border: '1px solid rgba(255, 182, 149, 0.15)',
              display: 'flex',
              gap: 2.5,
              alignItems: 'flex-start',
            }}
          >
            <Avatar sx={{ width: 44, height: 44, bgcolor: '#7e3000', color: '#ffffff', borderRadius: '12px' }}>
              <HelpCenter sx={{ fontSize: '20px' }} />
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ color: '#0b1c30', fontWeight: 700, fontSize: '14px', mb: 0.5 }}>
                Pro Tip: Smart Audiences
              </Typography>
              <Typography variant="body2" sx={{ color: '#777587', lineHeight: 1.4, mb: 2 }}>
                Use "Dynamic Segments" to automatically add or remove contacts as they meet your specified filters.
              </Typography>
              <Button
                variant="text"
                endIcon={<ArrowForward sx={{ fontSize: '14px' }} />}
                sx={{ textTransform: 'none', fontWeight: 700, p: 0, color: '#7e3000', fontSize: '13px', '&:hover': { bgcolor: 'transparent', gap: 0.5 } }}
                onClick={() => alert('Smart Audiences Documentation')}
              >
                Learn more
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Row Options Menu */}
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
            if (menuAudienceId) alert(`Sync Audience ID: ${menuAudienceId}`);
            handleActionMenuClose();
          }}
          sx={{ fontSize: '13px', fontWeight: 500 }}
        >
          Sync Now
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuAudienceId) handleDeleteAudience(menuAudienceId);
          }}
          sx={{ fontSize: '13px', fontWeight: 500, color: '#ba1a1a' }}
        >
          Delete
        </MenuItem>
      </Menu>

      {/* Dialog: Create Audience */}
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
          Create New Audience Segment
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleCreateAudienceSubmit} sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              fullWidth
              size="small"
              label="Audience Name"
              required
              placeholder="e.g. Inactive Subscribers"
              value={newAudience.name}
              onChange={(e) => setNewAudience({ ...newAudience, name: e.target.value })}
            />

            <FormControl fullWidth size="small">
              <InputLabel id="type-select-label">Segment Type</InputLabel>
              <Select
                labelId="type-select-label"
                label="Segment Type"
                value={newAudience.type}
                onChange={(e) => setNewAudience({ ...newAudience, type: e.target.value as any })}
              >
                <MenuItem value="Dynamic Segment">Dynamic Segment (Auto-updates)</MenuItem>
                <MenuItem value="Static List">Static List (Fixed contacts)</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              size="small"
              label="Filters Applied (comma-separated)"
              placeholder="e.g. Status: Lead, LTV > 100"
              value={newAudience.filters}
              onChange={(e) => setNewAudience({ ...newAudience, filters: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setCreateDialogOpen(false)} sx={{ textTransform: 'none', color: '#464555', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button onClick={handleCreateAudienceSubmit} variant="contained" sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}>
            Create segment
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
