import { useTranslation } from 'react-i18next';
import TabPlaceholder from '../../components/TabPlaceholder';

export default function SearchTab() {
  const { t } = useTranslation();
  return <TabPlaceholder title={t('nav.search')} />;
}