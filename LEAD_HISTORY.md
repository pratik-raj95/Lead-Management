# Lead History & Activity Timeline Documentation

The CRM tracks every action associated with a lead record. These are stored chronologically in `Sheet2` (Google Sheets) or fallback local JSON caches.

---

## 1. Schema Specifications

Every log entry in `Sheet2` implements the following row fields:

| Field | Header | Example Value |
| :--- | :--- | :--- |
| **Activity ID** | `Activity ID` | `act_1688647200000_152` |
| **Lead ID** | `Lead ID` | `lead_1688647100000_482` |
| **Phone Number** | `Phone Number` | `9876543210` |
| **Activity Type** | `Activity Type` | `Status Changed` |
| **Old Value** | `Old Value` | `New Leads` |
| **New Value** | `New Value` | `Interested` |
| **Description** | `Description` | `Pipeline stage moved from New Leads to Interested` |
| **Performed By** | `Performed By` | `System` |
| **Timestamp** | `Timestamp` | `2026-07-07T12:00:00.000Z` |

---

## 2. Trigger Events

The following table outlines when logs are generated, what data they populate, and who triggers them:

### A. Lead Creation & Ingest
* **Activity Type**: `Lead Created` / `Webhook Received` / `Meta Lead Imported` / `Google Ads Lead Imported`
* **Trigger**: Triggered when a new lead enters the system via simulator webhook, API, Meta Lead Ads forms, Google Ads Forms, or WhatsApp Cloud inbound messages.
* **Fields**: `Old Value` = `""`, `New Value` = Target Source, `Description` = *"Webhook registration captured from source."*

### B. Status Moves (Kanban Drag & Drop)
* **Activity Type**: `Status Changed`
* **Trigger**: Dragging a card to a different pipeline stage on the board.
* **Fields**: `Old Value` = Previous Status, `New Value` = New Status, `Description` = *"Pipeline stage moved from Old to New."*

### C. Details Update (Modal Modifications)
* **Activity Type**: `Follow-up Updated` / `Notes Updated`
* **Trigger**: Modifying the follow-up date picker or editing the notes input inside the lead details modal.
* **Fields**: `Old Value` = Previous Date, `New Value` = New Date, `Description` = *"Follow up date set to YYYY-MM-DD"* or *"Timeline notes updated"*.

### D. Duplicate Lead Merges
* **Activity Type**: `Duplicate Merged`
* **Trigger**: A webhook receives a lead whose phone number already exists in the database.
* **Fields**: `Old Value` = Existing lead source list, `New Value` = Updated source list, `Description` = *"Duplicate lead merged via webhook. Inflow source: source."*

### E. Communication Messages
* **Activity Type**: `WhatsApp Message Sent`
* **Trigger**: Dispatching an outgoing message to the lead via the WhatsApp Outbox panel.
* **Fields**: `Old Value` = `""`, `New Value` = `""`, `Description` = Outgoing message text body.

### F. Deletions
* **Activity Type**: `Lead Deleted`
* **Trigger**: Triggering the delete action button.
* **Fields**: `Old Value` = Last Status, `New Value` = `""`, `Description` = *"Lead records removed from database."*

---

## 3. UI Timeline Presentation

When a user opens the details modal in the dashboard:
1. The client sends a request to `GET /api/leads/:id/timeline`.
2. The backend queries `Sheet2` (or JSON fallback), filters rows matching the target `Lead ID`, and sorts them in descending order (latest activities first).
3. The modal displays these events in a timeline view with custom labels showing transitions (e.g. `Status Changed: New Leads → Interested`).
