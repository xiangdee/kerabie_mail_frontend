'use client';
import { useMemo, useState } from 'react';
import { Search, Plus, Trash2, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCorners } from '@/components/app/console/PlusCorners';
import { cn } from '@/lib/utils';
import type { Contact, ContactGroup } from '@/lib/types/api.types';
import type { ContactCreateInput, ContactUpdateInput } from '@/lib/hooks/useContacts';

const MONO = "font-[family-name:var(--font-plex-mono)]";
const DISPLAY = "font-[family-name:var(--font-barlow-condensed)]";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div className={cn(MONO, 'text-[10px] tracking-[0.12em] text-console-muted2 mb-1.5')}>{children}</div>;
}

interface Props {
  contacts: Contact[];
  groups: ContactGroup[];
  isLoading: boolean;
  isSavingContact: boolean;
  isSavingGroup: boolean;
  onCreateContact: (data: ContactCreateInput) => void;
  onUpdateContact: (id: number, data: ContactUpdateInput) => void;
  onDeleteContact: (id: number) => void;
  onCreateGroup: (name: string) => void;
  onDeleteGroup: (id: number) => void;
}

type ContactForm = { email: string; name: string; phone: string; company: string; notes: string; groupId: string };

const EMPTY_FORM: ContactForm = { email: '', name: '', phone: '', company: '', notes: '', groupId: 'none' };

function toForm(c: Contact): ContactForm {
  return {
    email: c.email,
    name: c.name ?? '',
    phone: c.phone ?? '',
    company: c.company ?? '',
    notes: c.notes ?? '',
    groupId: c.group_id ? String(c.group_id) : 'none',
  };
}

