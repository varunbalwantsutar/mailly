'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../../utils/api';
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
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Search,
  FilterList,
  Delete,
  AddCircle,
  Groups,
  Info,
  ArrowBack,
  PersonAdd,
  HighlightOff,
  Lightbulb,
} from '@mui/icons-material';

interface RuleCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
}

const INITIAL_RULES: RuleCondition[] = [
  { id: '1', field: 'City', operator: 'equals', value: 'Mumbai' },
  { id: '2', field: 'Tag', operator: 'contains', value: 'vip' },
];

export default function CreateAudiencePage() {
  const router = useRouter();

  // Form States
  const [audienceName, setAudienceName] = useState('');
  const [logicalOperator, setLogicalOperator] = useState<'AND' | 'OR'>('AND');
  const [rules, setRules] = useState<RuleCondition[]>(INITIAL_RULES);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);

  // Load contacts for preview evaluation
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await api.get('/contacts');
        setContacts(res.data.contacts);
      } catch (err) {
        console.error('Failed to load contacts for preview', err);
      }
    };
    fetchContacts();
  }, []);

  // Load from local storage draft
  useEffect(() => {
    const saved = localStorage.getItem('mailly_audience_draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.audienceName) setAudienceName(parsed.audienceName);
        if (parsed.logicalOperator) setLogicalOperator(parsed.logicalOperator);
        if (parsed.rules) setRules(parsed.rules);
      } catch (e) {
        console.error('Failed to parse audience draft', e);
      }
    }
  }, []);

  // Save to local storage draft
  useEffect(() => {
    localStorage.setItem(
      'mailly_audience_draft',
      JSON.stringify({ audienceName, logicalOperator, rules })
    );
  }, [audienceName, logicalOperator, rules]);

  const clearDraft = () => {
    localStorage.removeItem('mailly_audience_draft');
  };

  const handleRulesChange = () => {
    setIsRefreshing(true);
    const timer = setTimeout(() => {
      setIsRefreshing(false);
    }, 200);
    return () => clearTimeout(timer);
  };

  const matchContactWithRules = (contact: any, rulesList: RuleCondition[], operator: 'AND' | 'OR'): boolean => {
    if (!rulesList || rulesList.length === 0) return true;

    const matches = rulesList.map((rule) => {
      const { field, operator: op, value } = rule;
      if (!field || !op) return true;

      let contactVal: any = undefined;
      const lowerField = field.toLowerCase();

      if (lowerField === 'name') contactVal = contact.name;
      else if (lowerField === 'email') contactVal = contact.email;
      else if (lowerField === 'phone') contactVal = contact.phone;
      else if (lowerField === 'city') contactVal = contact.city;
      else if (lowerField === 'company') contactVal = contact.company;
      else if (lowerField === 'tags' || lowerField === 'tag') contactVal = contact.tags;
      else {
        contactVal = contact.customFields?.[field] ?? contact.customFields?.[lowerField];
      }

      if (contactVal === undefined || contactVal === null) {
        return false;
      }

      const valStr = String(value).toLowerCase();

      if (Array.isArray(contactVal)) {
        const arrLower = contactVal.map(t => String(t).toLowerCase());
        if (op === 'equals') return arrLower.includes(valStr);
        if (op === 'contains') return arrLower.some(t => t.includes(valStr));
        if (op === 'not equals' || op === 'not_equals') return !arrLower.includes(valStr);
        return false;
      }

      const contactValStr = String(contactVal).toLowerCase();

      if (op === 'equals') return contactValStr === valStr;
      if (op === 'contains') return contactValStr.includes(valStr);
      if (op === 'starts with' || op === 'starts_with') return contactValStr.startsWith(valStr);
      if (op === 'ends with' || op === 'ends_with') return contactValStr.endsWith(valStr);
      if (op === 'greater than' || op === 'greater_than') return Number(contactVal) > Number(value);
      if (op === 'less than' || op === 'less_than') return Number(contactVal) < Number(value);

      return false;
    });

    if (operator === 'OR') {
      return matches.some(m => m === true);
    } else {
      return matches.every(m => m === true);
    }
  };

  const matchedContacts = contacts.filter(c => matchContactWithRules(c, rules, logicalOperator));
  const estimatedReach = matchedContacts.length;

  const percentOfTotal = contacts.length > 0 ? Math.round((estimatedReach / contacts.length) * 100) : 0;
  const activeCount = matchedContacts.filter(c => c.status === 'ACTIVE').length;
  const uniqueTagsCount = Array.from(new Set(matchedContacts.flatMap(c => c.tags || []))).length;

  const handleAddRule = () => {
    const newId = rules.length > 0 ? (Math.max(...rules.map((r) => parseInt(r.id))) + 1).toString() : '1';
    setRules([...rules, { id: newId, field: 'Tag', operator: 'equals', value: 'New Value' }]);
    handleRulesChange();
  };

  const handleDeleteRule = (id: string) => {
    setRules(rules.filter((r) => r.id !== id));
    handleRulesChange();
  };

  const handleUpdateRule = (id: string, key: keyof RuleCondition, val: string) => {
    setRules(
      rules.map((r) => (r.id === id ? { ...r, [key]: val } : r))
    );
    handleRulesChange();
  };

  const handleSave = async () => {
    if (!audienceName.trim()) {
      alert('Please specify an audience name first.');
      return;
    }
    const hasEmptyRuleValue = rules.some((r) => !r.value.trim());
    if (hasEmptyRuleValue) {
      alert('Please provide a valid value for all rule conditions.');
      return;
    }

    try {
      await api.post('/audiences', {
        name: audienceName,
        type: 'Dynamic Segment',
        logicalOperator,
        rules: rules.map((r) => ({
          field: r.field,
          operator: r.operator,
          value: r.value,
        })),
      });

      clearDraft();
      router.push('/audiences');
    } catch (err) {
      console.error(err);
      alert('Error creating segment');
    }
  };

  const handleDiscard = () => {
    if (window.confirm('Discard audience segment progress? Unsaved segment rules will be lost.')) {
      clearDraft();
      router.push('/audiences');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 64px)' }}>

      {/* Content Header Area */}
      <Box sx={{ px: 4, py: 4, borderBottom: '1px solid rgba(199, 196, 216, 0.2)', bgcolor: '#ffffff' }}>
        <Box sx={{ maxW: '1200px', mx: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#3525cd', fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', mb: 0.5 }}>
              <PersonAdd sx={{ fontSize: '16px' }} />
              Segmentation Engine
            </Box>
            <Typography variant="h4" sx={{ color: '#0b1c30', fontWeight: 800, tracking: '-0.02em', fontSize: '26px' }}>
              Create New Audience
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Main Split Workspace layout */}
      <Box sx={{ flexGrow: 1, px: 4, py: 4 }}>
        <Box sx={{ maxWidth: '1200px', mx: 'auto', display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 380px' }, gap: 4, alignItems: 'start' }}>

          {/* Left Panel: Filter builder */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>

            {/* Identity Card */}
            <Paper elevation={0} sx={{ p: 3, border: '1px solid rgba(199, 196, 216, 0.3)', borderRadius: '16px', bgcolor: '#ffffff' }}>
              <Typography variant="subtitle2" sx={{ color: '#0b1c30', fontWeight: 700, fontSize: '13.5px', mb: 1 }}>
                Audience Identity
              </Typography>
              <TextField
                fullWidth
                size="medium"
                placeholder="e.g. High-Value Mumbai Professionals"
                value={audienceName}
                onChange={(e) => setAudienceName(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: '#f8f9ff',
                    fontSize: '15px',
                    fontWeight: 600,
                  },
                }}
              />
              <Typography sx={{ color: '#777587', fontSize: '11px', mt: 1.5 }}>
                Give your segment a descriptive name that helps your team understand the targeting logic at a glance.
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2, bgcolor: 'rgba(53, 37, 205, 0.03)', borderRadius: '12px', border: '1px solid rgba(53, 37, 205, 0.08)', mt: 3.5 }}>
                <Info sx={{ color: '#3525cd', fontSize: '18px' }} />
                <Typography sx={{ fontSize: '12px', color: '#464555', fontWeight: 500 }}>
                  Audience data is dynamic and will update automatically as new contacts meet these criteria.
                </Typography>
              </Box>
            </Paper>

            {/* Segmentation Rules Card */}
            <Paper elevation={0} sx={{ p: 3, border: '1px solid rgba(199, 196, 216, 0.3)', borderRadius: '16px', bgcolor: '#ffffff' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ bgcolor: 'rgba(53, 37, 205, 0.08)', color: '#3525cd', width: 36, height: 36, borderRadius: '8px' }}>
                    <FilterList sx={{ fontSize: '18px' }} />
                  </Avatar>
                  <Typography variant="subtitle1" sx={{ color: '#0b1c30', fontWeight: 800 }}>
                    Segmentation Rules
                  </Typography>
                </Box>

                {/* Operator Selector AND / OR */}
                <Box sx={{ display: 'flex', gap: 0.5, bgcolor: '#f8f9ff', p: 0.5, borderRadius: '8px', border: '1px solid rgba(199, 196, 216, 0.2)' }}>
                  {(['AND', 'OR'] as const).map((op) => (
                    <Button
                      key={op}
                      size="small"
                      onClick={() => {
                        setLogicalOperator(op);
                        handleRulesChange();
                      }}
                      sx={{
                        textTransform: 'none',
                        fontSize: '11px',
                        fontWeight: 700,
                        px: 1.5,
                        py: 0.5,
                        borderRadius: '6px',
                        bgcolor: logicalOperator === op ? '#ffffff' : 'transparent',
                        color: logicalOperator === op ? '#3525cd' : '#5c5f61',
                        boxShadow: logicalOperator === op ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                      }}
                    >
                      {op}
                    </Button>
                  ))}
                </Box>
              </Box>

              {/* Active Conditions List */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {rules.length === 0 ? (
                  <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5, border: '2px dashed rgba(199, 196, 216, 0.3)', borderRadius: '12px', bgcolor: '#f8f9ff' }}>
                    <FilterList sx={{ fontSize: 36, color: '#c7c4d8' }} />
                    <Typography sx={{ color: '#464555', fontWeight: 600, fontSize: '13px' }}>No rules specified</Typography>
                    <Typography sx={{ color: '#777587', fontSize: '11.5px', maxWidth: 240, textAlign: 'center' }}>
                      Add segmentation filter conditions to define your audience reach.
                    </Typography>
                  </Box>
                ) : (
                  rules.map((rule, idx) => (
                    <React.Fragment key={rule.id}>
                      {idx > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 1, position: 'relative' }}>
                          <Box sx={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', bgcolor: 'rgba(199, 196, 216, 0.2)', zIndex: 0 }} />
                          <Chip
                            label={logicalOperator}
                            size="small"
                            sx={{ bgcolor: '#ffffff', border: '1px solid rgba(53, 37, 205, 0.15)', color: '#3525cd', fontWeight: 800, fontSize: '10px', height: 18, zIndex: 1 }}
                          />
                        </Box>
                      )}

                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 2, bgcolor: '#f8f9ff', border: '1px solid rgba(199, 196, 216, 0.15)', borderRadius: '12px' }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.2fr', gap: 2, flexGrow: 1 }}>

                          {/* Field input */}
                          <Select
                            size="small"
                            value={rule.field}
                            onChange={(e) => handleUpdateRule(rule.id, 'field', e.target.value)}
                            sx={{ height: 40, bgcolor: '#ffffff', borderRadius: '8px', fontSize: '12.5px', fontWeight: 600 }}
                          >
                            <MenuItem value="Name" sx={{ fontSize: '12.5px' }}>Name</MenuItem>
                            <MenuItem value="Email" sx={{ fontSize: '12.5px' }}>Email</MenuItem>
                            <MenuItem value="Phone" sx={{ fontSize: '12.5px' }}>Phone</MenuItem>
                            <MenuItem value="City" sx={{ fontSize: '12.5px' }}>City</MenuItem>
                            <MenuItem value="Company" sx={{ fontSize: '12.5px' }}>Company</MenuItem>
                            <MenuItem value="Tag" sx={{ fontSize: '12.5px' }}>Tag</MenuItem>
                          </Select>

                          {/* Operator Input */}
                          <Select
                            size="small"
                            value={rule.operator}
                            onChange={(e) => handleUpdateRule(rule.id, 'operator', e.target.value)}
                            sx={{ height: 40, bgcolor: '#ffffff', borderRadius: '8px', fontSize: '12.5px', fontWeight: 600 }}
                          >
                            <MenuItem value="equals" sx={{ fontSize: '12.5px' }}>equals</MenuItem>
                            <MenuItem value="contains" sx={{ fontSize: '12.5px' }}>contains</MenuItem>
                            <MenuItem value="starts with" sx={{ fontSize: '12.5px' }}>starts with</MenuItem>
                            <MenuItem value="ends with" sx={{ fontSize: '12.5px' }}>ends with</MenuItem>
                            <MenuItem value="greater than" sx={{ fontSize: '12.5px' }}>greater than</MenuItem>
                            <MenuItem value="less than" sx={{ fontSize: '12.5px' }}>less than</MenuItem>
                          </Select>

                          {/* Value Field */}
                          <TextField
                            size="small"
                            value={rule.value}
                            placeholder="Type value..."
                            onChange={(e) => handleUpdateRule(rule.id, 'value', e.target.value)}
                            error={!rule.value.trim()}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                height: 40,
                                borderRadius: '8px',
                                bgcolor: '#ffffff',
                                fontSize: '12.5px',
                              },
                            }}
                          />

                        </Box>

                        {/* Delete rule button */}
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteRule(rule.id)}
                          sx={{
                            width: 40,
                            height: 40,
                            bgcolor: 'rgba(186, 26, 26, 0.05)',
                            borderRadius: '8px',
                            '&:hover': { bgcolor: 'rgba(186, 26, 26, 0.1)' }
                          }}
                        >
                          <Delete sx={{ fontSize: '18px' }} />
                        </IconButton>
                      </Box>
                    </React.Fragment>
                  ))
                )}

                {/* Add new rule condition button */}
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AddCircle sx={{ fontSize: '18px' }} />}
                  onClick={handleAddRule}
                  sx={{
                    borderStyle: 'dashed',
                    borderColor: 'rgba(199, 196, 216, 0.6)',
                    color: '#464555',
                    borderRadius: '12px',
                    py: 1.8,
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: '#3525cd',
                      bgcolor: 'rgba(53, 37, 205, 0.02)',
                      color: '#3525cd',
                    },
                  }}
                >
                  Add new rule condition
                </Button>
              </Box>
            </Paper>

          </Box>

          {/* Right Panel: Sticky Live Preview */}
          <Box sx={{ position: { lg: 'sticky' }, top: 80 }}>
            <Paper
              elevation={0}
              sx={{
                border: '1px solid rgba(199, 196, 216, 0.3)',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)',
                bgcolor: '#ffffff',
              }}
            >
              {/* Estimated reach header */}
              <Box sx={{ p: 3, background: 'linear-gradient(135deg, #3525cd 0%, #4f46e5 100%)', color: '#ffffff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography sx={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.8 }}>
                      Estimated Reach
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mt: 1 }}>
                      <Typography variant="h3" sx={{ fontWeight: 800, fontSize: '32px', letterSpacing: '-0.02em' }}>
                        {estimatedReach.toLocaleString()}
                      </Typography>
                      <Typography sx={{ fontSize: '13px', opacity: 0.9 }}>Contacts</Typography>
                    </Box>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 44, height: 44 }}>
                    <Groups sx={{ fontSize: '24px', color: '#ffffff' }} />
                  </Avatar>
                </Box>

                <Divider sx={{ my: 2.5, borderColor: 'rgba(255,255,255,0.1)' }} />

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, textAlign: 'center' }}>
                  <Box>
                    <Typography sx={{ fontSize: '10px', opacity: 0.7 }}>% of Database</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{percentOfTotal}%</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '10px', opacity: 0.7 }}>Active Contacts</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{activeCount}</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '10px', opacity: 0.7 }}>Unique Tags</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{uniqueTagsCount}</Typography>
                  </Box>
                </Box>
              </Box>

              {/* Sample Matching Contacts list */}
              <Box>
                <Box sx={{ px: 3, py: 2, borderBottom: '1px solid rgba(199, 196, 216, 0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f8f9ff' }}>
                  <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#464555', letterSpacing: '0.05em' }}>
                    LIVE SAMPLE
                  </Typography>
                  <Typography sx={{ fontSize: '11px', color: '#3525cd', fontWeight: 600, animation: isRefreshing ? 'pulse 1s infinite' : 'none' }}>
                    {isRefreshing ? 'Refreshing...' : 'Synced'}
                  </Typography>
                </Box>

                {/* Live sample contact list with opacity fading during updates */}
                <Box sx={{ display: 'flex', flexDirection: 'column', opacity: isRefreshing ? 0.6 : 1, transition: 'opacity 0.2s ease-in-out' }}>
                  {matchedContacts.slice(0, 5).map((c) => {
                    const initials = c.name
                      ? c.name
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')
                        .toUpperCase()
                        .substring(0, 2)
                      : '??';
                    return (
                      <Box
                        key={c.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          px: 3,
                          py: 1.5,
                          borderBottom: '1px solid rgba(199, 196, 216, 0.1)',
                          '&:hover': { bgcolor: '#f8f9ff' },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          {c.avatarUrl ? (
                            <Avatar src={c.avatarUrl} sx={{ width: 32, height: 32 }} />
                          ) : (
                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#eff4ff', color: '#3525cd', fontSize: '11px', fontWeight: 700 }}>
                              {initials}
                            </Avatar>
                          )}
                          <Box sx={{ overflow: 'hidden' }}>
                            <Typography sx={{ color: '#0b1c30', fontSize: '12.5px', fontWeight: 600 }}>{c.name}</Typography>
                            <Typography sx={{ color: '#777587', fontSize: '10.5px' }} noWrap>{c.email}</Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {c.tags && c.tags.slice(0, 1).map((t: string) => (
                            <Chip
                              key={t}
                              label={t}
                              size="small"
                              sx={{
                                bgcolor: 'rgba(53, 37, 205, 0.05)',
                                color: '#3525cd',
                                fontWeight: 700,
                                fontSize: '8.5px',
                                height: 18,
                              }}
                            />
                          ))}
                          {(!c.tags || c.tags.length === 0) && c.city && (
                            <Chip
                              label={c.city}
                              size="small"
                              sx={{
                                bgcolor: 'rgba(92, 95, 97, 0.05)',
                                color: '#5c5f61',
                                fontWeight: 700,
                                fontSize: '8.5px',
                                height: 18,
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                    );
                  })}
                  {matchedContacts.length === 0 && (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                      <Typography sx={{ fontSize: '12px', color: '#777587', fontStyle: 'italic' }}>
                        No matching contacts found.
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Box sx={{ p: 2, textAlign: 'center', borderTop: '1px solid rgba(199, 196, 216, 0.1)' }}>
                  <Button
                    size="small"
                    sx={{ textTransform: 'none', color: '#3525cd', fontWeight: 700, fontSize: '12.5px' }}
                    onClick={() => alert('Viewing all contacts')}
                  >
                    View All Matching Contacts
                  </Button>
                </Box>
              </Box>

            </Paper>
          </Box>

        </Box>
        {/* Action Buttons at the Bottom (Inline, not fixed/sticky) */}
        <Box sx={{ maxWidth: '1200px', mx: 'auto', display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4, pt: 3, borderTop: '1px solid rgba(199, 196, 216, 0.2)' }}>
          <Button
            variant="text"
            onClick={handleDiscard}
            sx={{ textTransform: 'none', color: '#5c5f61', fontWeight: 600, fontSize: '13px' }}
          >
            Discard Changes
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{ textTransform: 'none', fontWeight: 700, px: 4, py: 1.2, borderRadius: '8px', fontSize: '13px', bgcolor: '#3525cd', '&:hover': { bgcolor: '#4f46e5' } }}
          >
            Save & Launch Audience
          </Button>
        </Box>
      </Box>



    </Box>
  );
}
