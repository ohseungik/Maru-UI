import type { Preview } from '@storybook/react-vite';
import { useEffect, type ReactNode } from 'react';
import '@ohseungik/maru-tokens/css';

type Theme = 'light' | 'dark';

/** Applies the selected theme and base page styles to the preview iframe. */
function ThemeSync({ theme, children }: { theme: Theme; children: ReactNode }) {
  useEffect(() => {
    document.documentElement.dataset['theme'] = theme;
    document.body.style.background = 'var(--maru-color-bg-default)';
    document.body.style.color = 'var(--maru-color-text-default)';
    document.body.style.fontFamily = 'var(--maru-font-family-sans)';
  }, [theme]);

  return <>{children}</>;
}

const preview: Preview = {
  initialGlobals: { theme: 'light' },
  globalTypes: {
    theme: {
      description: 'Color theme',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        dynamicTitle: true,
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
      },
    },
  },
  decorators: [
    (Story, context) => (
      <ThemeSync theme={context.globals['theme'] === 'dark' ? 'dark' : 'light'}>
        <Story />
      </ThemeSync>
    ),
  ],
  parameters: {
    layout: 'padded',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