export default function ContactsView({
  contacts, groups, isLoading, isSavingContact, isSavingGroup,
  onCreateContact, onUpdateContact, onDeleteContact, onCreateGroup, onDeleteGroup,
}: Props) {
  const [query, setQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState<'all' | 'none' | number>('all');
  const [editing, setEditing] = useState<Contact | null>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [form, setForm] = useState<ContactForm>(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [groupsDialogOpen, setGroupsDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [deleteGroupId, setDeleteGroupId] = useState<number | null>(null);

  const groupName = (id: number | null) => (id ? groups.find((g) => g.id === id)?.name ?? '—' : 'Unassigned');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contacts.filter((c) => {
      const okQ = !q
        || c.email.toLowerCase().includes(q)
        || (c.name ?? '').toLowerCase().includes(q)
        || (c.company ?? '').toLowerCase().includes(q);
      const okGroup = groupFilter === 'all'
        || (groupFilter === 'none' ? c.group_id === null : c.group_id === groupFilter);
      return okQ && okGroup;
    });
  }, [contacts, query, groupFilter]);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setContactDialogOpen(true); };
  const openEdit = (c: Contact) => { setEditing(c); setForm(toForm(c)); setContactDialogOpen(true); };

  const canSubmit = form.email.trim() && (editing || form.email.includes('@'));

  const submit = () => {
    const groupId = form.groupId === 'none' ? null : Number(form.groupId);
    if (editing) {
      onUpdateContact(editing.id, {
        name: form.name.trim() || null,
        phone: form.phone.trim() || null,
        company: form.company.trim() || null,
        notes: form.notes.trim() || null,
        group_id: groupId,
      });
    } else {
      onCreateContact({
        email: form.email.trim(),
        name: form.name.trim() || null,
        phone: form.phone.trim() || null,
        company: form.company.trim() || null,
        notes: form.notes.trim() || null,
        group_id: groupId,
      });
    }
    setContactDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-72 rounded-none" />
        <Skeleton className="h-64 w-full rounded-none" />
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex items-end gap-4 flex-wrap">
        <div>
          <h1 className={cn(DISPLAY, 'font-semibold text-3xl sm:text-4xl leading-none')}>Contacts</h1>
          <div className="text-console-muted mt-1.5 max-w-[70ch]">Your address book — group contacts to target campaigns at a segment.</div>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2 border border-console-border h-9 px-3 bg-white">
          <Search className="h-3.5 w-3.5 text-console-muted2" />
          <input
            value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search contacts" className="border-0 outline-none bg-transparent text-sm w-40 sm:w-56"
          />
        </div>
        <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
          <DialogTrigger asChild>
            <button
              type="button" onClick={openCreate}
              className={cn('relative bg-console-accent text-white border-0 h-9 px-5 hover:bg-console-accent-dark transition-colors', DISPLAY, 'font-semibold text-[15px] tracking-[0.04em]')}
            >
              + NEW CONTACT
              <PlusCorners variant="all" />
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>{editing ? 'Edit contact' : 'New contact'}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <FieldLabel>Email {!editing && '*'}</FieldLabel>
                <Input
                  type="email" value={form.email} disabled={!!editing}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="jane@example.com"
                />
              </div>
              <div>
                <FieldLabel>Name</FieldLabel>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Doe" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Phone</FieldLabel>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div>
                  <FieldLabel>Company</FieldLabel>
                  <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                </div>
              </div>
              <div>
                <FieldLabel>Group</FieldLabel>
                <Select value={form.groupId} onValueChange={(v) => setForm({ ...form, groupId: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {groups.map((g) => <SelectItem key={g.id} value={String(g.id)}>{g.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <FieldLabel>Notes</FieldLabel>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="min-h-[70px]" />
              </div>
              <Button onClick={submit} disabled={!canSubmit || isSavingContact} className="w-full">
                {isSavingContact && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editing ? 'Save' : 'Add contact'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-3 flex-wrap border-t border-b border-console-border py-2.5">
        <div className="flex border border-console-border h-8 flex-wrap">
          <button
            type="button" onClick={() => setGroupFilter('all')}
            className={cn(MONO, 'px-3.5 text-[10.5px] tracking-[0.08em] uppercase', groupFilter === 'all' ? 'bg-console-ink text-white' : 'text-console-muted')}
          >
            All
          </button>
          {groups.map((g) => (
            <button
              key={g.id} type="button" onClick={() => setGroupFilter(g.id)}
              className={cn(MONO, 'px-3.5 text-[10.5px] tracking-[0.08em]', groupFilter === g.id ? 'bg-console-ink text-white' : 'text-console-muted')}
            >
              {g.name}
            </button>
          ))}
          <button
            type="button" onClick={() => setGroupFilter('none')}
            className={cn(MONO, 'px-3.5 text-[10.5px] tracking-[0.08em] uppercase', groupFilter === 'none' ? 'bg-console-ink text-white' : 'text-console-muted')}
          >
            Unassigned
          </button>
        </div>
        <Dialog open={groupsDialogOpen} onOpenChange={setGroupsDialogOpen}>
          <DialogTrigger asChild>
            <button type="button" className={cn(MONO, 'text-[10.5px] text-console-muted2 hover:text-console-accent transition-colors')}>
              MANAGE GROUPS
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader><DialogTitle>Contact groups</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="New group name"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newGroupName.trim()) { onCreateGroup(newGroupName.trim()); setNewGroupName(''); }
                  }}
                />
                <Button
                  size="sm"
                  disabled={!newGroupName.trim() || isSavingGroup}
                  onClick={() => { onCreateGroup(newGroupName.trim()); setNewGroupName(''); }}
                >
                  {isSavingGroup ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                </Button>
              </div>
              {groups.length === 0 ? (
                <p className="text-sm text-console-muted">No groups yet.</p>
              ) : (
                <div className="border border-console-border-soft">
                  {groups.map((g, i) => {
                    const memberCount = contacts.filter((c) => c.group_id === g.id).length;
                    return (
                      <div key={g.id} className={cn('flex items-center justify-between gap-2 px-3 py-2', i < groups.length - 1 && 'border-b border-console-border-soft')}>
                        <span className="text-sm truncate">
                          {g.name} <span className={cn(MONO, 'text-[11px] text-console-muted2')}>({memberCount})</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => memberCount === 0 && setDeleteGroupId(g.id)}
                          disabled={memberCount > 0}
                          title={memberCount > 0 ? 'Move or delete its contacts first' : 'Delete group'}
                          className="text-console-muted2 hover:text-console-red transition-colors shrink-0 disabled:opacity-30 disabled:hover:text-console-muted2 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {rows.length === 0 ? (
        <div className="border border-console-border bg-white p-12 text-center">
          <p className="text-sm text-console-muted mb-4">{contacts.length === 0 ? 'No contacts yet.' : 'No contacts match your search.'}</p>
          {contacts.length === 0 && (
            <button
              type="button" onClick={openCreate}
              className={cn('relative bg-console-accent text-white border-0 h-9 px-5 hover:bg-console-accent-dark transition-colors', DISPLAY, 'font-semibold text-[15px] tracking-[0.04em]')}
            >
              + NEW CONTACT
              <PlusCorners variant="all" />
            </button>
          )}
        </div>
      ) : (
        <div className="border border-console-border bg-white">
          <div className="hidden md:grid grid-cols-[2fr_1.2fr_1fr_1fr_auto] px-5 py-2.5 border-b border-console-border">
            {['CONTACT', 'COMPANY', 'PHONE', 'GROUP', ''].map((h) => (
              <div key={h} className={cn(MONO, 'text-[9.5px] tracking-[0.12em] text-console-muted2')}>{h}</div>
            ))}
          </div>
          {rows.map((c, i) => (
            <div
              key={c.id}
              className={cn('flex flex-wrap md:grid md:grid-cols-[2fr_1.2fr_1fr_1fr_auto] items-center gap-x-4 gap-y-1.5 px-5 py-3.5', i < rows.length - 1 && 'border-b border-console-border-soft')}
            >
              <button type="button" onClick={() => openEdit(c)} className="min-w-0 basis-full md:basis-auto text-left hover:text-console-accent transition-colors">
                <div className="font-medium text-[14.5px] truncate">{c.name || c.email}</div>
                {c.name && <div className={cn(MONO, 'text-[11px] text-console-muted3 truncate')}>{c.email}</div>}
              </button>
              <div className="text-[13px] text-console-muted truncate">{c.company || '—'}</div>
              <div className={cn(MONO, 'text-[12.5px] text-console-muted')}>{c.phone || '—'}</div>
              <div className="text-[13px] text-console-muted truncate">{groupName(c.group_id)}</div>
              <button type="button" onClick={() => setDeleteId(c.id)} className="text-console-muted2 hover:text-console-red transition-colors shrink-0 justify-self-end">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Delete this contact?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This can&rsquo;t be undone.</p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { if (deleteId !== null) onDeleteContact(deleteId); setDeleteId(null); }}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteGroupId !== null} onOpenChange={(o) => !o && setDeleteGroupId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Delete this group?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">It has no contacts in it — this can&rsquo;t be undone.</p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteGroupId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteGroupId !== null) {
                  onDeleteGroup(deleteGroupId);
                  if (groupFilter === deleteGroupId) setGroupFilter('all');
                }
                setDeleteGroupId(null);
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
