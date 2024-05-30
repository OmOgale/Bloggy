export interface User {
  ip: string; // Hashed ip-address of the user
  likes: {
    [blogID: string]: number;
  };
}

export interface BlogPost {
  uuid: string;
  tags: Array<string>;
  title: string;
  slug: string;
  summary: string;
  content: string;
  userAvatars: Array<string>;
  images: Array<string>;
  usernames: Array<string>;
  createdAt: string;
  readTime: string;
  likes: number;
  views: number;
  published: boolean;
}
