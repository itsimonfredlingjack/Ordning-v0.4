
export enum MessageAuthor {
  USER = 'user',
  AI = 'ai',
}

export interface Message {
  id: string;
  text: string;
  author: MessageAuthor;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export interface CalendarEvent {
  title: string;
  time: Date;
}
