export interface PatchBody {
  username?: string;
  profile?: { firstName?: string; lastName?: string; bio?: string };
}

export interface PostUser {
  email: string;
  username: string;
  password: string;
  profile: {
    firstName: string;
    lastName: string;
    bio?: string;
  };
}
