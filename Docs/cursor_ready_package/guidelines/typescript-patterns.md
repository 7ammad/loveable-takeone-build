# TypeScript Patterns & Guidelines
## TakeOne Development Standards

**Version 2.0** | **Production Ready** | **Type-Safe Development**

---

## 🎯 **Core TypeScript Patterns**

### **1. Interface Definitions**

#### **User & Authentication Types**
```typescript
// types/auth.ts
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string; // Computed: firstName + lastName
  arabicName?: string;
  phone: string;
  role: UserRole;
  verificationStatus: VerificationStatus;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'talent' | 'caster' | 'admin';
export type VerificationStatus = 'verified' | 'pending' | 'expired' | 'rejected';

export interface AuthFormData {
  email: string;
  password: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  userType?: UserRole;
  nationalId?: string;
  agreeToTerms?: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresAt: Date;
}
```

#### **Talent & Casting Types**
```typescript
// types/talent.ts
export interface TalentUser extends User {
  role: 'talent';
  specialty: Specialty[];
  skills: Skill[];
  experience: Experience[];
  physicalAttributes: PhysicalAttributes;
  availability: AvailabilityStatus;
  rating: number;
  reviewCount: number;
  profileCompletion: number;
  portfolio: MediaAsset[];
  yearsExperience?: number;
  projectsCompleted?: number;
  successRate?: number;
}

export type Specialty = 
  | 'Actor' | 'Actress' | 'Voice Actor' | 'Stunt Performer' 
  | 'Dancer' | 'Singer' | 'Model' | 'Extra' | 'Stand-in' | 'Body Double';

export type AvailabilityStatus = 'available' | 'busy' | 'unavailable';

export interface PhysicalAttributes {
  height?: number; // in cm
  weight?: number; // in kg
  eyeColor?: string;
  hairColor?: string;
  ethnicity?: string;
  languages: Language[];
}

export interface Language {
  code: string; // ISO 639-1
  name: string;
  proficiency: 'native' | 'fluent' | 'conversational' | 'basic';
}
```

```typescript
// types/casting.ts
export interface CastingCall {
  id: string;
  title: string;
  description: string;
  company: Company;
  location: string;
  projectType: ProjectType;
  requirements: CastingRequirement[];
  compensation?: CompensationRange;
  shootDates?: DateRange;
  applicationDeadline?: Date;
  status: CastingStatus;
  source: ContentSource;
  confidence?: number; // For AI-extracted content
  isVerified: boolean;
  applicationsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ProjectType = 
  | 'Film' | 'TV Series' | 'Commercial' | 'Music Video'
  | 'Documentary' | 'Short Film' | 'Theater' | 'Web Series';

export type CastingStatus = 'draft' | 'active' | 'closed' | 'cancelled';
export type ContentSource = 'native' | 'external';

export interface CastingRequirement {
  type: RequirementType;
  value: string;
  required: boolean;
}

export type RequirementType = 
  | 'age_range' | 'gender' | 'height' | 'weight' | 'language'
  | 'skill' | 'experience' | 'location' | 'availability';

export interface CompensationRange {
  min: number;
  max: number;
  currency: 'SAR' | 'USD';
  type: 'hourly' | 'daily' | 'project' | 'monthly';
}

export interface DateRange {
  start: Date;
  end: Date;
}
```

#### **Application & Workflow Types**
```typescript
// types/application.ts
export interface Application {
  id: string;
  talentId: string;
  castingCallId: string;
  status: ApplicationStatus;
  submittedAt: Date;
  materials: ApplicationMaterial[];
  coverLetter?: string;
  customResponses: CustomResponse[];
  feedback?: ApplicationFeedback;
  updatedAt: Date;
}

export type ApplicationStatus = 
  | 'submitted' | 'under_review' | 'shortlisted' 
  | 'rejected' | 'accepted' | 'withdrawn';

export interface ApplicationMaterial {
  id: string;
  type: MaterialType;
  mediaAssetId: string;
  title: string;
  description?: string;
}

export type MaterialType = 
  | 'headshot' | 'resume' | 'demo_reel' | 'voice_sample'
  | 'portfolio_image' | 'video_audition' | 'document';

export interface CustomResponse {
  questionId: string;
  question: string;
  response: string;
  type: 'text' | 'number' | 'boolean' | 'file';
}

export interface ApplicationFeedback {
  rating?: number;
  comments?: string;
  providedBy: string;
  providedAt: Date;
}
```

