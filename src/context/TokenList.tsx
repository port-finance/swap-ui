import React, { useContext, useMemo } from "react";
import { TokenInfo } from "@solana/spl-token-registry";
import { MARCH_2022_PP_USDC_MINT, USDC_MINT } from "../utils/pubkeys";

type TokenListContext = {
  tokenMap: Map<string, TokenInfo>;
  principalTokenMaturityMap: Map<string, number>;
  swappableTokens: TokenInfo[];
  principalTokens: TokenInfo[];
};
const _TokenListContext = React.createContext<null | TokenListContext>(null);

const swappableTokensMap = new Set<string>([USDC_MINT.toString()]);

export function TokenListContextProvider(props: any) {
  const tokenList = useMemo(() => {
    const list = props.tokenList.filterByClusterSlug("mainnet-beta").getList();
    return list;
  }, [props.tokenList]);

  // Token map for quick lookup.
  const tokenMap: Map<string, TokenInfo> = useMemo(() => {
    const tokenMap = new Map();
    tokenList.forEach((t: TokenInfo) => {
      tokenMap.set(t.address, t);
    });
    return tokenMap;
  }, [tokenList]);

  const principalTokenMaturityMap: Map<string, number> = new Map([
    [MARCH_2022_PP_USDC_MINT.toString(), 1646920618],
  ]);

  // Tokens with USD(x) quoted markets.
  const swappableTokens = useMemo(() => {
    const tokens = tokenList.filter((t: TokenInfo) => {
      return swappableTokensMap.has(t.address);
    });
    tokens.sort((a: TokenInfo, b: TokenInfo) =>
      a.symbol < b.symbol ? -1 : a.symbol > b.symbol ? 1 : 0
    );
    return tokens;
  }, [tokenList]);

  const principalTokens = useMemo(() => {
    const tokens = tokenList.filter((t: TokenInfo) => {
      return principalTokenMaturityMap.has(t.address);
    });
    tokens.sort((a: TokenInfo, b: TokenInfo) =>
      a.symbol < b.symbol ? -1 : a.symbol > b.symbol ? 1 : 0
    );
    return tokens;
  }, [tokenList]);

  return (
    <_TokenListContext.Provider
      value={{
        tokenMap,
        principalTokenMaturityMap,
        swappableTokens,
        principalTokens,
      }}
    >
      {props.children}
    </_TokenListContext.Provider>
  );
}

export function useTokenListContext(): TokenListContext {
  const ctx = useContext(_TokenListContext);
  if (ctx === null) {
    throw new Error("Context not available");
  }
  return ctx;
}

export function useTokenMap(): Map<string, TokenInfo> {
  const { tokenMap } = useTokenListContext();
  return tokenMap;
}

export function usePrincipalTokenMaturityMap(): Map<string, number> {
  const { principalTokenMaturityMap } = useTokenListContext();
  return principalTokenMaturityMap;
}

export function useTokens() {
  const { swappableTokens } = useTokenListContext();
  return { swappableTokens };
}

export function usePrincipalTokens() {
  const { principalTokens } = useTokenListContext();
  return { principalTokens };
}
