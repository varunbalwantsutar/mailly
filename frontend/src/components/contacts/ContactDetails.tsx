'use client';

import React from 'react';
import { Paper, Box, Avatar, Typography, Chip, Button } from '@mui/material';
import { Mail, Call, LocationOn, Delete } from '@mui/icons-material';
import { Contact } from '../../types';

interface ContactDetailsProps {
  selectedContact: Contact | null;
  onEdit: () => void;
  onDelete: (id: string | number) => void;
}

export default function ContactDetails({
  selectedContact,
  onEdit,
  onDelete,
}: ContactDetailsProps) {
  if (!selectedContact) return null;

  return (
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
          onClick={onEdit}
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
          onClick={() => onDelete(selectedContact.id)}
        >
          <Delete sx={{ fontSize: '18px' }} />
        </Button>
      </Box>
    </Paper>
  );
}
