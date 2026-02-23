# Roommate Hub — API Documentation

Base URL: `http://localhost:<PORT>/api`

## Authentication

All endpoints (except register/login) require a Bearer token:

```
Authorization: Bearer <token>
```

Tokens are returned from the register and login endpoints.

---

## Auth

### Register

```
POST /api/auth/register
```

**Body:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| username | string | yes | 3-50 chars |
| password | string | yes | min 8 chars |
| firstName | string | yes | min 1 char |
| lastName | string | yes | min 1 char |

**Response:** `201` — user object + token

---

### Login

```
POST /api/auth/login
```

**Body:**

| Field | Type | Required |
|-------|------|----------|
| username | string | yes |
| password | string | yes |

**Response:** `200` — user object + token

---

### Get Profile

```
GET /api/auth/me
```

**Response:** `200` — current user object

---

### Update Profile

```
PATCH /api/auth/me
```

**Body (all optional):**

| Field | Type |
|-------|------|
| firstName | string |
| lastName | string |
| avatarUrl | string (URL) |

**Response:** `200` — updated user object

---

## Rooms

### Create Room

```
POST /api/rooms
```

**Body:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| name | string | yes | 1-100 chars |
| description | string | no | max 500 chars |

**Response:** `201` — room object (caller becomes owner)

---

### List My Rooms

```
GET /api/rooms
```

**Response:** `200` — array of rooms the user belongs to

---

### Join Room

```
POST /api/rooms/join
```

**Body:**

| Field | Type | Required |
|-------|------|----------|
| inviteCode | string | yes |

**Response:** `200` — joined room object

---

### Get Room

```
GET /api/rooms/:roomId
```

**Permission:** room member

**Response:** `200` — room object

---

### Update Room

```
PATCH /api/rooms/:roomId
```

**Permission:** `edit_room`

**Body (all optional):**

| Field | Type |
|-------|------|
| name | string (1-100) |
| description | string (max 500) |

**Response:** `200` — updated room object

---

### Delete Room

```
DELETE /api/rooms/:roomId
```

**Permission:** `delete_room`

**Response:** `200` — success

---

### Leave Room

```
POST /api/rooms/:roomId/leave
```

**Permission:** room member

**Response:** `200` — success

---

## Members

All routes: `/api/rooms/:roomId/members`

### List Members

```
GET /api/rooms/:roomId/members
```

**Permission:** room member

**Response:** `200` — array of active member objects

---

### Remove Member

```
DELETE /api/rooms/:roomId/members/:memberId
```

**Permission:** `remove_members` (must outrank target)

**Response:** `200` — success

---

### Change Role

```
PATCH /api/rooms/:roomId/members/:memberId/role
```

**Permission:** `change_roles`

**Body:**

| Field | Type | Required |
|-------|------|----------|
| roleId | integer | yes |

**Response:** `200` — updated member

---

### Transfer Ownership

```
POST /api/rooms/:roomId/members/transfer-ownership
```

**Permission:** `transfer_ownership`

**Body:**

| Field | Type | Required |
|-------|------|----------|
| newOwnerId | UUID | yes |

**Response:** `200` — success

---

## Tasks

All routes: `/api/rooms/:roomId/tasks`

### List Tasks

```
GET /api/rooms/:roomId/tasks
```

**Permission:** room member

**Query (all optional):**

| Param | Type | Values |
|-------|------|--------|
| status | string | `pending`, `in_progress`, `completed`, `cancelled` |
| assignedTo | UUID | member ID |
| priority | string | `low`, `medium`, `high` |
| dueBefore | date | ISO date |
| dueAfter | date | ISO date |

**Response:** `200` — array of task objects

---

### Create Task

```
POST /api/rooms/:roomId/tasks
```

**Permission:** `create_task`

**Body:**

| Field | Type | Required | Default |
|-------|------|----------|---------|
| title | string (1-255) | yes | |
| description | string | no | |
| dueDate | date | no | |
| dueTime | string | no | HH:MM or HH:MM:SS |
| priority | string | no | `"medium"` |
| assignedTo | UUID | no | |
| isRecurring | boolean | no | `false` |
| recurrencePattern | string | no | `daily`, `weekly`, `biweekly`, `monthly` |
| recurrenceEndDate | date | no | |

**Response:** `201` — task object

---

### Get Task

```
GET /api/rooms/:roomId/tasks/:taskId
```

**Permission:** room member

**Response:** `200` — task object

---

### Update Task

```
PATCH /api/rooms/:roomId/tasks/:taskId
```

**Permission:** `update_task`

**Body:** same fields as create (all optional)

**Response:** `200` — updated task

---

### Delete Task

```
DELETE /api/rooms/:roomId/tasks/:taskId
```

**Permission:** `delete_task`

**Response:** `200` — success

---

### Update Task Status

