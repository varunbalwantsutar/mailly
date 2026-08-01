'use client';

import React, { useState, useEffect, useRef } from 'react';
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

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  city: string;
  company: string;
  tags: string[];
  dateCreated: string;
  status: 'ACTIVE' | 'INACTIVE';
  avatarUrl?: string;
  initials?: string;
  jobTitle?: string;
  industry?: string;
  leadScore?: number;
}

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
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({
    type: 'include',
    ids: new Set(),
  });
  const [activeFilters, setActiveFilters] = useState<{ type: string; value: string }[]>([]);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);

  // Dynamic stats calculation
  const totalContacts = contacts.length;
  const taggedContacts = contacts.filter((c) => c.tags && c.tags.length > 0).length;
  const recentlyAdded = contacts.filter((c) => {
    const date = c.createdAt ? new Date(c.createdAt) : null;
    if (!date || isNaN(date.getTime())) return false;
    const diffDays = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 7; // added in last 7 days
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
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dialog mode
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [editContactId, setEditContactId] = useState<string | number | null>(null);

  // CSV Import Wizard State
  const [importStep, setImportStep] = useState<1 | 2 | 3>(1);
  const [importProgress, setImportProgress] = useState(0);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [parsedImportContacts, setParsedImportContacts] = useState<any[]>([]);
  const [importResult, setImportResult] = useState<{ added: number; updated: number; skipped: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Animate CSV Import progress in Step 3
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (importDialogOpen && importStep === 3) {
      setImportProgress(64);
      interval = setInterval(() => {
        setImportProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          const next = prev + Math.floor(Math.random() * 5) + 3;
          return next > 100 ? 100 : next;
        });
      }, 700);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [importDialogOpen, importStep]);

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

  // Trigger Skeletons simulation for visual delight
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

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

  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/);
    if (lines.length === 0) return [];

    // Extract headers
    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
    const results = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
      const values = matches.map(v => v.trim().replace(/^["']|["']$/g, ''));

      const record: any = {};
      headers.forEach((header, index) => {
        record[header] = values[index] || '';
      });

      results.push(record);
    }
    return results;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseCSV(text);
      setParsedImportContacts(parsed);
      setImportStep(2);
    };
    reader.readAsText(file);
  };

  const handleStartImport = async () => {
    setImportStep(3);
    setImportProgress(10);

    const interval = setInterval(() => {
      setImportProgress((prev) => (prev < 90 ? prev + 10 : prev));
    }, 200);

    try {
      const res = await api.post('/contacts/import', {
        contacts: parsedImportContacts,
        skipDuplicates,
      });

      clearInterval(interval);
      const data = res.data;
      setImportResult(data);
      setImportProgress(100);
      fetchContacts();
    } catch (err: any) {
      clearInterval(interval);
      console.error(err);
      alert(err.response?.data?.error || 'Error importing contacts');
      setImportStep(2);
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

  // Filter and search logic
  const filteredContacts = contacts.filter((c) => {
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
          <KpiCard title="Total Contacts" value={totalContacts.toLocaleString()} trend="+12%" icon={<Groups />} color="#3525cd" />
          <KpiCard title="Tagged Contacts" value={taggedContacts.toLocaleString()} icon={<Tag />} color="#5c5f61" />
          <KpiCard title="Recently Added" value={recentlyAdded.toLocaleString()} icon={<History />} color="#5c5f61" />
          <KpiCard title="Duplicate Contacts" value={duplicateContactsCount.toLocaleString()} icon={<Warning />} color="#ba1a1a" />
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
              {uniqueTags.length === 0 ? (
                <Typography sx={{ px: 2, py: 0.5, fontSize: '12.5px', color: '#777587', fontStyle: 'italic' }}>
                  No tags found
                </Typography>
              ) : (
                uniqueTags.map((tag: string) => {
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
              {uniqueCities.length === 0 ? (
                <Typography sx={{ px: 2, py: 0.5, fontSize: '12.5px', color: '#777587', fontStyle: 'italic' }}>
                  No cities found
                </Typography>
              ) : (
                uniqueCities.map((city: string) => {
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
        {selectedContact && (
          <Paper
            elevation={0}
            sx={{
              width: '400px',
              border: '1px solid rgba(199, 196, 216, 0.3)',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              bgcolor: '#ffffff',
              overflow: 'hidden',
              flexShrink: 0,
              height: 556,
            }}
          >
            {/* Header profile section */}
            <Box sx={{ pt: 4, pb: 3, px: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, borderBottom: '1px solid rgba(199, 196, 216, 0.2)' }}>
              <Box sx={{ position: 'relative' }}>
                {selectedContact.avatarUrl ? (
                  <Avatar
                    src={selectedContact.avatarUrl}
                    sx={{ width: 88, height: 88, border: '4px solid #f8f9ff', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  />
                ) : (
                  <Avatar
                    sx={{ width: 88, height: 88, bgcolor: '#eff4ff', color: '#3525cd', fontSize: '32px', fontWeight: 700, border: '4px solid #f8f9ff', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  >
                    {selectedContact.initials}
                  </Avatar>
                )}
                <Box sx={{ position: 'absolute', bottom: 4, right: 4, width: 14, height: 14, bgcolor: '#2e7d32', border: '2px solid #ffffff', borderRadius: '50%' }} />
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" sx={{ color: '#0b1c30', fontWeight: 700, fontSize: '18px' }}>
                  {selectedContact.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 0.5 }}>
                  <Chip
                    label={selectedContact.status}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(46, 125, 50, 0.1)',
                      color: '#2e7d32',
                      fontWeight: 700,
                      fontSize: '9.5px',
                      height: 18,
                    }}
                  />
                  <Typography variant="caption" sx={{ color: '#777587', fontSize: '11px' }}>
                    Joined {selectedContact.dateCreated}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Panel Content */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 3.5 }}>
              {/* Basic Information */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="caption" sx={{ color: '#777587', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '10.5px' }}>
                    Basic Information
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Mail sx={{ color: 'rgba(70, 69, 85, 0.5)', fontSize: '18px' }} />
                    <Box sx={{ overflow: 'hidden' }}>
                      <Typography sx={{ color: '#777587', fontSize: '10.5px' }}>Email Address</Typography>
                      <Typography sx={{ color: '#0b1c30', fontSize: '13px', fontWeight: 500 }} noWrap>{selectedContact.email}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Call sx={{ color: 'rgba(70, 69, 85, 0.5)', fontSize: '18px' }} />
                    <Box>
                      <Typography sx={{ color: '#777587', fontSize: '10.5px' }}>Phone Number</Typography>
                      <Typography sx={{ color: '#0b1c30', fontSize: '13px', fontWeight: 500 }}>{selectedContact.phone}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LocationOn sx={{ color: 'rgba(70, 69, 85, 0.5)', fontSize: '18px' }} />
                    <Box>
                      <Typography sx={{ color: '#777587', fontSize: '10.5px' }}>Location</Typography>
                      <Typography sx={{ color: '#0b1c30', fontSize: '13px', fontWeight: 500 }}>{selectedContact.city}, USA</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Panel footer buttons */}
            <Box sx={{ p: 3, borderTop: '1px solid rgba(199, 196, 216, 0.2)', display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                fullWidth
                sx={{ py: 1.2, fontSize: '13px', fontWeight: 600, textTransform: 'none', borderRadius: '10px' }}
                onClick={() => {
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
                }}
              >
                Edit Contact
              </Button>
              <Button
                variant="outlined"
                color="error"
                sx={{
                  minWidth: 48,
                  p: 0,
                  borderRadius: '10px',
                  borderColor: 'rgba(186, 26, 26, 0.2)',
                  '&:hover': {
                    bgcolor: 'rgba(186, 26, 26, 0.05)',
                  },
                }}
                onClick={() => handleDeleteContact(selectedContact.id)}
              >
                <Delete sx={{ fontSize: '18px' }} />
              </Button>
            </Box>
          </Paper>
        )}
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

      {/* Dialog: Add Contact */}
      <Dialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: '16px', p: 1 },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#0b1c30' }}>
          {dialogMode === 'add' ? 'Add New Contact' : 'Edit Contact'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleContactFormSubmit} sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                size="small"
                label="Full Name"
                required
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
              />
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Email Address"
                  type="email"
                  required
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Phone Number"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Company"
                  value={newContact.company}
                  onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="City"
                  value={newContact.city}
                  onChange={(e) => setNewContact({ ...newContact, city: e.target.value })}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Job Title"
                  value={newContact.jobTitle}
                  onChange={(e) => setNewContact({ ...newContact, jobTitle: e.target.value })}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Industry"
                  value={newContact.industry}
                  onChange={(e) => setNewContact({ ...newContact, industry: e.target.value })}
                />
              </Box>
              <TextField
                fullWidth
                size="small"
                label="Tags (comma-separated)"
                placeholder="VIP, Customer, Lead"
                value={newContact.tags}
                onChange={(e) => setNewContact({ ...newContact, tags: e.target.value })}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setAddDialogOpen(false)} sx={{ textTransform: 'none', color: '#464555', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button onClick={handleContactFormSubmit} variant="contained" sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}>
            {dialogMode === 'add' ? 'Add Contact' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Import CSV Wizard */}
      <Dialog
        open={importDialogOpen}
        onClose={() => {
          setImportDialogOpen(false);
          setImportStep(1);
        }}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: '20px', p: 2 },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0b1c30', fontSize: '20px', pb: 1 }}>
          Import Contacts
        </DialogTitle>
        <DialogContent sx={{ overflowY: 'auto', maxHeight: '80vh' }}>

          {/* Progress Stepper Section */}
          <Box sx={{ mb: 4, mt: 1, position: 'relative' }}>
            {/* Progress Line background */}
            <Box sx={{ position: 'absolute', top: '20px', left: '10%', right: '10%', height: '2px', bgcolor: 'rgba(199, 196, 216, 0.3)', zIndex: 0 }} />
            {/* Active Progress Line */}
            <Box
              sx={{
                position: 'absolute',
                top: '20px',
                left: '10%',
                width: importStep === 1 ? '0%' : importStep === 2 ? '40%' : '80%',
                height: '2px',
                bgcolor: '#3525cd',
                zIndex: 0,
                transition: 'width 0.4s ease',
              }}
            />

            {/* Step Nodes */}
            <Box sx={{ display: 'flex', justifyContent: 'space-around', position: 'relative', zIndex: 1 }}>
              {/* Step 1 */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, cursor: 'pointer' }} onClick={() => setImportStep(1)}>
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: '#3525cd',
                    color: '#ffffff',
                    boxShadow: '0 2px 6px rgba(53, 37, 205, 0.2)',
                    border: '4px solid #ffffff',
                  }}
                >
                  <UploadFile sx={{ fontSize: '20px' }} />
                </Avatar>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#3525cd', bgcolor: '#ffffff', px: 1 }}>
                  1. Upload CSV
                </Typography>
              </Box>

              {/* Step 2 */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, cursor: 'pointer' }} onClick={() => importStep >= 2 && setImportStep(2)}>
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: importStep >= 2 ? '#3525cd' : '#eff4ff',
                    color: importStep >= 2 ? '#ffffff' : '#777587',
                    border: '4px solid #ffffff',
                    transition: 'all 0.3s',
                  }}
                >
                  <Visibility sx={{ fontSize: '20px' }} />
                </Avatar>
                <Typography variant="caption" sx={{ fontWeight: 700, color: importStep >= 2 ? '#3525cd' : '#777587', bgcolor: '#ffffff', px: 1 }}>
                  2. Preview
                </Typography>
              </Box>

              {/* Step 3 */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, cursor: 'pointer' }} onClick={() => importStep === 3 && setImportStep(3)}>
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: importStep === 3 ? '#2e7d32' : '#eff4ff',
                    color: importStep === 3 ? '#ffffff' : '#777587',
                    border: '4px solid #ffffff',
                    transition: 'all 0.3s',
                  }}
                >
                  <CheckCircle sx={{ fontSize: '20px' }} />
                </Avatar>
                <Typography variant="caption" sx={{ fontWeight: 700, color: importStep === 3 ? '#2e7d32' : '#777587', bgcolor: '#ffffff', px: 1 }}>
                  3. Summary
                </Typography>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 3, opacity: 0.5 }} />

          {/* STEP 1: UPLOAD */}
          {importStep === 1 && (
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
              {/* Left Column: Drag & Drop Zone */}
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  accept=".csv"
                />
                <Box
                  sx={{
                    height: '320px',
                    border: '2px dashed #c7c4d8',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 3,
                    bgcolor: '#f8f9ff',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: '#3525cd',
                      bgcolor: 'rgba(53, 37, 205, 0.02)',
                    },
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Avatar sx={{ width: 64, height: 64, bgcolor: '#eff4ff', color: '#3525cd', mb: 2 }}>
                    <CloudUpload sx={{ fontSize: '32px' }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ color: '#0b1c30', fontWeight: 700, mb: 0.5 }}>
                    Import your contacts
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#777587', mb: 3 }}>
                    Drag & drop your CSV file here or <span style={{ color: '#3525cd', fontWeight: 600 }}>browse files</span>
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 1.5, bgcolor: '#ffffff', borderRadius: '8px', border: '1px solid rgba(199, 196, 216, 0.3)', maxWidth: '400px' }}>
                    <Info sx={{ color: '#777587', fontSize: '18px', marginTop: '2px' }} />
                    <Typography sx={{ fontSize: '11px', color: '#777587', textAlign: 'left', lineHeight: 1.4 }}>
                      Ensure your CSV includes columns: <strong>name, email, phone, city, tags</strong>. Max file size: 50MB.
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Right Column: Template & Pro Tip */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: { xs: '100%', md: '300px' }, flexShrink: 0 }}>
                <Paper elevation={0} sx={{ p: 2.5, bgcolor: '#f8f9ff', border: '1px solid rgba(199, 196, 216, 0.3)', borderRadius: '12px' }}>
                  <Typography variant="subtitle2" sx={{ color: '#0b1c30', fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Description sx={{ color: '#3525cd', fontSize: '18px' }} />
                    Template Structure
                  </Typography>
                  <Box sx={{ bgcolor: '#ffffff', border: '1px solid rgba(199, 196, 216, 0.5)', p: 1.5, borderRadius: '8px', fontFamily: 'monospace', fontSize: '11px', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(199, 196, 216, 0.3)', pb: 0.5, mb: 0.5, color: '#777587' }}>
                      <span>name,email,phone...</span>
                      <ContentCopy sx={{ fontSize: '12px', cursor: 'pointer' }} />
                    </Box>
                    <Box sx={{ color: 'rgba(92, 95, 97, 0.6)', lineHeight: 1.4 }}>
                      John Doe,john@example.com,123...<br />
                      Jane Smith,jane@mail.com,456...
                    </Box>
                  </Box>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Download sx={{ fontSize: '16px' }} />}
                    sx={{ textTransform: 'none', color: '#464555', borderColor: '#c7c4d8', fontSize: '12px', fontWeight: 600, py: 0.8 }}
                  >
                    Download Sample CSV
                  </Button>
                </Paper>

                <Box sx={{ p: 2, bgcolor: 'rgba(53, 37, 205, 0.04)', borderRadius: '12px', border: '1px solid rgba(53, 37, 205, 0.1)' }}>
                  <Typography sx={{ color: '#3525cd', fontWeight: 700, fontSize: '13px', mb: 0.5 }}>Pro Tip</Typography>
                  <Typography sx={{ fontSize: '12px', color: '#464555', lineHeight: 1.4 }}>
                    You can add a <strong>tags</strong> column with comma-separated values to automatically segment your audience during import.
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          {/* STEP 2: PREVIEW */}
          {importStep === 2 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ color: '#0b1c30', fontWeight: 700, fontSize: '16px' }}>Data Preview</Typography>
                  <Typography variant="body2" sx={{ color: '#777587' }}>We've parsed {parsedImportContacts.length} contacts. Review for potential issues.</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    label={`${parsedImportContacts.filter(c => c.name && c.email).length} Valid`}
                    size="small"
                    sx={{ bgcolor: 'rgba(46, 125, 50, 0.08)', color: '#2e7d32', fontWeight: 700, border: '1px solid rgba(46, 125, 50, 0.2)', fontSize: '11px' }}
                  />
                  <Chip
                    label={`${parsedImportContacts.filter(c => !c.email).length} Invalid`}
                    size="small"
                    sx={{ bgcolor: 'rgba(211, 47, 47, 0.08)', color: '#d32f2f', fontWeight: 700, border: '1px solid rgba(211, 47, 47, 0.2)', fontSize: '11px' }}
                  />
                </Box>
              </Box>

              {/* Table Preview */}
              <Paper elevation={0} sx={{ border: '1px solid rgba(199, 196, 216, 0.3)', borderRadius: '12px', overflow: 'hidden' }}>
                <Box sx={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8f9ff', borderBottom: '1px solid rgba(199, 196, 216, 0.2)' }}>
                        <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#464555' }}>STATUS</th>
                        <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#464555' }}>NAME</th>
                        <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#464555' }}>EMAIL</th>
                        <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#464555' }}>PHONE</th>
                        <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#464555' }}>CITY</th>
                        <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#464555' }}>TAGS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedImportContacts.slice(0, 5).map((c, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(199, 196, 216, 0.15)' }}>
                          <td style={{ padding: '12px 16px' }}>
                            <Chip label={c.email && c.name ? "VALID" : "INVALID"} size="small" sx={{ bgcolor: c.email && c.name ? 'rgba(46, 125, 50, 0.08)' : 'rgba(211, 47, 47, 0.08)', color: c.email && c.name ? '#2e7d32' : '#d32f2f', fontWeight: 700, borderRadius: '4px', height: 20, fontSize: '9px' }} />
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '12.5px', fontWeight: 600, color: '#0b1c30' }}>{c.name || '—'}</td>
                          <td style={{ padding: '12px 16px', fontSize: '12.5px', color: c.email ? '#0b1c30' : '#d32f2f', fontStyle: c.email ? 'normal' : 'italic' }}>{c.email || 'No email detected'}</td>
                          <td style={{ padding: '12px 16px', fontSize: '12.5px', color: '#777587' }}>{c.phone || '—'}</td>
                          <td style={{ padding: '12px 16px', fontSize: '12.5px', color: '#777587' }}>{c.city || '—'}</td>
                          <td style={{ padding: '12px 16px' }}>
                            {c.tags ? c.tags.split(';').map((t: string, tIdx: number) => (
                              <Chip key={tIdx} label={t} size="small" sx={{ bgcolor: 'rgba(53, 37, 205, 0.05)', color: '#3525cd', fontSize: '9px', fontWeight: 700, borderRadius: '4px', height: 18, mr: 0.5 }} />
                            )) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              </Paper>

              {/* Skip duplicates toggle */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2, bgcolor: '#f8f9ff', borderRadius: '12px', border: '1px solid rgba(199, 196, 216, 0.2)' }}>
                <Checkbox
                  checked={skipDuplicates}
                  onChange={(e) => setSkipDuplicates(e.target.checked)}
                  size="small"
                />
                <Typography variant="body2" sx={{ color: '#0b1c30', fontWeight: 500 }}>
                  Skip duplicate contacts and update existing records
                </Typography>
              </Box>
            </Box>
          )}

          {/* STEP 3: SUMMARY */}
          {importStep === 3 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2, textAlign: 'center' }}>
              <Box sx={{ position: 'relative', mb: 3 }}>
                <Avatar sx={{ width: 80, height: 80, bgcolor: 'rgba(46, 125, 50, 0.1)', color: '#2e7d32', animation: 'bounce 2s infinite' }}>
                  <CheckCircle sx={{ fontSize: '40px' }} />
                </Avatar>
              </Box>

              <Typography variant="h5" sx={{ color: '#0b1c30', fontWeight: 800, mb: 1, fontSize: '20px' }}>
                {importProgress < 100 ? 'Importing Contacts...' : 'Import Completed!'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#777587', maxWidth: '460px', mb: 4, lineHeight: 1.5 }}>
                {importProgress < 100
                  ? "We're processing your file. You can safely navigate away from this page; we'll notify you when the import is complete."
                  : importResult
                    ? `Import finished! ${importResult.added} added, ${importResult.updated} updated, ${importResult.skipped} skipped.`
                    : 'Your contact database has been successfully updated with the imported CSV data.'}
              </Typography>

              <Box sx={{ width: '100%', maxWidth: '520px', bgcolor: '#f8f9ff', p: 3, borderRadius: '16px', border: '1px solid rgba(199, 196, 216, 0.3)', textAlign: 'left', mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ color: '#0b1c30', fontWeight: 700 }}>Overall Progress</Typography>
                  <Typography variant="subtitle2" sx={{ color: '#3525cd', fontWeight: 700 }}>{importProgress}%</Typography>
                </Box>
                <Box sx={{ width: '100%', height: 8, bgcolor: 'rgba(199, 196, 216, 0.3)', borderRadius: '99px', overflow: 'hidden', mb: 3 }}>
                  <Box sx={{ height: '100%', width: `${importProgress}%`, bgcolor: '#3525cd', borderRadius: '99px', transition: 'width 0.5s ease-out' }} />
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, textAlign: 'center' }}>
                  <Paper elevation={0} sx={{ p: 1.5, border: '1px solid rgba(199, 196, 216, 0.2)', borderRadius: '10px', bgcolor: '#ffffff' }}>
                    <Typography variant="h6" sx={{ color: '#3525cd', fontWeight: 700 }}>
                      {importResult ? importResult.added : 0}
                    </Typography>
                    <Typography sx={{ fontSize: '9.5px', color: '#777587', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Added</Typography>
                  </Paper>
                  <Paper elevation={0} sx={{ p: 1.5, border: '1px solid rgba(199, 196, 216, 0.2)', borderRadius: '10px', bgcolor: '#ffffff' }}>
                    <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 700 }}>
                      {importResult ? importResult.updated : 0}
                    </Typography>
                    <Typography sx={{ fontSize: '9.5px', color: '#777587', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Merged</Typography>
                  </Paper>
                  <Paper elevation={0} sx={{ p: 1.5, border: '1px solid rgba(199, 196, 216, 0.2)', borderRadius: '10px', bgcolor: '#ffffff' }}>
                    <Typography variant="h6" sx={{ color: '#ba1a1a', fontWeight: 700 }}>
                      {importResult ? importResult.skipped : 0}
                    </Typography>
                    <Typography sx={{ fontSize: '9.5px', color: '#777587', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Skipped</Typography>
                  </Paper>
                </Box>
              </Box>
            </Box>
          )}

        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(199, 196, 216, 0.2)', justifyContent: 'flex-end', gap: 2 }}>
          {importStep === 1 && (
            <>
              <Button
                onClick={() => setImportDialogOpen(false)}
                sx={{ textTransform: 'none', color: '#464555', fontWeight: 600 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={() => setImportStep(2)}
                endIcon={<ArrowForward sx={{ fontSize: '18px' }} />}
                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
              >
                Continue to Preview
              </Button>
            </>
          )}

          {importStep === 2 && (
            <>
              <Button
                onClick={() => setImportStep(1)}
                sx={{ textTransform: 'none', color: '#464555', fontWeight: 600 }}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleStartImport}
                disabled={parsedImportContacts.length === 0}
                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
              >
                Start Import ({parsedImportContacts.length})
              </Button>
            </>
          )}

          {importStep === 3 && (
            <>
              <Button
                onClick={() => {
                  setImportDialogOpen(false);
                  setImportStep(1);
                }}
                variant="outlined"
                sx={{ textTransform: 'none', color: '#464555', borderColor: '#c7c4d8', fontWeight: 600, borderRadius: '8px' }}
              >
                View Dashboard
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  setImportDialogOpen(false);
                  setImportStep(1);
                }}
                disabled={importProgress < 100}
                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
              >
                Go to Contacts
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

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
