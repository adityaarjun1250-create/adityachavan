
export interface Message {
  role: 'user' | 'jarvis';
  content: string;
  imageUrl?: string;
  timestamp: Date;
}

export interface Thread {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

export enum JarvisState {
  IDLE = 'IDLE',
  LISTENING = 'LISTENING',
  THINKING = 'THINKING',
  SPEAKING = 'SPEAKING',
}
