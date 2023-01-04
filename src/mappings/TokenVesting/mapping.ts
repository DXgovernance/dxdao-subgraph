import { TokenVesting } from '../../../../../../dxdao-subgraph/src/types/schema';
import {
  TokensReleased,
  TokenVesting as TokenVestingContract,
  TokenVestingRevoked,
} from '../../../../../../dxdao-subgraph/src/types/templates/TokenVesting/TokenVesting';

export function handleTokensReleased(event: TokensReleased): void {
  let tokenVesting = TokenVesting.load(event.address.toHexString());

  // TODO: it's impossible it doesnt exist right?
  // if (!tokenVesting) {
  // }

  tokenVesting!.released = event.params.amount;

  tokenVesting!.save();
}

export function handleTokenVestingRevoked(event: TokenVestingRevoked): void {
  // get contract
  // get value

  let tokenVesting = TokenVesting.load(event.address.toHexString());

  // can't be null right?

  // why does the contract have this line? there can be more than one token inside the same vesting contract?
  // _revoked[address(token)] = true;

  tokenVesting!.revoked = true;

  tokenVesting!.save();
}

