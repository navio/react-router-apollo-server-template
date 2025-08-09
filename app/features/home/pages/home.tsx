import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import { Navigation, Breadcrumbs } from "../../../components/navigation";

export const meta: MetaFunction = () => {
  return [
    { title: "React Router + Apollo SSR" },
    { name: "description", content: "Welcome to React Router with Apollo GraphQL SSR!" },
  ];
};

export default function Index() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Navigation */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                React Router + Apollo SSR
              </h1>
            </div>
            <Navigation className="hidden md:flex" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs />
        </div>

        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to React Router + Apollo SSR
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl">
            This is a demo application showcasing server-side rendering with React Router 7 and Apollo Client.
            The application now features programmatic route configuration instead of file-based routing.
          </p>

          {/* Quick Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Link
              to="/characters"
              className="group relative bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">👥</span>
                <div>
                  <h3 className="font-semibold text-lg">Characters</h3>
                  <p className="text-blue-100 text-sm">Browse Rick and Morty characters</p>
                </div>
              </div>
            </Link>

            <Link
              to="/internal"
              className="group relative bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">⚕️</span>
                <div>
                  <h3 className="font-semibold text-lg">Internal Health</h3>
                  <p className="text-green-100 text-sm">Server health and internal data</p>
                </div>
              </div>
            </Link>

            <Link
              to="/campaign-builder"
              className="group relative bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📊</span>
                <div>
                  <h3 className="font-semibold text-lg">Campaign Builder</h3>
                  <p className="text-purple-100 text-sm">Create marketing campaigns</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Features Section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              ✨ Features & Architecture
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✅</span>
                  <span className="text-gray-700">Server-Side Rendering (SSR)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✅</span>
                  <span className="text-gray-700">Apollo Client with GraphQL</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✅</span>
                  <span className="text-gray-700">React Router 7 (Config-based)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✅</span>
                  <span className="text-gray-700">Vite bundler</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✅</span>
                  <span className="text-gray-700">TypeScript support</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✅</span>
                  <span className="text-gray-700">Jest testing setup</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✅</span>
                  <span className="text-gray-700">Campaign Builder with Zod validation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✅</span>
                  <span className="text-gray-700">Global Toast System (Zustand)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}