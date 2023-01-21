import { render, screen } from '@testing-library/react';
import App from './App';

test('renders search', () => {
  render(<App />);
  const linkElement = screen.getByText(/Search/i);
  expect(linkElement).toBeInTheDocument();
});
