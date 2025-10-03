import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  Divider,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  IconButton,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Shield,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

// Types
export interface AuthFormData {
  email: string;
  password: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  userType?: 'talent' | 'caster';
  nationalId?: string;
  agreeToTerms?: boolean;
}

interface AuthenticationFormProps {
  mode: 'login' | 'register' | 'forgot-password' | 'reset-password' | 'verify-email' | 'nafath';
  onSubmit: (data: AuthFormData) => Promise<void>;
  onModeChange?: (mode: 'login' | 'register' | 'forgot-password') => void;
  loading?: boolean;
  error?: string;
  success?: string;
  className?: string;
}

interface ValidationErrors {
  [key: string]: string;
}

// Styled Components
const AuthContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #121212 0%, #2C2C2C 100%)',
  padding: theme.spacing(2),
}));

const AuthCard = styled(Card)(({ theme }) => ({
  width: '100%',
  maxWidth: 480,
  borderRadius: '16px',
  boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
  overflow: 'hidden',
  background: '#FFFFFF',
}));

const AuthHeader = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #FFD700 0%, #007FFF 100%)',
  padding: theme.spacing(4),
  textAlign: 'center',
  color: '#FFFFFF',
}));

const AuthBody = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(4),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#007FFF',
    },
    
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#007FFF',
    },
  },
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  borderRadius: '8px',
  padding: theme.spacing(1.5),
  fontSize: '1rem',
  fontWeight: 600,
  textTransform: 'none',
  background: 'linear-gradient(135deg, #FFD700 0%, #007FFF 100%)',
  color: '#FFFFFF',
  
  '&:hover': {
    background: 'linear-gradient(135deg, #E6C200 0%, #0066CC 100%)',
  },
  
  '&:disabled': {
    background: '#E9ECEF',
    color: '#6C757D',
  },
}));

const NafathButton = styled(Button)(({ theme }) => ({
  borderRadius: '8px',
  padding: theme.spacing(1.5),
  fontSize: '1rem',
  fontWeight: 600,
  textTransform: 'none',
  backgroundColor: '#28A745',
  color: '#FFFFFF',
  
  '&:hover': {
    backgroundColor: '#218838',
  },
}));

// Validation functions
const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email is required';
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return null;
};

const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return 'Password must contain uppercase, lowercase, and number';
  }
  return null;
};

const validateNationalId = (nationalId: string): string | null => {
  if (!nationalId) return 'National ID is required';
  if (!/^\d{10}$/.test(nationalId)) return 'National ID must be 10 digits';
  return null;
};

// Helper Components
const PasswordStrengthIndicator: React.FC<{ password: string }> = ({ password }) => {
  const getStrength = (pwd: string): number => {
    let strength = 0;
    if (pwd.length >= 8) strength += 25;
    if (/[a-z]/.test(pwd)) strength += 25;
    if (/[A-Z]/.test(pwd)) strength += 25;
    if (/\d/.test(pwd)) strength += 25;
    return strength;
  };

  const strength = getStrength(password);
  const getColor = () => {
    if (strength < 50) return '#DC3545';
    if (strength < 75) return '#FFC107';
    return '#28A745';
  };

  if (!password) return null;

  return (
    <Box sx={{ mt: 1 }}>
      <LinearProgress
        variant="determinate"
        value={strength}
        sx={{
          height: 4,
          borderRadius: 2,
          backgroundColor: '#E9ECEF',
          '& .MuiLinearProgress-bar': {
            backgroundColor: getColor(),
          },
        }}
      />
      <Typography variant="caption" color={getColor()}>
        Password strength: {strength < 50 ? 'Weak' : strength < 75 ? 'Medium' : 'Strong'}
      </Typography>
    </Box>
  );
};

