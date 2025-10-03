import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  Button,
  LinearProgress,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { motion, Easing } from 'framer-motion';
import { styled } from '@mui/material/styles';
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  ExternalLink,
  Bookmark,
  Send,
  Verified,
  AlertCircle,
} from 'lucide-react';

// Types
export interface DateRange {
  start: Date;
  end: Date;
}

export interface CastingCall {
  id: string;
  title: string;
  company: string;
  location: string;
  shootDates?: DateRange;
  applicationDeadline?: Date;
  status: 'active' | 'closed' | 'draft';
  source: 'native' | 'external';
  confidence?: number;
  requirements: string[];
  compensation?: string;
  applicationsCount?: number;
  description?: string;
  isVerified?: boolean;
  sourceUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CastingCallCardProps {
  castingCall: CastingCall;
  onApply?: (castingCall: CastingCall) => void;
  onSave?: (castingCall: CastingCall) => void;
  onClaim?: (castingCall: CastingCall) => void;
  onLearnMore?: (castingCall: CastingCall) => void;
  showActions?: boolean;
  variant?: 'default' | 'compact';
  className?: string;
}

// Styled Components
const StyledCard = styled(motion.div)(({ theme }) => ({
  background: '#FFFFFF',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(18, 18, 18, 0.08)',
  overflow: 'hidden',
  transition: 'all 0.2s ease-out',
  border: '1px solid #E9ECEF',
  position: 'relative',
  
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(18, 18, 18, 0.12)',
  },
  
  '&.native': {
    borderLeft: '4px solid #28A745',
  },
  
  '&.external': {
    borderLeft: '4px solid #FFC107',
  },
}));

const CardHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderBottom: '1px solid #E9ECEF',
}));

const CompanyInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  color: '#6C757D',
  marginBottom: theme.spacing(1),
  flexWrap: 'wrap',
}));

const DetailsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
  },
}));

const DetailItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
}));

const DetailLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  color: '#6C757D',
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}));

const DetailValue = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  color: '#121212',
  fontWeight: 600,
  
  '&.missing': {
    color: '#6C757D',
    fontStyle: 'italic',
    fontWeight: 400,
  },
}));

const ConfidenceIndicator = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  fontSize: '0.75rem',
  color: '#6C757D',
  marginTop: theme.spacing(0.5),
}));

const StatusIndicator = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  fontSize: '0.875rem',
}));

const StatusDot = styled(Box)<{ status: string }>(({ theme, status }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: status === 'external' ? '#FFC107' : '#28A745',
}));

// Animation variants
const cardVariants = {
  hover: {
    y: -2,
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as Easing },
  },
};

// Helper functions
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

const formatDateRange = (range: DateRange): string => {
  const start = formatDate(range.start);
  const end = formatDate(range.end);
  return `${start} - ${end}`;
};

const getSourceBadgeProps = (source: string) => {
  if (source === 'native') {
    return {
      label: 'Native',
      color: 'success' as const,
      sx: { backgroundColor: '#28A745', color: '#FFFFFF' }
    };
  }
  return {
    label: 'External',
    color: 'warning' as const,
    sx: { backgroundColor: '#FFC107', color: '#121212' }
  };
};

const getStatusText = (source: string): string => {
  return source === 'native' ? 'Applications Open' : 'External Opportunity';
};

