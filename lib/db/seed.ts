import { getDatabase } from './connection';

export function seedDatabase(): void {
  const db = getDatabase();

  // Check if we already have data
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count > 0) {
    console.log('Database already seeded, skipping...');
    return;
  }

  // Insert mock users
  const insertUser = db.prepare(`
    INSERT INTO users (name, email, password_hash, level, points, streak_days)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const users = [
    { name: 'Ahmet Yılmaz', email: 'ahmet@example.com', password_hash: '$2b$10$hashedpassword123', level: 5, points: 1250, streak_days: 12 },
    { name: 'Ayşe Kaya', email: 'ayse@example.com', password_hash: '$2b$10$hashedpassword456', level: 3, points: 680, streak_days: 7 },
    { name: 'Mehmet Demir', email: 'mehmet@example.com', password_hash: '$2b$10$hashedpassword789', level: 8, points: 2340, streak_days: 21 },
    { name: 'Fatma Şahin', email: 'fatma@example.com', password_hash: '$2b$10$hashedpasswordabc', level: 2, points: 320, streak_days: 3 },
    { name: 'Ali Yıldız', email: 'ali@example.com', password_hash: '$2b$10$hashedpassworddef', level: 6, points: 1580, streak_days: 15 },
    { name: 'Zeynep Aydın', email: 'zeynep@example.com', password_hash: '$2b$10$hashedpasswordghi', level: 4, points: 890, streak_days: 9 },
    { name: 'Mustafa Özdemir', email: 'mustafa@example.com', password_hash: '$2b$10$hashedpasswordjkl', level: 7, points: 1980, streak_days: 18 },
    { name: 'Emine Çelik', email: 'emine@example.com', password_hash: '$2b$10$hashedpasswordmno', level: 1, points: 150, streak_days: 2 },
    { name: 'Hasan Koç', email: 'hasan@example.com', password_hash: '$2b$10$hashedpasswordpqr', level: 9, points: 2890, streak_days: 25 },
    { name: 'Elif Arslan', email: 'elif@example.com', password_hash: '$2b$10$hashedpasswordstu', level: 3, points: 540, streak_days: 5 },
    { name: 'İbrahim Yılmaz', email: 'ibrahim@example.com', password_hash: '$2b$10$hashedpasswordvwx', level: 5, points: 1120, streak_days: 11 },
    { name: 'Hatice Doğan', email: 'hatice@example.com', password_hash: '$2b$10$hashedpasswordyza', level: 2, points: 280, streak_days: 4 },
  ];

  const insertUserTransaction = db.transaction((usersList) => {
    for (const user of usersList) {
      insertUser.run(user.name, user.email, user.password_hash, user.level, user.points, user.streak_days);
    }
  });

  insertUserTransaction(users);

  // Insert exercises
  const insertExercise = db.prepare(`
    INSERT INTO exercises (title, description, type, difficulty_levels, duration_minutes, is_active)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const exercises = [
    { title: 'Temel Okuma Egzersizi', description: 'Günlük temel okuma hızı geliştirme egzersizi', type: 'reading', difficulty_levels: 'beginner,intermediate,advanced', duration_minutes: 5, is_active: 1 },
    { title: 'Kelime Tespiti', description: 'Hızlı kelime tanıma ve tespit egzersizi', type: 'word_recognition', difficulty_levels: 'beginner,intermediate', duration_minutes: 3, is_active: 1 },
    { title: 'Paragraf Anlama', description: 'Okuduğunu anlama ve hız artırma egzersizi', type: 'comprehension', difficulty_levels: 'intermediate,advanced', duration_minutes: 10, is_active: 1 },
    { title: 'Göz Hareketi Egzersizi', description: 'Göz kaslarını güçlendirme ve okuma alanını genişletme', type: 'eye_training', difficulty_levels: 'beginner', duration_minutes: 5, is_active: 1 },
    { title: 'Hızlı Tarama', description: 'Metin içinde bilgi bulma hızı egzersizi', type: 'scanning', difficulty_levels: 'intermediate,advanced', duration_minutes: 7, is_active: 1 },
    { title: 'Odaklanma Egzersizi', description: 'Dikkat süresini artırma ve odaklanma egzersizi', type: 'focus', difficulty_levels: 'beginner,intermediate,advanced', duration_minutes: 5, is_active: 1 },
    { title: 'Geniş Görüş Alanı', description: 'Periferik görüşü geliştirme egzersizi', type: 'peripheral', difficulty_levels: 'intermediate,advanced', duration_minutes: 8, is_active: 1 },
    { title: 'Zihinsel Haritalama', description: 'Okunan metni zihinsel haritalama egzersizi', type: 'mind_mapping', difficulty_levels: 'advanced', duration_minutes: 12, is_active: 1 },
    { title: 'Kelime Grupları', description: 'Kelime gruplarını hızlı okuma egzersizi', type: 'chunking', difficulty_levels: 'beginner,intermediate', duration_minutes: 6, is_active: 1 },
    { title: 'Sesli Okuma Hızı', description: 'İç sesi azaltma ve sessiz okuma hızı egzersizi', type: 'subvocalization', difficulty_levels: 'intermediate,advanced', duration_minutes: 8, is_active: 1 },
    { title: 'Regresyon Önleme', description: 'Geri dönüşleri azaltma egzersizi', type: 'regression', difficulty_levels: 'beginner,intermediate', duration_minutes: 5, is_active: 1 },
    { title: 'Metin Önizleme', description: 'Okumadan önce metni önizleme teknikleri', type: 'preview', difficulty_levels: 'intermediate,advanced', duration_minutes: 4, is_active: 1 },
  ];

  const insertExerciseTransaction = db.transaction((exercisesList) => {
    for (const exercise of exercisesList) {
      insertExercise.run(exercise.title, exercise.description, exercise.type, exercise.difficulty_levels, exercise.duration_minutes, exercise.is_active);
    }
  });

  insertExerciseTransaction(exercises);

  // Insert rewards
  const insertReward = db.prepare(`
    INSERT INTO rewards (title, description, type, threshold, icon)
    VALUES (?, ?, ?, ?, ?)
  `);

  const rewards = [
    { title: 'İlk Adım', description: 'İlk egzersizi tamamla', type: 'first_exercise', threshold: 1, icon: 'footprints' },
    { title: 'Hızlı Başlangıç', description: '5 egzersizi tamamla', type: 'exercises_completed', threshold: 5, icon: 'zap' },
    { title: 'Hız Ustası', description: '300 WPM hıza ulaş', type: 'wpm_milestone', threshold: 300, icon: 'gauge' },
    { title: 'Seri Takipçi', description: '7 gün üst üste egzersiz yap', type: 'streak', threshold: 7, icon: 'flame' },
    { title: 'Puan Avcısı', description: '1000 puan topla', type: 'points', threshold: 1000, icon: 'trophy' },
    { title: 'Seviye Atlama', description: 'Seviye 5\'e ulaş', type: 'level', threshold: 5, icon: 'arrow-up-circle' },
    { title: 'Maratoncu', description: '30 gün üst üste egzersiz yap', type: 'streak', threshold: 30, icon: 'medal' },
    { title: 'Hız Rekortmeni', description: '500 WPM hıza ulaş', type: 'wpm_milestone', threshold: 500, icon: 'rocket' },
  ];

  const insertRewardTransaction = db.transaction((rewardsList) => {
    for (const reward of rewardsList) {
      insertReward.run(reward.title, reward.description, reward.type, reward.threshold, reward.icon);
    }
  });

  insertRewardTransaction(rewards);

  // Insert some user exercise results
  const insertResult = db.prepare(`
    INSERT INTO user_exercise_results (user_id, exercise_id, score, wpm, completed_at)
    VALUES (?, ?, ?, ?, datetime('now', ?))
  `);

  const results = [
    { user_id: 1, exercise_id: 1, score: 85, wpm: 250, offset: '-1 days' },
    { user_id: 1, exercise_id: 2, score: 92, wpm: 280, offset: '-2 days' },
    { user_id: 1, exercise_id: 3, score: 78, wpm: 220, offset: '-3 days' },
    { user_id: 2, exercise_id: 1, score: 88, wpm: 200, offset: '-1 days' },
    { user_id: 2, exercise_id: 4, score: 95, wpm: 180, offset: '-2 days' },
    { user_id: 3, exercise_id: 1, score: 98, wpm: 450, offset: '-1 days' },
    { user_id: 3, exercise_id: 5, score: 96, wpm: 480, offset: '-2 days' },
    { user_id: 3, exercise_id: 6, score: 94, wpm: 420, offset: '-3 days' },
    { user_id: 4, exercise_id: 1, score: 65, wpm: 150, offset: '-1 days' },
    { user_id: 5, exercise_id: 2, score: 87, wpm: 320, offset: '-1 days' },
    { user_id: 5, exercise_id: 3, score: 91, wpm: 340, offset: '-2 days' },
    { user_id: 6, exercise_id: 1, score: 82, wpm: 260, offset: '-1 days' },
    { user_id: 7, exercise_id: 4, score: 93, wpm: 380, offset: '-1 days' },
    { user_id: 8, exercise_id: 1, score: 55, wpm: 120, offset: '-1 days' },
    { user_id: 9, exercise_id: 7, score: 99, wpm: 520, offset: '-1 days' },
    { user_id: 10, exercise_id: 1, score: 76, wpm: 190, offset: '-1 days' },
  ];

  const insertResultTransaction = db.transaction((resultsList) => {
    for (const result of resultsList) {
      insertResult.run(result.user_id, result.exercise_id, result.score, result.wpm, result.offset);
    }
  });

  insertResultTransaction(results);

  // Insert some user rewards
  const insertUserReward = db.prepare(`
    INSERT INTO user_rewards (user_id, reward_id, earned_at)
    VALUES (?, ?, datetime('now', ?))
  `);

  const userRewards = [
    { user_id: 1, reward_id: 1, offset: '-10 days' },
    { user_id: 1, reward_id: 2, offset: '-5 days' },
    { user_id: 1, reward_id: 3, offset: '-2 days' },
    { user_id: 2, reward_id: 1, offset: '-7 days' },
    { user_id: 2, reward_id: 2, offset: '-3 days' },
    { user_id: 3, reward_id: 1, offset: '-20 days' },
    { user_id: 3, reward_id: 2, offset: '-15 days' },
    { user_id: 3, reward_id: 3, offset: '-10 days' },
    { user_id: 3, reward_id: 5, offset: '-5 days' },
    { user_id: 3, reward_id: 6, offset: '-2 days' },
    { user_id: 5, reward_id: 1, offset: '-12 days' },
    { user_id: 5, reward_id: 4, offset: '-5 days' },
    { user_id: 9, reward_id: 1, offset: '-25 days' },
    { user_id: 9, reward_id: 8, offset: '-1 days' },
  ];

  const insertUserRewardTransaction = db.transaction((userRewardsList) => {
    for (const userReward of userRewardsList) {
      insertUserReward.run(userReward.user_id, userReward.reward_id, userReward.offset);
    }
  });

  insertUserRewardTransaction(userRewards);

  console.log(`Seeded ${users.length} users, ${exercises.length} exercises, ${rewards.length} rewards, ${results.length} results, and ${userRewards.length} user rewards.`);
}
