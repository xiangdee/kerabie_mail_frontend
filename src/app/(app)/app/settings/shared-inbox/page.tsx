'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/context/auth.context';
import { useAppToast } from '@/components/ui/app-toast';
import { ConfirmDialog } from '@/components/ui/app-toast';
import { SharedInboxView } from '@/components/app/settings/SharedInboxView';
import {
  useUserEmails,
  useSharedMembers,
  useInviteMember,
  useUpdateMemberRole,
  useRemoveMember,
  useMySharedInboxes,
  useLeaveSharedInbox,
} from '@/lib/hooks/useSharedInbox';
import type { SharedInboxEntry } from '@/lib/types/api.types';

export default function SharedInboxPage() {
  const { token, user } = useAuth();
  const { success, error: toastError } = useAppToast();

  const [selectedEmailId, setSelectedEmailId] = useState<number | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<number | null>(null);
  const [confirmLeave, setConfirmLeave] = useState<SharedInboxEntry | null>(null);

  const { data: userEmails = [], isLoading: emailsLoading } = useUserEmails(token);
  const { data: members = [], isLoading: membersLoading } = useSharedMembers(selectedEmailId, token);
  const { data: myInboxes = [], isLoading: myInboxesLoading } = useMySharedInboxes(token);

  const inviteMutation = useInviteMember(token);
  const roleMutation = useUpdateMemberRole(token);
  const removeMutation = useRemoveMember(token);
  const leaveMutation = useLeaveSharedInbox(token);

  const isPremium = user?.plan_type === 'premium';

  const handleInvite = async (data: { invite_email: string; role: string }) => {
    if (!selectedEmailId) return;
    const res = await inviteMutation.mutateAsync({ emailId: selectedEmailId, ...data });
    if (res.status === true) {
      success('Invite sent', { description: `An invitation has been sent to ${data.invite_email}.` });
    } else {
      toastError('Failed to send invite', { description: res.response as string });
    }
  };

  const handleChangeRole = async (memberId: number, role: string) => {
    if (!selectedEmailId) return;
    const res = await roleMutation.mutateAsync({ emailId: selectedEmailId, memberId, role });
    if (res.status === true) {
      success('Role updated');
    } else {
      toastError('Failed to update role', { description: res.response as string });
    }
  };

  const handleRemoveConfirmed = async () => {
    if (!confirmRemove || !selectedEmailId) return;
    const res = await removeMutation.mutateAsync({ emailId: selectedEmailId, memberId: confirmRemove });
    if (res.status === true) {
      success('Member removed');
    } else {
      toastError('Failed to remove member');
    }
    setConfirmRemove(null);
  };

  const handleLeaveConfirmed = async () => {
    if (!confirmLeave) return;
    const res = await leaveMutation.mutateAsync({
      emailId: confirmLeave.user_email_id,
      memberId: confirmLeave.member_id,
    });
    if (res.status === true) {
      success('Left shared inbox', { description: confirmLeave.email_address });
    } else {
      toastError('Failed to leave inbox', { description: res.response as string });
    }
    setConfirmLeave(null);
  };

  return (
    <>
      <SharedInboxView
        userEmails={userEmails}
        emailsLoading={emailsLoading}
        selectedEmailId={selectedEmailId}
        onSelectEmail={setSelectedEmailId}
        members={members}
        membersLoading={membersLoading}
        myInboxes={myInboxes}
        myInboxesLoading={myInboxesLoading}
        isInviting={inviteMutation.isPending}
        isRemoving={removeMutation.isPending}
        isLeaving={leaveMutation.isPending}
        onInvite={handleInvite}
        onChangeRole={handleChangeRole}
        onRemove={(id) => setConfirmRemove(id)}
        onLeave={(entry) => setConfirmLeave(entry)}
        isPremium={isPremium}
      />

      <ConfirmDialog
        open={!!confirmRemove}
        title="Remove member?"
        description="This person will lose access to the shared inbox immediately."
        confirmLabel="Remove"
        variant="danger"
        onConfirm={handleRemoveConfirmed}
        onCancel={() => setConfirmRemove(null)}
      />

      <ConfirmDialog
        open={!!confirmLeave}
        title={`Leave ${confirmLeave?.email_address}?`}
        description="You will lose access to this shared inbox. The owner can re-invite you."
        confirmLabel="Leave inbox"
        variant="danger"
        onConfirm={handleLeaveConfirmed}
        onCancel={() => setConfirmLeave(null)}
      />
    </>
  );
}
