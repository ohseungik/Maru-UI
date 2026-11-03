import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Button, Checkbox, Field, Heading, Input, Stack, Switch, Text } from './index';

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

  it('gives a Field the same ids in label, control and description', () => {
    const html = renderToString(
      <Field label="Email" description="We never share it." error="Required">
        <Input />
      </Field>,
    );

    const labelFor = /<label for="([^"]+)"/.exec(html)?.[1];
    const inputId = /<input[^>]* id="([^"]+)"/.exec(html)?.[1];
    expect(labelFor).toBeTruthy();
    expect(inputId).toBe(labelFor);

    const describedBy = /aria-describedby="([^"]+)"/.exec(html)?.[1] ?? '';
    for (const id of describedBy.split(' ')) {
      expect(html).toContain(`id="${id}"`);
    }
    expect(html).toContain('aria-invalid="true"');
  });

  it('renders Checkbox and Switch with their native state', () => {
    const html = renderToString(
      <Stack>
        <Checkbox defaultChecked>Accept</Checkbox>
        <Checkbox indeterminate>Select all</Checkbox>
        <Switch defaultChecked>Notifications</Switch>
      </Stack>,
    );

    expect(html).toContain('type="checkbox"');
    expect(html).toContain('role="switch"');
    expect(html).toContain('checked=""');
    // Indeterminate is a DOM property set after hydration, never part of the markup.
    expect(html).not.toContain('indeterminate');
  });
});
