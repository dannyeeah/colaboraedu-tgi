
export const LEVELS = [
  { level: 1, name: "Iniciante", minXp: 0 },
  { level: 2, name: "Aprendiz", minXp: 100 },
  { level: 3, name: "Explorador", minXp: 300 },
  { level: 4, name: "Conhecedor", minXp: 600 },
  { level: 5, name: "Especialista", minXp: 1000 },
  { level: 6, name: "Mestre", minXp: 1500 },
  { level: 7, name: "Lenda", minXp: 2500 },
] as const;

export function calculateLevel(totalXp: number) {
  const xp = Math.max(0, totalXp);

  const currentLevel =
    [...LEVELS].reverse().find((level) => xp >= level.minXp) ??
    LEVELS[0];

  const nextLevel = LEVELS.find(
    (level) => level.level === currentLevel.level + 1
  );

  const xpToNextLevel = nextLevel
    ? Math.max(0, nextLevel.minXp - xp)
    : 0;

  const progressPercentage = nextLevel
    ? Math.min(
        100,
        Math.round(
          ((xp - currentLevel.minXp) /
            (nextLevel.minXp - currentLevel.minXp)) *
            100
        )
      )
    : 100;

  return {
    totalXp: xp,
    level: currentLevel.level,
    levelName: currentLevel.name,
    currentLevelMinXp: currentLevel.minXp,
    nextLevelMinXp: nextLevel?.minXp ?? null,
    xpToNextLevel,
    progressPercentage,
  };
}
