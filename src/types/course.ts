export interface Instructor {
  id: string;
  name: string;
  avatar: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  instructor: Instructor;
  price?: number;
  category?: string;
}

export interface UserStats {
  enrolledCount: number;
  bookmarkCount: number;
  progressPercent: number;
}
