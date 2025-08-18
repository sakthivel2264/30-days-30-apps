
import React from 'react';

const ViewGoogleConnections: React.FC = () => (
  <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
    <header className="mb-8 w-full max-w-lg">
      <h1 className="text-3xl font-bold text-indigo-700 tracking-tight text-center">
        Connected Apps & Websites
      </h1>
      <p className="text-center text-gray-500 mt-2">
        Manage your “Sign in with Google” connections securely.
      </p>
    </header>
    <section className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full">
      <h2 className="text-2xl font-semibold mb-4 text-indigo-600">
        See Where Your Google Account is Used
      </h2>
      <p className="mb-6 text-gray-600 leading-relaxed">
        Google securely maintains a list of every app and site where you’ve authenticated with “Sign in with Google”.
        For privacy and protection, this information is only accessible on the official Google dashboard.
        Click below to see and manage all your authorized connections.
      </p>
      <div className="flex justify-center">
        <a
          href="https://myaccount.google.com/permissions"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-md font-medium text-lg shadow hover:bg-indigo-700 transition"
        >
          View My Connected Apps & Sites
        </a>
      </div>
    </section>
    <footer className="mt-12 text-sm text-gray-400 text-center">
      &copy; {new Date().getFullYear()} Google Account Helper
    </footer>
  </main>
);

export default ViewGoogleConnections;