```
PATCH /api/rooms/:roomId/tasks/:taskId/status
```

**Permission:** `complete_task`

**Body:**

| Field | Type | Values |
|-------|------|--------|
| status | string | `pending`, `in_progress`, `completed`, `cancelled` |

**Response:** `200` — updated task

---

### Assign Task

```
POST /api/rooms/:roomId/tasks/:taskId/assign
```

**Permission:** `assign_task`

**Body:**

| Field | Type | Required |
|-------|------|----------|
| assignedTo | UUID | yes |

**Response:** `200` — updated task

---

### Start Task

```
POST /api/rooms/:roomId/tasks/:taskId/start
```

**Permission:** `complete_task`

**Response:** `200` — task with status `in_progress`

---

### Complete Task

```
POST /api/rooms/:roomId/tasks/:taskId/complete
```

**Permission:** `complete_task`

**Response:** `200` — task with status `completed`

---

### Cancel Task

```
POST /api/rooms/:roomId/tasks/:taskId/cancel
```

**Permission:** `delete_task`

**Response:** `200` — task with status `cancelled`

---

## Feedback

All routes: `/api/rooms/:roomId/feedback`

### List Feedback

```
GET /api/rooms/:roomId/feedback
```

**Permission:** room member

**Query (all optional):**

| Param | Type | Values |
|-------|------|--------|
| type | string | `issue`, `suggestion` |
| status | string | `open`, `done`, `rejected`, `archived` |

**Response:** `200` — array of feedback objects with `votes` (number) and `userVoted` (boolean)

---

### Create Feedback

```
POST /api/rooms/:roomId/feedback
```

**Permission:** `create_feedback`

**Body:**

| Field | Type | Required | Default |
|-------|------|----------|---------|
| type | string | yes | `issue` or `suggestion` |
| title | string (1-255) | yes | |
| description | string | no | |
| isAnonymous | boolean | no | `false` |

> Anonymous feedback requires at least 3 active room members.

**Response:** `201` — feedback object

---

### Get Feedback

```
GET /api/rooms/:roomId/feedback/:feedbackId
```

**Permission:** room member

**Response:** `200` — feedback object with `votes`

---

### Vote on Feedback

```
POST /api/rooms/:roomId/feedback/:feedbackId/vote
```

**Permission:** `vote_feedback`

No request body needed. Creates an upvote. Returns `409 Conflict` if already voted.

**Response:** `200`

```json
{ "votes": 5, "userVoted": true }
```

---

### Remove Vote from Feedback

```
DELETE /api/rooms/:roomId/feedback/:feedbackId/vote
```

**Permission:** `vote_feedback`

**Response:** `200`

```json
{ "votes": 4, "userVoted": false }
```

---

### Close Feedback

```
PATCH /api/rooms/:roomId/feedback/:feedbackId/close
```

**Permission:** `close_feedback`

**Body:**

| Field | Type | Values |
|-------|------|--------|
| status | string | `done`, `rejected`, `archived` |

**Response:** `200` — updated feedback object

---

## Rules

All routes: `/api/rooms/:roomId/rules`

### List Rules

```
GET /api/rooms/:roomId/rules
```

**Permission:** `view_rules`

**Query (all optional):**

| Param | Type | Values |
|-------|------|--------|
| status | string | `proposed`, `approved`, `rejected`, `archived` |

**Response:** `200` — array of rule objects with `votes` (number), `userVoted` (boolean), `userAccepted` (boolean)

---

### Create Rule

```
POST /api/rooms/:roomId/rules
```

**Permission:** `propose_rule`

**Body:**

| Field | Type | Required |
|-------|------|----------|
| title | string (1-255) | yes |
| description | string (min 1) | yes |
| category | string (max 50) | no |
| votingDeadline | date | no |

**Response:** `201` — rule object

---

### Get Rule

```
GET /api/rooms/:roomId/rules/:ruleId
```

**Permission:** `view_rules`

**Response:** `200` — rule object with `votes`

---

### Update Rule

```
PATCH /api/rooms/:roomId/rules/:ruleId
```

**Permission:** `modify_rules`

**Body (all optional):**

| Field | Type |
|-------|------|
| title | string (1-255) |
| description | string (min 1) |
| category | string (max 50) |

**Response:** `200` — updated rule

---

### Delete Rule

```
DELETE /api/rooms/:roomId/rules/:ruleId
```

**Permission:** `modify_rules`

**Response:** `200` — success

---

### Vote on Rule

```
POST /api/rooms/:roomId/rules/:ruleId/vote
```

**Permission:** `vote_rule`

No request body needed. Creates an upvote. Returns `409 Conflict` if already voted.

**Response:** `200`

```json
{ "votes": 3, "userVoted": true }
```

---

### Remove Vote from Rule

```
DELETE /api/rooms/:roomId/rules/:ruleId/vote
```

