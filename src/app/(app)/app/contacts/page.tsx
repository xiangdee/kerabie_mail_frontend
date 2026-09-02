'use client';
import { useAuth } from '@/lib/context/auth.context';
import { useAppToast } from '@/components/ui/app-toast';
import {
  useContacts, useContactGroups, useCreateContact, useUpdateContact, useDeleteContact,
  useCreateContactGroup, useDeleteContactGroup,
  type ContactCreateInput, type ContactUpdateInput,
} from '@/lib/hooks/useContacts';
import ContactsView from '@/components/app/contacts/ContactsView';

export default function ContactsPage() {
  const { token } = useAuth();
  const { success, error: toastError } = useAppToast();

  const { data: contacts = [], isLoading } = useContacts(token);
  const { data: groups = [] } = useContactGroups(token);
  const createContact = useCreateContact(token);
  const updateContact = useUpdateContact(token);
  const deleteContact = useDeleteContact(token);
  const createGroup = useCreateContactGroup(token);
  const deleteGroup = useDeleteContactGroup(token);

  const handleCreateContact = async (data: ContactCreateInput) => {
    const res = await createContact.mutateAsync(data);
    if (res.status === true) success('Contact added');
    else toastError('Failed to add contact', { description: typeof res.response === 'string' ? res.response : undefined });
  };

  const handleUpdateContact = async (id: number, data: ContactUpdateInput) => {
    const res = await updateContact.mutateAsync({ id, data });
    if (res.status === true) success('Contact saved');
    else toastError('Failed to save contact', { description: typeof res.response === 'string' ? res.response : undefined });
  };

  const handleDeleteContact = async (id: number) => {
    const res = await deleteContact.mutateAsync(id);
    if (res.status === true) success('Contact deleted');
    else toastError('Failed to delete contact', { description: typeof res.response === 'string' ? res.response : undefined });
  };

  const handleCreateGroup = async (name: string) => {
    const res = await createGroup.mutateAsync(name);
    if (res.status !== true) toastError('Failed to create group', { description: typeof res.response === 'string' ? res.response : undefined });
  };

  const handleDeleteGroup = async (id: number) => {
    const res = await deleteGroup.mutateAsync(id);
    if (res.status !== true) toastError('Failed to delete group', { description: typeof res.response === 'string' ? res.response : undefined });
  };

  return (
    <ContactsView
      contacts={contacts}
      groups={groups}
      isLoading={isLoading}
      isSavingContact={createContact.isPending || updateContact.isPending}
      isSavingGroup={createGroup.isPending}
      onCreateContact={handleCreateContact}
      onUpdateContact={handleUpdateContact}
      onDeleteContact={handleDeleteContact}
      onCreateGroup={handleCreateGroup}
      onDeleteGroup={handleDeleteGroup}
    />
  );
}
