const DEFAULT_ARCHIA_BASE_URL = 'https://registry.archia.app';
const ORDERED_DAY_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];
const ARCHIA_DEBUG_ENABLED = process.env.REACT_APP_DEBUG_ARCHIA === 'true';

/**
 * @typedef {Object} GeneratedPlanDay
 * @property {string} day
 * @property {string} focus
 * @property {string[]} exercises
 *
 * @typedef {Object} GeneratedPlanResponse
 * @property {string} title
 * @property {GeneratedPlanDay[]} days
 * @property {string} notes
 *
 * @typedef {Object} AgentErrorResponse
 * @property {{ code?: string, message: string, details?: string[] }} error
 */

const normalizeBaseUrl = (baseUrl) => baseUrl.replace(/\/+$/, '');

const previewToken = (token) => {
  if (!token || token.length < 8) {
    return 'unset';
  }
  return `${token.slice(0, 6)}...${token.slice(-4)}`;
};

const debugLog = (event, details) => {
  if (!ARCHIA_DEBUG_ENABLED) {
    return;
  }
  // Dev-only diagnostics for Archia request/response troubleshooting.
  console.info(`[Archia Debug] ${event}`, details);
};

class DayCountMismatchError extends Error {
  constructor(expectedDays, actualDays) {
    super(`Agent returned ${actualDays} days, expected ${expectedDays}.`);
    this.name = 'DayCountMismatchError';
    this.expectedDays = expectedDays;
    this.actualDays = actualDays;
  }
}

const getConfig = () => {
  const baseUrl = normalizeBaseUrl(
    process.env.REACT_APP_ARCHIA_BASE_URL || DEFAULT_ARCHIA_BASE_URL,
  );
  const token = process.env.REACT_APP_ARCHIA_TOKEN;
  const agentName = process.env.REACT_APP_ARCHIA_AGENT_NAME;

  if (!token) {
    throw new Error(
      'Missing REACT_APP_ARCHIA_TOKEN. Add it to your environment before generating plans.',
    );
  }

  if (!agentName) {
    throw new Error(
      'Missing REACT_APP_ARCHIA_AGENT_NAME. Set it to the exact name returned by GET /v1/agent.',
    );
  }

  return { baseUrl, token, agentName };
};

const createAgentInput = (intake, { strictRetry } = {}) => {
  const expectedDays = intake.daysPerWeek;
  const expectedDayNames = ORDERED_DAY_NAMES.slice(0, expectedDays).join(', ');

  const baseInstructions = [
    'Generate a fitness workout plan from this intake.',
    'Return JSON only with exactly this shape: {"title":string,"days":[{"day":string,"focus":string,"exercises":string[]}],"notes":string}.',
    `Return exactly ${expectedDays} day objects. Use only these day names in this order: ${expectedDayNames}.`,
    'Do not include markdown or code fences.',
    `Intake JSON:\n${JSON.stringify(intake)}`,
  ];

  if (strictRetry) {
    baseInstructions.splice(
      2,
      0,
      `Strict retry mode: return exactly ${expectedDays} day objects, no more and no fewer.`,
    );
  }

  return baseInstructions.join('\n\n');
};

const extractOutputText = (responseJson) => {
  for (const item of responseJson?.output ?? []) {
    if (item?.type === 'message') {
      for (const content of item?.content ?? []) {
        if (content?.type === 'output_text') {
          return content?.text;
        }
      }
    }
  }
  return undefined;
};

const stripMarkdownCodeFence = (value) => {
  const trimmed = value.trim();
  if (!trimmed.startsWith('```')) {
    return trimmed;
  }

  return trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
};

const isNonEmptyString = (value) =>
  typeof value === 'string' && value.trim().length > 0;

const isValidDay = (day) =>
  day &&
  isNonEmptyString(day.day) &&
  isNonEmptyString(day.focus) &&
  Array.isArray(day.exercises) &&
  day.exercises.length > 0 &&
  day.exercises.every(isNonEmptyString);

