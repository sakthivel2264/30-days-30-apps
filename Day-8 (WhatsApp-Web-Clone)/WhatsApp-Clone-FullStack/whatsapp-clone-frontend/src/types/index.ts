export interface User {
  _id: string;
  username: string;
}

export interface Message {
  timestamp: number;
  from: string;
  to: string;
  content: string;
}
