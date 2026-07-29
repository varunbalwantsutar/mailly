'use client';

import React from 'react';
import {
  Box,
  IconButton,
  InputBase,
  Badge,
  Avatar,
} from '@mui/material';
import { Search, Notifications, Person, Menu } from '@mui/icons-material';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <Box
      component="header"
      sx={{
        position: 'fixed',
        top: 0,
        left: { xs: 0, md: 288 },
        right: 0,
        height: 64,
        bgcolor: 'rgba(248, 249, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(199, 196, 216, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'between',
        px: { xs: 2, md: 4 },
        zIndex: 40,
      }}
    >
      {/* Hamburger Menu on Mobile */}
      <IconButton
        color="inherit"
        onClick={onMenuClick}
        sx={{ mr: 1, display: { md: 'none' } }}
      >
        <Menu sx={{ color: '#464555' }} />
      </IconButton>
      {/* Search Bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          bgcolor: '#eff4ff',
          px: 2,
          py: 0.5,
          borderRadius: '9999px',
          border: '1px solid rgba(199, 196, 216, 0.2)',
          width: 320,
        }}
      >
        <Search sx={{ color: '#464555', fontSize: '18px' }} />
        <InputBase
          placeholder="Search campaigns, tags..."
          sx={{
            fontSize: '13px',
            color: '#0b1c30',
            width: '100%',
            '& input::placeholder': {
              color: 'rgba(70, 69, 85, 0.6)',
              opacity: 1,
            },
          }}
        />
      </Box>

      {/* Spacer to push items right */}
      <Box sx={{ flexGrow: 1 }} />

      {/* Actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
        {/* Notifications */}
        <IconButton
          size="medium"
          sx={{
            p: 1,
            bgcolor: '#ffffff',
            border: '1px solid rgba(199, 196, 216, 0.2)',
            borderRadius: '50%',
            '&:hover': {
              bgcolor: '#eff4ff',
            },
          }}
        >
          <Badge
            variant="dot"
            color="primary"
            sx={{
              '& .MuiBadge-badge': {
                backgroundColor: '#3525cd',
                width: 7,
                height: 7,
                borderRadius: '50%',
                border: '2px solid #ffffff',
              },
            }}
          >
            <Notifications sx={{ color: '#464555', fontSize: '18px' }} />
          </Badge>
        </IconButton>

        {/* Profile Avatar */}
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: '#3525cd',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(53, 37, 205, 0.15)',
          }}
        >
          <Person sx={{ fontSize: '18px', color: '#ffffff' }} />
        </Avatar>
      </Box>
    </Box>
  );
}
