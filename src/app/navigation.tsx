import { lazy, type ComponentType } from 'react';
import type { EnvironmentConfig } from '@/config/environments';
import BookIcon from '@mui/icons-material/MenuBook';
import PeopleIcon from '@mui/icons-material/People';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CategoryIcon from '@mui/icons-material/Category';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import PersonIcon from '@mui/icons-material/Person';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import FeedbackIcon from '@mui/icons-material/Feedback';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MailIcon from '@mui/icons-material/Mail';
import BarChartIcon from '@mui/icons-material/BarChart';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import RateReviewIcon from '@mui/icons-material/RateReview';
import HubIcon from '@mui/icons-material/Hub';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import HighlightIcon from '@mui/icons-material/Highlight';

const lazyNamed = (loader: () => Promise<Record<string, unknown>>, name: string): ComponentType =>
  lazy(() => loader().then((m) => ({ default: m[name] as ComponentType })));

// CRUD resource pages
const BookList = lazyNamed(() => import('@/pages/books'), 'BookList');
const BookEdit = lazyNamed(() => import('@/pages/books'), 'BookEdit');
const BookCreate = lazyNamed(() => import('@/pages/books'), 'BookCreate');
const BookShow = lazyNamed(() => import('@/pages/books'), 'BookShow');
const AuthorList = lazyNamed(() => import('@/pages/authors'), 'AuthorList');
const AuthorEdit = lazyNamed(() => import('@/pages/authors'), 'AuthorEdit');
const AuthorShow = lazyNamed(() => import('@/pages/authors'), 'AuthorShow');
const BookListList = lazyNamed(() => import('@/pages/booklists'), 'BookListList');
const BookListEdit = lazyNamed(() => import('@/pages/booklists'), 'BookListEdit');
const BookListCreate = lazyNamed(() => import('@/pages/booklists'), 'BookListCreate');
const BookListShow = lazyNamed(() => import('@/pages/booklists'), 'BookListShow');
const CategoryList = lazyNamed(() => import('@/pages/categories'), 'CategoryList');
const CategoryEdit = lazyNamed(() => import('@/pages/categories'), 'CategoryEdit');
const CategoryCreate = lazyNamed(() => import('@/pages/categories'), 'CategoryCreate');
const UserList = lazyNamed(() => import('@/pages/users'), 'UserList');
const UserShow = lazyNamed(() => import('@/pages/users'), 'UserShow');
const QuoteList = lazyNamed(() => import('@/pages/quotes'), 'QuoteList');
const QuoteEdit = lazyNamed(() => import('@/pages/quotes'), 'QuoteEdit');
const QuoteCreate = lazyNamed(() => import('@/pages/quotes'), 'QuoteCreate');
const QuoteShow = lazyNamed(() => import('@/pages/quotes'), 'QuoteShow');
const ImportBatchList = lazyNamed(() => import('@/pages/import-batches'), 'ImportBatchList');
const ImportBatchShow = lazyNamed(() => import('@/pages/import-batches'), 'ImportBatchShow');
const TicketList = lazyNamed(() => import('@/pages/tickets'), 'TicketList');
const TicketShow = lazyNamed(() => import('@/pages/tickets'), 'TicketShow');
const FeedbackList = lazyNamed(() => import('@/pages/feedback'), 'FeedbackList');
const FeedbackShow = lazyNamed(() => import('@/pages/feedback'), 'FeedbackShow');
const GuestFeedbackList = lazyNamed(() => import('@/pages/guest-feedback'), 'GuestFeedbackList');
const GuestFeedbackShow = lazyNamed(() => import('@/pages/guest-feedback'), 'GuestFeedbackShow');
const OrderList = lazyNamed(() => import('@/pages/orders'), 'OrderList');
const OrderShow = lazyNamed(() => import('@/pages/orders'), 'OrderShow');
const MessageList = lazyNamed(() => import('@/pages/messages'), 'MessageList');
const MessageShow = lazyNamed(() => import('@/pages/messages'), 'MessageShow');

// Standalone (custom route) pages
const ServiceHub = lazyNamed(() => import('@/pages/services'), 'ServiceHub');
const ReadingStatsPage = lazyNamed(() => import('@/pages/reading-stats'), 'ReadingStatsPage');
const SubscriptionDashboard = lazyNamed(() => import('@/pages/subscriptions'), 'SubscriptionDashboard');
const SEIncrementalImport = lazyNamed(() => import('@/pages/se-import'), 'SEIncrementalImport');
const PushNotificationsPage = lazyNamed(() => import('@/pages/push-notifications'), 'PushNotificationsPage');
const HighlightAnalyticsPage = lazyNamed(() => import('@/pages/highlight-analytics'), 'HighlightAnalyticsPage');
const DailyReportPage = lazyNamed(() => import('@/pages/daily-report'), 'DailyReportPage');
const CostManagementPage = lazyNamed(() => import('@/pages/cost-management'), 'CostManagementPage');
const SupportDashboard = lazyNamed(() => import('@/pages/support'), 'SupportDashboard');

export type NavSection = 'main' | 'operations' | 'support';

interface NavCommon {
  path: string;
  labelKey: string;
  labelFallback?: string;
  Icon: ComponentType;
  section: NavSection;
}

export interface DashboardNavItem extends NavCommon {
  kind: 'dashboard';
}
export interface ResourceNavItem extends NavCommon {
  kind: 'resource';
  name: string;
  list?: ComponentType;
  edit?: ComponentType;
  create?: ComponentType;
  show?: ComponentType;
}
export interface RouteNavItem extends NavCommon {
  kind: 'route';
  Component: ComponentType;
}
export interface ExternalNavItem extends NavCommon {
  kind: 'external';
  href: (config: EnvironmentConfig) => string;
}

