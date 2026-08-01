'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '../../../../utils/api';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Chip,
  IconButton,
  CircularProgress,
  Divider,
  Avatar,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  ArrowBack,
  Email,
  People,
  CheckCircle,
  Visibility,
  Refresh,
  QueryBuilder,
} from '@mui/icons-material';

interface CampaignDetail {
  id: string;
  camId: string;
  name: string;
  subject: string;
  body: string;
  fromName: string;
  fromEmail: string;
  status: string;
  recipientType: string;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  failedCount: number;
  openRate: number;
  deliveryRate: number;
  scheduledAt?: string | null;
  timezone?: string;
  recipients: Array<{
    id: string;
    email: string;
    status: string;
    deliveredAt: string | null;
    openedAt: string | null;
  }>;
}

export default function CampaignAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchCampaignDetails = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) setIsRefreshing(true);
      else setLoading(true);

      const res = await api.get(`/campaigns/${id}`);
      setCampaign(res.data.campaign);
    } catch (err) {
      console.error('Error fetching campaign details:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCampaignDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!campaign) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="textSecondary">
          Campaign report not found.
        </Typography>
        <Button startIcon={<ArrowBack />} onClick={() => router.push('/campaigns')} sx={{ mt: 2 }}>
          Back to Campaigns
        </Button>
      </Box>
    );
  }

  const columns: GridColDef[] = [
    {
      field: 'email',
      headerName: 'RECIPIENT EMAIL',
      flex: 1.5,
      renderCell: (params) => (
        <Typography sx={{ color: '#0b1c30', fontSize: '13px', display: 'flex', alignItems: 'center', height: '100%' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'STATUS',
      flex: 1.0,
      renderCell: (params) => {
        const status = params.value;
        let color = 'default';
        let bg = 'rgba(199, 196, 216, 0.2)';
        let text = '#464555';

        if (status === 'OPENED') {
          bg = 'rgba(46, 125, 50, 0.08)';
          text = '#2e7d32';
        } else if (status === 'DELIVERED') {
          bg = 'rgba(53, 37, 205, 0.08)';
          text = '#3525cd';
        } else if (status === 'FAILED') {
          bg = 'rgba(211, 47, 47, 0.08)';
          text = '#d32f2f';
        }

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Chip
              label={status}
              size="small"
              sx={{
                bgcolor: bg,
                color: text,
                fontWeight: 700,
                fontSize: '10px',
                borderRadius: '4px',
              }}
            />
          </Box>
        );
      },
    },
    {
      field: 'deliveredAt',
      headerName: 'DELIVERED AT',
      flex: 1.2,
      renderCell: (params) => (
        <Typography sx={{ color: '#464555', fontSize: '12.5px', display: 'flex', alignItems: 'center', height: '100%' }}>
          {params.value ? new Date(params.value).toLocaleString() : '—'}
        </Typography>
      ),
    },
    {
      field: 'openedAt',
      headerName: 'OPENED AT',
      flex: 1.2,
      renderCell: (params) => (
        <Typography sx={{ color: '#464555', fontSize: '12.5px', display: 'flex', alignItems: 'center', height: '100%', fontWeight: params.value ? 600 : 400 }}>
          {params.value ? new Date(params.value).toLocaleString() : 'Not Opened'}
        </Typography>
      ),
    },
  ];

  return (
    <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => router.push('/campaigns')} sx={{ border: '1px solid rgba(199, 196, 216, 0.3)' }}>
            <ArrowBack sx={{ fontSize: '18px' }} />
          </IconButton>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0b1c30' }}>
              {campaign.name}
            </Typography>
            <Typography variant="body2" sx={{ color: '#777587', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip label={campaign.camId} size="small" sx={{ height: 20, fontSize: '10px', fontWeight: 700 }} />
              • Status: {campaign.status}
            </Typography>
          </Box>
        </Box>
        <Button
          variant="outlined"
          startIcon={isRefreshing ? <CircularProgress size={16} /> : <Refresh />}
          onClick={() => fetchCampaignDetails(true)}
          sx={{ textTransform: 'none', fontWeight: 600, color: '#464555', borderColor: '#c7c4d8' }}
        >
          Refresh Stats
        </Button>
      </Box>

      {/* Analytics Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3 }}>
        <Paper elevation={0} sx={{ p: 3, border: '1px solid rgba(199, 196, 216, 0.3)', borderRadius: '16px' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Avatar sx={{ bgcolor: 'rgba(53, 37, 205, 0.08)', color: '#3525cd' }}>
              <People />
            </Avatar>
            <Typography variant="caption" sx={{ color: '#777587', fontWeight: 700 }}>RECIPIENTS</Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0b1c30', mb: 0.5 }}>
            {campaign.sentCount}
          </Typography>
          <Typography variant="caption" sx={{ color: '#777587' }}>Total target audience</Typography>
        </Paper>

        <Paper elevation={0} sx={{ p: 3, border: '1px solid rgba(199, 196, 216, 0.3)', borderRadius: '16px' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Avatar sx={{ bgcolor: 'rgba(46, 125, 50, 0.08)', color: '#2e7d32' }}>
              <CheckCircle />
            </Avatar>
            <Typography variant="caption" sx={{ color: '#777587', fontWeight: 700 }}>DELIVERED</Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0b1c30', mb: 0.5 }}>
            {campaign.deliveredCount}
          </Typography>
          <Typography variant="caption" sx={{ color: '#2e7d32', fontWeight: 600 }}>{campaign.deliveryRate}% Delivery Rate</Typography>
        </Paper>

        <Paper elevation={0} sx={{ p: 3, border: '1px solid rgba(199, 196, 216, 0.3)', borderRadius: '16px' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Avatar sx={{ bgcolor: 'rgba(237, 108, 2, 0.08)', color: '#ed6c02' }}>
              <Visibility />
            </Avatar>
            <Typography variant="caption" sx={{ color: '#777587', fontWeight: 700 }}>UNIQUE OPENS</Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0b1c30', mb: 0.5 }}>
            {campaign.openedCount}
          </Typography>
          <Typography variant="caption" sx={{ color: '#ed6c02', fontWeight: 600 }}>{campaign.openRate}% Open Rate</Typography>
        </Paper>

        <Paper elevation={0} sx={{ p: 3, border: '1px solid rgba(199, 196, 216, 0.3)', borderRadius: '16px' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Avatar sx={{ bgcolor: 'rgba(211, 47, 47, 0.08)', color: '#d32f2f' }}>
              <Email />
            </Avatar>
            <Typography variant="caption" sx={{ color: '#777587', fontWeight: 700 }}>BOUNCES / FAILS</Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0b1c30', mb: 0.5 }}>
            {campaign.failedCount}
          </Typography>
          <Typography variant="caption" sx={{ color: '#777587' }}>Undelivered messages</Typography>
        </Paper>
      </Box>

      {/* Campaign Details Info */}
      <Paper elevation={0} sx={{ p: 4, border: '1px solid rgba(199, 196, 216, 0.3)', borderRadius: '16px' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0b1c30', mb: 3 }}>
          Campaign Overview
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography sx={{ color: '#777587', fontSize: '11px', fontWeight: 700 }}>EMAIL SUBJECT</Typography>
              <Typography sx={{ color: '#0b1c30', fontWeight: 600, mt: 0.5 }}>{campaign.subject}</Typography>
            </Box>
            <Box>
              <Typography sx={{ color: '#777587', fontSize: '11px', fontWeight: 700 }}>SENDER INFO</Typography>
              <Typography sx={{ color: '#0b1c30', fontWeight: 500, mt: 0.5 }}>
                "{campaign.fromName}" &lt;{campaign.fromEmail}&gt;
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography sx={{ color: '#777587', fontSize: '11px', fontWeight: 700 }}>RECIPIENT METHOD</Typography>
              <Typography sx={{ color: '#0b1c30', fontWeight: 600, mt: 0.5, textTransform: 'capitalize' }}>
                {campaign.recipientType === 'audience' ? 'Targeted Segment' : 'Custom pasted emails'}
              </Typography>
            </Box>
            {campaign.scheduledAt && (
              <Box>
                <Typography sx={{ color: '#777587', fontSize: '11px', fontWeight: 700 }}>SCHEDULED FOR</Typography>
                <Typography sx={{ color: '#0b1c30', fontWeight: 500, mt: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <QueryBuilder sx={{ fontSize: '16px', color: '#777587' }} />
                  {new Date(campaign.scheduledAt).toLocaleString()} ({campaign.timezone})
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Recipient Actions List */}
      <Paper elevation={0} sx={{ border: '1px solid rgba(199, 196, 216, 0.3)', borderRadius: '16px', overflow: 'hidden' }}>
        <Box sx={{ px: 3, py: 2.5, bgcolor: '#f8f9ff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0b1c30', fontSize: '16px' }}>
            Recipient Delivery Log
          </Typography>
        </Box>
        <Box sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={campaign.recipients}
            columns={columns}
            disableRowSelectionOnClick
            hideFooterSelectedRowCount
            sx={{
              border: 'none',
              '& .MuiDataGrid-columnHeaders': {
                bgcolor: '#f8f9ff',
                borderBottom: '1px solid rgba(199, 196, 216, 0.3)',
              },
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid rgba(199, 196, 216, 0.15)',
              },
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
}
