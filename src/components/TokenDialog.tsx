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
import { useSwappableTokens } from "../context/TokenList";

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
  const {swappableTokens} = useSwappableTokens()
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
  open,
  onClose,
  setMint,
}: {
  open: boolean;
  onClose: () => void;
  setMint: (mint: PublicKey) => void;
}) {
  const {swappableTokens} = useSwappableTokens()
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
