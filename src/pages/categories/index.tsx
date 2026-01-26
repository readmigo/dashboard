import {
  List,
  Datagrid,
  TextField,
  EditButton,
  Edit,
  Create,
  SimpleForm,
  TextInput,
  NumberInput,
  useRecordContext,
  TopToolbar,
  CreateButton,
  BooleanField,
  BooleanInput,
  ReferenceInput,
  AutocompleteInput,
  SelectInput,
  NumberField,
  useTranslate,
} from 'react-admin';
import { Chip, Box, Stack } from '@mui/material';
import BookIcon from '@mui/icons-material/MenuBook';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ScienceIcon from '@mui/icons-material/Science';
import CodeIcon from '@mui/icons-material/Code';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import GroupsIcon from '@mui/icons-material/Groups';
import PaletteIcon from '@mui/icons-material/Palette';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import StarIcon from '@mui/icons-material/Star';
import PublicIcon from '@mui/icons-material/Public';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FolderIcon from '@mui/icons-material/Folder';

// Helper function to get icon choices with translations
const getIconChoices = (translate: (key: string) => string) => [
  { id: 'book-open', name: translate('resources.categories.icons.book') },
  { id: 'lightbulb', name: translate('resources.categories.icons.lightbulb') },
  { id: 'clock', name: translate('resources.categories.icons.clock') },
  { id: 'beaker', name: translate('resources.categories.icons.beaker') },
  { id: 'code', name: translate('resources.categories.icons.code') },
  { id: 'chart-line', name: translate('resources.categories.icons.chart') },
  { id: 'users', name: translate('resources.categories.icons.users') },
  { id: 'palette', name: translate('resources.categories.icons.palette') },
  { id: 'sun', name: translate('resources.categories.icons.sun') },
  { id: 'star', name: translate('resources.categories.icons.star') },
  { id: 'globe', name: translate('resources.categories.icons.globe') },
  { id: 'heart', name: translate('resources.categories.icons.heart') },
];

// Map icon id to MUI icon component
const getIconComponent = (iconId: string | undefined) => {
  switch (iconId) {
    case 'book-open': return <BookIcon fontSize="small" />;
    case 'lightbulb': return <LightbulbIcon fontSize="small" />;
    case 'clock': return <AccessTimeIcon fontSize="small" />;
    case 'beaker': return <ScienceIcon fontSize="small" />;
    case 'code': return <CodeIcon fontSize="small" />;
    case 'chart-line': return <ShowChartIcon fontSize="small" />;
    case 'users': return <GroupsIcon fontSize="small" />;
    case 'palette': return <PaletteIcon fontSize="small" />;
    case 'sun': return <WbSunnyIcon fontSize="small" />;
    case 'star': return <StarIcon fontSize="small" />;
    case 'globe': return <PublicIcon fontSize="small" />;
    case 'heart': return <FavoriteIcon fontSize="small" />;
    default: return <FolderIcon fontSize="small" />;
  }
};

const CategoryNameField = ({ label: _label }: { label?: string }) => {
  const record = useRecordContext();
  if (!record) return null;

  const indent = record.level * 20;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', pl: `${indent}px` }}>
      {record.level > 0 && (
        <Box sx={{ color: 'text.secondary', mr: 1 }}>
          {'└─'}
        </Box>
      )}
      <Box sx={{ color: 'primary.main', mr: 1, display: 'flex', alignItems: 'center' }}>
        {getIconComponent(record.iconUrl)}
      </Box>
      <Box>
        <Box sx={{ fontWeight: record.level === 0 ? 600 : 400 }}>
          {record.name}
        </Box>
        <Box sx={{ fontSize: 12, color: 'text.secondary' }}>
          {record.nameEn}
        </Box>
      </Box>
    </Box>
  );
};

const LevelField = ({ label: _label }: { label?: string }) => {
  const record = useRecordContext();
  const translate = useTranslate();
  if (!record) return null;

  const getLevelLabel = (level: number) => {
    const levelKeys: Record<number, string> = {
      0: 'resources.categories.levels.level1',
      1: 'resources.categories.levels.level2',
      2: 'resources.categories.levels.level3',
    };
    return levelKeys[level]
      ? translate(levelKeys[level])
      : translate('resources.categories.levels.levelN', { level: level + 1 });
  };

  const colors: Record<number, 'primary' | 'secondary' | 'default'> = {
    0: 'primary',
    1: 'secondary',
    2: 'default',
  };

  return (
    <Chip
      label={getLevelLabel(record.level)}
      color={colors[record.level] || 'default'}
      size="small"
      variant="outlined"
    />
  );
};

