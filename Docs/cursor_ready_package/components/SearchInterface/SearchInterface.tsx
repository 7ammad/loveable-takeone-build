import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Chip,
  Button,
  Drawer,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Grid,
  Paper,
  IconButton,
  useTheme,
  useMediaQuery,
  Autocomplete,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  X,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Star,
  Clock,
  ExpandMore,
  Bookmark,
  SlidersHorizontal,
} from 'lucide-react';

// Types
interface SearchFilters {
  location?: string[];
  specialty?: string[];
  experience?: [number, number];
  availability?: string[];
  rating?: number;
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  compensation?: [number, number];
  projectType?: string[];
  skills?: string[];
}

interface SearchResult {
  id: string;
  type: 'talent' | 'casting-call';
  title: string;
  subtitle?: string;
  location: string;
  rating?: number;
  image?: string;
  tags: string[];
  relevanceScore: number;
}

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: SearchFilters;
  alertsEnabled: boolean;
  createdAt: Date;
}

interface SearchInterfaceProps {
  searchType: 'talent' | 'casting-calls' | 'universal';
  onSearch: (query: string, filters: SearchFilters) => void;
  onSaveSearch?: (name: string, query: string, filters: SearchFilters) => void;
  results?: SearchResult[];
  savedSearches?: SavedSearch[];
  loading?: boolean;
  placeholder?: string;
  className?: string;
}

// Constants
const FILTER_DRAWER_WIDTH = 320;

const SPECIALTIES = [
  'Actor', 'Actress', 'Voice Actor', 'Stunt Performer', 'Dancer',
  'Singer', 'Model', 'Extra', 'Stand-in', 'Body Double'
];

const LOCATIONS = [
  'Riyadh', 'Jeddah', 'Dammam', 'Mecca', 'Medina',
  'Khobar', 'Tabuk', 'Abha', 'Najran', 'Jazan'
];

const PROJECT_TYPES = [
  'Film', 'TV Series', 'Commercial', 'Music Video',
  'Documentary', 'Short Film', 'Theater', 'Web Series'
];

const SKILLS = [
  'Arabic', 'English', 'French', 'Spanish', 'Martial Arts',
  'Dancing', 'Singing', 'Horseback Riding', 'Swimming', 'Driving'
];

// Styled Components
const SearchContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  padding: theme.spacing(3),
  backgroundColor: '#FFFFFF',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(18, 18, 18, 0.08)',
  marginBottom: theme.spacing(3),
}));

const SearchBar = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: '#F8F9FA',
    fontSize: '1.1rem',
    
    '&:hover': {
      backgroundColor: '#FFFFFF',
    },
    
    '&.Mui-focused': {
      backgroundColor: '#FFFFFF',
    },
  },
}));

const FilterChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  backgroundColor: '#E8F4FD',
  color: '#007FFF',
  
  '& .MuiChip-deleteIcon': {
    color: '#007FFF',
  },
  
  '&:hover': {
    backgroundColor: '#D1E9FC',
  },
}));

const FilterDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: FILTER_DRAWER_WIDTH,
    padding: theme.spacing(3),
    backgroundColor: '#FFFFFF',
    borderLeft: '1px solid #E9ECEF',
  },
  
  [theme.breakpoints.down('md')]: {
    '& .MuiDrawer-paper': {
      width: '100%',
      maxWidth: 400,
    },
  },
}));

const FilterSection = styled(Accordion)(({ theme }) => ({
  boxShadow: 'none',
  border: '1px solid #E9ECEF',
  borderRadius: '8px !important',
  marginBottom: theme.spacing(2),
  
  '&:before': {
    display: 'none',
  },
  
  '& .MuiAccordionSummary-root': {
    backgroundColor: '#F8F9FA',
    borderRadius: '8px 8px 0 0',
    minHeight: 48,
    
    '&.Mui-expanded': {
      borderRadius: '8px 8px 0 0',
    },
  },
  
  '& .MuiAccordionDetails-root': {
    padding: theme.spacing(2),
  },
}));

const SavedSearchItem = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(1),
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  border: '1px solid #E9ECEF',
  
  '&:hover': {
    backgroundColor: '#F8F9FA',
    borderColor: '#007FFF',
  },
}));