// Main Component
export const AuthenticationForm: React.FC<AuthenticationFormProps> = ({
  mode,
  onSubmit,
  onModeChange,
  loading = false,
  error,
  success,
  className,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    userType: 'talent',
    nationalId: '',
    agreeToTerms: false,
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [currentStep, setCurrentStep] = useState(0);

  const isRegisterMode = mode === 'register';
  const isNafathMode = mode === 'nafath';
  const steps = isRegisterMode ? ['Account Info', 'Personal Details', 'Verification'] : [];

  const handleInputChange = (field: keyof AuthFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any
  ) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    // Email validation
    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;
    
    // Password validation
    if (mode !== 'forgot-password') {
      const passwordError = validatePassword(formData.password);
      if (passwordError) errors.password = passwordError;
    }
    
    // Confirm password validation (register mode)
    if (isRegisterMode && formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    // Required fields for registration
    if (isRegisterMode) {
      if (!formData.firstName) errors.firstName = 'First name is required';
      if (!formData.lastName) errors.lastName = 'Last name is required';
      if (!formData.phone) errors.phone = 'Phone number is required';
      if (!formData.agreeToTerms) errors.agreeToTerms = 'You must agree to the terms';
    }
    
    // National ID validation for Nafath
    if (isNafathMode) {
      const nationalIdError = validateNationalId(formData.nationalId || '');
      if (nationalIdError) errors.nationalId = nationalIdError;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await onSubmit(formData);
    } catch (err) {
      // Error handling is done by parent component
    }
  };

  const handleNextStep = () => {
    if (currentStep === 0) {
      // Validate basic info
      const errors: ValidationErrors = {};
      const emailError = validateEmail(formData.email);
      if (emailError) errors.email = emailError;
      const passwordError = validatePassword(formData.password);
      if (passwordError) errors.password = passwordError;
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
      
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }
    }
    
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const getTitle = () => {
    switch (mode) {
      case 'login': return 'Welcome Back';
      case 'register': return 'Join TakeOne';
      case 'forgot-password': return 'Reset Password';
      case 'reset-password': return 'New Password';
      case 'verify-email': return 'Verify Email';
      case 'nafath': return 'Nafath Verification';
      default: return 'Authentication';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'login': return 'Sign in to your account';
      case 'register': return 'Create your casting profile';
      case 'forgot-password': return 'Enter your email to reset password';
      case 'reset-password': return 'Enter your new password';
      case 'verify-email': return 'Check your email for verification link';
      case 'nafath': return 'Verify your Saudi identity';
      default: return '';
    }
  };

  const renderStepContent = () => {
    if (!isRegisterMode) return renderFormFields();
    
    switch (currentStep) {
      case 0:
        return (
          <>
            <StyledTextField
              fullWidth
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              error={!!validationErrors.email}
              helperText={validationErrors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Mail size={20} />
                  </InputAdornment>
                ),
              }}
            />
            
            <StyledTextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange('password')}
              error={!!validationErrors.password}
              helperText={validationErrors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock size={20} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <PasswordStrengthIndicator password={formData.password} />
            
            <StyledTextField
              fullWidth
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleInputChange('confirmPassword')}
              error={!!validationErrors.confirmPassword}
              helperText={validationErrors.confirmPassword}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock size={20} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </>
        );
        
      case 1:
        return (
          <>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <StyledTextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={handleInputChange('firstName')}
                error={!!validationErrors.firstName}
                helperText={validationErrors.firstName}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <User size={20} />
                    </InputAdornment>
                  ),
                }}
              />
              
              <StyledTextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={handleInputChange('lastName')}
                error={!!validationErrors.lastName}
                helperText={validationErrors.lastName}
              />
            </Box>
            
            <StyledTextField
              fullWidth
              label="Phone Number"
              value={formData.phone}
              onChange={handleInputChange('phone')}
              error={!!validationErrors.phone}
              helperText={validationErrors.phone}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone size={20} />
                  </InputAdornment>
                ),
              }}
            />
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>I am a...</InputLabel>
              <Select
                value={formData.userType}
                onChange={handleInputChange('userType')}
                label="I am a..."
              >
                <MenuItem value="talent">Talent (Actor, Model, etc.)</MenuItem>
                <MenuItem value="caster">Casting Director/Producer</MenuItem>
              </Select>
            </FormControl>
          </>
        );
        
      case 2:
        return (
          <>
            <Alert severity="info" sx={{ mb: 3 }}>
              To ensure trust and safety, we require identity verification for all users.
            </Alert>
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange('agreeToTerms')}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2">
                  I agree to the{' '}
                  <Link href="/terms" target="_blank">Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="/privacy" target="_blank">Privacy Policy</Link>
                </Typography>
              }
            />
            
            {validationErrors.agreeToTerms && (
              <Typography variant="caption" color="error">
                {validationErrors.agreeToTerms}
              </Typography>
            )}
          </>
        );
        
      default:
        return null;
    }
  };

  const renderFormFields = () => {
    switch (mode) {
      case 'login':
        return (
          <>
            <StyledTextField
              fullWidth
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              error={!!validationErrors.email}
              helperText={validationErrors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Mail size={20} />
                  </InputAdornment>
                ),
              }}
            />
            
            <StyledTextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange('password')}
              error={!!validationErrors.password}
              helperText={validationErrors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock size={20} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </>
        );
        
      case 'forgot-password':
        return (
          <StyledTextField
            fullWidth
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            error={!!validationErrors.email}
            helperText={validationErrors.email}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Mail size={20} />
                </InputAdornment>
              ),
            }}
          />
        );
        
      case 'nafath':
        return (
          <>
            <Alert severity="info" sx={{ mb: 3 }}>
              Enter your Saudi National ID to verify your identity through Nafath.
            </Alert>
            
            <StyledTextField
              fullWidth
              label="National ID"
              value={formData.nationalId}
              onChange={handleInputChange('nationalId')}
              error={!!validationErrors.nationalId}
              helperText={validationErrors.nationalId}
              placeholder="1234567890"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Shield size={20} />
                  </InputAdornment>
                ),
              }}
            />
          </>
        );
        
      default:
        return null;
    }
  };

  return (
    <AuthContainer className={className}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <AuthCard>
          <AuthHeader>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                fontFamily: 'Amiri, Times New Roman, serif',
                mb: 1,
              }}
            >
              {getTitle()}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              {getSubtitle()}
            </Typography>
          </AuthHeader>

          <AuthBody>
            {/* Stepper for registration */}
            {isRegisterMode && (
              <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            )}

            {/* Error/Success Messages */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                </motion.div>
              )}
              
              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Alert severity="success" sx={{ mb: 3 }}>
                    {success}
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit}>
              {renderStepContent()}

              {/* Action Buttons */}
              <Box sx={{ mt: 3 }}>
                {isRegisterMode ? (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    {currentStep > 0 && (
                      <Button
                        onClick={handlePrevStep}
                        startIcon={<ArrowLeft size={16} />}
                        disabled={loading}
                      >
                        Back
                      </Button>
                    )}
                    
                    <Box sx={{ ml: 'auto' }}>
                      {currentStep < steps.length - 1 ? (
                        <Button
                          onClick={handleNextStep}
                          endIcon={<ArrowRight size={16} />}
                          variant="contained"
                          disabled={loading}
                        >
                          Next
                        </Button>
                      ) : (
                        <SubmitButton
                          type="submit"
                          fullWidth
                          disabled={loading}
                          startIcon={loading ? undefined : <CheckCircle size={16} />}
                        >
                          {loading ? 'Creating Account...' : 'Create Account'}
                        </SubmitButton>
                      )}
                    </Box>
                  </Box>
                ) : isNafathMode ? (
                  <NafathButton
                    type="submit"
                    fullWidth
                    disabled={loading}
                    startIcon={<Shield size={16} />}
                  >
                    {loading ? 'Verifying...' : 'Verify with Nafath'}
                  </NafathButton>
                ) : (
                  <SubmitButton
                    type="submit"
                    fullWidth
                    disabled={loading}
                  >
                    {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Send Reset Link'}
                  </SubmitButton>
                )}
              </Box>

              {/* Footer Links */}
              {!isRegisterMode && !isNafathMode && (
                <>
                  <Divider sx={{ my: 3 }} />
                  
                  <Box sx={{ textAlign: 'center' }}>
                    {mode === 'login' ? (
                      <>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <Link
                            component="button"
                            type="button"
                            onClick={() => onModeChange?.('forgot-password')}
                            sx={{ textDecoration: 'none' }}
                          >
                            Forgot your password?
                          </Link>
                        </Typography>
                        <Typography variant="body2">
                          Don't have an account?{' '}
                          <Link
                            component="button"
                            type="button"
                            onClick={() => onModeChange?.('register')}
                            sx={{ textDecoration: 'none', fontWeight: 600 }}
                          >
                            Sign up
                          </Link>
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="body2">
                        Remember your password?{' '}
                        <Link
                          component="button"
                          type="button"
                          onClick={() => onModeChange?.('login')}
                          sx={{ textDecoration: 'none', fontWeight: 600 }}
                        >
                          Sign in
                        </Link>
                      </Typography>
                    )}
                  </Box>
                </>
              )}
              
              {isRegisterMode && currentStep === 0 && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2">
                      Already have an account?{' '}
                      <Link
                        component="button"
                        type="button"
                        onClick={() => onModeChange?.('login')}
                        sx={{ textDecoration: 'none', fontWeight: 600 }}
                      >
                        Sign in
                      </Link>
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
          </AuthBody>
        </AuthCard>
      </motion.div>
    </AuthContainer>
  );
};

export default AuthenticationForm;
