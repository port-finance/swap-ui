import { PublicKey } from "@solana/web3.js";
import { TokenInfo } from "@solana/spl-token-registry";
import {
  makeStyles,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  Typography,
} from "@material-ui/core";
import { TokenIcon } from "./Swap";
import {
  usePrincipalTokenMaturityMap,
  usePrincipalTokens,
  useTokens,
} from "../context/TokenList";

const useStyles = makeStyles((theme) => ({
  dialogContent: {
    padding: 0,
  },
  textField: {
    marginBottom: "8px",
  },
  tab: {
    minWidth: "134px",
  },
  tabSelected: {
    color: theme.palette.primary.contrastText,
    fontWeight: 700,
    backgroundColor: theme.palette.primary.main,
    borderRadius: "10px",
  },
  tabIndicator: {
    opacity: 0,
  },
}));

export function TokenDialog({
  open,
  onClose,
  setMint,
}: {
  open: boolean;
  onClose: () => void;
  setMint: (mint: PublicKey) => void;
}) {
  const { swappableTokens } = useTokens();
  const styles = useStyles();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      scroll={"paper"}
      PaperProps={{
        style: {
          borderRadius: "10px",
          width: "420px",
        },
      }}
    >
      <DialogTitle style={{ fontWeight: "bold" }}>
        <Typography variant="h6" style={{ paddingBottom: "16px" }}>
          Select a token
        </Typography>
      </DialogTitle>
      <DialogContent className={styles.dialogContent} dividers={true}>
        <List disablePadding>
          {swappableTokens.map((tokenInfo: TokenInfo) => (
            <TokenListItem
              key={tokenInfo.address}
              tokenInfo={tokenInfo}
              onClick={(mint) => {
                setMint(mint);
                onClose();
              }}
            />
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
}

export function MaturityDialog({
  currentTokenMint,
  open,
  onClose,
  setMint,
}: {
  currentTokenMint: PublicKey;
  open: boolean;
  onClose: () => void;
  setMint: (mint: PublicKey) => void;
}) {
  const { principalTokens } = usePrincipalTokens();
  const principalTokenMaturityMap = usePrincipalTokenMaturityMap();
  const styles = useStyles();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      scroll={"paper"}
      PaperProps={{
        style: {
          borderRadius: "10px",
          width: "420px",
        },
      }}
    >
      <DialogTitle style={{ fontWeight: "bold" }}>
        <Typography variant="h6" style={{ paddingBottom: "16px" }}>
          Choose the Maturity
        </Typography>
      </DialogTitle>
      <DialogContent className={styles.dialogContent} dividers={true}>
        <List disablePadding>
          {principalTokens.map((tokenInfo: TokenInfo) => (
            <MaturityListItem
              key={tokenInfo.address}
              matruityTs={principalTokenMaturityMap.get(tokenInfo.address)}
              tokenInfo={tokenInfo}
              onClick={(mint) => {
                setMint(mint);
                onClose();
              }}
            />
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
}

function TokenListItem({
  tokenInfo,
  onClick,
}: {
  tokenInfo: TokenInfo;
  onClick: (mint: PublicKey) => void;
}) {
  const mint = new PublicKey(tokenInfo.address);
  return (
    <ListItem
      button
      onClick={() => onClick(mint)}
      style={{ padding: "10px 20px" }}
    >
      <TokenIcon mint={mint} style={{ width: "30px", borderRadius: "15px" }} />
      <TokenName tokenInfo={tokenInfo} />
    </ListItem>
  );
}

function MaturityListItem({
  tokenInfo,
  matruityTs,
  onClick,
}: {
  tokenInfo: TokenInfo;
  matruityTs: number | undefined;
  onClick: (mint: PublicKey) => void;
}) {
  const mint = new PublicKey(tokenInfo.address);
  return (
    <ListItem
      button
      onClick={() => onClick(mint)}
      style={{ padding: "10px 20px" }}
    >
      <Typography style={{ fontWeight: "bold" }}>
        {matruityTs ? new Date(matruityTs * 1000).toLocaleDateString() : "--"}
      </Typography>
    </ListItem>
  );
}

function TokenName({ tokenInfo }: { tokenInfo: TokenInfo }) {
  return (
    <div style={{ marginLeft: "16px" }}>
      <Typography style={{ fontWeight: "bold" }}>
        {tokenInfo?.symbol}
      </Typography>
      <Typography color="textSecondary" style={{ fontSize: "14px" }}>
        {tokenInfo?.name}
      </Typography>
    </div>
  );
}
