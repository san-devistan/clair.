"use client"

import type { ActiveOrganization } from "@/components/auth/org-switcher.types"
import { useOrgSwitcherState } from "@/components/auth/use-org-switcher-state"
import { useFecStore } from "@/lib/fec/store-context"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import {
  Building2,
  CreditCard,
  Database,
  Settings,
  X,
  type LucideIcon,
} from "lucide-react"
import { useCallback, useState } from "react"

import { BillingSettingsPanel } from "./billing"
import { DataProviderPanel } from "./data-provider"
import { EditEnterpriseDialog } from "./edit-enterprise-dialog"
import { EnterpriseAccessPanel } from "./enterprise"
import { GeneralSettingsPanel } from "./general"
import { InviteMemberDialog } from "./invite-member-dialog"

const SETTINGS_TRIGGER_BUTTON = (
  <SidebarMenuButton tooltip="Réglages" aria-label="Réglages" />
)

type SettingsTab = {
  value: "general" | "enterprise" | "billing" | "data"
  label: string
  icon: LucideIcon
}

type SettingsTabValue = SettingsTab["value"]

const SETTINGS_TABS: SettingsTab[] = [
  { value: "general", label: "Général", icon: Settings },
  { value: "enterprise", label: "Accès entreprise", icon: Building2 },
  { value: "billing", label: "Facturation", icon: CreditCard },
  { value: "data", label: "Sources de données", icon: Database },
]
const DEFAULT_SETTINGS_TAB = SETTINGS_TABS[0]
const SETTINGS_CLOSE_BUTTON = (
  <Button
    type="button"
    variant="ghost"
    size="icon"
    className="rounded-lg bg-muted/60 hover:bg-muted"
  />
)

export function DashboardSettingsDialog() {
  const [activeTab, setActiveTab] = useState<SettingsTabValue>(
    DEFAULT_SETTINGS_TAB.value
  )
  const [open, setOpen] = useState(false)
  const {
    activeOrganization,
    activeOrganizationUsage,
    billingUsage,
    canInviteMember,
    canManageMembers,
    handlers,
    organizations,
    session,
    state,
  } = useOrgSwitcherState()
  const { availableRange, importFile, importState, reset, source } =
    useFecStore()
  const changeActiveTab = useCallback((value: unknown) => {
    if (isSettingsTabValue(value)) {
      setActiveTab(value)
    }
  }, [])

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <SidebarMenu>
          <SidebarMenuItem>
            <DialogTrigger render={SETTINGS_TRIGGER_BUTTON}>
              <Settings />
              <span>Réglages</span>
            </DialogTrigger>
          </SidebarMenuItem>
        </SidebarMenu>
        <DialogContent
          showCloseButton={false}
          className="max-h-[calc(100svh-2rem)] gap-0 overflow-hidden p-0 sm:max-w-3xl"
        >
          <SettingsTabs
            activeTab={activeTab}
            activeOrganization={activeOrganization}
            availableRange={availableRange}
            canInviteMember={canInviteMember}
            canManageMembers={canManageMembers}
            importFile={importFile}
            importState={importState}
            memberUsage={activeOrganizationUsage}
            reset={reset}
            session={session}
            source={source}
            billingUsage={billingUsage}
            currentUserId={session?.user.id}
            handlers={handlers}
            organizationCount={organizations.length}
            state={state}
            onActiveTabChange={changeActiveTab}
          />
        </DialogContent>
      </Dialog>

      {session ? (
        <SettingsDialogs
          canInviteMember={canInviteMember}
          handlers={handlers}
          state={state}
        />
      ) : null}
    </>
  )
}

