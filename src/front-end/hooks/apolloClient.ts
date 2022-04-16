import { useMemo } from "react";
import {
  ApolloClient,
  InMemoryCache,
  NormalizedCacheObject,
} from "@apollo/client";

let apolloClient: ApolloClient<NormalizedCacheObject>;

async function createIsomorphLink() {
  if (typeof window === "undefined") {
    const { SchemaLink } = await import("@apollo/client/link/schema");
    const { schema } = await import("@/server/graphql/schema");
    return new SchemaLink({ schema });
  } else {
    const { HttpLink } = await import("@apollo/client/link/http");
    return new HttpLink({
      uri: "/api/graphql",
      credentials: "same-origin",
    });
  }
}

async function createApolloClient() {
  return new ApolloClient({
    ssrMode: typeof window === "undefined",
    link: await createIsomorphLink(),
    cache: new InMemoryCache(),
  });
}

export async function initializeApollo(initialState = null) {
  const _apolloClient = apolloClient ?? (await createApolloClient());

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // gets hydrated here
  if (initialState) {
    _apolloClient.cache.restore(initialState);
  }
  // For SSG and SSR always create a new Apollo Client
  if (typeof window === "undefined") return _apolloClient;
  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient;

  return _apolloClient;
}

export function useApollo(initialState: any) {
  const store = useMemo(
    async () => await initializeApollo(initialState),
    [initialState]
  );
  return store;
}
