INSERT INTO "Achievement"
  ("id", "code", "title", "description", "icon", "createdAt")
VALUES
  (
    'achievement-first-lesson',
    'FIRST_LESSON',
    'Primeiros Passos',
    'Conclua sua primeira aula.',
    '🌱',
    NOW()
  ),
  (
    'achievement-ten-lessons',
    'TEN_LESSONS',
    'Estudante Dedicado',
    'Conclua 10 aulas.',
    '📚',
    NOW()
  ),
  (
    'achievement-first-course',
    'FIRST_COURSE',
    'Primeira Vitória',
    'Conclua seu primeiro curso.',
    '🏆',
    NOW()
  ),
  (
    'achievement-500-xp',
    'XP_500',
    'Em Evolução',
    'Acumule 500 pontos de experiência.',
    '🚀',
    NOW()
  ),
  (
    'achievement-1500-xp',
    'XP_1500',
    'Mestre do Conhecimento',
    'Acumule 1500 pontos de experiência.',
    '👑',
    NOW()
  )
ON CONFLICT ("code") DO NOTHING;