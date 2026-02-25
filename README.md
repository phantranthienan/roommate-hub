# Roommate Hub

A roommate management app for shared households. Manage chores, track shared supplies, propose house rules, and submit feedback

## Features

- **Chores**: Create, assign, and complete household tasks with due dates and priorities. 
- **Feedback**: Submit issues or suggestions, upvote items, and resolve/reject.
- **House Rules**: Propose rules for the household, vote on proposals, and accept approved rules.
- **Shared Supplies**: Track household items (toilet paper, dish soap, etc.) with stock status and purchase history.
- **Room Management**: Create rooms, invite members via invite code, manage guest invitations with expiry dates.
- **Presence**: Members can set their home/away status.

## RBAC (Role-Based Access Control)

Four roles with decreasing privilege: **Owner > Admin > Member > Guest**.

### Viewing

All roles (including guests) can view tasks, feedback, rules, and supplies.

### Chores

| Action | Owner | Admin | Member | Guest |
|---|:---:|:---:|:---:|:---:|
| Create / edit / delete tasks | Y | Y | - | - |
| Assign tasks to members | Y | Y | - | - |
| Complete any task | Y | Y | - | - |
| Complete own assigned task | Y | Y | Y | - |

### Feedback

| Action | Owner | Admin | Member | Guest |
|---|:---:|:---:|:---:|:---:|
| Submit feedback | Y | Y | Y | - |
| Vote on feedback | Y | Y | Y | - |
| Resolve / reject feedback | Y | Y | - | - |

### House Rules

| Action | Owner | Admin | Member | Guest |
|---|:---:|:---:|:---:|:---:|
| Propose a rule | Y | Y | Y | - |
| Vote on proposals | Y | Y | Y | - |
| Approve / reject rules | Y | Y | - | - |

### Shared Supplies

| Action | Owner | Admin | Member | Guest |
|---|:---:|:---:|:---:|:---:|
| Add / delete items | Y | Y | - | - |
| Update stock status | Y | Y | Y | Y |

### Room & Members

| Action | Owner | Admin | Member | Guest |
|---|:---:|:---:|:---:|:---:|
| Edit room details | Y | Y | - | - |
| Invite guests | Y | Y | Y | - |
| Invite / remove members | Y | - | - | - |
| Change member roles | Y | - | - | - |
| Rotate invite code | Y | - | - | - |
| Transfer ownership | Y | - | - | - |
| Delete room | Y | - | - | - |

## Business Logic (Important Behaviors)

This section describes the main domain rules enforced by the backend beyond simple CRUD.

### House Rules workflow

- New rules are created with status `proposed`.
- Only users with `vote_rule` can vote.
- One member can vote only once per rule.
- Votes can only be added/removed while the rule is still `proposed`.
- A rule can be approved only by users with `modify_rules`.
- Approval requires majority: `ceil(active_non_guest_members / 2)`.
- A rule can be rejected only if:
  - it has been proposed for at least 24 hours, and
  - it does not already meet the majority threshold.
- Approved and rejected rules are terminal states (no more voting).

### Tasks workflow

- Only users with `create_task` can create tasks.
- `assignedTo` must be an active member of the same room.
- Done tasks cannot be edited directly.
- A done task must be renewed to become `pending` again.
- Marking a task as done:
  - owner/admin can complete any task,
  - member can complete only tasks assigned to them.
- Deleting tasks requires `delete_task`.

### Feedback workflow

- Feedback starts with status `open`.
- Only `create_feedback` can create feedback entries.
- Only `vote_feedback` can vote or remove vote.
- One member can vote only once per feedback item.
- Votes are allowed only while feedback is `open`.
- Closing feedback requires `close_feedback` and status must be `done` or `rejected`.
- Closed feedback cannot be voted on anymore.

### Membership and role management

- Room-scoped RBAC is enforced server-side on every protected route.
- Membership must be active and non-expired to access room resources.
- Members cannot remove themselves using remove endpoint (must use leave).
- Owner cannot be removed.
- Role change restrictions:
  - cannot change your own role,
  - cannot promote directly to owner (use transfer ownership),
  - cannot assign/change guest role via role change endpoint,
  - cannot modify members at or above your hierarchy level.
- Ownership transfer:
  - only current owner can transfer,
  - target must be active, non-expired, non-guest member,
  - old owner is demoted to admin.

### Guest invitations

- Guest invitation codes are one-time and time-bounded.
- Accepting an invitation assigns the `guest` role with `expiresAt = validUntil`.
- Expired or inactive invitations are rejected.
- Guests have limited permissions but can still access viewing/presence/supply-status flows allowed by RBAC.

## Quick Start

### Requirements

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose

### 1. Start all services

**Option A: Using the run script**

```bash
./run.sh dev
```

**Option B: Using docker compose** 

```bash
docker compose up --build
```

This starts PostgreSQL, the backend (port 3000), and the frontend (port 5173).

### 2. Seed demo data

In a separate terminal, seed the database with demo users and data:

**Option A: Using the run script**

```bash
./run.sh seed-demo
```

**Option B: Using docker compose**

```bash
docker compose exec backend npm run db:seed:demo
```

### 3. Open the app

Go to [http://localhost:5173](http://localhost:5173)

### 4. Log in

All demo accounts share the password: **`12345678`**

**Sunrise Apartment:**

| Username | Role | Name |
|---|---|---|
| `sunrise_owner` | Owner | Alice Sun |
| `sunrise_admin` | Admin | Brandon Ray |
| `sunrise_member1` | Member | Chloe Hill |
| `sunrise_member2` | Member | Daniel Park |

**Oak House:**

| Username | Role | Name |
|---|---|---|
| `oak_owner` | Owner | Evelyn Oak |
| `oak_admin` | Admin | Felix Stone |
| `oak_member1` | Member | Grace Woods |
| `oak_member2` | Member | Henry Lake |

**Cross-room users:**

| Username | Rooms | Notes |
|---|---|---|
| `cross_room_member` | Sunrise (member) + Oak (member) | Same role in both rooms |
| `sunrise_owner` | Sunrise (owner) + Oak (member) | Owner in one room, member in another |

**Standalone account:**

| Username | Notes |
|---|---|
| `guest_member` | No room membership — use to test the invite/join flow |

### What the demo seeds

Each room has **distinct content** (apartment vs house themes) so switching rooms shows different data.

Per room:
- 8 tasks — pending, done, unassigned, and overdue
- 4 feedback items — 2 open (with votes), 1 resolved, 1 rejected
- 6 house rules — proposed (with/without enough votes), approved (with acceptances), rejected
- 5 shared supplies — mixed stock statuses

### Stop / Reset

**Using the run script:**

```bash
# Stop all containers
./run.sh down

# Stop and destroy database volume (full reset)
./run.sh clean
```

**Using docker compose:**

```bash
# Stop all containers
docker compose down

# Stop and destroy database volume (full reset)
docker compose down -v --rmi local
```

After `clean`, run `./run.sh dev` (or `docker compose up --build`) and re-seed to start fresh.

### run.sh commands reference

| Command | run.sh | docker compose equivalent |
|---------|--------|---------------------------|
| Start dev | `./run.sh dev` | `docker compose up --build` |
| Stop | `./run.sh down` | `docker compose down` |
| Full reset | `./run.sh clean` | `docker compose down -v --rmi local` |
| Seed demo | `./run.sh seed-demo` | `docker compose exec backend npm run db:seed:demo` |
