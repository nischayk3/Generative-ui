import { LayoutPattern } from '../LayoutEngine';

// Dashboard Layout Patterns
export const dashboardPatterns: Record<string, LayoutPattern> = {
  executive: {
    name: 'Executive Dashboard',
    description: 'High-level metrics with key performance indicators',
    gridTemplate: `
      "kpis kpis charts"
      "kpis kpis charts"
      "table table table"
    `,
    componentMapping: {
      card: 'kpis',
      chart: 'charts',
      table: 'table',
    },
    breakpoints: {
      mobile: `
        "kpis"
        "charts"
        "table"
      `,
    },
    spacing: 'gap-6 p-6',
    containerClasses: 'grid min-h-screen bg-gray-50',
  },

  analytics: {
    name: 'Analytics Dashboard',
    description: 'Data visualization focused layout',
    gridTemplate: `
      "header header header"
      "chart1 chart2 chart3"
      "table table table"
    `,
    componentMapping: {
      card: 'header',
      chart: 'chart1',
      table: 'table',
    },
    breakpoints: {
      mobile: `
        "header"
        "chart1"
        "chart2"
        "chart3"
        "table"
      `,
    },
    spacing: 'gap-4 p-4',
    containerClasses: 'grid grid-cols-1 lg:grid-cols-3 min-h-screen',
  },

  operational: {
    name: 'Operational Dashboard',
    description: 'Real-time monitoring and operations view',
    gridTemplate: `
      "alerts alerts alerts"
      "metrics metrics metrics"
      "sidebar main main"
    `,
    componentMapping: {
      alert: 'alerts',
      card: 'metrics',
      table: 'main',
      form: 'sidebar',
    },
    breakpoints: {
      mobile: `
        "alerts"
        "metrics"
        "main"
        "sidebar"
      `,
    },
    spacing: 'gap-4 p-6',
    containerClasses: 'grid min-h-screen bg-gray-100',
  },
};

// Form Layout Patterns
export const formPatterns: Record<string, LayoutPattern> = {
  wizard: {
    name: 'Form Wizard',
    description: 'Multi-step form with progress indicators',
    gridTemplate: `
      "progress progress"
      "form form"
      "actions actions"
    `,
    componentMapping: {
      progress: 'progress',
      form: 'form',
      button: 'actions',
    },
    breakpoints: {},
    spacing: 'gap-6 p-6',
    containerClasses: 'grid max-w-4xl mx-auto min-h-screen',
  },

  registration: {
    name: 'Registration Form',
    description: 'User registration with validation',
    gridTemplate: `
      "header header"
      "form sidebar"
      "actions actions"
    `,
    componentMapping: {
      card: 'header',
      form: 'form',
      alert: 'sidebar',
      button: 'actions',
    },
    breakpoints: {
      mobile: `
        "header"
        "form"
        "sidebar"
        "actions"
      `,
    },
    spacing: 'gap-4 p-6',
    containerClasses: 'grid grid-cols-1 lg:grid-cols-2 max-w-6xl mx-auto',
  },
};

// Data Layout Patterns
export const dataPatterns: Record<string, LayoutPattern> = {
  dataExplorer: {
    name: 'Data Explorer',
    description: 'Advanced data exploration interface',
    gridTemplate: `
      "filters filters filters"
      "table table sidebar"
      "pagination pagination sidebar"
    `,
    componentMapping: {
      form: 'filters',
      table: 'table',
      card: 'sidebar',
      button: 'pagination',
    },
    breakpoints: {
      mobile: `
        "filters"
        "table"
        "sidebar"
        "pagination"
      `,
    },
    spacing: 'gap-4 p-4',
    containerClasses: 'grid grid-cols-1 lg:grid-cols-4 min-h-screen',
  },

  reportBuilder: {
    name: 'Report Builder',
    description: 'Interactive report generation interface',
    gridTemplate: `
      "toolbar toolbar toolbar"
      "canvas canvas sidebar"
      "footer footer footer"
    `,
    componentMapping: {
      card: 'toolbar',
      chart: 'canvas',
      table: 'canvas',
      form: 'sidebar',
      button: 'footer',
    },
    breakpoints: {
      mobile: `
        "toolbar"
        "canvas"
        "sidebar"
        "footer"
      `,
    },
    spacing: 'gap-3 p-4',
    containerClasses: 'grid min-h-screen bg-gray-50',
  },
};

// Profile Layout Patterns
export const profilePatterns: Record<string, LayoutPattern> = {
  userProfile: {
    name: 'User Profile',
    description: 'Comprehensive user profile layout',
    gridTemplate: `
      "avatar info info"
      "avatar details details"
      "avatar settings settings"
    `,
    componentMapping: {
      avatar: 'avatar',
      card: 'info',
      form: 'details',
      tabs: 'settings',
    },
    breakpoints: {
      mobile: `
        "avatar"
        "info"
        "details"
        "settings"
      `,
    },
    spacing: 'gap-6 p-6',
    containerClasses: 'grid grid-cols-1 lg:grid-cols-3 max-w-6xl mx-auto',
  },
};

// Settings Layout Patterns
export const settingsPatterns: Record<string, LayoutPattern> = {
  applicationSettings: {
    name: 'Application Settings',
    description: 'Organized settings interface',
    gridTemplate: `
      "sidebar main main"
    `,
    componentMapping: {
      navigation: 'sidebar',
      form: 'main',
      card: 'main',
      tabs: 'main',
    },
    breakpoints: {
      mobile: `
        "main"
        "sidebar"
      `,
    },
    spacing: 'gap-0',
    containerClasses: 'grid grid-cols-1 lg:grid-cols-4 min-h-screen',
  },
};

// Generic Layout Patterns
export const genericPatterns: Record<string, LayoutPattern> = {
  masonry: {
    name: 'Masonry Layout',
    description: 'Pinterest-style card layout',
    gridTemplate: 'auto-fill',
    componentMapping: {
      card: 'auto',
    },
    breakpoints: {},
    spacing: 'gap-4 p-6',
    containerClasses: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  },

  magazine: {
    name: 'Magazine Layout',
    description: 'Newspaper-style content layout',
    gridTemplate: `
      "hero hero hero"
      "article sidebar sidebar"
      "footer footer footer"
    `,
    componentMapping: {
      card: 'hero',
      chart: 'article',
      table: 'article',
      form: 'sidebar',
    },
    breakpoints: {
      mobile: `
        "hero"
        "article"
        "sidebar"
        "footer"
      `,
    },
    spacing: 'gap-6 p-6',
    containerClasses: 'grid min-h-screen',
  },
};

// Export all patterns
export const allPatterns = {
  ...dashboardPatterns,
  ...formPatterns,
  ...dataPatterns,
  ...profilePatterns,
  ...settingsPatterns,
  ...genericPatterns,
};
