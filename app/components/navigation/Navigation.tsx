import { Link, useLocation } from 'react-router';
import { getNavigationRoutes } from '../../router/routes';

/**
 * Navigation Component
 * 
 * Automatically generates navigation based on route metadata.
 * This demonstrates how the programmatic route configuration
 * can be used to build UI components dynamically.
 */

interface NavigationProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export function Navigation({ 
  className = '', 
  orientation = 'horizontal' 
}: NavigationProps) {
  const location = useLocation();
  const navigationRoutes = getNavigationRoutes();

  const orientationClasses = {
    horizontal: 'flex flex-row space-x-4',
    vertical: 'flex flex-col space-y-2',
  };

  return (
    <nav className={`${orientationClasses[orientation]} ${className}`}>
      {navigationRoutes.map(({ path, metadata }) => {
        const isActive = location.pathname === path;
        
        return (
          <Link
            key={path}
            to={path}
            className={`
              flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
              ${isActive 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }
            `}
            aria-current={isActive ? 'page' : undefined}
          >
            {metadata.icon && (
              <span className="mr-2" role="img" aria-hidden="true">
                {metadata.icon}
              </span>
            )}
            <span>{metadata.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * Mobile Navigation Drawer
 * Example of how route metadata can be used in different UI patterns
 */
interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNavigation({ isOpen, onClose }: MobileNavigationProps) {
  const location = useLocation();
  const navigationRoutes = getNavigationRoutes();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-25"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-semibold text-gray-900">
              Navigation
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-gray-100"
              aria-label="Close navigation"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <nav className="space-y-2">
            {navigationRoutes.map(({ path, metadata }) => {
              const isActive = location.pathname === path;
              
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={onClose}
                  className={`
                    flex items-center px-3 py-3 rounded-lg text-base font-medium transition-colors w-full
                    ${isActive 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  {metadata.icon && (
                    <span className="mr-3 text-lg" role="img" aria-hidden="true">
                      {metadata.icon}
                    </span>
                  )}
                  <div>
                    <div className="font-medium">{metadata.title}</div>
                    {metadata.description && (
                      <div className="text-sm text-gray-500 mt-0.5">
                        {metadata.description}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}

/**
 * Breadcrumb Component
 * Another example of using route metadata for navigation UI
 */
export function Breadcrumbs() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  if (pathSegments.length === 0) return null;

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <Link 
            to="/" 
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            🏠 Home
          </Link>
        </li>
        {pathSegments.map((segment, index) => {
          const path = '/' + pathSegments.slice(0, index + 1).join('/');
          const isLast = index === pathSegments.length - 1;
          
          return (
            <li key={path} className="flex items-center">
              <svg 
                className="flex-shrink-0 h-5 w-5 text-gray-300 mx-2" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              {isLast ? (
                <span className="text-gray-500 font-medium capitalize">
                  {segment}
                </span>
              ) : (
                <Link 
                  to={path} 
                  className="text-gray-400 hover:text-gray-500 transition-colors capitalize"
                >
                  {segment}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}