const parsePlanJson = (rawText, expectedDays) => {
  if (!isNonEmptyString(rawText)) {
    throw new Error('Agent returned an empty response.');
  }

  let parsed;
  try {
    parsed = JSON.parse(stripMarkdownCodeFence(rawText));
  } catch {
    throw new Error('Agent response was not valid JSON.');
  }

  if (
    parsed?.error &&
    typeof parsed.error === 'object' &&
    isNonEmptyString(parsed.error.message)
  ) {
    throw new Error(`Agent rejected the input: ${parsed.error.message}`);
  }

  if (
    !parsed ||
    typeof parsed !== 'object' ||
    !isNonEmptyString(parsed.title) ||
    !isNonEmptyString(parsed.notes) ||
    !Array.isArray(parsed.days)
  ) {
    throw new Error('Agent response JSON did not match the required plan schema.');
  }

  if (parsed.days.length !== expectedDays) {
    throw new DayCountMismatchError(expectedDays, parsed.days.length);
  }

  if (!parsed.days.every(isValidDay)) {
    throw new Error('Agent response JSON contained invalid day entries.');
  }

  return {
    title: parsed.title.trim(),
    notes: parsed.notes.trim(),
    days: parsed.days.map((day) => ({
      day: day.day.trim(),
      focus: day.focus.trim(),
      exercises: day.exercises.map((exercise) => exercise.trim()),
    })),
  };
};

const parseErrorResponse = async (response) => {
  try {
    const payload = await response.json();
    return payload?.error?.message || payload?.message || null;
  } catch {
    return null;
  }
};

const buildRequestBody = ({ input, model, strictRetry }) => ({
  model,
  input: createAgentInput(input, { strictRetry }),
  stream: false,
  temperature: 0,
});

const requestPlanOnce = async ({
  baseUrl,
  token,
  model,
  input,
  strictRetry,
}) => {
  const url = `${baseUrl}/v1/responses`;
  const body = buildRequestBody({ input, model, strictRetry });
  const attempt = strictRetry ? 'retry' : 'initial';

  debugLog('request', {
    attempt,
    url,
    model,
    expectedDays: input.daysPerWeek,
    tokenPreview: previewToken(token),
    temperature: body.temperature,
  });

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
  } catch {
    debugLog('network_error', {
      attempt,
      message: 'Unable to reach Archia API.',
    });
    throw new Error(
      'Unable to reach Archia API. Check your network connection and try again.',
    );
  }

  debugLog('http_response', {
    attempt,
    ok: response.ok,
    status: response.status,
  });

  if (!response.ok) {
    const apiError = await parseErrorResponse(response);
    debugLog('http_error_body', {
      attempt,
      status: response.status,
      apiError,
    });
    throw new Error(
      `Archia request failed (${response.status}). ${
        apiError || 'Check API key, workspace, and agent configuration.'
      }`,
    );
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error('Archia response could not be parsed as JSON.');
  }

  if (payload?.status === 'failed') {
    const message =
      payload?.error?.message ||
      'Archia returned a failed response. Verify workspace and agent settings.';
    throw new Error(message);
  }

  if (payload?.status !== 'completed') {
    debugLog('unexpected_status', {
      attempt,
      status: payload?.status || 'unknown',
    });
    throw new Error(
      `Archia returned unexpected status "${payload?.status || 'unknown'}".`,
    );
  }

  const outputText = extractOutputText(payload);
  debugLog('output_text', {
    attempt,
    outputText,
  });
  return parsePlanJson(outputText, input.daysPerWeek);
};

export const generatePlan = async (input) => {
  const { baseUrl, token, agentName } = getConfig();
  const model = `agent:${agentName}`;

  try {
    return await requestPlanOnce({
      baseUrl,
      token,
      model,
      input,
      strictRetry: false,
    });
  } catch (error) {
    if (!(error instanceof DayCountMismatchError)) {
      debugLog('no_retry_error', {
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }

    debugLog('day_count_mismatch_retrying', {
      expectedDays: error.expectedDays,
      actualDays: error.actualDays,
    });

    try {
      return await requestPlanOnce({
        baseUrl,
        token,
        model,
        input,
        strictRetry: true,
      });
    } catch (retryError) {
      if (retryError instanceof DayCountMismatchError) {
        debugLog('day_count_mismatch_after_retry', {
          expectedDays: retryError.expectedDays,
          actualDays: retryError.actualDays,
        });
        throw new Error(
          `Agent returned ${retryError.actualDays} days, expected ${retryError.expectedDays} after retry.`,
        );
      }
      debugLog('retry_error', {
        message:
          retryError instanceof Error ? retryError.message : 'Unknown retry error',
      });
      throw retryError;
    }
  }
};
