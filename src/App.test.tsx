import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';

describe('Application Environment Sanity Check', () => {
  it('should verify that the DOM environment boots up correctly', () => {
    const div = document.createElement('div');
    render(<div id="root">Trace Earth Carbon Dashboard</div>, { container: div });
    
    expect(div.textContent).toContain('Trace Earth Carbon Dashboard');
  });
});