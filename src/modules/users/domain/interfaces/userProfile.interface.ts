export interface UserProfileWithRoles {
  id: number;
  name: string;
  description: string;
  roles: string[];
}

export interface UserProfile {
  id: number;
  title: string;
  code: string;
  description: string;
  enabled: boolean;
}
