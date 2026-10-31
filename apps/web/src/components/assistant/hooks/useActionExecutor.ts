import { useRouter } from 'next/navigation';

export interface UiAction {
  action: 'navigate' | 'highlight' | 'tour';
  payload?: Record<string, unknown>;
}

export function useActionExecutor() {
  const router = useRouter();

  const executeAction = (
    action: UiAction,
    handlers: {
      onHighlight: (targetId: string) => void;
      onStartTour: (tourId: string) => void;
    },
  ) => {
    switch (action.action) {
      case 'navigate': {
        const path = (action.payload?.path as string) || '/';
        router.push(path);
        break;
      }
      case 'highlight': {
        const targetId = action.payload?.targetId as string;
        if (targetId) handlers.onHighlight(targetId);
        break;
      }
      case 'tour': {
        const tourId = action.payload?.tourId as string;
        if (tourId) handlers.onStartTour(tourId);
        break;
      }
    }
  };

  return { executeAction };
}

