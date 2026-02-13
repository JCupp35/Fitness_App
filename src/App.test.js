import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

const fillAndGeneratePlan = async () => {
  await userEvent.type(screen.getByLabelText(/^height$/i), '70');
  await userEvent.type(screen.getByLabelText(/^weight$/i), '180');
  await userEvent.selectOptions(screen.getByLabelText(/goal/i), 'build_muscle');
  await userEvent.type(screen.getByLabelText(/days per week/i), '3');
  await userEvent.selectOptions(screen.getByLabelText(/workout location/i), 'home');
  await userEvent.click(screen.getByRole('button', { name: /generate plan/i }));
};

beforeEach(() => {
  window.localStorage.clear();
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

  expect(screen.getByText(/build muscle 3-day workout plan/i)).toBeInTheDocument();
  expect(screen.getByText(/upper body strength/i)).toBeInTheDocument();
});

test('editing title and notes persists after remount', async () => {
  const { unmount } = render(<App />);
  await fillAndGeneratePlan();

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
