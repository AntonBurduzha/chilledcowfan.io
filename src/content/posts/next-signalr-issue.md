---
title: 'Next.js and SignalR: Effortless Socket Integration and Troubleshooting'
description: ''
published: 2023-09-06
draft: false
tags: ['web development', 'nextjs', 'typescript']
---

A minority, but still a massive number of projects, require web sockets integration to provide instant reaction of an interface on changes without re-fetching data.

It’s an essential thing, and we are not going to talk about them or make a comparison between 3rd-party libraries that provide API for a better dev experience.

My goal is to show how to integrate quickly `@microsoft/signalr` with NextJs. And how to solve the problems we faced during development.

I hope everyone has already installed and deployed the NextJS project locally. In my case, the version is `13.2.4`. Let’s add some more important libraries: `swr` (version `2.1.5`) for data fetching and further work with the local cache and `@microsoft/signalr` (version `7.0.5`) - API for web sockets.

```shell
npm install --save @microsoft/signalr swr
```

Let’s start with creating a simple fetcher function and a new hook called `useChatData` to get initial data from our REST API. It returns a list of the messages for the chat, fields that detect errors and loading state, and the method `mutate` that allows to change cached data.

```typescript title="hooks/useChatData.ts"
import useSWR from 'swr';

type Message = {
  content: string;
  createdAt: Date;
  id: string;
};

async function fetcher<TResponse>(url: string, config: RequestInit): Promise<TResponse> {
  const response = await fetch(url, config);
  if (!response.ok) {
    throw response;
  }
  return await response.json();
}

export const useChatData = () => {
  const { data, error, isLoading, mutate } = useSWR<Message[]>('OUR_API_URL', fetcher);
  return {
    data: data || [],
    isLoading,
    isError: error,
    mutate,
  };
};
```

To test that it works as it is supposed, let’s update our page component. Import our hook at the top, and extract data from it like in the snippet below. If it works, you will see rendered data. As you see, it’s quite simple.

```typescript title="pages/chat.ts"
import { useChatData } from 'hooks/useChatData';

const Chat: NextPage = () => {
	const { data } = useChatData();

	return (
		<div>
            {data.map(item => (
                <div key={item.id}>{item.content}</div>
             ))}
        </div>
	);
};
```

The next step requires connecting our future page to web sockets, catching `NewMessage` events, and updating a cache with a new message. I propose to start with building the socket service in a separate file.

According to the examples in SignalR docs, we have to create an instance of connection for further listening to events. I also added a connections object for preventing duplicates and two helpers to start/stop the connections.

```typescript title="api/socket.ts"
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

let connections = {} as {
  [key: string]: { type: string; connection: HubConnection; started: boolean };
};

function createConnection(messageType: string) {
  const connectionObj = connections[messageType];
  if (!connectionObj) {
    console.log('SOCKET: Registering on server events ', messageType);
    const connection = new HubConnectionBuilder()
      .withUrl('API_URL', {
        logger: LogLevel.Information,
        withCredentials: false,
      })
      .withAutomaticReconnect()
      .build();

    connections[messageType] = {
      type: messageType,
      connection: connection,
      started: false,
    };
    return connection;
  } else {
    return connections[messageType].connection;
  }
}

function startConnection(messageType: string) {
  const connectionObj = connections[messageType];
  if (!connectionObj.started) {
    connectionObj.connection
      .start()
      .catch((err) => console.error('SOCKET: ', err.toString()));
    connectionObj.started = true;
  }
}

function stopConnection(messageType: string) {
  const connectionObj = connections[messageType];
  if (connectionObj) {
    console.log('SOCKET: Stoping connection ', messageType);
    connectionObj.connection.stop();
    connectionObj.started = false;
  }
}

function registerOnServerEvents(
  messageType: string,
  callback: (payload: Message) => void,
) {
  try {
    const connection = createConnection(messageType);
    connection.on('NewIncomingMessage', (payload: Message) => {
      callback(payload);
    });
    connection.onclose(() => stopConnection(messageType));
    startConnection(messageType);
  } catch (error) {
    console.error('SOCKET: ', error);
  }
}

export const socketService = {
  registerOnServerEvents,
  stopConnection,
};
```

So now, our page might look like in the code snippet. We fetch and extract `data` with the list of messages and render them. Also, `useEffect` above registers the `NewMessage` event, creates a connection, and listens to the backend.

When the event triggers, the `mutate` method from the hook updates the existing list with a new object.

```typescript title="pages/chat.ts"
import { useChatData } from 'hooks/useChatData';
import { socketService } from 'api/socket';

const Chat: NextPage = () => {
	const { data } = useChatData();

	useEffect(() => {
        socketService.registerOnServerEvents(
            'NewMessage',
            (payload: Message) => {
                mutate(() => [...data, payload], { revalidate: false });
            }
        );
    }, [data]);

	useEffect(() => {
        return () => {
            socketService.stopConnection('NewMessage');
        };
    }, []);

	return (
		<div>
            {data.map(item => (
                <div key={item.id}>{item.content}</div>
            ))}
        </div>
	);
};
```

Looks good to me, it works, and we see how new messages appear in the feed. I chose the basic example with chat because it’s clear and easy to understand. And, of course, you apply it on your own logic.

### Small Bonus

Using one of the versions (`@microsoft/signalr`), we faced a problem with duplications. It was connected to `useEffect`, the dependency array. Each time the dependency was changed, `connection.on(event, callback);` cached callback and triggered it again and again.

```typescript
useEffect(() => {
  // data equals [] by default (registerOnServerEvents 1 run),
  // but after initial data fetching it changes (registerOnServerEvents 2 run)
  // each event changes data and triggers running of registerOnServerEvents
  socketService.registerOnServerEvents(
    'NewMessage',
    // callback cached
    (payload: Message) => {
      // mutate called multiple times on each data change
      mutate(() => [...data, payload], { revalidate: false });
    },
  );
}, [data]);
// after getting 3 messages events, we had got 4 messages rendered lol
```

The quickest and most reliable solution we found was keeping a copy of data inside the React `ref` and using it inside `useEffect` for future updates.

```typescript title="pages/chat.ts"
import { useChatData } from 'hooks/useChatData';
import { socketService } from 'api/socket';

const Chat: NextPage = () => {
	const { data } = useChatData();
	const messagesRef = useRef<Message[]>([]);

	useEffect(() => {
	     messagesRef.current = chatData;
    }, [chatData]);

	useEffect(() => {
        socketService.registerOnServerEvents(
            'NewMessage',
            (payload: Message) => {
			    const messagesCopy = messagesRef.current.slice();
                mutate(() => [...messagesCopy, payload], { revalidate: false });
            }
        );
    }, [data]);

	useEffect(() => {
        return () => {
            socketService.stopConnection('NewMessage');
        };
    }, []);

	return (
		<div>
            {data.map(item => (
                <div key={item.id}>{item.content}</div>
            ))}
        </div>
	);
};
```

Currently, we use a new version of `@microsoft/signalr` which it seems already has necessary fixes. But anyway, if someone finds this solution useful and uses this workaround, I will be happy. To conclude, I want to say that my experience with SignalR is quite positive, installation didn’t require any specific dependencies or settings, and it works fine and covers our needs.
