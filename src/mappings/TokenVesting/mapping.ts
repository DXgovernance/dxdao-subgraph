import { TokenVesting } from '../../types/schema';
import {
  TokensReleased,
  TokenVestingRevoked,
} from '../../types/templates/TokenVesting/TokenVesting';

export function handleTokensReleased(event: TokensReleased): void {
  let tokenVesting = TokenVesting.load(event.address.toHexString());

  if (!tokenVesting) return;

  tokenVesting.released = event.params.amount;

  tokenVesting.save();
}

export function handleTokenVestingRevoked(event: TokenVestingRevoked): void {
  let tokenVesting = TokenVesting.load(event.address.toHexString());

  if (!tokenVesting) return;

  // why does the contract have this line? there can be more than one token inside the same vesting contract?
  // _revoked[address(token)] = true;

  tokenVesting.revoked = true;

  tokenVesting.save();
}

