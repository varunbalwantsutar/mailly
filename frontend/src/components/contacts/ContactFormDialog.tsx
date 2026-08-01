'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  TextField,
} from '@mui/material';

interface ContactFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  dialogMode: 'add' | 'edit';
  newContact: {
    name: string;
    email: string;
    phone: string;
    city: string;
    company: string;
    jobTitle: string;
    industry: string;
    tags: string;
  };
  setNewContact: React.Dispatch<React.SetStateAction<any>>;
}

export default function ContactFormDialog({
  open,
  onClose,
  onSubmit,
  dialogMode,
  newContact,
  setNewContact,
}: ContactFormDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
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
        <Box component="form" onSubmit={onSubmit} sx={{ mt: 1 }}>
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
        <Button onClick={onClose} sx={{ textTransform: 'none', color: '#464555', fontWeight: 600 }}>
          Cancel
        </Button>
        <Button onClick={onSubmit} variant="contained" sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}>
          {dialogMode === 'add' ? 'Add Contact' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
