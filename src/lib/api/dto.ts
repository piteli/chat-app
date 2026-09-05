export interface UserDto {
  id: number;
  name: string;
  username: string;
  email: string;
  avatar: string;
  phone: string;
  website: string;
  address: { street: string; city: string; zipcode: string };
}

export interface PostDto {
  id: number;
  userId: number;
  title: string;
  body: string;
  tags: string[];
  category: string;
  createdAt: string;
  updatedAt?: string;
  slug?: string;
}

export interface CreatePostDto {
  userId: number;
  title: string;
  body: string;
  category?: string;
  tags?: string[];
}
