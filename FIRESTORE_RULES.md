# Firebase security rules (Firestore + Storage)

Permission errors mean the rules **published in Firebase Console** do not match what the app needs. Editing files in this repo alone is not enough — you must **publish** them.

## Deploy (recommended)

```bash
npx firebase-tools login
npx firebase-tools deploy --only firestore:rules,storage --project carsos-d5055
```

- Firestore: [`firestore.rules`](firestore.rules)
- Storage: [`storage.rules`](storage.rules)

---

## Workshop profile picture upload

**Error:** `User does not have permission to access 'workshop_profiles/...'`

**Used in:** `signup.tsx` (new bengkel), `(bengkel)/profile.tsx` (update photo)

**Paths:**

| Path | Who can write |
|------|----------------|
| `workshop_profiles/{uid}.jpg` | Signed-in user whose `uid` matches the filename |
| `workshop_docs/{uid}/...` | Same owner; admins can read for verification |

New workshops are **not verified yet** but are still **signed in** after signup — rules allow upload as long as `request.auth.uid` matches the path.

### Storage rules in Console (minimal patch)

Firebase Console → **Storage** → **Rules** → publish something like:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /workshop_profiles/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
        && fileName == request.auth.uid + '.jpg';
    }
    match /workshop_docs/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null
        && request.auth.uid == userId;
    }
  }
}
```

Or deploy [`storage.rules`](storage.rules) from this repo (includes admin read for `workshop_docs`).

---

## Admin workshop reports

**Screens:** `reportsA` (workshop list), `reportDetail` (metrics per workshop)

**Reads:**

| Collection          | Query / access                                      |
|---------------------|-----------------------------------------------------|
| `users`             | `role == bengkel` and `verified == true`            |
| `service_requests`  | `bengkelID == <workshopId>`                         |
| `ratings`           | `bengkelID == <workshopId>`                         |

**Required:** Admin account must have `users/{uid}.role == 'admin'`, and rules must include `isAdmin()` on `service_requests` and `ratings` reads (and allow listing `users` while signed in).

If reports are empty or fail, your live Console rules likely only allow users to read **their own** documents. Merge or replace with [`firestore.rules`](firestore.rules).

### Minimal Console patch (if you keep existing rules)

Add helper and extend existing `match` blocks:

```
function isAdmin() {
  return request.auth != null
    && exists(/databases/$(database)/documents/users/$(request.auth.uid))
    && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

- **users:** `allow read: if request.auth != null;` (or add `|| isAdmin()` to your current read rule)
- **service_requests:** add `|| isAdmin()` to `allow read`
- **ratings:** add `|| isAdmin()` to `allow read` (or `allow read: if request.auth != null`)

Click **Publish**, then reload the app.

---

## AI chat logging

**Collection:** `ai_queries`, `ai_feedback` — create with `userId == request.auth.uid`

See `match /ai_queries` and `match /ai_feedback` in [`firestore.rules`](firestore.rules).

---

## Verify admin account

In Firestore → `users` → document for `a@gmail.com` (or your admin login):

```json
{ "role": "admin", ... }
```

Without `role: "admin"`, `isAdmin()` is false and report queries are denied.
