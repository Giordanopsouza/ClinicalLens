# Sprint 3: Operational Clinical Workflow

**Goal**: Transition the Alerts system from a "view-only" dashboard to an operational workflow tool where clinicians can manage, assign, and track safety alerts.

## Primary Initiative
**#7: Alert workflow actions (assign/snooze/resolve/audit trail)**
- **Value**: 5 (High clinical operations impact)
- **Ease**: 3 (Requires schema changes, mutations, and UI state management)

## Task Breakdown

### 1. Data Layer & Schema
- [x] **Schema Update**: Add fields to `alerts` table in `convex/schema.ts`:
    - `assignedTo`: Optional user ID or name.
    - `snoozedUntil`: Optional timestamp for temporary hiding.
    - `resolutionNote`: String for audit trail.
    - `history`: Array of audit events (action, user, timestamp).
- [x] **Mutations**: Implement in `convex/mutations.ts`:
    - `assignAlert`: Assign an alert to a clinician.
    - `snoozeAlert`: Hide an alert until a specific time.
    - `resolveAlert`: Mark as resolved with a required clinical note.
    - `archiveAlert`: Move to archived state.

### 2. Alerts UI Enhancements
- [x] **Action Menu**: Add "Assign", "Snooze", and "Resolve" buttons to the `AlertCard` in `app/(dashboard)/alerts/page.tsx`.
- [x] **Assignment Selector**: Simple "Claim" button to assign alerts to self.
- [x] **Resolution Dialog**: Modal to capture the clinician's reasoning/note when resolving a critical alert.
- [x] **Snooze Logic**: Update `getAlerts` query to respect `snoozedUntil` timestamps.

### 3. Audit Trail & History
- [x] **History View**: Expandable section on `AlertCard` to show the audit trail (e.g., "Assigned to Dr. Smith by system", "Snoozed by user").
- [x] **Archive Filters**: Ensure the archived tab correctly displays the historical state and resolution notes.

## Success Criteria
- [x] A clinician can assign a high-priority alert to themselves.
- [x] A clinician can resolve an alert with a note, and the alert disappears from the "Unresolved" queue.
- [x] Every action is logged in an immutable history for clinical auditing.
