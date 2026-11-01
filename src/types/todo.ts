export interface TodoPostBody {
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface TodoPutBody {
  text?: string;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
}
