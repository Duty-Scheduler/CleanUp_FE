export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  code: string;
  isOwner: boolean;
  members: TeamMember[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  time: string;
  teamName: string;
  teamCode: string;
  assignees: TeamMember[];
  status: 'pending' | 'in-progress' | 'completed';
}

export interface Reminder {
  id: string;
  title: string;
  time: string;
  color: string;
}

export interface Activity {
  id: string;
  type: 'completed' | 'joined' | 'created';
  title: string;
  subtitle: string;
  time: string;
}

// Current user
export const currentUser: User = {
  id: '1',
  name: 'User',
  email: 'Loisbecket@gmail.com',
  avatar: undefined,
};

// Teams data
export const myTeams: Team[] = [
  {
    id: '1',
    name: 'Team Alpha',
    description: 'Team phụ trách ca sáng',
    memberCount: 3,
    code: 'ALPHA123',
    isOwner: true,
    members: [
      { id: '1', name: 'You' },
      { id: '2', name: 'John' },
      { id: '3', name: 'Jane' },
    ],
  },
  {
    id: '2',
    name: 'Team Beta',
    description: 'Team phụ trách ca chiều',
    memberCount: 2,
    code: 'BETA456',
    isOwner: false,
    members: [
      { id: '1', name: 'You' },
      { id: '4', name: 'Mike' },
    ],
  },
];

export const otherTeams: Team[] = [
  {
    id: '3',
    name: 'Team Gamma',
    description: 'Team phụ trách ca tối',
    memberCount: 5,
    code: 'GAMMA789',
    isOwner: false,
    members: [],
  },
];

// Today's schedule
export const todayTasks: Task[] = [
  {
    id: '1',
    title: 'Dọn dẹp phòng vệ sinh tầng 5 và lau sàn các phòng',
    description: 'Hoàn thành trước 10:00',
    time: '07:00',
    teamName: 'Team Alpha',
    teamCode: 'ALPHA123',
    assignees: [
      { id: '1', name: 'You' },
      { id: '2', name: 'John' },
      { id: '3', name: 'Jane' },
    ],
    status: 'in-progress',
  },
];

// Reminders
export const reminders: Reminder[] = [
  {
    id: '1',
    title: 'Trực nhật phòng học',
    time: '7:00 - 8:00',
    color: '#2196F3',
  },
  {
    id: '2',
    title: 'Quét sân và dãy hành',
    time: '8:00 - 9:00',
    color: '#FF9800',
  },
];

// Recent activities
export const recentActivities: Activity[] = [
  {
    id: '1',
    type: 'completed',
    title: 'Completed: Jury of Bri...',
    subtitle: 'Yesterday, 2:30 PM',
    time: '2h ago',
  },
  {
    id: '2',
    type: 'joined',
    title: 'Joined: Team Alpha',
    subtitle: 'Yesterday, 2:30 PM',
    time: '5h ago',
  },
  {
    id: '3',
    type: 'created',
    title: 'Create: Clean area',
    subtitle: 'Yesterday',
    time: '1d ago',
  },
];

// Calendar dates
export const getWeekDates = () => {
  const today = new Date();
  const dates = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  for (let i = -3; i <= 3; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push({
      day: date.getDate(),
      dayName: dayNames[date.getDay()].substring(0, 2),
      isToday: i === 0,
      date: date,
    });
  }
  return dates;
};
