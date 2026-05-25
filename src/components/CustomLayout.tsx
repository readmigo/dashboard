import { Suspense } from 'react';
import { Layout, LayoutProps, Loading } from 'react-admin';
import { CustomAppBar } from './CustomAppBar';
import { CustomMenu } from './CustomMenu';

// Suspense scopes the lazy-route fallback to the content area, so the menu and
// app bar stay mounted while a page chunk loads.
export const CustomLayout = ({ children, ...props }: LayoutProps) => (
  <Layout {...props} appBar={CustomAppBar} menu={CustomMenu}>
    <Suspense fallback={<Loading />}>{children}</Suspense>
  </Layout>
);
