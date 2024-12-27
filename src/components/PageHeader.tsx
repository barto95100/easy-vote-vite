import { FC, ReactNode } from 'react';

interface PageHeaderProps {
  icon: ReactNode;
  title: string;
  description: string;
}

const PageHeader: FC<PageHeaderProps> = ({ icon, title, description }) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-full mb-4">
        {icon}
      </div>
      <h2 className="text-4xl font-bold text-gray-900 text-center">{title}</h2>
      <p className="mt-1 text-m text-gray-500 text-center">{description}</p>
    </div>
  );
};

export default PageHeader; 