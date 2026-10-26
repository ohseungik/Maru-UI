import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Button, Heading, Stack, Text } from './index';

describe('server rendering', () => {
  it('renders every component to a string', () => {
    const html = renderToString(
      <Stack as="section" aria-label="Demo">
        <Heading level={1}>Title</Heading>
        <Text>Body</Text>
        <Button>Action</Button>
        <Button loading>Saving</Button>
      </Stack>,
    );

    expect(html).toContain('<section');
    expect(html).toContain('<h1');
    expect(html).toContain('data-variant="primary"');
    expect(html).toContain('aria-busy="true"');
  });
});