function SettingsTabs({
  activeTab,
  activeOrganization,
  availableRange,
  canInviteMember,
  canManageMembers,
  importFile,
  importState,
  memberUsage,
  reset,
  session,
  source,
  billingUsage,
  currentUserId,
  handlers,
  organizationCount,
  state,
  onActiveTabChange,
}: {
  activeTab: SettingsTabValue
  activeOrganization: ActiveOrganization | null
  availableRange: ReturnType<typeof useFecStore>["availableRange"]
  canInviteMember: boolean
  canManageMembers: boolean
  importFile: ReturnType<typeof useFecStore>["importFile"]
  importState: ReturnType<typeof useFecStore>["importState"]
  memberUsage: ReturnType<typeof useOrgSwitcherState>["activeOrganizationUsage"]
  reset: ReturnType<typeof useFecStore>["reset"]
  session: ReturnType<typeof useOrgSwitcherState>["session"]
  source: ReturnType<typeof useFecStore>["source"]
  billingUsage: ReturnType<typeof useOrgSwitcherState>["billingUsage"]
  currentUserId: string | undefined
  handlers: ReturnType<typeof useOrgSwitcherState>["handlers"]
  organizationCount: number
  state: ReturnType<typeof useOrgSwitcherState>["state"]
  onActiveTabChange: (value: unknown) => void
}) {
  const activeTabLabel =
    SETTINGS_TABS.find((tab) => tab.value === activeTab)?.label ??
    DEFAULT_SETTINGS_TAB.label

  return (
    <Tabs
      value={activeTab}
      onValueChange={onActiveTabChange}
      orientation="vertical"
      className="min-h-0 flex-col gap-0 md:flex-row"
    >
      <div className="shrink-0 border-b p-3 md:w-56 md:border-r md:border-b-0">
        <DialogClose render={SETTINGS_CLOSE_BUTTON}>
          <X />
          <span className="sr-only">Fermer</span>
        </DialogClose>
        <TabsList variant="line" className="mt-5 w-full items-stretch p-0">
          {SETTINGS_TABS.map((tab) => (
            <SettingsTabTrigger key={tab.value} tab={tab} />
          ))}
        </TabsList>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <SettingsContentHeader title={activeTabLabel} />
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-4">
          <TabsContent value="general">
            <GeneralSettingsPanel
              userEmail={session?.user.email}
              onSignOut={handlers.signOut}
            />
          </TabsContent>
          <TabsContent value="enterprise">
            <EnterpriseAccessPanel
              activeOrganization={activeOrganization}
              canInviteMember={canInviteMember}
              canManageMembers={canManageMembers}
              session={session}
              currentUserId={currentUserId}
              memberUsage={memberUsage}
              handlers={handlers}
              state={state}
            />
          </TabsContent>
          <TabsContent value="billing">
            <BillingSettingsPanel
              billingUsage={billingUsage}
              memberUsage={memberUsage}
              organizationCount={organizationCount}
              session={session}
            />
          </TabsContent>
          <TabsContent value="data">
            <DataProviderPanel
              availableRange={availableRange}
              importFile={importFile}
              importState={importState}
              reset={reset}
              session={session}
              source={source}
            />
          </TabsContent>
        </div>
      </div>
    </Tabs>
  )
}

function SettingsContentHeader({ title }: { title: string }) {
  return (
    <DialogHeader className="border-b px-6 py-5 pr-12">
      <DialogTitle className="text-xl leading-tight font-semibold">
        {title}
      </DialogTitle>
    </DialogHeader>
  )
}

function SettingsTabTrigger({ tab }: { tab: SettingsTab }) {
  const Icon = tab.icon

  return (
    <TabsTrigger value={tab.value} className="h-9 px-2 md:justify-start">
      <Icon />
      {tab.label}
    </TabsTrigger>
  )
}

function isSettingsTabValue(value: unknown): value is SettingsTabValue {
  return SETTINGS_TABS.some((tab) => tab.value === value)
}

function SettingsDialogs({
  canInviteMember,
  handlers,
  state,
}: {
  canInviteMember: boolean
  handlers: ReturnType<typeof useOrgSwitcherState>["handlers"]
  state: ReturnType<typeof useOrgSwitcherState>["state"]
}) {
  const closeMembersDialog = useCallback(() => {
    handlers.setMembersOpen(false)
  }, [handlers])

  return (
    <>
      <EditEnterpriseDialog
        error={state.error}
        open={state.editOpen}
        orgName={state.editOrgName}
        pending={state.pendingAction === "update-org"}
        onClose={handlers.closeEditDialog}
        onNameChange={handlers.setEditOrgName}
        onOpenChange={handlers.setEditOpen}
        onSubmit={handlers.submitUpdateOrganization}
      />
      <InviteMemberDialog
        canInviteMember={canInviteMember}
        error={state.error}
        open={state.membersOpen}
        memberEmail={state.memberEmail}
        memberRole={state.memberRole}
        pending={state.pendingAction === "add-member"}
        onClose={closeMembersDialog}
        onEmailChange={handlers.setMemberEmail}
        onOpenChange={handlers.setMembersOpen}
        onRoleChange={handlers.setMemberRole}
        onSubmit={handlers.submitAddMember}
      />
    </>
  )
}
