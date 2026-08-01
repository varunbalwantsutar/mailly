'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff, Security, Lock } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import api from '../../utils/api';

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const resetStatus = () => {
    setError(null);
    setSuccess(null);
  };

  const handleToggleMode = () => {
    setIsRegister((prev) => !prev);
    resetStatus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (isRegister) {
      // Register logic
      if (!email || !password || !fullName) {
        setError('Full Name, Email, and Password are required.');
        setLoading(false);
        return;
      }

      try {
        const response = await api.post('/auth/register', {
          email,
          password,
          name: fullName,
          companyName,
        });

        const data = response.data;

        setSuccess('Account created successfully! Redirecting...');
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);

        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } catch (err: any) {
        setError(err.message || 'An error occurred during account creation.');
      } finally {
        setLoading(false);
      }
    } else {
      // Login logic
      if (!email || !password) {
        setError('Please fill in all fields.');
        setLoading(false);
        return;
      }

      try {
        const response = await api.post('/auth/login', { email, password });
        const data = response.data;

        setSuccess('Login successful! Redirecting...');
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);

        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } catch (err: any) {
        setError(err.message || 'An error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleSignup = () => {
    alert('Google OAuth Integration Placeholder');
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', width: '100%', m: 0, p: 0, flexDirection: { xs: 'column', md: 'row' } }}>
      {/* Left Column: Marketing / Visual (Desktop Only) */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flex: { md: 6, lg: 7 },
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #4f46e5 0%, #3525cd 50%, #818cf8 100%)',
          position: 'relative',
          overflow: 'hidden',
          p: 4,
        }}
      >
        {/* Decorative Background Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0.15,
            pointerEvents: 'none',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '-10%',
              left: '-10%',
              width: '600px',
              height: '600px',
              backgroundColor: '#ffffff',
              borderRadius: '50%',
              filter: 'blur(120px)',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: '-20%',
              right: '-10%',
              width: '500px',
              height: '500px',
              backgroundColor: '#ffdbcc',
              borderRadius: '50%',
              filter: 'blur(100px)',
            }}
          />
        </Box>

        {/* Marketing Content */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            maxWidth: '480px',
          }}
        >
          {/* Mockup Image */}
          <Box
            sx={{
              mb: 2,
              transition: 'transform 0.5s ease-in-out',
              '&:hover': {
                transform: 'scale(1.03)',
              },
            }}
          >
            <Box
              component="img"
              alt="Abstract email marketing visualization"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAazoOq3XymbaQo5E5bkfX2ZIP3EedmTk0wHr3WrifmS4Ao1oZGtyw68hm7jaD_8NlRpTrnWbNal1UHuKC4NM4ENgKu8Xb0G1x_c5vV4E3aE4aT_YymODXUAD940Q9YYKPt73GD-I6llUeY4JBfXlWm-pHV4U81jOvWydNHIpWxrt7o3hXVUoaTdYyLzjwSYgCC2as-d5Evp3mZUeFL_uS9zBzUyHTbnth1YShsT2MBVZWDKiV7Obvs"
              sx={{
                width: '100%',
                maxWidth: '280px',
                height: 'auto',
                filter: 'drop-shadow(0px 15px 25px rgba(0, 0, 0, 0.2))',
                borderRadius: '16px',
              }}
            />
          </Box>

          <Typography variant="h2" sx={{ color: '#ffffff', mb: 1, fontSize: '24px', fontWeight: 700, lineHeight: 1.3 }}>
            Reach your customers{' '}
            <Box component="span" sx={{ color: '#ffdbcc' }}>
              everywhere.
            </Box>
          </Typography>

          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.85)', mb: 2.5, maxWidth: '380px', fontSize: '13px', lineHeight: 1.5 }}>
            The world's most powerful platform for high-performance marketing workflows and hyper-targeted communication.
          </Typography>

          {/* Metric Badges */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                px: 2.5,
                py: 1,
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontWeight: 600, display: 'block', mb: 0.2, letterSpacing: '0.1em', fontSize: '9px' }}>
                DELIVERY RATE
              </Typography>
              <Typography variant="h3" sx={{ color: '#ffffff', fontWeight: 700, fontSize: '18px' }}>
                99.9%
              </Typography>
            </Box>

            <Box
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                px: 2.5,
                py: 1,
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontWeight: 600, display: 'block', mb: 0.2, letterSpacing: '0.1em', fontSize: '9px' }}>
                ACTIVE USERS
              </Typography>
              <Typography variant="h3" sx={{ color: '#ffffff', fontWeight: 700, fontSize: '18px' }}>
                12.5k
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Right Column: Login / Register Form */}
      <Box
        sx={{
          display: 'flex',
          flex: { xs: 1, md: 6, lg: 5 },
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#f8f9ff',
          p: { xs: 2.5, md: 4 },
          position: 'relative',
        }}
      >
        {/* Subtle grid pattern background (only when registering for texture match, or keep globally) */}
        {isRegister && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'radial-gradient(#e2dfff 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              opacity: 0.3,
              pointerEvents: 'none',
            }}
          />
        )}

        <Box sx={{ width: '100%', maxWidth: '350px', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
          {/* Logo */}
          <Box sx={{ mb: 2 }}>
            <Box
              component="img"
              alt="Mailly Logo"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5S77mrEmXCaJCuNSlURhCLxS-yTv0c6GoLsXE9UDl3mwICZw_b0wCg5qcRy4dDYXZzEcJqQgzzLPe42yqlIXF_x-ZkXDLEG8NmQuVXFal-WJ9yb04uWX7p-ne4kvYWt4bwePabQMIyVBHj3jnoYentbxIEZ11VYC_wWub-Yuv8KyOhJXhixg4aeAUXkM3bFAYh5oo48kC0nf_dgqQf5TI8TfDAsetTGfGYIyqsnmx9KnsHCpvxy8b"
              sx={{
                height: 38,
                width: 'auto',
                objectFit: 'contain',
                borderRadius: isRegister ? '8px' : 0,
                boxShadow: isRegister ? '0 2px 8px rgba(0, 0, 0, 0.05)' : 'none',
              }}
            />
          </Box>

          {/* Form Card */}
          <Paper
            elevation={0}
            sx={{
              width: '100%',
              px: 3,
              py: isRegister ? 2.2 : 2.5,
              borderRadius: '12px',
              border: '1px solid rgba(199, 196, 216, 0.3)',
              boxShadow: '0 4px 20px rgba(79, 70, 229, 0.03)',
              bgcolor: '#ffffff',
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="h5" sx={{ color: '#0b1c30', fontWeight: 700, mb: 0.3, fontSize: '20px' }}>
                {isRegister ? 'Create your account' : 'Welcome Back'}
              </Typography>
              <Typography sx={{ color: '#464555', fontSize: '12.5px' }}>
                {isRegister
                  ? 'Start your 14-day free trial. No credit card required.'
                  : 'Sign in to manage your contacts and email campaigns.'}
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 1.5, py: 0.2, px: 1.5, borderRadius: '8px', fontSize: '12px' }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 1.5, py: 0.2, px: 1.5, borderRadius: '8px', fontSize: '12px' }}>
                {success}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: isRegister ? 1.2 : 1.5 }}>
              {isRegister && (
                /* Row: Full Name & Company Name */
                <Box sx={{ display: 'flex', gap: 1.5, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ color: '#464555', mb: 0.3, ml: 0.5, fontWeight: 500, fontSize: '11.5px' }}>
                      Full Name
                    </Typography>
                    <TextField
                      fullWidth
                      id="full-name"
                      placeholder="Alex Rivera"
                      variant="outlined"
                      size="small"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={loading}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ color: '#464555', mb: 0.3, ml: 0.5, fontWeight: 500, fontSize: '11.5px' }}>
                      Company Name
                    </Typography>
                    <TextField
                      fullWidth
                      id="company-name"
                      placeholder="Mailly Inc."
                      variant="outlined"
                      size="small"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      disabled={loading}
                    />
                  </Box>
                </Box>
              )}

              {/* Email Address */}
              <Box>
                <Typography sx={{ color: '#464555', mb: isRegister ? 0.3 : 0.4, ml: 0.5, fontWeight: 500, fontSize: isRegister ? '11.5px' : '12px' }}>
                  Email Address
                </Typography>
                <TextField
                  fullWidth
                  id="email"
                  type="email"
                  placeholder={isRegister ? 'alex@company.com' : 'name@company.com'}
                  variant="outlined"
                  size="small"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </Box>

              {/* Password */}
              <Box>
                <Typography sx={{ color: '#464555', mb: isRegister ? 0.3 : 0.4, ml: 0.5, fontWeight: 500, fontSize: isRegister ? '11.5px' : '12px' }}>
                  Password
                </Typography>
                <TextField
                  fullWidth
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  variant="outlined"
                  size="small"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={handleTogglePassword} edge="end" size="small">
                            {showPassword ? <VisibilityOff sx={{ fontSize: '18px' }} /> : <Visibility sx={{ fontSize: '18px' }} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                {isRegister ? (
                  <Typography sx={{ color: '#777587', fontSize: '10.5px', mt: 0.4, ml: 0.5, display: 'flex', alignItems: 'center', gap: 0.3 }}>
                    <Lock sx={{ fontSize: '12px' }} /> Must be at least 8 characters long
                  </Typography>
                ) : null}
              </Box>

              {!isRegister && (
                /* Options (Remember me / Forgot password) */
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        color="primary"
                        size="small"
                        sx={{ p: 0.5 }}
                      />
                    }
                    label={
                      <Typography sx={{ color: '#464555', userSelect: 'none', fontSize: '12px' }}>
                        Remember me
                      </Typography>
                    }
                  />
                  <Link
                    href="#"
                    underline="hover"
                    sx={{
                      color: '#3525cd',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  >
                    Forgot Password?
                  </Link>
                </Box>
              )}

              {/* Action Button */}
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  py: 0.8,
                  mt: 0.5,
                  fontSize: '14px',
                  fontWeight: 600,
                  borderRadius: '8px',
                  boxShadow: '0 4px 10px rgba(53, 37, 205, 0.2)',
                  '&:hover': {
                    boxShadow: '0 6px 14px rgba(53, 37, 205, 0.3)',
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : isRegister ? (
                  'Create Account'
                ) : (
                  'Sign In'
                )}
              </Button>

              {/* Divider */}
              <Box sx={{ display: 'flex', alignItems: 'center', py: 0.2 }}>
                <Divider sx={{ flexGrow: 1 }} />
                <Typography variant="caption" sx={{ px: 1.5, color: '#777587', fontWeight: 600, letterSpacing: '0.15em', fontSize: '9px' }}>
                  OR
                </Typography>
                <Divider sx={{ flexGrow: 1 }} />
              </Box>

              {/* Alternate Action Button */}
              <Button
                variant={isRegister ? 'outlined' : 'outlined'}
                onClick={isRegister ? handleGoogleSignup : handleToggleMode}
                disabled={loading}
                startIcon={
                  isRegister ? (
                    <svg width="16" height="16" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                    </svg>
                  ) : undefined
                }
                sx={{
                  py: 0.8,
                  fontSize: '14px',
                  borderRadius: '8px',
                  color: '#0b1c30',
                  borderColor: '#c7c4d8',
                  '&:hover': {
                    borderColor: '#0b1c30',
                    backgroundColor: 'rgba(11, 28, 48, 0.03)',
                  },
                }}
              >
                {isRegister ? 'Sign up with Google' : 'Create an Account'}
              </Button>
            </Box>
          </Paper>

          {/* Footer & Mode Toggles */}
          <Box sx={{ mt: 1.5, textAlign: 'center', width: '100%' }}>
            <Typography sx={{ color: '#464555', mb: isRegister ? 1 : 0.5, fontSize: '12px' }}>
              {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
              <Link
                component="button"
                onClick={handleToggleMode}
                underline="hover"
                sx={{ color: '#3525cd', fontWeight: 600, fontSize: '12px', verticalAlign: 'baseline' }}
              >
                {isRegister ? 'Log In' : 'Sign Up'}
              </Link>
            </Typography>

            {isRegister ? (
              /* GDPR / Encryption trust signals */
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2.5, opacity: 0.6, mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                  <Security sx={{ fontSize: '14px' }} />
                  <Typography sx={{ fontSize: '10px', fontWeight: 500 }}>GDPR Compliant</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                  <Lock sx={{ fontSize: '14px' }} />
                  <Typography sx={{ fontSize: '10px', fontWeight: 500 }}>256-bit Encryption</Typography>
                </Box>
              </Box>
            ) : (
              /* Copyright notice */
              <Typography variant="caption" sx={{ color: '#777587', display: 'block', lineHeight: 1.4, fontSize: '10.5px' }}>
                © 2024 Mailly Inc. All rights reserved.
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' }, mx: 1 }}>
                  •
                </Box>
                <Box component="br" sx={{ display: { xs: 'inline', sm: 'none' } }} />
                <Link href="#" underline="hover" sx={{ color: '#777587' }}>
                  Privacy Policy
                </Link>
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