### **2. Component Props Patterns**

#### **Generic Component Props**
```typescript
// types/components.ts
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  'data-testid'?: string;
}

export interface LoadingProps {
  loading?: boolean;
  loadingText?: string;
}

export interface ErrorProps {
  error?: string | Error | null;
  onRetry?: () => void;
}

export interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

// Combine for common patterns
export interface DataComponentProps<T> extends BaseComponentProps, LoadingProps, ErrorProps {
  data: T[];
  onRefresh?: () => void;
}
```

#### **Form Component Props**
```typescript
// types/forms.ts
export interface FormFieldProps<T = any> extends BaseComponentProps {
  name: string;
  label: string;
  value: T;
  onChange: (value: T) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  helperText?: string;
}

export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
  group?: string;
}

export interface SelectFieldProps<T = string> extends FormFieldProps<T> {
  options: SelectOption<T>[];
  multiple?: boolean;
  searchable?: boolean;
}

export interface FileUploadProps extends BaseComponentProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  onUpload: (files: File[]) => Promise<void>;
  onError?: (error: string) => void;
  loading?: boolean;
}
```

### **3. API Response Patterns**

#### **Standard API Response Types**
```typescript
// types/api.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  field?: string; // For validation errors
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface SearchResponse<T> extends PaginatedResponse<T> {
  query: string;
  filters: Record<string, any>;
  executionTime: number; // in ms
  suggestions?: string[];
}
```

#### **API Client Patterns**
```typescript
// lib/api-client.ts
export class ApiClient {
  private baseUrl: string;
  private token?: string;

  constructor(baseUrl: string, token?: string) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data: ApiResponse<T> = await response.json();

      if (!response.ok) {
        throw new ApiError(data.error?.message || 'Request failed', data.error?.code);
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Network error', 'NETWORK_ERROR');
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await this.request<T>(endpoint);
    return response.data!;
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data!;
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    const response = await this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data!;
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await this.request<T>(endpoint, {
      method: 'DELETE',
    });
    return response.data!;
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public field?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
```

### **4. Hook Patterns**

#### **Data Fetching Hooks**
```typescript
// hooks/useApi.ts
import { useState, useEffect } from 'react';
import { ApiClient, ApiError } from '@/lib/api-client';

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useApi<T>(
  endpoint: string,
  dependencies: any[] = []
): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiClient = new ApiClient('/api');
      const result = await apiClient.get<T>(endpoint);
      setData(result);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

// Usage example
const { data: castingCalls, loading, error, refetch } = useApi<CastingCall[]>('/casting-calls');
```

#### **Form Hooks**
```typescript
// hooks/useForm.ts
import { useState, useCallback } from 'react';

export interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => Record<keyof T, string>;
  onSubmit: (values: T) => Promise<void>;
}

export interface UseFormReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  loading: boolean;
  setValue: (field: keyof T, value: any) => void;
  setError: (field: keyof T, error: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  reset: () => void;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [loading, setLoading] = useState(false);

  const setValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const setError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    if (validate) {
      const validationErrors = validate(values);
      const hasErrors = Object.values(validationErrors).some(error => error);
      
      if (hasErrors) {
        setErrors(validationErrors);
        return;
      }
    }

    try {
      setLoading(true);
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  }, [values, validate, onSubmit]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setLoading(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    loading,
    setValue,
    setError,
    handleSubmit,
    reset,
  };
}

// Usage example
const form = useForm<AuthFormData>({
  initialValues: {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  },
  validate: (values) => {
    const errors: Partial<Record<keyof AuthFormData, string>> = {};
    
    if (!values.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!values.password) {
      errors.password = 'Password is required';
    } else if (values.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    return errors;
  },
  onSubmit: async (values) => {
    await registerUser(values);
  },
});
```

### **5. Utility Type Patterns**

#### **Common Utility Types**
```typescript
// types/utils.ts

// Make specific fields optional
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Make specific fields required
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Extract function parameters
export type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;

// Extract function return type
export type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;

// Create a type with all properties optional except specified ones
export type OptionalExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

// Create a type that excludes null and undefined
export type NonNullable<T> = T extends null | undefined ? never : T;

// Create a union of all property names of type T that are of type U
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

// Usage examples
type CreateCastingCallData = PartialBy<CastingCall, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateUserData = RequiredBy<Partial<User>, 'id'>;
type UserEmailKeys = KeysOfType<User, string>; // 'email' | 'firstName' | 'lastName' | etc.
```

