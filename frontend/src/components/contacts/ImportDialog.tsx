'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Avatar,
  Divider,
  Button,
  Chip,
  Checkbox,
  Paper,
} from '@mui/material';
import {
  UploadFile,
  Visibility,
  CheckCircle,
  CloudUpload,
  Info,
  Description,
  ContentCopy,
  Download,
  ArrowForward,
} from '@mui/icons-material';
import api from '../../utils/api';

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

export default function ImportDialog({
  open,
  onClose,
  onImportComplete,
}: ImportDialogProps) {
  const [importStep, setImportStep] = useState<1 | 2 | 3>(1);
  const [importProgress, setImportProgress] = useState(0);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [parsedImportContacts, setParsedImportContacts] = useState<any[]>([]);
  const [importResult, setImportResult] = useState<{ added: number; updated: number; skipped: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Animate CSV Import progress in Step 3
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (open && importStep === 3) {
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
  }, [open, importStep]);

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
      onImportComplete();
    } catch (err: any) {
      clearInterval(interval);
      console.error(err);
      alert(err.response?.data?.error || 'Error importing contacts');
      setImportStep(2);
    }
  };

  const handleClose = () => {
    setImportStep(1);
    setParsedImportContacts([]);
    setImportResult(null);
    setImportProgress(0);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
              <Avatar sx={{ width: 80, height: 80, bgcolor: 'rgba(46, 125, 50, 0.1)', color: '#2e7d32' }}>
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
              onClick={handleClose}
              sx={{ textTransform: 'none', color: '#464555', fontWeight: 600 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => setImportStep(2)}
              disabled={parsedImportContacts.length === 0}
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
              onClick={handleClose}
              variant="outlined"
              sx={{ textTransform: 'none', color: '#464555', borderColor: '#c7c4d8', fontWeight: 600, borderRadius: '8px' }}
            >
              View Dashboard
            </Button>
            <Button
              variant="contained"
              onClick={handleClose}
              disabled={importProgress < 100}
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
            >
              Go to Contacts
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
