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
import { Visibility, VisibilityOff } from '@mui/icons-material';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // State for login status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!email || !password) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed. Please check your credentials.');
      }

      setSuccess('Login successful! Redirecting...');
      console.log('Login success:', data);
      
      // Seed user info into session/local storage for convenience
      localStorage.setItem('user', JSON.stringify(data.user));

      // Simulate redirection to dashboard after success
      setTimeout(() => {
        alert(`Welcome back, ${data.user.name || data.user.email}! (Dashboard redirect placeholder)`);
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!email || !password) {
      setError('Please provide an email and password to register.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name: email.split('@')[0], // Generate a default name from email
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed.');
      }

      setSuccess('Account created and logged in! Auto-redirecting...');
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch (err: any) {
      setError(err.message || 'An error occurred during account creation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%', m: 0, p: 0, flexDirection: { xs: 'column', md: 'row' } }}>
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
          p: 6,
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
            maxWidth: '560px',
          }}
        >
          {/* Mockup Image */}
          <Box
            sx={{
              mb: 4,
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
                maxWidth: '440px',
                height: 'auto',
                filter: 'drop-shadow(0px 20px 30px rgba(0, 0, 0, 0.25))',
                borderRadius: '24px',
              }}
            />
          </Box>

          <Typography variant="h2" sx={{ color: '#ffffff', mb: 2, fontSize: '36px', fontWeight: 700 }}>
            Reach your customers{' '}
            <Box component="span" sx={{ color: '#ffdbcc' }}>
              everywhere.
            </Box>
          </Typography>
          
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.85)', mb: 5, maxWidth: '440px' }}>
            The world's most powerful platform for high-performance marketing workflows and hyper-targeted communication.
          </Typography>

          {/* Metric Badges */}
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Box
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                px: 3,
                py: 2,
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontWeight: 600, display: 'block', mb: 0.5, letterSpacing: '0.1em' }}>
                DELIVERY RATE
              </Typography>
              <Typography variant="h3" sx={{ color: '#ffffff', fontWeight: 700 }}>
                99.9%
              </Typography>
            </Box>

            <Box
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                px: 3,
                py: 2,
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontWeight: 600, display: 'block', mb: 0.5, letterSpacing: '0.1em' }}>
                ACTIVE USERS
              </Typography>
              <Typography variant="h3" sx={{ color: '#ffffff', fontWeight: 700 }}>
                12.5k
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Right Column: Login Form */}
      <Box
        sx={{
          display: 'flex',
          flex: { xs: 1, md: 6, lg: 5 },
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#f8f9ff',
          p: { xs: 3, sm: 6 },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Logo */}
          <Box sx={{ mb: 4 }}>
            <Box
              component="img"
              alt="Mailly Logo"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5S77mrEmXCaJCuNSlURhCLxS-yTv0c6GoLsXE9UDl3mwICZw_b0wCg5qcRy4dDYXZzEcJqQgzzLPe42yqlIXF_x-ZkXDLEG8NmQuVXFal-WJ9yb04uWX7p-ne4kvYWt4bwePabQMIyVBHj3jnoYentbxIEZ11VYC_wWub-Yuv8KyOhJXhixg4aeAUXkM3bFAYh5oo48kC0nf_dgqQf5TI8TfDAsetTGfGYIyqsnmx9KnsHCpvxy8b"
              sx={{
                height: 52,
                width: 'auto',
                objectFit: 'contain',
              }}
            />
          </Box>

          {/* Form Card */}
          <Paper
            elevation={0}
            sx={{
              width: '100%',
              p: 4,
              borderRadius: '16px',
              border: '1px solid rgba(199, 196, 216, 0.3)',
              boxShadow: '0 8px 30px rgba(79, 70, 229, 0.04)',
              bgcolor: '#ffffff',
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h3" sx={{ color: '#0b1c30', fontWeight: 700, mb: 0.5 }}>
                Welcome Back
              </Typography>
              <Typography variant="body2" sx={{ color: '#464555' }}>
                Sign in to manage your contacts and email campaigns.
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: '10px' }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2.5, borderRadius: '10px' }}>
                {success}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Email Address */}
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#464555', mb: 0.8, ml: 0.5, fontWeight: 500 }}>
                  Email Address
                </Typography>
                <TextField
                  fullWidth
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  variant="outlined"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </Box>

              {/* Password */}
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#464555', mb: 0.8, ml: 0.5, fontWeight: 500 }}>
                  Password
                </Typography>
                <TextField
                  fullWidth
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  variant="outlined"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={handleTogglePassword} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>

              {/* Options */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ color: '#464555', userSelect: 'none' }}>
                      Remember me
                    </Typography>
                  }
                />
                <Link
                  href="#"
                  underline="hover"
                  sx={{
                    color: '#3525cd',
                    fontSize: '14px',
                    fontWeight: 600,
                  }}
                >
                  Forgot Password?
                </Link>
              </Box>

              {/* Sign In Button */}
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  py: 1.5,
                  mt: 1,
                  fontSize: '16px',
                  fontWeight: 600,
                  boxShadow: '0 4px 14px rgba(53, 37, 205, 0.25)',
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(53, 37, 205, 0.35)',
                  },
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
              </Button>

              {/* Divider */}
              <Box sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
                <Divider sx={{ flexGrow: 1 }} />
                <Typography variant="caption" sx={{ px: 2, color: '#777587', fontWeight: 600, letterSpacing: '0.1em' }}>
                  OR
                </Typography>
                <Divider sx={{ flexGrow: 1 }} />
              </Box>

              {/* Create Account Button */}
              <Button
                variant="outlined"
                onClick={handleCreateAccount}
                disabled={loading}
                sx={{
                  py: 1.5,
                  color: '#0b1c30',
                  borderColor: '#777587',
                  '&:hover': {
                    borderColor: '#0b1c30',
                    backgroundColor: 'rgba(11, 28, 48, 0.04)',
                  },
                }}
              >
                Create an Account
              </Button>
            </Box>
          </Paper>

          {/* Footer */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#464555', mb: 2 }}>
              Don't have an account?{' '}
              <Link href="#" underline="hover" sx={{ color: '#3525cd', fontWeight: 600 }}>
                Sign Up
              </Link>
            </Typography>
            <Typography variant="caption" sx={{ color: '#777587', display: 'block', lineHeight: 1.6 }}>
              © 2024 Mailly Inc. All rights reserved.
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' }, mx: 1 }}>
                •
              </Box>
              <Box component="br" sx={{ display: { xs: 'inline', sm: 'none' } }} />
              <Link href="#" underline="hover" sx={{ color: '#777587' }}>
                Privacy Policy
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
