import React from "react";

export type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode[];
};
export const PageHeader: React.FC<PageHeaderProps> = (props): JSX.Element => {
  return (
    <div className="border-b border-gray-200 pb-5 sm:flex sm:items-center sm:justify-between mb-8 md:mb-16 ">
      <div className="sm:flex-auto">
        <h1 className="text-xl font-semibold text-slate-900">{props.title}</h1>
        <p className="mt-2 text-sm text-slate-700">
          {props.description}
        </p>
      </div>
      <div className="mt-3 flex sm:mt-0 sm:ml-4">
        {props.actions}
      </div>
    </div>
  );
};
