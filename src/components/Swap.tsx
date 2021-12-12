import { useState } from "react";
import { PublicKey, Keypair } from "@solana/web3.js";
import { BN } from "@project-serum/anchor";
import {
  makeStyles,
  Card,
  Button,
  Typography,
  TextField,
  useTheme,
} from "@material-ui/core";
import { ExpandMore } from "@material-ui/icons";
import { useSwapContext, useSwapFair } from "../context/Swap";
import {
  useDexContext,
  useOpenOrders,
  useRouteVerbose,
  useMarket,
  FEE_MULTIPLIER,
} from "../context/Dex";
import {
  usePrincipalTokenMaturityMap,
  useTokenMap,
} from "../context/TokenList";
import { useMint, useOwnedTokenAccount } from "../context/Token";
import { useCanSwap, useReferral } from "../context/Swap";
import { SettingsButton } from "./Settings";
import { InfoLabel, InterestLabel } from "./Info";
import { SOL_MINT } from "../utils/pubkeys";
import { MaturityDialog, TokenDialog } from "./TokenDialog";

const useStyles = makeStyles((theme) => ({
  card: {
    width: theme.spacing(50),
    borderRadius: theme.spacing(2),
    boxShadow: "0px 0px 30px 5px rgba(0,0,0,0.075)",
    padding: theme.spacing(2),
  },
  tab: {
    width: "50%",
  },
  settingsButton: {
    padding: 0,
  },
  swapButton: {
    width: "100%",
    borderRadius: theme.spacing(2),
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    fontSize: 16,
    fontWeight: 700,
    padding: theme.spacing(1.5),
  },
  swapToFromButton: {
    display: "block",
    margin: "10px auto 10px auto",
    cursor: "pointer",
  },
  amountInput: {
    fontSize: 22,
    fontWeight: 600,
  },
  input: {
    textAlign: "right",
  },
  swapTokenFormContainer: {
    borderRadius: theme.spacing(2),
    boxShadow: "0px 0px 15px 2px rgba(33,150,243,0.1)",
    display: "flex",
    justifyContent: "space-between",
    padding: theme.spacing(1),
  },
  swapTokenSelectorContainer: {
    marginLeft: theme.spacing(1),
    display: "flex",
    flexDirection: "column",
    width: "50%",
  },
  maturitySelectorContainer: {
    marginLeft: theme.spacing(1),
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },
  balanceContainer: {
    display: "flex",
    alignItems: "center",
    fontSize: "14px",
  },
  maxButton: {
    marginLeft: theme.spacing(1),
    color: theme.palette.primary.main,
    fontWeight: 700,
    fontSize: "12px",
    cursor: "pointer",
  },
  tokenButton: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    marginBottom: theme.spacing(1),
  },
}));

export default function SwapCard({
  containerStyle,
  contentStyle,
  swapTokenContainerStyle,
}: {
  containerStyle?: any;
  contentStyle?: any;
  swapTokenContainerStyle?: any;
}) {
  const styles = useStyles();
  return (
    <Card className={styles.card} style={containerStyle}>
      <SwapHeader />
      <div style={contentStyle}>
        <LendTokenForm style={swapTokenContainerStyle} />
        <ChooseMaturityForm style={swapTokenContainerStyle} />
        <InfoLabel />
        <InterestLabel />
        <SwapButton />
      </div>
    </Card>
  );
}

export function SwapHeader() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "16px",
      }}
    >
      <Typography
        style={{
          fontSize: 18,
          fontWeight: 700,
        }}
      >
        LEND
      </Typography>
      <SettingsButton />
    </div>
  );
}

function LendTokenForm({ style }: { style?: any }) {
  const { fromMint, setFromMint, fromAmount, setFromAmount } = useSwapContext();
  const styles = useStyles();

  const [showTokenDialog, setShowTokenDialog] = useState(false);
  const tokenAccount = useOwnedTokenAccount(fromMint);
  const mintAccount = useMint(fromMint);

  const balance =
    tokenAccount &&
    mintAccount &&
    tokenAccount.account.amount.toNumber() / 10 ** mintAccount.decimals;

  const formattedAmount =
    mintAccount && fromAmount
      ? fromAmount.toLocaleString("fullwide", {
          maximumFractionDigits: mintAccount.decimals,
          useGrouping: false,
        })
      : fromAmount;

  return (
    <div className={styles.swapTokenFormContainer} style={style}>
      <div className={styles.swapTokenSelectorContainer}>
        <TokenButton mint={fromMint} onClick={() => setShowTokenDialog(true)} />
        <Typography color="textSecondary" className={styles.balanceContainer}>
          {tokenAccount && mintAccount
            ? `Balance: ${balance?.toFixed(mintAccount.decimals)}`
            : `-`}
          {!!balance ? (
            <span
              className={styles.maxButton}
              onClick={() => setFromAmount(balance)}
            >
              MAX
            </span>
          ) : null}
        </Typography>
      </div>
      <TextField
        type="number"
        value={formattedAmount}
        onChange={(e) => setFromAmount(parseFloat(e.target.value))}
        InputProps={{
          disableUnderline: true,
          classes: {
            root: styles.amountInput,
            input: styles.input,
          },
        }}
      />
      <TokenDialog
        setMint={setFromMint}
        open={showTokenDialog}
        onClose={() => setShowTokenDialog(false)}
      />
    </div>
  );
}

function ChooseMaturityForm({ style }: { style?: any }) {
  const { fromMint, toMint, setToMint } = useSwapContext();
  const styles = useStyles();

  const [showMaturityDialog, setShowMaturityDialog] = useState(false);

  return (
    <div className={styles.swapTokenFormContainer} style={style}>
      <div className={styles.maturitySelectorContainer}>
        <Typography>Maturity</Typography>
        <MaturityButton
          mint={toMint}
          onClick={() => setShowMaturityDialog(true)}
        />
      </div>
      <MaturityDialog
        currentTokenMint={fromMint}
        setMint={setToMint}
        open={showMaturityDialog}
        onClose={() => setShowMaturityDialog(false)}
      />
    </div>
  );
}