// Helper functions
const formatFiltersAsChips = (filters: SearchFilters): Array<{ key: string; label: string; value: any }> => {
  const chips: Array<{ key: string; label: string; value: any }> = [];
  
  if (filters.location?.length) {
    filters.location.forEach(loc => {
      chips.push({ key: `location-${loc}`, label: `📍 ${loc}`, value: loc });
    });
  }
  
  if (filters.specialty?.length) {
    filters.specialty.forEach(spec => {
      chips.push({ key: `specialty-${spec}`, label: `🎭 ${spec}`, value: spec });
    });
  }
  
  if (filters.experience) {
    const [min, max] = filters.experience;
    chips.push({ 
      key: 'experience', 
      label: `📅 ${min}-${max} years`, 
      value: filters.experience 
    });
  }
  
  if (filters.rating && filters.rating > 0) {
    chips.push({ 
      key: 'rating', 
      label: `⭐ ${filters.rating}+ stars`, 
      value: filters.rating 
    });
  }
  
  return chips;
};

// Main Component
export const SearchInterface: React.FC<SearchInterfaceProps> = ({
  searchType,
  onSearch,
  onSaveSearch,
  results = [],
  savedSearches = [],
  loading = false,
  placeholder,
  className,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [saveSearchDialogOpen, setSaveSearchDialogOpen] = useState(false);

  const filterChips = useMemo(() => formatFiltersAsChips(filters), [filters]);

  const handleSearch = useCallback(() => {
    onSearch(query, filters);
  }, [query, filters, onSearch]);

  const handleFilterChange = useCallback((key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const handleRemoveFilter = useCallback((chipKey: string) => {
    const [filterType, filterValue] = chipKey.split('-');
    
    setFilters(prev => {
      const newFilters = { ...prev };
      
      if (filterType === 'location' && newFilters.location) {
        newFilters.location = newFilters.location.filter(loc => loc !== filterValue);
        if (newFilters.location.length === 0) delete newFilters.location;
      } else if (filterType === 'specialty' && newFilters.specialty) {
        newFilters.specialty = newFilters.specialty.filter(spec => spec !== filterValue);
        if (newFilters.specialty.length === 0) delete newFilters.specialty;
      } else if (filterType === 'experience') {
        delete newFilters.experience;
      } else if (filterType === 'rating') {
        delete newFilters.rating;
      }
      
      return newFilters;
    });
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setFilters({});
  }, []);

  const handleSavedSearchClick = useCallback((savedSearch: SavedSearch) => {
    setQuery(savedSearch.query);
    setFilters(savedSearch.filters);
    onSearch(savedSearch.query, savedSearch.filters);
  }, [onSearch]);

  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    
    switch (searchType) {
      case 'talent':
        return 'Search for actors, models, voice artists...';
      case 'casting-calls':
        return 'Search for casting opportunities...';
      default:
        return 'Search for talent or casting opportunities...';
    }
  };

  return (
    <Box className={className}>
      {/* Main Search Container */}
      <SearchContainer>
        {/* Search Bar */}
        <SearchBar
          fullWidth
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={getPlaceholder()}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={20} color="#6C757D" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Button
                  variant="contained"
                  onClick={handleSearch}
                  disabled={loading}
                  sx={{
                    backgroundColor: '#FFD700',
                    color: '#121212',
                    '&:hover': {
                      backgroundColor: '#E6C200',
                    },
                  }}
                >
                  Search
                </Button>
              </InputAdornment>
            ),
          }}
        />

        {/* Filter Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<Filter size={16} />}
            onClick={() => setFilterDrawerOpen(true)}
            sx={{
              color: '#007FFF',
              borderColor: '#007FFF',
            }}
          >
            Filters
          </Button>

          {savedSearches.length > 0 && (
            <Button
              variant="outlined"
              startIcon={<Bookmark size={16} />}
              sx={{
                color: '#6C757D',
                borderColor: '#6C757D',
              }}
            >
              Saved Searches
            </Button>
          )}

          {onSaveSearch && (
            <Button
              variant="text"
              size="small"
              onClick={() => setSaveSearchDialogOpen(true)}
              sx={{ color: '#6C757D' }}
            >
              Save Search
            </Button>
          )}
        </Box>

        {/* Active Filters */}
        {filterChips.length > 0 && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Active Filters:
              </Typography>
              <Button
                size="small"
                onClick={handleClearAllFilters}
                sx={{ color: '#DC3545', minWidth: 'auto', p: 0.5 }}
              >
                Clear All
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {filterChips.map((chip) => (
                <FilterChip
                  key={chip.key}
                  label={chip.label}
                  onDelete={() => handleRemoveFilter(chip.key)}
                  size="small"
                />
              ))}
            </Box>
          </Box>
        )}
      </SearchContainer>

      {/* Filter Drawer */}
      <FilterDrawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Search Filters
          </Typography>
          <IconButton onClick={() => setFilterDrawerOpen(false)}>
            <X size={20} />
          </IconButton>
        </Box>

        {/* Location Filter */}
        <FilterSection>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MapPin size={16} />
              <Typography>Location</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Autocomplete
              multiple
              options={LOCATIONS}
              value={filters.location || []}
              onChange={(_, value) => handleFilterChange('location', value)}
              renderInput={(params) => (
                <TextField {...params} placeholder="Select locations" size="small" />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option}
                    label={option}
                    size="small"
                  />
                ))
              }
            />
          </AccordionDetails>
        </FilterSection>

        {/* Specialty Filter */}
        {searchType !== 'casting-calls' && (
          <FilterSection>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Users size={16} />
                <Typography>Specialty</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Autocomplete
                multiple
                options={SPECIALTIES}
                value={filters.specialty || []}
                onChange={(_, value) => handleFilterChange('specialty', value)}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Select specialties" size="small" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option}
                      label={option}
                      size="small"
                    />
                  ))
                }
              />
            </AccordionDetails>
          </FilterSection>
        )}

        {/* Experience Filter */}
        {searchType !== 'casting-calls' && (
          <FilterSection>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Clock size={16} />
                <Typography>Experience</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography gutterBottom>Years of Experience</Typography>
              <Slider
                value={filters.experience || [0, 20]}
                onChange={(_, value) => handleFilterChange('experience', value as [number, number])}
                valueLabelDisplay="auto"
                min={0}
                max={20}
                marks={[
                  { value: 0, label: '0' },
                  { value: 5, label: '5' },
                  { value: 10, label: '10' },
                  { value: 15, label: '15' },
                  { value: 20, label: '20+' },
                ]}
              />
            </AccordionDetails>
          </FilterSection>
        )}

        {/* Rating Filter */}
        {searchType !== 'casting-calls' && (
          <FilterSection>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Star size={16} />
                <Typography>Minimum Rating</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Slider
                value={filters.rating || 0}
                onChange={(_, value) => handleFilterChange('rating', value as number)}
                valueLabelDisplay="auto"
                min={0}
                max={5}
                step={0.5}
                marks={[
                  { value: 0, label: 'Any' },
                  { value: 2.5, label: '2.5+' },
                  { value: 4, label: '4+' },
                  { value: 5, label: '5' },
                ]}
              />
            </AccordionDetails>
          </FilterSection>
        )}

        {/* Project Type Filter */}
        {searchType === 'casting-calls' && (
          <FilterSection>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Calendar size={16} />
                <Typography>Project Type</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <FormGroup>
                {PROJECT_TYPES.map((type) => (
                  <FormControlLabel
                    key={type}
                    control={
                      <Checkbox
                        checked={filters.projectType?.includes(type) || false}
                        onChange={(e) => {
                          const current = filters.projectType || [];
                          const updated = e.target.checked
                            ? [...current, type]
                            : current.filter(t => t !== type);
                          handleFilterChange('projectType', updated);
                        }}
                      />
                    }
                    label={type}
                  />
                ))}
              </FormGroup>
            </AccordionDetails>
          </FilterSection>
        )}

        {/* Apply Filters Button */}
        <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #E9ECEF' }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              handleSearch();
              setFilterDrawerOpen(false);
            }}
            sx={{
              backgroundColor: '#FFD700',
              color: '#121212',
              '&:hover': {
                backgroundColor: '#E6C200',
              },
            }}
          >
            Apply Filters
          </Button>
        </Box>
      </FilterDrawer>

      {/* Saved Searches (if any) */}
      {savedSearches.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Saved Searches
          </Typography>
          <Grid container spacing={2}>
            {savedSearches.slice(0, 3).map((savedSearch) => (
              <Grid item xs={12} sm={6} md={4} key={savedSearch.id}>
                <SavedSearchItem
                  onClick={() => handleSavedSearchClick(savedSearch)}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {savedSearch.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    "{savedSearch.query}"
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {savedSearch.createdAt.toLocaleDateString()}
                  </Typography>
                </SavedSearchItem>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default SearchInterface;
