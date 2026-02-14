import { generatePlan } from '@/services/planGenerator';
import type { FitnessInput } from '@/types/fitnessPlan';

const input: FitnessInput = {
  height: { value: 70, unit: 'in' },
  weight: { value: 180, unit: 'lb' },
  goal: 'build_muscle',
  daysPerWeek: 3,
  workoutLocation: 'home',
  homeEquipment: {
    pullUpBar: true,
    dipStation: false,
  },
};

const DAY_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const buildPlanOutput = (daysCount: number) => ({
  title: `Build Muscle ${daysCount}-Day Workout Plan`,
  days: Array.from({ length: daysCount }, (_, index) => ({
    day: DAY_NAMES[index],
    focus: `Focus ${index + 1}`,
    exercises: [`Exercise ${index + 1} - 3 sets of 10`],
  })),
  notes: 'Warm up for 5 minutes and recover well.',
});

const makeCompletedResponse = (text: string) => ({
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

describe('generatePlan', () => {
  const originalFetch = global.fetch;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.stubEnv('VITE_ARCHIA_TOKEN', 'test-token');
    vi.stubEnv('VITE_ARCHIA_AGENT_NAME', 'Fitness-Plan-Generator');

    fetchMock = vi.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  test('returns parsed plan from Archia API on first attempt', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () =>
        makeCompletedResponse(JSON.stringify(buildPlanOutput(input.daysPerWeek))),
    });

    const plan = await generatePlan(input);

    expect(plan.title).toMatch(/3-Day Workout Plan/i);
    expect(plan.days).toHaveLength(3);
    expect(plan.notes).toMatch(/Warm up/i);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const fetchArgs = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const body = JSON.parse(fetchArgs.body as string);
    expect(body.model).toBe('agent:Fitness-Plan-Generator');
    expect(body.stream).toBe(false);
    expect(body.temperature).toBe(0);
  });

  test('retries once on day-count mismatch and succeeds', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () =>
          makeCompletedResponse(JSON.stringify(buildPlanOutput(input.daysPerWeek + 1))),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () =>
          makeCompletedResponse(JSON.stringify(buildPlanOutput(input.daysPerWeek))),
      });

    const plan = await generatePlan(input);

    expect(plan.days).toHaveLength(input.daysPerWeek);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const retryArgs = fetchMock.mock.calls[1]?.[1] as RequestInit;
    const retryBody = JSON.parse(retryArgs.body as string);
    expect(retryBody.temperature).toBe(0);
    expect(retryBody.input).toMatch(/Strict retry mode/i);
  });

  test('fails after retry when day-count mismatch persists', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () =>
          makeCompletedResponse(JSON.stringify(buildPlanOutput(input.daysPerWeek + 1))),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () =>
          makeCompletedResponse(JSON.stringify(buildPlanOutput(input.daysPerWeek + 2))),
      });

    await expect(generatePlan(input)).rejects.toThrow(/after retry/i);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test('does not retry on malformed JSON output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => makeCompletedResponse('not json at all'),
    });

    await expect(generatePlan(input)).rejects.toThrow(/not valid JSON/i);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test('does not retry on API failed status', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 'failed',
        error: { message: 'Agent unavailable in this workspace.' },
      }),
    });

    await expect(generatePlan(input)).rejects.toThrow(
      /agent unavailable in this workspace/i,
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test('throws when token is missing', async () => {
    vi.stubEnv('VITE_ARCHIA_TOKEN', '');

    await expect(generatePlan(input)).rejects.toThrow(/Missing VITE_ARCHIA_TOKEN/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('throws when agent name is missing', async () => {
    vi.stubEnv('VITE_ARCHIA_AGENT_NAME', '');

    await expect(generatePlan(input)).rejects.toThrow(/Missing VITE_ARCHIA_AGENT_NAME/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
