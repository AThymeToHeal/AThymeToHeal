import ClientForm from '../../../_components/ClientForm';
import { BackLink, Card, PageHeader } from '../../../_components/ui';

export const metadata = { title: 'Add client' };

export default function NewClientPage() {
  return (
    <>
      <BackLink href="/admin/clients">Clients</BackLink>
      <PageHeader title="Add client" />
      <Card className="p-5 sm:p-7">
        <ClientForm />
      </Card>
    </>
  );
}
