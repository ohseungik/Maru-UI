import { tokens } from '@ohseungik/maru-tokens';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Foundations/Tokens',
  parameters: {
    docs: {
      description: {
        component:
          'Tokens have three layers. **Palette** holds raw values, **Scale** holds spacing, radius, type and motion, and **Semantic** gives palette values a purpose (`color-bg-default`). Themes swap only the semantic layer, so components never reference a palette value directly.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const swatchBorder = '1px solid var(--maru-color-border-default)';

function Swatch({ variable, caption }: { variable: string; caption?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div
        aria-hidden="true"
        style={{
          width: 40,
          height: 40,
          flex: 'none',
          borderRadius: 8,
          border: swatchBorder,
          background: `var(${variable})`,
        }}
      />
      <div>
        <code>{variable}</code>
        {caption ? (
          <div style={{ fontSize: 12, color: 'var(--maru-color-text-muted)' }}>{caption}</div>
        ) : null}
      </div>
    </div>
  );
}

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: 16,
} as const;

const semanticColors = Object.entries(tokens.semantic.light.color).flatMap(([group, values]) =>
  Object.keys(values).map((key) => `--maru-color-${group}-${key}`),
);

export const SemanticColors: Story = {
  name: 'Semantic colors',
  render: () => (
    <div style={grid}>
      {semanticColors.map((variable) => (
        <Swatch key={variable} variable={variable} />
      ))}
    </div>
  ),
};

export const Palette: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      {Object.entries(tokens.palette).map(([hue, steps]) => (
        <section key={hue}>
          <h3 style={{ margin: '0 0 12px', textTransform: 'capitalize' }}>{hue}</h3>
          <div style={grid}>
            {Object.entries(steps).map(([step, value]) => (
              <Swatch key={step} variable={`--maru-palette-${hue}-${step}`} caption={value} />
            ))}
          </div>
        </section>
      ))}
    </div>
  ),
};

export const Spacing: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 8 }}>
      {Object.entries(tokens.scale.space).map(([key, value]) => (
        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <code style={{ width: 150, flex: 'none' }}>--maru-space-{key}</code>
          <div
            aria-hidden="true"
            style={{
              height: 16,
              width: `var(--maru-space-${key})`,
              minWidth: 1,
              background: 'var(--maru-color-action-bg)',
            }}
          />
          <span style={{ color: 'var(--maru-color-text-muted)' }}>{value}</span>
        </div>
      ))}
    </div>
  ),
};

export const Typography: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {Object.entries(tokens.scale.font.size).map(([key, value]) => (
        <div key={key} style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
          <code style={{ width: 170, flex: 'none' }}>--maru-font-size-{key}</code>
          <span style={{ fontSize: `var(--maru-font-size-${key})` }}>
            다람쥐 헌 쳇바퀴에 타고파 The quick brown fox
          </span>
          <span style={{ color: 'var(--maru-color-text-muted)' }}>{value}</span>
        </div>
      ))}
    </div>
  ),
};
