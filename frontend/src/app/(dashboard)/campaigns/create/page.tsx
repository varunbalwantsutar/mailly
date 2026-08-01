'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../../utils/api';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  IconButton,
  Avatar,
  Divider,
  Menu,
  MenuItem,
  InputAdornment,
  Collapse,
  Chip,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
} from '@mui/material';
import {
  EditNote,
  HistoryEdu,
  GroupAdd,
  RocketLaunch,
  Info,
  AutoAwesome,
  Tag,
  Mail,
  CheckCircle,
  RadioButtonUnchecked,
  Close,
  ArrowForward,
  ArrowBack,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Groups,
  ContentPaste,
  Lightbulb,
  Check,
  Warning,
  AddReaction,
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatListBulleted,
  FormatListNumbered,
  Link as LinkIcon,
  Image as ImageIcon,
  Title as TitleIcon,
  Undo,
  Redo,
  Save,
  DesktopWindows,
  Smartphone,
  CalendarToday,
  Public,
  Bolt,
  Event,
} from '@mui/icons-material';

// Campaign Form Schema validation
const campaignSchema = z.object({
  campaignName: z.string().min(1, 'Internal campaign name is required'),
  subjectLine: z.string().min(1, 'Email subject line is required'),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  fromName: z.string().min(1, 'From Name is required'),
  fromEmail: z.string().email('Please enter a valid email address'),
  emailBody: z.string().min(1, 'Email body is required'),
  sendTiming: z.enum(['now', 'later']),
  sendDate: z.string().optional(),
  sendTime: z.string().optional(),
  timezone: z.string().optional(),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

export default function CreateCampaignPage() {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Active step state: 0 = Details, 1 = Recipients, 2 = Compose Content, 3 = Review & Send
  const [activeStep, setActiveStep] = useState<number>(0);

  // --- Step 1 Form States ---
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [aiAnchorEl, setAiAnchorEl] = useState<null | HTMLElement>(null);

  // --- Step 3 Form States ---
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // --- Step 4 States ---
  const [isSubmittingCampaign, setIsSubmittingCampaign] = useState(false);

  // React Hook Form init
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    mode: 'onChange',
    defaultValues: {
      campaignName: '',
      subjectLine: '',
      utmSource: 'newsletter',
      utmMedium: 'email',
      utmCampaign: '',
      fromName: 'Alex from Mailly',
      fromEmail: 'alex@mailly-marketing.com',
      emailBody: `Hello {{first_name}},\n\nWe're thrilled to have you join our inner circle. At Mailly, we believe that every interaction counts. That's why we've built the world's first AI-native marketing orchestration platform designed specifically for the speed of modern business.\n\nYour first campaign is just a click away. We've optimized your dashboard based on the goals you shared during onboarding.\n\nHere's what's waiting for you:\n- Smart Segmentation Engine\n- Dynamic Content Blocks\n- Real-time Predictive Analytics`,
      sendTiming: 'now',
      sendDate: new Date().toISOString().split('T')[0],
      sendTime: '09:00',
      timezone: 'America/New_York',
    },
  });

  const watchedSubjectLine = watch('subjectLine');
  const watchedCampaignName = watch('campaignName');
  const watchedFromName = watch('fromName');
  const watchedFromEmail = watch('fromEmail');
  const watchedEmailBody = watch('emailBody');
  const watchedSendTiming = watch('sendTiming');
  const watchedSendDate = watch('sendDate');
  const watchedSendTime = watch('sendTime');
  const watchedTimezone = watch('timezone');

  // --- Step 2 Selection States ---
  const [method, setMethod] = useState<'audience' | 'paste'>('audience');
  const [targetSegment, setTargetSegment] = useState('Developers');
  const [tags, setTags] = useState(['JavaScript', 'SaaS', 'Early Adopter']);
  const [tagInput, setTagInput] = useState('');
  const [pastedEmails, setPastedEmails] = useState("abc@gmail.com\ntest@gmail.com\ninvalid-email\nmarketing@studio.io");

  const [availableAudiences, setAvailableAudiences] = useState<any[]>([]);
  const [emailRecords, setEmailRecords] = useState<any[]>([]);

  useEffect(() => {
    const fetchAvailableAudiences = async () => {
      try {
        const res = await api.get('/audiences');
        const data = res.data;
        setAvailableAudiences(data.audiences);
        if (data.audiences.length > 0) {
          setTargetSegment(data.audiences[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchAvailableAudiences();
  }, []);

  useEffect(() => {
    const performLookup = async () => {
      const rawEmailsArray = pastedEmails
        .split(/[\n,]+/)
        .map((e) => e.trim())
        .filter(Boolean);

      const parsedEmailsList = Array.from(new Set(rawEmailsArray));
      if (parsedEmailsList.length === 0) {
        setEmailRecords([]);
        return;
      }

      try {
        const res = await api.post('/contacts/lookup-recipients', { recipients: parsedEmailsList });
        const data = res.data;
        setEmailRecords(data.results);
      } catch (err) {
        console.error(err);
      }
    };

    const timer = setTimeout(performLookup, 500);
    return () => clearTimeout(timer);
  }, [pastedEmails]);

  // --- Draft local persistence (hydration & autosave) ---
  useEffect(() => {
    const saved = localStorage.getItem('mailly_campaign_draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.campaignName) setValue('campaignName', parsed.campaignName);
        if (parsed.subjectLine) setValue('subjectLine', parsed.subjectLine);
        if (parsed.fromName) setValue('fromName', parsed.fromName);
        if (parsed.fromEmail) setValue('fromEmail', parsed.fromEmail);
        if (parsed.emailBody) setValue('emailBody', parsed.emailBody);
        if (parsed.utmSource) setValue('utmSource', parsed.utmSource);
        if (parsed.utmMedium) setValue('utmMedium', parsed.utmMedium);
        if (parsed.utmCampaign) setValue('utmCampaign', parsed.utmCampaign);
        if (parsed.sendTiming) setValue('sendTiming', parsed.sendTiming);
        if (parsed.sendDate) setValue('sendDate', parsed.sendDate);
        if (parsed.sendTime) setValue('sendTime', parsed.sendTime);
        if (parsed.timezone) setValue('timezone', parsed.timezone);
        if (parsed.activeStep !== undefined) setActiveStep(parsed.activeStep);
      } catch (e) {
        console.error('Failed to restore draft from localStorage', e);
      }
    }
  }, [setValue]);

  const formValues = watch();
  useEffect(() => {
    localStorage.setItem('mailly_campaign_draft', JSON.stringify({ ...formValues, activeStep }));
  }, [formValues, activeStep]);

  const clearDraft = () => {
    localStorage.removeItem('mailly_campaign_draft');
  };

  // Skeletons loading simulation on step change
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, [activeStep]);

  // AI Suggestions
  const handleAiBoostOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAiAnchorEl(e.currentTarget);
  };
  const handleAiBoostClose = () => {
    setAiAnchorEl(null);
  };
  const selectAiSuggestion = (suggestion: string) => {
    setValue('subjectLine', suggestion, { shouldValidate: true });
    handleAiBoostClose();
  };
  const aiSuggestions = [
    '🔥 Don\'t Miss Out: Exclusive Features Inside!',
    '🚀 Boost Your Marketing ROI with this 1 Metric',
    '⚡ Quick Update: What We Built for You This Month',
    '🎁 A Special Surprise for Our Premium Members',
  ];

  // Parse pasted emails helper (De-duplicate & Trim whitespace)
  const rawEmailsArray = pastedEmails
    .split(/[\n,]+/)
    .map((e) => e.trim())
    .filter(Boolean);

  const parsedEmailsList = Array.from(new Set(rawEmailsArray));
  const duplicateEmailsCount = rawEmailsArray.length - parsedEmailsList.length;

  // emailRecords state is dynamically populated from the lookup endpoint.

  const matchedCount = emailRecords.filter((r) => r.status === 'Found').length;
  const unmatchedCount = emailRecords.filter((r) => r.status !== 'Found').length;

  const handleAddTag = () => {
    const cleaned = tagInput.trim();
    if (cleaned && !tags.includes(cleaned)) {
      setTags([...tags, cleaned]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Editor formatting selection helper
  const insertFormatting = (syntaxStart: string, syntaxEnd: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    const replacement = syntaxStart + selectedText + syntaxEnd;

    const newValue = text.substring(0, start) + replacement + text.substring(end);
    setValue('emailBody', newValue, { shouldValidate: true });

    // Focus and reset cursor positions
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + syntaxStart.length, start + syntaxStart.length + selectedText.length);
    }, 0);
  };

  // Navigations
  const handleNextStep = async () => {
    if (activeStep === 0) {
      setActiveStep(1);
    } else if (activeStep === 1) {
      setActiveStep(2);
    } else if (activeStep === 2) {
      setActiveStep(3);
    } else {
      // Step 4 final submission
      setIsSubmittingCampaign(true);
      try {
        const payload = {
          campaignName: watchedCampaignName,
          subjectLine: watchedSubjectLine,
          emailBody: watchedEmailBody,
          fromName: watchedFromName,
          fromEmail: watchedFromEmail,
          utmSource: formValues.utmSource,
          utmMedium: formValues.utmMedium,
          utmCampaign: formValues.utmCampaign,
          recipientType: method,
          audienceId: method === 'audience' && targetSegment !== 'Developers' && targetSegment !== 'Premium Users' && targetSegment !== 'Active Leads' && targetSegment !== 'none' ? targetSegment : undefined,
          tags: method === 'audience' ? tags : [],
          customRecipients: method === 'paste' ? emailRecords.map(r => r.email) : [],
          sendTiming: watchedSendTiming,
          sendDate: watchedSendTiming === 'later' ? watchedSendDate : undefined,
          sendTime: watchedSendTiming === 'later' ? watchedSendTime : undefined,
          timezone: watchedSendTiming === 'later' ? watchedTimezone : undefined,
        };

        const res = await api.post('/campaigns', payload);
        const data = res.data;

        clearDraft();
        alert(watchedSendTiming === 'now' ? 'Campaign successfully launched!' : `Campaign successfully scheduled!`);
        router.push('/campaigns');
      } catch (err) {
        console.error(err);
        alert('Error launching campaign');
      } finally {
        setIsSubmittingCampaign(false);
      }
    }
  };

  const handlePrevStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleSaveDraft = async () => {
    try {
      const payload = {
        campaignName: watchedCampaignName || 'Unnamed Draft',
        subjectLine: watchedSubjectLine || 'No Subject',
        emailBody: watchedEmailBody || '',
        fromName: watchedFromName || 'Alex from Mailly',
        fromEmail: watchedFromEmail || 'alex@mailly-marketing.com',
        utmSource: formValues.utmSource,
        utmMedium: formValues.utmMedium,
        utmCampaign: formValues.utmCampaign,
        recipientType: method,
        audienceId: method === 'audience' && targetSegment !== 'Developers' && targetSegment !== 'Premium Users' && targetSegment !== 'Active Leads' && targetSegment !== 'none' ? targetSegment : undefined,
        tags: method === 'audience' ? tags : [],
        customRecipients: method === 'paste' ? emailRecords.map(r => r.email) : [],
        sendTiming: 'draft',
      };

      const res = await api.post('/campaigns', payload);
      const data = res.data;

      clearDraft();
      alert(`Draft saved successfully!\n- Internal Name: ${watchedCampaignName || 'Unnamed Draft'}`);
      router.push('/campaigns');
    } catch (err) {
      console.error(err);
      alert('Error saving draft');
    }
  };

  const handleDiscard = () => {
    if (window.confirm('Are you sure you want to discard this campaign? All unsaved draft progress will be cleared.')) {
      clearDraft();
      router.push('/campaigns');
    }
  };

  const handleSendTest = () => {
    alert(`Test email sent to ${watchedFromEmail}!`);
  };

  // Validation Flags
  const isStep1Valid = (watchedCampaignName || '').trim() !== '' && (watchedSubjectLine || '').trim() !== '';
  const isStep3Valid = (watchedFromName || '').trim() !== '' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(watchedFromEmail || '') && (watchedEmailBody || '').trim() !== '';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 64px)' }}>
      
      {/* Progress Stepper (Header Area) */}
      <Box sx={{ w: '100%', bgcolor: '#ffffff', px: 4, py: 3, borderBottom: '1px solid rgba(199, 196, 216, 0.2)' }}>
        <Box sx={{ maxWidth: '1000px', mx: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          
          {/* Progress bar background line */}
          <Box sx={{ position: 'absolute', top: '20px', left: '10%', right: '10%', height: '2px', bgcolor: 'rgba(199, 196, 216, 0.3)', zIndex: 0 }} />
          
          {/* Progress bar active line */}
          <Box
            sx={{
              position: 'absolute',
              top: '20px',
              left: '10%',
              width: activeStep === 0 ? '0%' : activeStep === 1 ? '33%' : activeStep === 2 ? '66%' : '100%',
              height: '2px',
              bgcolor: '#3525cd',
              zIndex: 0,
              transition: 'width 0.4s ease',
            }}
          />

          {/* Step 1: Details */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, zIndex: 1, cursor: 'pointer' }} onClick={() => activeStep > 0 && setActiveStep(0)}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: activeStep >= 0 ? '#3525cd' : '#eff4ff',
                color: '#ffffff',
                border: '4px solid #ffffff',
              }}
            >
              {activeStep > 0 ? <Check sx={{ fontSize: '18px' }} /> : <EditNote sx={{ fontSize: '20px' }} />}
            </Avatar>
            <Typography variant="caption" sx={{ fontWeight: 700, color: activeStep >= 0 ? '#3525cd' : '#777587', bgcolor: '#ffffff', px: 1 }}>
              Details
            </Typography>
          </Box>

          {/* Step 2: Recipients */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, zIndex: 1, cursor: 'pointer' }} onClick={() => activeStep > 1 && isStep1Valid && setActiveStep(1)}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: activeStep >= 1 ? '#3525cd' : '#eff4ff',
                color: '#ffffff',
                border: '4px solid #ffffff',
              }}
            >
              {activeStep > 1 ? <Check sx={{ fontSize: '18px' }} /> : <GroupAdd sx={{ fontSize: '20px' }} />}
            </Avatar>
            <Typography variant="caption" sx={{ fontWeight: 700, color: activeStep >= 1 ? '#3525cd' : '#777587', bgcolor: '#ffffff', px: 1 }}>
              Recipients
            </Typography>
          </Box>

          {/* Step 3: Compose */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, zIndex: 1, cursor: 'pointer' }} onClick={() => activeStep > 2 && isStep1Valid && setActiveStep(2)}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: activeStep >= 2 ? '#3525cd' : '#eff4ff',
                color: '#ffffff',
                border: '4px solid #ffffff',
              }}
            >
              {activeStep > 2 ? <Check sx={{ fontSize: '18px' }} /> : <HistoryEdu sx={{ fontSize: '20px' }} />}
            </Avatar>
            <Typography variant="caption" sx={{ fontWeight: 700, color: activeStep >= 2 ? '#3525cd' : '#777587', bgcolor: '#ffffff', px: 1 }}>
              Compose
            </Typography>
          </Box>

          {/* Step 4: Review */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, zIndex: 1 }}>
            <Avatar
              sx={{
                width: activeStep === 3 ? 44 : 40,
                height: activeStep === 3 ? 44 : 40,
                bgcolor: activeStep === 3 ? 'rgba(53, 37, 205, 0.08)' : '#eff4ff',
                color: activeStep === 3 ? '#3525cd' : '#777587',
                border: activeStep === 3 ? '4px solid #3525cd' : '4px solid #ffffff',
                boxShadow: activeStep === 3 ? '0 2px 6px rgba(53, 37, 205, 0.15)' : 'none',
                mt: activeStep === 3 ? -0.5 : 0,
                transition: 'all 0.3s',
              }}
            >
              <RocketLaunch sx={{ fontSize: '20px' }} />
            </Avatar>
            <Typography variant="caption" sx={{ fontWeight: 700, color: activeStep === 3 ? '#0b1c30' : '#777587', bgcolor: '#ffffff', px: 1 }}>
              Review
            </Typography>
          </Box>

        </Box>
      </Box>

      {/* Main Workspace Layout */}
      <Box sx={{ flexGrow: 1, px: 4, py: 5 }}>
        <Box sx={{ maxWidth: '1200px', mx: 'auto', display: 'grid', gridTemplateColumns: activeStep === 2 ? { xs: '1fr', lg: '1fr 440px' } : { xs: '1fr', lg: '1fr 340px' }, gap: 4, alignItems: 'start' }}>
          
          {/* STEP 1: CAMPAIGN DETAILS */}
          {activeStep === 0 && (
            <>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Paper elevation={0} sx={{ p: 4, border: '1px solid rgba(199, 196, 216, 0.3)', borderRadius: '16px', bgcolor: '#ffffff' }}>
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" sx={{ color: '#0b1c30', fontWeight: 800, fontSize: '20px' }}>
                      Identity & Subject
                    </Typography>
                    <Typography sx={{ color: '#777587', fontSize: '13px', mt: 0.5 }}>
                      Set the foundation for your marketing blast.
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                    <Box>
                      <Typography sx={{ color: '#464555', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        Internal Campaign Name
                        <Info sx={{ fontSize: '14px', color: '#777587' }} />
                      </Typography>
                      <Controller
                        name="campaignName"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            placeholder="July Newsletter"
                            error={!!errors.campaignName}
                            helperText={errors.campaignName?.message}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#f8f9ff', fontSize: '14px' } }}
                          />
                        )}
                      />
                    </Box>

                    <Box>
                      <Typography sx={{ color: '#464555', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        Email Subject Line
                        <AutoAwesome sx={{ fontSize: '14px', color: '#3525cd' }} />
                      </Typography>
                      <Controller
                        name="subjectLine"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            placeholder="🎉 New Features Are Here!"
                            error={!!errors.subjectLine}
                            helperText={errors.subjectLine?.message}
                            slotProps={{
                              input: {
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <Button
                                      variant="text"
                                      startIcon={<AutoAwesome sx={{ fontSize: '14px' }} />}
                                      onClick={handleAiBoostOpen}
                                      sx={{ textTransform: 'none', fontWeight: 700, fontSize: '11.5px', color: '#3525cd', bgcolor: 'rgba(53, 37, 205, 0.05)', borderRadius: '8px', px: 1.5, py: 0.5, '&:hover': { bgcolor: 'rgba(53, 37, 205, 0.1)' } }}
                                    >
                                      AI Boost
                                    </Button>
                                  </InputAdornment>
                                ),
                              },
                            }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#f8f9ff', fontSize: '14px' } }}
                          />
                        )}
                      />
                    </Box>

                    <Menu anchorEl={aiAnchorEl} open={Boolean(aiAnchorEl)} onClose={handleAiBoostClose} elevation={2} sx={{ '& .MuiPaper-root': { borderRadius: '12px', p: 1, minWidth: '280px' } }}>
                      {aiSuggestions.map((suggestion) => (
                        <MenuItem key={suggestion} onClick={() => selectAiSuggestion(suggestion)} sx={{ fontSize: '12.5px', whiteSpace: 'normal', borderRadius: '8px', my: 0.5 }}>
                          {suggestion}
                        </MenuItem>
                      ))}
                    </Menu>

                    <Divider sx={{ my: 1, opacity: 0.5 }} />

                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: '#f8f9ff', color: '#3525cd', width: 36, height: 36, borderRadius: '8px' }}><Tag sx={{ fontSize: '18px' }} /></Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 700, color: '#0b1c30', fontSize: '13px' }}>Tracking Tags</Typography>
                            <Typography sx={{ color: '#777587', fontSize: '11px' }}>UTM parameters and custom metadata</Typography>
                          </Box>
                        </Box>
                        <Button variant="text" endIcon={showAdvanced ? <KeyboardArrowUp /> : <KeyboardArrowDown />} onClick={() => setShowAdvanced(!showAdvanced)} sx={{ textTransform: 'none', fontWeight: 700, color: '#3525cd', fontSize: '13px' }}>
                          Configure
                        </Button>
                      </Box>
                      <Collapse in={showAdvanced} sx={{ mt: 3 }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2, p: 2, bgcolor: '#f8f9ff', borderRadius: '12px' }}>
                          <Controller name="utmSource" control={control} render={({ field }) => <TextField {...field} size="small" label="UTM Source" sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#ffffff', borderRadius: '8px' } }} />} />
                          <Controller name="utmMedium" control={control} render={({ field }) => <TextField {...field} size="small" label="UTM Medium" sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#ffffff', borderRadius: '8px' } }} />} />
                          <Controller name="utmCampaign" control={control} render={({ field }) => <TextField {...field} size="small" label="UTM Campaign" sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#ffffff', borderRadius: '8px' } }} />} />
                        </Box>
                      </Collapse>
                    </Box>
                  </Box>
                </Paper>

                <Paper elevation={0} sx={{ p: 4, borderRadius: '16px', bgcolor: '#3525cd', color: '#ffffff' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontWeight: 700 }}>Looking for template inspiration?</Typography>
                    <Button variant="contained" sx={{ bgcolor: '#ffffff', color: '#3525cd', fontWeight: 700, borderRadius: '10px' }} onClick={() => alert('Templates')}>Explore Templates</Button>
                  </Box>
                </Paper>
              </Box>

              {/* Right Column Progress Summary */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Paper elevation={0} sx={{ p: 3, border: '1px solid rgba(199, 196, 216, 0.3)', borderRadius: '16px', bgcolor: '#f8f9ff' }}>
                  <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#464555' }}>Campaign Progress</Typography>
                  <Box sx={{ width: '100%', height: 8, bgcolor: 'rgba(199, 196, 216, 0.3)', borderRadius: '99px', overflow: 'hidden', mb: 3 }}>
                    <Box sx={{ height: '100%', width: '25%', bgcolor: '#3525cd', borderRadius: '99px' }} />
                  </Box>
                  <Box sx={{ p: 2, bgcolor: '#ffffff', borderRadius: '10px', border: '1px solid rgba(199, 196, 216, 0.2)' }}>
                    <Typography sx={{ fontSize: '9px', color: '#777587', fontWeight: 700 }}>Inbox Preview</Typography>
                    <Typography sx={{ color: '#0b1c30', fontSize: '12.5px', fontWeight: 700 }} noWrap>{watchedCampaignName || 'Mailly Platform'}</Typography>
                    <Typography sx={{ color: watchedSubjectLine ? '#0b1c30' : 'rgba(70, 69, 85, 0.4)', fontSize: '12.5px' }} noWrap>{watchedSubjectLine || '🎉 New Features Are Here!'}</Typography>
                  </Box>
                </Paper>
              </Box>
            </>
          )}

          {/* STEP 2: AUDIENCE SELECTION */}
          {activeStep === 1 && (
            <>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Box>
                  <Typography variant="h5" sx={{ color: '#0b1c30', fontWeight: 800, fontSize: '20px', mb: 0.5 }}>
                    Target your audience
                  </Typography>
                  <Typography sx={{ color: '#777587', fontSize: '13.5px', mb: 3 }}>
                    Choose how you want to add recipients to this campaign. You can select from your existing database or manually import a list.
                  </Typography>

                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                    <Paper elevation={0} onClick={() => setMethod('audience')} sx={{ p: 3, borderRadius: '16px', border: '2px solid', borderColor: method === 'audience' ? '#3525cd' : 'transparent', bgcolor: '#ffffff', cursor: 'pointer' }}>
                      <Avatar sx={{ bgcolor: 'rgba(53, 37, 205, 0.08)', color: '#3525cd', mb: 2 }}><Groups /></Avatar>
                      <Typography sx={{ fontWeight: 700, fontSize: '14px' }}>Select Audience</Typography>
                    </Paper>
                    <Paper elevation={0} onClick={() => setMethod('paste')} sx={{ p: 3, borderRadius: '16px', border: '2px solid', borderColor: method === 'paste' ? '#3525cd' : 'transparent', bgcolor: '#ffffff', cursor: 'pointer' }}>
                      <Avatar sx={{ bgcolor: 'rgba(92, 95, 97, 0.08)', color: '#5c5f61', mb: 2 }}><ContentPaste /></Avatar>
                      <Typography sx={{ fontWeight: 700, fontSize: '14px' }}>Paste Emails</Typography>
                    </Paper>
                  </Box>
                </Box>

                <Paper elevation={0} sx={{ p: 4, border: '1px solid rgba(199, 196, 216, 0.3)', borderRadius: '16px', bgcolor: '#ffffff' }}>
                  {method === 'audience' && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                      <Box>
                        <Typography sx={{ color: '#464555', fontSize: '13px', fontWeight: 600, mb: 1 }}>Choose Target Segment</Typography>
                        <Select fullWidth value={targetSegment} onChange={(e) => setTargetSegment(e.target.value)} sx={{ bgcolor: '#f8f9ff', borderRadius: '12px' }}>
                          {availableAudiences.map((aud) => (
                            <MenuItem key={aud.id} value={aud.id}>{aud.name}</MenuItem>
                          ))}
                          {availableAudiences.length === 0 && (
                            <MenuItem value="none">No segments found (Create one first)</MenuItem>
                          )}
                          <MenuItem value="Developers">Developers (Mock)</MenuItem>
                          <MenuItem value="Premium Users">Premium Users (Mock)</MenuItem>
                          <MenuItem value="Active Leads">Active Leads (Mock)</MenuItem>
                        </Select>
                      </Box>
                      <Box>
                        <Typography sx={{ color: '#464555', fontSize: '13px', fontWeight: 600, mb: 1 }}>Refine with Tags</Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', p: 2, bgcolor: '#f8f9ff', borderRadius: '12px' }}>
                          {tags.map((tag) => (
                            <Chip key={tag} label={tag} onDelete={() => handleRemoveTag(tag)} sx={{ bgcolor: 'rgba(53, 37, 205, 0.08)', color: '#3525cd' }} />
                          ))}
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <TextField
                              size="small"
                              placeholder="New Tag"
                              value={tagInput}
                              onChange={(e) => setTagInput(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                              sx={{ width: 100, '& .MuiInputBase-input': { py: 0.5, fontSize: '11px' } }}
                            />
                            <Button size="small" onClick={handleAddTag} sx={{ minWidth: 0, textTransform: 'none', fontWeight: 700, fontSize: '11px' }}>
                              + Add
                            </Button>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  )}

                  {method === 'paste' && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                      <Box>
                        <Typography sx={{ color: '#464555', fontSize: '13px', fontWeight: 600, mb: 1 }}>
                          Paste Email Addresses
                        </Typography>
                        <TextField
                          multiline
                          rows={4}
                          fullWidth
                          value={pastedEmails}
                          onChange={(e) => setPastedEmails(e.target.value)}
                          placeholder="e.g. alex@example.com, sara@domain.org..."
                          sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#f8f9ff', borderRadius: '12px' } }}
                        />
                      </Box>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography sx={{ fontSize: '10.5px', fontWeight: 700, color: '#0b1c30', textTransform: 'uppercase' }}>
                            Validation Results
                          </Typography>
                          <Typography sx={{ fontSize: '11px', color: '#777587' }}>
                            Showing {emailRecords.length} results
                          </Typography>
                        </Box>

                        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid rgba(199, 196, 216, 0.2)', borderRadius: '12px' }}>
                          <Table size="small">
                            <TableHead sx={{ bgcolor: '#f8f9ff' }}>
                              <TableRow>
                                <TableCell sx={{ fontSize: '10.5px', fontWeight: 700, color: '#464555' }}>Email</TableCell>
                                <TableCell sx={{ fontSize: '10.5px', fontWeight: 700, color: '#464555' }}>Name</TableCell>
                                <TableCell sx={{ fontSize: '10.5px', fontWeight: 700, color: '#464555' }}>Status</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {emailRecords.map((r, i) => (
                                <TableRow key={i} sx={{ '&:hover': { bgcolor: '#f8f9ff' } }}>
                                  <TableCell sx={{ fontSize: '12px', color: '#0b1c30' }}>{r.email}</TableCell>
                                  <TableCell sx={{ fontSize: '12px', color: '#777587', fontStyle: r.name === 'Unknown' ? 'italic' : 'normal' }}>
                                    {r.name}
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={r.status}
                                      size="small"
                                      icon={r.status !== 'Found' ? <Warning sx={{ fontSize: '10px' }} /> : undefined}
                                      sx={{
                                        fontSize: '9px',
                                        fontWeight: 700,
                                        bgcolor: r.status === 'Found' ? 'rgba(46, 125, 50, 0.08)' : 'rgba(211, 47, 47, 0.08)',
                                        color: r.status === 'Found' ? '#2e7d32' : '#d32f2f',
                                        height: 18,
                                        borderRadius: '4px',
                                        '& .MuiChip-icon': { color: 'inherit', margin: 0, ml: 0.5 },
                                      }}
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    </Box>
                  )}
                </Paper>
              </Box>

              {/* Right Column Summary Stats */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Paper elevation={0} sx={{ p: 3, border: '1px solid rgba(199, 196, 216, 0.3)', borderRadius: '16px', bgcolor: '#ffffff' }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '14.5px', mb: 3 }}>Campaign Summary</Typography>
                  <Box sx={{ p: 2, bgcolor: '#f8f9ff', borderLeft: '4px solid #3525cd', borderRadius: '12px', mb: 2 }}>
                    <Typography sx={{ fontSize: '9.5px', color: '#777587' }}>Total Recipients</Typography>
                    <Typography sx={{ fontSize: '32px', fontWeight: 800 }}>{method === 'audience' ? '127' : matchedCount}</Typography>
                  </Box>

                  {/* Warning Chip if Duplicates are Found */}
                  {method === 'paste' && duplicateEmailsCount > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        icon={<Info sx={{ fontSize: '12px' }} />}
                        label={`Pruned ${duplicateEmailsCount} duplicate email addresses`}
                        size="small"
                        sx={{ bgcolor: 'rgba(237, 108, 2, 0.08)', color: '#ed6c02', fontWeight: 600, fontSize: '11px', width: '100%', justifyContent: 'flex-start' }}
                      />
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', gap: 1.5, p: 1.5, bgcolor: '#f8f9ff', borderRadius: '8px' }}>
                    <Lightbulb sx={{ color: '#3525cd', fontSize: '18px' }} />
                    <Typography sx={{ fontSize: '10.5px', color: '#777587', fontStyle: 'italic' }}>
                      Tip: We've automatically removed duplicate entries and unsubscribed contacts from your selection.
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            </>
          )}

          {/* STEP 3: COMPOSE CONTENT */}
          {activeStep === 2 && (
            <>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                  <Box>
                    <Typography sx={{ color: '#464555', fontSize: '13px', fontWeight: 600, mb: 1 }}>FromName</Typography>
                    <Controller name="fromName" control={control} render={({ field }) => <TextField {...field} fullWidth placeholder="e.g. Alex Rivera" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />} />
                  </Box>
                  <Box>
                    <Typography sx={{ color: '#464555', fontSize: '13px', fontWeight: 600, mb: 1 }}>From Email</Typography>
                    <Controller name="fromEmail" control={control} render={({ field }) => <TextField {...field} fullWidth placeholder="e.g. alex@mailly.com" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />} />
                  </Box>
                </Box>
                <Box>
                  <Typography sx={{ color: '#464555', fontSize: '13px', fontWeight: 600, mb: 1 }}>Subject Line</Typography>
                  <Controller name="subjectLine" control={control} render={({ field }) => <TextField {...field} fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />} />
                </Box>
                
                {/* Editor canvas and formatting toolbar */}
                <Paper elevation={0} sx={{ border: '1px solid rgba(199, 196, 216, 0.3)', borderRadius: '16px', overflow: 'hidden', bgcolor: '#ffffff', display: 'flex', flexDirection: 'column', minHeight: 520 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 2, py: 1, bgcolor: '#f8f9ff', borderBottom: '1px solid rgba(199, 196, 216, 0.2)' }}>
                    <Box sx={{ display: 'flex', gap: 0.5, borderRight: '1px solid rgba(199, 196, 216, 0.2)', pr: 1.5 }}>
                      <IconButton size="small" onClick={() => insertFormatting('**', '**')} title="Bold"><FormatBold sx={{ fontSize: '18px' }} /></IconButton>
                      <IconButton size="small" onClick={() => insertFormatting('_', '_')} title="Italic"><FormatItalic sx={{ fontSize: '18px' }} /></IconButton>
                      <IconButton size="small" onClick={() => insertFormatting('<u>', '</u>')} title="Underline"><FormatUnderlined sx={{ fontSize: '18px' }} /></IconButton>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5, borderRight: '1px solid rgba(199, 196, 216, 0.2)', pr: 1.5 }}>
                      <IconButton size="small" onClick={() => insertFormatting('\n- ')} title="Bullet List"><FormatListBulleted sx={{ fontSize: '18px' }} /></IconButton>
                      <IconButton size="small" onClick={() => insertFormatting('\n1. ')} title="Numbered List"><FormatListNumbered sx={{ fontSize: '18px' }} /></IconButton>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5, borderRight: '1px solid rgba(199, 196, 216, 0.2)', pr: 1.5 }}>
                      <IconButton size="small" onClick={() => insertFormatting('[', '](https://)')} title="Add Hyperlink"><LinkIcon sx={{ fontSize: '18px' }} /></IconButton>
                      <IconButton size="small" onClick={() => insertFormatting('![alt text](', ')')} title="Insert Image"><ImageIcon sx={{ fontSize: '18px' }} /></IconButton>
                    </Box>
                    <IconButton size="small" onClick={() => insertFormatting('## ')} title="Header"><TitleIcon sx={{ fontSize: '18px' }} /><KeyboardArrowDown sx={{ fontSize: '12px' }} /></IconButton>
                  </Box>

                  <Box sx={{ flexGrow: 1, p: 3 }}>
                    <Controller
                      name="emailBody"
                      control={control}
                      render={({ field }) => (
                        <textarea
                          {...field}
                          ref={(e) => {
                            field.ref(e);
                            textareaRef.current = e;
                          }}
                          style={{
                            width: '100%',
                            height: '340px',
                            border: 'none',
                            outline: 'none',
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '14.5px',
                            lineHeight: 1.6,
                            color: '#0b1c30',
                            resize: 'none',
                          }}
                        />
                      )}
                    />
                  </Box>
                </Paper>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" sx={{ color: '#0b1c30', fontWeight: 800 }}>Live Preview</Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, bgcolor: '#eff4ff', p: 0.5, borderRadius: '8px' }}>
                    <IconButton size="small" onClick={() => setPreviewDevice('desktop')} sx={{ bgcolor: previewDevice === 'desktop' ? '#3525cd' : 'transparent', color: previewDevice === 'desktop' ? '#ffffff' : '#464555' }}><DesktopWindows sx={{ fontSize: '16px' }} /></IconButton>
                    <IconButton size="small" onClick={() => setPreviewDevice('mobile')} sx={{ bgcolor: previewDevice === 'mobile' ? '#3525cd' : 'transparent', color: previewDevice === 'mobile' ? '#ffffff' : '#464555' }}><Smartphone sx={{ fontSize: '16px' }} /></IconButton>
                  </Box>
                </Box>
                <Paper
                  elevation={4}
                  sx={{
                    width: previewDevice === 'mobile' ? '320px' : '100%',
                    transition: 'all 0.3s ease-in-out',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    bgcolor: '#ffffff',
                    p: 3,
                    border: '1px solid rgba(199, 196, 216, 0.3)',
                  }}
                >
                  <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#777587', mb: 2 }} noWrap>
                    Subject: {watchedSubjectLine}
                  </Typography>
                  <Typography sx={{ fontSize: '13px', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                    {watchedEmailBody}
                  </Typography>
                </Paper>
              </Box>
            </>
          )}

          {/* STEP 4: REVIEW & SEND */}
          {activeStep === 3 && (
            <>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Paper elevation={0} sx={{ p: 4, border: '1px solid rgba(199, 196, 216, 0.3)', borderRadius: '16px', bgcolor: '#ffffff' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
                    <Box sx={{ width: 6, height: 32, bgcolor: '#3525cd', borderRadius: '99px' }} />
                    <Typography variant="h5" sx={{ color: '#0b1c30', fontWeight: 800, fontSize: '20px' }}>
                      Sending Options
                    </Typography>
                  </Box>

                  <Controller
                    name="sendTiming"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup {...field} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 3,
                            border: '1px solid rgba(199, 196, 216, 0.3)',
                            borderColor: watchedSendTiming === 'now' ? '#3525cd' : 'rgba(199, 196, 216, 0.3)',
                            bgcolor: watchedSendTiming === 'now' ? 'rgba(53, 37, 205, 0.03)' : '#ffffff',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                          }}
                        >
                          <FormControlLabel
                            value="now"
                            control={<Radio sx={{ color: '#c7c4d8', '&.Mui-checked': { color: '#3525cd' } }} />}
                            label={
                              <Box sx={{ ml: 1 }}>
                                <Typography sx={{ fontWeight: 700, color: '#0b1c30', fontSize: '13.5px' }}>Send Immediately</Typography>
                                <Typography sx={{ color: '#777587', fontSize: '11.5px', mt: 0.5 }}>
                                  Your campaign will be queued and sent as soon as you click schedule.
                                </Typography>
                              </Box>
                            }
                            sx={{ m: 0, alignItems: 'flex-start' }}
                          />
                          {watchedSendTiming === 'now' && <Bolt sx={{ color: '#3525cd', fontSize: '20px', mt: 0.5 }} />}
                        </Paper>

                        <Paper
                          elevation={0}
                          sx={{
                            p: 3,
                            border: '1px solid rgba(199, 196, 216, 0.3)',
                            borderColor: watchedSendTiming === 'later' ? '#3525cd' : 'rgba(199, 196, 216, 0.3)',
                            bgcolor: watchedSendTiming === 'later' ? 'rgba(53, 37, 205, 0.03)' : '#ffffff',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                          }}
                        >
                          <FormControlLabel
                            value="later"
                            control={<Radio sx={{ color: '#c7c4d8', '&.Mui-checked': { color: '#3525cd' } }} />}
                            label={
                              <Box sx={{ ml: 1 }}>
                                <Typography sx={{ fontWeight: 700, color: '#0b1c30', fontSize: '13.5px' }}>Schedule for Later</Typography>
                                <Typography sx={{ color: '#777587', fontSize: '11.5px', mt: 0.5 }}>
                                  Pick a specific date and time to engage your audience when they're most active.
                                </Typography>
                              </Box>
                            }
                            sx={{ m: 0, alignItems: 'flex-start' }}
                          />
                          {watchedSendTiming === 'later' && <Event sx={{ color: '#3525cd', fontSize: '20px', mt: 0.5 }} />}
                        </Paper>
                      </RadioGroup>
                    )}
                  />

                  {/* Collapsible schedule picker */}
                  <Collapse in={watchedSendTiming === 'later'} sx={{ mt: 3 }}>
                    <Box sx={{ p: 3, bgcolor: '#f8f9ff', borderRadius: '12px', border: '1px solid rgba(199, 196, 216, 0.2)', display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                        <Box>
                          <Typography sx={{ fontSize: '9.5px', color: '#777587', fontWeight: 700, textTransform: 'uppercase', mb: 1 }}>Send Date</Typography>
                          <Controller
                            name="sendDate"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                type="date"
                                fullWidth
                                slotProps={{
                                  htmlInput: {
                                    min: new Date().toISOString().split('T')[0], // Block scheduling in the past
                                  },
                                  input: {
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <CalendarToday sx={{ fontSize: '18px', color: '#777587' }} />
                                      </InputAdornment>
                                    ),
                                  },
                                }}
                                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#ffffff', borderRadius: '8px' } }}
                              />
                            )}
                          />
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: '9.5px', color: '#777587', fontWeight: 700, textTransform: 'uppercase', mb: 1 }}>Send Time</Typography>
                          <Controller
                            name="sendTime"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                type="time"
                                fullWidth
                                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#ffffff', borderRadius: '8px' } }}
                              />
                            )}
                          />
                        </Box>
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: '9.5px', color: '#777587', fontWeight: 700, textTransform: 'uppercase', mb: 1 }}>Timezone</Typography>
                        <Controller
                          name="timezone"
                          control={control}
                          render={({ field }) => (
                            <Select {...field} fullWidth sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}>
                              <MenuItem value="UTC">UTC (Coordinated Universal Time)</MenuItem>
                              <MenuItem value="America/New_York">America/New_York (EDT)</MenuItem>
                              <MenuItem value="Europe/London">Europe/London (BST)</MenuItem>
                              <MenuItem value="Asia/Tokyo">Asia/Tokyo (JST)</MenuItem>
                            </Select>
                          )}
                        />
                      </Box>
                    </Box>
                  </Collapse>
                </Paper>
              </Box>

              {/* Right Column Summary Review */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Paper elevation={0} sx={{ border: '1px solid rgba(199, 196, 216, 0.3)', borderRadius: '16px', overflow: 'hidden', bgcolor: '#ffffff' }}>
                  <Box sx={{ px: 3, py: 2.5, bgcolor: '#3525cd', color: '#ffffff' }}>
                    <Typography sx={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', opacity: 0.8 }}>Preview Summary</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '16.5px' }}>Campaign Review</Typography>
                  </Box>

                  <Box sx={{ p: 3.5, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'rgba(53, 37, 205, 0.08)', color: '#3525cd', width: 26, height: 26 }}><Check sx={{ fontSize: '15px' }} /></Avatar>
                      <Box>
                        <Typography sx={{ fontSize: '9px', color: '#777587', fontWeight: 700 }}>Campaign Name</Typography>
                        <Typography sx={{ fontSize: '13.5px', fontWeight: 700 }}>{watchedCampaignName}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'rgba(53, 37, 205, 0.08)', color: '#3525cd', width: 26, height: 26 }}><Check sx={{ fontSize: '15px' }} /></Avatar>
                      <Box>
                        <Typography sx={{ fontSize: '9px', color: '#777587', fontWeight: 700 }}>Subject Line</Typography>
                        <Typography sx={{ fontSize: '13px', fontStyle: 'italic' }}>"{watchedSubjectLine}"</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'rgba(53, 37, 205, 0.08)', color: '#3525cd', width: 26, height: 26 }}><Check sx={{ fontSize: '15px' }} /></Avatar>
                      <Box>
                        <Typography sx={{ fontSize: '9px', color: '#777587', fontWeight: 700 }}>Audience</Typography>
                        <Typography sx={{ fontSize: '13px' }}>
                          {method === 'audience' ? `${targetSegment} Segment (127)` : `Pasted emails (${matchedCount})`}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'rgba(53, 37, 205, 0.08)', color: '#3525cd', width: 26, height: 26 }}><Check sx={{ fontSize: '15px' }} /></Avatar>
                      <Box>
                        <Typography sx={{ fontSize: '9px', color: '#777587', fontWeight: 700 }}>Delivery Time</Typography>
                        <Typography sx={{ fontSize: '13px' }}>
                          {watchedSendTiming === 'now' ? 'Immediately upon activation' : `Scheduled for ${watchedSendDate} at ${watchedSendTime}`}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              </Box>
            </>
          )}

        </Box>
      </Box>

      {/* Global Sticky Navigation Footer Action Bar */}
      <Paper
        elevation={4}
        sx={{
          position: 'sticky',
          bottom: 0,
          left: 0,
          right: 0,
          mt: 'auto',
          height: 80,
          px: 4,
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(199, 196, 216, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 40,
        }}
      >
        {activeStep === 0 ? (
          <Button
            variant="text"
            startIcon={<Close sx={{ fontSize: '18px' }} />}
            onClick={handleDiscard}
            sx={{ textTransform: 'none', color: '#5c5f61', fontWeight: 600, fontSize: '13px' }}
          >
            Discard
          </Button>
        ) : (
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack sx={{ fontSize: '18px' }} />}
              onClick={handlePrevStep}
              sx={{ textTransform: 'none', color: '#464555', borderColor: '#c7c4d8', borderRadius: '10px', fontWeight: 600, fontSize: '13px', px: 3, py: 1 }}
            >
              Previous Step
            </Button>
            {activeStep === 2 && (
              <Button
                variant="outlined"
                startIcon={<Mail sx={{ fontSize: '18px' }} />}
                onClick={handleSendTest}
                sx={{ textTransform: 'none', color: '#464555', borderColor: '#c7c4d8', borderRadius: '10px', fontWeight: 600, fontSize: '13px', px: 3, py: 1 }}
              >
                Send Test Email
              </Button>
            )}
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Typography variant="caption" sx={{ color: '#777587', fontStyle: 'italic', display: { xs: 'none', sm: 'block' } }}>
            Changes are saved automatically
          </Typography>
          <Button
            variant="text"
            onClick={handleSaveDraft}
            sx={{ textTransform: 'none', color: '#5c5f61', fontWeight: 600, fontSize: '13px' }}
          >
            Save Draft
          </Button>
          <Button
            variant="contained"
            disabled={(activeStep === 0 && !isStep1Valid) || (activeStep === 2 && !isStep3Valid) || isSubmittingCampaign}
            onClick={handleNextStep}
            endIcon={!isSubmittingCampaign ? <ArrowForward sx={{ fontSize: '18px' }} /> : undefined}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              px: 3.5,
              borderRadius: '10px',
              fontSize: '13px',
              bgcolor: '#3525cd',
              boxShadow: '0 4px 10px rgba(53, 37, 205, 0.2)',
              '&:hover': { bgcolor: '#4f46e5' },
            }}
          >
            {isSubmittingCampaign ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} sx={{ color: '#ffffff' }} />
                <span>Processing...</span>
              </Box>
            ) : activeStep === 0 ? (
              'Continue to Recipients'
            ) : activeStep === 1 ? (
              'Continue to Compose'
            ) : activeStep === 2 ? (
              'Next: Review & Schedule'
            ) : watchedSendTiming === 'now' ? (
              'Launch Campaign Now'
            ) : (
              'Schedule Campaign'
            )}
          </Button>
        </Box>
      </Paper>

    </Box>
  );
}
