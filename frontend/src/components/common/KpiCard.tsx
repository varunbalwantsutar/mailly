'use client';

import React from 'react';
import { Box, Paper, Typography, LinearProgress } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

interface KpiCardProps {
  title: string;
  value: string | number;
  trend?: string;
  icon: React.ReactNode;
  color?: string; // e.g. '#3525cd' or '#5c5f61'
  progress?: number;
}

export default function KpiCard({
  title,
  value,
  trend,
  icon,
  color = '#3525cd',
  progress,
}: KpiCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: '12px',
        border: '1px solid rgba(199, 196, 216, 0.3)',
        bgcolor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(79, 70, 229, 0.04)',
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
        <Box
          sx={{
            p: 1,
            borderRadius: '8px',
            bgcolor: `${color}10`, // 10% opacity color
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>

        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2, color: color, fontWeight: 700, fontSize: '12px' }}>
            <TrendingUpIcon sx={{ fontSize: '14px' }} />
            <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '11px' }}>
              {trend}
            </Typography>
          </Box>
        )}

        {progress !== undefined && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#0b1c30', fontSize: '11px' }}>
              {progress}% Rate
            </Typography>
            <Box sx={{ width: 64, mt: 0.5 }}>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 4,
                  borderRadius: 2,
                  bgcolor: '#e5eeff',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: color,
                    borderRadius: 2,
                  },
                }}
              />
            </Box>
          </Box>
        )}
      </Box>

      <Box sx={{ mt: 3.5 }}>
        <Typography variant="caption" sx={{ color: '#464555', fontWeight: 500, display: 'block', fontSize: '12px' }}>
          {title}
        </Typography>
        <Typography variant="h4" sx={{ color: '#0b1c30', fontWeight: 700, mt: 0.5, fontSize: '26px' }}>
          {value}
        </Typography>
      </Box>
    </Paper>
  );
}