**Permission:** `vote_rule`

**Response:** `200`

```json
{ "votes": 2, "userVoted": false }
```

---

### Accept Rule

```
POST /api/rooms/:roomId/rules/:ruleId/accept
```

**Permission:** room member

Only works on rules with status `approved`. Returns `409` if already accepted.

**Response:** `200` — success

---

### Get Pending Acceptance

```
GET /api/rooms/:roomId/rules/pending-acceptance
```

**Permission:** room member

**Response:** `200` — array of approved rules the user hasn't accepted yet

---

## Items

All routes: `/api/rooms/:roomId/items`

### List Items

```
GET /api/rooms/:roomId/items
```

**Permission:** `view_items`

**Query (all optional):**

| Param | Type | Values |
|-------|------|--------|
| status | string | `available`, `low`, `out_of_stock` |
| category | string | any |

**Response:** `200` — array of item objects

---

### Create Item

```
POST /api/rooms/:roomId/items
```

**Permission:** `add_item`

**Body:**

| Field | Type | Required |
|-------|------|----------|
| name | string (1-100) | yes |
| category | string (max 50) | no |

**Response:** `201` — item object

---

### Get Item

```
GET /api/rooms/:roomId/items/:itemId
```

**Permission:** `view_items`

**Response:** `200` — item object

---

### Update Item

```
PATCH /api/rooms/:roomId/items/:itemId
```

**Permission:** `update_item`

**Body (all optional):**

| Field | Type |
|-------|------|
| name | string (1-100) |
| category | string (max 50) |

**Response:** `200` — updated item

---

### Delete Item

```
DELETE /api/rooms/:roomId/items/:itemId
```

**Permission:** `delete_items`

**Response:** `200` — success

---

### Update Item Status

```
PATCH /api/rooms/:roomId/items/:itemId/status
```

**Permission:** room member

**Body:**

| Field | Type | Values |
|-------|------|--------|
| status | string | `available`, `low`, `out_of_stock` |

**Response:** `200` — updated item

---

### Record Purchase

```
POST /api/rooms/:roomId/items/:itemId/purchase
```

**Permission:** room member

**Body (all optional):**

| Field | Type | Default |
|-------|------|---------|
| quantity | integer (positive) | `1` |
| price | number (positive) | |
| currency | string (max 10) | `"EUR"` |
| notes | string (max 255) | |

**Response:** `200` — item with purchase record

---

### Get Purchase History

```
GET /api/rooms/:roomId/items/:itemId/history
```

**Permission:** `view_items`

**Query:**

| Param | Type | Default |
|-------|------|---------|
| limit | integer | `10` |

**Response:** `200` — array of purchase records

---

## Presence

All routes: `/api/rooms/:roomId/presence`

### Get Room Presence

```
GET /api/rooms/:roomId/presence
```

**Permission:** `view_presence`

**Response:** `200` — array of member presence objects

---

### Update My Presence

```
PATCH /api/rooms/:roomId/presence
```

**Permission:** `update_own_presence`

**Body:**

| Field | Type | Required |
|-------|------|----------|
| isPresent | boolean | yes |

**Response:** `200` — updated presence object

---

## Guest Invitations

### Create Invitation

```
POST /api/rooms/:roomId/guests
```

**Permission:** `invite_guests`

**Body:**

| Field | Type | Required |
|-------|------|----------|
| label | string (1-50) | no |
| validUntil | date | yes |

**Response:** `201` — invitation object with code

---

### List Invitations

```
GET /api/rooms/:roomId/guests
```

**Permission:** `invite_guests`

**Response:** `200` — array of invitation objects

---

### Revoke Invitation

```
DELETE /api/rooms/:roomId/guests/:invitationId
```

**Permission:** `invite_guests`

**Response:** `200` — success

---

### Accept Invitation (global)

```
POST /api/guests/accept
```

**Body:**

| Field | Type | Required |
|-------|------|----------|
| invitationCode | string | yes |

**Response:** `200` — joined room details

---

## Response Format

### Success

```json
{
  "data": { ... },
  "meta": {
    "timestamp": "2026-02-23T12:00:00.000Z"
  }
}
```

### Errors

```json
{
  "error": "NotFound",
  "message": "Resource not found",
  "timestamp": "2026-02-23T12:00:00.000Z",
  "path": "/api/rooms/123"
}
```

Validation errors (422) include a `details` field with field-level errors.

| Status | Error | Meaning |
|--------|-------|---------|
| 400 | BadRequest | Invalid input |
| 401 | Unauthorized | Missing or invalid auth token |
| 403 | Forbidden | Insufficient permissions |
| 404 | NotFound | Resource not found |
| 409 | Conflict | Duplicate vote, already accepted, etc. |
| 422 | UnprocessableEntity | Schema validation failed |