// Main Component
export const CastingCallCard: React.FC<CastingCallCardProps> = ({
  castingCall,
  onApply,
  onSave,
  onClaim,
  onLearnMore,
  showActions = true,
  variant = 'default',
  className,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const sourceBadgeProps = getSourceBadgeProps(castingCall.source);
  const isNative = castingCall.source === 'native';
  const isExternal = castingCall.source === 'external';

  const handleApply = () => {
    if (onApply) onApply(castingCall);
  };

  const handleSave = () => {
    if (onSave) onSave(castingCall);
  };

  const handleClaim = () => {
    if (onClaim) onClaim(castingCall);
  };

  const handleLearnMore = () => {
    if (onLearnMore) onLearnMore(castingCall);
  };

  return (
    <StyledCard
      className={`casting-card ${castingCall.source} ${className || ''}`}
      variants={cardVariants}
      whileHover="hover"
    >
      {/* Header */}
      <CardHeader>
        <Typography
          variant="h6"
          component="h3"
          sx={{
            fontWeight: 700,
            color: '#121212',
            marginBottom: 1,
            lineHeight: 1.4,
            fontFamily: 'Amiri, Times New Roman, serif',
          }}
        >
          {castingCall.title}
        </Typography>

        <CompanyInfo>
          <Typography variant="body2">
            {castingCall.company}
          </Typography>
          
          {castingCall.isVerified && (
            <Chip
              icon={<Verified size={12} />}
              label="Verified"
              size="small"
              sx={{
                backgroundColor: '#28A745',
                color: '#FFFFFF',
                fontSize: '0.75rem',
                height: 20,
              }}
            />
          )}
          
          <Chip
            {...sourceBadgeProps}
            size="small"
            sx={{
              ...sourceBadgeProps.sx,
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              height: 20,
            }}
          />
        </CompanyInfo>
      </CardHeader>

      {/* Body */}
      <CardContent sx={{ padding: 3 }}>
        <DetailsGrid>
          {/* Location */}
          <DetailItem>
            <DetailLabel>Location</DetailLabel>
            <DetailValue>
              {castingCall.location}
            </DetailValue>
            {isExternal && castingCall.confidence && (
              <ConfidenceIndicator>
                <LinearProgress
                  variant="determinate"
                  value={castingCall.confidence}
                  sx={{
                    width: 40,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: '#E9ECEF',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#28A745',
                    },
                  }}
                />
                <span>{castingCall.confidence}% confidence</span>
              </ConfidenceIndicator>
            )}
          </DetailItem>

          {/* Shoot Dates or Deadline */}
          <DetailItem>
            <DetailLabel>
              {castingCall.shootDates ? 'Shoot Dates' : 'Deadline'}
            </DetailLabel>
            <DetailValue className={!castingCall.shootDates && !castingCall.applicationDeadline ? 'missing' : ''}>
              {castingCall.shootDates 
                ? formatDateRange(castingCall.shootDates)
                : castingCall.applicationDeadline 
                  ? formatDate(castingCall.applicationDeadline)
                  : 'Not specified'
              }
            </DetailValue>
          </DetailItem>

          {/* Applications or Compensation */}
          {isNative ? (
            <DetailItem>
              <DetailLabel>Applications</DetailLabel>
              <DetailValue>
                {castingCall.applicationsCount || 0} submitted
              </DetailValue>
            </DetailItem>
          ) : (
            <DetailItem>
              <DetailLabel>Compensation</DetailLabel>
              <DetailValue className={!castingCall.compensation ? 'missing' : ''}>
                {castingCall.compensation || 'Contact for details'}
              </DetailValue>
            </DetailItem>
          )}

          {/* Source (for external) */}
          {isExternal && (
            <DetailItem>
              <DetailLabel>Source</DetailLabel>
              <DetailValue>
                {castingCall.sourceUrl ? 'Company Website' : 'External Source'}
              </DetailValue>
            </DetailItem>
          )}
        </DetailsGrid>
      </CardContent>

      {/* Footer */}
      {showActions && (
        <>
          <Divider />
          <CardActions sx={{ padding: 3, justifyContent: 'space-between' }}>
            <StatusIndicator>
              <StatusDot status={castingCall.source} />
              <Typography variant="body2" color="text.secondary">
                {getStatusText(castingCall.source)}
              </Typography>
            </StatusIndicator>

            <Box sx={{ display: 'flex', gap: 1 }}>
              {isNative ? (
                <>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Bookmark size={16} />}
                    onClick={handleSave}
                    sx={{
                      color: '#007FFF',
                      borderColor: '#007FFF',
                      '&:hover': {
                        backgroundColor: '#007FFF',
                        color: '#FFFFFF',
                      },
                    }}
                  >
                    Save
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<Send size={16} />}
                    onClick={handleApply}
                    sx={{
                      backgroundColor: '#FFD700',
                      color: '#121212',
                      '&:hover': {
                        backgroundColor: '#E6C200',
                      },
                    }}
                  >
                    Apply Now
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ExternalLink size={16} />}
                    onClick={handleClaim}
                    sx={{
                      color: '#007FFF',
                      borderColor: '#007FFF',
                      '&:hover': {
                        backgroundColor: '#007FFF',
                        color: '#FFFFFF',
                      },
                    }}
                  >
                    Claim This
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AlertCircle size={16} />}
                    onClick={handleLearnMore}
                    sx={{
                      backgroundColor: '#FFC107',
                      color: '#121212',
                      '&:hover': {
                        backgroundColor: '#E0A800',
                      },
                    }}
                  >
                    Learn More
                  </Button>
                </>
              )}
            </Box>
          </CardActions>
        </>
      )}
    </StyledCard>
  );
};

export default CastingCallCard;
