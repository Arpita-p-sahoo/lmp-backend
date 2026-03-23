import { Injectable } from '@nestjs/common';

type User = {
  id: string;
  name: string;
};

type Comment = {
  id: string;
  author: User;
  text: string;
  createdAt: string;
  replies?: Comment[];
};

type Question = {
  id: string;
  title: string;
  techTag: string;
  hashtags: string[];
  votes: number;
  comments: number;
  author: User;
  createdAt: string;
  isHot?: boolean;
  isNew?: boolean;
  isSaved?: boolean;
  isVoted?: boolean;
  thread?: Comment[];
};

@Injectable()
export class AppService {
  private readonly questions: Question[] = [
    {
      id: '1',
      title:
        'What is the difference between Angular Signals and NgRx? When would you choose one over the other in a large-scale app?',
      techTag: 'Angular',
      hashtags: ['#signals', '#ngrx'],
      votes: 284,
      comments: 2,
      author: { id: 'r1', name: 'Rahul Dev' },
      createdAt: new Date().toISOString(),
      isHot: true,
      isVoted: true,
      thread: [
        {
          id: 'c1',
          author: { id: '1', name: 'Arpita Sahoo' },
          text: 'Signals simplify reactive state without boilerplate. NgRx is great for complex flows.',
          createdAt: new Date().toISOString(),
          replies: [
            {
              id: 'c1-1',
              author: { id: 's1', name: 'Sneha Backend' },
              text: 'Agree. For cross-module state and effects, NgRx still shines.',
              createdAt: new Date().toISOString(),
            },
          ],
        },
      ],
    },
    {
      id: '2',
      title:
        'Explain the Node.js event loop in detail. How does it handle I/O operations without blocking the main thread?',
      techTag: 'Node.js',
      hashtags: ['#eventloop', '#async'],
      votes: 201,
      comments: 0,
      author: { id: 's1', name: 'Sneha Backend' },
      createdAt: new Date().toISOString(),
      isNew: true,
    },
  ];

  getHealth(): { ok: true; name: string; time: string } {
    return { ok: true, name: 'lmp-backend', time: new Date().toISOString() };
  }

  getQuestions(): Question[] {
    return this.questions;
  }
}
