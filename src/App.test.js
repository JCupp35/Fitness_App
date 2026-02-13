import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

const createCompletedResponse = (text) => ({
  status: 'completed',
  output: [
    {
      type: 'message',
      content: [
        {
          type: 'output_text',
          text,
        },
      ],
    },
  ],
});

const DAY_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const buildPlanOutput = (daysCount) =>
  JSON.stringify({
    title: `Build Muscle ${daysCount}-Day Workout Plan`,
    days: Array.from({ length: daysCount }, (_, index) => ({
      day: DAY_NAMES[index],
      focus: `Focus ${index + 1}`,
      exercises: [`Exercise ${index + 1} - 3 sets of 10`],
    })),
    notes: 'Keep rest periods between 60 and 90 seconds.',
  });

const defaultPlanOutput = buildPlanOutput(3);

const mockArchiaSuccess = () => {
  global.fetch.mockResolvedValue({
    ok: true,
    json: async () => createCompletedResponse(defaultPlanOutput),
  });
};

const fillAndGeneratePlan = async () => {
  await userEvent.type(screen.getByLabelText(/^weight$/i), '180');
  await userEvent.selectOptions(screen.getByLabelText(/goal/i), 'build_muscle');
  await userEvent.type(screen.getByLabelText(/days per week/i), '3');
  await userEvent.selectOptions(screen.getByLabelText(/workout location/i), 'home');
  await userEvent.click(screen.getByRole('button', { name: /generate plan/i }));
};

describe('App', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    window.localStorage.clear();
    process.env.REACT_APP_ARCHIA_TOKEN = 'test-token';
    process.env.REACT_APP_ARCHIA_AGENT_NAME = 'Fitness-Plan-Generator';
    delete process.env.REACT_APP_ARCHIA_BASE_URL;
    global.fetch = jest.fn();
    mockArchiaSuccess();
  });

  afterEach(() => {
    delete process.env.REACT_APP_ARCHIA_TOKEN;
    delete process.env.REACT_APP_ARCHIA_AGENT_NAME;
    delete process.env.REACT_APP_ARCHIA_BASE_URL;
    jest.clearAllMocks();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  test('defaults to imperial mode with male selected and 5ft 9in height', () => {
    render(<App />);

    const imperialToggle = screen.getByRole('button', { name: /imperial/i });
    const metricToggle = screen.getByRole('button', { name: /metric/i });
    const heightField = screen.getByLabelText(/^height$/i);
    const maleRadio = screen.getByLabelText(/^male$/i);

    expect(imperialToggle).toHaveAttribute('aria-pressed', 'true');
    expect(metricToggle).toHaveAttribute('aria-pressed', 'false');
    expect(heightField).toHaveValue('69');
    expect(screen.getByRole('option', { name: '5ft 9in' }).selected).toBe(true);
    expect(maleRadio).toBeChecked();
  });

  test('switching units resets height and weight and updates field controls', async () => {
    render(<App />);

    const weightField = screen.getByLabelText(/^weight$/i);
    await userEvent.type(weightField, '180');

    await userEvent.click(screen.getByRole('button', { name: /metric/i }));

    const metricHeightInput = screen.getByRole('spinbutton', { name: /^height$/i });
    expect(metricHeightInput).toHaveValue(null);
    expect(screen.getByLabelText(/^weight$/i)).toHaveValue('');
    expect(screen.getByText(/^kg$/i)).toBeInTheDocument();

    await userEvent.type(metricHeightInput, '180');
    await userEvent.type(screen.getByLabelText(/^weight$/i), '81');

    await userEvent.click(screen.getByRole('button', { name: /imperial/i }));

    const imperialHeightSelect = screen.getByLabelText(/^height$/i);
    expect(imperialHeightSelect).toHaveValue('69');
    expect(screen.getByRole('option', { name: '5ft 9in' }).selected).toBe(true);
    expect(screen.getByLabelText(/^weight$/i)).toHaveValue('');
    expect(screen.getByText(/^lb$/i)).toBeInTheDocument();
  });

  test('home selection reveals equipment fields', async () => {
    render(<App />);

    expect(screen.queryByLabelText(/pull-up bar/i)).not.toBeInTheDocument();
    await userEvent.selectOptions(screen.getByLabelText(/workout location/i), 'home');
    expect(screen.getByLabelText(/pull-up bar/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/dip station/i)).toBeInTheDocument();
  });

  test('generate creates a plan and renders it', async () => {
    render(<App />);
    await fillAndGeneratePlan();

    expect(
      await screen.findByText(/build muscle 3-day workout plan/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/focus 1/i)).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test('shows API error and does not create a plan when generation fails', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'failed',
        error: { message: 'Agent unavailable in this workspace.' },
      }),
    });

    render(<App />);
    await fillAndGeneratePlan();

    expect(
      await screen.findByText(/agent unavailable in this workspace\./i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/no plans yet\. fill out the form and click generate plan to create one\./i),
    ).toBeInTheDocument();
  });

  test('shows retry day-count error and does not create a plan', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => createCompletedResponse(buildPlanOutput(4)),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => createCompletedResponse(buildPlanOutput(5)),
      });

    render(<App />);
    await fillAndGeneratePlan();

    expect(
      await screen.findByText(/agent returned an invalid day count twice/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/no plans yet\. fill out the form and click generate plan to create one\./i),
    ).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  test('editing title and notes persists after remount', async () => {
    const { unmount } = render(<App />);
    await fillAndGeneratePlan();

    await screen.findByText(/build muscle 3-day workout plan/i);
    await userEvent.click(screen.getByRole('button', { name: /edit/i }));

    const titleInput = screen.getByLabelText(/plan title/i);
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'Custom Home Plan');

    const notesInput = screen.getByLabelText(/plan notes/i);
    await userEvent.clear(notesInput);
    await userEvent.type(notesInput, 'Focus on strict form and 90s rest.');

    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(screen.getByText(/custom home plan/i)).toBeInTheDocument();
    expect(screen.getByText(/focus on strict form and 90s rest\./i)).toBeInTheDocument();

    unmount();
    render(<App />);

    expect(screen.getByText(/custom home plan/i)).toBeInTheDocument();
    expect(screen.getByText(/focus on strict form and 90s rest\./i)).toBeInTheDocument();
  });

  test('deleting a plan removes it and stays removed after remount', async () => {
    const { unmount } = render(<App />);
    await fillAndGeneratePlan();

    await screen.findByText(/build muscle 3-day workout plan/i);
    await userEvent.click(screen.getByRole('button', { name: /delete/i }));

    expect(
      screen.getByText(/no plans yet\. fill out the form and click generate plan to create one\./i),
    ).toBeInTheDocument();

    unmount();
    render(<App />);

    expect(
      screen.getByText(/no plans yet\. fill out the form and click generate plan to create one\./i),
    ).toBeInTheDocument();
  });
});