export type NavItem = DashboardNavItem | ResourceNavItem | RouteNavItem | ExternalNavItem;

// Single source of truth for resources, custom routes, and the sidebar menu.
// Declaration order is the sidebar order; `section` controls grouping.
export const navItems: NavItem[] = [
  { kind: 'dashboard', section: 'main', path: '/', labelKey: 'sidebar.dashboard', Icon: DashboardIcon },
  { kind: 'route', section: 'main', path: '/services', labelKey: 'sidebar.platform.serviceHub', Icon: HubIcon, Component: ServiceHub },
  { kind: 'resource', section: 'main', path: '/books', labelKey: 'sidebar.books', Icon: BookIcon, name: 'books', list: BookList, edit: BookEdit, create: BookCreate, show: BookShow },
  { kind: 'resource', section: 'main', path: '/authors', labelKey: 'sidebar.authors', Icon: PersonIcon, name: 'authors', list: AuthorList, edit: AuthorEdit, show: AuthorShow },
  { kind: 'resource', section: 'main', path: '/booklists', labelKey: 'sidebar.bookLists', Icon: ListAltIcon, name: 'booklists', list: BookListList, edit: BookListEdit, create: BookListCreate, show: BookListShow },
  { kind: 'resource', section: 'main', path: '/categories', labelKey: 'sidebar.categories', Icon: CategoryIcon, name: 'categories', list: CategoryList, edit: CategoryEdit, create: CategoryCreate },
  { kind: 'resource', section: 'main', path: '/users', labelKey: 'sidebar.users', Icon: PeopleIcon, name: 'users', list: UserList, show: UserShow },
  { kind: 'resource', section: 'main', path: '/quotes', labelKey: 'sidebar.quotes', Icon: FormatQuoteIcon, name: 'quotes', list: QuoteList, edit: QuoteEdit, create: QuoteCreate, show: QuoteShow },

  { kind: 'route', section: 'operations', path: '/reading-stats', labelKey: 'sidebar.operations.readingStats', Icon: BarChartIcon, Component: ReadingStatsPage },
  { kind: 'route', section: 'operations', path: '/subscription-dashboard', labelKey: 'sidebar.operations.subscriptions', Icon: CardMembershipIcon, Component: SubscriptionDashboard },
  { kind: 'resource', section: 'operations', path: '/import/batches', labelKey: 'sidebar.operations.importBatches', labelFallback: 'Import Batches', Icon: CloudSyncIcon, name: 'import/batches', list: ImportBatchList, show: ImportBatchShow },
  { kind: 'route', section: 'operations', path: '/se-import', labelKey: 'sidebar.operations.seImport', labelFallback: 'SE Import', Icon: CloudDownloadIcon, Component: SEIncrementalImport },
  { kind: 'route', section: 'operations', path: '/push-notifications', labelKey: 'sidebar.operations.pushNotifications', labelFallback: 'Push Notifications', Icon: NotificationsActiveIcon, Component: PushNotificationsPage },
  { kind: 'route', section: 'operations', path: '/highlight-analytics', labelKey: 'sidebar.operations.highlightAnalytics', labelFallback: 'Highlight Analytics', Icon: HighlightIcon, Component: HighlightAnalyticsPage },
  { kind: 'route', section: 'operations', path: '/daily-report', labelKey: 'sidebar.operations.dailyReport', labelFallback: 'Daily Report', Icon: TrendingUpIcon, Component: DailyReportPage },
  { kind: 'route', section: 'operations', path: '/cost-management', labelKey: 'sidebar.operations.costManagement', labelFallback: 'Cost Management', Icon: AccountBalanceWalletIcon, Component: CostManagementPage },
  { kind: 'external', section: 'operations', path: 'content-studio', labelKey: 'sidebar.operations.contentStudio', labelFallback: 'Content Studio', Icon: RateReviewIcon, href: (config) => config.contentStudioUrl },

  { kind: 'route', section: 'support', path: '/support-dashboard', labelKey: 'sidebar.support.overview', Icon: SupportAgentIcon, Component: SupportDashboard },
  { kind: 'resource', section: 'support', path: '/tickets', labelKey: 'sidebar.support.tickets', Icon: ConfirmationNumberIcon, name: 'tickets', list: TicketList, show: TicketShow },
  { kind: 'resource', section: 'support', path: '/feedback', labelKey: 'sidebar.support.feedback', Icon: FeedbackIcon, name: 'feedback', list: FeedbackList, show: FeedbackShow },
  { kind: 'resource', section: 'support', path: '/guest-feedback', labelKey: 'sidebar.support.guestFeedback', Icon: ContactSupportIcon, name: 'guest-feedback', list: GuestFeedbackList, show: GuestFeedbackShow },
  { kind: 'resource', section: 'support', path: '/orders', labelKey: 'sidebar.support.orders', Icon: ShoppingCartIcon, name: 'orders', list: OrderList, show: OrderShow },
  { kind: 'resource', section: 'support', path: '/messages', labelKey: 'sidebar.support.messages', Icon: MailIcon, name: 'messages', list: MessageList, show: MessageShow },
];

export const resourceNavItems = navItems.filter((i): i is ResourceNavItem => i.kind === 'resource');
export const routeNavItems = navItems.filter((i): i is RouteNavItem => i.kind === 'route');
