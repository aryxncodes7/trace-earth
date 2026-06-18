import { describe, it, expect } from 'vitest';

interface LeaderboardUser {
  id: string;
  email: string;
  name: string;
  city: string;
  country: string;
  avgEmission: number;
  logsLogged: number;
}

function filterLeaderboard(users: LeaderboardUser[], query: string): LeaderboardUser[] {
  const q = query.toLowerCase().trim();
  if (!q) return users;
  return users.filter(u =>
    u.city.toLowerCase().includes(q) || u.country.toLowerCase().includes(q)
  );
}

function sortLeaderboard(users: LeaderboardUser[]): LeaderboardUser[] {
  return [...users].sort((a, b) => a.avgEmission - b.avgEmission);
}

function getAnonymousName(index: number): string {
  return `Anonymous Eco-Partner #${index + 1}`;
}

const mockUsers: LeaderboardUser[] = [
  { id: '1', email: 'a@test.com', name: 'Alice', city: 'Delhi', country: 'India', avgEmission: 9.5, logsLogged: 10 },
  { id: '2', email: 'b@test.com', name: 'Bob', city: 'Mumbai', country: 'India', avgEmission: 6.2, logsLogged: 5 },
  { id: '3', email: 'c@test.com', name: 'Carol', city: 'Berlin', country: 'Germany', avgEmission: 14.1, logsLogged: 8 },
  { id: '4', email: 'd@test.com', name: 'Dave', city: 'London', country: 'UK', avgEmission: 11.3, logsLogged: 3 },
];

describe('leaderboard sorting', () => {
  it('sorts users by lowest emission first', () => {
    const sorted = sortLeaderboard(mockUsers);
    expect(sorted[0].name).toBe('Bob');
    expect(sorted[0].avgEmission).toBe(6.2);
  });

  it('puts highest emitter last', () => {
    const sorted = sortLeaderboard(mockUsers);
    expect(sorted[sorted.length - 1].avgEmission).toBe(14.1);
  });

  it('does not mutate original array', () => {
    const original = [...mockUsers];
    sortLeaderboard(mockUsers);
    expect(mockUsers[0].name).toBe(original[0].name);
  });
});

describe('leaderboard filtering', () => {
  it('filters by city', () => {
    const result = filterLeaderboard(mockUsers, 'delhi');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Alice');
  });

  it('filters by country', () => {
    const result = filterLeaderboard(mockUsers, 'india');
    expect(result).toHaveLength(2);
  });

  it('returns all users for empty query', () => {
    const result = filterLeaderboard(mockUsers, '');
    expect(result).toHaveLength(4);
  });

  it('returns empty array for no match', () => {
    const result = filterLeaderboard(mockUsers, 'tokyo');
    expect(result).toHaveLength(0);
  });

  it('is case insensitive', () => {
    const result = filterLeaderboard(mockUsers, 'BERLIN');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Carol');
  });
});

describe('anonymous mode', () => {
  it('generates anonymous name with correct index', () => {
    expect(getAnonymousName(0)).toBe('Anonymous Eco-Partner #1');
    expect(getAnonymousName(4)).toBe('Anonymous Eco-Partner #5');
  });
});
