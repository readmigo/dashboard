import { Admin, Resource, CustomRoutes } from 'react-admin';
import { Route, BrowserRouter } from 'react-router-dom';
import { dataProvider } from '@/services/dataProvider';
import { authProvider } from '@/services/authProvider';
import { i18nProvider } from '@/i18n';
import { Dashboard } from '@/pages/Dashboard';
import { CustomLayout } from '@/components/CustomLayout';
import { CustomLoginPage } from '@/pages/CustomLoginPage';
import { readmigoTheme } from '@/theme';
import { resourceNavItems, routeNavItems } from '@/app/navigation';

export const App = () => (
  <BrowserRouter>
    <Admin
      dataProvider={dataProvider}
      authProvider={authProvider}
      i18nProvider={i18nProvider}
      dashboard={Dashboard}
      layout={CustomLayout}
      loginPage={CustomLoginPage}
      theme={readmigoTheme}
      title="Readmigo Admin"
    >
      {resourceNavItems.map((r) => (
        <Resource
          key={r.name}
          name={r.name}
          list={r.list}
          edit={r.edit}
          create={r.create}
          show={r.show}
          icon={r.Icon}
        />
      ))}
      <CustomRoutes>
        {routeNavItems.map((r) => (
          <Route key={r.path} path={r.path} element={<r.Component />} />
        ))}
      </CustomRoutes>
    </Admin>
  </BrowserRouter>
);
