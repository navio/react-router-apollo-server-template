/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import Index from '../app/features/home/routes/home';

// Mock React Router Link component
jest.mock('react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

describe('Home Route', () => {
  it('renders welcome message', () => {
    render(<Index />);
    
    expect(screen.getByText('Welcome to React Router + Apollo SSR')).toBeInTheDocument();
  });

  it('displays feature list', () => {
    render(<Index />);
    
    expect(screen.getByText('✅ Server-Side Rendering (SSR)')).toBeInTheDocument();
    expect(screen.getByText('✅ Apollo Client with GraphQL')).toBeInTheDocument();
    expect(screen.getByText('✅ React Router 7')).toBeInTheDocument();
  });

  it('renders navigation link', () => {
    render(<Index />);
    
    expect(screen.getByText('View Rick and Morty Characters')).toBeInTheDocument();
  });
});