#### **Component Prop Utilities**
```typescript
// types/component-utils.ts

// Extract props from a component
export type ComponentProps<T> = T extends React.ComponentType<infer P> ? P : never;

// Make component props polymorphic
export type PolymorphicComponentProps<T extends React.ElementType, P = {}> = P & 
  Omit<React.ComponentPropsWithoutRef<T>, keyof P> & {
    as?: T;
  };

// Create variant props
export type VariantProps<T extends Record<string, any>> = {
  [K in keyof T]?: keyof T[K];
};

// Usage example
interface ButtonVariants {
  size: {
    small: string;
    medium: string;
    large: string;
  };
  variant: {
    primary: string;
    secondary: string;
    outline: string;
  };
}

type ButtonProps = VariantProps<ButtonVariants> & {
  children: React.ReactNode;
  onClick?: () => void;
};
```

### **6. Error Handling Patterns**

#### **Error Boundary Types**
```typescript
// components/ErrorBoundary.tsx
import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} retry={this.retry} />;
      }

      return (
        <div>
          <h2>Something went wrong.</h2>
          <button onClick={this.retry}>Try again</button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

#### **Result Type Pattern**
```typescript
// types/result.ts
export type Result<T, E = Error> = Success<T> | Failure<E>;

export interface Success<T> {
  success: true;
  data: T;
}

export interface Failure<E> {
  success: false;
  error: E;
}

export const success = <T>(data: T): Success<T> => ({
  success: true,
  data,
});

export const failure = <E>(error: E): Failure<E> => ({
  success: false,
  error,
});

// Usage in API functions
export async function fetchUser(id: string): Promise<Result<User, ApiError>> {
  try {
    const user = await apiClient.get<User>(`/users/${id}`);
    return success(user);
  } catch (error) {
    if (error instanceof ApiError) {
      return failure(error);
    }
    return failure(new ApiError('Unknown error', 'UNKNOWN'));
  }
}

// Usage in components
const handleFetchUser = async (id: string) => {
  const result = await fetchUser(id);
  
  if (result.success) {
    setUser(result.data);
  } else {
    setError(result.error.message);
  }
};
```

### **7. Testing Types**

#### **Test Utilities**
```typescript
// test-utils/types.ts
export interface MockUser extends Partial<User> {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface TestComponentProps<T = {}> {
  props?: T;
  user?: MockUser;
  initialRoute?: string;
}

export type MockFunction<T extends (...args: any[]) => any> = jest.MockedFunction<T>;

// Mock factory functions
export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: 'test-user-id',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  name: 'Test User',
  phone: '+966501234567',
  role: 'talent',
  verificationStatus: 'verified',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockCastingCall = (overrides: Partial<CastingCall> = {}): CastingCall => ({
  id: 'test-casting-id',
  title: 'Test Casting Call',
  description: 'Test description',
  company: {
    id: 'test-company',
    name: 'Test Company',
    verified: true,
  },
  location: 'Riyadh',
  projectType: 'Film',
  requirements: [],
  status: 'active',
  source: 'native',
  isVerified: true,
  applicationsCount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});
```

---

## 🎯 **Best Practices**

### **1. Type Safety Guidelines**
- Always use strict TypeScript configuration
- Prefer interfaces over types for object shapes
- Use union types for controlled values
- Avoid `any` - use `unknown` when type is truly unknown
- Use type guards for runtime type checking

### **2. Component Patterns**
- Define props interfaces for all components
- Use generic components when appropriate
- Implement proper error boundaries
- Use discriminated unions for variant props

### **3. API Integration**
- Always type API responses
- Use Result types for error handling
- Implement proper loading states
- Handle network errors gracefully

### **4. Performance Considerations**
- Use React.memo for expensive components
- Implement proper dependency arrays in hooks
- Use callback hooks to prevent unnecessary re-renders
- Type your custom hooks properly

---

**These TypeScript patterns ensure type safety, maintainability, and developer experience throughout the TakeOne platform development.**
