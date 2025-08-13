import type { MoodEntry } from '../types';
import { format, subDays } from 'date-fns';

export const generateDummyMoodEntries = (): MoodEntry[] => {
  const entries: MoodEntry[] = [
    // Day 30 (oldest)
    {
      id: 'mood-1',
      date: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
      mood: 'good',
      note: 'Started a new workout routine today. Feeling motivated and energetic!',
      factors: ['🏃‍♂️ Exercise', '💤 Sleep', '🌤️ Weather'],
      timestamp: Date.now() - (30 * 24 * 60 * 60 * 1000)
    },
    
    // Day 29
    {
      id: 'mood-2',
      date: format(subDays(new Date(), 29), 'yyyy-MM-dd'),
      mood: 'excellent',
      note: 'Had an amazing day at work! Got promoted and celebrated with friends.',
      factors: ['💼 Work', '👥 Social', '🎵 Music', '🍎 Diet'],
      timestamp: Date.now() - (29 * 24 * 60 * 60 * 1000)
    },
    
    // Day 28
    {
      id: 'mood-3',
      date: format(subDays(new Date(), 28), 'yyyy-MM-dd'),
      mood: 'good',
      note: 'Quiet Sunday. Read a good book and did some meal prep.',
      factors: ['📚 Learning', '🍎 Diet', '💤 Sleep'],
      timestamp: Date.now() - (28 * 24 * 60 * 60 * 1000)
    },
    
    // Day 27
    {
      id: 'mood-4',
      date: format(subDays(new Date(), 27), 'yyyy-MM-dd'),
      mood: 'okay',
      note: 'Monday blues. Work was stressful but managed to get through it.',
      factors: ['💼 Work', '☕ Caffeine'],
      timestamp: Date.now() - (27 * 24 * 60 * 60 * 1000)
    },
    
    // Day 26
    {
      id: 'mood-5',
      date: format(subDays(new Date(), 26), 'yyyy-MM-dd'),
      mood: 'bad',
      note: 'Didn\'t sleep well last night. Feeling tired and irritable.',
      factors: ['💤 Sleep', '☕ Caffeine', '🌤️ Weather'],
      timestamp: Date.now() - (26 * 24 * 60 * 60 * 1000)
    },
    
    // Day 25
    {
      id: 'mood-6',
      date: format(subDays(new Date(), 25), 'yyyy-MM-dd'),
      mood: 'okay',
      note: 'Better day today. Took a nice walk during lunch break.',
      factors: ['🏃‍♂️ Exercise', '🌤️ Weather', '💼 Work'],
      timestamp: Date.now() - (25 * 24 * 60 * 60 * 1000)
    },
    
    // Day 24
    {
      id: 'mood-7',
      date: format(subDays(new Date(), 24), 'yyyy-MM-dd'),
      mood: 'good',
      note: 'Great yoga session this morning. Feeling centered and calm.',
      factors: ['🏃‍♂️ Exercise', '🧘‍♀️ Meditation', '💤 Sleep'],
      timestamp: Date.now() - (24 * 24 * 60 * 60 * 1000)
    },
    
    // Day 23
    {
      id: 'mood-8',
      date: format(subDays(new Date(), 23), 'yyyy-MM-dd'),
      mood: 'excellent',
      note: 'Weekend getaway with family. Beautiful weather and lots of laughs.',
      factors: ['👥 Social', '🌤️ Weather', '🎵 Music', '🍎 Diet'],
      timestamp: Date.now() - (23 * 24 * 60 * 60 * 1000)
    },
    
    // Day 22
    {
      id: 'mood-9',
      date: format(subDays(new Date(), 22), 'yyyy-MM-dd'),
      mood: 'good',
      note: 'Productive day. Finished a big project and learned something new.',
      factors: ['💼 Work', '📚 Learning', '☕ Caffeine'],
      timestamp: Date.now() - (22 * 24 * 60 * 60 * 1000)
    },
    
    // Day 21
    {
      id: 'mood-10',
      date: format(subDays(new Date(), 21), 'yyyy-MM-dd'),
      mood: 'okay',
      note: 'Rainy day. Stayed indoors and watched movies.',
      factors: ['🌤️ Weather', '🎮 Entertainment'],
      timestamp: Date.now() - (21 * 24 * 60 * 60 * 1000)
    },
    
    // Day 20
    {
      id: 'mood-11',
      date: format(subDays(new Date(), 20), 'yyyy-MM-dd'),
      mood: 'terrible',
      note: 'Food poisoning. Spent most of the day in bed feeling awful.',
      factors: ['💊 Health', '🍎 Diet'],
      timestamp: Date.now() - (20 * 24 * 60 * 60 * 1000)
    },
    
    // Day 19
    {
      id: 'mood-12',
      date: format(subDays(new Date(), 19), 'yyyy-MM-dd'),
      mood: 'bad',
      note: 'Still recovering. Feeling weak but slightly better.',
      factors: ['💊 Health', '💤 Sleep'],
      timestamp: Date.now() - (19 * 24 * 60 * 60 * 1000)
    },
    
    // Day 18
    {
      id: 'mood-13',
      date: format(subDays(new Date(), 18), 'yyyy-MM-dd'),
      mood: 'okay',
      note: 'Back to normal activities. Taking it slow today.',
      factors: ['💊 Health', '🍎 Diet', '💤 Sleep'],
      timestamp: Date.now() - (18 * 24 * 60 * 60 * 1000)
    },
    
    // Day 17
    {
      id: 'mood-14',
      date: format(subDays(new Date(), 17), 'yyyy-MM-dd'),
      mood: 'good',
      note: 'Feeling much better! Had a great video call with old friends.',
      factors: ['👥 Social', '💊 Health', '🎵 Music'],
      timestamp: Date.now() - (17 * 24 * 60 * 60 * 1000)
    },
    
    // Day 16
    {
      id: 'mood-15',
      date: format(subDays(new Date(), 16), 'yyyy-MM-dd'),
      mood: 'excellent',
      note: 'Perfect Saturday! Morning run, farmer\'s market, and cooking.',
      factors: ['🏃‍♂️ Exercise', '🍎 Diet', '🌤️ Weather', '👥 Social'],
      timestamp: Date.now() - (16 * 24 * 60 * 60 * 1000)
    },
    
    // Day 15
    {
      id: 'mood-16',
      date: format(subDays(new Date(), 15), 'yyyy-MM-dd'),
      mood: 'good',
      note: 'Lazy Sunday. Caught up on reading and did some gardening.',
      factors: ['📚 Learning', '🌤️ Weather', '💤 Sleep'],
      timestamp: Date.now() - (15 * 24 * 60 * 60 * 1000)
    },
    
    // Day 14
    {
      id: 'mood-17',
      date: format(subDays(new Date(), 14), 'yyyy-MM-dd'),
      mood: 'okay',
      note: 'Monday motivation is low. Need more coffee.',
      factors: ['💼 Work', '☕ Caffeine', '💤 Sleep'],
      timestamp: Date.now() - (14 * 24 * 60 * 60 * 1000)
    },
    
    // Day 13
    {
      id: 'mood-18',
      date: format(subDays(new Date(), 13), 'yyyy-MM-dd'),
      mood: 'good',
      note: 'Team building event at work. Had fun and met new colleagues.',
      factors: ['💼 Work', '👥 Social', '🎵 Music'],
      timestamp: Date.now() - (13 * 24 * 60 * 60 * 1000)
    },
    
    // Day 12
    {
      id: 'mood-19',
      date: format(subDays(new Date(), 12), 'yyyy-MM-dd'),
      mood: 'excellent',
      note: 'Date night! Great dinner and saw an amazing concert.',
      factors: ['👥 Social', '🎵 Music', '🍎 Diet', '🌤️ Weather'],
      timestamp: Date.now() - (12 * 24 * 60 * 60 * 1000)
    },
    
    // Day 11
    {
      id: 'mood-20',
      date: format(subDays(new Date(), 11), 'yyyy-MM-dd'),
      mood: 'good',
      note: 'Started a new online course. Excited to learn new skills.',
      factors: ['📚 Learning', '💼 Work', '☕ Caffeine'],
      timestamp: Date.now() - (11 * 24 * 60 * 60 * 1000)
    },
    
    // Day 10
    {
      id: 'mood-21',
      date: format(subDays(new Date(), 10), 'yyyy-MM-dd'),
      mood: 'okay',
      note: 'Busy day with back-to-back meetings. Feeling a bit overwhelmed.',
      factors: ['💼 Work', '☕ Caffeine'],
      timestamp: Date.now() - (10 * 24 * 60 * 60 * 1000)
    },
    
    // Day 9
    {
      id: 'mood-22',
      date: format(subDays(new Date(), 9), 'yyyy-MM-dd'),
      mood: 'bad',
      note: 'Argument with a friend. Feeling upset and confused.',
      factors: ['👥 Social', '💤 Sleep'],
      timestamp: Date.now() - (9 * 24 * 60 * 60 * 1000)
    },
    
    // Day 8
    {
      id: 'mood-23',
      date: format(subDays(new Date(), 8), 'yyyy-MM-dd'),
      mood: 'okay',
      note: 'Took time to reflect. Did some journaling and meditation.',
      factors: ['🧘‍♀️ Meditation', '📚 Learning', '💤 Sleep'],
      timestamp: Date.now() - (8 * 24 * 60 * 60 * 1000)
    },
    
    // Day 7
    {
      id: 'mood-24',
      date: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
      mood: 'good',
      note: 'Resolved the issue with my friend. Communication is key!',
      factors: ['👥 Social', '🧘‍♀️ Meditation', '🎵 Music'],
      timestamp: Date.now() - (7 * 24 * 60 * 60 * 1000)
    },
    
    // Day 6
    {
      id: 'mood-25',
      date: format(subDays(new Date(), 6), 'yyyy-MM-dd'),
      mood: 'excellent',
      note: 'Beach day! Perfect weather, good food, and great company.',
      factors: ['🌤️ Weather', '👥 Social', '🍎 Diet', '🏃‍♂️ Exercise'],
      timestamp: Date.now() - (6 * 24 * 60 * 60 * 1000)
    },
    
    // Day 5
    {
      id: 'mood-26',
      date: format(subDays(new Date(), 5), 'yyyy-MM-dd'),
      mood: 'good',
      note: 'Productive weekend. Cleaned the house and organized everything.',
      factors: ['🏃‍♂️ Exercise', '🎵 Music', '💤 Sleep'],
      timestamp: Date.now() - (5 * 24 * 60 * 60 * 1000)
    },
    
    // Day 4
    {
      id: 'mood-27',
      date: format(subDays(new Date(), 4), 'yyyy-MM-dd'),
      mood: 'okay',
      note: 'Monday again. Coffee isn\'t working its magic today.',
      factors: ['💼 Work', '☕ Caffeine', '💤 Sleep'],
      timestamp: Date.now() - (4 * 24 * 60 * 60 * 1000)
    },
    
    // Day 3
    {
      id: 'mood-28',
      date: format(subDays(new Date(), 3), 'yyyy-MM-dd'),
      mood: 'good',
      note: 'Great presentation at work. Feeling confident and appreciated.',
      factors: ['💼 Work', '👥 Social', '☕ Caffeine'],
      timestamp: Date.now() - (3 * 24 * 60 * 60 * 1000)
    },
    
    // Day 2
    {
      id: 'mood-29',
      date: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
      mood: 'excellent',
      note: 'Surprise visit from family! Cooked together and shared stories.',
      factors: ['👥 Social', '🍎 Diet', '🎵 Music', '💤 Sleep'],
      timestamp: Date.now() - (2 * 24 * 60 * 60 * 1000)
    },
    
    // Yesterday
    {
      id: 'mood-30',
      date: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
      mood: 'good',
      note: 'Tried a new recipe and it turned out amazing! Feeling creative.',
      factors: ['🍎 Diet', '🎵 Music', '📚 Learning'],
      timestamp: Date.now() - (1 * 24 * 60 * 60 * 1000)
    },
    
    // Today
    {
      id: 'mood-31',
      date: format(new Date(), 'yyyy-MM-dd'),
      mood: 'excellent',
      note: 'Starting fresh! Working on my mood tracker app and feeling inspired.',
      factors: ['💼 Work', '📚 Learning', '☕ Caffeine', '🎵 Music'],
      timestamp: Date.now()
    }
  ];

  return entries;
};

// Helper function to load dummy data into your mood tracker
export const loadDummyData = () => {
  const dummyEntries = generateDummyMoodEntries();
  localStorage.setItem('mood-tracker-entries', JSON.stringify(dummyEntries));
  return dummyEntries;
};
