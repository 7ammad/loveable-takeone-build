import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  useTheme,
  useMediaQuery,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Collapse,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu as MenuIcon,
  Search,
  Bell,
  Settings,
  LogOut,
  User,
  Briefcase,
  Calendar,
  MessageSquare,
  BarChart3,
  CreditCard,
  ChevronDown,
  ChevronRight,
  Home,
  Users,
  Film,
  Star,
  Bookmark,
  HelpCircle,
} from 'lucide-react';

// Types
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'talent' | 'caster' | 'admin';
  verificationStatus?: 'verified' | 'pending' | 'expired';
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
  children?: NavigationItem[];
}

interface DashboardLayoutProps {
  user: User;
  children: React.ReactNode;
  currentPath?: string;
  onNavigate?: (path: string) => void;
  onLogout?: () => void;
  notifications?: number;
  className?: string;
}

// Constants
const DRAWER_WIDTH = 280;
const MOBILE_DRAWER_WIDTH = 280;
const HEADER_HEIGHT = 64;

// Styled Components
const Root = styled(Box)(({ theme }) => ({
  display: 'flex',
  minHeight: '100vh',
  backgroundColor: '#F8F9FA',
}));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#FFFFFF',
  color: '#121212',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  borderBottom: '1px solid #E9ECEF',
  zIndex: theme.zIndex.drawer + 1,
}));

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: DRAWER_WIDTH,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: DRAWER_WIDTH,
    boxSizing: 'border-box',
    backgroundColor: '#FFFFFF',
    borderRight: '1px solid #E9ECEF',
    paddingTop: HEADER_HEIGHT,
  },
  
  [theme.breakpoints.down('md')]: {
    width: MOBILE_DRAWER_WIDTH,
    '& .MuiDrawer-paper': {
      width: MOBILE_DRAWER_WIDTH,
    },
  },
}));

const MainContent = styled(Box)<{ open: boolean }>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  marginLeft: open ? DRAWER_WIDTH : 0,
  marginTop: HEADER_HEIGHT,
  transition: theme.transitions.create(['margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  
  [theme.breakpoints.down('md')]: {
    marginLeft: 0,
    padding: theme.spacing(2),
  },
}));

const UserProfile = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderBottom: '1px solid #E9ECEF',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

const NavigationList = styled(List)(({ theme }) => ({
  padding: theme.spacing(1),
  
  '& .MuiListItemButton-root': {
    borderRadius: theme.spacing(1),
    margin: theme.spacing(0.5, 1),
    
    '&:hover': {
      backgroundColor: '#F8F9FA',
    },
    
    '&.active': {
      backgroundColor: '#E8F4FD',
      color: '#007FFF',
      
      '& .MuiListItemIcon-root': {
        color: '#007FFF',
      },
    },
  },
}));

// Navigation configurations
const getTalentNavigation = (): NavigationItem[] => [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <Home size={20} />,
    path: '/dashboard',
  },
  {
    id: 'profile',
    label: 'My Profile',
    icon: <User size={20} />,
    path: '/profile',
  },
  {
    id: 'opportunities',
    label: 'Opportunities',
    icon: <Briefcase size={20} />,
    path: '/casting-calls',
    children: [
      {
        id: 'browse',
        label: 'Browse Casting Calls',
        icon: <Search size={18} />,
        path: '/casting-calls',
      },
      {
        id: 'saved',
        label: 'Saved Opportunities',
        icon: <Bookmark size={18} />,
        path: '/saved-searches',
      },
    ],
  },
  {
    id: 'applications',
    label: 'My Applications',
    icon: <Film size={20} />,
    path: '/applications',
  },
  {
    id: 'messages',
    label: 'Messages',
    icon: <MessageSquare size={20} />,
    path: '/messages',
    badge: 3,
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: <Calendar size={20} />,
    path: '/calendar',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings size={20} />,
    path: '/settings',
  },
];

const getCasterNavigation = (): NavigationItem[] => [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <Home size={20} />,
    path: '/dashboard',
  },
  {
    id: 'casting-calls',
    label: 'Casting Calls',
    icon: <Film size={20} />,
    path: '/casting-calls',
    children: [
      {
        id: 'manage',
        label: 'Manage Calls',
        icon: <Briefcase size={18} />,
        path: '/casting-calls',
      },
      {
        id: 'create',
        label: 'Create New',
        icon: <Users size={18} />,
        path: '/casting-calls/create',
      },
    ],
  },
  {
    id: 'talent-search',
    label: 'Find Talent',
    icon: <Search size={20} />,
    path: '/talent-search',
  },
  {
    id: 'applications',
    label: 'Applications',
    icon: <Star size={20} />,
    path: '/applications',
    badge: 12,
  },
  {
    id: 'messages',
    label: 'Messages',
    icon: <MessageSquare size={20} />,
    path: '/messages',
    badge: 5,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: <BarChart3 size={20} />,
    path: '/analytics',
  },
  {
    id: 'billing',
    label: 'Billing',
    icon: <CreditCard size={20} />,
    path: '/billing',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings size={20} />,
    path: '/settings',
  },
];

