import { describe, it, expect } from 'vitest';

// Score ring threshold logic extracted for testing
function getScoreLabel(score: number): string {
  if (score < 8.0) return 'Pretty good';
  if (score <= 13.0) return 'Moderate footprint';
  return 'High impact day';
}

function getScoreColor(score: number): string {
  if (score < 8.0) return 'green';
  if (score <= 13.0) return 'amber';
  return 'red';
}

function getFillPercentage(score: number, maxCap = 20.0): number {
  return Math.min(score / maxCap, 1) * 100;
}

describe('ScoreRing thresholds', () => {
  it('shows green for score below 8', () => { expect(getScoreColor(5.0)).toBe('green'); });
  it('shows amber for score between 8 and 13', () => { expect(getScoreColor(10.0)).toBe('amber'); });
  it('shows red for score above 13', () => { expect(getScoreColor(16.0)).toBe('red'); });
  it('shows green label for low score', () => { expect(getScoreLabel(3.0)).toBe('Pretty good'); });
  it('shows amber label for moderate score', () => { expect(getScoreLabel(11.0)).toBe('Moderate footprint'); });
  it('shows red label for high score', () => { expect(getScoreLabel(18.0)).toBe('High impact day'); });
  it('boundary 8.0 is amber', () => { expect(getScoreColor(8.0)).toBe('amber'); });
  it('boundary 13.0 is amber', () => { expect(getScoreColor(13.0)).toBe('amber'); });
  it('boundary 13.1 is red', () => { expect(getScoreColor(13.1)).toBe('red'); });
});

describe('ScoreRing fill percentage', () => {
  it('returns 0% for 0 score', () => { expect(getFillPercentage(0)).toBe(0); });
  it('returns 50% for 10kg (out of 20 cap)', () => { expect(getFillPercentage(10)).toBe(50); });
  it('returns 100% for score at cap', () => { expect(getFillPercentage(20)).toBe(100); });
  it('caps at 100% for score above cap', () => { expect(getFillPercentage(30)).toBe(100); });
  it('returns 25% for 5kg', () => { expect(getFillPercentage(5)).toBe(25); });
});
