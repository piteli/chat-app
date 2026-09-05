# respond.io — React Native Chat

A chat app: paginated conversation list, message thread with optimistic sending,
contact profiles with a block toggle, and settings.

**Expo SDK 57** · React Native 0.86 · React 19 · Expo Router · TanStack Query v5 ·
Redux Toolkit · gluestack-ui v5 · NativeWind

## Run it

```bash
npm install
cp .env.example .env
npm start
```

| Script | |
| --- | --- |
| `npm test` | Jest — 38 tests |
| `npm run typecheck` | `tsc --noEmit`, strict |
| `npm run lint` | ESLint |

All three pass, and the app bundles for iOS, Android and web.

## Structure

```
src/
├── app/              # Expo Router — routes only, no business logic
│   ├── (tabs)/       # Chats · Settings
│   ├── chat/[contactId].tsx
│   └── profile/[contactId].tsx
├── features/         # one folder per domain
│   ├── chat/         # api/ · components/ · hooks/ · model/
│   ├── contacts/
│   └── settings/
├── components/
│   ├── common/       # EmptyState, ErrorState, ContactAvatar…
│   └── ui/           # gluestack primitives (generated)
├── lib/              # http client, DTOs, query keys, formatting
├── providers/        # composition root
└── store/            # Redux slices, selectors, typed hooks
```

Dependencies go in one direction: `app → features → components/lib/store`. A feature does not import code from inside another feature.

Inside each feature, `api/*.api.ts` contains simple typed fetch functions. These functions do not depend on React, so they can be tested separately. `api/*.queries.ts` contains the React Query hooks that use these API functions.

`model/` converts the API response into simpler types used by the app. This means if the backend changes a field name, we only need to update the mapping in one place.

## State: what goes where

|                                       | Owner                 | Why                                                                |
| ------------------------------------- | --------------------- | ------------------------------------------------------------------ |
| Contacts, messages, profiles          | TanStack Query        | Comes from the server and needs caching, pagination and refreshing |
| Blocked contacts, outbox, preferences | Redux + redux-persist | Shared between screens and needs to survive app restarts           |
| Composer draft, scroll position       | `useState`            | Only used by that screen                                           |

Server data is not copied into Redux. Keeping the same data in two places means we would need to keep both copies updated.

The composer draft stays inside the component because it changes on every keystroke. Putting it in Redux would cause other parts of the app using that state to update on every character.

## The API affected two decisions

The backend is [ResponseRift](https://responserift.dev/?utm_source=chatgpt.com). It provides `users` and `posts`, rather than `contacts` and `messages`.

Each feature converts the backend data into the format the app needs. This keeps the difference between the backend and app in one place.

**1. `POST /posts` returns the new post but does not save it.**

Because of this, fetching the messages again after sending would remove the message that the user just saw.

So after sending a message, we do not fetch the messages again. The sent message is also saved in the Redux outbox and added back when we display the chat.

With a real backend that saves the post, we would fetch the messages again after sending.

**2. There is no "last message" field.**

Getting the last message for every contact would require one request per contact.

So, before the user sends a message, the contact list shows *"Tap here to message"*.

After sending a message, the contact list uses the message saved in the outbox as the preview. Because the outbox is saved, the preview is still there after restarting the app.

## React Query

* **Query keys** come from one file: `lib/query/keys.ts`. This makes it easier to find and update the right cached data.

* **Refreshing when the app becomes active** is connected to React Native's `AppState`. React Query's normal browser behaviour does not work the same way in React Native.

* **Retries** depend on the error. Network errors, timeouts, server errors and `429` errors are retried. Other `4xx` errors are not retried.

* **Loading more messages** uses an offset. We also prevent multiple `onEndReached` calls from loading the same page when React Native fires the event several times.

* **Sending a message** shows the message immediately before the server responds. If the request succeeds, the temporary message is replaced with the server's ID. We don't fetch the whole chat again, so the list does not jump.

* If sending fails, the temporary message is removed from the cache and marked as failed in the outbox. The user then sees **"Tap to retry"**.

* **Profiles load quickly** by using profile data already available in the contact list. That data is treated as 30 seconds old, so the app updates it in the background.

## Performance

FlashList v2 is used for both the contact list and chat list.

Different types of items, such as day separators and messages, use separate item types so the list can reuse the right views.

`maintainVisibleContentPosition` keeps the chat in the right position when new messages are added. We don't use the `inverted` list option.

Day separators and message grouping are calculated when the data changes instead of every time a message is displayed. This keeps `renderItem` simple.

Rows use `memo` and stable callbacks to avoid unnecessary updates.

Avatars use `expo-image` with a `recyclingKey`, which prevents an old contact's image from briefly appearing on another contact when the list reuses a row.

React Compiler is enabled, so we avoid adding unnecessary manual optimisations.

## UI

The UI uses gluestack-ui components and NativeWind for styling.

Instead of putting colours directly in components, we use names based on their purpose, such as:

* `bg-bubble-out`
* `bg-brand`

This makes light and dark mode easier because components don't need to check which theme is active.

The app handles:

* Loading
* Empty lists
* Errors
* Offline state
* Failed messages
* Retry after a failed message

Loading screens also use shapes that look similar to the actual content.

API errors are converted into user-friendly messages in one place instead of handling the wording separately on every screen.

## Testing

The simple parts are tested separately, including:

* API data conversion
* Day separators
* Loading more messages
* Removing duplicate messages
* Redux reducers
* Redux selectors

The most important flow has an integration test in `sendMessage.test.tsx`.

It tests the real React hooks with a fake `fetch` and checks that:

1. The message appears immediately before the request finishes.
2. The message is replaced with the server ID without creating a duplicate.
3. If sending fails, the message can still be retried.

We don't fake the clock for the whole test suite. Instead, date functions receive `now` as an input, which makes them easier to test.

`forceExit` is enabled because RNTL 14 with RN 0.86 can leave a process running after the tests finish.
