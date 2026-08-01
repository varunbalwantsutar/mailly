'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import api from '../../utils/api';
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
} from '@mui/material';
import {
  Dashboard,
  Person,
  Groups,
  Campaign,
  BarChart,
  Settings,
  Logout,
  Close,
} from '@mui/icons-material';

const NAV_ITEMS = [
  { text: 'Analytics', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Contacts', icon: <Person />, path: '/contacts' },
  { text: 'Audiences', icon: <Groups />, path: '/audiences' },
  { text: 'Campaigns', icon: <Campaign />, path: '/campaigns' },
];

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback redirect
      router.push('/login');
    }
  };

  return (
    <Box
      component="aside"
      sx={{
        width: 288,
        height: '100%',
        bgcolor: '#ffffff',
        borderRight: '1px solid rgba(199, 196, 216, 0.3)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Brand Header */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          component="img"
          alt="Mailly Logo"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5S77mrEmXCaJCuNSlURhCLxS-yTv0c6GoLsXE9UDl3mwICZw_b0wCg5qcRy4dDYXZzEcJqQgzzLPe42yqlIXF_x-ZkXDLEG8NmQuVXFal-WJ9yb04uWX7p-ne4kvYWt4bwePabQMIyVBHj3jnoYentbxIEZ11VYC_wWub-Yuv8KyOhJXhixg4aeAUXkM3bFAYh5oo48kC0nf_dgqQf5TI8TfDAsetTGfGYIyqsnmx9KnsHCpvxy8b"
          sx={{ height: 32, width: 'auto', objectFit: 'contain', borderRadius: '6px' }}
        />
        <Typography variant="h5" sx={{ color: '#3525cd', fontWeight: 700, tracking: '-0.02em', fontSize: '20px' }}>
          Mailly
        </Typography>

        {onClose && (
          <IconButton onClick={onClose} sx={{ ml: 'auto' }}>
            <Close sx={{ fontSize: '20px' }} />
          </IconButton>
        )}
      </Box>

      {/* Navigation List */}
      <List sx={{ px: 2, py: 1, display: 'flex', flexDirection: 'column', gap: 0.5, flexGrow: 1 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path || (item.path === '/dashboard' && pathname === '/');
          return (
            <ListItemButton
              key={item.text}
              onClick={() => router.push(item.path)}
              sx={{
                borderRadius: '8px',
                px: 2,
                py: 1.2,
                bgcolor: isActive ? '#e5eeff' : 'transparent',
                color: isActive ? '#3525cd' : '#464555',
                fontWeight: isActive ? 700 : 500,
                '&:hover': {
                  bgcolor: isActive ? '#e5eeff' : 'rgba(229, 238, 255, 0.4)',
                  color: isActive ? '#3525cd' : '#0b1c30',
                },
                '& .MuiListItemIcon-root': {
                  color: 'inherit',
                  minWidth: 36,
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText>
                <Typography sx={{ fontSize: '14px', fontWeight: isActive ? 700 : 500 }}>
                  {item.text}
                </Typography>
              </ListItemText>
            </ListItemButton>
          );
        })}
      </List>

      {/* Sidebar Footer */}
      <Box sx={{ mt: 'auto', borderTop: '1px solid rgba(199, 196, 216, 0.3)', p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {/* User Card */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 1.2, borderRadius: '12px', bgcolor: '#f8f9ff' }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              bgcolor: '#3525cd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <Person sx={{ fontSize: '20px' }} />
          </Box>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="subtitle2" sx={{ color: '#0b1c30', fontWeight: 600, fontSize: '13.5px', lineHeight: 1.2 }} noWrap>
              {user?.name || 'User'}
            </Typography>
            <Typography sx={{ color: '#464555', fontSize: '11px', mt: 0.2 }} noWrap>
              {user?.companyName || user?.email || 'My Workspace'}
            </Typography>
          </Box>
        </Box>

        {/* Logout button */}
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: '8px',
            color: '#ba1a1a',
            py: 1,
            px: 2,
            '&:hover': {
              bgcolor: 'rgba(186, 26, 26, 0.06)',
            },
            '& .MuiListItemIcon-root': {
              color: 'inherit',
              minWidth: 36,
            },
          }}
        >
          <ListItemIcon>
            <Logout />
          </ListItemIcon>
          <ListItemText>
            <Typography sx={{ fontSize: '14px', fontWeight: 600 }}>
              Logout
            </Typography>
          </ListItemText>
        </ListItemButton>
      </Box>
    </Box>
  );
}
