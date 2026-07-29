'use client';

import React, { useState } from 'react';
import { Box, Drawer } from '@mui/material';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8f9ff' }}>
      {/* Desktop Sidebar Navigation (Permanent) */}
      <Box sx={{ display: { xs: 'none', md: 'block' }, width: 288, flexShrink: 0 }}>
        <Box sx={{ position: 'fixed', left: 0, top: 0, width: 288, height: '100vh' }}>
          <Sidebar />
        </Box>
      </Box>

      {/* Mobile Sidebar Navigation (Temporary Drawer) */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }} // Better mobile performance
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 288 },
        }}
      >
        <Sidebar onClose={handleDrawerToggle} />
      </Drawer>

      {/* Main Content Area */}
      <Box sx={{ flexGrow: 1, pl: { xs: 0, md: '288px' }, minWidth: 0 }}>
        {/* Top Header Bar */}
        <Header onMenuClick={handleDrawerToggle} />

        {/* Dynamic Page Content */}
        <Box component="main" sx={{ pt: '64px', minHeight: 'calc(100vh - 64px)' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