function TokenButton({
  mint,
  onClick,
}: {
  mint: PublicKey;
  onClick: () => void;
}) {
  const styles = useStyles();
  const theme = useTheme();

  return (
    <div onClick={onClick} className={styles.tokenButton}>
      <TokenIcon mint={mint} style={{ width: theme.spacing(4) }} />
      <TokenName mint={mint} style={{ fontSize: 14, fontWeight: 700 }} />
      <ExpandMore />
    </div>
  );
}

function MaturityButton({
  mint,
  onClick,
}: {
  mint: PublicKey;
  onClick: () => void;
}) {
  const styles = useStyles();

  return (
    <div onClick={onClick} className={styles.tokenButton}>
      <TokenMaturity mint={mint} style={{ fontSize: 14, fontWeight: 700 }} />
      <ExpandMore />
    </div>
  );
}

export function TokenIcon({ mint, style }: { mint: PublicKey; style: any }) {
  const tokenMap = useTokenMap();
  let tokenInfo = tokenMap.get(mint.toString());
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      {tokenInfo?.logoURI ? (
        <img alt="Logo" style={style} src={tokenInfo?.logoURI} />
      ) : (
        <div style={style}></div>
      )}
    </div>
  );
}

function TokenName({ mint, style }: { mint: PublicKey; style: any }) {
  const tokenMap = useTokenMap();
  const theme = useTheme();
  let tokenInfo = tokenMap.get(mint.toString());

  return (
    <Typography
      style={{
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(1),
        ...style,
      }}
    >
      {tokenInfo?.symbol}
    </Typography>
  );
}

function TokenMaturity({ mint, style }: { mint: PublicKey; style: any }) {
  const principalTokenMaturity = usePrincipalTokenMaturityMap();
  const theme = useTheme();
  const maturity = principalTokenMaturity.get(mint.toString());

  return (
    <Typography
      style={{
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(1),
        ...style,
      }}
    >
      {maturity ? new Date(maturity * 1000).toLocaleDateString() : "n/a"}
    </Typography>
  );
}

export function SwapButton() {
  const styles = useStyles();
  const {
    fromMint,
    toMint,
    fromAmount,
    slippage,
    isClosingNewAccounts,
    isStrict,
  } = useSwapContext();
  const { swapClient } = useDexContext();
  const fromMintInfo = useMint(fromMint);
  const toMintInfo = useMint(toMint);
  const openOrders = useOpenOrders();
  const route = useRouteVerbose(fromMint, toMint);
  const fromMarket = useMarket(
    route && route.markets ? route.markets[0] : undefined
  );
  const canSwap = useCanSwap();
  const referral = useReferral(fromMarket);
  const fair = useSwapFair();
  let fromWallet = useOwnedTokenAccount(fromMint);
  let toWallet = useOwnedTokenAccount(toMint);
  const quoteMint = fromMarket && fromMarket.quoteMintAddress;
  const quoteMintInfo = useMint(quoteMint);
  const quoteWallet = useOwnedTokenAccount(quoteMint);

  // Click handler.
  const sendSwapTransaction = async () => {
    if (!fromMintInfo || !toMintInfo) {
      throw new Error("Unable to calculate mint decimals");
    }
    if (!fair) {
      throw new Error("Invalid fair");
    }
    if (!quoteMint || !quoteMintInfo) {
      throw new Error("Quote mint not found");
    }

    const amount = new BN(fromAmount * 10 ** fromMintInfo.decimals);
    const isSol = fromMint.equals(SOL_MINT) || toMint.equals(SOL_MINT);
    const wrappedSolAccount = isSol ? Keypair.generate() : undefined;

    // Build the swap.
    let txs = await (async () => {
      if (!fromMarket) {
        throw new Error("Market undefined");
      }

      const minExchangeRate = {
        rate: new BN((10 ** toMintInfo.decimals * FEE_MULTIPLIER) / fair)
          .muln(100 - slippage)
          .divn(100),
        fromDecimals: fromMintInfo.decimals,
        quoteDecimals: quoteMintInfo.decimals,
        strict: isStrict,
      };
      const fromOpenOrders = fromMarket
        ? openOrders.get(fromMarket?.address.toString())
        : undefined;
      const fromWalletAddr = fromMint.equals(SOL_MINT)
        ? wrappedSolAccount!.publicKey
        : fromWallet
        ? fromWallet.publicKey
        : undefined;
      const toWalletAddr = toMint.equals(SOL_MINT)
        ? wrappedSolAccount!.publicKey
        : toWallet
        ? toWallet.publicKey
        : undefined;

      return await swapClient.swapTxs({
        fromMint,
        toMint,
        quoteMint,
        amount,
        minExchangeRate,
        referral,
        fromMarket,
        toMarket: undefined,
        // Automatically created if undefined.
        fromOpenOrders: fromOpenOrders ? fromOpenOrders[0].address : undefined,
        toOpenOrders: undefined,
        fromWallet: fromWalletAddr,
        toWallet: toWalletAddr,
        quoteWallet: quoteWallet ? quoteWallet.publicKey : undefined,
        // Auto close newly created open orders accounts.
        close: isClosingNewAccounts,
      });
    })();

    await swapClient.program.provider.sendAll(txs);
  };
  return (
    <Button
      variant="contained"
      className={styles.swapButton}
      onClick={sendSwapTransaction}
      disabled={!canSwap}
    >
      Lend
    </Button>
  );
}
