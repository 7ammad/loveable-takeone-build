import type { Preview } from '@storybook/react'
import React from 'react'
import '../styles/takeone-design-system.css'
import '../app/globals.css'

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#FAFAFC',
        },
        {
          name: 'dark',
          value: '#0F172A',
        },
      ],
    },
    docs: {
      toc: true,
    },
  },
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: ['light', 'dark'],
        dynamicTitle: true,
      },
    },
    language: {
      description: 'Language for bilingual components',
      defaultValue: 'ar',
      toolbar: {
        title: 'Language',
        icon: 'globe',
        items: [
          { value: 'ar', title: 'العربية', right: '🇸🇦' },
          { value: 'en', title: 'English', right: '🇺🇸' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const { theme, language } = context.globals
      
      // Apply theme to document
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', theme)
        document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr')
        document.documentElement.setAttribute('lang', language)
      }
      
      return React.createElement(
        'div',
        {
          'data-theme': theme,
          dir: language === 'ar' ? 'rtl' : 'ltr',
          lang: language,
          style: {
            fontFamily: "'Sjada', 'Noto Sans Arabic', 'Inter', system-ui, sans-serif",
            backgroundColor: 'var(--md-surface)',
            color: 'var(--md-on-surface)',
            minHeight: '100vh',
            padding: '1rem',
          },
        },
        React.createElement(Story)
      )
    },
  ],
}

export default preview