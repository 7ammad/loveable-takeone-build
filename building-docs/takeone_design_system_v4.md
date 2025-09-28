# **🎨 TakeOne Marketplace \- Editorial Tech Design System v2.0**

## **📋 Design System Overview**

### **Core Principles**

This design system is built on the philosophy that **the typography is the art; the layout is the science.** It is adapted for the Saudi entertainment industry marketplace with considerations for:

* **Bilingual Support:** RTL/LTR seamless transitions.  
* **Confident Minimalism:** The UI is clean and structured, allowing content to be the main focus.  
* **Accessibility:** WCAG 2.1 AA compliance is a baseline requirement.  
* **Performance:** Optimized for speed and responsiveness.

## **🎨 Color System**

The palette is high-contrast and primarily monochromatic. This creates a professional, focused canvas that allows a single, confident accent color to provide energy and guide the user.

### **Primary Palette**

// Brand Color  
$accent-cobalt: \#0047FF;        // Main brand color (confident, dynamic, professional)  
$accent-cobalt-light: \#4D7BFF;  // Hover states, accents  
$accent-cobalt-dark: \#002CB3;   // Active states, emphasis

### **Semantic Colors**

$success: \#22C55E;  
$warning: \#F59E0B;  
$error: \#EF4444;  
$info: \#3B82F6;

### **Neutral Palette (Dark Theme)**

$neutral-1000: \#121212; // Surface (Off-Black)  
$neutral-900: \#1F1F1F;  // UI Element Hover  
$neutral-800: \#282828;  // Borders  
$neutral-700: \#B3B3B3;  // Text Secondary  
$neutral-100: \#FFFFFF;  // Text Primary

### **Elevation & Depth**

Our "Editorial Tech" style uses a flat design approach. Depth is created through border styles and contrast, not traditional shadows. Shadows are set to none.

$shadow-2: none;  
$shadow-4: none;  
$shadow-8: none;  
$shadow-16: none;  
$shadow-28: none;  
$shadow-64: none;

## **✍️ Typography System**

### **Font Families**

// Primary Font Stack (Expressive Headlines)  
$font-primary: 'Tajawal', 'Helvetica Neue', sans-serif;  
// Secondary Font Stack (Clean UI Text)  
$font-secondary: 'Inter', 'Noto Sans Arabic', sans-serif;  
$font-mono: 'JetBrains Mono', 'Courier New', monospace;

### **Type Scale (Editorial Tech Standard)**

| Element | Size (Desktop / Mobile) | Line Height | Letter Spacing |
| :---- | :---- | :---- | :---- |
| **H1 (Display)** | 96px / 48px | 1.1 | \-2px |
| **H2 (Headline)** | 60px / 36px | 1.2 | \-1px |
| **H3 (Sub-Head)** | 36px / 24px | 1.3 | Normal |
| **Body** | 16px / 16px | 1.5 | Normal |
| **Subtle** | 14px / 14px | 1.5 | \+0.5px |
| **Caption** | 12px / 12px | 1.5 | \+0.5px |

### **Font Weights**

$weight-regular: 400;  
$weight-medium: 500;  
$weight-semibold: 600;  
$weight-bold: 700;

## **🔲 Grid & Layout System**

### **Responsive Breakpoints**

$breakpoint-xs: 320px;   // Mobile portrait  
$breakpoint-sm: 480px;   // Mobile landscape  
$breakpoint-md: 768px;   // Tablet  
$breakpoint-lg: 1024px;  // Desktop  
$breakpoint-xl: 1366px;  // Wide desktop  
$breakpoint-xxl: 1920px; // Ultra-wide

### **Grid System**

A 12-column grid provides order and predictability.

.container {  
  \--columns: 12;  
  \--gutter: 24px;  
  \--margin: 24px;  
    
  @media (min-width: $breakpoint-lg) {  
    \--margin: 48px;  
    \--gutter: 32px;  
  }  
}

### **Spacing System (8px Base)**

$space-1: 4px;  
$space-2: 8px;    // Base unit  
$space-3: 12px;  
$space-4: 16px;  
$space-5: 24px;  
$space-6: 32px;  
$space-7: 48px;  
$space-8: 64px;

## **🧩 Component Library**

### **1\. Button System**

// Primary Button  
.tds-button-primary {  
  background: $accent-cobalt;  
  color: $neutral-100;  
  padding: 10px 20px;  
  border-radius: 6px;  
  font-weight: $weight-semibold;  
  transition: all 150ms ease-in-out;  
    
  &:hover {  
    background: $accent-cobalt-light;  
  }  
    
  &:active {  
    background: $accent-cobalt-dark;  
  }  
}

**Variants:** Primary (main CTAs), Secondary (secondary actions), Subtle (tertiary actions).

### **2\. Card Components**

.tds-card {  
  background: $neutral-1000;  
  border: 1px solid $neutral-800;  
  border-radius: 8px;  
  padding: $space-5;  
  transition: all 150ms ease-in-out;  
    
  &:hover {  
    border-color: $accent-cobalt;  
  }  
}

