import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  Button,
  Checkbox,
  Dialog,
  Field,
  Heading,
  Input,
  Select,
  Stack,
  Switch,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Text,
  Tooltip,
} from './index';

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

  it('renders Tabs with matching tab and panel ids', () => {
    const html = renderToString(
      <Tabs defaultValue="b">
        <TabList aria-label="Demo">
          <Tab value="a">A</Tab>
          <Tab value="b">B</Tab>
        </TabList>
        <TabPanel value="a">A content</TabPanel>
        <TabPanel value="b">B content</TabPanel>
      </Tabs>,
    );

    expect(html).toContain('role="tablist"');
    expect(html).toContain('aria-selected="true"');
    expect(html).toContain('B content');
    expect(html).not.toContain('A content');

    const controls = /aria-controls="([^"]+)"/.exec(html)?.[1];
    expect(controls).toBeTruthy();
    expect(html).toContain(`id="${controls}"`);
  });

  it('renders a closed Dialog as nothing and keepMounted as a closed element', () => {
    const closed = renderToString(
      <Dialog open={false} onClose={() => {}} title="Hidden">
        content
      </Dialog>,
    );
    expect(closed).toBe('');

    const kept = renderToString(
      <Dialog open={false} keepMounted onClose={() => {}} title="Kept" description="About">
        content
      </Dialog>,
    );
    expect(kept).toContain('<dialog');
    expect(kept).not.toContain(' open=');
    const labelledby = /aria-labelledby="([^"]+)"/.exec(kept)?.[1];
    expect(labelledby).toBeTruthy();
    expect(kept).toContain(`id="${labelledby}"`);
  });

  it('renders Select inside a Field with matching ids and the placeholder selected', () => {
    const html = renderToString(
      <Field label="City" error="Required">
        <Select placeholder="Choose">
          <option value="seoul">Seoul</option>
        </Select>
      </Field>,
    );
    const forId = /for="([^"]+)"/.exec(html)?.[1];
    expect(forId).toBeTruthy();
    expect(html).toContain(`id="${forId}"`);
    expect(html).toContain('<select');
    expect(html).toContain('aria-invalid="true"');
    // The placeholder option is the selected one on first render.
    expect(html).toMatch(/<option value="" disabled[^>]*selected|<option value=""[^>]*selected/);
  });

  it('renders a Tooltip closed, linked to its trigger', () => {
    const html = renderToString(
      <Tooltip content="Save changes">
        <button type="button">Save</button>
      </Tooltip>,
    );
    const describedBy = /aria-describedby="([^"]+)"/.exec(html)?.[1];
    expect(describedBy).toBeTruthy();
    expect(html).toContain(`id="${describedBy}"`);
    expect(html).toContain('role="tooltip"');
    expect(html).not.toContain('data-open');
  });
});
