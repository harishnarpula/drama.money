export const stories = [
  { name: 'Private jobs', initials: 'PJ', color: '#ee7c32' },
  { name: 'Interviews', initials: 'IN', color: '#7958c5' },
  { name: 'Skills', initials: 'SK', color: '#0f8c86' },
  { name: 'Govt exams', initials: 'GE', color: '#e24f45' },
  { name: 'Resume tips', initials: 'CV', color: '#2979a8' },
  { name: 'Freshers', initials: 'FR', color: '#c47a20' },
]

export const feedPosts = [
  {
    id: 1,
    name: 'Ananya Rao',
    username: 'ananya.careers',
    initials: 'SR',
    time: '18m',
    category: 'Interview preparation',
    title: 'Tell me about yourself — a simple structure that works',
    description: 'Use Present → Past → Future. Keep your answer under 60 seconds and connect it to the role.',
    likes: '1,284',
    comments: '96',
    views: '8.4K',
    aspectRatio: 8 / 12,
    tone: 'coral',
  },
  {
    id: 2,
    name: 'Arjun Skills',
    username: 'arjun.builds',
    initials: 'AS',
    time: '1h',
    category: 'Skill building',
    title: 'Three Excel shortcuts every fresher should know',
    description: 'Save this and practise each shortcut today. Small skills create a big first impression.',
    likes: '863',
    comments: '41',
    views: '5.7K',
    aspectRatio: 12 / 8,
    tone: 'teal',
  },
]

export const notifications = [
  { initials: 'AR', text: 'Ananya Rao liked your video.', time: '2m', type: 'like' },
  { initials: 'AK', text: 'Akhil started following you.', time: '18m', type: 'follow' },
  { initials: 'MN', text: 'Manasa commented: “Very useful explanation!”', time: '1h', type: 'comment' },
  { initials: 'DM', text: 'Your video “Resume mistakes” was approved.', time: '3h', type: 'approved' },
  { initials: 'RV', text: 'Ravi saved your interview preparation video.', time: 'Yesterday', type: 'save' },
]

export const creatorVideos = [
  { title: 'Resume mistakes freshers make', status: 'Live', views: '4,820', likes: '612', comments: '48', earning: '₹40' },
  { title: 'My first HR interview tip', status: 'In review', views: '—', likes: '—', comments: '—', earning: '—' },
  { title: 'Three ways to learn React', status: 'Processing', views: '—', likes: '—', comments: '—', earning: '—' },
  { title: 'How to prepare in one day', status: 'Rejected', views: '—', likes: '—', comments: '—', earning: '—' },
]
