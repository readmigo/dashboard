import { Admin, Resource, CustomRoutes } from 'react-admin';
import { Route, BrowserRouter } from 'react-router-dom';
import { dataProvider } from './services/dataProvider';
import { authProvider } from './services/authProvider';
import { i18nProvider } from './i18n';
import { Dashboard } from './pages/Dashboard';
import { CustomLayout } from './components/CustomLayout';
import { CustomLoginPage } from './pages/CustomLoginPage';
import { readmigoTheme } from './theme';
import { ContentLanguageProvider } from './contexts/ContentLanguageContext';
import { EnvironmentProvider } from './contexts/EnvironmentContext';
import { TimezoneProvider } from './contexts/TimezoneContext';
import GlobalErrorBoundary from './components/GlobalErrorBoundary';
import { BookList, BookEdit, BookCreate, BookShow } from './pages/books';
import { UserList, UserShow } from './pages/users';
import { BookListList, BookListEdit, BookListCreate, BookListShow } from './pages/booklists';
import { CategoryList, CategoryEdit, CategoryCreate } from './pages/categories';
import { QuoteList, QuoteEdit, QuoteCreate, QuoteShow } from './pages/quotes';
import { PostcardTemplateList, PostcardTemplateEdit, PostcardTemplateCreate, PostcardList, PostcardShow } from './pages/postcards';
import { AuthorList, AuthorEdit, AuthorShow } from './pages/authors';
import { FeatureFlagsList } from './pages/feature-flags';
import { MessageList, MessageShow } from './pages/messages';
import { GuestFeedbackList, GuestFeedbackShow } from './pages/guest-feedback';
import { ImportBatchList, ImportBatchShow } from './pages/import-batches';
import { TicketList, TicketShow } from './pages/tickets';
import { FeedbackList, FeedbackShow } from './pages/feedback';
import { OrderList, OrderShow } from './pages/orders';
import { SupportDashboard } from './pages/support';
import { OperationsDashboard, PerformanceDashboard } from './pages/operations';
import { ReadingStatsPage } from './pages/reading-stats';
import { RetentionPage } from './pages/retention';
import { DemographicsPage } from './pages/demographics';
import { PipelineDashboard } from './pages/pipeline';
import { SEIncrementalImport } from './pages/se-import';
import BookIcon from '@mui/icons-material/MenuBook';
import PeopleIcon from '@mui/icons-material/People';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CategoryIcon from '@mui/icons-material/Category';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import ImageIcon from '@mui/icons-material/Image';
import StyleIcon from '@mui/icons-material/Style';
import PersonIcon from '@mui/icons-material/Person';
import MessageIcon from '@mui/icons-material/Message';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import FeedbackIcon from '@mui/icons-material/Feedback';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';

export const App = () => (
  <GlobalErrorBoundary>
    <BrowserRouter>
      <EnvironmentProvider>
      <TimezoneProvider>
        <ContentLanguageProvider>
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
            <Resource
              name="books"
              list={BookList}
              edit={BookEdit}
              create={BookCreate}
              show={BookShow}
              icon={BookIcon}
            />
            <Resource
              name="authors"
              list={AuthorList}
              edit={AuthorEdit}
              show={AuthorShow}
              icon={PersonIcon}
            />
            <Resource
              name="booklists"
              list={BookListList}
              edit={BookListEdit}
              create={BookListCreate}
              show={BookListShow}
              icon={ListAltIcon}
            />
            <Resource
              name="categories"
              list={CategoryList}
              edit={CategoryEdit}
              create={CategoryCreate}
              icon={CategoryIcon}
            />
            <Resource
              name="users"
              list={UserList}
              show={UserShow}
              icon={PeopleIcon}
            />
            <Resource
              name="quotes"
              list={QuoteList}
              edit={QuoteEdit}
              create={QuoteCreate}
              show={QuoteShow}
              icon={FormatQuoteIcon}
            />
            <Resource
              name="postcard-templates"
              list={PostcardTemplateList}
              edit={PostcardTemplateEdit}
              create={PostcardTemplateCreate}
              icon={StyleIcon}
            />
            <Resource
              name="postcards"
              list={PostcardList}
              show={PostcardShow}
              icon={ImageIcon}
            />
            <Resource
              name="messages"
              list={MessageList}
              show={MessageShow}
              icon={MessageIcon}
            />
            <Resource
              name="guest-feedback"
              list={GuestFeedbackList}
              show={GuestFeedbackShow}
              icon={ContactSupportIcon}
            />
            <Resource
              name="import/batches"
              list={ImportBatchList}
              show={ImportBatchShow}
              icon={CloudSyncIcon}
            />
            <Resource
              name="tickets"
              list={TicketList}
              show={TicketShow}
              icon={ConfirmationNumberIcon}
            />
            <Resource
              name="feedback"
              list={FeedbackList}
              show={FeedbackShow}
              icon={FeedbackIcon}
            />
            <Resource
              name="orders"
              list={OrderList}
              show={OrderShow}
              icon={ReceiptIcon}
            />
            <CustomRoutes>
              <Route path="/feature-flags" element={<FeatureFlagsList />} />
              <Route path="/support-dashboard" element={<SupportDashboard />} />
              <Route path="/operations" element={<OperationsDashboard />} />
              <Route path="/performance" element={<PerformanceDashboard />} />
              <Route path="/reading-stats" element={<ReadingStatsPage />} />
              <Route path="/retention" element={<RetentionPage />} />
              <Route path="/demographics" element={<DemographicsPage />} />
              <Route path="/pipeline" element={<PipelineDashboard />} />
              <Route path="/se-import" element={<SEIncrementalImport />} />
            </CustomRoutes>
          </Admin>
        </ContentLanguageProvider>
      </TimezoneProvider>
    </EnvironmentProvider>
  </BrowserRouter>
  </GlobalErrorBoundary>
);
