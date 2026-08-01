'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import api from '../../../utils/api';
import ContactDetails from '../../../components/contacts/ContactDetails';
import ContactFormDialog from '../../../components/contacts/ContactFormDialog';
import ImportDialog from '../../../components/contacts/ImportDialog';
import { Contact } from '../../../types';
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
  Checkbox,
} from '@mui/material';
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import {
  Search,
  FilterList,
  PersonAdd,
  UploadFile,
  IosShare,
  MoreVert,
  Delete,
  Mail,
  Call,
  LocationOn,
  Drafts,
  CheckCircle,
  Warning,
  Groups,
  Tag,
  History,
  Lock,
  Visibility,
  CloudUpload,
  Info,
  Description,
  Download,
  ArrowForward,
  ContentCopy,
} from '@mui/icons-material';
import KpiCard from '../../../components/common/KpiCard';



const INITIAL_CONTACTS: Contact[] = [
  {
    id: 1,
    name: 'Alex Rivera',
    email: 'alex.rivera@acme.com',
    phone: '+1 (555) 012-3456',
    city: 'New York',
    company: 'Acme Inc.',
    tags: ['VIP', 'Customer'],
    dateCreated: 'Oct 12, 2023',
    status: 'ACTIVE',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDa9MPh65h02Xghb8Zoto6soSYsKPaCPrXC8IHR0EYjcglqnWx6AStbSf8odghLuRGXzQ-P4vQIIAlJy8BKVgfqi_EKLKUV5FskSYydCHlp6BJI_c323V-bpp--rQ6dYsNIObBA0mmjd5eY8f75dD39hVvLqEl1mqL1hDya_QqDtOTOiXEGCb015govwtL17CpyKW8ANxQe7mZknIDyd9QMij2gP7J32S2U66FK22FVwZplCNth2nLZ',
    jobTitle: 'Product Manager',
    industry: 'SaaS',
    leadScore: 94,
  },
  {
    id: 2,
    name: 'Sarah Higgins',
    email: 'sarah@designlabs.io',
    phone: '+1 (555) 098-7654',
    city: 'San Francisco',
    company: 'Design Labs',
    tags: ['Lead'],
    dateCreated: 'Nov 04, 2023',
    status: 'ACTIVE',
    initials: 'SH',
    jobTitle: 'UX Designer',
    industry: 'Design',
    leadScore: 78,
  },
  {
    id: 3,
    name: 'James Wilson',
    email: 'j.wilson@globallog.com',
    phone: '+44 20 7946 0123',
    city: 'London',
    company: 'Global Logistics',
    tags: ['VIP'],
    dateCreated: 'Jan 18, 2024',
    status: 'ACTIVE',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCH4PAodaDcFG3U1DoEJbpsLruUQcGEOiWi9gVIRpcIarWjjPKg4oCVpNUJa7XvaGvcMio4LExEo2fgCbanKLRU2lv4eMOXwB6lRdsCqoAzpCctfxtEAGsRsqHV7WD_P02lpVfzg6xq7L-pgZl-mtggVsS8-midmbb8kDefYBoL390iH52TLKr_OMlNyMMQEiY8JM04XsKZ_sEdBPLTCuWHnFc4ZamzOaDX7LZUpaqPFFAcUv1w7Vod',
    jobTitle: 'Operations Director',
    industry: 'Logistics',
    leadScore: 88,
  },
  {
    id: 4,
    name: 'Maria Tanaka',
    email: 'maria.tanaka@softsys.jp',
    phone: '+81 3 1234 5678',
    city: 'Tokyo',
    company: 'SoftSystems',
    tags: ['Customer'],
    dateCreated: 'Feb 02, 2024',
    status: 'ACTIVE',
    initials: 'MT',
    jobTitle: 'Software Architect',
    industry: 'Technology',
    leadScore: 90,
  },
];

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({
    type: 'include',
    ids: new Set(),
  });
  const [activeFilters, setActiveFilters] = useState<{ type: string; value: string }[]>([]);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);

  // Dynamic stats calculation memoized
  const metrics = useMemo(() => {
    const totalContacts = contacts.length;
    const taggedContacts = contacts.filter((c) => c.tags && c.tags.length > 0).length;
    const recentlyAdded = contacts.filter((c) => {
      const date = c.createdAt ? new Date(c.createdAt) : null;
      if (!date || isNaN(date.getTime())) return false;
      const diffDays = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays <= 7;
    }).length;

    const emailMap = new Map<string, number>();
    contacts.forEach((c) => {
      if (c.email) {
        const emailLower = c.email.toLowerCase().trim();
        emailMap.set(emailLower, (emailMap.get(emailLower) || 0) + 1);
      }
    });
    const duplicateContactsCount = Array.from(emailMap.values()).filter((cnt) => cnt > 1).length;

    const uniqueTags = Array.from(new Set(contacts.flatMap((c) => c.tags || [])));
    const uniqueCities = Array.from(new Set(contacts.map((c) => c.city).filter(Boolean)));

    return {
      totalContacts,
      taggedContacts,
      recentlyAdded,
      duplicateContactsCount,
      uniqueTags,
      uniqueCities,
    };
  }, [contacts]);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dialog mode
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [editContactId, setEditContactId] = useState<string | number | null>(null);

  // New Contact Form State
  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    company: '',
    jobTitle: '',
    industry: '',
    tags: '',
  });

  // Action Menu Anchor State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuContactId, setMenuContactId] = useState<null | string | number>(null);

  // Detail Panel Tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'activity'>('overview');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleRemoveFilter = (filterToRemove: { type: string; value: string }) => {
    setActiveFilters((prev) =>
      prev.filter((f) => !(f.type === filterToRemove.type && f.value === filterToRemove.value))
    );
  };

  const handleActionMenuOpen = (e: React.MouseEvent<HTMLButtonElement>, id: string | number) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
    setMenuContactId(id);
  };

  const handleActionMenuClose = () => {
    setAnchorEl(null);
    setMenuContactId(null);
  };

  const handleDeleteContact = async (id: string | number) => {
    try {
      await api.delete(`/contacts/${id}`);
      if (selectedContact?.id === id) {
        setSelectedContact(null);
      }
      handleActionMenuClose();
      fetchContacts();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to delete contact');
    }
  };

  const handleBulkDelete = async () => {
    const selectedIds = Array.from(rowSelectionModel.ids);
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} contacts?`)) return;

    try {
      await api.post('/contacts/bulk-delete', { ids: selectedIds });
      if (selectedContact && selectedIds.includes(selectedContact.id)) {
        setSelectedContact(null);
      }
      setRowSelectionModel({ type: 'include', ids: new Set() });
      fetchContacts();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to bulk delete contacts');
    }
  };

  const handleContactFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tagArray = newContact.tags
      ? newContact.tags.split(',').map((t) => t.trim())
      : [];

    const payload = {
      name: newContact.name,
      email: newContact.email,
      phone: newContact.phone || undefined,
      city: newContact.city || undefined,
      company: newContact.company || undefined,
      tags: tagArray,
      jobTitle: newContact.jobTitle || undefined,
      industry: newContact.industry || undefined,
    };

    try {
      let res;
      if (dialogMode === 'add') {
        res = await api.post('/contacts', payload);
      } else {
        res = await api.put(`/contacts/${editContactId}`, payload);
      }

      const data = res.data;
      if (false) {
        alert(data.error || 'Failed to save contact');
        return;
      }

      setAddDialogOpen(false);
      setNewContact({
        name: '',
        email: '',
        phone: '',
        city: '',
        company: '',
        jobTitle: '',
        industry: '',
        tags: '',
      });
      fetchContacts();
    } catch (err) {
      console.error(err);
      alert('Error saving contact');
    }
  };



  const handleExportContacts = async () => {
    try {
      const res = await api.get('/contacts/export', { responseType: 'blob' });
      const blob = res.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'contacts.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setExportDialogOpen(false);
    } catch (err) {
      console.error(err);
      alert('Error exporting contacts');
    }
  };

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/contacts');
      const data = res.data;
      const mapped = data.contacts.map((c: any) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone || '',
        city: c.city || '',
        company: c.company || '',
        tags: c.tags || [],
        dateCreated: new Date(c.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        }),
        createdAt: c.createdAt,
        status: c.status,
        avatarUrl: c.avatarUrl,
        initials: c.name
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .substring(0, 2),
        jobTitle: c.customFields?.jobTitle || '',
        industry: c.customFields?.industry || '',
        leadScore: Number(c.customFields?.leadScore) || 0,
      }));
      setContacts(mapped);

      // Retain selection if valid
      if (selectedContact) {
        const updatedSelected = mapped.find((item: any) => item.id === selectedContact.id);
        if (updatedSelected) {
          setSelectedContact(updatedSelected);
        } else {
          setSelectedContact(mapped[0] || null);
        }
      } else if (mapped.length > 0) {
        setSelectedContact(mapped[0]);
      }
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // Filter and search logic memoized
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.company.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilters = activeFilters.every((f) => {
        if (f.type === 'Tag') {
          return c.tags.includes(f.value);
        }
        if (f.type === 'City') {
          return c.city.toLowerCase() === f.value.toLowerCase();
        }
        return true;
      });

      return matchesSearch && matchesFilters;
    });
  }, [contacts, searchQuery, activeFilters]);

  // MUI DataGrid Column definitions
  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'NAME',
      flex: 1.5,
      renderCell: (params) => {
        const c = params.row;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, height: '100%' }}>
            {c.avatarUrl ? (
              <Avatar src={c.avatarUrl} sx={{ width: 32, height: 32, boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }} />
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
                {c.company}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'email',
      headerName: 'EMAIL',
      flex: 1.2,
      renderCell: (params) => (
        <Typography sx={{ color: '#0b1c30', fontSize: '13px', display: 'flex', alignItems: 'center', height: '100%' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'phone',
      headerName: 'PHONE',
      flex: 1.0,
      renderCell: (params) => (
        <Typography sx={{ color: '#464555', fontSize: '12.5px', display: 'flex', alignItems: 'center', height: '100%' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'city',
      headerName: 'CITY',
      flex: 0.9,
      renderCell: (params) => (
        <Typography sx={{ color: '#0b1c30', fontSize: '13px', display: 'flex', alignItems: 'center', height: '100%' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'tags',
      headerName: 'TAGS',
      flex: 1.1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center', height: '100%' }}>
          {params.value.map((tag: string) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              sx={{
                bgcolor: tag === 'VIP' ? 'rgba(79, 70, 229, 0.08)' : 'rgba(46, 125, 50, 0.08)',
                color: tag === 'VIP' ? '#4f46e5' : '#2e7d32',
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
      field: 'dateCreated',
      headerName: 'DATE CREATED',
      flex: 1.0,
      renderCell: (params) => (
        <Typography sx={{ color: '#464555', fontSize: '12.5px', display: 'flex', alignItems: 'center', height: '100%' }}>
          {params.value}
        </Typography>
      ),
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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 'calc(100vh - 64px)' }}>

      {/* Header & Summary Section */}
      <Box sx={{ px: 4, pt: 3, pb: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h3" sx={{ color: '#0b1c30', fontWeight: 700, tracking: '-0.02em', fontSize: '28px' }}>
              Contacts
            </Typography>
            <Typography variant="body1" sx={{ color: '#464555', mt: 0.5, fontSize: '14px', maxWidth: '600px' }}>
              Manage your contact database, import contacts, organize tags, and create audiences.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="text"
              startIcon={<IosShare sx={{ fontSize: '18px' }} />}
              onClick={() => setExportDialogOpen(true)}
              sx={{ color: '#464555', textTransform: 'none', fontWeight: 600, px: 2, py: 1, borderRadius: '10px' }}
            >
              Export
            </Button>
            <Button
              variant="outlined"
              startIcon={<UploadFile sx={{ fontSize: '18px' }} />}
              onClick={() => setImportDialogOpen(true)}
              sx={{ color: '#0b1c30', borderColor: '#c7c4d8', textTransform: 'none', fontWeight: 600, px: 2, py: 1, borderRadius: '10px' }}
            >
              Import CSV
            </Button>
            <Button
              variant="contained"
              startIcon={<PersonAdd sx={{ fontSize: '18px' }} />}
              onClick={() => {
                setDialogMode('add');
                setNewContact({
                  name: '',
                  email: '',
                  phone: '',
                  city: '',
                  company: '',
                  jobTitle: '',
                  industry: '',
                  tags: '',
                });
                setAddDialogOpen(true);
              }}
              sx={{ textTransform: 'none', fontWeight: 600, px: 3, py: 1, borderRadius: '10px', boxShadow: '0 4px 10px rgba(53, 37, 205, 0.2)' }}
            >
              Add Contact
            </Button>
          </Box>
        </Box>

        {/* Stats Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' }, gap: 3 }}>
          <KpiCard title="Total Contacts" value={metrics.totalContacts.toLocaleString()} trend="+12%" icon={<Groups />} color="#3525cd" />
          <KpiCard title="Tagged Contacts" value={metrics.taggedContacts.toLocaleString()} icon={<Tag />} color="#5c5f61" />
          <KpiCard title="Recently Added" value={metrics.recentlyAdded.toLocaleString()} icon={<History />} color="#5c5f61" />
          <KpiCard title="Duplicate Contacts" value={metrics.duplicateContactsCount.toLocaleString()} icon={<Warning />} color="#ba1a1a" />
        </Box>
      </Box>

      {/* Search, Filter Toolbar & Bulk Actions */}
      <Box sx={{ px: 4, mt: 1 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: '12px',
            border: '1px solid rgba(199, 196, 216, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            bgcolor: '#ffffff',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search by name, email or company..."
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
                maxWidth: '360px',
                width: '100%',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                },
              }}
            />

            <Button
              variant="outlined"
              startIcon={<FilterList sx={{ fontSize: '18px' }} />}
              onClick={(e) => setFilterAnchorEl(e.currentTarget)}
              sx={{
                color: '#464555',
                borderColor: '#c7c4d8',
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 600,
                position: 'relative',
              }}
            >
              Filters
              {activeFilters.length > 0 && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    bgcolor: '#3525cd',
                    color: '#ffffff',
                    borderRadius: '50%',
                    width: 18,
                    height: 18,
                    fontSize: '9px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                  }}
                >
                  {activeFilters.length}
                </Box>
              )}
            </Button>

            <Menu
              anchorEl={filterAnchorEl}
              open={Boolean(filterAnchorEl)}
              onClose={() => setFilterAnchorEl(null)}
              slotProps={{
                paper: {
                  sx: {
                    width: 250,
                    maxHeight: 400,
                    borderRadius: '12px',
                    mt: 1.5,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  },
                },
              }}
            >
              <Typography sx={{ px: 2, py: 1, fontWeight: 700, fontSize: '12px', color: '#777587', textTransform: 'uppercase', tracking: '0.05em' }}>
                Filter by Tag
              </Typography>
              {metrics.uniqueTags.length === 0 ? (
                <Typography sx={{ px: 2, py: 0.5, fontSize: '12.5px', color: '#777587', fontStyle: 'italic' }}>
                  No tags found
                </Typography>
              ) : (
                metrics.uniqueTags.map((tag: string) => {
                  const isSelected = activeFilters.some(f => f.type === 'Tag' && f.value === tag);
                  return (
                    <MenuItem
                      key={`filter-tag-${tag}`}
                      onClick={() => {
                        if (isSelected) {
                          setActiveFilters(activeFilters.filter(f => !(f.type === 'Tag' && f.value === tag)));
                        } else {
                          setActiveFilters([...activeFilters, { type: 'Tag', value: tag }]);
                        }
                        setFilterAnchorEl(null);
                      }}
                      sx={{ fontSize: '13px', fontWeight: 500, bgcolor: isSelected ? 'rgba(53, 37, 205, 0.05)' : 'transparent', color: isSelected ? '#3525cd' : '#0b1c30' }}
                    >
                      {tag}
                    </MenuItem>
                  );
                })
              )}

              <Divider sx={{ my: 1 }} />

              <Typography sx={{ px: 2, py: 1, fontWeight: 700, fontSize: '12px', color: '#777587', textTransform: 'uppercase', tracking: '0.05em' }}>
                Filter by City
              </Typography>
              {metrics.uniqueCities.length === 0 ? (
                <Typography sx={{ px: 2, py: 0.5, fontSize: '12.5px', color: '#777587', fontStyle: 'italic' }}>
                  No cities found
                </Typography>
              ) : (
                metrics.uniqueCities.map((city: string) => {
                  const isSelected = activeFilters.some(f => f.type === 'City' && f.value === city);
                  return (
                    <MenuItem
                      key={`filter-city-${city}`}
                      onClick={() => {
                        if (isSelected) {
                          setActiveFilters(activeFilters.filter(f => !(f.type === 'City' && f.value === city)));
                        } else {
                          setActiveFilters([...activeFilters, { type: 'City', value: city }]);
                        }
                        setFilterAnchorEl(null);
                      }}
                      sx={{ fontSize: '13px', fontWeight: 500, bgcolor: isSelected ? 'rgba(53, 37, 205, 0.05)' : 'transparent', color: isSelected ? '#3525cd' : '#0b1c30' }}
                    >
                      {city}
                    </MenuItem>
                  );
                })
              )}
            </Menu>

            {/* Active Filters List */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {activeFilters.map((filter) => (
                <Chip
                  key={`${filter.type}-${filter.value}`}
                  label={`${filter.type}: ${filter.value}`}
                  onDelete={() => handleRemoveFilter(filter)}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(53, 37, 205, 0.08)',
                    color: '#3525cd',
                    fontWeight: 600,
                    fontSize: '11px',
                    borderRadius: '9999px',
                    border: 'none',
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Bulk Actions Button bar */}
          {(() => {
            const selectedCount = rowSelectionModel.type === 'include'
              ? rowSelectionModel.ids.size
              : (filteredContacts.length - rowSelectionModel.ids.size);
            return selectedCount > 0 ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, borderLeft: '1px solid rgba(199, 196, 216, 0.3)', pl: 2 }}>
                <Typography sx={{ fontSize: '12.5px', color: '#464555', fontWeight: 600 }}>
                  {selectedCount} Selected
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ textTransform: 'none', fontSize: '12px', borderRadius: '6px', color: '#464555', borderColor: '#c7c4d8' }}
                >
                  Bulk Actions
                </Button>
                <IconButton onClick={handleBulkDelete} size="small" sx={{ color: '#ba1a1a', bgcolor: 'rgba(186, 26, 26, 0.05)', '&:hover': { bgcolor: 'rgba(186, 26, 26, 0.1)' } }}>
                  <Delete sx={{ fontSize: '18px' }} />
                </IconButton>
              </Box>
            ) : null;
          })()}
        </Paper>
      </Box>

      {/* Main Workspace Grid (Table + Details Side by Side) */}
      <Box sx={{ display: 'flex', px: 4, gap: 4, pb: 4, minHeight: 0, mt: 3 }}>

        {/* Left Side: Table Workspace */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Table Container Wrapper using MUI DataGrid */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: '12px',
              border: '1px solid rgba(199, 196, 216, 0.3)',
              overflow: 'hidden',
              bgcolor: '#ffffff',
              height: 556,
            }}
          >
            {loading ? (
              // Skeleton Loading View
              <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                    <Skeleton variant="rectangular" width={18} height={18} />
                    <Skeleton variant="circular" width={36} height={36} />
                    <Skeleton variant="text" width="20%" height={24} />
                    <Skeleton variant="text" width="25%" height={24} />
                    <Skeleton variant="text" width="15%" height={24} />
                    <Skeleton variant="rounded" width={50} height={20} />
                    <Skeleton variant="text" width="10%" height={24} />
                  </Box>
                ))}
              </Box>
            ) : filteredContacts.length === 0 ? (
              // Empty State View
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 10, gap: 2 }}>
                <Groups sx={{ fontSize: '48px', color: '#c7c4d8' }} />
                <Typography variant="subtitle1" sx={{ color: '#0b1c30', fontWeight: 600 }}>
                  No contacts found
                </Typography>
                <Typography variant="body2" sx={{ color: '#777587', maxWidth: '300px', textAlign: 'center' }}>
                  Try adjusting your filters or search keywords to locate your contacts.
                </Typography>
              </Box>
            ) : (
              // MUI DataGrid Component
              <Box sx={{ width: '100%', height: 500 }}>
                <DataGrid
                  rows={filteredContacts}
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
                    setSelectedContact(params.row as Contact);
                  }}
                  initialState={{
                    pagination: {
                      paginationModel: { page: 0, pageSize: 5 },
                    },
                  }}
                  pageSizeOptions={[5, 10]}
                  disableRowSelectionOnClick
                  rowHeight={56}
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
                        '&:hover': {
                          bgcolor: 'rgba(53, 37, 205, 0.08) !important',
                        },
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

        {/* Right Side: Detail Drawer / Panel */}
        <ContactDetails
          selectedContact={selectedContact}
          onEdit={() => {
            if (selectedContact) {
              setDialogMode('edit');
              setEditContactId(selectedContact.id);
              setNewContact({
                name: selectedContact.name,
                email: selectedContact.email,
                phone: selectedContact.phone || '',
                city: selectedContact.city || '',
                company: selectedContact.company || '',
                jobTitle: selectedContact.jobTitle || '',
                industry: selectedContact.industry || '',
                tags: selectedContact.tags ? selectedContact.tags.join(', ') : '',
              });
              setAddDialogOpen(true);
            }
          }}
          onDelete={handleDeleteContact}
        />
      </Box>

      {/* Row Actions Menu */}
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
            if (menuContactId) {
              const c = contacts.find((item) => item.id === menuContactId);
              if (c) {
                setDialogMode('edit');
                setEditContactId(c.id);
                setNewContact({
                  name: c.name,
                  email: c.email,
                  phone: c.phone || '',
                  city: c.city || '',
                  company: c.company || '',
                  jobTitle: c.jobTitle || '',
                  industry: c.industry || '',
                  tags: c.tags ? c.tags.join(', ') : '',
                });
                setAddDialogOpen(true);
              }
            }
            handleActionMenuClose();
          }}
          sx={{ fontSize: '13px', fontWeight: 500 }}
        >
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuContactId) handleDeleteContact(menuContactId);
          }}
          sx={{ fontSize: '13px', fontWeight: 500, color: '#ba1a1a' }}
        >
          Delete
        </MenuItem>
      </Menu>

      {/* Dialog: Add/Edit Contact */}
      <ContactFormDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSubmit={handleContactFormSubmit}
        dialogMode={dialogMode}
        newContact={newContact}
        setNewContact={setNewContact}
      />

      {/* Dialog: Import CSV Wizard */}
      <ImportDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onImportComplete={fetchContacts}
      />

      {/* Dialog: Export Data */}
      <Dialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        slotProps={{
          paper: {
            sx: { borderRadius: '16px', p: 1 },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#0b1c30' }}>
          Export Contacts
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '13.5px', color: '#464555', mt: 1 }}>
            Are you sure you want to export all contacts to a CSV file?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setExportDialogOpen(false)} sx={{ textTransform: 'none', color: '#464555', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleExportContacts}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
          >
            Download CSV
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
