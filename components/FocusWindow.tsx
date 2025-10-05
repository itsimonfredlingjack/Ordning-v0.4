import React from 'react';
import { Task, CalendarEvent } from '../types';
import TaskItem from './TaskItem';
import { useCountdown } from '../hooks/useCountdown';

interface FocusWindowProps {
  tasks: Task[];
  event: CalendarEvent;
  isLoading: boolean;
}

const SkeletonLoader: React.FC = () => (
  <div className="w-full h-full p-8 frosted-glass rounded-2xl soft-shadow flex flex-col animate-pulse">
    <div className="h-4 bg-gray-700/50 rounded w-1/3 mb-2"></div>
    <div className="h-6 bg-gray-700/50 rounded w-3/4 mb-1"></div>
    <div className="h-12 bg-gray-700/50 rounded w-full mb-8"></div>

    <div className="h-4 bg-gray-700/50 rounded w-1/2 mb-4"></div>
    <div className="space-y-3">
      <div className="h-12 bg-gray-700/50 rounded-lg w-full"></div>
      <div className="h-12 bg-gray-700/50 rounded-lg w-full"></div>
      <div className="h-12 bg-gray-700/50 rounded-lg w-full"></div>
    </div>
  </div>
);

const FocusWindow: React.FC<FocusWindowProps> = ({ tasks, event, isLoading }) => {
  const timeLeft = useCountdown(event.time);

  if (isLoading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="w-full h-full p-8 frosted-glass rounded-2xl soft-shadow flex flex-col">
      <h2 className="text-sm font-semibold tracking-widest text-gray-400 uppercase mb-2">NEXT EVENT</h2>
      <div className="mb-8">
        <p className="text-xl text-white font-semibold mb-1">{event.title}</p>
        <div className="flex items-baseline space-x-2 text-[#9B59B6]">
          <span className="text-5xl font-semibold tracking-tighter">{timeLeft.hours}</span>
          <span className="text-2xl opacity-75 font-medium">h</span>
          <span className="text-5xl font-semibold tracking-tighter">{timeLeft.minutes}</span>
          <span className="text-2xl opacity-75 font-medium">m</span>
          <span className="text-5xl font-semibold tracking-tighter">{timeLeft.seconds}</span>
          <span className="text-2xl opacity-75 font-medium">s</span>
        </div>
      </div>
      <h2 className="text-sm font-semibold tracking-widest text-gray-400 uppercase mb-4">PRIORITY TASKS</h2>
      <div className="space-y-3">
        {tasks.map(task => (
          <TaskItem key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
};

export default FocusWindow;
