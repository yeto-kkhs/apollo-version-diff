import { ApolloClient, gql, InMemoryCache, useQuery } from "@apollo/client";
import { offsetLimitPagination } from "@apollo/client/utilities";

import { useId, useState } from "react";

const pokemonQuery = gql`
  query Pokemons($offset: Int!, $limit: Int!) {
    pokemons: pokemon_v2_pokemonspecies(offset: $offset, limit: $limit, order_by: { order: asc }) {
      id
      order
      species: pokemon_v2_pokemonspeciesnames(where: { language_id: { _eq: 1 } }) {
        name
      }
    }
  }
`;

type Pokemons = {
  pokemons: {
    id: number;
    order: number;
    species: [{ name: string }];
  }[];
};

const ns = {
  1: "loading",
  2: "setVariables",
  3: "fetchMore",
  4: "refetch",
  6: "poll",
  7: "ready",
  8: "error",
};

const client = new ApolloClient({
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          pokemon_v2_pokemonspecies: offsetLimitPagination(),
        },
      },
    },
  }),
  uri: "https://beta.pokeapi.co/graphql/v1beta",
  headers: {
    "content-type": "application/json",
  },
});

function Pokemon({
  pokemons,
  error,
  loading,
}: {
  pokemons: Pokemons["pokemons"];
  error: any;
  loading: boolean;
}) {
  if (loading) {
    return <div>loading...</div>;
  }

  if (error) {
    return <div>error</div>;
  }
  return (
    <ul>
      {pokemons.map((pkmn) => (
        <li key={pkmn.id}>
          <span>
            No.{pkmn.order}: {pkmn.species[0].name}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function Apollo_3_8_4() {
  const [notifyOnNetworkStatusChange, setNotifyOnNetworkStatusChange] =
    useState(false);
  const { data, fetchMore, error, loading, networkStatus, refetch } = useQuery<
    Pokemons,
    { offset: number; limit: number }
  >(pokemonQuery, {
    client,
    variables: { limit: 3, offset: 0 },
    notifyOnNetworkStatusChange,
    onCompleted: async ({ pokemons }) => {
      const offset = pokemons[pokemons.length - 1]?.order ?? 9999;
      console.log("\x1b[32m[3.8.4][onCompleated]", { pokemons, offset });
      if (offset < 8) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        fetchMore({ variables: { offset, limit: 3 } });
      }
    },
  });

  console.log("\x1b[33m[3.8.4][rerender]", {
    pokemonsLength: data?.pokemons.length ?? 0,
    loading,
    networkStatus: ns[networkStatus],
  });

  const id = useId();
  const id2 = useId();

  return (
    <section>
      <h2>Apollo Client 3.8.4</h2>
      <div style={{ display: "flex" }}>
        <label htmlFor={id}>notifyOnNetworkStatusChange</label>
        <input
          id={id}
          type="checkbox"
          onChange={(e) => {
            setNotifyOnNetworkStatusChange(e.target.checked);
            refetch({ limit: 3, offset: 0 });
          }}
        />
      </div>
      <div>
        <input type="text" id={id2} />
        <button
          onClick={async () => {
            const text = (document.getElementById(id2) as HTMLInputElement)
              .value;
            client.writeQuery({
              query: pokemonQuery,
              data: {
                pokemons: {
                  __typename: "pokemon_v2_pokemonspecies",
                  id: 1,
                  order: 1,
                  species: [
                    {
                      __typename: "pokemon_v2_pokemonspeciesname",
                      name: text,
                    },
                  ],
                },
              },
            });
          }}
        >
          writeQueryでフシギダネの名前を書き換える
        </button>
      </div>
      <p>Network Status: {ns[networkStatus]}</p>
      <Pokemon
        pokemons={data?.pokemons ?? []}
        error={error}
        loading={loading}
      />
    </section>
  );
}