### **3\. Form Controls**

// Text Input  
.tds-input {  
  border: 1px solid $neutral-800;  
  border-radius: 6px;  
  padding: 8px 12px;  
  font-size: 16px; // Body size  
  background: $neutral-1000;  
  color: $neutral-100;  
  transition: all 150ms ease-in-out;  
    
  &:hover {  
    border-color: $neutral-700;  
  }  
    
  &:focus {  
    border-color: $accent-cobalt;  
    outline: 2px solid rgba($accent-cobalt, 0.3);  
    outline-offset: 2px;  
  }  
    
  &.error {  
    border-color: $error;  
  }  
}

### **4\. Navigation Components**

// Top Navigation Bar  
.nav-bar {  
  height: 64px;  
  background: $neutral-1000;  
  border-bottom: 1px solid $neutral-800;  
  padding: 0 $space-6;  
    
  .nav-item.active {  
    border-bottom: 2px solid $accent-cobalt;  
    color: $accent-cobalt;  
  }  
}

### **5\. Modal/Dialog System**

.tds-dialog {  
  background: $neutral-1000;  
  border: 1px solid $neutral-800;  
  border-radius: 8px;  
  max-width: 600px;  
}

### **6\. Data Tables**

.tds-table {  
  width: 100%;  
  border-collapse: separate;  
  border-spacing: 0;  
    
  thead th {  
    background: $neutral-900;  
    border-bottom: 1px solid $neutral-800;  
  }  
    
  tbody tr:hover {  
    background: $neutral-900;  
  }  
    
  tbody td {  
    border-bottom: 1px solid $neutral-800;  
  }  
}

## **🎭 Industry-Specific Components**

### **1\. Talent Profile Card**

A clean card structure focusing on the talent's image and key info.

.talent-profile-card {  
  background: $neutral-1000;  
  border: 1px solid $neutral-800;  
  border-radius: 8px;  
}

### **2\. Casting Call Card**

Uses a border accent to signify importance.

.casting-call-card {  
  background: $neutral-1000;  
  border-left: 4px solid $accent-cobalt;  
  border-radius: 8px;  
}

### **3\. Media Gallery Component**

A clean grid for displaying media.

.media-gallery .media-item {  
  border-radius: 8px;  
  overflow: hidden;  
  background: $neutral-900;  
}

## **🌍 RTL/Bilingual Support**

### **RTL Utilities**

Logical properties are used for direction-aware spacing.

.ms-auto { margin-inline-start: auto; }  
.ps-4 { padding-inline-start: $space-4; }

## **🎬 Animation & Motion**

### **Motion Principles**

* **Timing:** 150ms (fast), 250ms (normal)  
* **Easing:** cubic-bezier(0.4, 0, 0.2, 1\) (Standard, crisp)

## **📱 Mobile-First Responsive Design**

### **Touch Targets**

* Minimum touch target size is 48x48px for all interactive elements.

## **🎯 State Management & Feedback**

### **Loading States**

.skeleton {  
  background: linear-gradient(  
    90deg,  
    $neutral-900 25%,  
    $neutral-800 50%,  
    $neutral-900 75%  
  );  
  background-size: 200% 100%;  
  animation: loading 1.5s infinite linear;  
}

### **Toast Notifications**

.toast {  
  background: $neutral-900;  
  color: $neutral-100;  
  padding: $space-4 $space-5;  
  border-radius: 6px;  
  border: 1px solid $neutral-800;  
}

## **🔍 Accessibility Guidelines**

### **Focus Management**

:focus-visible {  
  outline: 2px solid $accent-cobalt;  
  outline-offset: 2px;  
  border-radius: 4px;  
}

## **🚀 Implementation Guidelines**

### **Theming System**

// CSS Variables for runtime theming  
:root {  
  \--color-accent: \#{$accent-cobalt};  
  \--color-surface: \#{$neutral-1000};  
  \--color-text: \#{$neutral-100};  
  \--radius-medium: 6px;  
}

## **📦 Design Tokens Export**

{  
  "colors": {  
    "accent": "\#0047FF",  
    "surface": "\#121212",  
    "textPrimary": "\#FFFFFF",  
    "textSecondary": "\#B3B3B3",  
    "border": "\#282828"  
  },  
  "spacing": {  
    "sm": "8px",  
    "md": "16px",  
    "lg": "24px"  
  },  
  "typography": {  
    "fontFamily": {  
      "primary": "'Tajawal', sans-serif",  
      "secondary": "'Inter', sans-serif"  
    },  
    "fontSize": {  
      "display": "96px",  
      "headline": "60px",  
      "body": "16px"  
    }  
  },  
  "styles": {  
    "cornerRadius": "6px"  
  }  
}

## **🎨 Figma/Design Tool Setup**

The Figma file should be organized with the following structure:

* 📁 01 \- Foundations  
* 📁 02 \- Components  
* 📁 03 \- Patterns  
* 📁 04 \- Pages