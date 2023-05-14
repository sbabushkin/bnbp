import {
  ApolloClient,
  ApolloLink,
  DocumentNode,
  InMemoryCache,
  NormalizedCacheObject,
  OperationVariables,
  split,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { getMainDefinition } from '@apollo/client/utilities';
import { createUploadLink } from 'apollo-upload-client';
import { GraphQLError } from 'graphql';
import { FetchResult } from '@apollo/client/link/core';
import { WebSocketLink } from '@apollo/client/link/ws';
import { SubscriptionClient } from 'subscriptions-transport-ws';

export type GraphqlContext = {
  error?: Error | ServerError | string | undefined;
  displayNotification?: boolean;
  redirectTo?: string;
  successMessage?: string;
  upload?: boolean;
  withoutAuth?: boolean;
};

export type GraphqlSubscriptionParams<Q, V> = {
  query: DocumentNode;
  variables?: V;
  handlers: {
    onNext: (value: FetchResult<Q>) => void,
    onError?: (error: any) => void,
    onComplete?: () => void,
  }
};

type GraphqlQueryParams<V> = {
  query: DocumentNode;
  variables?: V;
  context?: Partial<GraphqlContext>;
};

type GraphqlMutationParams<V> = {
  mutation: DocumentNode;
  variables?: V;
  context?: Partial<GraphqlContext>;
  upload?: boolean;
};

interface ServerError extends GraphQLError {
  code: number;
  systemType: 'system' | 'forge' | 'customerEnterCode';
}

// eslint-disable-next-line prefer-const
let graphQlClient: ApolloClient<NormalizedCacheObject>;

const graphqlHttpUri = '/graphql';

const buildWSUri = () => {
  const useWss = window.location.protocol === 'https:';
  return `ws${useWss ? 's' : ''}://${window.location.host}/graphql`;
};

// Auth middleware for request
const authMiddlewareLink = setContext(async (_, previousContext) => {
  return previousContext;
});

const errorAfterWareLink = onError(
  ({
    operation,
    graphQLErrors,
    networkError,
  }) => {
    operation.setContext((prevContext: any) => ({
      error: true,
      ...prevContext,
    }));

    if (graphQLErrors) {
      graphQLErrors.forEach((error) => {
        const {
          code,
          message,
          locations,
          path,
        } = error as ServerError;

        console.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`);

        if (code === 401 || code === 403 || message === 'Unauthorized') {
          console.error('[GraphQL error]: Code:', code, 'Message:', message)
        }
      });
    } else if (networkError) {
      console.error(`[Network error]: ${networkError}`);
    }

    return undefined;
  },
);

const successAfterWareLink = new ApolloLink((operation, forward) => forward(operation)
  .map((resp) => {
    const {
      error,
      displayNotification,
      redirectTo,
      successMessage = 'Сохранено',
    } = operation.getContext() as GraphqlContext;

    if (!error && displayNotification) {
      console.log(successMessage);
    }

    return resp;
  }));

// Create http link
const httpLink = createUploadLink({ uri: graphqlHttpUri });

// Create a WebSocket link:
const wsLink = new WebSocketLink(new SubscriptionClient(
  buildWSUri(),
  {
    reconnect: true,
    lazy: true,
  },
));

const transportLink = split(
  // split based on operation types
  ({ query }) => {
    const definitionNode = getMainDefinition(query);
    return (
      definitionNode.kind === 'OperationDefinition'
      && definitionNode.operation === 'subscription'
    );
  },
  wsLink,
  httpLink,
);

const link = ApolloLink.from([
  successAfterWareLink,
  errorAfterWareLink,
  // authMiddlewareLink,
  transportLink,
]);

// eslint-disable-next-line prefer-const
graphQlClient = new ApolloClient({
  link,
  defaultOptions: {
    query: {
      fetchPolicy: 'no-cache',
    },
    mutate: {
      fetchPolicy: 'no-cache',
    },
    watchQuery: {
      fetchPolicy: 'no-cache',
    },
  },
  cache: new InMemoryCache({
    addTypename: false,
    resultCaching: false,
  }),
});

export const apolloQuery = <Q, V extends OperationVariables>({
  query,
  variables,
  context,
}: GraphqlQueryParams<V>) => graphQlClient.query<Q, V>({
  query,
  variables,
  context,
}).then((result) => result?.data);

export const apolloMutation = async <M, V extends OperationVariables>({
  mutation,
  variables,
  context,
  upload = false,
}: GraphqlMutationParams<V>) => graphQlClient.mutate<M, V>({
  mutation,
  variables,
  context: {
    ...context,
    upload,
  },
})
  .then((result) => result.data!);

export const apolloSubscription = <Q, V extends OperationVariables>({
  query,
  variables,
  handlers: {
    onNext,
    onError,
    onComplete,
  },
}: GraphqlSubscriptionParams<Q, V>) => {
  const observable = graphQlClient.subscribe<Q, V>({
    query,
    variables,
  });

  return observable.subscribe(onNext, onError, onComplete);
};
