import Link from "next/link";

export const NotFound: React.FC = (): JSX.Element => {
  return (
    <div className="min-h-screen bg-white px-4 py-16 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
      <div className="mx-auto max-w-max">
        <main className="sm:flex">
          <p className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-7xl">
            404
          </p>
          <div className="sm:ml-6">
            <div className="sm:border-l sm:border-gray-200 sm:pl-6">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                Page not found
              </h1>
              <p className="mt-1 text-base text-gray-500">
                Please check the URL in the address bar and try again.
              </p>
            </div>

            <div className="mt-10 flex space-x-3 sm:border-l sm:border-transparent sm:pl-6">
              <Link href="mailto:contact@planetfall.io">
                <div className="hover:cursor-pointer whitespace-nowrap md:px-4 md:py-3 font-medium inline-flex items-center justify-center md:border border-slate-900 rounded leading-snug transition  ease-in-out  md:bg-white md:text-slate-9000 md:hover:bg-slate-50 hover:text-slate-900  w-full shadow-sm group duration-300">
                  Contact Support
                </div>
              </Link>
              <Link href="https://planetfall.io">
                <div className="hover:cursor-pointer whitespace-nowrap md:px-4 md:py-3 font-medium inline-flex items-center justify-center md:border border-slate-900 rounded leading-snug transition  ease-in-out  md:bg-slate-900 md:text-slate-50 md:hover:bg-slate-50 hover:text-slate-900  w-full shadow-sm group duration-300">
                  Go Back Home
                </div>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
