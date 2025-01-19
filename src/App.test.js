// src/App.test.js
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders some text', () => {
  render(<App />);
  // Just confirm the page renders without crashing
  // or check for an element that you expect to exist:
  expect(screen.getByText(/curriculum planner/i)).toBeInTheDocument();
});