const ListActions = () => (
  <TopToolbar>
    <CreateButton />
  </TopToolbar>
);

// Flatten nested categories for display
const flattenCategories = (categories: any[], result: any[] = []): any[] => {
  for (const cat of categories) {
    result.push(cat);
    if (cat.children && cat.children.length > 0) {
      flattenCategories(cat.children, result);
    }
  }
  return result;
};

export const CategoryList = () => {
  const translate = useTranslate();
  return (
    <List
      actions={<ListActions />}
      perPage={100}
      sort={{ field: 'sortOrder', order: 'ASC' }}
    >
      <Datagrid rowClick="edit" bulkActionButtons={false}>
        <CategoryNameField label={translate('resources.categories.fields.name')} />
        <TextField source="slug" />
        <LevelField label={translate('resources.categories.list.level')} />
        <NumberField source="bookCount" label={translate('resources.categories.list.books')} />
        <NumberField source="sortOrder" label={translate('resources.categories.list.order')} />
        <BooleanField source="isActive" label={translate('resources.categories.list.active')} />
        <EditButton />
      </Datagrid>
    </List>
  );
};

export const CategoryEdit = () => {
  const translate = useTranslate();
  const iconChoices = getIconChoices(translate);
  return (
    <Edit>
      <SimpleForm>
        <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
          <TextInput source="name" fullWidth required label={translate('resources.categories.form.chineseName')} />
          <TextInput source="nameEn" fullWidth required label={translate('resources.categories.form.englishName')} />
        </Stack>
        <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
          <TextInput source="slug" fullWidth required />
          <ReferenceInput source="parentId" reference="categories">
            <AutocompleteInput
              optionText="name"
              label={translate('resources.categories.form.parentCategory')}
              filterToQuery={(q) => ({ name: q })}
            />
          </ReferenceInput>
        </Stack>
        <TextInput source="description" multiline rows={2} fullWidth />
        <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
          <SelectInput
            source="iconUrl"
            label={translate('resources.categories.form.icon')}
            choices={iconChoices}
            optionText="name"
            optionValue="id"
          />
          <TextInput source="coverUrl" fullWidth label={translate('resources.categories.form.coverUrl')} />
        </Stack>
        <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
          <NumberInput source="sortOrder" label={translate('resources.categories.form.sortOrder')} />
          <BooleanInput source="isActive" label={translate('resources.categories.form.active')} />
        </Stack>
      </SimpleForm>
    </Edit>
  );
};

export const CategoryCreate = () => {
  const translate = useTranslate();
  const iconChoices = getIconChoices(translate);
  return (
    <Create>
      <SimpleForm>
        <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
          <TextInput source="name" fullWidth required label={translate('resources.categories.form.chineseName')} />
          <TextInput source="nameEn" fullWidth required label={translate('resources.categories.form.englishName')} />
        </Stack>
        <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
          <TextInput source="slug" fullWidth required helperText={translate('resources.categories.form.slugHelperText')} />
          <ReferenceInput source="parentId" reference="categories">
            <AutocompleteInput
              optionText="name"
              label={translate('resources.categories.form.parentCategoryOptional')}
              filterToQuery={(q) => ({ name: q })}
            />
          </ReferenceInput>
        </Stack>
        <TextInput source="description" multiline rows={2} fullWidth />
        <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
          <SelectInput
            source="iconUrl"
            label={translate('resources.categories.form.icon')}
            choices={iconChoices}
            optionText="name"
            optionValue="id"
          />
          <TextInput source="coverUrl" fullWidth label={translate('resources.categories.form.coverUrlOptional')} />
        </Stack>
        <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
          <NumberInput source="sortOrder" label={translate('resources.categories.form.sortOrder')} defaultValue={0} />
          <BooleanInput source="isActive" label={translate('resources.categories.form.active')} defaultValue={true} />
        </Stack>
      </SimpleForm>
    </Create>
  );
};
