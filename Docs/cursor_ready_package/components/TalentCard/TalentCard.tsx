import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Rating,
  Avatar,
  Fade,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';
import {
  Verified,
  Star,
  Circle,
} from 'lucide-react';

// Types
interface TalentUser {
  id: string;
  name: string;
  arabicName?: string;
  specialty: string[];
  rating: number;
  reviewCount: number;
  availability: 'available' | 'busy' | 'unavailable';
  verificationStatus: 'verified' | 'pending' | 'expired';
  profileImage?: string;
  yearsExperience?: number;
  projectsCompleted?: number;
  successRate?: number;
}

interface TalentCardProps {
  talent: TalentUser;
  onClick?: (talent: TalentUser) => void;
  showDetails?: boolean;
  variant?: 'grid' | 'list';
  className?: string;
}

// Styled Components
const StyledCard = styled(motion.div)(({ theme }) => ({
  position: 'relative',
  aspectRatio: '3/4',
  borderRadius: '16px',
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: '0 4px 12px rgba(18, 18, 18, 0.08)',
  
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 20px 40px rgba(18, 18, 18, 0.15)',
  },
  
  [theme.breakpoints.down('md')]: {
    aspectRatio: '4/5',
  },
}));

const HeadshotContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100%',
  background: 'linear-gradient(135deg, #007FFF 0%, #FFD700 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  color: '#FFFFFF',
  fontSize: '2.5rem',
  fontWeight: 700,
  fontFamily: 'Amiri, Times New Roman, serif',
  textShadow: '0 2px 8px rgba(0,0,0,0.2)',
  
  [theme.breakpoints.down('md')]: {
    fontSize: '2rem',
  },
}));

const OverlayContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  background: 'linear-gradient(transparent, rgba(18, 18, 18, 0.95))',
  color: '#FFFFFF',
  padding: theme.spacing(3),
  transform: 'translateY(100%)',
  transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  
  '.talent-card:hover &': {
    transform: 'translateY(0)',
  },
}));

const VerificationBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
  background: '#28A745',
  color: '#FFFFFF',
  borderRadius: '50%',
  width: 32,
  height: 32,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2,
}));

const AvailabilityIndicator = styled(Box)<{ available: boolean }>(({ theme, available }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  fontSize: '0.875rem',
  
  '& .availability-dot': {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: available ? '#28A745' : '#FFC107',
  },
}));

const StatsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: theme.spacing(2),
  fontSize: '0.875rem',
}));

// Animation variants
const cardVariants = {
  hover: {
    y: -8,
    transition: { duration: 0.2, ease: [0, 0, 0.58, 1] }
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 }
  }
};

const overlayVariants = {
  hidden: { y: '100%' },
  visible: { 
    y: 0,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  }
};

// Helper functions
const getInitials = (name: string, arabicName?: string): string => {
  if (arabicName) {
    return arabicName.split(' ').slice(0, 2).join(' ');
  }
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

const getAvailabilityText = (availability: string): string => {
  switch (availability) {
    case 'available': return 'Available';
    case 'busy': return 'Busy';
    case 'unavailable': return 'Unavailable';
    default: return 'Unknown';
  }
};

const getAvailabilityColor = (availability: string): string => {
  switch (availability) {
    case 'available': return '#28A745';
    case 'busy': return '#FFC107';
    case 'unavailable': return '#DC3545';
    default: return '#6C757D';
  }
};

// Main Component
export const TalentCard: React.FC<TalentCardProps> = ({
  talent,
  onClick,
  showDetails = true,
  variant = 'grid',
  className,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isHovered, setIsHovered] = React.useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick(talent);
    }
  };

  const initials = getInitials(talent.name, talent.arabicName);
  const isAvailable = talent.availability === 'available';

  return (
    <StyledCard
      className={`talent-card ${className || ''}`}
      variants={cardVariants}
      whileHover="hover"
      whileTap="tap"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Verification Badge */}
      {talent.verificationStatus === 'verified' && (
        <VerificationBadge>
          <Verified size={16} />
        </VerificationBadge>
      )}

      {/* Headshot Container */}
      <HeadshotContainer>
        {talent.profileImage ? (
          <Avatar
            src={talent.profileImage}
            alt={talent.name}
            sx={{
              width: '100%',
              height: '100%',
              fontSize: 'inherit',
              fontWeight: 'inherit',
            }}
          >
            {initials}
          </Avatar>
        ) : (
          initials
        )}
      </HeadshotContainer>

      {/* Overlay with Details */}
      {showDetails && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate={isHovered ? "visible" : "hidden"}
        >
          <OverlayContainer>
            {/* Name */}
            <Typography
              variant="h6"
              component="h3"
              sx={{
                fontWeight: 700,
                marginBottom: 0.5,
                fontFamily: 'Amiri, Times New Roman, serif',
              }}
            >
              {talent.name}
            </Typography>

            {/* Specialty */}
            <Typography
              variant="body2"
              sx={{
                opacity: 0.9,
                marginBottom: 2,
                fontStyle: 'italic',
              }}
            >
              {talent.specialty.join(' • ')}
            </Typography>

            {/* Stats */}
            <StatsContainer>
              {/* Rating */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Rating
                  value={talent.rating}
                  precision={0.1}
                  size="small"
                  readOnly
                  sx={{
                    '& .MuiRating-iconFilled': {
                      color: '#FFD700',
                    },
                  }}
                />
                <Typography variant="caption">
                  {talent.rating} ({talent.reviewCount})
                </Typography>
              </Box>

              {/* Availability */}
              <AvailabilityIndicator available={isAvailable}>
                <Circle
                  size={8}
                  fill={getAvailabilityColor(talent.availability)}
                  color={getAvailabilityColor(talent.availability)}
                />
                <Typography variant="caption">
                  {getAvailabilityText(talent.availability)}
                </Typography>
              </AvailabilityIndicator>
            </StatsContainer>

            {/* Additional Stats (if available) */}
            {(talent.yearsExperience || talent.projectsCompleted || talent.successRate) && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: 1,
                  fontSize: '0.75rem',
                  opacity: 0.8,
                }}
              >
                {talent.yearsExperience && (
                  <span>{talent.yearsExperience}y exp</span>
                )}
                {talent.projectsCompleted && (
                  <span>{talent.projectsCompleted} projects</span>
                )}
                {talent.successRate && (
                  <span>{talent.successRate}% success</span>
                )}
              </Box>
            )}
          </OverlayContainer>
        </motion.div>
      )}
    </StyledCard>
  );
};

export default TalentCard;