// Helper Components
const NavigationItem: React.FC<{
  item: NavigationItem;
  currentPath?: string;
  onNavigate?: (path: string) => void;
  level?: number;
}> = ({ item, currentPath, onNavigate, level = 0 }) => {
  const [open, setOpen] = useState(false);
  const isActive = currentPath === item.path;
  const hasChildren = item.children && item.children.length > 0;

  const handleClick = () => {
    if (hasChildren) {
      setOpen(!open);
    } else if (onNavigate) {
      onNavigate(item.path);
    }
  };

  return (
    <>
      <ListItemButton
        className={isActive ? 'active' : ''}
        onClick={handleClick}
        sx={{ pl: 2 + level * 2 }}
      >
        <ListItemIcon sx={{ minWidth: 40 }}>
          {item.icon}
        </ListItemIcon>
        <ListItemText 
          primary={item.label}
          primaryTypographyProps={{
            fontSize: level > 0 ? '0.875rem' : '1rem',
            fontWeight: isActive ? 600 : 400,
          }}
        />
        {item.badge && (
          <Badge
            badgeContent={item.badge}
            color="error"
            sx={{ mr: hasChildren ? 1 : 0 }}
          />
        )}
        {hasChildren && (
          <IconButton size="small" sx={{ p: 0.5 }}>
            {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </IconButton>
        )}
      </ListItemButton>
      
      {hasChildren && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {item.children!.map((child) => (
              <NavigationItem
                key={child.id}
                item={child}
                currentPath={currentPath}
                onNavigate={onNavigate}
                level={level + 1}
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
};

// Main Component
export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  user,
  children,
  currentPath,
  onNavigate,
  onLogout,
  notifications = 0,
  className,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const navigation = user.role === 'talent' ? getTalentNavigation() : getCasterNavigation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    if (onLogout) onLogout();
  };

  const drawer = (
    <Box>
      {/* User Profile Section */}
      <UserProfile>
        <Avatar
          src={user.avatar}
          alt={user.name}
          sx={{ width: 48, height: 48 }}
        >
          {user.name.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              fontFamily: 'Amiri, Times New Roman, serif',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {user.name}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              textTransform: 'capitalize',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            {user.role}
            {user.verificationStatus === 'verified' && (
              <Badge
                badgeContent="✓"
                color="success"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.6rem',
                    minWidth: 16,
                    height: 16,
                  },
                }}
              />
            )}
          </Typography>
        </Box>
      </UserProfile>

      {/* Navigation */}
      <NavigationList>
        {navigation.map((item) => (
          <NavigationItem
            key={item.id}
            item={item}
            currentPath={currentPath}
            onNavigate={onNavigate}
          />
        ))}
      </NavigationList>

      {/* Help Section */}
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <ListItemButton
          onClick={() => onNavigate?.('/help')}
          sx={{ borderRadius: 1 }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <HelpCircle size={20} />
          </ListItemIcon>
          <ListItemText primary="Help & Support" />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Root className={className}>
      {/* App Bar */}
      <StyledAppBar position="fixed">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              flexGrow: 1,
              fontFamily: 'Amiri, Times New Roman, serif',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #FFD700, #007FFF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            TakeOne
          </Typography>

          {/* Notifications */}
          <IconButton color="inherit" sx={{ mr: 1 }}>
            <Badge badgeContent={notifications} color="error">
              <Bell size={20} />
            </Badge>
          </IconButton>

          {/* Profile Menu */}
          <IconButton
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Avatar
              src={user.avatar}
              alt={user.name}
              sx={{ width: 32, height: 32 }}
            >
              {user.name.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
        </Toolbar>
      </StyledAppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => { handleProfileMenuClose(); onNavigate?.('/profile'); }}>
          <ListItemIcon>
            <User size={16} />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={() => { handleProfileMenuClose(); onNavigate?.('/settings'); }}>
          <ListItemIcon>
            <Settings size={16} />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogOut size={16} />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        <StyledDrawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
        >
          {drawer}
        </StyledDrawer>
      </Box>

      {/* Main Content */}
      <MainContent open={!isMobile}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPath}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </MainContent>
    </Root>
  );
};

export default DashboardLayout;
