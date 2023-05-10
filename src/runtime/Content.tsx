import { useRoutes } from 'react-router-dom';

import { routes } from 'swdoc:routes';

export const Content = () => {
  const routeElement = useRoutes(routes);
  return routeElement;
};
